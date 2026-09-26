# VPS deployment (199.192.27.42)

One Node process serves the website, the CMS (`/cms/`) and the API on
`127.0.0.1:3000`; nginx proxies ports 80/443 to it; PostgreSQL 16 runs locally.

| File | Goes to |
|------|---------|
| `server-setup.sh` | run once as root: swap, firewall, Node 22, PostgreSQL 16, nginx, certbot, nightly DB backup |
| `gmsafaris.service` | `/etc/systemd/system/` (installed by `deploy.sh`) |
| `nginx-gmsafaris.conf` | `/etc/nginx/sites-available/gmsafaris` |
| `deploy.sh` | run from this PC to build and ship a new version |

## Redeploy after code changes

```bash
bash infrastructure/deployment/vps/deploy.sh
```

The server keeps its own `/opt/gmsafaris/.env`, uploads and database; CMS
content is never overwritten by a deploy.

## Useful commands on the server

```bash
systemctl status gmsafaris          # is it running?
journalctl -u gmsafaris -n 100      # app logs
systemctl restart gmsafaris
ls /var/backups/gmsafaris           # nightly database backups (14 days)
certbot renew --dry-run             # HTTPS certificates renew automatically
```

## Blog visibility

The website shows only blog posts that are **published in the CMS**. To hide
every post at once: `npm run cms:unpublish-posts` (on the server:
`cd /opt/gmsafaris && sudo -u gmsafaris node scripts/unpublish-posts.mjs`).
