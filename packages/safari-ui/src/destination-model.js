import { DESTINATION_BLOCK_TYPES } from '@gm-safaris/shared-types';

function asLines(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (Array.isArray(item) && item.length >= 2) return `${item[0]} | ${item[1]}`;
        if (item?.title && item?.body) return `${item.title} — ${item.body}`;
        if (item?.q && item?.a) return `${item.q} | ${item.a}`;
        return '';
      })
      .filter(Boolean);
  }
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTitledLines(value) {
  return asLines(value).map((line) => {
    const split = line.split(/\s+[—–:-]\s+| \| /);
    if (split.length > 1) {
      return { title: split[0].trim(), body: split.slice(1).join(' — ').trim() };
    }
    return { title: line, body: line };
  });
}

export function parseFactLines(value) {
  if (Array.isArray(value) && value[0] && Array.isArray(value[0])) {
    return value.filter((row) => row?.[0]);
  }
  return asLines(value).map((line) => {
    const [label, ...rest] = line.split('|');
    return [String(label || '').trim(), rest.join('|').trim() || String(label || '').trim()];
  });
}

export function parseFaqLines(value) {
  if (Array.isArray(value) && value[0]?.q) return value;
  return asLines(value).map((line) => {
    const [q, ...rest] = line.split('|');
    return { q: String(q || '').trim(), a: rest.join('|').trim() };
  });
}

export function parseListLines(value) {
  return asLines(value);
}

function asList(value) {
  return asLines(value);
}

function asCoord(value) {
  if (value == null || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
}

export const DESTINATION_COORDINATES = Object.freeze({
  serengeti: { lat: -2.3333, lng: 34.8333 },
  ngorongoro: { lat: -3.2097, lng: 35.5653 },
  tarangire: { lat: -4.0, lng: 36.0 },
  'lake-manyara': { lat: -3.5833, lng: 35.8333 },
  'arusha-national-park': { lat: -3.25, lng: 36.8333 },
  kilimanjaro: { lat: -3.0674, lng: 37.3556 },
  'lake-eyasi': { lat: -3.6167, lng: 35.0833 },
  zanzibar: { lat: -6.1659, lng: 39.2026 },
  'stone-town': { lat: -6.1639, lng: 39.1979 },
  'safari-from-zanzibar': { lat: -6.1659, lng: 39.2026 },
  ruaha: { lat: -7.75, lng: 34.6 },
  nyerere: { lat: -8.0, lng: 37.75 },
  mikumi: { lat: -7.2, lng: 37.1333 },
});

const MONTH_INDEX = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export const MONTH_SHORT = Object.freeze(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

function monthTokens(text) {
  return String(text || '')
    .toLowerCase()
    .match(/jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?/g) || [];
}

export function monthGuideFromSeasons(seasons = []) {
  const items = Array.isArray(seasons) ? seasons : parseTitledLines(seasons);
  const months = MONTH_SHORT.map((label, index) => ({
    index,
    label,
    active: false,
    title: '',
  }));
  for (const item of items) {
    const title = typeof item === 'string' ? item : item.title || '';
    const body = typeof item === 'string' ? item : item.body || '';
    const hay = `${title} ${body}`;
    if (/year-?round|any month|all year/i.test(hay)) {
      months.forEach((month) => {
        month.active = true;
        if (!month.title) month.title = title;
      });
      continue;
    }
    const tokens = monthTokens(hay).map((token) => MONTH_INDEX[token]);
    if (!tokens.length) continue;
    const start = tokens[0];
    const end = tokens[tokens.length - 1];
    if (start > end) {
      for (let i = start; i < 12; i += 1) {
        months[i].active = true;
        if (!months[i].title) months[i].title = title;
      }
      for (let i = 0; i <= end; i += 1) {
        months[i].active = true;
        if (!months[i].title) months[i].title = title;
      }
    } else {
      for (let i = start; i <= end; i += 1) {
        months[i].active = true;
        if (!months[i].title) months[i].title = title;
      }
    }
  }
  return months;
}

function faqAnswer(faqs, pattern) {
  const rows = Array.isArray(faqs) ? faqs : parseFaqLines(faqs);
  const match = rows.find((item) => pattern.test(item.q || ''));
  return match?.a || '';
}

export function serializeTitledLines(items) {
  if (typeof items === 'string') return items;
  return (items || [])
    .map((item) => (typeof item === 'string' ? item : `${item.title || ''} — ${item.body || ''}`.replace(/\s+—\s+$/, '')))
    .filter(Boolean)
    .join('\n');
}

export function serializeFactLines(items) {
  if (typeof items === 'string') return items;
  return (items || [])
    .map((item) => (Array.isArray(item) ? `${item[0] || ''} | ${item[1] || ''}` : String(item || '')))
    .filter((line) => line.replace('|', '').trim())
    .join('\n');
}

export function serializeFaqLines(items) {
  if (typeof items === 'string') return items;
  return (items || [])
    .map((item) => (item?.q ? `${item.q} | ${item.a || ''}` : String(item || '')))
    .filter(Boolean)
    .join('\n');
}

export function paragraphsToDestinationBlocks(paragraphs = []) {
  return asLines(paragraphs).map((text, index) => ({
    id: `block_${index + 1}`,
    type: 'paragraph',
    text,
    url: '',
    alt: '',
    caption: '',
    headers: [],
    rows: [],
  }));
}

function normalizeTable(block) {
  const headers = Array.isArray(block.headers)
    ? block.headers.map((item) => String(item || '').trim()).filter(Boolean)
    : String(block.headers || '')
        .split('|')
        .map((item) => item.trim())
        .filter(Boolean);
  const rows = Array.isArray(block.rows)
    ? block.rows.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell || '').trim()) : String(row || '').split('|').map((cell) => cell.trim())))
    : String(block.rows || block.text || '')
        .split('\n')
        .map((line) => line.split('|').map((cell) => cell.trim()))
        .filter((row) => row.some(Boolean));
  return {
    headers,
    rows,
    headersText: headers.join(' | '),
    rowsText: rows.map((row) => row.join(' | ')).join('\n'),
  };
}

