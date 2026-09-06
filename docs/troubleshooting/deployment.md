# Troubleshooting — Deployment

1. Process manager / container healthy?
2. `/health` and `/health/ready`
3. Reverse proxy routes to the API (not static site for API host)
4. Env secrets injected (not missing in production)
5. TLS certificates valid
6. Migrations run before new code that requires schema

Full runbooks land in `infrastructure/deployment/` (Phase 20).
