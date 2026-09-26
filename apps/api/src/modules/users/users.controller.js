import { usersService } from './users.service.js';

function wrap(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
}

export const usersController = {
  list: wrap(async (_req, res) => {
    res.json({ success: true, ...(await usersService.list()) });
  }),
  create: wrap(async (req, res) => {
    res.status(201).json({ success: true, data: await usersService.create(req.body, req.auth) });
  }),
  update: wrap(async (req, res) => {
    res.json({ success: true, data: await usersService.update(req.params.id, req.body, req.auth) });
  }),
  remove: wrap(async (req, res) => {
    res.json({ success: true, data: await usersService.remove(req.params.id, req.auth) });
  }),
  updateSelf: wrap(async (req, res) => {
    res.json({ success: true, data: await usersService.updateSelf(req.auth, req.body || {}) });
  }),
};
