import { notImplemented } from '../../errors/index.js';
import { safarisService } from '../safaris/safaris.service.js';

/**
 * External API service — read-only published content for trusted consumers (.co.tz).
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

  async listSafaris(query) {
    return safarisService.listPublic(query);
  },

  async getSafariBySlug(slug) {
    return safarisService.getPublicBySlug(slug);
  },

  async getSafariById(id) {
    return safarisService.getPublicById(id);
  },

  async getStatus() {
    return {
      api: 'external',
      version: 'v1',
      mode: 'read-only',
      status: 'ok',
      message: 'External API is online. Safari packages are available at /safaris.',
    };
  },
};
