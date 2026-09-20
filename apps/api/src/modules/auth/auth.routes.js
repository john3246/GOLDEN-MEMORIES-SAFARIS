import { Router } from 'express';
import { authRateLimiter } from '../../middleware/index.js';
import { requireAuth } from '../../security/requireAuth.js';
import { authController } from './auth.controller.js';

const router = Router();

router.post('/login', authRateLimiter, authController.login);
router.post('/forgot', authRateLimiter, authController.forgotPassword);
router.post('/reset', authRateLimiter, authController.resetPassword);
router.get('/me', requireAuth, authController.me);

export const authRoutes = router;
export default router;
