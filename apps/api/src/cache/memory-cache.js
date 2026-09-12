/**
 * In-memory cache for public Safari reads.
 * Redis remains the production cache target (Phase 3); this adapter is the
 * CMS-safe fallback so publishes can invalidate without a Redis dependency.
 */

const buckets = new Map();

export const memoryCache = {
  ready: true,

  async get(key) {
    const entry = buckets.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      buckets.delete(key);
      return null;
    }
    return entry.value;
  },

  async set(key, value, ttlSeconds = 300) {
    buckets.set(key, {
      value,
      expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0,
    });
  },

  async del(key) {
    buckets.delete(key);
  },

  async invalidatePrefix(prefix) {
    for (const key of buckets.keys()) {
      if (key.startsWith(prefix)) buckets.delete(key);
    }
  },

  reset() {
    buckets.clear();
  },
};
