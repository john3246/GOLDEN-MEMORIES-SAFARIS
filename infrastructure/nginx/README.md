# Nginx

Reverse proxy configuration for:

- `gmsafaris.com` → website-com static / SSR surface
- API host → Node.js API
- CMS host → CMS static assets (with API on separate origin or path)

TLS and security headers are applied here in later phases. Do not expose PostgreSQL or Redis through nginx.
