import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { publicRateLimiter } from '../../middleware/index.js';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { enquiriesService } from './enquiries.service.js';

export const publicEnquiryRoutes = Router();
publicEnquiryRoutes.use(publicRateLimiter);
publicEnquiryRoutes.post('/', async (req, res, next) => {
  try {
    const data = await enquiriesService.createPublic(req.body || {});
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export const adminEnquiryRoutes = Router();
adminEnquiryRoutes.use(requireAuth);
adminEnquiryRoutes.get('/', requireScope(SafariScope.READ), async (_req, res, next) => {
  try {
    const result = await enquiriesService.listAdmin();
    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});
adminEnquiryRoutes.patch('/:id', requireScope(SafariScope.WRITE), async (req, res, next) => {
  try {
    const data = await enquiriesService.updateStatus(req.params.id, req.body?.status, req.auth);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export { enquiriesService };
export const moduleStatus = 'active';
