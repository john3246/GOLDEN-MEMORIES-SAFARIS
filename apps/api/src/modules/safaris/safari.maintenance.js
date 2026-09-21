import { getPool } from '../../database/index.js';
import { SafariStatus } from '@gm-safaris/shared-types';
import { hasSafariPrice } from '@gm-safaris/safari-ui';
import { readStore, updateStore } from '../../cms-store/index.js';
import { logger } from '../../logging/index.js';
import { safariCache } from './safaris.cache.js';
import { safariDbSyncEnabled, syncSafari, deleteSafariFromDb, deleteDraftSafarisFromDb } from './safari.sync.js';
import { PDF_PACKAGES, PDF_PACKAGE_SLUGS, REPLACED_SAFARI_SLUGS, toSafariDocument } from './pdf-packages.js';
import { safarisRepository } from './safaris.repository.js';
import { config } from '../../config/index.js';

function lacksPrice(record) {
  return !hasSafariPrice(record?.published || record?.draft);
}

/**
 * Published tours without a price come off the public site and stay in CMS as drafts.
 * Also dual-writes those rows to PostgreSQL so the later database cutover stays consistent.
 */
export async function unpublishPricelessSafaris() {
  const now = new Date().toISOString();
  const changed = [];

  await updateStore((store) => {
    for (const record of store.safaris || []) {
      if (record.status !== SafariStatus.PUBLISHED) continue;
      if (!lacksPrice(record)) continue;
      record.status = SafariStatus.DRAFT;
      record.published = null;
      record.published_at = null;
      record.updated_at = now;
      changed.push(record);
    }
  });

  if (!changed.length) return 0;

  await safariCache.invalidateAll();
  for (const record of changed) {
    await syncSafari(record);
  }

  logger.info('Unpublished safaris without a price and saved them as drafts', { count: changed.length });
  return changed.length;
}

function siblingItinerary(store, slug) {
  const ranked = (store.safaris || [])
    .map((record) => {
      const days = record.published?.itinerary?.length
        ? record.published.itinerary
        : record.draft?.itinerary;
      if (!days?.length || record.slug === slug) return null;
      if (slug.startsWith(record.slug) || record.slug.startsWith(slug)) {
        return { days, score: Math.min(slug.length, record.slug.length) };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.days || null;
}

/**
 * Published tours that went live without day-by-day copy inherit itinerary
 * from a matching sibling slug or the website catalog so the public page
 * and CMS editor stay in sync.
 */
export async function fillEmptyItineraries() {
  let catalogBySlug = new Map();
  try {
    const catalog = await import('../../../../website-com/src/pages/tours/catalog.js');
    for (const tour of catalog.allTours?.() || []) {
      if (tour.slug && tour.itinerary?.length) catalogBySlug.set(tour.slug, tour.itinerary);
    }
  } catch {
    catalogBySlug = new Map();
  }

  const now = new Date().toISOString();
  const changed = [];
  await updateStore((store) => {
    for (const record of store.safaris || []) {
      const draftDays = record.draft?.itinerary || [];
      const pubDays = record.published?.itinerary || [];
      if (draftDays.length && pubDays.length) continue;
      const next = siblingItinerary(store, record.slug) || catalogBySlug.get(record.slug);
      if (!next?.length) continue;
      if (record.draft) record.draft.itinerary = draftDays.length ? draftDays : next;
      if (record.published) record.published.itinerary = pubDays.length ? pubDays : next;
      if (record.draft && !record.draft.duration && next.length) record.draft.duration = next.length;
      if (record.published && !record.published.duration && next.length) record.published.duration = next.length;
      record.updated_at = now;
      changed.push(record);
    }
  });
  if (changed.length) {
    await safariCache.invalidateAll();
    logger.info('Filled empty safari itineraries from sibling tours or catalog', { count: changed.length });
  }
  return changed.length;
}

export async function syncAllSafaris() {
  if (!safariDbSyncEnabled()) return;
  const pool = getPool();
  if (!pool) return;
  try {
    const found = await pool.query(
      `SELECT to_regclass('public.tours') AS tours, to_regclass('public.cms_safaris') AS cms`
    );
    if (!found.rows[0]?.tours && !found.rows[0]?.cms) {
      logger.warn('Skipping safari PostgreSQL sync; run database migrations first');
      return;
    }
  } catch (err) {
    logger.warn('Skipping safari PostgreSQL sync; database is not ready', {
      message: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  const store = await readStore();
  for (const record of store.safaris || []) {
    await syncSafari(record);
  }
}

function pdfDraft(item) {
  const draft = toSafariDocument(item);
  draft.seo = {
    ...draft.seo,
    canonical: draft.seo?.canonical || `${config.sites.com}/tours/${item.slug}/`,
    og_image: draft.seo?.og_image || item.hero_image?.url,
  };
  return draft;
}

/**
 * Remove every DRAFT safari from the file store and PostgreSQL, drop retired
 * catalog slugs, then publish the 12 PDF packages with matching itineraries.
 */
export async function replacePdfSafariCatalog() {
  const now = new Date().toISOString();
  const removed = [];

  await updateStore((store) => {
    const next = [];
    for (const record of store.safaris || []) {
      const isDraft = record.status === SafariStatus.DRAFT;
      const retired = REPLACED_SAFARI_SLUGS.has(record.slug) && !PDF_PACKAGE_SLUGS.has(record.slug);
      if (isDraft || retired) {
        removed.push(record);
        store.revisions = (store.revisions || []).filter((item) => item.safariId !== record.id);
        continue;
      }
      next.push(record);
    }
    store.safaris = next;
  });

  for (const record of removed) {
    await deleteSafariFromDb(record);
  }
  const dbDrafts = await deleteDraftSafarisFromDb();

  for (const item of PDF_PACKAGES) {
    const draft = pdfDraft(item);
    let record = await safarisRepository.findBySlug(item.slug, { includeUnpublished: true });
    if (!record) {
      record = await safarisRepository.create({ draft, actor: { userId: 'seed' } });
    } else {
      record.draft = draft;
      record.slug = item.slug;
      record.updated_at = now;
    }
    record.status = SafariStatus.PUBLISHED;
    record.published = { ...draft };
    record.published_at = record.published_at || now;
    await safarisRepository.save(record);
    await syncSafari(record);
  }

  await safariCache.invalidateAll();
  await syncAllSafaris();

  logger.info('Replaced safari catalog with published PDF packages', {
    removed: removed.length,
    published: PDF_PACKAGES.length,
    dbDrafts,
  });
  return { removed: removed.length, published: PDF_PACKAGES.length, dbDrafts };
}
