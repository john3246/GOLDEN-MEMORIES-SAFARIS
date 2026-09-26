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

// Public READ endpoints. One page view used to fire ~10 API calls, so the old
// limit (100/min per IP) blanked CMS content for anyone browsing a few pages.
// Reads are cheap and cached; forms have their own strict limiter below.
export const publicRateLimiter = rateLimit({
  windowMs: config.rateLimits.public.windowMs,
  max: relax ? 10_000 : Math.max(config.rateLimits.public.max, 600),
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

/** Contact / enquiry / booking forms: 8 submissions per 10 minutes per IP. */
export const formRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: relax ? 10_000 : Number(process.env.RATE_LIMIT_FORMS_MAX || 8),
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      success: false,
      error: {
        code: ErrorCodes.RATE_LIMITED,
        message: 'You have sent several messages in a short time. Please wait a few minutes, or email or WhatsApp us directly.',
      },
    });
  },
});

export const adminRateLimiter = rateLimit({
  windowMs: config.rateLimits.admin.windowMs,
  max: relax ? 10_000 : Math.max(config.rateLimits.admin.max, 600),
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
