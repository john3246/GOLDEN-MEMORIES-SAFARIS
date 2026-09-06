import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ErrorCodes } from '../errors/index.js';

function jsonRateLimitHandler(req, res) {
  res.status(429).json({
    success: false,
    error: {
      code: ErrorCodes.RATE_LIMITED,
      message: 'Too many requests. Please try again later.',
      ...(req.requestId ? { requestId: req.requestId } : {}),
    },
  });
}

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimits.auth.windowMs,
  max: config.rateLimits.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

export const publicRateLimiter = rateLimit({
  windowMs: config.rateLimits.public.windowMs,
  max: config.rateLimits.public.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

export const adminRateLimiter = rateLimit({
  windowMs: config.rateLimits.admin.windowMs,
  max: config.rateLimits.admin.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

export const externalApiRateLimiter = rateLimit({
  windowMs: config.externalApi.rateLimitWindowMs,
  max: config.externalApi.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});
