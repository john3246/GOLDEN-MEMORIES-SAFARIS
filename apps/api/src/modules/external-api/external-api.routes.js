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

router.get('/safaris', requireExternalScope(SafariScope.READ), externalApiController.listSafaris);
router.get('/safaris/slug/:slug', requireExternalScope(SafariScope.READ), externalApiController.getSafariBySlug);
router.get('/safaris/:id', requireExternalScope(SafariScope.READ), externalApiController.getSafariById);

router.get('/tours', externalApiController.listTours);
router.get('/tours/:slug', externalApiController.getTourBySlug);
router.get('/destinations', externalApiController.listDestinations);

export default router;
