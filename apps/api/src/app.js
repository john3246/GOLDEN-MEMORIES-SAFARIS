import express from 'express';
import { config } from './config/index.js';
import {
  requestIdMiddleware,
  requestLogger,
  publicRateLimiter,
} from './middleware/index.js';
import { securityHeaders, externalCors } from './security/index.js';
import { errorHandler, notFoundHandler } from './errors/index.js';
import { healthRoutes } from './health/index.js';
import { externalApiRoutes } from './modules/external-api/index.js';

/**
 * Build the Express application (no listen — testable).
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestIdMiddleware);
  app.use(securityHeaders());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(requestLogger);

  // Internal health (not under /api — avoid confusing with product APIs)
  app.use('/health', publicRateLimiter, healthRoutes);

  // External read-only API for trusted consumers (.co.tz)
  app.use('/api/v1/external', externalCors(), externalApiRoutes);

  // Placeholder for CMS / internal admin API (Phase 5+)
  app.get('/api/v1', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'GM Safaris API',
        version: 'v1',
        surfaces: {
          health: '/health',
          external: '/api/v1/external',
          admin: 'coming in Phase 5 (Authentication + RBAC)',
        },
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  // Attach config for tests / diagnostics without exporting secrets
  app.locals.nodeEnv = config.nodeEnv;

  return app;
}

export default createApp;
