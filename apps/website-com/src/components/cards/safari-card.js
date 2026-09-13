import { tourHref } from '../../pages/tours/paths.js';
import { safariPrice } from '@gm-safaris/safari-ui';
import { cardUrl } from '../../media/gallery.js';

/**
 * Full-bleed safari package card — Zara packages layout.
 * @param {{ title: string, duration: string, places?: string, image: string, slug?: string }} tour
 */
export function safariCard(tour) {
  const href = tourHref(tour);
  const price = safariPrice(tour);
  return `
    <article class="safari-card">
      <a class="safari-card-media" href="${href}" tabindex="-1">
        <img src="${cardUrl(tour.image, tour, 0)}" alt="" loading="lazy" decoding="async" width="800" height="1100" />
      </a>
      <div class="safari-card-overlay">
        <div class="safari-card-top">
          <h3 class="safari-card-title">
            <a href="${href}">${tour.title}</a>
          </h3>
          <a class="safari-card-more" href="${href}">
            <span class="safari-card-more-icon" aria-hidden="true">→</span>
            Read more
          </a>
        </div>
        <div class="safari-card-bottom">
          <p class="safari-card-meta">${tour.duration}</p>
          ${tour.places ? `<p class="safari-card-places">${tour.places}</p>` : ''}
          ${price ? `<p class="safari-card-price">${price.card}</p>` : ''}
          <a class="safari-card-book" href="/contact/">Book now</a>
        </div>
      </div>
    </article>
  `;
}
