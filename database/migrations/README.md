# Migrations

Naming:

```
YYYYMMDDHHMMSS_description.sql
```

Never edit applied migrations in production; add a new file instead.

| File | Purpose |
|------|---------|
| `20260911180000_safari_cms.sql` | Interim Safari CMS tables (`cms_*`) |
| `20260918010000_extensions_and_enums.sql` | pgcrypto, citext, enums, `set_updated_at` |
| `20260918010100_identity_rbac.sql` | users, Super Admin / Admin roles, permissions |
| `20260918010200_media.sql` | media library + polymorphic links |
| `20260918010300_places.sql` | regions, destinations, accommodations |
| `20260918010400_catalog.sql` | tours, itineraries, prices, join departures, climb routes |
| `20260918010500_content.sql` | pages, blog, FAQs, reviews, menus, team |
| `20260918010600_operations.sql` | customers, enquiries, bookings, vehicles |
| `20260918010700_meta_and_bridge.sql` | SEO, settings, audit, `cms_*` FKs |
| `20260919120000_tours_published_require_price.sql` | Unpublish tours without a price; keep them as drafts; DB CHECK + public view filter |
| `20260921120000_booking_children.sql` | Booking adults, children count, and per-child name/age |

Apply with `node scripts/db-migrate.mjs` (needs `psql`).
