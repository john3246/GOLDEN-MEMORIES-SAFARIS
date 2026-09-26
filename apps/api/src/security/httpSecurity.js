import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/index.js';

function extraSources(name) {
  return String(process.env[name] || '')
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Security headers for every response.
 *
 * Content-Security-Policy only allows scripts from this site, so even if a
 * piece of injected text slipped through, it could not run JavaScript.
 * External sources are limited to Google Fonts, Google Maps / YouTube / Vimeo
 * embeds, and https images (CMS photos can be hosted anywhere).
 */
export function securityHeaders() {
  const apiOrigin = (() => {
    try {
      return new URL(config.apiBaseUrl).origin;
    } catch {
      return null;
    }
  })();
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", ...extraSources('CSP_SCRIPT_SRC')],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        mediaSrc: ["'self'", 'blob:', 'https:'],
        connectSrc: ["'self'", ...(apiOrigin ? [apiOrigin] : []), ...extraSources('CSP_CONNECT_SRC')],
        frameSrc: [
          "'self'",
          'https://www.google.com',
          'https://maps.google.com',
          'https://www.youtube.com',
          'https://www.youtube-nocookie.com',
          'https://player.vimeo.com',
          'https://www.openstreetmap.org',
          ...extraSources('CSP_FRAME_SRC'),
        ],
        frameAncestors: ["'self'"],
        formAction: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        ...(config.isProduction ? { upgradeInsecureRequests: [] } : {}),
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: config.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: false } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'sameorigin' },
  });
}

/**
 * Production only: send visitors to the one canonical address
 * (e.g. http://gmsafaris.com/x → https://www.gmsafaris.com/x) so Google does
 * not index duplicate copies. Set CANONICAL_HOST=www.gmsafaris.com to enable.
 */
export function canonicalHostRedirect() {
  const host = String(process.env.CANONICAL_HOST || '').trim().toLowerCase();
  return (req, res, next) => {
    if (!config.isProduction || !host) return next();
    if (req.path.startsWith('/health') || req.path.startsWith('/api/')) return next();
    const currentHost = String(req.get('host') || '').toLowerCase();
    const proto = req.get('x-forwarded-proto') || req.protocol;
    if (currentHost === host && proto === 'https') return next();
    if (!currentHost.endsWith(host.replace(/^www\./, ''))) return next();
    res.redirect(301, `https://${host}${req.originalUrl}`);
  };
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
      if (!config.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
        return;
      }
      // Unknown origin: respond without CORS headers (browser blocks it) instead of a 500.
      callback(null, false);
    },
    credentials: false,
    maxAge: 600,
  });
}

export const cmsCors = () => createCors(config.cors.cms);
export const websiteCors = () => createCors(config.cors.website);
export const externalCors = () => createCors(config.cors.external);