export function normalizeDestinationBlocks(blocks, paragraphs) {
  const incoming = Array.isArray(blocks) && blocks.length ? blocks : paragraphsToDestinationBlocks(paragraphs);
  return incoming
    .filter((block) => block && DESTINATION_BLOCK_TYPES.includes(block.type))
    .map((block, index) => {
      const table = block.type === 'table' ? normalizeTable(block) : { headers: [], rows: [], headersText: '', rowsText: '' };
      return {
        id: block.id || `block_${index + 1}`,
        type: block.type,
        text: block.text || '',
        url: block.url || '',
        alt: block.alt || '',
        caption: block.caption || '',
        headers: table.headers,
        rows: table.rows,
        headersText: table.headersText,
        rowsText: table.rowsText,
      };
    });
}

export function emptyDestinationDocument(overrides = {}) {
  return normalizeDestinationDocument({
    title: '',
    slug: '',
    region: '',
    kicker: '',
    tagline: '',
    blurb: '',
    location: '',
    cta: 'Plan this safari',
    image: '',
    gallery: [],
    paragraphs: '',
    blocks: [],
    highlights: '',
    facts: '',
    seasons: '',
    wildlife: '',
    activities: '',
    attractions: '',
    faqs: '',
    country: 'Tanzania',
    image_alt: '',
    lat: '',
    lng: '',
    climate: '',
    getting_there: '',
    airstrips: '',
    entry_fees: '',
    match: '',
    tour_slugs: [],
    lodge_ids: [],
    related_post_slugs: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    og_image: '',
    ...overrides,
  });
}

export function normalizeDestinationDocument(overrides = {}) {
  const gallery = Array.isArray(overrides.gallery)
    ? overrides.gallery.map((item) => (typeof item === 'string' ? item : item?.url || '')).filter(Boolean)
    : asLines(overrides.gallery);
  const blocks = normalizeDestinationBlocks(overrides.blocks, overrides.paragraphs);
  const paragraphText = blocks
    .filter((block) => block.type === 'paragraph' && block.text)
    .map((block) => block.text);
  const fallbackCoords = DESTINATION_COORDINATES[overrides.slug] || {};
  const coords = overrides.coordinates && typeof overrides.coordinates === 'object' ? overrides.coordinates : {};
  const lat = asCoord(overrides.lat ?? coords.lat ?? fallbackCoords.lat);
  const lng = asCoord(overrides.lng ?? coords.lng ?? fallbackCoords.lng);
  const image =
    typeof overrides.image === 'string'
      ? overrides.image
      : overrides.image?.url || overrides.heroImage?.url || overrides.hero_image?.url || '';
  const imageAlt =
    overrides.image_alt ||
    overrides.hero_image?.alt ||
    overrides.heroImage?.alt ||
    overrides.title ||
    '';
  return {
    title: overrides.title || '',
    slug: overrides.slug || '',
    region: overrides.region || '',
    country: overrides.country || 'Tanzania',
    kicker: overrides.kicker || overrides.region || '',
    tagline: overrides.tagline || overrides.blurb || '',
    blurb: overrides.blurb || overrides.tagline || overrides.excerpt || '',
    excerpt: overrides.excerpt || overrides.blurb || overrides.tagline || '',
    location: overrides.location || overrides.region || '',
    cta: overrides.cta || 'Plan this safari',
    image,
    image_alt: imageAlt,
    hero_image: { url: image, alt: imageAlt },
    gallery,
    lat,
    lng,
    climate: serializeTitledLines(overrides.climate || overrides.climateInfo),
    getting_there: String(overrides.getting_there || overrides.gettingThere || '').trim(),
    airstrips: asLines(overrides.airstrips).join('\n'),
    entry_fees: String(overrides.entry_fees || overrides.entryFeesAndRules || overrides.entryFees || '').trim(),
    match: asList(overrides.match || overrides.match_terms).join('\n'),
    tour_slugs: asList(overrides.tour_slugs || overrides.tours),
    lodge_ids: asList(overrides.lodge_ids || overrides.accommodations),
    related_post_slugs: asList(overrides.related_post_slugs || overrides.relatedArticles),
    paragraphs: paragraphText.join('\n') || asLines(overrides.paragraphs).join('\n'),
    blocks,
    highlights: serializeTitledLines(overrides.highlights),
    facts: serializeFactLines(overrides.facts),
    seasons: serializeTitledLines(overrides.seasons || overrides.bestTimeToVisit),
    wildlife: asLines(overrides.wildlife).join('\n'),
    activities: serializeTitledLines(overrides.activities),
    attractions: asLines(overrides.attractions).join('\n'),
    faqs: serializeFaqLines(overrides.faqs),
    seo_title: overrides.seo_title || overrides.seo?.title || overrides.metaTitle || '',
    seo_description: overrides.seo_description || overrides.seo?.description || overrides.metaDescription || '',
    seo_keywords: overrides.seo_keywords || overrides.seo?.keywords || '',
    canonical_url: overrides.canonical_url || overrides.seo?.canonical || overrides.canonicalUrl || '',
    og_image: overrides.og_image || overrides.seo?.og_image || overrides.ogImage || image,
  };
}

