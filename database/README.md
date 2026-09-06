# Database

PostgreSQL is the **single source of truth** for GM Safaris.

## Layout

| Path | Responsibility |
|------|----------------|
| `migrations/` | Versioned schema migrations (Phase 2) |
| `seed/` | Deterministic seed data for development |
| `documentation/` | Schema notes, ERD references, indexing rationale |

## Rules

- Do not reproduce the WordPress schema blindly.
- Design around business entities (tours, destinations, media, etc.).
- Application DB users get least privilege.
- External `.co.tz` consumers never connect here — only via `/api/v1/external`.

## Next phase

**Phase 2 — Database architecture:** domain model, migrations, relationships, publishing status enums.
