# Data flow

## Read path (cached public content)

```
Client (website or external API)
  → Route + auth middleware
  → Controller
  → Service
      → Cache lookup (Redis)
         HIT  → return DTO
         MISS → Repository → PostgreSQL
              → store in Redis
              → return DTO
  → JSON envelope { success, data, meta? }
```

## Write path (CMS)

```
CMS UI
  → Admin API (JWT + RBAC)
  → Controller → Service
  → Repository transaction (PostgreSQL)
  → Cache invalidation
  → Audit log
  → Response DTO
```

## External consumer (.co.tz)

```
.co.tz backend/frontend
  → HTTPS
  → /api/v1/external/* + API key
  → rate limit + permission check
  → published-content services only
  → stable content contract (never raw DB rows)
```

## Cache invalidation

```
PostgreSQL commit (content change)
  → invalidate namespaced keys
     e.g. tour:v1:slug:serengeti-safari
  → next read rebuilds cache from PostgreSQL
```

Redis failure must degrade to PostgreSQL reads, not to incorrect empty content silently presented as authoritative.
