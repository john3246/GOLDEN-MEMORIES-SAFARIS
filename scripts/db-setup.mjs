/**
 * One-time local database setup.
 *
 * Creates the application role + database named in .env (DATABASE_USER,
 * DATABASE_PASSWORD, DATABASE_NAME) using a PostgreSQL superuser, then runs
 * every migration and imports the existing CMS content (store.json) on the
 * next API start.
 *
 * Usage (Windows PowerShell):
 *   $env:PGADMIN_PASSWORD="your-postgres-password"; npm run db:setup
 * Usage (macOS / Linux):
 *   PGADMIN_PASSWORD=your-postgres-password npm run db:setup
 *
 * Optional: PGADMIN_USER (default postgres).
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

const host = process.env.DATABASE_HOST || 'localhost';
const port = Number(process.env.DATABASE_PORT || 5432);
const name = process.env.DATABASE_NAME || 'gm_safaris';
const user = process.env.DATABASE_USER || 'gm_safaris_app';
const password = process.env.DATABASE_PASSWORD || '';
const ssl = ['1', 'true', 'yes'].includes(String(process.env.DATABASE_SSL || '').toLowerCase())
  ? { rejectUnauthorized: false }
  : false;

function ident(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function canConnectAsApp() {
  const client = new pg.Client({ host, port, database: name, user, password, ssl, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

if (!password || password === 'change_me_strong_password') {
  console.error('Set a real DATABASE_PASSWORD in .env before running db:setup.');
  process.exit(1);
}

if (await canConnectAsApp()) {
  console.log(`Database ${name} already reachable as ${user}.`);
} else {
  const adminUser = process.env.PGADMIN_USER || 'postgres';
  const adminPassword = process.env.PGADMIN_PASSWORD || '';
  if (!adminPassword) {
    console.error(
      `Cannot connect to ${name} as ${user}. Set PGADMIN_PASSWORD (your PostgreSQL superuser password) and run again.`
    );
    process.exit(1);
  }
  const admin = new pg.Client({
    host,
    port,
    database: 'postgres',
    user: adminUser,
    password: adminPassword,
    ssl,
    connectionTimeoutMillis: 8000,
  });
  await admin.connect();
  const role = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [user]);
  if (!role.rowCount) {
    await admin.query(`CREATE ROLE ${ident(user)} LOGIN PASSWORD ${admin.escapeLiteral(password)}`);
    console.log(`Created role ${user}`);
  } else {
    await admin.query(`ALTER ROLE ${ident(user)} WITH LOGIN PASSWORD ${admin.escapeLiteral(password)}`);
    console.log(`Updated password for role ${user}`);
  }
  const dbRow = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  if (!dbRow.rowCount) {
    await admin.query(`CREATE DATABASE ${ident(name)} OWNER ${ident(user)}`);
    console.log(`Created database ${name}`);
  }
  await admin.end();

  const dbAdmin = new pg.Client({ host, port, database: name, user: adminUser, password: adminPassword, ssl });
  await dbAdmin.connect();
  await dbAdmin.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await dbAdmin.query('CREATE EXTENSION IF NOT EXISTS citext');
  await dbAdmin.query(`GRANT ALL ON SCHEMA public TO ${ident(user)}`);
  await dbAdmin.end();
}

const pool = new pg.Pool({ host, port, database: name, user, password, ssl, max: 2 });
try {
  const applied = await runMigrations(pool, { log: (msg) => console.log(msg) });
  console.log(applied.length ? `${applied.length} migration(s) applied.` : 'Schema is up to date.');
  console.log('\nDone. Start the API and your existing CMS content is imported into PostgreSQL automatically.');
} finally {
  await pool.end();
}
