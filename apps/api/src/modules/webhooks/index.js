import { Router } from 'express';
import { SafariScope } from '@gm-safaris/shared-types';
import { requireAuth, requireScope } from '../../security/requireAuth.js';
import { webhooksService } from './webhooks.service.js';

function wrap(fn) {
  return async (req, res, next) => {
    try {
      res.json({ success: true, data: await fn(req) });
    } catch (err) {
      next(err);
    }
  };
}

export const adminWebhookRoutes = Router();
adminWebhookRoutes.use(requireAuth, requireScope(SafariScope.API_CLIENTS));
adminWebhookRoutes.get('/events', wrap(() => webhooksService.events()));
adminWebhookRoutes.get('/', wrap(() => webhooksService.list()));
adminWebhookRoutes.post('/', wrap((req) => webhooksService.create(req.body || {}, req.auth)));
adminWebhookRoutes.get('/deliveries', wrap(() => webhooksService.deliveries()));
adminWebhookRoutes.post('/deliveries/:deliveryId/retry', wrap((req) => webhooksService.retry(req.params.deliveryId)));
adminWebhookRoutes.patch('/:id', wrap((req) => webhooksService.update(req.params.id, req.body || {}, req.auth)));
adminWebhookRoutes.delete('/:id', wrap((req) => webhooksService.remove(req.params.id, req.auth)));
adminWebhookRoutes.post('/:id/test', wrap((req) => webhooksService.test(req.params.id, req.auth)));
adminWebhookRoutes.get('/:id/deliveries', wrap((req) => webhooksService.deliveries(req.params.id)));

export { emitEvent, WEBHOOK_EVENTS } from './webhooks.service.js';
