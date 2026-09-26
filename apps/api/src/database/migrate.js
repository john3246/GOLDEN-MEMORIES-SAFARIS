/**
 * Apply database/migrations then database/seed with the `pg` driver.
 *
 * - No `psql` needed (works the same on Windows, macOS, Linux and Render).
 * - Uses the same `schema_migrations` table the old psql script used, so an
 *   existing database simply picks up the new files.
 * - Each migration runs in its own transaction.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const MIGRATIONS_DIR = path.join(root, 'database', 'migrations');
export const SEEDS_DIR = path.join(root, 'database', 'seed');

async function sqlFiles(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((name) => name.endsWith('.sql'))
      .sort()
      .map((name) => path.join(dir, name));
  } catch {
    return [];
  }
}

/**
 * Auto-detect and register migrations whose database objects were already created
 * prior to schema_migrations tracking (e.g. manual psql/pgAdmin runs or restored dumps).
 */
async function reconcileBaseline(pool, applied, log = () => {}) {
  const baselineChecks = [
    {
      filename: '20260918010000_extensions_and_enums.sql',
      test: "SELECT 1 FROM pg_type WHERE typname = 'content_status'",
    },
    {
      filename: '20260918010100_identity_rbac.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles'",
    },
    {
      filename: '20260918010200_media.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media'",
    },
    {
      filename: '20260918010300_places.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'destinations'",
    },
    {
      filename: '20260918010400_catalog.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tours'",
    },
    {
      filename: '20260918010500_content.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pages'",
    },
    {
      filename: '20260918010600_operations.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings'",
    },
    {
      filename: '20260918010700_meta_and_bridge.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings'",
    },
    {
      filename: '20260918180000_blog_documents.sql',
      test: "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'kicker'",
    },
    {
      filename: '20260921120000_booking_children.sql',
      test: "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'adults'",
    },
    {
      filename: '20260921140000_lodge_category_and_tour_lodges.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tour_accommodations'",
    },
    {
      filename: '20260924010000_blog_rich_documents.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_post_lodges'",
    },
    {
      filename: '20260924120000_destination_travel_fields.sql',
      test: "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'destinations' AND column_name = 'getting_there'",
    },
    {
      filename: '20260925030000_group_safari_documents.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cms_departures'",
    },
    {
      filename: '20260926090000_cms_document_store.sql',
      test: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cms_documents'",
    },
  ];

  for (const { filename, test } of baselineChecks) {
    if (applied.has(filename)) continue;
    try {
      const res = await pool.query(test);
      if (res.rowCount > 0) {
        await pool.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
          [filename]
        );
        applied.add(filename);
        log(`Recognized baseline migration ${filename}`);
      }
    } catch {
      // Ignore detection errors; let normal migration run
    }
  }
}

/**
 * @param {import('pg').Pool} pool
 * @param {{ log?: (msg: string) => void, seeds?: boolean }} [options]
 */
export async function runMigrations(pool, { log = () => {}, seeds = true } = {}) {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());'
  );
  const appliedRows = await pool.query('SELECT filename FROM schema_migrations');
  const applied = new Set(appliedRows.rows.map((row) => row.filename));
  await reconcileBaseline(pool, applied, log);
  const done = [];

  for (const file of await sqlFiles(MIGRATIONS_DIR)) {
    const filename = path.basename(file);
    if (applied.has(filename)) continue;
    const sql = await fs.readFile(file, 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
      await client.query('COMMIT');
      done.push(filename);
      log(`Applied ${filename}`);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Migration ${filename} failed: ${message}`);
    } finally {
      client.release();
    }
  }

  if (seeds) {
    for (const file of await sqlFiles(SEEDS_DIR)) {
      try {
        await pool.query(await fs.readFile(file, 'utf8'));
      } catch (err) {
        log(`Seed ${path.basename(file)} skipped: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
  return done;
}
