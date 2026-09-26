import path from 'node:path';
import multer from 'multer';
import { config } from '../../config/index.js';
import { validationError } from '../../errors/index.js';
import { mediaService } from './media.service.js';

function actor(req) {
  return req.auth ? { userId: req.auth.userId, email: req.auth.email } : null;
}

// Keep uploads in memory: sharp validates and converts them before anything
// touches the disk, so a non-image never lands in the uploads folder.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.media.maxFileSizeMb * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|avif|heic|heif)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(validationError('Upload a JPG, PNG, WebP or GIF photo.'));
  },
});

export const mediaUpload = {
  single(field) {
    const handler = upload.single(field);
    return (req, res, next) => {
      handler(req, res, (err) => {
        if (err?.code === 'LIMIT_FILE_SIZE') {
          next(validationError(`That photo is larger than ${config.media.maxFileSizeMb} MB. Please resize it and try again.`));
          return;
        }
        next(err);
      });
    };
  },
};

export const mediaController = {
  async list(req, res, next) {
    try {
      const data = await mediaService.list();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async library(_req, res, next) {
    try {
      const data = await mediaService.library();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      let data;
      if (req.file) {
        data = await mediaService.createFromUpload({
          file: req.file,
          alt: req.body?.alt,
          caption: req.body?.caption,
          actor: actor(req),
        });
      } else {
        data = await mediaService.createFromUrl({
          url: req.body?.url,
          alt: req.body?.alt,
          caption: req.body?.caption,
          actor: actor(req),
        });
      }
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const data = await mediaService.update(req.params.id, req.body || {}, actor(req));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async removeAsset(req, res, next) {
    try {
      const data = await mediaService.removeAsset(
        {
          id: req.body?.id || req.query?.id,
          url: req.body?.url || req.query?.url,
        },
        actor(req)
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await mediaService.remove(req.params.id, actor(req));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async file(req, res, next) {
    try {
      const payload = await mediaService.filePayload(req.params.id);
      if (payload.redirect) {
        res.redirect(302, payload.redirect);
        return;
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
      if (payload.etag) {
        res.setHeader('ETag', payload.etag);
        if (req.get('if-none-match') === payload.etag) {
          res.status(304).end();
          return;
        }
      }
      res.type(payload.mimeType || 'application/octet-stream');
      if (payload.buffer) {
        res.send(payload.buffer);
        return;
      }
      res.sendFile(path.resolve(payload.filePath));
    } catch (err) {
      next(err);
    }
  },
};
