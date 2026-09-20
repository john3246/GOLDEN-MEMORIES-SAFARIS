import { notFound } from '../../errors/index.js';
import { contentService } from '../content/content.service.js';
import { safarisService } from '../safaris/safaris.service.js';
import { settingsService } from '../settings/settings.service.js';

const CONTENT_PATHS = Object.freeze({
  destinations: { type: 'destinations', path: '/destinations' },
  blogs: { type: 'posts', path: '/blogs' },
  posts: { type: 'posts', path: '/blogs' },
  'join-safaris': { type: 'departures', path: '/join-safaris' },
  departures: { type: 'departures', path: '/join-safaris' },
  pages: { type: 'pages', path: '/pages' },
  menus: { type: 'menus', path: '/menus' },
  faqs: { type: 'faqs', path: '/faqs' },
  lodges: { type: 'lodges', path: '/lodges' },
  testimonials: { type: 'testimonials', path: '/testimonials' },
  reviews: { type: 'testimonials', path: '/testimonials' },
});

/**
 * External API service — read-only published content for trusted consumers (.co.tz).
 * This service must never call write repositories.
 */
export const externalApiService = {
  async listSafaris(query) {
    return safarisService.listPublic(query);
  },

  async getSafariBySlug(slug) {
    return safarisService.getPublicBySlug(slug);
  },

  async getSafariById(id) {
    return safarisService.getPublicById(id);
  },

  async listTours(query) {
    return safarisService.listPublic(query);
  },

  async getTourBySlug(slug) {
    return safarisService.getPublicBySlug(slug);
  },

  async listCollection(key) {
    const spec = CONTENT_PATHS[key];
    if (!spec) throw notFound('Unknown collection');
    return contentService.listPublic(spec.type);
  },

  async getCollectionBySlug(key, slug) {
    const spec = CONTENT_PATHS[key];
    if (!spec) throw notFound('Unknown collection');
    return contentService.getPublicBySlug(spec.type, slug);
  },

  async getSettings() {
    return settingsService.getPublic();
  },

  async getCatalog() {
    const safaris = await safarisService.listPublic({ limit: 1, page: 1 });
    const collections = {
      safaris: { path: '/safaris', total: safaris.meta.total },
      tours: { path: '/tours', total: safaris.meta.total, aliasOf: '/safaris' },
    };
    for (const [key, spec] of Object.entries(CONTENT_PATHS)) {
      if (key === 'posts' || key === 'departures' || key === 'reviews') continue;
      const result = await contentService.listPublic(spec.type);
      collections[key] = { path: spec.path, total: result.meta.total };
    }
    collections.settings = { path: '/settings', total: 1 };
    return {
      api: 'external',
      version: 'v1',
      mode: 'read-only',
      collections,
    };
  },

  async getStatus() {
    const catalog = await this.getCatalog();
    return {
      api: 'external',
      version: 'v1',
      mode: 'read-only',
      status: 'ok',
      message: 'External API is online. Published website content is available under /catalog.',
      collections: catalog.collections,
    };
  },
};
