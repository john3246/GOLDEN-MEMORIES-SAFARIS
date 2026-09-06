import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/index.js';

/**
 * Baseline security headers. CSP is tightened per surface in later phases
 * once static asset hosts and CMS URLs are finalized.
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: config.isProduction
      ? undefined
      : false,
    crossOriginEmbedderPolicy: false,
  });
}

/**
 * Build a CORS middleware for an explicit origin allowlist.
 * CORS is not authentication — API keys / JWT still required where configured.
 *
 * @param {string[]} allowedOrigins
 */
export function createCors(allowedOrigins) {
  const allowSet = new Set(allowedOrigins);

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
      callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    maxAge: 600,
  });
}

export const cmsCors = () => createCors(config.cors.cms);
export const websiteCors = () => createCors(config.cors.website);
export const externalCors = () => createCors(config.cors.external);
