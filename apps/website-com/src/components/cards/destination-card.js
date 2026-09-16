import { cardUrl } from '../../media/gallery.js';

/**
 * Destination card markup — used for interactive destination browsing.
 * @param {{ name: string, slug: string, trips: number, blurb: string, image: string }} destination
 */
export function destinationCard(destination) {
  return `
    <a
      class="destination-card block aspect-[16/10]"
      href="/destinations/#${destination.slug}"
      aria-label="${destination.name} — ${destination.trips} trips"
    >
      <img
        src="${cardUrl(destination.image, destination, 0)}"
        alt="${destination.name}"
        loading="lazy"
        decoding="async"
        width="600"
        height="800"
      />
      <div class="absolute inset-0 destination-overlay bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"></div>
      <div class="destination-copy absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
        <p class="font-body text-xs font-bold uppercase tracking-[0.14em] text-gold">${destination.trips} trips</p>
        <h3 class="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">${destination.name}</h3>
        <p class="mt-1 max-w-xs text-sm text-white/85">${destination.blurb}</p>
      </div>
    </a>
  `;
}
