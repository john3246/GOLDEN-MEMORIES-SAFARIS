# Authentication (security)

See also `docs/api/authentication.md`.

## CMS users (Phase 5)

- Strong password hashing
- Login rate limiting / lockout
- Secure token/session handling
- Logout invalidation
- Audit log for login/logout and privileged actions

## External machine auth

- Dedicated API keys distinct from CMS credentials
- Revocable and rotatable
- Phase 1: env list for scaffolding
- Later: hashed storage in PostgreSQL with metadata (name, last used, revoked_at)

## Forbidden credential sharing

Do not give `.co.tz` developers:

- Database credentials
- Redis credentials
- CMS logins
- SSH access
- Internal admin JWT secrets
