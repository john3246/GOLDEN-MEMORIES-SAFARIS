import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { publicRateLimiter } from '../../middleware/index.js';
import { requireAuth, requireScope, requireStaffAdmin } from '../../security/requireAuth.js';
import { reviewsService, syncAllSources, syncSource } from './reviews.service.js';

function wrap(fn) {
  return async (req, res, next) => {
    try {
      res.json({ success: true, data: await fn(req, res) });
    } catch (err) {
      next(err);
    }
  };
}

export const publicReviewRoutes = Router();
publicReviewRoutes.use(publicRateLimiter);
publicReviewRoutes.get(
  '/',
  wrap((req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
    return reviewsService.publicList({ source: req.query.source, limit: req.query.limit });
  })
);

export const adminReviewRoutes = Router();
adminReviewRoutes.use(requireAuth);
adminReviewRoutes.get('/', requireScope(SafariScope.READ), wrap(() => reviewsService.adminList()));
adminReviewRoutes.post('/', requireScope(SafariScope.WRITE), wrap((req) => reviewsService.create(req.body || {}, req.auth)));
adminReviewRoutes.post('/import', requireScope(SafariScope.WRITE), wrap((req) => reviewsService.importPasted(req.body || {}, req.auth)));
adminReviewRoutes.post(
  '/sync',
  requireScope(SafariScope.WRITE),
  wrap((req) => (req.body?.source ? syncSource(req.body.source) : syncAllSources({ reason: 'manual' })))
);
adminReviewRoutes.put('/settings', requireStaffAdmin(), wrap((req) => reviewsService.saveSettings(req.body || {}, req.auth)));
adminReviewRoutes.patch('/:id', requireScope(SafariScope.WRITE), wrap((req) => reviewsService.update(req.params.id, req.body || {}, req.auth)));
adminReviewRoutes.delete('/:id', requireScope(SafariScope.DELETE), wrap((req) => reviewsService.remove(req.params.id, req.auth)));

export { reviewsService };
