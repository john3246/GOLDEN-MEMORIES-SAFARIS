import {
  BLOG_BLOCK_TYPES,
  BLOG_CALLOUT_TYPES,
  BLOG_CTA_VARIANTS,
  BLOG_GALLERY_MODES,
  BLOG_IMAGE_LAYOUTS,
  BLOG_SECTION_TYPES,
  BLOG_TOPIC_SLUGS,
  DEFAULT_BLOG_SECTIONS,
} from '@gm-safaris/shared-types';

function asText(value) {
  return String(value ?? '').trim();
}

function asList(value) {
  if (Array.isArray(value)) return value.map((item) => asText(item)).filter(Boolean);
  return asText(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asImages(value, fallbackUrl = '', fallbackAlt = '', fallbackCaption = '') {
  const source = Array.isArray(value) ? value : [];
  const images = source
    .map((item) => {
      if (typeof item === 'string') return { url: asText(item), alt: fallbackAlt, caption: fallbackCaption };
      return {
        url: asText(item?.url),
        alt: asText(item?.alt || fallbackAlt),
        caption: asText(item?.caption || fallbackCaption),
      };
    })
    .filter((item) => item.url);
  if (!images.length && fallbackUrl) {
    images.push({ url: fallbackUrl, alt: fallbackAlt, caption: fallbackCaption });
  }
  return images;
}

function wordCount(value) {
  return asText(value).split(/\s+/).filter(Boolean).length;
}

export function estimateReadTime(doc = {}) {
  let words = wordCount(doc.title) + wordCount(doc.excerpt) + wordCount(doc.kicker);
  const paragraphList = Array.isArray(doc.paragraphs) ? doc.paragraphs : [doc.paragraphs];
  for (const paragraph of paragraphList) words += wordCount(paragraph);
  for (const block of doc.blocks || []) {
    words += wordCount(block.text) + wordCount(block.caption) + wordCount(block.title);
    words += wordCount(block.location) + wordCount(block.days);
    for (const item of block.items || []) words += wordCount(item);
    for (const image of block.images || []) words += wordCount(image.caption) + wordCount(image.alt);
  }
  return Math.max(1, Math.round(words / 200) || 1);
}

export function normalizeBlogSections(input) {
  const incoming = Array.isArray(input)
    ? input
        .filter((item) => item && BLOG_SECTION_TYPES.includes(item.type))
        .map((item, index) => ({ type: item.type, enabled: item.enabled !== false, order: item.order ?? index }))
    : [];
  return BLOG_SECTION_TYPES.map((type, index) => {
    const existing = incoming.find((item) => item.type === type);
    return {
      type,
      enabled: existing ? existing.enabled !== false : true,
      order: existing?.order ?? index,
    };
  }).sort((a, b) => a.order - b.order || BLOG_SECTION_TYPES.indexOf(a.type) - BLOG_SECTION_TYPES.indexOf(b.type));
}

export function enabledBlogSections(doc) {
  return normalizeBlogSections(doc?.sections).filter((item) => item.enabled);
}

export function paragraphsToBlocks(paragraphs) {
  const list = Array.isArray(paragraphs)
    ? paragraphs
    : String(paragraphs || '')
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
  return list
    .map((text, index) => ({
      id: `p_${index + 1}`,
      type: 'paragraph',
      text: asText(text),
      url: '',
      alt: '',
    }))
    .filter((block) => block.text);
}

export function blocksToParagraphs(blocks) {
  return (blocks || [])
    .filter((block) => block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote')
    .map((block) => asText(block.text))
    .filter(Boolean);
}

function normalizeBlock(block, index) {
  const type = BLOG_BLOCK_TYPES.includes(block?.type) ? block.type : 'paragraph';
  const alt = asText(block?.alt);
  const caption = asText(block?.caption);
  const url = asText(block?.url);
  const images = asImages(block?.images, url, alt, caption);
  const calloutType = BLOG_CALLOUT_TYPES.includes(block?.callout_type) ? block.callout_type : 'tip';
  return {
    id: asText(block?.id) || `block_${index + 1}`,
    type,
    text: asText(block?.text),
    url: url || images[0]?.url || '',
    alt: alt || images[0]?.alt || '',
    caption,
    title: asText(block?.title),
    level: Number(block?.level) === 3 ? 3 : 2,
    layout: BLOG_IMAGE_LAYOUTS.includes(block?.layout) ? block.layout : 'full',
    items: asList(block?.items || block?.itemsText),
    list_style: block?.list_style === 'ol' ? 'ol' : 'ul',
    variant: BLOG_CTA_VARIANTS.includes(block?.variant) ? block.variant : 'gold',
    href: asText(block?.href || (type === 'cta' ? block?.url : '')),
    target: block?.target === '_blank' ? '_blank' : '_self',
    callout_type: calloutType,
    gallery_mode: BLOG_GALLERY_MODES.includes(block?.gallery_mode) ? block.gallery_mode : 'grid',
    images,
    location: asText(block?.location),
    days: asText(block?.days),
    embed_url: asText(block?.embed_url),
    tour_slugs: asList(block?.tour_slugs),
    lodge_ids: asList(block?.lodge_ids),
    destination_slugs: asList(block?.destination_slugs),
  };
}

export function emptyBlogDocument(overrides = {}) {
  return normalizeBlogDocument({
    id: '',
    title: '',
    slug: '',
    topic: 'safari',
    kicker: '',
    excerpt: '',
    date: '',
    author: 'Golden Memories Safaris',
    author_role: '',
    author_bio: '',
    author_image: '',
    featured: false,
    read_time: 1,
    hero_image: { url: '', alt: '' },
    image: '',
    gallery: [],
    paragraphs: [],
    blocks: [],
    sections: DEFAULT_BLOG_SECTIONS.map((item) => ({ ...item })),
    featured_tour_slugs: [],
    featured_lodge_ids: [],
    destination_slugs: [],
    cta_label: 'Plan this safari',
    cta_href: '/contact/',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    og_image: '',
    seo: { title: '', description: '', keywords: '', canonical: '', og_image: '' },
    ...overrides,
  });
}

export function normalizeBlogDocument(input = {}) {
  const hero =
    input.hero_image && typeof input.hero_image === 'object'
      ? { url: asText(input.hero_image.url || input.image), alt: asText(input.hero_image.alt || input.title) }
      : { url: asText(input.image), alt: asText(input.title) };
  const topicRaw = asText(input.topic || input.category) || 'safari';
  const topic = BLOG_TOPIC_SLUGS.includes(topicRaw) ? topicRaw : topicRaw;
  const rawBlocks = Array.isArray(input.blocks) ? input.blocks : [];
  const blocks = (rawBlocks.length ? rawBlocks : paragraphsToBlocks(input.paragraphs))
    .map((block, index) => normalizeBlock(block, index))
    .filter((block) => BLOG_BLOCK_TYPES.includes(block.type));
  const paragraphs = (() => {
    if (Array.isArray(input.paragraphs) && input.paragraphs.length) {
      return input.paragraphs.map((item) => asText(item)).filter(Boolean);
    }
    if (typeof input.paragraphs === 'string' && input.paragraphs.trim()) {
      return input.paragraphs
        .split(/\n+/)
        .map((item) => asText(item))
        .filter(Boolean);
    }
    return blocksToParagraphs(blocks);
  })();
  const seoTitle = asText(input.seo_title || input.seo?.title);
  const seoDescription = asText(input.seo_description || input.seo?.description);
  const seoKeywords = asText(input.seo_keywords || input.seo?.keywords);
  const canonical = asText(input.canonical_url || input.seo?.canonical);
  const ogImage = asText(input.og_image || input.seo?.og_image || hero.url);
  const draft = {
    id: asText(input.id),
    title: asText(input.title),
    slug: asText(input.slug),
    topic,
    category: topic,
    kicker: asText(input.kicker),
    excerpt: asText(input.excerpt),
    date: asText(input.date || input.publishDate || input.publish_date),
    author: asText(input.author) || 'Golden Memories Safaris',
    author_role: asText(input.author_role || input.authorRole),
    author_bio: asText(input.author_bio || input.authorBio),
    author_image: asText(input.author_image || input.authorImage),
    featured: Boolean(input.featured),
    hero_image: hero,
    image: hero.url,
    gallery: asImages(input.gallery),
    paragraphs,
    blocks,
    sections: normalizeBlogSections(input.sections),
    featured_tour_slugs: asList(input.featured_tour_slugs || input.featuredTours),
    featured_lodge_ids: asList(input.featured_lodge_ids || input.featuredAccommodations),
    destination_slugs: asList(input.destination_slugs || input.destinations),
    cta_label: asText(input.cta_label) || 'Plan this safari',
    cta_href: asText(input.cta_href) || '/contact/',
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: seoKeywords,
    canonical_url: canonical,
    og_image: ogImage,
    seo: {
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
      canonical,
      og_image: ogImage,
    },
  };
  draft.read_time = estimateReadTime(draft);
  return draft;
}

export function blogDocumentHasBody(doc) {
  return Boolean(
    (doc?.blocks || []).some(
      (block) =>
        block?.text ||
        block?.url ||
        block?.href ||
        block?.location ||
        (block?.items || []).length ||
        (block?.images || []).length ||
        (block?.tour_slugs || []).length ||
        (block?.lodge_ids || []).length ||
        (block?.destination_slugs || []).length
    ) ||
      (doc?.paragraphs || []).length ||
      doc?.excerpt
  );
}
