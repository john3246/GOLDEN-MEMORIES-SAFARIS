import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ErrorCodes } from '../errors/index.js';

const relax = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

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
  max: relax ? 10_000 : config.rateLimits.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

export const publicRateLimiter = rateLimit({
  windowMs: config.rateLimits.public.windowMs,
  max: relax ? 10_000 : config.rateLimits.public.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

export const adminRateLimiter = rateLimit({
  windowMs: config.rateLimits.admin.windowMs,
  max: relax ? 10_000 : config.rateLimits.admin.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

export const externalApiRateLimiter = rateLimit({
  windowMs: config.externalApi.rateLimitWindowMs,
  max: relax ? 10_000 : config.externalApi.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

/** Isolated limiter for tests that must observe 429. */
export function createTestRateLimiter(max = 2) {
  return rateLimit({
    windowMs: 60_000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
  });
}
