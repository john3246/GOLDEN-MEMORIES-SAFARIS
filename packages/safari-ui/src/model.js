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
