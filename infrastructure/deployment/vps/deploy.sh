#!/usr/bin/env bash
# Build locally and ship the app to the VPS. Run from the repo root (Git Bash):
#   bash infrastructure/deployment/vps/deploy.sh
# Needs SSH key access as root. The server keeps its own .env, uploads and database.
set -euo pipefail

HOST=${DEPLOY_HOST:-root@199.192.27.42}
APP_DIR=/opt/gmsafaris
ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
PKG=$(mktemp -d)/gmsafaris.tgz

cd "$ROOT"
echo "==> Building website + CMS"
npm run build:render

echo "==> Packing"
tar -czf "$PKG" \
  --exclude=./node_modules --exclude='./apps/*/node_modules' --exclude='./packages/*/node_modules' \
  --exclude=./.git --exclude=./.env --exclude=./.tools --exclude='./Assets 001' \
  --exclude=./coverage --exclude=./apps/api/uploads --exclude='./apps/api/data/cms/*.tmp' \
  .
ls -lh "$PKG"

echo "==> Uploading"
scp -q "$PKG" "$HOST:/tmp/gmsafaris.tgz"

echo "==> Installing on the server"
ssh "$HOST" bash -s <<REMOTE
set -euo pipefail
mkdir -p $APP_DIR
tar -xzf /tmp/gmsafaris.tgz -C $APP_DIR
rm /tmp/gmsafaris.tgz
mkdir -p $APP_DIR/apps/api/uploads $APP_DIR/uploads $APP_DIR/data/cms
chown -R gmsafaris:gmsafaris $APP_DIR
cd $APP_DIR
sudo -u gmsafaris -H npm ci --omit=dev --no-audit --no-fund
install -m 644 infrastructure/deployment/vps/gmsafaris.service /etc/systemd/system/gmsafaris.service
systemctl daemon-reload
systemctl enable gmsafaris >/dev/null
systemctl restart gmsafaris
sleep 8
systemctl --no-pager --lines=0 status gmsafaris | head -5
curl -fsS http://127.0.0.1:3000/health && echo
REMOTE
echo "Deployed."
