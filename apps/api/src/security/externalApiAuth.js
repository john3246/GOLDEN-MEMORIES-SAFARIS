import { unauthorized } from '../errors/index.js';

/**
 * Resolve external API keys from the environment at request time (Phase 1).
 * Allows rotation without relying solely on boot-time config snapshots.
 * Later phases: hashed keys in PostgreSQL with revocation metadata.
 * @returns {string[]}
 */
function resolveExternalApiKeys() {
  const raw = process.env.EXTERNAL_API_KEYS;
  if (!raw || !String(raw).trim()) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Phase 1 external API key gate (read-only surface).
 *
 * Expects: Authorization: Bearer <api_key>  OR  X-Api-Key: <api_key>
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function requireExternalApiKey(req, _res, next) {
  const configured = resolveExternalApiKeys();
  if (!configured.length) {
    return next(
      unauthorized('External API is not configured. Set EXTERNAL_API_KEYS in the environment.')
    );
  }

  const headerKey = req.get('x-api-key');
  const auth = req.get('authorization');
  let provided = headerKey || null;

  if (!provided && auth?.startsWith('Bearer ')) {
    provided = auth.slice('Bearer '.length).trim();
  }

  if (!provided || !configured.includes(provided)) {
    return next(unauthorized('Invalid or missing API key'));
  }

  req.externalApi = {
    authenticated: true,
    /** Permissions granted to external consumers — read-only by design */
    permissions: [
      'content:tours:read',
      'content:destinations:read',
      'content:pages:read',
      'content:blog:read',
      'content:testimonials:read',
      'content:navigation:read',
      'content:site-settings:read',
    ],
  };

  next();
}
