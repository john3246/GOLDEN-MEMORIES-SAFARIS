import express from 'express';
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
import { docsRoutes } from './docs/docs.routes.js';
import { readStore } from './cms-store/index.js';
import { requireAuth, requireStaffAdmin } from './security/requireAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, '../../..');

export function publicSiteDir() {
  return path.resolve(monorepoRoot, 'apps/website-com/dist');
}

export function servePublicSite(app, publicDir = publicSiteDir()) {
  const cmsIndex = path.join(publicDir, 'cms', 'index.html');

  // Express matches /cms and /cms/ as the same route unless we check req.path.
  // Redirecting /cms/ to /cms/ is what caused ERR_TOO_MANY_REDIRECTS on Render.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const pathname = req.path;
    if (pathname === '/cms') {
      res.redirect(301, '/cms/');
      return;
    }
    if (pathname === '/tours/cms' || pathname === '/tours/cms/') {
      res.redirect(301, '/cms/');
      return;
    }
    next();
  });
  app.use(express.static(publicDir, { index: 'index.html', fallthrough: true, maxAge: '7d' }));
  app.use('/cms', (_req, res, next) => {
    res.sendFile(cmsIndex, (err) => {
      if (err) next(err);
    });
  });
}

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

  app.use('/health', publicRateLimiter, healthRoutes);

  app.use('/api/v1/docs', publicRateLimiter, docsRoutes);

  app.use('/api/v1/safaris', websiteCors(), publicSafariRoutes);
  app.use('/api/v1/media', websiteCors(), publicMediaRoutes);
  app.use('/api/v1/content', websiteCors(), publicContentRoutes);
  app.use('/api/v1/settings', websiteCors(), publicSettingsRoutes);
  app.use('/api/v1/inquiries', websiteCors(), publicEnquiryRoutes);
  app.use('/api/v1/bookings', websiteCors(), publicBookingRoutes);

  app.use('/api/v1/external', externalCors(), externalApiRoutes);

  const admin = express.Router();
  admin.use(cmsCors());
  admin.use(adminRateLimiter);
  admin.use('/auth', authRoutes);
  admin.use('/safaris', adminSafariRoutes);
  admin.use('/media', adminMediaRoutes);
  admin.use('/api-clients', apiClientRoutes);
  admin.use('/content', adminContentRoutes);
  admin.use('/settings', adminSettingsRoutes);
  admin.use('/inquiries', adminEnquiryRoutes);
  admin.use('/bookings', adminBookingRoutes);
  admin.use('/customers', adminCustomerRoutes);
  admin.use('/users', adminUserRoutes);
  admin.get('/audit', requireAuth, requireStaffAdmin(), async (_req, res, next) => {
    try {
      const store = await readStore();
      res.json({
        success: true,
        data: store.auditLogs.slice(0, 100),
        meta: { page: 1, limit: 100, total: store.auditLogs.length },
      });
    } catch (err) {
      next(err);
    }
  });
  app.use('/api/v1/admin', admin);

  if (config.servePublic) {
    servePublicSite(app);
  }

  app.get('/api/v1', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'GM Safaris API',
        version: 'v1',
        surfaces: {
          health: '/health',
          docs: '/api/v1/docs',
          safaris: '/api/v1/safaris',
          content: '/api/v1/content',
          settings: '/api/v1/settings',
          inquiries: '/api/v1/inquiries',
          bookings: '/api/v1/bookings',
          external: '/api/v1/external',
          admin: '/api/v1/admin',
        },
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.locals.nodeEnv = config.nodeEnv;

  return app;
}

export default createApp;
