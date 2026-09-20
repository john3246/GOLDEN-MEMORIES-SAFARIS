# Scripts

Operational and developer scripts (migrations, media backfill, seed runners).

Run via `node scripts/<name>.mjs` or npm scripts from the monorepo root.

- `db-migrate.mjs` — apply `database/migrations` then `database/seed` (needs `psql`)
