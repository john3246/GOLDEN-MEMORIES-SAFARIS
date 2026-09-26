/**
 * Encrypt secrets saved from the CMS (SMTP password, webhook signing secrets,
 * third-party API keys) with AES-256-GCM before they are written to the
 * database, so a database dump alone does not reveal them.
 *
 * Key order: APP_ENCRYPTION_KEY → JWT_SECRET (if strong) → a random key kept
 * in the CMS store (still better than plaintext; set APP_ENCRYPTION_KEY in
 * production).
 */
import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { readStore, updateStore } from '../cms-store/index.js';

const PREFIX = 'enc:v1:';
let cachedKey = null;

async function key() {
  if (cachedKey) return cachedKey;
  const configured = process.env.APP_ENCRYPTION_KEY || (!config.auth.jwtSecretIsEphemeral ? config.auth.jwtSecret : '');
  if (configured) {
    cachedKey = crypto.createHash('sha256').update(`gm-safaris:${configured}`).digest();
    return cachedKey;
  }
  const store = await readStore();
  let stored = store.meta?.appKey;
  if (!stored) {
    stored = crypto.randomBytes(32).toString('base64');
    await updateStore((next) => {
      next.meta = { ...(next.meta || {}), appKey: next.meta?.appKey || stored };
      stored = next.meta.appKey;
    });
  }
  cachedKey = Buffer.from(stored, 'base64');
  return cachedKey;
}

export function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

export async function encryptSecret(plain) {
  const text = String(plain ?? '');
  if (!text) return '';
  if (isEncrypted(text)) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', await key(), iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${Buffer.concat([iv, tag, data]).toString('base64')}`;
}

export async function decryptSecret(value) {
  if (!value) return '';
  if (!isEncrypted(value)) return String(value);
  try {
    const raw = Buffer.from(String(value).slice(PREFIX.length), 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', await key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return '';
  }
}

export function maskSecret(value) {
  return value ? '••••••••' : '';
}
