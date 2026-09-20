import { SafariStatus } from '@gm-safaris/shared-types';
import { notFound, validationError } from '../../errors/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { readStore } from '../../cms-store/index.js';
import { CONTENT_TYPES, displayTitle, emptyDraft } from './types.js';
import { contentRepository } from './content.repository.js';
import { seedSiteContent } from './content.seed.js';
import { syncBlogPost, removeBlogPost } from './blog.sync.js';

function actorMeta(actor) {
  return { actorId: actor?.userId, actorEmail: actor?.email };
}

function toAdmin(record) {
  return {
    id: record.id,
    type: record.type,
    slug: record.slug,
    status: record.status,
    title: displayTitle(record),
    updated_at: record.updated_at,
    published_at: record.published_at,
    draft: record.draft,
    published: record.published,
  };
}

function toPublic(record) {
  if (!record?.published) return null;
  return { id: record.id, type: record.type, slug: record.published.slug || record.slug, ...record.published };
}

export const contentService = {
  catalog() {
    return Object.values(CONTENT_TYPES).map((item) => ({
      key: item.key,
      label: item.label,
      singular: item.singular,
      nav: item.nav,
      createTitle: item.createTitle,
      fields: item.fields,
    }));
  },

  async listPublic(type) {
    if (!CONTENT_TYPES[type]) throw validationError('Unknown content type', { field: 'type' });
    const rows = (await contentRepository.all(type))
      .filter((item) => item.status === SafariStatus.PUBLISHED && item.published)
      .map(toPublic);
    return { data: rows, meta: { total: rows.length } };
  },

  async getPublicBySlug(type, slug) {
    const record = await contentRepository.findPublishedBySlug(type, slug);
    if (!record) throw notFound('Content not found');
    return toPublic(record);
  },

  async listAdmin(type, query = {}) {
    if (!CONTENT_TYPES[type]) throw validationError('Unknown content type', { field: 'type' });
    let rows = await contentRepository.all(type);
    const status = String(query.status || '');
    const q = String(query.q || '').toLowerCase();
    if (status) rows = rows.filter((item) => item.status === status);
    if (q) {
      rows = rows.filter((item) => displayTitle(item).toLowerCase().includes(q) || item.slug.includes(q));
    }
    rows.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    return { data: rows.map(toAdmin), meta: { total: rows.length } };
  },

  async getAdmin(type, id) {
    const record = await contentRepository.findById(type, id);
    if (!record) throw notFound('Content not found');
    if (type === 'posts') record.draft = emptyDraft('posts', record.draft || {});
    return toAdmin(record);
  },

  async create(type, body, actor) {
    const incoming = { ...(body || {}) };
    if (type === 'lodges' && incoming.category !== 'luxury') incoming.category = 'midrange';
    const record = await contentRepository.create(type, { draft: emptyDraft(type, incoming), actor });
    if (type === 'posts') await syncBlogPost(record);
    await recordAudit({ ...actorMeta(actor), action: 'content.create', resource: type, resourceId: record.id });
    return toAdmin(record);
  },

  async update(type, id, body, actor) {
    const record = await contentRepository.findById(type, id);
    if (!record) throw notFound('Content not found');
    const nextDraft = emptyDraft(type, { ...record.draft, ...(body || {}) });
    if (type === 'lodges') {
      const category = String(nextDraft.category || '').toLowerCase();
      if (category !== 'midrange' && category !== 'luxury') {
        throw validationError('Category must be midrange or luxury', { field: 'category' });
      }
      nextDraft.category = category;
      if (!Array.isArray(nextDraft.gallery)) {
        nextDraft.gallery = String(nextDraft.gallery || '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    if (nextDraft.slug && nextDraft.slug !== record.slug) {
      if (await contentRepository.slugTaken(type, nextDraft.slug, id)) {
        throw validationError('slug is already in use', { field: 'slug' });
      }
      record.slug = nextDraft.slug;
    }
    record.draft = nextDraft;
    record.updated_by = actor?.userId || null;
    record.updated_at = new Date().toISOString();
    await contentRepository.save(type, record);
    if (type === 'posts') await syncBlogPost(record);
    await recordAudit({ ...actorMeta(actor), action: 'content.update', resource: type, resourceId: id });
    return toAdmin(record);
  },

  async publish(type, id, actor) {
    const record = await contentRepository.findById(type, id);
    if (!record) throw notFound('Content not found');
    record.published = { ...record.draft };
    record.status = SafariStatus.PUBLISHED;
    record.published_at = new Date().toISOString();
    record.updated_at = record.published_at;
    record.updated_by = actor?.userId || null;
    await contentRepository.save(type, record);
    if (type === 'posts') await syncBlogPost(record);
    await recordAudit({ ...actorMeta(actor), action: 'content.publish', resource: type, resourceId: id });
    return toAdmin(record);
  },

  async unpublish(type, id, actor) {
    const record = await contentRepository.findById(type, id);
    if (!record) throw notFound('Content not found');
    record.status = SafariStatus.UNPUBLISHED;
    record.updated_at = new Date().toISOString();
    record.updated_by = actor?.userId || null;
    await contentRepository.save(type, record);
    if (type === 'posts') await syncBlogPost(record);
    await recordAudit({ ...actorMeta(actor), action: 'content.unpublish', resource: type, resourceId: id });
    return toAdmin(record);
  },

  async remove(type, id, actor) {
    const removed = await contentRepository.remove(type, id);
    if (!removed) throw notFound('Content not found');
    if (type === 'posts') await removeBlogPost(removed);
    await recordAudit({ ...actorMeta(actor), action: 'content.delete', resource: type, resourceId: id });
    return { id };
  },

  async overview() {
    await seedSiteContent();
    const store = await readStore();
    const safaris = store.safaris || [];
    const publishedSafaris = safaris.filter((item) => item.status === SafariStatus.PUBLISHED);
    const drafts = [
      ...safaris.filter((item) => item.status !== SafariStatus.PUBLISHED).map((item) => ({
        id: item.id,
        href: `#/safaris/${item.id}`,
        title: item.draft?.title || item.slug,
        type: 'Safari',
        status: item.status,
        updated_at: item.updated_at,
      })),
      ...Object.keys(CONTENT_TYPES).flatMap((type) =>
        (store[type] || [])
          .filter((item) => item.status !== SafariStatus.PUBLISHED)
          .map((item) => ({
            id: item.id,
            href: `#/${type}/${item.id}`,
            title: displayTitle(item),
            type: CONTENT_TYPES[type].singular,
            status: item.status,
            updated_at: item.updated_at,
          }))
      ),
    ]
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
      .slice(0, 8);

    const contentPublished = Object.keys(CONTENT_TYPES).reduce((sum, type) => {
      return sum + (store[type] || []).filter((item) => item.status === SafariStatus.PUBLISHED).length;
    }, 0);

    return {
      stats: {
        tours: safaris.length,
        published: publishedSafaris.length + contentPublished,
        bookings: (store.bookings || []).length,
        inquiries: (store.inquiries || []).length,
        customers: (store.customers || []).length,
        media: (store.media || []).length,
        apiClients: (store.apiClients || []).length,
      },
      recentBookings: (store.bookings || []).slice(0, 6),
      recentInquiries: (store.inquiries || []).slice(0, 6),
      upcomingBookings: (store.bookings || [])
        .filter((item) => item.status !== 'Cancelled' && item.travelDate)
        .slice(0, 6),
      drafts,
      latestMedia: (() => {
        const uploaded = (store.media || []).slice(-8).reverse();
        if (uploaded.length) return uploaded;
        return publishedSafaris.slice(0, 8).map((item) => {
          const doc = item.published || item.draft || {};
          return {
            url: doc.hero_image?.url || '',
            alt: doc.title || item.slug,
            filename: doc.title || item.slug,
          };
        }).filter((item) => item.url);
      })(),
      recentSafaris: publishedSafaris.slice(0, 6).map((item) => ({
        id: item.id,
        code: item.slug,
        title: item.published?.title || item.draft?.title || item.slug,
        status: item.status,
        updated_at: item.updated_at,
      })),
      latestAudit: (store.auditLogs || []).slice(0, 8),
      settings: store.settings
        ? { websiteLive: store.settings.websiteLive !== false, site: store.settings.site }
        : { websiteLive: true, site: null },
      contentByType: {
        safaris: { total: safaris.length, published: publishedSafaris.length },
        ...Object.fromEntries(
          Object.keys(CONTENT_TYPES).map((type) => [
            type,
            {
              total: (store[type] || []).length,
              published: (store[type] || []).filter((item) => item.status === SafariStatus.PUBLISHED).length,
            },
          ])
        ),
      },
    };
  },
};
