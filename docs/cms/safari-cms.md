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

Staff accounts live in PostgreSQL (`users` / `user_roles`). On a brand-new
database the first account is created from `CMS_ADMIN_EMAIL` /
`CMS_ADMIN_PASSWORD` as **Super Admin**; add everyone else in **CMS → Users &
roles**. Demo editor/viewer accounts that still use the old published default
passwords are disabled automatically.

With `CMS_SEED_SAFARIS=true` (default in `.env.example`), existing northern-circuit packages are seeded as published so `/tours/` can read them from the API.

## Permissions

- **Super Admin** — everything, including managing other Super Admins
- **Admin** — all content, bookings, users (except Super Admins), settings, API keys and integrations
- **Manager** — bookings, inquiries, customers and group departures; read-only content
- **Editor** — create, edit, preview, publish and unpublish content and media (no delete, no users, no API keys)
- **Viewer** — read only

Saving always stores a **draft**. For content that is already live, click
**Publish** to put the new version on the website.

## Public vs admin

| Surface | Auth | Content |
|---------|------|---------|
| `GET /api/v1/safaris` | none (website CORS) | published only |
| `GET /api/v1/admin/safaris/:id/preview` | CMS JWT | draft |
| `GET /api/v1/external/safaris` | API key + `safaris:read` | published only |

API keys are hashed at rest. The raw key is shown once at creation. Docs: `/api/v1/docs`.
