import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/index.js';

/**
 * Baseline security headers. CSP is tightened per surface in later phases
 * once static asset hosts and CMS URLs are finalized.
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: config.isProduction
      ? { maxAge: 15552000, includeSubDomains: true, preload: false }
      : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

/**
 * Build a CORS middleware for an explicit origin allowlist.
 * CORS is not authentication — API keys / JWT still required where configured.
 *
 * @param {string[]} allowedOrigins
 */
export function createCors(allowedOrigins) {
  const allowSet = new Set(
    [...allowedOrigins, process.env.RENDER_EXTERNAL_URL, process.env.PUBLIC_SITE_URL].filter(Boolean)
  );

  return cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin header) — auth still enforced separately
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowSet.has(origin)) {
        callback(null, true);
        return;
      }
      if (config.isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    maxAge: 600,
  });
}

export const cmsCors = () => createCors(config.cors.cms);
export const websiteCors = () => createCors(config.cors.website);
export const externalCors = () => createCors(config.cors.external);
