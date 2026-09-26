/**
 * Apply database/migrations + database/seed using the Node `pg` driver.
 * Works on Windows without psql on PATH.
 *
 * Usage: npm run db:migrate
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env'), override: true });

const require = createRequire(path.join(root, 'apps/api/package.json'));
const pg = require('pg');
const { runMigrations } = await import('../apps/api/src/database/migrate.js');

const db = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME || 'gm_safaris',
  user: process.env.DATABASE_USER || 'gm_safaris_app',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: ['1', 'true', 'yes'].includes(String(process.env.DATABASE_SSL || '').toLowerCase())
    ? { rejectUnauthorized: false }
    : false,
};

console.log(`Connecting as ${db.user}@${db.host}:${db.port}/${db.database}`);
const pool = new pg.Pool({ ...db, max: 2, connectionTimeoutMillis: 8000 });
try {
  const applied = await runMigrations(pool, { log: (msg) => console.log(msg) });
  console.log(applied.length ? `Done. ${applied.length} migration(s) applied.` : 'Database is up to date.');
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  console.error('\nTip: run `npm run db:setup` first if the database or user does not exist yet.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
