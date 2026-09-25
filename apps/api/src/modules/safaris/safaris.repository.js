import { createId, slugify } from '@gm-safaris/shared-utils';
import { SafariStatus } from '@gm-safaris/shared-types';
import { emptySafariDocument } from '@gm-safaris/safari-ui';
import { readStore, updateStore } from '../../cms-store/index.js';
import { validationError } from '../../errors/index.js';

function now() {
  return new Date().toISOString();
}

export const safarisRepository = {
  async all() {
    const store = await readStore();
    return store.safaris;
  },

  async findById(id) {
    const store = await readStore();
    return store.safaris.find((item) => item.id === id) || null;
  },

  async findBySlug(slug, { includeUnpublished = false } = {}) {
    const store = await readStore();
    const needle = String(slug || '').toLowerCase();
    return (
      store.safaris.find((item) => {
        if (includeUnpublished) {
          return item.slug === needle || item.published?.slug === needle || item.draft?.slug === needle;
        }
        return (
          item.status === SafariStatus.PUBLISHED &&
          (item.published?.slug === needle || item.slug === needle)
        );
      }) || null
    );
  },

  async slugTaken(slug, exceptId) {
    const store = await readStore();
    const needle = String(slug || '').toLowerCase();
    return store.safaris.some((item) => {
      if (exceptId && item.id === exceptId) return false;
      return item.slug === needle || item.published?.slug === needle || item.draft?.slug === needle;
    });
  },

  async uniqueSlug(base, exceptId) {
    const root = slugify(base) || `safari-${Date.now().toString(36)}`;
    let candidate = root;
    let n = 2;
    while (await this.slugTaken(candidate, exceptId)) {
      candidate = `${root}-${n}`;
      n += 1;
    }
    return candidate;
  },

  async create({ draft, actor }) {
    const slug = draft.slug || (await this.uniqueSlug(draft.title));
    if (await this.slugTaken(slug)) throw validationError('slug is already in use', { field: 'slug' });

    const record = {
      id: createId(),
      slug,
      status: SafariStatus.DRAFT,
      draft: emptySafariDocument({ ...draft, slug }),
      published: null,
      created_by: actor?.userId || null,
      updated_by: actor?.userId || null,
      created_at: now(),
      updated_at: now(),
      published_at: null,
    };

    await updateStore((store) => {
      store.safaris.push(record);
    });
    return record;
  },

  async save(record) {
    return updateStore((store) => {
      const index = store.safaris.findIndex((item) => item.id === record.id);
      if (index === -1) return null;
      store.safaris[index] = record;
      return record;
    });
  },

  async remove(id) {
    return updateStore((store) => {
      const index = store.safaris.findIndex((item) => item.id === id);
      if (index === -1) return null;
      const [removed] = store.safaris.splice(index, 1);
      store.revisions = store.revisions.filter((item) => item.safariId !== id);
      return removed;
    });
  },

  async addRevision({ safariId, action, snapshot, actor, version }) {
    const entry = {
      id: createId(),
      safariId,
      version,
      action,
      snapshot,
      created_at: now(),
      created_by: actor?.userId || null,
      created_by_email: actor?.email || null,
    };
    await updateStore((store) => {
      store.revisions.push(entry);
    });
    return entry;
  },

  async revisionsFor(safariId) {
    const store = await readStore();
    return store.revisions
      .filter((item) => item.safariId === safariId)
      .sort((a, b) => b.version - a.version);
  },

  async nextVersion(safariId) {
    const list = await this.revisionsFor(safariId);
    return (list[0]?.version || 0) + 1;
  },
};
