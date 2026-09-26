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

## Quick start (local)

Full Windows guide: [docs/LOCAL-SETUP.md](docs/LOCAL-SETUP.md)

```bash
cp .env.example .env        # then fill in DATABASE_*, JWT_SECRET, APP_ENCRYPTION_KEY, SMTP_*
npm install
npm run db:setup            # first time only (needs PGADMIN_PASSWORD)
npm run local               # website http://localhost:3000 · CMS http://localhost:3000/cms/
# or, with live reload:
npm run dev                 # API :3000 · website :4173 · CMS :5173
```

- All CMS content, staff users, bookings, inquiries, reviews and uploaded photos are stored in **PostgreSQL**.
  Existing `apps/api/data/cms/store.json` content is imported automatically on first start.
- Migrations in `database/migrations` are applied automatically at startup (or `npm run db:migrate`).
- Locked out of the CMS: `npm run cms:reset-admin`.

External API (read-only, for gmsafaris.co.tz): issue a key in **CMS → API keys**, then

```bash
curl -H "X-Api-Key: your_key" http://localhost:3000/api/v1/external/catalog
```

Sister-site contract: [docs/api/external-api.md](docs/api/external-api.md) ·
Outgoing webhooks: [docs/api/webhooks.md](docs/api/webhooks.md) ·
Reviews: [docs/cms/reviews.md](docs/cms/reviews.md) ·
Domains & email: [docs/deployment/domains-and-email.md](docs/deployment/domains-and-email.md)

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
| `npm run local` | Build, then serve website + CMS + API on http://localhost:3000 (like production) |
| `npm run dev` | API + website + CMS with live reload |
| `npm run db:setup` | Create the local database/user and apply migrations |
| `npm run db:migrate` | Apply new SQL migrations (no psql needed) |
| `npm run cms:reset-admin` | Reset the owner account from `.env` |
| `npm run build:render` / `npm start` | Production build / start |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Security

- No secrets in Git (`.env` gitignored; `.env.example` committed)
- Every admin request needs a valid session; disabled users / role changes / password changes take effect immediately
- Role-based access (Super Admin, Admin, Manager, Editor, Viewer), login lockout after 5 failed attempts, strong-password policy
- Content-Security-Policy, HSTS (production), frame and referrer protection
- Public forms: HTML stripped, honeypot + timing spam checks, per-visitor rate limits
- Uploaded files are verified as real images and re-encoded; SVG/HTML uploads are rejected
- Secrets saved from the CMS (SMTP, webhook, review API keys) are encrypted at rest
- Outgoing webhooks are HMAC-signed and cannot target private/internal addresses
- External API key gate (read-only routes only); centralized error handler (no stack traces in production)

## Implementation order

See the phased plan in `docs/architecture/overview.md`. Do not skip ahead to full UI or WordPress migration until foundations and domain modules are in place.
