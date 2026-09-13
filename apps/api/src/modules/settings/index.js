import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { publicRateLimiter } from '../../middleware/index.js';
import { requireAuth, requireScope, requireRole } from '../../security/requireAuth.js';
import { settingsService } from './settings.service.js';

export const publicSettingsRoutes = Router();
publicSettingsRoutes.use(publicRateLimiter);
publicSettingsRoutes.get('/', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await settingsService.getPublic() });
  } catch (err) {
    next(err);
  }
});

export const adminSettingsRoutes = Router();
adminSettingsRoutes.use(requireAuth);
adminSettingsRoutes.get('/', requireScope(SafariScope.READ), async (_req, res, next) => {
  try {
    res.json({ success: true, data: await settingsService.getAdmin() });
  } catch (err) {
    next(err);
  }
});
adminSettingsRoutes.put('/', requireRole('Admin'), async (req, res, next) => {
  try {
    res.json({ success: true, data: await settingsService.save(req.body || {}, req.auth) });
  } catch (err) {
    next(err);
  }
});
adminSettingsRoutes.patch('/', requireRole('Admin'), async (req, res, next) => {
  try {
    res.json({ success: true, data: await settingsService.save(req.body || {}, req.auth) });
  } catch (err) {
    next(err);
  }
});

export { settingsService };
export const moduleStatus = 'active';
