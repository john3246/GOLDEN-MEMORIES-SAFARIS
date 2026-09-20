import { usersService } from './users.service.js';

export const usersController = {
  async list(req, res, next) {
    try {
      res.json({ success: true, ...(await usersService.list()) });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      res.status(201).json({ success: true, data: await usersService.create(req.body, req.auth) });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      res.json({ success: true, data: await usersService.update(req.params.id, req.body, req.auth) });
    } catch (err) {
      next(err);
    }
  },
};
