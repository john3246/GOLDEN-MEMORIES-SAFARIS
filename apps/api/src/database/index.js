/**
 * Database access layer placeholder.
 * Phase 2–3: connection pool, migrations runner hooks, health probe.
 * Controllers must never import this for ad-hoc SQL — use repositories only.
 */

export const database = {
  ready: false,
  /**
   * @returns {Promise<{ status: 'up' | 'down' | 'not_configured'; message: string }>}
   */
  async healthCheck() {
    return {
      status: 'not_configured',
      message: 'PostgreSQL pool not initialized (Phase 2)',
    };
  },
};
