/**
 * CMS → System status: database, storage backend, email, integrations.
 */
import { Router } from 'express';
import { requireAuth, requireStaffAdmin } from '../../security/requireAuth.js';
import { storeBackend, readStore } from '../../cms-store/index.js';
import { database } from '../../database/index.js';
import { smtpConfig, verifySmtp } from '../settings/mailer.js';
import { config } from '../../config/index.js';

export const adminSystemRoutes = Router();
adminSystemRoutes.use(requireAuth, requireStaffAdmin());

adminSystemRoutes.get('/', async (_req, res, next) => {
  try {
    const [db, smtp, store] = await Promise.all([database.healthCheck(), smtpConfig(), readStore()]);
    res.json({
      success: true,
      data: {
        environment: config.nodeEnv,
        storage: storeBackend(),
        database: { status: db.status, host: config.database.host, name: config.database.name },
        email: {
          configured: smtp.configured,
          host: smtp.smtpHost || '',
          from: smtp.fromEmail || '',
          source: smtp.envLocked ? 'environment (.env)' : 'CMS settings',
        },
        security: {
          jwtSecretSet: !config.auth.jwtSecretIsEphemeral,
          encryptionKeySet: Boolean(process.env.APP_ENCRYPTION_KEY),
          canonicalHost: process.env.CANONICAL_HOST || '',
        },
        sites: { website: store.settings?.site?.websiteUrl || config.sites.com, tanzania: config.sites.cotz },
        counts: Object.fromEntries(
          ['safaris', 'destinations', 'posts', 'lodges', 'pages', 'faqs', 'departures', 'bookings', 'inquiries', 'customers', 'media', 'reviews', 'webhooks'].map(
            (key) => [key, (store[key] || []).length]
          )
        ),
      },
    });
  } catch (err) {
    next(err);
  }
});

adminSystemRoutes.post('/verify-email', async (_req, res) => {
  try {
    res.json({ success: true, data: await verifySmtp() });
  } catch (err) {
    res.json({ success: true, data: { ok: false, reason: err instanceof Error ? err.message : String(err) } });
  }
});
