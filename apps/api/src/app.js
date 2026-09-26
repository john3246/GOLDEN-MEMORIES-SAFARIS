import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/index.js';
import {
  requestIdMiddleware,
  requestLogger,
  publicRateLimiter,
  adminRateLimiter,
} from './middleware/index.js';
import {
  securityHeaders,
  externalCors,
  cmsCors,
  websiteCors,
  canonicalHostRedirect,
} from './security/index.js';
import { errorHandler, notFoundHandler } from './errors/index.js';
import { healthRoutes } from './health/index.js';
import { externalApiRoutes } from './modules/external-api/index.js';
import { authRoutes } from './modules/auth/index.js';
import { publicSafariRoutes, adminSafariRoutes } from './modules/safaris/index.js';
import { adminMediaRoutes, publicMediaRoutes } from './modules/media/index.js';
import { apiClientRoutes } from './modules/api-clients/index.js';
import { publicContentRoutes, adminContentRoutes } from './modules/content/index.js';
import { publicSettingsRoutes, adminSettingsRoutes } from './modules/settings/index.js';
import { publicEnquiryRoutes, adminEnquiryRoutes } from './modules/enquiries/index.js';
import { publicBookingRoutes, adminBookingRoutes, adminCustomerRoutes } from './modules/bookings/index.js';
import { adminUserRoutes } from './modules/users/index.js';
import { adminWebhookRoutes } from './modules/webhooks/index.js';
import { publicReviewRoutes, adminReviewRoutes } from './modules/reviews/index.js';
import { adminNotificationRoutes } from './modules/notifications/index.js';
import { publicSiteRoutes } from './modules/site/site-bundle.js';
import { adminSystemRoutes } from './modules/system/index.js';
import { servePublicSite as serveSite } from './modules/site/public-site.js';
import { docsRoutes } from './docs/docs.routes.js';
import { readStore } from './cms-store/index.js';
import { requireAuth, requireStaffAdmin } from './security/requireAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '../../..');

export function publicSiteDir() {
  return path.resolve(monorepoRoot, 'apps/website-com/dist');
}

export function servePublicSite(app, publicDir = publicSiteDir()) {
  serveSite(app, publicDir);
}

/**
 * Build the Express application (no listen — testable).
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.isProduction || process.env.RENDER ? 1 : 'loopback');

  app.use(canonicalHostRedirect());
  app.use(requestIdMiddleware);
  app.use(securityHeaders());
  app.use(compression({ threshold: 1024 }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(requestLogger);

  app.use('/health', publicRateLimiter, healthRoutes);

  app.use('/api/v1/docs', publicRateLimiter, docsRoutes);

  app.use('/api/v1/site-bundle', websiteCors(), publicSiteRoutes);
  app.use('/api/v1/safaris', websiteCors(), publicSafariRoutes);
  app.use('/api/v1/media', websiteCors(), publicMediaRoutes);
  app.use('/api/v1/content', websiteCors(), publicContentRoutes);
  app.use('/api/v1/settings', websiteCors(), publicSettingsRoutes);
  app.use('/api/v1/reviews', websiteCors(), publicReviewRoutes);
  app.use('/api/v1/inquiries', websiteCors(), publicEnquiryRoutes);
  app.use('/api/v1/bookings', websiteCors(), publicBookingRoutes);

  app.use('/api/v1/external', externalCors(), externalApiRoutes);

  const admin = express.Router();
  admin.use(cmsCors());
  admin.use(adminRateLimiter);
  admin.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  admin.use('/auth', authRoutes);
  admin.use('/safaris', adminSafariRoutes);
  admin.use('/media', adminMediaRoutes);
  admin.use('/api-clients', apiClientRoutes);
  admin.use('/webhooks', adminWebhookRoutes);
  admin.use('/content', adminContentRoutes);
  admin.use('/settings', adminSettingsRoutes);
  admin.use('/inquiries', adminEnquiryRoutes);
  admin.use('/bookings', adminBookingRoutes);
  admin.use('/customers', adminCustomerRoutes);
  admin.use('/reviews', adminReviewRoutes);
  admin.use('/notifications', adminNotificationRoutes);
  admin.use('/users', adminUserRoutes);
  admin.use('/system', adminSystemRoutes);
  admin.get('/audit', requireAuth, requireStaffAdmin(), async (req, res, next) => {
    try {
      const store = await readStore();
      const limit = Math.min(Number(req.query.limit) || 200, 1000);
      res.json({
        success: true,
        data: store.auditLogs.slice(0, limit),
        meta: { page: 1, limit, total: store.auditLogs.length },
      });
    } catch (err) {
      next(err);
    }
  });
  app.use('/api/v1/admin', admin);

  app.get('/api/v1', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'GM Safaris API',
        version: 'v1',
        surfaces: {
          health: '/health',
          docs: '/api/v1/docs',
          siteBundle: '/api/v1/site-bundle',
          safaris: '/api/v1/safaris',
          content: '/api/v1/content',
          settings: '/api/v1/settings',
          reviews: '/api/v1/reviews',
          inquiries: '/api/v1/inquiries',
          bookings: '/api/v1/bookings',
          external: '/api/v1/external',
          admin: '/api/v1/admin',
        },
      },
    });
  });

  if (config.servePublic) {
    servePublicSite(app);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.locals.nodeEnv = config.nodeEnv;

  return app;
}

export default createApp;
