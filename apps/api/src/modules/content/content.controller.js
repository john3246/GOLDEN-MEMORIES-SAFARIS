import { contentService } from './content.service.js';

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
}

export const publicContentController = {
  async list(req, res, next) {
    try {
      const result = await contentService.listPublic(req.params.type);
      noStore(res);
      res.json({ success: true, data: result.data, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },
  async getBySlug(req, res, next) {
    try {
      const data = await contentService.getPublicBySlug(req.params.type, req.params.slug);
      noStore(res);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

export const adminContentController = {
  async catalog(_req, res, next) {
    try {
      res.json({ success: true, data: contentService.catalog() });
    } catch (err) {
      next(err);
    }
  },
  async overview(_req, res, next) {
    try {
      res.json({ success: true, data: await contentService.overview() });
    } catch (err) {
      next(err);
    }
  },
  async list(req, res, next) {
    try {
      const result = await contentService.listAdmin(req.params.type, req.query);
      res.json({ success: true, data: result.data, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },
  async get(req, res, next) {
    try {
      res.json({ success: true, data: await contentService.getAdmin(req.params.type, req.params.id) });
    } catch (err) {
      next(err);
    }
  },
  async create(req, res, next) {
    try {
      const data = await contentService.create(req.params.type, req.body || {}, req.auth);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
  async update(req, res, next) {
    try {
      const data = await contentService.update(req.params.type, req.params.id, req.body || {}, req.auth);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
  async publish(req, res, next) {
    try {
      res.json({ success: true, data: await contentService.publish(req.params.type, req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },
  async unpublish(req, res, next) {
    try {
      res.json({ success: true, data: await contentService.unpublish(req.params.type, req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },
  async remove(req, res, next) {
    try {
      res.json({ success: true, data: await contentService.remove(req.params.type, req.params.id, req.auth) });
    } catch (err) {
      next(err);
    }
  },
};
