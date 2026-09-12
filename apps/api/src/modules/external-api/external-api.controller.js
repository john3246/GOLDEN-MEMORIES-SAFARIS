import { externalApiService } from './external-api.service.js';
import { sendSuccess, sendCollection } from './external-api.response.js';

/**
 * HTTP adapter only — no SQL, no Redis, no business rules beyond calling the service.
 */
export const externalApiController = {
  async getStatus(req, res, next) {
    try {
      const data = await externalApiService.getStatus();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async listTours(req, res, next) {
    try {
      const data = await externalApiService.listTours();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getTourBySlug(req, res, next) {
    try {
      const data = await externalApiService.getTourBySlug(req.params.slug);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async listDestinations(req, res, next) {
    try {
      const data = await externalApiService.listDestinations();
      sendSuccess(res, data);
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
      const data = await externalApiService.getSafariBySlug(req.params.slug);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getSafariById(req, res, next) {
    try {
      const data = await externalApiService.getSafariById(req.params.id);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};
