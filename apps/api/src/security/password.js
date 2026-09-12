import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

export async function hashPassword(plain) {
  return bcrypt.hash(String(plain), config.auth.bcryptRounds);
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false;
  return bcrypt.compare(String(plain), String(hash));
}
