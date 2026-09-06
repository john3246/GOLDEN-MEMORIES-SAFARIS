/**
 * Redis cache layer placeholder.
 * Redis is never the source of truth. Invalidation must follow PostgreSQL writes.
 */

export const cache = {
  ready: false,
  /**
   * @returns {Promise<{ status: 'up' | 'down' | 'not_configured'; message: string }>}
   */
  async healthCheck() {
    return {
      status: 'not_configured',
      message: 'Redis client not initialized (Phase 3)',
    };
  },
};
