# Dependency rules

## Allowed direction (API)

```
Routes
  → Controllers
    → Services
      → Repositories
        → PostgreSQL

Services may also call:
  → Cache (Redis) for read-through / invalidation
  → other services (orchestration)
```

## Forbidden

| Violation | Why |
|-----------|-----|
| Controller runs SQL | Breaks SRP; untestable; leaks DB shape |
| Route contains business logic | Hard to reuse and authorize |
| Repository knows Express `req`/`res` | Couples persistence to HTTP |
| Service depends on Express objects | Blocks reuse from jobs/CLI |
| Frontend queries PostgreSQL | Bypasses auth, audit, cache |
| Frontend queries Redis | Cache is not a public contract |
| `.co.tz` depends on `.com` HTML | Fragile; wrong ownership |
| External API write methods | Consumers are read-only |

## Package dependency direction

```
apps/*  →  packages/*
packages/shared-validation  →  packages/shared-types
packages must not import apps
```

## Shared packages purpose

- **shared-types** — publish status, roles, external permission strings
- **shared-validation** — slug, pagination, status checks
- **shared-utils** — request IDs, pick/omit
- **shared-config** — typed env loading

Do not add a new npm dependency without documenting why it exists (see `apps/api/src/config/dependencies.rationale.js`).
