#!/usr/bin/env bash
# One-time preparation of a fresh Ubuntu VPS (20.04 / 22.04 / 24.04) for GM Safaris.
# Run as root:  bash server-setup.sh
# Safe to re-run: every step checks what is already there.
set -euo pipefail

APP_USER=gmsafaris
APP_DIR=/opt/gmsafaris
DB_NAME=gm_safaris
DB_USER=gm_safaris
PG_VERSION=16
NODE_MAJOR=22

export DEBIAN_FRONTEND=noninteractive
CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")

echo "==> Swap (2 GB) — the VPS has 1 GB RAM"
if ! swapon --show | grep -q '/swapfile'; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10 >/dev/null
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
fi

echo "==> Base packages"
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw nginx rsync tar

echo "==> Firewall (SSH, HTTP, HTTPS only)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Node.js ${NODE_MAJOR}"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v

echo "==> PostgreSQL ${PG_VERSION}"
if ! command -v "/usr/lib/postgresql/${PG_VERSION}/bin/postgres" >/dev/null; then
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
  # Ubuntu 20.04 (focal) packages moved to the PostgreSQL archive after its end of life.
  if [ "$CODENAME" = "focal" ]; then PG_REPO=https://apt-archive.postgresql.org/pub/repos/apt; else PG_REPO=https://apt.postgresql.org/pub/repos/apt; fi
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] ${PG_REPO} ${CODENAME}-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -y
  apt-get install -y "postgresql-${PG_VERSION}" "postgresql-client-${PG_VERSION}"
fi
systemctl enable --now postgresql

# Small-server tuning (1 GB RAM)
PG_CONF_DIR=/etc/postgresql/${PG_VERSION}/main/conf.d
mkdir -p "$PG_CONF_DIR"
cat > "$PG_CONF_DIR/gmsafaris.conf" <<'CONF'
listen_addresses = 'localhost'
max_connections = 40
shared_buffers = 128MB
effective_cache_size = 384MB
work_mem = 4MB
maintenance_work_mem = 64MB
CONF
systemctl restart postgresql

echo "==> App user and folders"
id "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --home-dir "/home/$APP_USER" --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_DIR" /var/backups/gmsafaris
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "==> Database role (password is read from $APP_DIR/.env if present)"
if [ -f "$APP_DIR/.env" ]; then
  DB_PASS=$(grep -E '^DATABASE_PASSWORD=' "$APP_DIR/.env" | cut -d= -f2-)
  sudo -u postgres psql -v ON_ERROR_STOP=1 -v pw="$DB_PASS" <<SQL
SELECT 'CREATE ROLE ${DB_USER} LOGIN' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}')\gexec
ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD :'pw';
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}' WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL
  sudo -u postgres psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS citext;"
fi

echo "==> Certbot (HTTPS)"
if ! command -v certbot >/dev/null; then
  if command -v snap >/dev/null; then
    snap install core && snap refresh core && snap install --classic certbot
    ln -sf /snap/bin/certbot /usr/bin/certbot
  else
    apt-get install -y certbot python3-certbot-nginx
  fi
fi

echo "==> Nightly database backup (keeps 14 days)"
cat > /etc/cron.daily/gmsafaris-backup <<CRON
#!/bin/sh
sudo -u postgres pg_dump -Fc ${DB_NAME} > /var/backups/gmsafaris/db-\$(date +%F).dump
find /var/backups/gmsafaris -name 'db-*.dump' -mtime +14 -delete
CRON
chmod +x /etc/cron.daily/gmsafaris-backup

echo "Server ready."
