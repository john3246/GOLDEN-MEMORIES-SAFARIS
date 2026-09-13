import { createId, slugify } from '@gm-safaris/shared-utils';
import { SafariStatus } from '@gm-safaris/shared-types';
import { readStore, updateStore } from '../../cms-store/index.js';
import { validationError } from '../../errors/index.js';
import { CONTENT_TYPES, emptyDraft } from './types.js';

function now() {
  return new Date().toISOString();
}

function list(store, type) {
  if (!CONTENT_TYPES[type]) return [];
  if (!Array.isArray(store[type])) store[type] = [];
  return store[type];
}

export const contentRepository = {
  types() {
    return CONTENT_TYPES;
  },

  async all(type) {
    const store = await readStore();
    return list(store, type);
  },

  async findById(type, id) {
    const items = await this.all(type);
    return items.find((item) => item.id === id) || null;
  },

  async findPublishedBySlug(type, slug) {
    const needle = String(slug || '').toLowerCase();
    const items = await this.all(type);
    return (
      items.find(
        (item) => item.status === SafariStatus.PUBLISHED && (item.published?.slug || item.slug) === needle
      ) || null
    );
  },

  async slugTaken(type, slug, exceptId) {
    const needle = String(slug || '').toLowerCase();
    const items = await this.all(type);
    return items.some((item) => {
      if (exceptId && item.id === exceptId) return false;
      return item.slug === needle || item.published?.slug === needle || item.draft?.slug === needle;
    });
  },

  async uniqueSlug(type, base, exceptId) {
    const root = slugify(base) || `${type}-${Date.now().toString(36)}`;
    let candidate = root;
    let n = 2;
    while (await this.slugTaken(type, candidate, exceptId)) {
      candidate = `${root}-${n}`;
      n += 1;
    }
    return candidate;
  },

  async create(type, { draft, actor }) {
    if (!CONTENT_TYPES[type]) throw validationError('Unknown content type', { field: 'type' });
    const merged = emptyDraft(type, draft || {});
    const slug = merged.slug || (await this.uniqueSlug(type, merged.title));
    if (await this.slugTaken(type, slug)) throw validationError('slug is already in use', { field: 'slug' });
    merged.slug = slug;

    const record = {
      id: createId(),
      type,
      slug,
      status: SafariStatus.DRAFT,
      draft: merged,
      published: null,
      created_by: actor?.userId || null,
      updated_by: actor?.userId || null,
      created_at: now(),
      updated_at: now(),
      published_at: null,
    };

    await updateStore((store) => {
      list(store, type).push(record);
    });
    return record;
  },

  async save(type, record) {
    return updateStore((store) => {
      const items = list(store, type);
      const index = items.findIndex((item) => item.id === record.id);
      if (index === -1) return null;
      items[index] = record;
      return record;
    });
  },

  async remove(type, id) {
    return updateStore((store) => {
      const items = list(store, type);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      const [removed] = items.splice(index, 1);
      return removed;
    });
  },
};
