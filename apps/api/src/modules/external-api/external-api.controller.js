import { externalApiService } from './external-api.service.js';
import { sendSuccess, sendCollection } from './external-api.response.js';

/**
 * HTTP adapter only — no SQL, no Redis, no business rules beyond calling the service.
 */
export const externalApiController = {
  async getStatus(req, res, next) {
    try {
      sendSuccess(res, await externalApiService.getStatus());
    } catch (err) {
      next(err);
    }
  },

  async getCatalog(req, res, next) {
    try {
      sendSuccess(res, await externalApiService.getCatalog());
    } catch (err) {
      next(err);
    }
  },

  async getSettings(req, res, next) {
    try {
      sendSuccess(res, await externalApiService.getSettings());
    } catch (err) {
      next(err);
    }
  },

  async listTours(req, res, next) {
    try {
      const result = await externalApiService.listTours(req.query);
      sendCollection(res, result.data, result.meta);
    } catch (err) {
      next(err);
    }
  },

  async getTourBySlug(req, res, next) {
    try {
      sendSuccess(res, await externalApiService.getTourBySlug(req.params.slug));
    } catch (err) {
      next(err);
    }
  },

  async listSafaris(req, res, next) {
    try {
      const result = await externalApiService.listSafaris(req.query);
      sendCollection(res, result.data, result.meta);
    } catch (err) {
      next(err);
    }
  },

  async getSafariBySlug(req, res, next) {
    try {
      sendSuccess(res, await externalApiService.getSafariBySlug(req.params.slug));
    } catch (err) {
      next(err);
    }
  },

  async getSafariById(req, res, next) {
    try {
      sendSuccess(res, await externalApiService.getSafariById(req.params.id));
    } catch (err) {
      next(err);
    }
  },

  async listCollection(req, res, next) {
    try {
      const result = await externalApiService.listCollection(req.params.type);
      sendCollection(res, result.data, result.meta);
    } catch (err) {
      next(err);
    }
  },

  async getCollectionBySlug(req, res, next) {
    try {
      sendSuccess(res, await externalApiService.getCollectionBySlug(req.params.type, req.params.slug));
    } catch (err) {
      next(err);
    }
  },
};
