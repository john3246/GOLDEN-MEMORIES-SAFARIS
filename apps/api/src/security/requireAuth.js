import { CmsRoleScopes } from '@gm-safaris/shared-types';
import { forbidden, unauthorized } from '../errors/index.js';
import { verifyAccessToken } from './jwt.js';

/**
 * Every admin request must carry a valid CMS session token.
 *
 * The token alone is not trusted for long: the account is re-checked
 * (short cache) so that disabling a user, changing their role, or changing
 * their password takes effect immediately instead of when the token expires.
 */

const CACHE_MS = 15_000;
/** @type {Map<string, { at: number, user: any }>} */
const authCache = new Map();
let userLookup = null;

async function lookupUser(id) {
  if (!userLookup) {
    const mod = await import('../modules/users/users.repository.js');
    userLookup = (userId) => mod.usersRepository.findById(userId);
  }
  const hit = authCache.get(id);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.user;
  const user = await userLookup(id);
  authCache.set(id, { at: Date.now(), user });
  if (authCache.size > 500) authCache.delete(authCache.keys().next().value);
  return user;
}

export function invalidateAuthCache(userId) {
  if (userId) authCache.delete(userId);
  else authCache.clear();
}

function bearerToken(req) {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    if (token && token !== 'null' && token !== 'undefined') return token;
  }
  return null;
}

/**
 * Resolve the signed-in staff member for this request (or throw 401).
 * @param {import('express').Request} req
 */
export async function authenticateRequest(req) {
  const token = bearerToken(req);
  if (!token) throw unauthorized('Sign in required');
  const payload = verifyAccessToken(token);
  const user = await lookupUser(payload.sub);
  if (!user) throw unauthorized('Session is no longer valid. Please sign in again.');
  if (user.status === 'disabled') throw unauthorized('This account is disabled');
  if (Number(user.tokenVersion || 0) !== Number(payload.tv || 0)) {
    throw unauthorized('Your session has ended. Please sign in again.');
  }
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name || '',
    scopes: [...(CmsRoleScopes[user.role] || [])],
  };
}

export async function requireAuth(req, _res, next) {
  try {
    req.auth = await authenticateRequest(req);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireScope(...scopes) {
  return (req, _res, next) => {
    if (!req.auth) {
      next(unauthorized('Sign in required'));
      return;
    }
    const hasAll = scopes.every((scope) => req.auth.scopes.includes(scope));
    if (!hasAll) {
      next(forbidden('Your role does not allow this action'));
      return;
    }
    next();
  };
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth) {
      next(unauthorized('Sign in required'));
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(forbidden('Your role does not allow this action'));
      return;
    }
    next();
  };
}

export const STAFF_ADMIN_ROLES = Object.freeze(['Admin', 'Super Admin']);

export function requireStaffAdmin() {
  return requireRole(...STAFF_ADMIN_ROLES);
}
