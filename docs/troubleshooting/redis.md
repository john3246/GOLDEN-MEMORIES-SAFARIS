# Troubleshooting — Redis

1. Redis is **cache only** — missing Redis should not invent data; fall back to PostgreSQL.
2. Connectivity: `REDIS_HOST` / `REDIS_PORT` / password.
3. Key prefix collisions (`REDIS_KEY_PREFIX`).
4. Stale content after CMS edit → verify invalidation hooks.
5. Do not grant Redis access to `.co.tz` developers.
