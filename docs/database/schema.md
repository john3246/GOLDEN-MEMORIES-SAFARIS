# Database schema

**Phase 2** will define the authoritative schema.

Planned entity groups:

- Identity: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`
- Catalog: `tours`, `tour_categories`, `tour_destinations`, `tour_itineraries`, `tour_prices`, `tour_inclusions`, `tour_exclusions`
- Places: `destinations`, `accommodations`
- Ops: `vehicles`, `bookings`, `booking_guests`, `enquiries`
- Content: `media`, `media_folders`, `pages`, `page_sections`, `blog_posts`, `blog_categories`, `testimonials`
- Meta: `seo_metadata`, `site_settings`, `audit_logs`
- Publishing status on content tables (`DRAFT` | `REVIEW` | `PUBLISHED` | `ARCHIVED`)

Design around business entities — not WordPress tables.
