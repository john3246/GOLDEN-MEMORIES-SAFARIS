import { unauthorized, forbidden } from '../errors/index.js';
import { apiClientsService } from '../modules/api-clients/index.js';
import { SafariScope, ExternalPermission } from '@gm-safaris/shared-types';

function presentedKey(req) {
  const headerKey = req.get('x-api-key');
  const auth = req.get('authorization');
  let provided = headerKey || null;
  if (!provided && auth?.startsWith('Bearer ')) {
    provided = auth.slice('Bearer '.length).trim();
  }
  return provided;
}

function envKeys() {
  const raw = process.env.EXTERNAL_API_KEYS;
  if (!raw || !String(raw).trim()) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const ENV_PERMISSIONS = Object.freeze([
  ExternalPermission.TOURS_READ,
  ExternalPermission.DESTINATIONS_READ,
  ExternalPermission.PAGES_READ,
  ExternalPermission.BLOG_READ,
  ExternalPermission.TESTIMONIALS_READ,
  ExternalPermission.NAVIGATION_READ,
  ExternalPermission.SITE_SETTINGS_READ,
  SafariScope.READ,
]);

/**
 * External / third-party API key gate.
 * Hashed CMS-issued keys take precedence; Phase 1 env keys remain as a fallback.
 */
export async function requireExternalApiKey(req, _res, next) {
  try {
    const provided = presentedKey(req);
    if (!provided) {
      next(unauthorized('Invalid or missing API key'));
      return;
    }

    try {
      const client = await apiClientsService.authenticate(provided);
      req.externalApi = {
        authenticated: true,
        clientId: client.id,
        name: client.name,
        permissions: client.scopes,
      };
      next();
      return;
    } catch {
      // Fall through to env keys
    }

    const configured = envKeys();
    if (configured.includes(provided)) {
      req.externalApi = {
        authenticated: true,
        clientId: 'env',
        permissions: [...ENV_PERMISSIONS],
      };
      next();
      return;
    }

    next(unauthorized('Invalid or missing API key'));
  } catch (err) {
    next(err);
  }
}

export function requireExternalScope(scope) {
  return (req, _res, next) => {
    const permissions = req.externalApi?.permissions || [];
    if (!permissions.includes(scope)) {
      next(forbidden('API key is missing the required scope'));
      return;
    }
    next();
  };
}
