import { notImplemented } from '../../errors/index.js';

/**
 * External API service — read-only published content for trusted consumers (.co.tz).
 * Domain modules (tours, destinations, …) will be wired in Phase 6+.
 * This service must never call write repositories.
 */
export const externalApiService = {
  async listTours() {
    throw notImplemented('External tours list will be available after the Tours module (Phase 6)');
  },

  async getTourBySlug(_slug) {
    throw notImplemented('External tour detail will be available after the Tours module (Phase 6)');
  },

  async listDestinations() {
    throw notImplemented(
      'External destinations list will be available after the Destinations module (Phase 7)'
    );
  },

  async getStatus() {
    return {
      api: 'external',
      version: 'v1',
      mode: 'read-only',
      status: 'foundation',
      message:
        'External API foundation is online. Content endpoints will be enabled as domain modules ship.',
    };
  },
};
