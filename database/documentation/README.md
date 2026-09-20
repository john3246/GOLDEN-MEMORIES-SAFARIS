# Schema notes

- UUIDs are generated in the database (`gen_random_uuid()`); the API may still send ids.
- `updated_at` is maintained by `set_updated_at()`.
- `extras JSONB` is the extension point for new CMS fields; promote a field to a column only when you need to filter or relate on it.
- `tour_inclusions.included = false` is the exclusion list (avoids a second nearly identical table).
- Unique customer emails ignore null/blank so walk-in bookings still work.
- Application DB role `gm_safaris_app` is granted DML only when that role already exists; it must not be a cluster superuser in production.
- Do not edit applied migrations. Add a new `YYYYMMDDHHMMSS_description.sql` file.
