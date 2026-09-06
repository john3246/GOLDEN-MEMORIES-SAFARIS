# Common errors

| Symptom | First checks |
|---------|----------------|
| API will not start | `.env` present? `PORT` free? `npm install` done? |
| `UNAUTHORIZED` on external API | `X-Api-Key` / Bearer set? Key in `EXTERNAL_API_KEYS`? |
| `NOT_IMPLEMENTED` | Domain module not shipped yet — expected in Phase 1 |
| `RATE_LIMITED` | Wait for window; check limit env vars |
| CORS browser error | Origin in `CORS_ORIGINS_*` allowlist? |

Never share production secrets in tickets; use `requestId` from the error body.
