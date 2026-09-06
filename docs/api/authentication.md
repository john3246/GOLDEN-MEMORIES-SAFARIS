# Authentication

## CMS / admin (Phase 5)

- Password hashing (bcrypt/argon2 — decided in Phase 5)
- JWT or secure session tokens
- Account lockout / auth rate limits
- Server-side RBAC on every mutating route

## External API (Phase 1 scaffold)

Trusted machine clients authenticate with a **revocable API key**:

```
X-Api-Key: <key>
```

or

```
Authorization: Bearer <key>
```

### Rules

- Keys live in secrets / env (Phase 1) and later hashed in PostgreSQL
- Never commit keys
- Rotate by issuing a new key and revoking the old one
- External keys receive **read** permissions only

## Not authentication

CORS origin allowlists are not authentication. Keys/JWT are still required.
