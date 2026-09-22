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
    seo_title: '',
    seo_description: '',
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
  return {
    title: overrides.title || '',
    slug: overrides.slug || '',
    region: overrides.region || '',
    kicker: overrides.kicker || overrides.region || '',
    tagline: overrides.tagline || overrides.blurb || '',
    blurb: overrides.blurb || overrides.tagline || '',
    location: overrides.location || overrides.region || '',
    cta: overrides.cta || 'Plan this safari',
    image: typeof overrides.image === 'string' ? overrides.image : overrides.image?.url || '',
    gallery,
    paragraphs: paragraphText.join('\n') || asLines(overrides.paragraphs).join('\n'),
    blocks,
    highlights: serializeTitledLines(overrides.highlights),
    facts: serializeFactLines(overrides.facts),
    seasons: serializeTitledLines(overrides.seasons),
    wildlife: asLines(overrides.wildlife).join('\n'),
    activities: serializeTitledLines(overrides.activities),
    attractions: asLines(overrides.attractions).join('\n'),
    faqs: serializeFaqLines(overrides.faqs),
    seo_title: overrides.seo_title || overrides.seo?.title || '',
    seo_description: overrides.seo_description || overrides.seo?.description || '',
  };
}

export function destinationForWebsite(doc, existing = {}) {
  const normalized = normalizeDestinationDocument({ ...existing, ...doc, title: doc.title || existing.name || existing.title });
  const paragraphs = asLines(normalized.paragraphs);
  return {
    ...existing,
    slug: normalized.slug || existing.slug,
    name: normalized.title || existing.name,
    kicker: normalized.kicker || existing.kicker || 'Tanzania',
    tagline: normalized.tagline || existing.tagline || '',
    region: normalized.region || existing.region || '',
    cta: normalized.cta || existing.cta || 'Plan this safari',
    image: normalized.image || existing.image || '',
    gallery: normalized.gallery.length ? normalized.gallery : existing.gallery || [],
    match: existing.match || [normalized.slug],
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
  };
}
