# Docker

Local services:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

- `postgres` — `gm_safaris` / `gm_safaris_app` (see `.env.example`)
- `redis` — cache only, no persistence

Then apply schema:

```bash
node scripts/db-migrate.mjs
```

Volumes for DB data stay outside git. Redis is cache-only (`--save ""`).
