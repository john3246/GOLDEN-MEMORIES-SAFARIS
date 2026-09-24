import { escapeAttr, escapeHtml, paragraphs } from './escape.js';

export function headingId(text, index = 0) {
  const slug = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `blog-${slug || `section-${index + 1}`}`;
}

export function blogTocItems(blocks = []) {
  const used = new Map();
  return (blocks || [])
    .filter((block) => block.type === 'heading' && String(block.text || '').trim())
    .map((block, index) => {
      let id = headingId(block.text, index);
      const count = used.get(id) || 0;
      used.set(id, count + 1);
      if (count) id = `${id}-${count + 1}`;
      return { id, text: String(block.text).trim(), level: Number(block.level) === 3 ? 3 : 2 };
    });
}

function imageTag(src, alt, { caption = '', className = '', sizes = '(min-width: 1024px) 720px, 100vw' } = {}) {
  if (!src) return '';
  return `
    <figure class="${className}">
      <img
        src="${escapeAttr(src)}"
        alt="${escapeAttr(alt || caption)}"
        loading="lazy"
        decoding="async"
        sizes="${escapeAttr(sizes)}"
        width="1200"
        height="800"
      />
      ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}
    </figure>`;
}

function renderList(block) {
  const items = (block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  if (!items) return '';
  const tag = block.list_style === 'ol' ? 'ol' : 'ul';
  return `<${tag} class="blog-list">${items}</${tag}>`;
}

function renderCta(block) {
  const href = block.href || block.url;
  const label = block.text || block.title || 'Learn more';
  if (!href || !label) return '';
  const variant = block.variant === 'navy' ? 'btn-navy' : block.variant === 'light' ? 'btn-light' : 'btn-gold';
  const target = block.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<p class="blog-cta-wrap"><a class="${variant} !rounded-none" href="${escapeAttr(href)}"${target}>${escapeHtml(label)}</a></p>`;
}

function renderCallout(block) {
  const kind = block.callout_type || 'tip';
  const title =
    block.title || (kind === 'warning' ? 'Good to know' : kind === 'info' ? 'Safari note' : 'Safari tip');
  const body = block.text ? paragraphs(block.text) : '';
  if (!body && !title) return '';
  return `
    <aside class="blog-callout blog-callout--${escapeAttr(kind)}" data-callout="${escapeAttr(kind)}">
      <p class="blog-callout-kicker">${escapeHtml(title)}</p>
      ${body}
    </aside>`;
}

function renderMap(block) {
  if (!block.title && !block.location && !block.days && !block.text) return '';
  const query = encodeURIComponent(block.location || block.title || 'Tanzania');
  const embed =
    block.embed_url ||
    `https://maps.google.com/maps?q=${query}&z=8&output=embed`;
  return `
    <section class="blog-map">
      ${block.title ? `<h3 class="blog-map-title">${escapeHtml(block.title)}</h3>` : ''}
      ${block.location ? `<p class="blog-map-place">${escapeHtml(block.location)}</p>` : ''}
      ${block.text ? paragraphs(block.text) : ''}
      ${block.days ? `<div class="blog-map-days">${paragraphs(block.days)}</div>` : ''}
      <div class="blog-map-embed">
        <iframe src="${escapeAttr(embed)}" title="${escapeAttr(block.title || block.location || 'Map')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </section>`;
}

function renderGallery(block) {
  const images = block.images || [];
  if (!images.length) return '';
  const mode = block.gallery_mode || 'grid';
  return `
    <div class="blog-gallery blog-gallery--${escapeAttr(mode)}" data-gallery-mode="${escapeAttr(mode)}">
      ${images
        .map(
          (image, index) => `
        <button class="blog-gallery-item" type="button" data-blog-lightbox="${escapeAttr(image.url)}" data-blog-alt="${escapeAttr(image.alt || image.caption || '')}">
          <img src="${escapeAttr(image.url)}" alt="${escapeAttr(image.alt || image.caption || `Gallery photo ${index + 1}`)}" loading="lazy" decoding="async" width="800" height="600" />
          ${image.caption ? `<span>${escapeHtml(image.caption)}</span>` : ''}
        </button>`
        )
        .join('')}
    </div>`;
}

function renderImage(block) {
  const src = block.url || block.images?.[0]?.url;
  if (!src) return '';
  const caption = block.caption || block.images?.[0]?.caption || '';
  const alt = block.alt || block.images?.[0]?.alt || caption;
  const layout = block.layout || 'full';
  return imageTag(src, alt, {
    caption,
    className: `blog-figure blog-figure--${layout}`,
  }).replace(
    '<img',
    `<img data-blog-lightbox="${escapeAttr(src)}" data-blog-alt="${escapeAttr(alt)}"`
  );
}

/**
 * @param {Array<Record<string, unknown>>} blocks
 * @param {{ embedTour?: (slug: string) => string, embedLodge?: (id: string) => string }} [options]
 */
export function renderBlogBlocks(blocks = [], options = {}) {
  const toc = blogTocItems(blocks);
  let headingIndex = 0;
  return (blocks || [])
    .map((block) => {
      if (block.type === 'heading' && block.text) {
        const item = toc[headingIndex++];
        const tag = item?.level === 3 ? 'h3' : 'h2';
        return `<${tag} class="blog-heading" id="${escapeAttr(item?.id || headingId(block.text))}">${escapeHtml(block.text)}</${tag}>`;
      }
      if (block.type === 'quote' && block.text) {
        return `<blockquote class="blog-quote"><p>${escapeHtml(block.text)}</p></blockquote>`;
      }
      if (block.type === 'list') return renderList(block);
      if (block.type === 'image') return renderImage(block);
      if (block.type === 'gallery') return renderGallery(block);
      if (block.type === 'cta') return renderCta(block);
      if (block.type === 'callout') return renderCallout(block);
      if (block.type === 'map') return renderMap(block);
      if (block.type === 'tours') {
        const html = (block.tour_slugs || []).map((slug) => options.embedTour?.(slug) || '').join('');
        return html ? `<div class="blog-embed-grid">${html}</div>` : '';
      }
      if (block.type === 'lodges') {
        const html = (block.lodge_ids || []).map((id) => options.embedLodge?.(id) || '').join('');
        return html ? `<div class="blog-embed-grid">${html}</div>` : '';
      }
      if (block.text) return paragraphs(block.text);
      return '';
    })
    .filter(Boolean)
    .join('');
}
