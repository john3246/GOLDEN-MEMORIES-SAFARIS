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
    },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
}

/**
 * @param {string} token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.auth.jwtSecret);
  } catch {
    throw unauthorized('Invalid or expired session');
  }
}
