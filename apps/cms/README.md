# GM Safaris CMS

Secure admin application for managing central content (tours, destinations, media, pages, blog, SEO, settings).

## Status

**Phase 1 foundation only.** UI and auth workflows begin in **Phase 11–12**.

## Rules

- All authorization is enforced by the API (server-side). Never rely on CMS JavaScript alone.
- CMS talks only to the internal/admin API — never to PostgreSQL or Redis directly.
- External `.co.tz` developers do **not** receive CMS access.

## Planned stack (Phase 11)

- Semantic HTML + modular JS + Tailwind CSS
- Lightweight — no unnecessary SPA framework unless justified later
