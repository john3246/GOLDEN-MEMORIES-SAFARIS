# Tests

| Suite | Purpose |
|-------|---------|
| `unit/` | Shared packages and pure logic |
| `integration/` | DB/cache interactions (Phase 2+) |
| `api/` | HTTP contract tests |
| `security/` | Authz, read-only external API, headers |
| `e2e/` | Full journeys (later) |
| `performance/` | Load/budget checks (later) |

Run from repo root:

```bash
npm test
```
