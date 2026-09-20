import { BLOG_BLOCK_TYPES, BLOG_SECTION_TYPES, DEFAULT_BLOG_SECTIONS } from '@gm-safaris/shared-types';

export function paragraphsToBlocks(paragraphs = []) {
  return (Array.isArray(paragraphs) ? paragraphs : String(paragraphs || '').split('\n'))
    .map((text) => String(text || '').trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `block_${index + 1}`,
      type: 'paragraph',
      text,
      url: '',
      alt: '',
    }));
}

export function blocksToParagraphs(blocks = []) {
  return (blocks || [])
    .filter((block) => block && ['paragraph', 'heading', 'quote'].includes(block.type))
    .map((block) => String(block.text || '').trim())
    .filter(Boolean);
}

export function normalizeBlogSections(sections) {
  const incoming = Array.isArray(sections) ? sections : [];
  const byType = new Map(
    incoming
      .filter((item) => item && BLOG_SECTION_TYPES.includes(item.type))
      .map((item) => [item.type, item])
  );
  return BLOG_SECTION_TYPES.map((type, index) => {
    const existing = byType.get(type);
    return {
      type,
      enabled: existing ? existing.enabled !== false : true,
      order: typeof existing?.order === 'number' ? existing.order : index,
    };
  }).sort((a, b) => a.order - b.order || BLOG_SECTION_TYPES.indexOf(a.type) - BLOG_SECTION_TYPES.indexOf(b.type));
}

export function emptyBlogDocument(overrides = {}) {
  const paragraphs = Array.isArray(overrides.paragraphs)
    ? overrides.paragraphs
    : String(overrides.paragraphs || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
  const blocks = Array.isArray(overrides.blocks) && overrides.blocks.length
    ? overrides.blocks
    : paragraphsToBlocks(paragraphs);
  const heroUrl = overrides.hero_image?.url || overrides.image || '';
  return {
    title: '',
    slug: '',
    topic: 'safari',
    date: '',
    excerpt: '',
    kicker: '',
    author: 'Golden Memories Safaris',
    image: heroUrl,
    hero_image: {
      id: overrides.hero_image?.id || null,
      url: heroUrl,
      alt: overrides.hero_image?.alt || overrides.title || '',
      caption: overrides.hero_image?.caption || '',
    },
    blocks,
    paragraphs: blocksToParagraphs(blocks),
    gallery: Array.isArray(overrides.gallery) ? overrides.gallery : [],
    cta_label: 'Plan this trip',
    cta_href: '/contact/',
    seo: {
      title: '',
      description: '',
      ...((overrides.seo && typeof overrides.seo === 'object' && overrides.seo) || {}),
    },
    seo_title: overrides.seo_title || '',
    seo_description: overrides.seo_description || '',
    sections: DEFAULT_BLOG_SECTIONS.map((item) => ({ ...item })),
    ...overrides,
    blocks: Array.isArray(overrides.blocks) && overrides.blocks.length ? overrides.blocks : blocks,
    paragraphs: Array.isArray(overrides.paragraphs) && overrides.paragraphs.length
      ? overrides.paragraphs
      : blocksToParagraphs(blocks),
    image: heroUrl || overrides.image || '',
    sections: normalizeBlogSections(overrides.sections),
  };
}

export function normalizeBlogDocument(input = {}) {
  const doc = emptyBlogDocument(input);
  doc.blocks = (doc.blocks || [])
    .filter((block) => block && BLOG_BLOCK_TYPES.includes(block.type))
    .map((block, index) => ({
      id: block.id || `block_${index + 1}`,
      type: block.type,
      text: String(block.text || ''),
      url: String(block.url || ''),
      alt: String(block.alt || ''),
    }));
  if (!doc.blocks.length && (doc.paragraphs || []).length) {
    doc.blocks = paragraphsToBlocks(doc.paragraphs);
  }
  doc.paragraphs = blocksToParagraphs(doc.blocks);
  const heroUrl = doc.hero_image?.url || doc.image || '';
  doc.image = heroUrl;
  doc.hero_image = {
    id: doc.hero_image?.id || null,
    url: heroUrl,
    alt: doc.hero_image?.alt || doc.title || '',
    caption: doc.hero_image?.caption || '',
  };
  doc.seo = {
    title: doc.seo?.title || doc.seo_title || doc.title || '',
    description: doc.seo?.description || doc.seo_description || doc.excerpt || '',
  };
  doc.seo_title = doc.seo.title;
  doc.seo_description = doc.seo.description;
  doc.sections = normalizeBlogSections(doc.sections);
  return doc;
}

export function enabledBlogSections(doc) {
  return normalizeBlogSections(doc?.sections).filter((item) => item.enabled);
}
