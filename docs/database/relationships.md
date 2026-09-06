# Relationships

Detailed foreign keys and cardinality will be documented in Phase 2.

High-level:

- Tours ↔ Destinations (many-to-many via `tour_destinations`)
- Tours → Itineraries, Prices, Inclusions/Exclusions (one-to-many)
- Bookings → Tours; Booking → Guests
- Media referenced by tours, pages, blog, destinations
- SEO metadata polymorphic or typed per resource
- Users ↔ Roles ↔ Permissions

External API DTOs must not expose internal FK column names.
