/**
 * Database access. Controllers must not import this for ad-hoc SQL — use repositories.
 */
export { database, getPool } from './pg-pool.js';
