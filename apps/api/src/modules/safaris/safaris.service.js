import { slugify } from '@gm-safaris/shared-utils';
import { SafariStatus } from '@gm-safaris/shared-types';
import { emptySafariDocument, safariCompletenessErrors } from '@gm-safaris/safari-ui';
import { notFound, forbidden, validationError } from '../../errors/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { emitEvent } from '../webhooks/webhooks.service.js';
import { invalidateSiteBundle } from '../site/site-bundle.js';
import { mediaService } from '../media/media.service.js';
import { safarisRepository } from './safaris.repository.js';
import { validateSafariPayload, parseAdminQuery, parsePublicQuery } from './safaris.validation.js';
import { toAdminSafari, toAdminListItem, toPublicSafari, attachPublicLodges } from './safaris.dto.js';
import { safariCache } from './safaris.cache.js';
import { syncSafari, removeSafari } from './safari.sync.js';
import { readStore } from '../../cms-store/index.js';

async function decoratePublic(dto) {
  if (!dto) return dto;
  const store = await readStore();
  return attachPublicLodges(dto, store.lodges || []);
}

function actorMeta(actor) {
  return { userId: actor?.userId, email: actor?.email };
}

function matchesAdminFilters(record, query) {
  const doc = record.draft || {};
  if (query.status && record.status !== query.status) return false;
  if (query.featured !== null && Boolean(doc.featured) !== query.featured) return false;
  if (query.destination && !String(doc.destination || '').toLowerCase().includes(query.destination.toLowerCase())) {
    return false;
  }
  if (query.duration && Number(doc.duration) !== query.duration) return false;
  if (query.q) {
    const hay = `${doc.title || ''} ${record.slug || ''} ${doc.destination || ''}`.toLowerCase();
    if (!hay.includes(query.q.toLowerCase())) return false;
  }
  return true;
}

function sortRecords(records, sort, draft = true) {
  const copy = [...records];
  copy.sort((a, b) => {
    if (sort === 'oldest') return String(a.created_at).localeCompare(String(b.created_at));
    if (sort === 'display_order') {
      const ao = (draft ? a.draft?.display_order : a.published?.display_order) ?? 0;
      const bo = (draft ? b.draft?.display_order : b.published?.display_order) ?? 0;
      return ao - bo || String(b.updated_at).localeCompare(String(a.updated_at));
    }
    if (sort === 'updated') return String(b.updated_at).localeCompare(String(a.updated_at));
    return String(b.created_at).localeCompare(String(a.created_at));
  });
  return copy;
}

async function snapshotRevision(record, action, actor) {
  const version = await safarisRepository.nextVersion(record.id);
  await safarisRepository.addRevision({
    safariId: record.id,
    action,
    version,
    snapshot: {
      status: record.status,
      slug: record.slug,
      draft: record.draft,
      published: record.published,
    },
    actor,
  });
}

async function markMediaPublic(doc) {
  const refs = [doc?.hero_image, ...(doc?.gallery || [])].filter((item) => item?.id);
  for (const ref of refs) {
    await mediaService.setVisibility(ref.id, 'public').catch(() => undefined);
  }
}

function requireReadyDraft(doc) {
  const errors = safariCompletenessErrors(doc);
  if (errors.length) throw validationError(errors.join(' '));
}

