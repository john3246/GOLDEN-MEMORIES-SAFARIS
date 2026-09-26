import { DEFAULT_SAFARI_SECTIONS, SAFARI_SECTION_TYPES } from '@gm-safaris/shared-types';

export const SEO_TITLE_MAX = 70;

/**
 * User-facing package copy uses "4 Day", not "4-Day".
 * Spaced dashes become commas. Slugs, URLs, and CSS keep their hyphens.
 * Duration labels such as "4 Days / 3 Nights" are left as written.
 */
export function safariPackageTitle(value, options = {}) {
  const commas = options.commas !== false;
  let text = String(value || '')
    .replace(/\b(\d+)-Days\b/gi, '$1 Days')
    .replace(/\b(\d+)-Day\b/gi, '$1 Day');
  if (commas) {
    text = text
      .replace(/(\S)-(\s)/g, '$1,$2')
      .replace(/\s+[–—]\s+/g, ', ')
      .replace(/\s+-\s+/g, ', ');
  }
  return text.replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim();
}

/** Google-safe title: at most 70 characters, cut on a word boundary. */
export function clampSeoTitle(value, fallback = '') {
  const text = safariPackageTitle(String(value || fallback || '')).trim();
  if (!text) return '';
  if (text.length <= SEO_TITLE_MAX) return text;
  const slice = text.slice(0, SEO_TITLE_MAX);
  const cut = slice.lastIndexOf(' ');
  return (cut >= 40 ? slice.slice(0, cut) : slice).replace(/[,:;.-]+$/g, '').trim();
}

/**
 * Empty draft document used by create + duplicate.
 * @param {Partial<Record<string, unknown>>} [overrides]
 */
export function emptySafariDocument(overrides = {}) {
  const doc = {
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
  doc.title = safariPackageTitle(doc.title);
  if (doc.short_description) doc.short_description = safariPackageTitle(doc.short_description);
  if (doc.description) doc.description = safariPackageTitle(doc.description, { commas: false });
  if (doc.seo && typeof doc.seo === 'object') {
    doc.seo.title = clampSeoTitle(doc.seo.title, doc.title);
    if (doc.seo.description) doc.seo.description = safariPackageTitle(doc.seo.description, { commas: false });
    doc.seo.og_title = clampSeoTitle(doc.seo.og_title, doc.seo.title);
    if (doc.seo.og_description) doc.seo.og_description = safariPackageTitle(doc.seo.og_description, { commas: false });
  }
  if (doc.hero_image?.alt) {
    doc.hero_image = { ...doc.hero_image, alt: safariPackageTitle(doc.hero_image.alt) };
  }
  if (Array.isArray(doc.itinerary)) {
    doc.itinerary = doc.itinerary.map((day) => {
      if (!day || typeof day !== 'object') return day;
      return {
        ...day,
        title: safariPackageTitle(day.title || ''),
        description: safariPackageTitle(day.description || '', { commas: false }),
      };
    });
  }
  return doc;
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
    title: safariPackageTitle(doc.title || 'Untitled safari'),
    duration: doc.duration_label || (doc.duration ? `${doc.duration} Days` : ''),
    places: doc.destination || '',
    image: hero?.url || doc.image || '',
    featured: Boolean(doc.featured),
    activity: doc.difficulty || '',
    price_from: doc.price_from ?? doc.price,
    currency: doc.currency || 'USD',
  };
}

export function parseDurationDays(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  const text = String(value).trim();
  if (/^\d+$/.test(text)) return Number(text);
  const match = text.match(/\b(\d+)\s*days?\b/i);
  return match ? Number(match[1]) : null;
}

function asStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : item?.text || item?.title || ''))
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mediaList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim() ? { url: item.trim(), alt: '', caption: '' } : null;
      const url = String(item?.url || '').trim();
      return url ? { ...item, url } : null;
    })
    .filter(Boolean);
}

/**
 * Group Safari uses the same itinerary, lodges, gallery, and SEO document as a
 * private safari, plus dated departure fields (dates, start, end, spaces).
 */
export function normalizeGroupSafariDocument(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const durationLabel =
    String(src.duration_label || '').trim() ||
    (typeof src.duration === 'string' && /day/i.test(src.duration) ? String(src.duration).trim() : '');
  const durationDays = parseDurationDays(src.duration_days ?? src.duration) || parseDurationDays(durationLabel);
  const priceValue = src.price_from === '' || src.price_from == null ? Number(src.price) : Number(src.price_from);
  const overview = String(src.overview || src.short_description || '').trim();
  const imageUrl =
    (src.hero_image && typeof src.hero_image === 'object' && src.hero_image.url) || src.image || '';
  const hero =
    src.hero_image && typeof src.hero_image === 'object'
      ? { ...src.hero_image, url: src.hero_image.url || imageUrl }
      : imageUrl
        ? { url: imageUrl, alt: src.title || '', caption: '' }
        : null;
  const itinerarySource = Array.isArray(src.itinerary) && src.itinerary.length ? src.itinerary : src.days;

  return emptySafariDocument({
    ...src,
    product_type: 'join_safari',
    dates: src.dates || src.dates_label || '',
    start: src.start || src.start_date || '',
    end: src.end || src.end_date || '',
    spaces: src.spaces || src.spaces_label || '',
    deposit: src.deposit || 'Join group',
    overview,
    image: imageUrl,
    short_description: src.short_description || overview,
    description: src.description || overview,
    duration: durationDays,
    duration_label: durationLabel || (durationDays ? `${durationDays} Days` : ''),
    price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null,
    price_from: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null,
    currency: src.currency || 'USD',
    destination: src.destination || src.places || '',
    hero_image: hero,
    gallery: mediaList(src.gallery),
    highlights: asStringList(src.highlights),
    inclusions: asStringList(src.inclusions?.length ? src.inclusions : src.included),
    exclusions: asStringList(src.exclusions?.length ? src.exclusions : src.excluded),
    itinerary: normalizeItinerary(itinerarySource),
  });
}

export function emptyGroupSafariDocument(overrides = {}) {
  return normalizeGroupSafariDocument({ title: 'New group safari', ...overrides });
}
