/**
 * Shared pure utilities — no I/O, no Express, no database.
 */

/**
 * Generate a correlation / request ID suitable for logs and responses.
 * Prefer crypto.randomUUID when available (Node 20+).
 * @returns {string}
 */
export function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `req_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Pick only allowed keys from an object (DTO shaping helper).
 * @template {Record<string, unknown>} T
 * @param {T} source
 * @param {readonly (keyof T)[]} keys
 * @returns {Partial<T>}
 */
export function pick(source, keys) {
  /** @type {Partial<T>} */
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Omit keys from an object (never leak sensitive fields in responses).
 * @param {Record<string, unknown>} source
 * @param {readonly string[]} keys
 * @returns {Record<string, unknown>}
 */
export function omit(source, keys) {
  const skip = new Set(keys);
  /** @type {Record<string, unknown>} */
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    if (!skip.has(key)) result[key] = value;
  }
  return result;
}

/**
 * Sleep helper for tests / retry backoff (not for production request handlers).
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * URL-safe slug from a title. Does not guarantee uniqueness.
 * @param {unknown} value
 * @returns {string}
 */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Create a stable UUID (v4).
 * @returns {string}
 */
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
