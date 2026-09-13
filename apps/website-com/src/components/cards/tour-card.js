import { tourHref } from '../../pages/tours/paths.js';
import { safariPrice } from '@gm-safaris/safari-ui';
import { durationDays } from '../../pages/tours/filters.js';

/**
 * Tour card markup for featured packages and day trips.
 * @param {{ title: string, duration: string, activity?: string, places?: string, image: string, featured?: boolean, slug?: string }} tour
 */
export function tourCard(tour) {
  const href = tourHref(tour);
  const price = safariPrice(tour);
  const badge = tour.featured
    ? `<span class="absolute left-4 top-4 z-10 bg-gold px-3 py-1 font-body text-xs font-bold uppercase tracking-[0.1em] text-ink">Trip of the month</span>`
    : '';

  const days = durationDays(tour.duration);
  const amount = Number(tour.price_from || tour.price || 0);
  const meta = [tour.duration, price?.card].filter(Boolean).join(' · ');
  return `
    <article
      class="tour-card flex h-full min-w-0 flex-col border border-ink/10"
      data-tour-card
      data-style="${tour.style || ''}"
      data-days="${days}"
      data-price="${amount}"
      data-featured="${tour.featured ? '1' : '0'}"
    >
      <a href="${href}" class="relative block aspect-[16/9] overflow-hidden bg-mist">
        ${badge}
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${tour.image}"
          alt=""
          loading="lazy"
          width="800"
          height="450"
        />
        ${
          meta
            ? `<span class="absolute inset-x-0 bottom-0 z-10 flex justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent px-3 py-2.5 font-body text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white">
                <span>${tour.duration || ''}</span>
                ${price ? `<span>${price.card}</span>` : ''}
              </span>`
            : ''
        }
      </a>
      <div class="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 class="font-display text-base font-semibold leading-snug text-black sm:text-lg">
          <a href="${href}" class="card-title-link">${tour.title}</a>
        </h3>
        ${
          tour.places
            ? `<p class="mt-1.5 line-clamp-2 text-sm leading-snug text-ink/65">${tour.places}</p>`
            : ''
        }
        <a href="${href}" class="card-link mt-auto pt-3 font-body text-xs font-bold uppercase tracking-[0.1em] text-black">
          View trip <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `;
}
