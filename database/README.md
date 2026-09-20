# Database

PostgreSQL is the **single source of truth** for GM Safaris.

## Layout

| Path | Responsibility |
|------|----------------|
| `migrations/` | Versioned schema (Safari CMS + Phase 2 domain) |
| `seed/` | Lookup data (regions, menus). Never seed production staff passwords here |
| `documentation/` | Indexing notes, migration rules |

## Apply

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres
node scripts/db-migrate.mjs
```

## Rules

- Do not reproduce the WordPress schema blindly.
- Design around business entities (tours, destinations, media, bookings).
- Application DB users get least privilege.
- External `.co.tz` consumers never connect here — only via `/api/v1/external`.
- Keep `@gm-safaris/shared-types` enums aligned with PostgreSQL.
