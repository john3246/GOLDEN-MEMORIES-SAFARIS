const fs = require('fs');
const cardsPath = 'apps/cms/src/content/cards.js';
let content = fs.readFileSync(cardsPath, 'utf8');

// Find the boundaries of the photoCard function
const startIndex = content.indexOf('export function photoCard({');
const endIndex = content.indexOf('export const TOUR_CATEGORIES =');

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find photoCard boundaries');
  process.exit(1);
}

const newPhotoCard = `export function photoCard({ href, previewHref, title, image, kicker, detail, status, featured, itemId, itemType }) {
  const isPublished = status === 'PUBLISHED';
  const toggleBtn = (itemId && itemType)
    ? \`<button class="cms-card-btn \${isPublished ? 'cms-card-btn-unpublish' : 'cms-card-btn-publish'}" type="button" data-quick-toggle data-item-id="\${itemId}" data-item-type="\${itemType}" data-current-status="\${status || 'DRAFT'}" title="\${isPublished ? 'Unpublish' : 'Publish'}">\${isPublished ? 'Unpublish' : 'Publish'}</button>\`
    : '';

  const safeTitle = String(title || '').replace(/"/g, '&quot;');

  return \`
    <article class="cms-safari-card-v2">
      <div class="cms-card-header">
        <a href="\${href}" tabindex="-1" class="cms-card-img-link">
          <img src="\${image}" alt="\${safeTitle}" loading="lazy" decoding="async" onerror="if(this.dataset.fallback) { this.src=this.dataset.fallback; this.removeAttribute('data-fallback'); }" data-fallback="/images/gallery/serengeti-01-card.webp" />
        </a>
        <div class="cms-card-badge-tl">\${kicker ? \`<span class="cms-card-pill-kicker">\${kicker}</span>\` : ''}</div>
        <div class="cms-card-badge-tr">
          <span class="cms-card-pill-status \${isPublished ? 'is-live' : 'is-draft'}">\${status || 'DRAFT'}</span>
          \${featured ? \`<span class="cms-card-pill-featured">★ Featured</span>\` : ''}
        </div>
      </div>
      <div class="cms-card-body">
        <h3 class="cms-card-title"><a href="\${href}">\${title}</a></h3>
        \${detail ? \`<p class="cms-card-route">\${detail}</p>\` : ''}
        <div class="cms-card-footer">
          <div class="cms-card-actions">
            <a class="cms-card-btn" href="\${href}">Edit</a>
            \${previewHref ? \`<a class="cms-card-btn" href="\${previewHref}">Preview</a>\` : ''}
          </div>
          <div class="cms-card-controls">
            \${toggleBtn}
          </div>
        </div>
      </div>
    </article>\`;
}

`;

const updatedContent = content.substring(0, startIndex) + newPhotoCard + content.substring(endIndex);
fs.writeFileSync(cardsPath, updatedContent);
console.log('Successfully updated photoCard in cards.js');
