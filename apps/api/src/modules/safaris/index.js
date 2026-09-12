import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { publicRateLimiter } from '../../middleware/index.js';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { publicSafarisController, adminSafarisController } from './safaris.controller.js';

export const publicSafariRoutes = Router();
publicSafariRoutes.use(publicRateLimiter);
publicSafariRoutes.get('/', publicSafarisController.list);
publicSafariRoutes.get('/slug/:slug', publicSafarisController.getBySlug);
publicSafariRoutes.get('/:id', publicSafarisController.getById);

export const adminSafariRoutes = Router();
adminSafariRoutes.use(requireAuth);
adminSafariRoutes.get('/', requireScope(SafariScope.READ), adminSafarisController.list);
adminSafariRoutes.post('/', requireScope(SafariScope.WRITE), adminSafarisController.create);
adminSafariRoutes.get('/:id', requireScope(SafariScope.READ), adminSafarisController.get);
adminSafariRoutes.get('/:id/preview', requireScope(SafariScope.READ), adminSafarisController.preview);
adminSafariRoutes.patch('/:id', requireScope(SafariScope.WRITE), adminSafarisController.update);
adminSafariRoutes.put('/:id', requireScope(SafariScope.WRITE), adminSafarisController.update);
adminSafariRoutes.delete('/:id', requireScope(SafariScope.DELETE), adminSafarisController.remove);
adminSafariRoutes.post('/:id/publish', requireScope(SafariScope.PUBLISH), adminSafarisController.publish);
adminSafariRoutes.post('/:id/unpublish', requireScope(SafariScope.PUBLISH), adminSafarisController.unpublish);
adminSafariRoutes.post('/:id/archive', requireScope(SafariScope.WRITE), adminSafarisController.archive);
adminSafariRoutes.post('/:id/restore', requireScope(SafariScope.WRITE), adminSafarisController.restore);
adminSafariRoutes.post('/:id/duplicate', requireScope(SafariScope.WRITE), adminSafarisController.duplicate);

export { safarisService } from './safaris.service.js';
export { seedSafariPackages } from './safaris.seed.js';
export const moduleStatus = 'active';
