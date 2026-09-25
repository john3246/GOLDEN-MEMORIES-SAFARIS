import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { mediaController, mediaUpload, optionalAuth } from './media.controller.js';

export const adminMediaRoutes = Router();
adminMediaRoutes.use(requireAuth, requireScope(SafariScope.MEDIA));
adminMediaRoutes.get('/', mediaController.list);
adminMediaRoutes.get('/library', mediaController.library);
adminMediaRoutes.post('/', mediaUpload.single('file'), mediaController.create);
adminMediaRoutes.delete('/asset', mediaController.removeAsset);
adminMediaRoutes.patch('/:id', mediaController.update);
adminMediaRoutes.delete('/:id', mediaController.remove);

export const publicMediaRoutes = Router();
publicMediaRoutes.get('/:id/file', optionalAuth, mediaController.file);

export const moduleStatus = 'active';
export { mediaService } from './media.service.js';
export { mediaPublicDto } from './media.service.js';
