# Security model

## Trust boundaries

1. **Internet** — untrusted
2. **Reverse proxy / TLS** — terminates HTTPS
3. **API** — authenticates and authorizes all access
4. **PostgreSQL** — private network only
5. **Redis** — private network only; no sensitive secrets cached by default

## Principles

- Least privilege for DB users, API keys, and CMS roles
- Server-side authorization always
- External consumers: read-only API keys
- No stack traces, SQL, paths, or env values in client errors
- Secrets only via environment / secret manager — never Git

## Surfaces

| Surface | Controls |
|---------|----------|
| External API | API key, rate limit, CORS allowlist, read-only routes |
| Admin API | JWT/session, RBAC, stricter CORS, audit log |
| Health | Minimal payload, rate limited |
| CMS UI | No direct DB; relies on admin API |

## Phase 1 baseline

Implemented now: Helmet headers, CORS helpers, rate limiters, external API key middleware, centralized errors, request IDs, `.env.example` without secrets.
