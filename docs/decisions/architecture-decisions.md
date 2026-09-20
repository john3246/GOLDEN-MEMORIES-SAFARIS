# Architecture decision records

## ADR-001: Monorepo with npm workspaces

**Status:** Accepted (Phase 1)

**Decision:** Single repository with `apps/*` and `packages/*` via npm workspaces.

**Why:** Shared types/validation/config without publishing private packages; one CI surface; clear boundaries.

## ADR-002: Express.js for the API

**Status:** Accepted (Phase 1)

**Decision:** Use Express as the HTTP framework.

**Why:** Mature, lightweight, large operational familiarity; middleware ecosystem for Helmet, CORS, rate limits.

## ADR-003: External API namespace `/api/v1/external`

**Status:** Accepted (Phase 1)

**Decision:** Dedicated versioned namespace for trusted external consumers.

**Why:** Clear separation from admin routes; documents the `.co.tz` contract; prevents accidental exposure of CMS endpoints.

## ADR-004: No frontend framework for website/CMS (initially)

**Status:** Accepted (Phase 1)

**Decision:** Semantic HTML + ES modules + Tailwind; revisit only with documented justification.

**Why:** Spec requires a lightweight stack; tourism marketing sites do not need a heavy SPA by default.

## ADR-005: PostgreSQL as sole source of truth; Redis as cache

**Status:** Accepted (Phase 1)

**Decision:** All authoritative reads/writes go through PostgreSQL via repositories; Redis is optional performance.

**Why:** Prevents split-brain; external consumers never bind to cache semantics.

## ADR-006: One `tours` table with `product_type`

**Status:** Accepted (Phase 2)

**Decision:** Private safaris, join safaris, Kilimanjaro, Meru, day trips, beach, and cultural packages share `tours` plus typed children (`tour_departures`, `climb_routes`).

**Why:** Shared itinerary, price, inclusion, media, and booking relations. Listing filters use `product_type` and `tour_categories` instead of parallel product tables.

## ADR-007: RBAC with Super Admin

**Status:** Accepted (Phase 2)

**Decision:** `users` + `roles` + `permissions` + join tables. System roles: Super Admin, Admin, Manager, Editor, Viewer.

**Why:** Super Admin owns users, roles, settings, and API keys. Other admins manage catalog and bookings without being able to rewrite role definitions. Matches the CMS permission model already used on JWT scopes.
