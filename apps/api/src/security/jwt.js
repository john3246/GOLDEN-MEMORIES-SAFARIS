import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { unauthorized } from '../errors/index.js';

/**
 * @param {{ id: string, email: string, role: string, name?: string }} user
 */
export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
      tv: Number(user.tokenVersion || 0),
    },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn, algorithm: 'HS256' }
  );
}

/**
 * @param {string} token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.auth.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw unauthorized('Invalid or expired session');
  }
}
