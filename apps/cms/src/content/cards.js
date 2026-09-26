export function pill(status, featured) {
  const kind = status === 'PUBLISHED' ? 'is-live' : 'is-draft';
  return `<span class="cms-pill ${kind}">${status || '—'}</span>${featured ? ' <span class="cms-pill">Featured</span>' : ''}`;
}

export function cardImage(url) {
  const src = String(url || '').split('?')[0];
  if (src.endsWith('-card.webp')) return src;
  if (/\/images\/gallery\//.test(src) && src.endsWith('.webp')) {
    return src.replace(/\.webp$/i, '-card.webp');
  }
  if (src) return src;
  return '/images/gallery/serengeti-01-card.webp';
}

export function shortText(value, max = 92) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export function photoCard({ href, previewHref, title, image, kicker, detail, status, featured, itemId, itemType }) {
  const isPublished = status === 'PUBLISHED';
  const toggleBtn = (itemId && itemType)
    ? `<button class="cms-card-btn ${isPublished ? 'cms-card-btn-unpublish' : 'cms-card-btn-publish'}" type="button" data-quick-toggle data-item-id="${itemId}" data-item-type="${itemType}" data-current-status="${status || 'DRAFT'}" title="${isPublished ? 'Unpublish' : 'Publish'}">${isPublished ? 'Unpublish' : 'Publish'}</button>`
    : '';

  const safeTitle = String(title || '').replace(/"/g, '&quot;');

  return `
    <article class="cms-safari-card-v2">
      <div class="cms-card-header">
        <a href="${href}" tabindex="-1" class="cms-card-img-link">
          <img src="${image}" alt="${safeTitle}" loading="lazy" decoding="async" onerror="if(this.dataset.fallback) { this.src=this.dataset.fallback; this.removeAttribute('data-fallback'); }" data-fallback="/images/gallery/serengeti-01-card.webp" />
        </a>
        <div class="cms-card-badge-tl">${kicker ? `<span class="cms-card-pill-kicker">${kicker}</span>` : ''}</div>
        <div class="cms-card-badge-tr">
          <span class="cms-card-pill-status ${isPublished ? 'is-live' : 'is-draft'}">${status || 'DRAFT'}</span>
          ${featured ? `<span class="cms-card-pill-featured">★ Featured</span>` : ''}
        </div>
      </div>
      <div class="cms-card-body">
        <h3 class="cms-card-title"><a href="${href}">${title}</a></h3>
        ${detail ? `<p class="cms-card-route">${detail}</p>` : ''}
        <div class="cms-card-footer">
          <div class="cms-card-actions">
            <a class="cms-card-btn" href="${href}">Edit</a>
            ${previewHref ? `<a class="cms-card-btn" href="${previewHref}">Preview</a>` : ''}
          </div>
          <div class="cms-card-controls">
            ${toggleBtn}
          </div>
        </div>
      </div>
    </article>`;
}

export const TOUR_CATEGORIES = [
  { id: 'cultural', label: 'Cultural & historical', test: /cultur|hadzabe|eyasi|materuni|maasai|usambara|natron|lengai|wedding/i },
  { id: 'zanzibar', label: 'Zanzibar & beach', test: /zanzibar|nungwi|beach|spice island|pemba/i },
  { id: 'mountain', label: 'Mountain climbing & treks', test: /kilimanjaro|marangu|machame|lemosho|umbwe|rongai|\bmeru\b/i },
  { id: 'honeymoon', label: 'Honeymoon', test: /honeymoon/i },
  { id: 'photographic', label: 'Photographic safaris', test: /photo/i },
  { id: 'fly-in', label: 'Fly-in safaris', test: /fly-?in|fly in/i },
  { id: 'luxury', label: 'Luxury safaris', test: /luxury/i },
  { id: 'day-trip', label: 'Day trips', test: /day trip|1 day|one day/i },
  { id: 'wildlife', label: 'Wildlife safari tours', test: /./ },
];

const STYLE_LABELS = Object.fromEntries(TOUR_CATEGORIES.map((item) => [item.id, item.label]));

export const BLOG_TOPICS = {
  climbing: 'Climbing',
  safari: 'Safari',
  'about-us': 'About Us',
  'about-tanzania': 'About Tanzania',
  islands: 'Islands',
  wildlife: 'Wildlife',
  itineraries: 'Itineraries',
};

export const DESTINATION_ORDER = ['Northern Tanzania', 'The Coast', 'Southern Tanzania'];
export const BLOG_ORDER = Object.values(BLOG_TOPICS);
export const TOUR_ORDER = TOUR_CATEGORIES.map((item) => item.label);

export function tourCategory(item) {
  const style = String(item.style || '').toLowerCase();
  if (STYLE_LABELS[style]) return STYLE_LABELS[style];
  const hay = `${item.title || ''} ${item.slug || ''} ${item.destination || ''} ${item.duration_label || ''}`;
  return TOUR_CATEGORIES.find((entry) => entry.test.test(hay))?.label || 'Wildlife safari tours';
}

export function destinationCategory(item, doc = {}) {
  return String(doc.region || item.region || 'Other regions').trim() || 'Other regions';
}

export function blogCategory(item, doc = {}) {
  const topic = String(doc.topic || item.topic || '').trim();
  return BLOG_TOPICS[topic] || prettyLabel(topic) || 'Uncategorized';
}

export function prettyLabel(value) {
  const text = String(value || '').replace(/[-_]/g, ' ').trim();
  if (!text) return '';
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function groupedSections(items, getCategory, order = []) {
  const buckets = new Map(order.map((label) => [label, []]));
  for (const item of items) {
    const label = getCategory(item) || 'Other';
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label).push(item);
  }
  return [...buckets.entries()].filter(([, rows]) => rows.length);
}

export function categoryOptions(sections) {
  return sections.map(([label, rows]) => ({ label, count: rows.length }));
}

export function renderGroupedCards(sections, renderItem) {
  return sections
    .map(
      ([label, rows]) => `
      <section class="cms-category" data-category="${label}">
        <header class="cms-category-head">
          <h2>${label}</h2>
          <span>${rows.length}</span>
        </header>
        <div class="cms-tour-grid">
          ${rows.map(renderItem).join('')}
        </div>
      </section>`
    )
    .join('');
}
