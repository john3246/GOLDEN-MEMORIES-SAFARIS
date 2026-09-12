import { safarisService } from './safaris.service.js';

function collection(res, result, status = 200) {
  return res.status(status).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export const publicSafarisController = {
  async list(req, res, next) {
    try {
      const result = await safarisService.listPublic(req.query);
      collection(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await safarisService.getPublicById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await safarisService.getPublicBySlug(req.params.slug);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

export const adminSafarisController = {
  async list(req, res, next) {
    try {
      collection(res, await safarisService.listAdmin(req.query));
    } catch (err) {
      next(err);
    }
  },

  async get(req, res, next) {
    try {
      res.json({ success: true, data: await safarisService.getAdmin(req.params.id) });
    } catch (err) {
      next(err);
    }
  },

  async preview(req, res, next) {
    try {
      res.json({ success: true, data: await safarisService.preview(req.params.id) });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const data = await safarisService.create(req.body || {}, req.auth);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const data = await safarisService.update(req.params.id, req.body || {}, req.auth);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async publish(req, res, next) {
    try {
      res.json({ success: true, data: await safarisService.publish(req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },

  async unpublish(req, res, next) {
    try {
      res.json({ success: true, data: await safarisService.unpublish(req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },

  async archive(req, res, next) {
    try {
      res.json({ success: true, data: await safarisService.archive(req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },

  async restore(req, res, next) {
    try {
      res.json({ success: true, data: await safarisService.restore(req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },

  async duplicate(req, res, next) {
    try {
      const data = await safarisService.duplicate(req.params.id, req.auth);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      res.json({ success: true, data: await safarisService.remove(req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },
};
