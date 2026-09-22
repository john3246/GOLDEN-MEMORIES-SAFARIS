import { SafariStatus } from '@gm-safaris/shared-types';
import { hasSafariPrice, normalizeItinerary, safariPackageTitle } from '@gm-safaris/safari-ui';

function publicItinerary(doc, draft) {
  const published = normalizeItinerary(doc?.itinerary);
  if (published.length) return published;
  return normalizeItinerary(draft?.itinerary);
}

const PUBLIC_OMIT = new Set([
  'draft',
  'created_by',
  'updated_by',
  'internal_notes',
  'audit',
  'revisions',
]);

/**
 * Public Safari DTO — published snapshot only, no draft or actor internals.
 * @param {Record<string, unknown>} record
 */
export function toPublicSafari(record) {
  if (!record || record.status !== SafariStatus.PUBLISHED || !record.published) return null;
  const doc = record.published;
  if (!hasSafariPrice(doc)) return null;
  return {
    id: record.id,
    slug: doc.slug || record.slug,
    title: safariPackageTitle(doc.title),
    short_description: safariPackageTitle(doc.short_description),
    description: safariPackageTitle(doc.description),
    featured: Boolean(doc.featured),
    display_order: doc.display_order ?? record.display_order ?? 0,
    duration: doc.duration,
    duration_label: doc.duration_label,
    price: doc.price,
    price_from: doc.price_from,
    currency: doc.currency || 'USD',
    destination: doc.destination,
    difficulty: doc.difficulty,
    best_season: doc.best_season,
    minimum_people: doc.minimum_people,
    maximum_people: doc.maximum_people,
    hero_image: doc.hero_image,
    gallery: doc.gallery || [],
    highlights: doc.highlights || [],
    itinerary: publicItinerary(doc, record.draft),
    lodge_ids: doc.lodge_ids || record.draft?.lodge_ids || [],
    lodges: doc.lodges || [],
    inclusions: doc.inclusions || [],
    exclusions: doc.exclusions || [],
    accommodation: doc.accommodation,
    transport_information: doc.transport_information,
    faq: doc.faq || [],
    map: doc.map,
    seo: doc.seo || {},
    sections: doc.sections,
    published_at: record.published_at,
    updated_at: record.updated_at,
  };
}

export function attachPublicLodges(dto, lodges = []) {
  if (!dto) return dto;
  const ids = new Set(dto.lodge_ids || []);
  dto.lodges = ids.size
    ? lodges
        .filter((item) => item.status === SafariStatus.PUBLISHED && item.published && ids.has(item.id))
        .map((item) => ({
          id: item.id,
          name: item.published.title,
          place: item.published.place || '',
          blurb: item.published.blurb || '',
          category: item.published.category || 'midrange',
          image: item.published.image || '',
        }))
    : [];
  return dto;
}

/**
 * Admin DTO includes draft + published + workflow metadata. No password hashes.
 * @param {Record<string, unknown>} record
 * @param {Array<Record<string, unknown>>} [revisions]
 */
export function toAdminSafari(record, revisions = []) {
  if (!record) return null;
  return {
    id: record.id,
    slug: record.slug,
    status: record.status,
    featured: Boolean(record.draft?.featured),
    display_order: record.draft?.display_order ?? 0,
    draft: record.draft,
    published: record.published,
    created_by: record.created_by,
    updated_by: record.updated_by,
    created_at: record.created_at,
    updated_at: record.updated_at,
    published_at: record.published_at,
    revisions: revisions.map((item) => ({
      id: item.id,
      version: item.version,
      action: item.action,
      created_at: item.created_at,
      created_by: item.created_by,
      created_by_email: item.created_by_email,
    })),
  };
}

export function toAdminListItem(record) {
  const doc = record.draft || {};
  return {
    id: record.id,
    slug: record.slug,
    title: safariPackageTitle(doc.title || 'Untitled safari'),
    status: record.status,
    featured: Boolean(doc.featured),
    display_order: doc.display_order ?? 0,
    destination: doc.destination || '',
    duration: doc.duration,
    duration_label: doc.duration_label || '',
    updated_at: record.updated_at,
    published_at: record.published_at,
    hero_image: doc.hero_image,
  };
}

export { PUBLIC_OMIT };
