import { CmsRoleScopes } from '@gm-safaris/shared-types';
import { config } from '../config/index.js';
import { forbidden, unauthorized } from '../errors/index.js';
import { verifyAccessToken } from './jwt.js';

/** Used when no JWT is sent in local/dev only. Production requires login. */
export const LOCAL_CMS_USER = Object.freeze({
  userId: 'local-dev',
  email: 'local@gmsafaris.com',
  role: 'Admin',
  name: 'Local editor',
  scopes: [...CmsRoleScopes.Admin],
});

function bearerToken(req) {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

export function requireAuth(req, _res, next) {
  try {
    const token = bearerToken(req);
    if (!token) {
      if (!config.isProduction) {
        req.auth = { ...LOCAL_CMS_USER };
        next();
        return;
      }
      next(unauthorized('Sign in required'));
      return;
    }
    const payload = verifyAccessToken(token);
    const role = payload.role;
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role,
      name: payload.name || '',
      scopes: [...(CmsRoleScopes[role] || [])],
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireScope(...scopes) {
  return (req, _res, next) => {
    if (!req.auth) {
      if (!config.isProduction) {
        req.auth = { ...LOCAL_CMS_USER };
      } else {
        next(unauthorized('Sign in required'));
        return;
      }
    }
    const hasAll = scopes.every((scope) => req.auth.scopes.includes(scope));
    if (!hasAll) {
      next(forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth) {
      if (!config.isProduction) {
        req.auth = { ...LOCAL_CMS_USER };
      } else {
        next(unauthorized('Sign in required'));
        return;
      }
    }
    if (!roles.includes(req.auth.role)) {
      next(forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
}

export const STAFF_ADMIN_ROLES = Object.freeze(['Admin', 'Super Admin']);

export function requireStaffAdmin() {
  return requireRole(...STAFF_ADMIN_ROLES);
}
