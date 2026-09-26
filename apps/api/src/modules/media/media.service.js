import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createId } from '@gm-safaris/shared-utils';
import { readStore, updateStore } from '../../cms-store/index.js';
import { notFound, validationError } from '../../errors/index.js';
import { processImage } from './compress.js';
import { GALLERY_FOLDERS } from '@gm-safaris/safari-ui';
import {
  findOnDisk,
  writeUpload,
  saveBlob,
  loadBlob,
  deleteStoredFile,
  mimeForFile,
} from './media.storage.js';

const PUBLIC_IMAGES = path.resolve(fileURLToPath(new URL('../../../../website-com/public/images', import.meta.url)));
const FOLDER_ORDER = ['maps', 'arusha', 'eyasi', 'serengeti', 'ngorongoro', 'tarangire', 'mikumi', 'ruaha', 'selous', 'kilimanjaro', 'zanzibar', 'culture'];

const PUBLIC_FIELDS = ['id', 'url', 'alt', 'caption', 'mimeType', 'width', 'height', 'filename', 'createdAt'];

function toPublic(item) {
  if (!item) return null;
  return {
    id: item.id,
    url: item.externalUrl || `/api/v1/media/${item.id}/file`,
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

export function mediaPublicDto(item) {
  if (!item) return null;
  return {
    id: item.id,
    url: item.externalUrl || `/api/v1/media/${item.id}/file`,
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
      visibility: 'public',
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

function mediaUrls(item) {
  const urls = new Set();
  if (item?.id) urls.add(`/api/v1/media/${item.id}/file`);
  if (item?.externalUrl) urls.add(String(item.externalUrl).split('?')[0]);
  return urls;
}

function rewriteValue(value, urls, remaps) {
  if (value == null) return value;
  if (typeof value === 'string') {
    const clean = value.split('?')[0];
    if (remaps.has(clean)) return remaps.get(clean);
    if (urls.has(clean)) return '';
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => rewriteValue(item, urls, remaps))
      .filter((item) => {
        if (item == null || item === '') return false;
        if (typeof item === 'object' && item && 'url' in item && !item.url) return false;
        return true;
      });
  }
  if (typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = rewriteValue(value[key], urls, remaps);
    }
  }
  return value;
}

export const mediaService = {
  async list() {
    const items = await mediaRepository.list();
    return items.map((item) => toPublic(item));
  },

  async library() {
    const store = await readStore();
    const items = new Map();

    function prettyLabel(filename) {
      return String(filename || '')
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function folderFromName(filename, extra = '') {
      const name = `${filename} ${extra}`.toLowerCase();
      return FOLDER_ORDER.find((key) => name.includes(key)) || '';
    }

    let add = function add(url, alt, usedOn, source = 'content', extra = {}) {
      const clean = String(url || '').split('?')[0].trim();
      if (!clean) return;
      if (!/^(\/|https?:)/i.test(clean)) return;
      const key = clean.replace(/-card\.webp$/i, '.webp');
      const display = key.endsWith('.webp') && !key.endsWith('-card.webp') ? key : clean;
      const filename = display.split('/').pop() || display;
      const folder = folderFromName(filename, display);
      const existing = items.get(key) || {
        url: display.startsWith('http') ? display : display,
        alt: alt || prettyLabel(filename),
        filename,
        label: prettyLabel(filename),
        folder,
        source,
        usedOn: [],
        deletable: filename !== 'logo.webp',
      };
      if (extra.id) existing.id = extra.id;
      if (extra.deletable === false) existing.deletable = false;
      if (!existing.usedOn.includes(usedOn)) existing.usedOn.push(usedOn);
      if (source === 'upload') existing.source = 'upload';
      if (source === 'gallery' && existing.source !== 'upload') existing.source = 'gallery';
      if (alt && (!existing.alt || existing.alt === filename || existing.alt === existing.label)) existing.alt = alt;
      if (!existing.label) existing.label = prettyLabel(filename);
      if (!existing.folder && folder) existing.folder = folder;
      items.set(key, existing);
    };

    const hidden = new Set((store.meta?.hiddenImages || []).map((url) => String(url).split('?')[0]));
    const addVisible = add;
    // eslint-disable-next-line no-func-assign
    add = (url, ...rest) => {
      const clean = String(url || '').split('?')[0].trim();
      if (hidden.has(clean) || hidden.has(clean.replace(/-card\.webp$/i, '.webp'))) return;
      addVisible(url, ...rest);
    };

    for (const item of store.media || []) {
      const url = item.externalUrl || `/api/v1/media/${item.id}/file`;
      add(url, item.alt || item.originalName || item.filename, 'Uploads', 'upload', { id: item.id });
    }

    for (const safari of store.safaris || []) {
      const doc = safari.draft || safari.published || {};
      add(doc.hero_image?.url, doc.hero_image?.alt || doc.title, 'Tours');
      for (const shot of doc.gallery || []) add(shot?.url, shot?.alt || doc.title, 'Tours');
    }
    for (const item of store.destinations || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Destinations');
      for (const shot of doc.gallery || []) add(typeof shot === 'string' ? shot : shot?.url, doc.title, 'Destinations');
    }
    for (const item of store.posts || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Blog');
      add(doc.hero_image?.url, doc.title, 'Blog');
      for (const shot of doc.gallery || []) add(typeof shot === 'string' ? shot : shot?.url, doc.title, 'Blog');
      for (const block of doc.blocks || []) {
        if (block?.type === 'image') add(block.url, block.alt || doc.title, 'Blog');
      }
    }
    for (const item of store.lodges || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Lodges');
      for (const shot of doc.gallery || []) add(typeof shot === 'string' ? shot : shot?.url, doc.title, 'Lodges');
    }
    for (const item of store.pages || []) {
      const doc = item.draft || item.published || {};
      add(typeof doc.hero_image === 'string' ? doc.hero_image : doc.hero_image?.url, doc.title, 'Pages');
    }
    for (const item of store.departures || []) {
      const doc = item.draft || item.published || {};
      add(doc.image, doc.title, 'Join safari');
    }

    add('/images/logo.webp', 'Golden Memories Safaris logo', 'Site chrome', 'gallery', { deletable: false });

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
          add(`${prefix}/${entry.name}`, prettyLabel(entry.name), 'Project gallery', 'gallery');
        }
      }
      await walk(galleryRoot, '/images');
    } catch {
      /* gallery folder optional in some deploys */
    }

    const list = [...items.values()].sort((a, b) => a.filename.localeCompare(b.filename));
    for (const item of list) {
      if (item.url.startsWith('/images/')) {
        const file = path.resolve(PUBLIC_IMAGES, item.url.replace(/^\/images\//, ''));
        try {
          const stat = await fs.stat(file);
          if (stat.size < 2048) item.problem = 'Image file is almost empty — replace it';
        } catch {
          item.problem = 'Missing file — this photo shows as broken on the website';
        }
      }
    }
    const folderLabels = GALLERY_FOLDERS;
    const groups = [
      { id: 'all', label: 'All photos', items: list },
      { id: 'gallery', label: 'Project gallery', items: list.filter((item) => item.source === 'gallery' || item.usedOn.includes('Project gallery')) },
      { id: 'uploads', label: 'Uploads from device', items: list.filter((item) => item.source === 'upload' || item.usedOn.includes('Uploads')) },
      ...Object.entries(folderLabels).map(([id, label]) => ({
        id: `folder-${id}`,
        label,
        items: list.filter((item) => item.folder === id),
      })),
      { id: 'tours', label: 'Used on tours', items: list.filter((item) => item.usedOn.includes('Tours')) },
      { id: 'destinations', label: 'Used on destinations', items: list.filter((item) => item.usedOn.includes('Destinations')) },
      { id: 'blog', label: 'Used on blog', items: list.filter((item) => item.usedOn.includes('Blog')) },
      { id: 'lodges', label: 'Used on lodges', items: list.filter((item) => item.usedOn.includes('Lodges')) },
      { id: 'pages', label: 'Used on pages', items: list.filter((item) => item.usedOn.includes('Pages')) },
      { id: 'problems', label: 'Needs attention', items: list.filter((item) => item.problem) },
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
    if (!file?.buffer?.length) throw validationError('Choose an image file to upload');
    const processed = await processImage(file.buffer);
    const id = createId();
    const filename = `${id}${processed.ext}`;
    await writeUpload(filename, processed.buffer);
    const record = {
      id,
      filename,
      originalName: String(file.originalname || filename).slice(0, 200),
      mimeType: processed.mimeType,
      size: processed.buffer.length,
      width: processed.width,
      height: processed.height,
      storagePath: filename,
      alt: String(alt || '').slice(0, 300),
      caption: String(caption || '').slice(0, 500),
      visibility: 'public',
      createdBy: actor?.userId || null,
    };
    await saveBlob(record, processed.buffer);
    const item = await mediaRepository.create(record);
    await import('../audit/audit.service.js').then(({ recordAudit }) =>
      recordAudit({
        actorId: actor?.userId,
        actorEmail: actor?.email,
        action: 'media.uploaded',
        resource: 'media',
        resourceId: item.id,
        metadata: { mimeType: item.mimeType, size: item.size },
      })
    );
    return toPublic(item);
  },

  async createFromUrl({ url, alt, caption, actor }) {
    if (!url || typeof url !== 'string') throw validationError('url is required');
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        throw new Error('bad protocol');
      }
    } catch {
      throw validationError('Paste a full https:// image address');
    }
    const item = await mediaRepository.create({
      filename: path.basename(new URL(url).pathname) || 'remote-image',
      externalUrl: url,
      alt: alt || '',
      caption: caption || '',
      visibility: 'public',
      mimeType: mimeForFile(new URL(url).pathname, 'image/jpeg'),
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
    return this.removeAsset({ id }, actor);
  },

  async removeAsset({ id, url } = {}, actor) {
    const urls = new Set();
    const cleanUrl = String(url || '')
      .split('?')[0]
      .trim();
    let item = id ? await mediaRepository.findById(id) : null;
    const fileId = cleanUrl.match(/\/api\/v1\/media\/([^/]+)\/file/i)?.[1];
    if (!item && fileId) item = await mediaRepository.findById(fileId);
    if (item) for (const value of mediaUrls(item)) urls.add(value);
    if (cleanUrl) urls.add(cleanUrl);

    if (/\/images\/logo(-150)?\.webp$/i.test(cleanUrl)) {
      throw validationError('The site logo cannot be deleted.');
    }
    if (!item && !cleanUrl) throw validationError('Choose a photo to delete.');
    if (!item && cleanUrl && !cleanUrl.startsWith('/images/')) {
      throw notFound('Media not found');
    }

    if (item) {
      await mediaRepository.remove(item.id);
      await deleteStoredFile(item);
    }

    // Project-gallery photos ship with the website build, and other pages point
    // at them by file name. Deleting or renumbering the files broke those pages,
    // so they are hidden from the library and removed from CMS content instead.
    await updateStore((store) => {
      for (const key of ['safaris', 'destinations', 'posts', 'lodges', 'pages', 'departures', 'testimonials']) {
        store[key] = rewriteValue(store[key], urls, new Map());
      }
      if (cleanUrl.startsWith('/images/')) {
        const hidden = new Set(store.meta?.hiddenImages || []);
        hidden.add(cleanUrl);
        store.meta = { ...(store.meta || {}), hiddenImages: [...hidden] };
      }
    });

    await import('../audit/audit.service.js').then(({ recordAudit }) =>
      recordAudit({
        actorId: actor?.userId,
        actorEmail: actor?.email,
        action: 'media.deleted',
        resource: 'media',
        resourceId: item?.id || cleanUrl,
        metadata: { url: cleanUrl || null },
      })
    );
    return { id: item?.id || null, url: cleanUrl || null, removed: [...urls] };
  },

  async setVisibility(id, visibility) {
    return mediaRepository.update(id, { visibility });
  },

  async filePayload(id) {
    const item = await mediaRepository.findById(id);
    if (!item) throw notFound('Media not found');
    if (item.externalUrl) {
      return { redirect: item.externalUrl };
    }
    const onDisk = findOnDisk(item);
    if (onDisk) {
      return { filePath: onDisk, mimeType: mimeForFile(onDisk, item.mimeType), etag: `"${item.id}-${item.size || 0}"` };
    }
    const blob = await loadBlob(item.id);
    if (blob) {
      // Re-create the disk cache after a redeploy.
      writeUpload(item.filename || blob.filename, blob.bytes).catch(() => undefined);
      return { buffer: blob.bytes, mimeType: blob.mime_type || mimeForFile(blob.filename), etag: `"${item.id}-${blob.bytes.length}"` };
    }
    throw notFound('This photo file is missing. Upload it again in the CMS media library.');
  },
};

export function randomFilename(originalName) {
  const ext = path.extname(originalName || '').slice(0, 8) || '.bin';
  return `${createId()}${ext}`;
}

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
