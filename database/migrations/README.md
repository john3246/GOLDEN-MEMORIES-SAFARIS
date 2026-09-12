# Migrations

SQL migrations will be added as modules land.

Safari CMS schema: `20260911180000_safari_cms.sql` (content tables only — not bookings).

Naming convention (planned):

```
YYYYMMDDHHMMSS_description.sql
```

Never edit applied migrations in production; add a new migration instead.
