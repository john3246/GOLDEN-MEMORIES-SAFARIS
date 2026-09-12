/**
 * Redis cache layer placeholder + in-memory adapter used by Safari CMS.
 * Redis is never the source of truth. Invalidation must follow content writes.
 */

export { memoryCache } from './memory-cache.js';

export const cache = {
  ready: false,
  /**
   * @returns {Promise<{ status: 'up' | 'down' | 'not_configured'; message: string }>}
   */
  async healthCheck() {
    return {
      status: 'not_configured',
      message: 'Redis client not initialized (Phase 3). Safari CMS uses in-memory cache.',
    };
  },
};
