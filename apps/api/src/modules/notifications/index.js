import { Router } from 'express';
import { requireAuth } from '../../security/requireAuth.js';
import { notificationsService } from './notifications.service.js';

export const adminNotificationRoutes = Router();
adminNotificationRoutes.use(requireAuth);
adminNotificationRoutes.get('/', async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: await notificationsService.forUser(req.auth.userId) });
  } catch (err) {
    next(err);
  }
});
adminNotificationRoutes.post('/read', async (req, res, next) => {
  try {
    res.json({ success: true, data: await notificationsService.markRead(req.auth.userId, req.body?.ids) });
  } catch (err) {
    next(err);
  }
});

export { notifyStaff } from './notifications.service.js';
