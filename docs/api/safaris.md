# Safari API

Versioned Safari endpoints. Envelope matches the rest of the API (`success`, `data`, `meta`, `error`).

OpenAPI: `GET /api/v1/docs/openapi.json`

## Public (website)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/safaris` | none |
| GET | `/api/v1/safaris/{id}` | none |
| GET | `/api/v1/safaris/slug/{slug}` | none |

Query: `page`, `limit` (max 100), `q`, `destination`, `featured`, `sort=display_order|newest`.

Only `PUBLISHED` packages. No drafts, actors, or audit fields.

## Admin (CMS)

JWT `Authorization: Bearer <token>` from `POST /api/v1/admin/auth/login`.

| Method | Path | Scope |
|--------|------|--------|
| GET | `/api/v1/admin/safaris` | `safaris:read` |
| POST | `/api/v1/admin/safaris` | `safaris:write` |
| GET | `/api/v1/admin/safaris/{id}` | `safaris:read` |
| GET | `/api/v1/admin/safaris/{id}/preview` | `safaris:read` |
| PATCH/PUT | `/api/v1/admin/safaris/{id}` | `safaris:write` |
| DELETE | `/api/v1/admin/safaris/{id}` | `safaris:delete` (Admin) |
| POST | `/api/v1/admin/safaris/{id}/publish` | `safaris:publish` |
| POST | `/api/v1/admin/safaris/{id}/unpublish` | `safaris:publish` |
| POST | `/api/v1/admin/safaris/{id}/duplicate` | `safaris:write` |
| POST | `/api/v1/admin/safaris/{id}/archive` | `safaris:write` |
| POST | `/api/v1/admin/safaris/{id}/restore` | `safaris:write` |

Admin list filters: `q`, `status`, `destination`, `featured`, `duration`, `sort=newest|oldest|display_order|updated`.

## Third-party

`X-Api-Key` or `Authorization: Bearer` on `/api/v1/external/safaris`. Scope `safaris:read`. Keys are created in the CMS (Admin) and stored as SHA-256 hashes.

## Rate limits

Configurable via env. Defaults: public 100/min, admin 200/min, external 120/min, auth 20 / 15 min.
