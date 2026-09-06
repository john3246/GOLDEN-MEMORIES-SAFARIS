/**
 * Destination card markup — used for interactive destination browsing.
 * @param {{ name: string, slug: string, trips: number, blurb: string, image: string }} destination
 */
export function destinationCard(destination) {
  return `
    <a
      class="destination-card block aspect-[4/5] sm:aspect-[3/4]"
      href="/destinations/#${destination.slug}"
      aria-label="${destination.name} — ${destination.trips} trips"
    >
      <img
        src="${destination.image}"
        alt="${destination.name}"
        loading="lazy"
        width="600"
        height="800"
      />
      <div class="absolute inset-0 destination-overlay bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"></div>
      <div class="destination-copy absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p class="font-body text-xs font-bold uppercase tracking-[0.14em] text-gold">${destination.trips} trips</p>
        <h3 class="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">${destination.name}</h3>
        <p class="mt-2 max-w-xs text-sm text-white/85">${destination.blurb}</p>
      </div>
    </a>
  `;
}
