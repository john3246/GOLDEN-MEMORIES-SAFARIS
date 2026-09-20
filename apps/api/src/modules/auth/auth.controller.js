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

  async forgotPassword(req, res, next) {
    try {
      const data = await authService.forgotPassword(req.body?.email);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const data = await authService.resetPassword(req.body?.token, req.body?.password);
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
