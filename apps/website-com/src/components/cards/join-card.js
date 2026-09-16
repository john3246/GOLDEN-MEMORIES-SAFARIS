import { joinHref } from '../../pages/join-safari/paths.js';
import { bookingHref } from '../../pages/tours/paths.js';
import { safariPrice } from '@gm-safaris/safari-ui';
import { cardUrl } from '../../media/gallery.js';

/**
 * Join-group safari card — photo background with copy on top.
 * @param {{ title: string, duration: string, places?: string, image: string, slug?: string, datesLabel?: string, tags?: Array<{label: string, detail: string}> }} item
 */
export function joinCard(item) {
  const href = joinHref(item);
  const book = bookingHref(item);
  const price = safariPrice(item);
  const tags = (item.tags || [])
    .slice(0, 3)
    .map(
      (tag) => `
        <li>
          <span class="join-card-tag-label">${tag.label}</span>
          <span>${tag.detail}</span>
        </li>
      `
    )
    .join('');

  return `
    <article class="join-card">
      <a class="join-card-media" href="${href}" tabindex="-1">
        <img src="${cardUrl(item.image, item, 0)}" alt="" loading="lazy" decoding="async" width="900" height="1100" />
      </a>
      <div class="join-card-overlay">
        <div class="join-card-top">
          <h3 class="join-card-title">
            <a href="${href}">${item.title}</a>
          </h3>
          <p>${item.datesLabel || 'Open 2026–2027'}</p>
        </div>
        <div class="join-card-bottom">
          <p class="join-card-meta">${item.duration}${item.places ? ` · ${item.places}` : ''}${
            price ? ` · ${price.card}` : ''
          }</p>
          ${tags ? `<ul class="join-card-tags">${tags}</ul>` : ''}
          <div class="join-card-actions">
            <a class="join-card-more" href="${href}">
              <span class="join-card-more-icon" aria-hidden="true">→</span>
              Read more
            </a>
            <a class="join-card-book" href="${book}">Book now</a>
          </div>
        </div>
      </div>
    </article>
  `;
}
