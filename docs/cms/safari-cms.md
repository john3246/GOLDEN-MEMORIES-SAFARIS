# Safari CMS

The Safari module is the first CMS surface. It owns **Safari package content** only (not bookings, blog, hotels, or general pages).

## Architecture

```
Safari CMS (apps/cms)
        │  /api/v1/admin
        ▼
Node API (apps/api)
        │
   cms file store (data/cms)  ← independent of transactional PostgreSQL
        │
   /api/v1/safaris  (published)
   /api/v1/external/safaris  (API key, safaris:read)
        │
Shared @gm-safaris/safari-ui
        │
   Public website preview / CMS visual editor
```

Draft edits never change the public snapshot until **Publish**. Public and external APIs return `PUBLISHED` only.

## Setup

```bash
cp .env.example .env
npm install
npm run dev:api
npm run dev:cms
```

CMS UI: [http://localhost:5173](http://localhost:5173) (proxies `/api` to the API on port 3000).

Default local users (change immediately):

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@gmsafaris.com` | `ChangeMeAdmin!23` |
| Editor | `editor@gmsafaris.com` | `ChangeMeEditor!23` |
| Viewer | `viewer@gmsafaris.com` | `ChangeMeViewer!23` |

With `CMS_SEED_SAFARIS=true` (default in `.env.example`), existing northern-circuit packages are seeded as published so `/tours/` can read them from the API.

## Permissions

- **Admin** — create, edit, publish, unpublish, archive, delete, media, API clients
- **Editor** — create, edit, preview, publish, unpublish, media (no delete, no API clients)
- **Viewer** — read only

## Public vs admin

| Surface | Auth | Content |
|---------|------|---------|
| `GET /api/v1/safaris` | none (website CORS) | published only |
| `GET /api/v1/admin/safaris/:id/preview` | CMS JWT | draft |
| `GET /api/v1/external/safaris` | API key + `safaris:read` | published only |

API keys are hashed at rest. The raw key is shown once at creation. Docs: `/api/v1/docs`.
