import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { requireExternalApiKey, requireExternalScope } from '../../security/index.js';
import { externalApiRateLimiter } from '../../middleware/index.js';
import { externalApiController } from './external-api.controller.js';

/**
 * External read-only API for trusted consumers (gmsafaris.co.tz).
 * Namespace: /api/v1/external
 *
 * Write methods (POST/PUT/PATCH/DELETE) are intentionally not registered.
 */
const router = Router();

router.use(externalApiRateLimiter);
router.use(requireExternalApiKey);

router.get('/status', externalApiController.getStatus);
router.get('/catalog', requireExternalScope(SafariScope.READ), externalApiController.getCatalog);
router.get('/settings', requireExternalScope(SafariScope.READ), externalApiController.getSettings);

router.get('/safaris', requireExternalScope(SafariScope.READ), externalApiController.listSafaris);
router.get('/safaris/slug/:slug', requireExternalScope(SafariScope.READ), externalApiController.getSafariBySlug);
router.get('/safaris/:id', requireExternalScope(SafariScope.READ), externalApiController.getSafariById);

router.get('/tours', requireExternalScope(SafariScope.READ), externalApiController.listTours);
router.get('/tours/:slug', requireExternalScope(SafariScope.READ), externalApiController.getTourBySlug);

const collections = [
  'destinations',
  'blogs',
  'posts',
  'join-safaris',
  'departures',
  'pages',
  'menus',
  'faqs',
  'lodges',
  'testimonials',
  'reviews',
];

for (const type of collections) {
  router.get(`/${type}`, requireExternalScope(SafariScope.READ), (req, res, next) => {
    req.params.type = type;
    return externalApiController.listCollection(req, res, next);
  });
  router.get(`/${type}/slug/:slug`, requireExternalScope(SafariScope.READ), (req, res, next) => {
    req.params.type = type;
    return externalApiController.getCollectionBySlug(req, res, next);
  });
}

export default router;
