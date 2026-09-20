/**
 * Apply database/migrations then database/seed in filename order via psql.
 * Already-applied files in schema_migrations are skipped. Seeds are re-applied
 * (they use ON CONFLICT).
 *
 * Usage: node scripts/db-migrate.mjs
 */
import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env'), override: true });

const db = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || '5432',
  name: process.env.DATABASE_NAME || 'gm_safaris',
  user: process.env.DATABASE_USER || 'gm_safaris_app',
  password: process.env.DATABASE_PASSWORD || 'change_me_strong_password',
};

function psqlArgs(extra) {
  return [
    '-v',
    'ON_ERROR_STOP=1',
    '-h',
    db.host,
    '-p',
    String(db.port),
    '-U',
    db.user,
    '-d',
    db.name,
    ...extra,
  ];
}

function runPsql(extra, { capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('psql', psqlArgs(extra), {
      env: { ...process.env, PGPASSWORD: db.password, PGUSER: db.user },
      stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
      windowsHide: true,
    });
    let stdout = '';
    if (capture) {
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
    }
    child.on('error', (err) => {
      reject(
        new Error(
          `psql could not be started (${err.message}). Install PostgreSQL client tools or run from a postgres container.`
        )
      );
    });
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`psql exited ${code}`));
    });
  });
}

async function sqlFiles(dir) {
  const entries = await readdir(dir);
  return entries.filter((name) => name.endsWith('.sql')).sort().map((name) => path.join(dir, name));
}

console.log(`Connecting as ${db.user}@${db.host}:${db.port}/${db.name}`);

await runPsql([
  '-c',
  'CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());',
]);

const appliedRaw = await runPsql(['-t', '-A', '-c', 'SELECT filename FROM schema_migrations;'], { capture: true });
const applied = new Set(
  String(appliedRaw)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
);

const migrations = await sqlFiles(path.join(root, 'database', 'migrations'));
for (const file of migrations) {
  const filename = path.basename(file);
  if (applied.has(filename)) {
    console.log(`Skipping ${filename} (already applied)`);
    continue;
  }
  console.log(`Applying ${filename}`);
  await runPsql(['-1', '-f', file]);
  await runPsql(['-c', `INSERT INTO schema_migrations (filename) VALUES ('${filename}') ON CONFLICT DO NOTHING;`]);
}

const seeds = await sqlFiles(path.join(root, 'database', 'seed'));
for (const file of seeds) {
  console.log(`Seeding ${path.basename(file)}`);
  await runPsql(['-f', file]);
}

console.log(`Done. Target database: ${db.name}`);
