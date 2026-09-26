import { Router } from 'express';
import { Permission } from '@gm-safaris/shared-types';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { usersController } from './users.controller.js';

export const adminUserRoutes = Router();
adminUserRoutes.use(requireAuth);
adminUserRoutes.patch('/me', usersController.updateSelf);
adminUserRoutes.get('/', requireScope(Permission.USERS_READ), usersController.list);
adminUserRoutes.post('/', requireScope(Permission.USERS_WRITE), usersController.create);
adminUserRoutes.patch('/:id', requireScope(Permission.USERS_WRITE), usersController.update);
adminUserRoutes.delete('/:id', requireScope(Permission.USERS_DELETE), usersController.remove);

export default adminUserRoutes;
