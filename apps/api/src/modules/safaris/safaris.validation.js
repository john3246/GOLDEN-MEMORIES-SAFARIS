import {
  requireNonEmptyString,
  validateSlug,
  validateOptionalString,
  validateNonNegativeNumber,
  parsePagination,
} from '@gm-safaris/shared-validation';
import { DEFAULT_SAFARI_SECTIONS, SAFARI_SECTION_TYPES, SafariStatus } from '@gm-safaris/shared-types';
import { emptySafariDocument, normalizeSections } from '@gm-safaris/safari-ui';
import { validationError } from '../../errors/index.js';

const TITLE_MAX = 180;
const TEXT_MAX = 20000;
const SEO_TITLE_MAX = 70;
const SEO_DESC_MAX = 320;

export const WRITABLE_FIELDS = Object.freeze([
  'title',
  'slug',
  'short_description',
  'description',
  'featured',
  'display_order',
  'duration',
  'duration_label',
  'price',
  'price_from',
  'currency',
  'destination',
  'difficulty',
  'best_season',
  'minimum_people',
  'maximum_people',
  'hero_image',
  'gallery',
  'highlights',
  'itinerary',
  'inclusions',
  'exclusions',
  'accommodation',
  'transport_information',
  'faq',
  'map',
  'seo',
  'sections',
  'lodge_ids',
]);

function fail(result) {
  if (!result.ok) throw validationError(result.message);
  return result.value;
}

function stringList(value, field, maxItems = 50, maxLen = 400) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw validationError(`${field} must be an array of strings`);
  if (value.length > maxItems) throw validationError(`${field} must have at most ${maxItems} items`);
  return value.map((item, index) => {
    if (typeof item !== 'string') throw validationError(`${field}[${index}] must be a string`);
    const trimmed = item.trim();
    if (trimmed.length > maxLen) throw validationError(`${field}[${index}] is too long`);
    return trimmed;
  });
}

function mediaRef(value, field) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'object') throw validationError(`${field} must be an object`);
  const url = value.url ? fail(validateOptionalString(value.url, `${field}.url`, 2000)) : '';
  return {
    id: value.id ? String(value.id) : null,
    url,
    alt: fail(validateOptionalString(value.alt, `${field}.alt`, 180)),
    caption: fail(validateOptionalString(value.caption, `${field}.caption`, 240)),
  };
}

function itinerary(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw validationError('itinerary must be an array');
  if (value.length > 60) throw validationError('itinerary must have at most 60 days');
  return value.map((day, index) => {
    if (!day || typeof day !== 'object') throw validationError(`itinerary[${index}] is invalid`);
    return {
      id: day.id ? String(day.id) : `day_${index + 1}`,
      day: fail(validateOptionalString(day.day, `itinerary[${index}].day`, 40)) || `Day ${index + 1}`,
      title: fail(validateOptionalString(day.title, `itinerary[${index}].title`, 180)),
      description: fail(validateOptionalString(day.description || day.body, `itinerary[${index}].description`, 8000)),
      activities: stringList(day.activities || [], `itinerary[${index}].activities`, 20, 200) || [],
      accommodation: fail(validateOptionalString(day.accommodation || day.stay, `itinerary[${index}].accommodation`, 400)),
      meals: fail(validateOptionalString(day.meals, `itinerary[${index}].meals`, 200)),
      transport: fail(validateOptionalString(day.transport, `itinerary[${index}].transport`, 200)),
      distance: fail(validateOptionalString(day.distance, `itinerary[${index}].distance`, 80)),
      viewing: fail(validateOptionalString(day.viewing, `itinerary[${index}].viewing`, 80)),
      image: fail(validateOptionalString(day.image, `itinerary[${index}].image`, 2000)),
    };
  });
}

function faq(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw validationError('faq must be an array');
  return value.map((item, index) => ({
    q: fail(validateOptionalString(item?.q, `faq[${index}].q`, 240)),
    a: fail(validateOptionalString(item?.a, `faq[${index}].a`, 4000)),
  }));
}

function seo(value) {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object') throw validationError('seo must be an object');
  return {
    title: fail(validateOptionalString(value.title, 'seo.title', SEO_TITLE_MAX)),
    description: fail(validateOptionalString(value.description, 'seo.description', SEO_DESC_MAX)),
    canonical: fail(validateOptionalString(value.canonical, 'seo.canonical', 500)),
    og_title: fail(validateOptionalString(value.og_title, 'seo.og_title', SEO_TITLE_MAX)),
    og_description: fail(validateOptionalString(value.og_description, 'seo.og_description', SEO_DESC_MAX)),
    og_image: fail(validateOptionalString(value.og_image, 'seo.og_image', 2000)),
    robots: fail(validateOptionalString(value.robots, 'seo.robots', 80)) || 'index,follow',
  };
}

function sections(value) {
  if (value === undefined) return undefined;
  const normalized = normalizeSections(value);
  if (normalized.some((item) => !SAFARI_SECTION_TYPES.includes(item.type))) {
    throw validationError('sections contain an unsupported type');
  }
  return normalized;
}

/**
 * Validate create/update payloads. Unknown keys are dropped (mass-assignment protection).
 * @param {Record<string, unknown>} body
 * @param {{ partial?: boolean }} [options]
 */
