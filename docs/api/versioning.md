# API versioning

## Policy

- All public product APIs live under `/api/v1/...`
- Additive, backward-compatible changes are allowed in `v1`
- Incompatible changes require `/api/v2/...`
- Do not silently break `v1` consumers (especially `.co.tz`)

## Compatibility rules

**Allowed in v1 without bump**

- New optional response fields
- New endpoints
- New optional query parameters with safe defaults

**Requires v2**

- Renaming/removing fields
- Changing field types or meaning
- Tightening validation that rejects previously valid clients
- Changing auth scheme incompatibly

## Documentation

Record changes in `docs/decisions/` and update `docs/api/external-api.md` before release.
