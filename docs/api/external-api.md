# External API contract (gmsafaris.co.tz)

This document is the integration contract for the second developer. You do **not** need PostgreSQL, Redis, CMS, SSH, or internal admin credentials.

## 1. Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3000/api/v1/external` |
| Production | *(provided at go-live — API host, not gmsafaris.com HTML)* |

`.co.tz` must call this API directly — **not** scrape `gmsafaris.com`.

## 2. Authentication

Send one of:

```http
X-Api-Key: <your_api_key>
```

```http
Authorization: Bearer <your_api_key>
```

Keys are revocable and rotatable. Contact the platform owner for rotation.

## 3. API version

Current: **v1** (`/api/v1/external`).

## 4. Required headers

| Header | Required | Notes |
|--------|----------|-------|
| `X-Api-Key` or `Authorization` | Yes | Machine credential |
| `Accept: application/json` | Recommended | |
| `X-Request-Id` | Optional | Echoed for support |

## 5. Available endpoints (Phase 1)

| Method | Path | Status |
|--------|------|--------|
| `GET` | `/status` | Available |
| `GET` | `/safaris` | Available — published Safari packages |
| `GET` | `/safaris/:id` | Available |
| `GET` | `/safaris/slug/:slug` | Available |
| `GET` | `/tours` | Stub — `501` until Phase 6/10 |
| `GET` | `/tours/:slug` | Stub — `501` until Phase 6/10 |
| `GET` | `/destinations` | Stub — `501` until Phase 7/10 |

Planned (when domain modules ship): categories, pages, blog, testimonials, navigation, site-settings.

**Write methods are not available.** `POST`/`PUT`/`PATCH`/`DELETE` are not part of this contract.

## 6. Pagination

Query: `?page=1&limit=20` (max limit 100).

Returned in `meta`: `page`, `limit`, `total`.

## 7. Filtering / sorting

Documented per endpoint as content modules land. Only published content is returned.

## 8. Response format

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

Stable content DTOs — never WordPress/`wp_postmeta` shapes.

Example (future tour):

```json
{
  "success": true,
  "data": {
    "id": "tour_123",
    "slug": "serengeti-safari",
    "title": "Serengeti Safari",
    "description": "...",
    "destination": { "slug": "serengeti", "name": "Serengeti" },
    "price": { "amount": 1500, "currency": "USD" },
    "images": [],
    "itinerary": [],
    "seo": {}
  }
}
```

## 9. Error format

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key",
    "requestId": "req_..."
  }
}
```

Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `NOT_IMPLEMENTED`, `INTERNAL_ERROR`.

## 10. Rate limits

Configurable; default foundation values:

- Window: 60 seconds
- Max: 120 requests per window per client

Exceeding returns `429` with `RATE_LIMITED`.

## 11. Cache behavior

Responses may be served from Redis after PostgreSQL. Treat data as eventually consistent for a short TTL after CMS publishes. Do not build a second cache of secrets.

## 12. Publishing behavior

Only `PUBLISHED` content is exposed. Drafts/review/archived are invisible to this API.

## 13. Image URLs

Absolute HTTPS URLs to optimized media derivatives will be included on resources (Phase 8). Do not hotlink unpublished originals.

## 14. API key rotation

1. Request a new key from the platform owner  
2. Deploy `.co.tz` with the new key  
3. Old key is revoked  

## 15. Deprecation policy

- Non-breaking additive fields may appear in `v1`
- Breaking changes require `v2` and advance notice
- Deprecated fields will be documented before removal

## 16. Example — status

```bash
curl -s -H "X-Api-Key: $GM_EXTERNAL_API_KEY" \
  http://localhost:3000/api/v1/external/status
```

```json
{
  "success": true,
  "data": {
    "api": "external",
    "version": "v1",
    "mode": "read-only",
    "status": "foundation"
  }
}
```

## 17. Permissions granted

```
content:tours:read
content:destinations:read
content:pages:read
content:blog:read
content:testimonials:read
content:navigation:read
content:site-settings:read
```

No create/update/delete/publish/user/settings admin rights.
