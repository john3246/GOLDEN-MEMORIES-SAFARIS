import pg from 'pg';
import { config } from '../config/index.js';
import { logger } from '../logging/index.js';
import { runMigrations } from './migrate.js';

const { Pool } = pg;

let pool = null;
let disabled = false;

function isTestRun() {
  return process.env.VITEST === 'true' || Boolean(process.env.VITEST) || process.env.NODE_ENV === 'test';
}

export function databaseConfigured() {
  const password = config.database?.password;
  return Boolean(password && password !== 'unused-file-store');
}

function canConnect() {
  if (isTestRun() && process.env.CMS_TEST_DATABASE !== 'true') return false;
  return databaseConfigured();
}

export function getPool() {
  if (disabled || !canConnect()) return null;
  if (!pool) {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: config.database.poolMax || 10,
      min: 0,
      idleTimeoutMillis: 30_000,
      // Ignore leftover PGUSER/PGPASSWORD from the Windows PostgreSQL installer.
      connectionTimeoutMillis: 8000,
    });
    pool.on('error', (err) => {
      logger.error('PostgreSQL pool error', { message: err.message });
    });
  }
  return pool;
}

/**
 * Connect, apply pending migrations, and return the pool (or null when the
 * database is not configured / unreachable).
 */
export async function connectDatabase({ migrate = config.database.autoMigrate !== false } = {}) {
  const client = getPool();
  if (!client) return null;
  try {
    await client.query('SELECT 1');
  } catch (err) {
    logger.error('PostgreSQL is unreachable', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
  if (migrate) {
    const applied = await runMigrations(client, { log: (msg) => logger.info(msg) });
    if (applied.length) logger.info('Database migrations applied', { count: applied.length, files: applied });
  }
  database.ready = true;
  return client;
}

export async function closeDatabase() {
  if (pool) {
    const current = pool;
    pool = null;
    await current.end().catch(() => {});
  }
}

export function disableDatabase() {
  disabled = true;
}

export const database = {
  ready: false,
  async healthCheck() {
    if (!canConnect()) {
      return { status: 'not_configured', message: 'PostgreSQL pool not initialized' };
    }
    try {
      const client = getPool();
      await client.query('SELECT 1');
      database.ready = true;
      return { status: 'up', message: 'PostgreSQL connected' };
    } catch {
      database.ready = false;
      return { status: 'down', message: 'PostgreSQL unreachable' };
    }
  },
};
