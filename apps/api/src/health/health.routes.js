import { Router } from 'express';
import { database } from '../database/index.js';
import { cache } from '../cache/index.js';

const router = Router();

/**
 * Liveness — process is up. Safe for load balancers.
 * Does not expose dependency diagnostics.
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'gm-safaris-api',
    },
  });
});

/**
 * Readiness — dependencies. Keep details minimal in production responses.
 */
router.get('/ready', async (_req, res) => {
  const [db, redis] = await Promise.all([database.healthCheck(), cache.healthCheck()]);

  const ready =
    (db.status === 'up' || db.status === 'not_configured') &&
    (redis.status === 'up' || redis.status === 'not_configured');

  // During foundation phases, "not_configured" is acceptable for local boot.
  // Production deployment (Phase 20) will require status === 'up'.
  res.status(ready ? 200 : 503).json({
    success: ready,
    data: {
      status: ready ? 'ready' : 'not_ready',
      checks: {
        database: db.status,
        redis: redis.status,
      },
    },
  });
});

export default router;
