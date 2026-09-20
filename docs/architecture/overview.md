# Architecture overview

## Objective

Replace the WordPress primary site at gmsafaris.com with a custom, maintainable platform that also serves as the **content authority** for gmsafaris.co.tz via a secure external API.

## Core principle

```
Internet
   ↓
HTTPS / Reverse Proxy
   ↓
Node.js API
   ↓
Application Services
   ↓
Repositories
   ↓
PostgreSQL   ← single source of truth

Redis sits beside services as a cache only.
```

- CMS is the authorized write interface.
- Public websites consume APIs.
- `.co.tz` never connects to PostgreSQL, Redis, or scrapes `.com` HTML.

## Consumers

```
                    ┌─────────────┐
                    │  PostgreSQL │
                    └──────▲──────┘
                           │
                    ┌──────┴──────┐
                    │  Node API   │◄── Redis (cache)
                    └──────▲──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    website-com          CMS         .co.tz (external)
    (gmsafaris.com)   (editors)    via /api/v1/external
```

If `.com` is down, `.co.tz` can still operate as long as the **API** is up.

## Monorepo responsibilities

| Path | Why it exists |
|------|----------------|
| `apps/api` | All HTTP APIs, auth, business modules, cache orchestration |
| `apps/cms` | Editor/admin UI only |
| `apps/website-com` | Public marketing/booking UI for `.com` |
| `packages/shared-types` | Enums/constants shared across apps |
| `packages/shared-validation` | Framework-agnostic input helpers |
| `packages/shared-utils` | Pure utilities (IDs, pick/omit) |
| `packages/shared-config` | Env loading/validation |
| `database` | Schema truth (migrations/seeds) |
| `infrastructure` | Deploy & proxy configuration |
| `docs` | Architecture, contracts, runbooks |
| `tests` | Cross-app automated tests |

## External API naming

**Chosen convention:** `/api/v1/external/...`

- Versioned (`v1`) for backward compatibility
- Distinct from future `/api/v1/admin/...` CMS routes
- Documented for the second developer in `docs/api/external-api.md`

## Publishing

Content statuses: `DRAFT` → `REVIEW` → `PUBLISHED` → `ARCHIVED`.

External API normally returns **PUBLISHED** only.

## Implementation phases

1. Project foundation
2. Database architecture ← **current (schema landed; API pool is Phase 3)**
3. API foundation (pool, cache client)
4. Security foundation
5. Authentication + RBAC
6. Tours
7. Destinations
8. Media
9. Pages/content
10. External API content endpoints
11. CMS foundation
12. CMS content management
13. UI design system
14. gmsafaris.com frontend
15. WordPress migration
16. SEO migration
17. Testing expansion
18. Performance
19. Security review
20. Production deployment

## 500-line rule

No production source file should exceed 500 lines without a documented reason. Prefer extracting by responsibility, not artificial splits.
