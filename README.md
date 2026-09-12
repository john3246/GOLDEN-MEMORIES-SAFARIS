# GM Safaris — Central Tour Platform

Production-oriented tourism platform for **GM Safaris**.

| Surface | Role |
|---------|------|
| `apps/website-com` | Customer site for [gmsafaris.com](https://www.gmsafaris.com/) |
| `apps/cms` | Secure CMS for central content |
| `apps/api` | Node.js API (internal + external) |
| PostgreSQL | Authoritative data store |
| Redis | Cache only |

The sister site [gmsafaris.co.tz](https://www.gmsafaris.co.tz/) is maintained separately. It consumes **published** content only through the versioned external API (`/api/v1/external`). It must never access PostgreSQL, Redis, the CMS, or internal credentials.

## Safari CMS (first content module)

```bash
cp .env.example .env
npm install
npm run dev:api
npm run dev:cms
```

- API: http://localhost:3000 (`GET /health`, docs at `/api/v1/docs`)
- CMS: http://localhost:5173 (default admin `admin@gmsafaris.com` / `ChangeMeAdmin!23`)
- Public Safari API: `GET /api/v1/safaris`
- Setup notes: [docs/cms/safari-cms.md](docs/cms/safari-cms.md)

## Current phase

**Phase 1 — Project foundation** (this deliverable).

Next: **Phase 2 — Database architecture**.

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL 16+ (Phase 2+)
- Redis 7+ (Phase 3+)

## Quick start (foundation)

```bash
cp .env.example .env
npm install
npm run dev:api
```

Health check: `GET http://localhost:3000/health`

External API status (requires `EXTERNAL_API_KEYS` in `.env`):

```bash
curl -H "X-Api-Key: your_key" http://localhost:3000/api/v1/external/status
```

## Workspace layout

```
apps/           Runnable applications (api, cms, website-com)
packages/       Shared libraries (types, validation, utils, config)
database/       Migrations, seeds, DB documentation
infrastructure/ Nginx, Docker, deployment
docs/           Architecture, API, security, migration, troubleshooting
scripts/        Operational helpers
tests/          Cross-cutting test suites
```

## Documentation

Start at [docs/architecture/overview.md](docs/architecture/overview.md).

External consumer contract (for the `.co.tz` developer): [docs/api/external-api.md](docs/api/external-api.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:api` | Run API with `--watch` |
| `npm run dev:cms` | Safari CMS UI (Vite, port 5173) |
| `npm run dev:website` | Public website |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Vitest |

## Security baseline (Phase 1)

- No secrets in Git (`.env` gitignored; `.env.example` committed)
- Helmet security headers
- Explicit CORS allowlists
- Rate limiting per surface
- External API key gate (read-only routes only)
- Centralized error handler (no stack traces in production)
- Request correlation IDs

## Implementation order

See the phased plan in `docs/architecture/overview.md`. Do not skip ahead to full UI or WordPress migration until foundations and domain modules are in place.
