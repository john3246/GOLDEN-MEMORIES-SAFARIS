# API security

## HTTPS

Production must terminate TLS at the reverse proxy. Redirect HTTP → HTTPS.

## Headers

Applied via Helmet (and nginx in later phases):

- `X-Content-Type-Options`
- `Referrer-Policy` / frame protections as configured
- HSTS in production at proxy layer
- CSP tightened once asset hosts are known

## CORS

Explicit allowlists per surface. Never `Access-Control-Allow-Origin: *` for admin APIs.

## Rate limiting

Separate buckets: auth, public, admin, external.

## Input validation

All query/body/params/files validated server-side.

## External API

- Read-only route registration
- API key required
- No admin endpoints mounted under `/api/v1/external`
- Automated tests must prove write attempts fail (Phase 10/17)
