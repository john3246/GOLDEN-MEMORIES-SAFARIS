import { toSafariCardData } from './model.js';
import { escapeHtml } from './escape.js';
import { safariPrice } from './price.js';

/**
 * Existing `.safari-card` markup — shared by public listing and CMS cards.
 * @param {Record<string, unknown>} safari
 * @param {string} [href]
 */
export function renderSafariCard(safari, href) {
  const tour = toSafariCardData(safari);
  const price = safariPrice(safari);
  const link = href || `/tours/${encodeURIComponent(tour.slug || '')}/`;
  return `
    <article class="safari-card">
      <a class="safari-card-media" href="${escapeHtml(link)}" tabindex="-1">
        ${
          tour.image
            ? `<img src="${escapeHtml(tour.image)}" alt="" loading="lazy" width="800" height="1100" />`
            : `<div class="h-full min-h-[22rem] bg-mist"></div>`
        }
      </a>
      <div class="safari-card-overlay">
        <div class="safari-card-top">
          <h3 class="safari-card-title">
            <a href="${escapeHtml(link)}">${escapeHtml(tour.title)}</a>
          </h3>
          <a class="safari-card-more" href="${escapeHtml(link)}">
            <span class="safari-card-more-icon" aria-hidden="true">→</span>
            Read more
          </a>
        </div>
        <div class="safari-card-bottom">
          <p class="safari-card-meta">${escapeHtml(tour.duration)}</p>
          ${tour.places ? `<p class="safari-card-places">${escapeHtml(tour.places)}</p>` : ''}
          ${price ? `<p class="safari-card-price">${escapeHtml(price.card)}</p>` : ''}
          <a class="safari-card-book" href="${tour.slug ? `/booking/?safari=${encodeURIComponent(tour.slug)}` : '/booking/'}">Book now</a>
        </div>
      </div>
    </article>
  `;
}
