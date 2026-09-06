# API overview

## Base URL (development)

```
http://localhost:3000
```

## Surfaces

| Prefix | Audience | Auth |
|--------|----------|------|
| `/health` | Ops / load balancers | None (rate limited) |
| `/api/v1` | Discovery | None |
| `/api/v1/external` | Trusted external sites (`.co.tz`) | API key |
| `/api/v1/admin` | CMS (Phase 5+) | JWT + RBAC |

## Response envelope

Success (resource):

```json
{
  "success": true,
  "data": {}
}
```

Success (collection):

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Tour not found",
    "requestId": "req_..."
  }
}
```

Never return raw database rows. Transform to stable DTOs.

## Versioning

Breaking changes require `/api/v2/...`. Document changes; keep `v1` stable.
