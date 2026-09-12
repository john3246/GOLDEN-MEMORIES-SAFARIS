import { authService } from './auth.service.js';

export const authController = {
  async login(req, res, next) {
    try {
      const data = await authService.login(req.body?.email, req.body?.password);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const data = await authService.me(req.auth.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
