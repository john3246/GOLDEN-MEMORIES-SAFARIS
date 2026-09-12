import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createId } from '@gm-safaris/shared-utils';
import { readStore, updateStore } from '../../cms-store/index.js';
import { config } from '../../config/index.js';
import { notFound, validationError, forbidden } from '../../errors/index.js';

const PUBLIC_FIELDS = ['id', 'url', 'alt', 'caption', 'mimeType', 'width', 'height', 'filename', 'createdAt'];

function toPublic(item, req) {
  if (!item) return null;
  const base = (req && req.publicBase) || config.apiBaseUrl;
  return {
    id: item.id,
    url: item.externalUrl || `${base}/api/v1/media/${item.id}/file`,
    alt: item.alt || '',
    caption: item.caption || '',
    mimeType: item.mimeType || '',
    width: item.width || null,
    height: item.height || null,
    filename: item.filename || '',
    createdAt: item.createdAt,
    visibility: item.visibility,
  };
}

export function mediaPublicDto(item, baseUrl = config.apiBaseUrl) {
  if (!item) return null;
  return {
    id: item.id,
    url: item.externalUrl || `${baseUrl}/api/v1/media/${item.id}/file`,
    alt: item.alt || '',
    caption: item.caption || '',
  };
}

export const mediaRepository = {
  async list() {
    const store = await readStore();
    return [...store.media].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  },

  async findById(id) {
    const store = await readStore();
    return store.media.find((item) => item.id === id) || null;
  },

  async create(record) {
    const item = {
      id: createId(),
      createdAt: new Date().toISOString(),
      visibility: 'private',
      ...record,
    };
    await updateStore((store) => {
      store.media.push(item);
    });
    return item;
  },

  async update(id, patch) {
    return updateStore((store) => {
      const item = store.media.find((row) => row.id === id);
      if (!item) return null;
      Object.assign(item, patch, { updatedAt: new Date().toISOString() });
      return item;
    });
  },

  async remove(id) {
    return updateStore((store) => {
      const index = store.media.findIndex((row) => row.id === id);
      if (index === -1) return null;
      const [removed] = store.media.splice(index, 1);
      return removed;
    });
  },

  toPublic,
  PUBLIC_FIELDS,
};

export const mediaService = {
  async list() {
    const items = await mediaRepository.list();
    return items.map((item) => toPublic(item));
  },

  async get(id) {
    const item = await mediaRepository.findById(id);
    if (!item) throw notFound('Media not found');
    return toPublic(item);
  },

  async createFromUpload({ file, alt, caption, actor }) {
    if (!file) throw validationError('An image file is required');
    if (!config.media.allowedMimeTypes.includes(file.mimetype)) {
      throw validationError('Unsupported image type');
    }
    const item = await mediaRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: file.path,
      alt: alt || '',
      caption: caption || '',
      visibility: 'private',
      createdBy: actor?.userId || null,
    });
    await import('../audit/audit.service.js').then(({ recordAudit }) =>
      recordAudit({
        actorId: actor?.userId,
        actorEmail: actor?.email,
        action: 'media.uploaded',
        resource: 'media',
        resourceId: item.id,
        metadata: { mimeType: item.mimeType },
      })
    );
    return toPublic(item);
  },

  async createFromUrl({ url, alt, caption, actor }) {
    if (!url || typeof url !== 'string') throw validationError('url is required');
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('bad protocol');
      }
    } catch {
      throw validationError('url must be an absolute http(s) URL');
    }
    const item = await mediaRepository.create({
      filename: path.basename(new URL(url).pathname) || 'remote-image',
      externalUrl: url,
      alt: alt || '',
      caption: caption || '',
      visibility: 'public',
      mimeType: 'image/jpeg',
      createdBy: actor?.userId || null,
    });
    return toPublic(item);
  },

  async update(id, { alt, caption }, actor) {
    const item = await mediaRepository.update(id, {
      ...(alt !== undefined ? { alt: String(alt) } : {}),
      ...(caption !== undefined ? { caption: String(caption) } : {}),
    });
    if (!item) throw notFound('Media not found');
    await import('../audit/audit.service.js').then(({ recordAudit }) =>
      recordAudit({
        actorId: actor?.userId,
        actorEmail: actor?.email,
        action: 'media.updated',
        resource: 'media',
        resourceId: id,
      })
    );
    return toPublic(item);
  },

  async remove(id, actor) {
    const item = await mediaRepository.remove(id);
    if (!item) throw notFound('Media not found');
    if (item.storagePath) {
      await fs.unlink(item.storagePath).catch(() => undefined);
    }
    await import('../audit/audit.service.js').then(({ recordAudit }) =>
      recordAudit({
        actorId: actor?.userId,
        actorEmail: actor?.email,
        action: 'media.deleted',
        resource: 'media',
        resourceId: id,
      })
    );
    return { id };
  },

  async setVisibility(id, visibility) {
    return mediaRepository.update(id, { visibility });
  },

  async filePayload(id, auth) {
    const item = await mediaRepository.findById(id);
    if (!item) throw notFound('Media not found');
    if (item.externalUrl) {
      return { redirect: item.externalUrl };
    }
    if (item.visibility !== 'public' && !auth) {
      throw forbidden('This media is not public');
    }
    if (!item.storagePath) throw notFound('Media file is missing');
    return { filePath: item.storagePath, mimeType: item.mimeType, filename: item.originalName || item.filename };
  },
};

export function randomFilename(originalName) {
  const ext = path.extname(originalName || '').slice(0, 8) || '.bin';
  return `${createId()}${ext}`;
}

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