export const safarisService = {
  async listPublic(rawQuery) {
    const query = parsePublicQuery(rawQuery);
    const cacheKey = safariCache.listKey(query);
    const cached = await safariCache.get(cacheKey);
    if (cached) return cached;

    const published = (await safarisRepository.all())
      .map(toPublicSafari)
      .filter(Boolean)
      .filter((item) => {
        if (query.featured !== null && Boolean(item.featured) !== query.featured) return false;
        if (query.destination && !String(item.destination || '').toLowerCase().includes(query.destination.toLowerCase())) {
          return false;
        }
        if (query.q) {
          const hay = `${item.title} ${item.slug} ${item.destination}`.toLowerCase();
          if (!hay.includes(query.q.toLowerCase())) return false;
        }
        return true;
      });

    published.sort((a, b) => {
      if (query.sort === 'newest') return String(b.published_at).localeCompare(String(a.published_at));
      return (a.display_order ?? 0) - (b.display_order ?? 0) || String(b.published_at || '').localeCompare(String(a.published_at || ''));
    });

    const total = published.length;
    const store = await readStore();
    const data = published
      .slice(query.offset, query.offset + query.limit)
      .map((item) => attachPublicLodges(item, store.lodges || []));
    const result = { data, meta: { page: query.page, limit: query.limit, total } };
    await safariCache.set(cacheKey, result);
    return result;
  },

  async getPublicById(id) {
    const cacheKey = safariCache.idKey(id);
    const cached = await safariCache.get(cacheKey);
    if (cached) return cached;
    const record = await safarisRepository.findById(id);
    const dto = await decoratePublic(toPublicSafari(record));
    if (!dto) throw notFound('Safari package not found.');
    await safariCache.set(cacheKey, dto);
    return dto;
  },

  async getPublicBySlug(slug) {
    const cacheKey = safariCache.slugKey(slug);
    const cached = await safariCache.get(cacheKey);
    if (cached) return cached;
    const record = await safarisRepository.findBySlug(slug, { includeUnpublished: false });
    const dto = await decoratePublic(toPublicSafari(record));
    if (!dto) throw notFound('Safari package not found.');
    await safariCache.set(cacheKey, dto);
    return dto;
  },

  async listAdmin(rawQuery) {
    const query = parseAdminQuery(rawQuery);
    const filtered = sortRecords(
      (await safarisRepository.all()).filter((item) => matchesAdminFilters(item, query)),
      query.sort,
      true
    );
    const total = filtered.length;
    const data = filtered.slice(query.offset, query.offset + query.limit).map(toAdminListItem);
    return { data, meta: { page: query.page, limit: query.limit, total } };
  },

  async getAdmin(id) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    const revisions = await safarisRepository.revisionsFor(id);
    return {
      ...toAdminSafari(record, revisions),
      publishWarnings: safariCompletenessErrors(record.draft || {}),
      hasUnpublishedChanges:
        record.status === SafariStatus.PUBLISHED &&
        JSON.stringify({ ...(record.published || {}), slug: undefined }) !== JSON.stringify({ ...(record.draft || {}), slug: undefined }),
    };
  },

  async preview(id) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    return {
      ...record.draft,
      id: record.id,
      status: record.status,
      slug: record.draft?.slug || record.slug,
    };
  },

  async create(body, actor) {
    const payload = validateSafariPayload(body, { partial: false });
    if (!payload.slug) payload.slug = slugify(payload.title);
    const record = await safarisRepository.create({
      draft: emptySafariDocument(payload),
      actor: actorMeta(actor),
    });
    await syncSafari(record);
    await snapshotRevision(record, 'created', actor);
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.created',
      resource: 'safari',
      resourceId: record.id,
      metadata: { slug: record.slug, title: record.draft.title },
    });
    return this.getAdmin(record.id);
  },

  async update(id, body, actor) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    const payload = validateSafariPayload(body, { partial: true });
    if (payload.slug && payload.slug !== record.slug) {
      if (await safarisRepository.slugTaken(payload.slug, id)) {
        throw validationError('slug is already in use', { field: 'slug' });
      }
      record.slug = payload.slug;
    }
    record.draft = emptySafariDocument({ ...record.draft, ...payload, slug: record.slug });
    // Drafts can always be saved; completeness (price, duration, itinerary)
    // is only enforced when publishing. Missing items come back as warnings.
    record.updated_by = actor?.userId || null;
    record.updated_at = new Date().toISOString();
    await safarisRepository.save(record);
    await syncSafari(record);
    await snapshotRevision(record, 'updated', actor);
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.edited',
      resource: 'safari',
      resourceId: id,
      metadata: { slug: record.slug },
    });
    return this.getAdmin(id);
  },

  async publish(id, actor) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    if (!record.draft?.title) throw validationError('A title is required before publishing');
    requireReadyDraft(record.draft);
    record.published = { ...record.draft, slug: record.slug };
    record.status = SafariStatus.PUBLISHED;
    record.published_at = new Date().toISOString();
    record.updated_by = actor?.userId || null;
    record.updated_at = record.published_at;
    await safarisRepository.save(record);
    await markMediaPublic(record.published);
    await syncSafari(record);
    await safariCache.invalidateAll();
    await snapshotRevision(record, 'published', actor);
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.published',
      resource: 'safari',
      resourceId: id,
      metadata: { slug: record.slug },
    });
    invalidateSiteBundle();
    emitEvent('safari.published', { id, slug: record.slug, title: record.published.title, published: record.published });
    return this.getAdmin(id);
  },

  async unpublish(id, actor) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    record.status = SafariStatus.UNPUBLISHED;
    record.updated_by = actor?.userId || null;
    record.updated_at = new Date().toISOString();
    await safarisRepository.save(record);
    await syncSafari(record);
    await safariCache.invalidateAll();
    await snapshotRevision(record, 'unpublished', actor);
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.unpublished',
      resource: 'safari',
      resourceId: id,
      metadata: { slug: record.slug },
    });
    invalidateSiteBundle();
    emitEvent('safari.unpublished', { id, slug: record.slug });
    return this.getAdmin(id);
  },

  async archive(id, actor) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    record.status = SafariStatus.ARCHIVED;
    record.updated_by = actor?.userId || null;
    record.updated_at = new Date().toISOString();
    await safarisRepository.save(record);
    await syncSafari(record);
    await safariCache.invalidateAll();
    await snapshotRevision(record, 'archived', actor);
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.archived',
      resource: 'safari',
      resourceId: id,
    });
    return this.getAdmin(id);
  },

  async restore(id, actor) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    record.status = SafariStatus.DRAFT;
    record.updated_by = actor?.userId || null;
    record.updated_at = new Date().toISOString();
    await safarisRepository.save(record);
    await syncSafari(record);
    await safariCache.invalidateAll();
    await snapshotRevision(record, 'restored', actor);
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.restored',
      resource: 'safari',
      resourceId: id,
    });
    return this.getAdmin(id);
  },

  async duplicate(id, actor) {
    const record = await safarisRepository.findById(id);
    if (!record) throw notFound('Safari package not found.');
    const title = `${record.draft?.title || 'Safari'} (copy)`;
    const slug = await safarisRepository.uniqueSlug(title);
    const copy = await safarisRepository.create({
      draft: emptySafariDocument({
        ...record.draft,
        title,
        slug,
        featured: false,
      }),
      actor: actorMeta(actor),
    });
    copy.draft.slug = slug;
    await safarisRepository.save(copy);
    await syncSafari(copy);
    await snapshotRevision(copy, 'duplicated', actor);
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.duplicated',
      resource: 'safari',
      resourceId: copy.id,
      metadata: { from: id, slug },
    });
    return this.getAdmin(copy.id);
  },

  async remove(id, actor) {
    if (!['Admin', 'Super Admin'].includes(actor?.role)) throw forbidden('Only administrators can delete safari packages');
    const record = await safarisRepository.remove(id);
    if (!record) throw notFound('Safari package not found.');
    await removeSafari(record);
    await safariCache.invalidateAll();
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'safari.deleted',
      resource: 'safari',
      resourceId: id,
      metadata: { slug: record.slug },
    });
    return { id };
  },

  async related(slug, limit = 4) {
    const { data } = await this.listPublic({ limit: 20, sort: 'display_order' });
    return data.filter((item) => item.slug !== slug).slice(0, limit);
  },
};
