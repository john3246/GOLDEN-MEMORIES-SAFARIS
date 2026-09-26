/**
 * Database access. Controllers must not import this for ad-hoc SQL — use repositories.
 */
export { database, getPool, connectDatabase, closeDatabase, databaseConfigured } from './pg-pool.js';
