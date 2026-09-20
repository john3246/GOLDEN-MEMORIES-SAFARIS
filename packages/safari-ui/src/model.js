import { DEFAULT_SAFARI_SECTIONS, SAFARI_SECTION_TYPES } from '@gm-safaris/shared-types';

/**
 * Empty draft document used by create + duplicate.
 * @param {Partial<Record<string, unknown>>} [overrides]
 */
export function emptySafariDocument(overrides = {}) {
  return {
    title: '',
    slug: '',
    short_description: '',
    description: '',
    featured: false,
    display_order: 0,
    duration: null,
    duration_label: '',
    price: null,
    price_from: null,
    currency: 'USD',
    destination: '',
    difficulty: '',
    best_season: '',
    minimum_people: 1,
    maximum_people: null,
    hero_image: null,
    gallery: [],
    highlights: [],
    itinerary: [],
    lodge_ids: [],
    inclusions: [],
    exclusions: [],
    accommodation: '',
    transport_information: '',
    faq: [],
    map: null,
    seo: {
      title: '',
      description: '',
      canonical: '',
      og_title: '',
      og_description: '',
      og_image: '',
      robots: 'index,follow',
    },
    sections: DEFAULT_SAFARI_SECTIONS.map((s) => ({ ...s })),
    ...overrides,
  };
}

/**
 * Normalize section order from CMS payloads.
 * @param {unknown} sections
 */
export function normalizeSections(sections) {
  const incoming = Array.isArray(sections) ? sections : [];
  const byType = new Map(
    incoming
      .filter((item) => item && SAFARI_SECTION_TYPES.includes(item.type))
      .map((item) => [item.type, item])
  );

  return SAFARI_SECTION_TYPES.map((type, index) => {
    const existing = byType.get(type);
    const order =
      typeof existing?.order === 'number' && Number.isFinite(existing.order)
        ? existing.order
        : index;
    return {
      type,
      enabled: existing ? existing.enabled !== false : true,
      order,
    };
  }).sort((a, b) => a.order - b.order || SAFARI_SECTION_TYPES.indexOf(a.type) - SAFARI_SECTION_TYPES.indexOf(b.type));
}

/**
 * Ordered enabled sections for rendering.
 * @param {{ sections?: Array<{ type: string, enabled?: boolean, order?: number }> }} doc
 */
export function enabledSections(doc) {
  return normalizeSections(doc?.sections).filter((section) => section.enabled);
}

export function normalizeItineraryDay(day, index = 0) {
  if (!day || typeof day !== 'object') {
    return { day: `Day ${index + 1}`, title: '', description: '', body: '' };
  }
  const text = String(day.description || day.body || '').trim();
  return {
    ...day,
    day: day.day || `Day ${index + 1}`,
    title: day.title || '',
    description: text,
    body: text,
    accommodation: day.accommodation || day.stay || '',
  };
}

export function normalizeItinerary(value) {
  if (!Array.isArray(value)) return [];
  return value.map((day, index) => normalizeItineraryDay(day, index));
}

/** @param {Record<string, unknown>} [doc] */
export function hasSafariPrice(doc = {}) {
  if (!doc || typeof doc !== 'object') return false;
  const price = Number(doc.price_from ?? doc.price);
  return Number.isFinite(price) && price > 0;
}

export function safariCompletenessErrors(doc = {}) {
  const errors = [];
  if (!hasSafariPrice(doc)) {
    errors.push('Add a price per person before you can save or publish this tour.');
  }

  const days = Number(doc.duration);
  if (!Number.isInteger(days) || days < 1) {
    errors.push('Set the duration in days before you can save or publish this tour.');
  }

  const itinerary = Array.isArray(doc.itinerary) ? doc.itinerary : [];
  if (Number.isInteger(days) && days >= 1) {
    if (itinerary.length !== days) {
      errors.push(
        `The itinerary must have exactly ${days} day${days === 1 ? '' : 's'} to match the duration. You currently have ${itinerary.length}.`
      );
    } else if (itinerary.some((day) => !String(day?.title || '').trim())) {
      errors.push('Every itinerary day needs a title before you can save or publish.');
    }
  }

  return errors;
}

/**
 * Card-shaped view used by existing `.safari-card` markup.
 * @param {Record<string, unknown>} doc
 */
export function toSafariCardData(doc) {
  const hero = doc?.hero_image && typeof doc.hero_image === 'object' ? doc.hero_image : null;
  return {
    slug: doc.slug,
    title: doc.title || 'Untitled safari',
    duration: doc.duration_label || (doc.duration ? `${doc.duration} Days` : ''),
    places: doc.destination || '',
    image: hero?.url || '',
    featured: Boolean(doc.featured),
    activity: doc.difficulty || '',
    price_from: doc.price_from ?? doc.price,
    currency: doc.currency || 'USD',
  };
}
