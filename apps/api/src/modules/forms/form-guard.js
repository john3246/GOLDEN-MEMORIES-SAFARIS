/**
 * Shared protection for public website forms (contact, enquiry, booking).
 *
 * - strips HTML / control characters and caps every field length
 * - validates email and phone
 * - honeypot field: bots that fill the hidden "website" field are silently dropped
 * - minimum fill time: forms submitted < 2.5 s after render are treated as bots
 * - link-stuffed messages are flagged as spam (kept, but not emailed)
 * - identical submissions within 2 minutes are ignored (double clicks, retries)
 */
import crypto from 'node:crypto';
import { validationError } from '../../errors/index.js';

const recent = new Map();
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

export function cleanField(value, max = 200) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

export function cleanMultiline(value, max = 5000) {
  return cleanField(value, max).replace(/\n{3,}/g, '\n\n');
}

export function isValidEmail(value) {
  const email = String(value || '').trim();
  return email.length <= 180 && /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[A-Za-z]{2,}$/.test(email);
}

export function cleanEmail(value, { required = true } = {}) {
  const email = String(value || '').trim().toLowerCase();
  if (!email && !required) return '';
  if (!isValidEmail(email)) throw validationError('Please enter a valid email address', { field: 'email' });
  return email;
}

export function cleanPhone(value) {
  const phone = cleanField(value, 40);
  if (phone && !/^[+()\d\s.-]{6,40}$/.test(phone)) {
    throw validationError('Please enter a valid phone number (digits, spaces, + and - only)', { field: 'phone' });
  }
  return phone;
}

/**
 * @returns {{ drop: boolean, spam: boolean, reason?: string }}
 */
export function screenSubmission(body = {}, textForLinks = '') {
  if (String(body.website || body.company_url || body.hp || '').trim()) {
    return { drop: true, spam: true, reason: 'honeypot' };
  }
  const renderedAt = Number(body._ts || body.formStartedAt || 0);
  if (renderedAt && Date.now() - renderedAt < 2500) {
    return { drop: true, spam: true, reason: 'too-fast' };
  }
  const links = (String(textForLinks).match(/https?:\/\/|www\./gi) || []).length;
  if (links > 3) return { drop: false, spam: true, reason: 'links' };
  return { drop: false, spam: false };
}

/** True when the same payload was just submitted (so we do not store/email twice). */
export function isDuplicate(kind, fields) {
  const key = crypto.createHash('sha256').update(`${kind}|${JSON.stringify(fields)}`).digest('hex');
  const now = Date.now();
  for (const [k, at] of recent) if (now - at > DUPLICATE_WINDOW_MS) recent.delete(k);
  if (recent.has(key)) return true;
  recent.set(key, now);
  return false;
}