export function destinationForWebsite(doc, existing = {}) {
  const normalized = normalizeDestinationDocument({ ...existing, ...doc, title: doc.title || existing.name || existing.title });
  const paragraphs = asLines(normalized.paragraphs);
  const climate = parseTitledLines(normalized.climate);
  const gettingThere = normalized.getting_there || faqAnswer(existing.faqs || normalized.faqs, /how do i get|getting there|how to get/i);
  const airstrips = parseListLines(normalized.airstrips);
  const match = parseListLines(normalized.match);
  const fallback = DESTINATION_COORDINATES[normalized.slug || existing.slug] || {};
  return {
    ...existing,
    slug: normalized.slug || existing.slug,
    name: normalized.title || existing.name,
    kicker: normalized.kicker || existing.kicker || 'Tanzania',
    tagline: normalized.tagline || existing.tagline || '',
    region: normalized.region || existing.region || '',
    country: normalized.country || existing.country || 'Tanzania',
    cta: normalized.cta || existing.cta || 'Plan this safari',
    image: normalized.image || existing.image || '',
    imageAlt: normalized.image_alt || existing.imageAlt || existing.name || '',
    heroImage: { url: normalized.image || existing.image || '', alt: normalized.image_alt || existing.name || '' },
    gallery: normalized.gallery.length ? normalized.gallery : existing.gallery || [],
    match: match.length ? match : existing.match || [normalized.slug],
    lat: normalized.lat === '' ? existing.lat ?? fallback.lat ?? '' : normalized.lat,
    lng: normalized.lng === '' ? existing.lng ?? fallback.lng ?? '' : normalized.lng,
    coordinates: {
      lat: Number(normalized.lat === '' ? existing.lat ?? fallback.lat : normalized.lat) || '',
      lng: Number(normalized.lng === '' ? existing.lng ?? fallback.lng : normalized.lng) || '',
    },
    climate: climate.length ? climate : existing.climate || [],
    gettingThere: gettingThere || existing.gettingThere || '',
    airstrips: airstrips.length ? airstrips : existing.airstrips || [],
    entryFees: normalized.entry_fees || existing.entryFees || '',
    tourSlugs: normalized.tour_slugs.length ? normalized.tour_slugs : existing.tourSlugs || [],
    lodgeIds: normalized.lodge_ids.length ? normalized.lodge_ids : existing.lodgeIds || [],
    relatedPostSlugs: normalized.related_post_slugs.length ? normalized.related_post_slugs : existing.relatedPostSlugs || [],
    monthGuide: monthGuideFromSeasons(normalized.seasons || existing.seasons),
    blocks: normalized.blocks,
    paragraphs: paragraphs.length ? paragraphs : existing.paragraphs || [],
    highlights: parseTitledLines(normalized.highlights).length ? parseTitledLines(normalized.highlights) : existing.highlights || [],
    facts: parseFactLines(normalized.facts).length ? parseFactLines(normalized.facts) : existing.facts || [],
    seasons: parseTitledLines(normalized.seasons).length ? parseTitledLines(normalized.seasons) : existing.seasons || [],
    wildlife: parseListLines(normalized.wildlife).length ? parseListLines(normalized.wildlife) : existing.wildlife || [],
    activities: parseTitledLines(normalized.activities).length ? parseTitledLines(normalized.activities) : existing.activities || [],
    attractions: parseListLines(normalized.attractions).length ? parseListLines(normalized.attractions) : existing.attractions || [],
    faqs: parseFaqLines(normalized.faqs).length ? parseFaqLines(normalized.faqs) : existing.faqs || [],
    location: normalized.location || existing.location || '',
    seo_title: normalized.seo_title,
    seo_description: normalized.seo_description,
    seo_keywords: normalized.seo_keywords,
    canonical_url: normalized.canonical_url,
    og_image: normalized.og_image,
  };
}
