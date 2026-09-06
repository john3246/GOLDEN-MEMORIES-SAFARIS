import { Router } from 'express';
import { requireExternalApiKey } from '../../security/index.js';
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

// Content routes stubbed — return NOT_IMPLEMENTED until domain modules land
router.get('/tours', externalApiController.listTours);
router.get('/tours/:slug', externalApiController.getTourBySlug);
router.get('/destinations', externalApiController.listDestinations);

export default router;
