# External API contract (gmsafaris.co.tz)

This document is the integration contract for the sister site on another domain. You do **not** need PostgreSQL, Redis, CMS, SSH, or internal admin credentials.

Only **published** content is returned. Drafts never appear.

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

Create a key in the CMS: **API & integrations**. Copy it immediately; it is shown once.

For a quick local test you can also set `EXTERNAL_API_KEYS=dev_test_key` in `.env` and use that value.

## 3. How to test locally

1. Start the API: `npm run dev:api` (port 3000).
2. Create a key in the CMS at `http://localhost:5173/#/api-clients`, **or** add `EXTERNAL_API_KEYS=dev_test_key` to `.env` and restart the API.
3. Call `/catalog` first. It lists every collection and how many published records each has.
4. Then fetch each collection. Use `?limit=100` on tours/safaris if you want the full list (default page size is 20).

```bash
set KEY=dev_test_key
set BASE=http://localhost:3000/api/v1/external

curl -s -H "X-Api-Key: %KEY%" %BASE%/status
curl -s -H "X-Api-Key: %KEY%" %BASE%/catalog

curl -s -H "X-Api-Key: %KEY%" "%BASE%/tours?limit=100"
curl -s -H "X-Api-Key: %KEY%" %BASE%/tours/classic-tanzania-lodge-safari

curl -s -H "X-Api-Key: %KEY%" %BASE%/destinations
curl -s -H "X-Api-Key: %KEY%" %BASE%/blogs
curl -s -H "X-Api-Key: %KEY%" %BASE%/join-safaris
curl -s -H "X-Api-Key: %KEY%" %BASE%/pages
curl -s -H "X-Api-Key: %KEY%" %BASE%/menus
curl -s -H "X-Api-Key: %KEY%" %BASE%/faqs
curl -s -H "X-Api-Key: %KEY%" %BASE%/lodges
curl -s -H "X-Api-Key: %KEY%" %BASE%/testimonials
curl -s -H "X-Api-Key: %KEY%" %BASE%/settings
```

PowerShell:

```powershell
$headers = @{ "X-Api-Key" = "dev_test_key" }
$base = "http://localhost:3000/api/v1/external"
Invoke-RestMethod "$base/catalog" -Headers $headers
Invoke-RestMethod "$base/tours?limit=100" -Headers $headers
Invoke-RestMethod "$base/destinations" -Headers $headers
Invoke-RestMethod "$base/blogs" -Headers $headers
Invoke-RestMethod "$base/join-safaris" -Headers $headers
```

Checks that must pass:

- No key → `401 UNAUTHORIZED`
- Draft safari slug → `404`
- Published tour in `/tours` has `price_from` > 0
- `/catalog` counts match the arrays you fetch
- Browser calls from another local origin work in development (localhost CORS is allowed)

OpenAPI: `http://localhost:3000/api/v1/docs`

## 4. Endpoints

| Method | Path | What it returns |
|--------|------|-----------------|
| `GET` | `/status` | Health plus collection counts |
| `GET` | `/catalog` | Paths and totals for every collection |
| `GET` | `/tours` | Published safari packages (priced) |
| `GET` | `/tours/:slug` | One published tour |
| `GET` | `/safaris` | Same as `/tours` |
| `GET` | `/safaris/slug/:slug` | One published safari |
| `GET` | `/destinations` | Published parks / destinations |
| `GET` | `/destinations/slug/:slug` | One destination |
| `GET` | `/blogs` | Published journal articles |
| `GET` | `/blogs/slug/:slug` | One article |
| `GET` | `/join-safaris` | Published joining-safari departures |
| `GET` | `/join-safaris/slug/:slug` | One departure |
| `GET` | `/pages` | Published website pages |
| `GET` | `/menus` | Navigation |
| `GET` | `/faqs` | FAQs |
| `GET` | `/lodges` | Accommodations |
| `GET` | `/testimonials` | Reviews |
| `GET` | `/settings` | Public site name, contact, SEO (no SMTP secrets) |

Aliases: `/posts` → blogs, `/departures` → join-safaris, `/reviews` → testimonials.

**Write methods are not available.** `POST`/`PUT`/`PATCH`/`DELETE` are not part of this contract.

## 5. Pagination

Query: `?page=1&limit=20` (max limit 100 on most list endpoints; tours cap at 250).

Returned in `meta`: `page`, `limit`, `total`. Content collections currently return `{ total }` and the full published array.

## 6. Response format

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

## 7. Error format

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

Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`.

## 8. Rate limits

Default: 120 requests per 60 seconds per client. Exceeding returns `429` with `RATE_LIMITED`.

## 9. Publishing behavior

Only `PUBLISHED` content is exposed. A tour without a price cannot stay published.

## 10. API key rotation

1. Create a new key in the CMS  
2. Deploy the sister site with the new key  
3. Revoke the old key  

## 11. Permissions granted

Read-only website content. No create/update/delete/publish/user/settings admin rights.
