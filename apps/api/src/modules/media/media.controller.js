import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { config } from '../../config/index.js';
import { mediaService, randomFilename } from './media.service.js';
import { verifyAccessToken } from '../../security/jwt.js';
import { CmsRoleScopes } from '@gm-safaris/shared-types';

function actor(req) {
  return req.auth ? { userId: req.auth.userId, email: req.auth.email } : null;
}

function ensureUploadDir() {
  fs.mkdirSync(config.media.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, config.media.uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, randomFilename(file.originalname));
  },
});

export const mediaUpload = multer({
  storage,
  limits: { fileSize: config.media.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (config.media.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported image type'));
  },
});

export function optionalAuth(req, _res, next) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice(7).trim());
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name || '',
      scopes: [...(CmsRoleScopes[payload.role] || [])],
    };
  } catch {
    req.auth = null;
  }
  next();
}

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
      const payload = await mediaService.filePayload(req.params.id, req.auth || null);
      if (payload.redirect) {
        res.redirect(payload.redirect);
        return;
      }
      res.setHeader('Content-Type', payload.mimeType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.sendFile(path.resolve(payload.filePath));
    } catch (err) {
      next(err);
    }
  },
};
