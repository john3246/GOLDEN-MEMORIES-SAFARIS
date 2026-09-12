import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { apiClientsService } from './api-clients.service.js';

const router = Router();
router.use(requireAuth, requireScope(SafariScope.API_CLIENTS));

router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, data: await apiClientsService.list() });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await apiClientsService.create(req.body || {}, req.auth);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/revoke', async (req, res, next) => {
  try {
    const data = await apiClientsService.revoke(req.params.id, req.auth);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/rotate', async (req, res, next) => {
  try {
    const data = await apiClientsService.rotate(req.params.id, req.auth);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export const apiClientRoutes = router;
export { apiClientsService };
export const moduleStatus = 'active';
