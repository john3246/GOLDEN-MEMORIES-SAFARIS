import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { publicRateLimiter } from '../../middleware/index.js';
import { requireAuth, requireScope, requireStaffAdmin } from '../../security/requireAuth.js';
import { settingsService } from './settings.service.js';
import { sendSiteMail, loadMailSettings } from './mailer.js';
import { smtpTestEmail } from './email-templates.js';

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
adminSettingsRoutes.put('/', requireStaffAdmin(), async (req, res, next) => {
  try {
    res.json({ success: true, data: await settingsService.save(req.body || {}, req.auth) });
  } catch (err) {
    next(err);
  }
});
adminSettingsRoutes.patch('/', requireStaffAdmin(), async (req, res, next) => {
  try {
    res.json({ success: true, data: await settingsService.save(req.body || {}, req.auth) });
  } catch (err) {
    next(err);
  }
});
adminSettingsRoutes.post('/test-email', requireStaffAdmin(), async (req, res, next) => {
  try {
    const settings = await loadMailSettings();
    const to = String(req.body?.to || settings.email?.notifyTo || settings.site?.email || '').trim();
    const mail = smtpTestEmail(settings);
    const result = await sendSiteMail({
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    res.json({ success: true, data: { to, ...result } });
  } catch (err) {
    next(err);
  }
});

export { settingsService };
export const moduleStatus = 'active';
