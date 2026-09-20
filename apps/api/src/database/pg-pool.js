import pg from 'pg';
import { config } from '../config/index.js';
import { logger } from '../logging/index.js';

const { Pool } = pg;

let pool = null;
let disabled = false;

function canConnect() {
  const password = config.database?.password;
  return Boolean(password && password !== 'unused-file-store');
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
      min: config.database.poolMin || 0,
      // Ignore leftover PGUSER/PGPASSWORD from the Windows PostgreSQL installer.
      connectionTimeoutMillis: 5000,
    });
    pool.on('error', (err) => {
      logger.error('PostgreSQL pool error', { message: err.message });
    });
  }
  return pool;
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
    } catch (err) {
      database.ready = false;
      return { status: 'down', message: 'PostgreSQL unreachable' };
    }
  },
};
