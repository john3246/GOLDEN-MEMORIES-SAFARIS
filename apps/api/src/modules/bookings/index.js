import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { publicRateLimiter } from '../../middleware/index.js';
import { bookingsService } from './bookings.service.js';

export const publicBookingRoutes = Router();
publicBookingRoutes.use(publicRateLimiter);
publicBookingRoutes.post('/', async (req, res, next) => {
  try {
    const data = await bookingsService.createPublic(req.body || {});
    res.status(201).json({ success: true, data: { id: data.id, code: data.code, status: data.status } });
  } catch (err) {
    next(err);
  }
});

export const adminBookingRoutes = Router();
adminBookingRoutes.use(requireAuth);
adminBookingRoutes.get('/', requireScope(SafariScope.READ), async (_req, res, next) => {
  try {
    const result = await bookingsService.list();
    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});
adminBookingRoutes.post('/', requireScope(SafariScope.WRITE), async (req, res, next) => {
  try {
    const data = await bookingsService.create(req.body || {}, req.auth);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
adminBookingRoutes.patch('/:id', requireScope(SafariScope.WRITE), async (req, res, next) => {
  try {
    const data = await bookingsService.update(req.params.id, req.body || {}, req.auth);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
adminBookingRoutes.post('/:id/remind', requireScope(SafariScope.WRITE), async (req, res, next) => {
  try {
    const data = await bookingsService.sendReminder(req.params.id, req.auth);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export const adminCustomerRoutes = Router();
adminCustomerRoutes.use(requireAuth);
adminCustomerRoutes.get('/', requireScope(SafariScope.READ), async (_req, res, next) => {
  try {
    const result = await bookingsService.listCustomers();
    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

export { bookingsService };
export const moduleStatus = 'active';
