import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { publicRateLimiter } from '../../middleware/index.js';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { adminContentController, publicContentController } from './content.controller.js';

export const publicContentRoutes = Router();
publicContentRoutes.use(publicRateLimiter);
publicContentRoutes.get('/:type', publicContentController.list);
publicContentRoutes.get('/:type/slug/:slug', publicContentController.getBySlug);

export const adminContentRoutes = Router();
adminContentRoutes.use(requireAuth);
adminContentRoutes.get('/catalog', requireScope(SafariScope.READ), adminContentController.catalog);
adminContentRoutes.get('/overview', requireScope(SafariScope.READ), adminContentController.overview);
adminContentRoutes.get('/:type', requireScope(SafariScope.READ), adminContentController.list);
adminContentRoutes.post('/:type', requireScope(SafariScope.WRITE), adminContentController.create);
adminContentRoutes.get('/:type/:id', requireScope(SafariScope.READ), adminContentController.get);
adminContentRoutes.patch('/:type/:id', requireScope(SafariScope.WRITE), adminContentController.update);
adminContentRoutes.put('/:type/:id', requireScope(SafariScope.WRITE), adminContentController.update);
adminContentRoutes.post('/:type/:id/publish', requireScope(SafariScope.PUBLISH), adminContentController.publish);
adminContentRoutes.post('/:type/:id/unpublish', requireScope(SafariScope.PUBLISH), adminContentController.unpublish);
adminContentRoutes.delete('/:type/:id', requireScope(SafariScope.DELETE), adminContentController.remove);

export { contentService } from './content.service.js';
export { seedSiteContent } from './content.seed.js';
export { upgradeBlogDocuments } from './blog.upgrade.js';
export const moduleStatus = 'active';
