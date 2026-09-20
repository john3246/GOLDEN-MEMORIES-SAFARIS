# Database schema

PostgreSQL (`gm_safaris`) is the **single source of truth**. Redis is cache only. The `.co.tz` site never connects here.

The live CMS still reads a JSON file store until Phase 3 wires the pool. These migrations are the target model.

## How to apply

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres
node scripts/db-migrate.mjs
```

Requires `psql` on PATH. Files run in name order: `database/migrations/*.sql` then `database/seed/*.sql`.

## Publishing

`content_status`: `DRAFT` → `REVIEW` → `PUBLISHED` → `UNPUBLISHED` | `ARCHIVED`.

Public and external APIs return **PUBLISHED** only (`v_public_tours`). Safari CMS `UNPUBLISHED` keeps a published snapshot off the site without wiping it.

## Identity

| Table | Role |
|-------|------|
| `users` | Staff (CMS / ops). Guests are `customers`. |
| `roles` | Super Admin, Admin, Manager, Editor, Viewer (`is_system`) |
| `permissions` | `module:action` keys, e.g. `safaris:publish` |
| `user_roles` | Many-to-many |
| `role_permissions` | Many-to-many |

**Super Admin** (`super-admin`) has every permission, including `roles:manage` and `users:delete`. **Admin** has the same except role definitions. App code must refuse removing the last Super Admin.

Existing `cms_users.role` now allows `Super Admin` and links via `cms_users.user_id`.

## Catalog (safaris / tours)

One `tours` row per package. `product_type` distinguishes:

| product_type | Public surface |
|--------------|----------------|
| `private_safari` | `/tours/` private itineraries |
| `join_safari` | `/join-safari/` + `tour_departures` |
| `kilimanjaro` | `/kilimanjaro/` + `climb_route_id` |
| `meru` | Mount Meru treks |
| `day_trip` | Day excursions |
| `beach` | Zanzibar / coast |
| `cultural` | Cultural / historical |
| `custom` | Tailor-made |

`tour_categories` are the style filters (wildlife, luxury, fly-in, …). A tour can have several.

Child tables: `tour_destinations`, `tour_itinerary_days` (optional `accommodation_id`), `tour_inclusions` (`included = false` = exclusion), `tour_faqs`, `tour_prices` (seasonal / occupancy), `tour_departures`, `tour_related`, `tour_revisions`.

`tours.draft` / `tours.published` JSONB keep the current Safari CMS document shape. `cms_safaris.tour_id` bridges the file-backed CMS until repositories switch.

`extras JSONB` on tours, destinations, lodges, bookings, posts holds fields that arrive later without a new migration.

## Places

- `regions` — Northern Tanzania, The Coast, Southern, Western
- `destinations` — parks and places (Serengeti, Ngorongoro, Kilimanjaro, Zanzibar, …) with seasons, wildlife, facts, FAQs, `match_terms`
- `accommodations` — lodges, camps, hotels, mountain huts; optional `destination_id`

## Content

`pages` + `page_sections` · `blog_topics` + `blog_posts` (optional links to tours and destinations) · `faqs` / `faq_groups` · `testimonials` (optional tour / destination / lodge + rating) · `menus` / `menu_items` · `team_members` · `credentials`

## Operations

`customers` · `enquiries` (contact + booking form; optional `tour_id` / `departure_id`) · `bookings` · `booking_guests` · `booking_accommodations` · `vehicles`

## Media & meta

`media_folders` · `media` · `media_links` (polymorphic) · `seo_metadata` (typed polymorphic) · `site_settings` (key → JSONB) · `audit_logs`

`cms_media` / `cms_api_clients` / `cms_audit_logs` stay until those modules move.

## Enums (keep in sync with `@gm-safaris/shared-types`)

`content_status` · `product_type` · `user_status` · `booking_status` · `enquiry_status` · `enquiry_source` · `media_visibility` · `media_role` · `menu_location` · `accommodation_kind` · `vehicle_kind` · `seo_resource_type`