export function validateSafariPayload(body = {}, options = {}) {
  const partial = Boolean(options.partial);
  const input = body && typeof body === 'object' ? body : {};
  const next = {};

  if (!partial || input.title !== undefined) {
    next.title = fail(requireNonEmptyString(input.title, 'title', TITLE_MAX));
  }
  if (input.slug !== undefined) {
    next.slug = fail(validateSlug(input.slug));
  }
  if (input.short_description !== undefined) {
    next.short_description = fail(validateOptionalString(input.short_description, 'short_description', 600));
  }
  if (input.description !== undefined) {
    next.description = fail(validateOptionalString(input.description, 'description', TEXT_MAX));
  }
  if (input.featured !== undefined) next.featured = Boolean(input.featured);
  if (input.display_order !== undefined) {
    next.display_order = fail(validateNonNegativeNumber(input.display_order, 'display_order', { max: 10000 })) || 0;
  }
  if (input.duration !== undefined) {
    next.duration = fail(validateNonNegativeNumber(input.duration, 'duration', { max: 90 }));
  }
  if (input.duration_label !== undefined) {
    next.duration_label = fail(validateOptionalString(input.duration_label, 'duration_label', 80));
  }
  if (input.price !== undefined) next.price = fail(validateNonNegativeNumber(input.price, 'price', { max: 1_000_000 }));
  if (input.price_from !== undefined) {
    next.price_from = fail(validateNonNegativeNumber(input.price_from, 'price_from', { max: 1_000_000 }));
  }
  if (input.currency !== undefined) {
    next.currency = fail(validateOptionalString(input.currency, 'currency', 8)) || 'USD';
  }
  if (input.destination !== undefined) {
    next.destination = fail(validateOptionalString(input.destination, 'destination', 180));
  }
  if (input.difficulty !== undefined) {
    next.difficulty = fail(validateOptionalString(input.difficulty, 'difficulty', 80));
  }
  if (input.best_season !== undefined) {
    next.best_season = fail(validateOptionalString(input.best_season, 'best_season', 180));
  }
  if (input.minimum_people !== undefined) {
    next.minimum_people = fail(validateNonNegativeNumber(input.minimum_people, 'minimum_people', { max: 50 }));
  }
  if (input.maximum_people !== undefined) {
    next.maximum_people = fail(validateNonNegativeNumber(input.maximum_people, 'maximum_people', { max: 50 }));
  }
  if (input.hero_image !== undefined) next.hero_image = mediaRef(input.hero_image, 'hero_image');
  if (input.gallery !== undefined) {
    if (!Array.isArray(input.gallery)) throw validationError('gallery must be an array');
    next.gallery = input.gallery.map((item, i) => mediaRef(item, `gallery[${i}]`));
  }
  const highlights = stringList(input.highlights, 'highlights');
  if (highlights) next.highlights = highlights;
  const itineraryValue = itinerary(input.itinerary);
  if (itineraryValue) next.itinerary = itineraryValue;
  const inclusions = stringList(input.inclusions || input.included, 'inclusions');
  if (inclusions) next.inclusions = inclusions;
  const exclusions = stringList(input.exclusions || input.excluded, 'exclusions');
  if (exclusions) next.exclusions = exclusions;
  if (input.accommodation !== undefined) {
    next.accommodation = fail(validateOptionalString(input.accommodation, 'accommodation', 2000));
  }
  if (input.transport_information !== undefined) {
    next.transport_information = fail(
      validateOptionalString(input.transport_information, 'transport_information', 2000)
    );
  }
  const faqValue = faq(input.faq);
  if (faqValue) next.faq = faqValue;
  if (input.map !== undefined) {
    if (input.map === null) next.map = null;
    else if (typeof input.map !== 'object') throw validationError('map must be an object');
    else {
      next.map = {
        label: fail(validateOptionalString(input.map.label, 'map.label', 180)),
        embed_url: fail(validateOptionalString(input.map.embed_url, 'map.embed_url', 2000)),
        lat: input.map.lat ?? null,
        lng: input.map.lng ?? null,
        notes: fail(validateOptionalString(input.map.notes, 'map.notes', 1000)),
      };
    }
  }
  const seoValue = seo(input.seo);
  if (seoValue) next.seo = seoValue;
  const sectionValue = sections(input.sections);
  if (sectionValue) next.sections = sectionValue;
  if (input.lodge_ids !== undefined) {
    const raw = Array.isArray(input.lodge_ids)
      ? input.lodge_ids
      : String(input.lodge_ids || '')
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean);
    next.lodge_ids = [...new Set(raw.map((item) => String(item)))].slice(0, 40);
  }

  if (!partial && !next.title) throw validationError('title is required');
  return next;
}

export function parseAdminQuery(query = {}) {
  const pagination = parsePagination(query);
  const status = query.status && Object.values(SafariStatus).includes(query.status) ? query.status : null;
  const sort = ['newest', 'oldest', 'display_order', 'updated'].includes(query.sort) ? query.sort : 'newest';
  return {
    ...pagination,
    q: typeof query.q === 'string' ? query.q.trim().slice(0, 80) : '',
    status,
    destination: typeof query.destination === 'string' ? query.destination.trim().slice(0, 80) : '',
    featured: query.featured === 'true' ? true : query.featured === 'false' ? false : null,
    duration: query.duration ? Number.parseInt(String(query.duration), 10) : null,
    sort,
  };
}

export function parsePublicQuery(query = {}) {
  const pagination = parsePagination(query);
  return {
    ...pagination,
    q: typeof query.q === 'string' ? query.q.trim().slice(0, 80) : '',
    destination: typeof query.destination === 'string' ? query.destination.trim().slice(0, 80) : '',
    featured: query.featured === 'true' ? true : query.featured === 'false' ? false : null,
    sort: ['newest', 'display_order'].includes(query.sort) ? query.sort : 'display_order',
  };
}

export { emptySafariDocument, DEFAULT_SAFARI_SECTIONS };
