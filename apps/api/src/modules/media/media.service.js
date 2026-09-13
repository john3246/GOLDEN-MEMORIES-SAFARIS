import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
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

  async library() {
    const store = await readStore();
    const items = new Map();

    function add(url, alt, usedOn, source = 'content') {
      const clean = String(url || '').split('?')[0].trim();
      if (!clean) return;
      if (!/^(\/|https?:)/i.test(clean)) return;
      const key = clean.replace(/-card\.webp$/i, '.webp');
      const display = key.endsWith('.webp') && !key.endsWith('-card.webp') ? key : clean;
      const filename = display.split('/').pop() || display;
      const existing = items.get(key) || {
        url: display.startsWith('http') ? display : display,
        alt: alt || filename,
        filename,
        source,
        usedOn: [],
      };
      if (!existing.usedOn.includes(usedOn)) existing.usedOn.push(usedOn);
      if (source === 'upload') existing.source = 'upload';
      if (source === 'gallery' && existing.source !== 'upload') existing.source = 'gallery';
      if (alt && (!existing.alt || existing.alt === filename)) existing.alt = alt;
      items.set(key, existing);
    }

    for (const item of store.media || []) {
      const url = item.externalUrl || `/api/v1/media/${item.id}/file`;
      add(url, item.alt || item.originalName || item.filename, 'Uploads', 'upload');
    }

    for (const safari of store.safaris || []) {
      const doc = safari.draft || safari.published || {};
      add(doc.hero_image?.url, doc.hero_image?.alt || doc.title, 'Tours');
      for (const shot of doc.gallery || []) add(shot?.url, shot?.alt || doc.title, 'Tours');
    }
    for (const item of store.destinations || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Destinations');
    }
    for (const item of store.posts || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Blog');
    }
    for (const item of store.lodges || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Lodges');
    }
    for (const item of store.pages || []) {
      const doc = item.draft || item.published || {};
      add(doc.hero_image, doc.title, 'Pages');
    }
    for (const item of store.departures || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Join safari');
    }

    add('/images/logo.webp', 'Golden Memories Safaris logo', 'Site chrome', 'gallery');

    try {
      const galleryRoot = path.resolve(fileURLToPath(new URL('../../../../website-com/public/images', import.meta.url)));
      async function walk(dir, prefix) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full, `${prefix}/${entry.name}`);
            continue;
          }
          if (!/\.(webp|jpe?g|png|gif)$/i.test(entry.name)) continue;
          if (/-card\.(webp|jpe?g|png)$/i.test(entry.name)) continue;
          add(`${prefix}/${entry.name}`, entry.name.replace(/\.(webp|jpe?g|png|gif)$/i, ''), 'Project gallery', 'gallery');
        }
      }
      await walk(galleryRoot, '/images');
    } catch {
      /* gallery folder optional in some deploys */
    }

    const list = [...items.values()].sort((a, b) => a.filename.localeCompare(b.filename));
    const groups = [
      { id: 'all', label: 'All media', items: list },
      { id: 'gallery', label: 'Project gallery', items: list.filter((item) => item.source === 'gallery' || item.usedOn.includes('Project gallery')) },
      { id: 'uploads', label: 'Uploads', items: list.filter((item) => item.source === 'upload' || item.usedOn.includes('Uploads')) },
      { id: 'tours', label: 'Tours', items: list.filter((item) => item.usedOn.includes('Tours')) },
      { id: 'destinations', label: 'Destinations', items: list.filter((item) => item.usedOn.includes('Destinations')) },
      { id: 'blog', label: 'Blog', items: list.filter((item) => item.usedOn.includes('Blog')) },
      { id: 'lodges', label: 'Lodges', items: list.filter((item) => item.usedOn.includes('Lodges')) },
      { id: 'pages', label: 'Pages', items: list.filter((item) => item.usedOn.includes('Pages')) },
    ].map((group) => ({ ...group, count: group.items.length }))
      .filter((group) => group.id === 'all' || group.count > 0);

    return { total: list.length, groups };
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
