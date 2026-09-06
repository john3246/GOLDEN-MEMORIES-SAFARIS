/**
 * Tour card markup for featured packages and day trips.
 * @param {{ title: string, duration: string, activity?: string, places?: string, image: string, featured?: boolean }} tour
 */
export function tourCard(tour) {
  const badge = tour.featured
    ? `<span class="absolute left-4 top-4 z-10 bg-gold px-3 py-1 font-body text-xs font-bold uppercase tracking-[0.1em] text-ink">Trip of the month</span>`
    : '';

  return `
    <article class="tour-card flex h-full flex-col border border-ink/10">
      <a href="/tours/" class="relative block aspect-[16/11] overflow-hidden">
        ${badge}
        <img
          src="${tour.image}"
          alt=""
          loading="lazy"
          width="800"
          height="550"
        />
      </a>
      <div class="flex flex-1 flex-col p-5 sm:p-6">
        <div class="flex flex-wrap gap-x-3 gap-y-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-black/60">
          <span>${tour.duration}</span>
          ${tour.activity ? `<span aria-hidden="true">·</span><span>${tour.activity}</span>` : ''}
        </div>
        <h3 class="mt-3 font-display text-xl font-semibold leading-tight text-black sm:text-2xl">
          <a href="/tours/" class="card-title-link">${tour.title}</a>
        </h3>
        ${
          tour.places
            ? `<p class="mt-3 text-sm leading-relaxed text-ink/65">${tour.places}</p>`
            : ''
        }
        <a href="/tours/" class="card-link mt-auto pt-5 font-body text-sm font-bold uppercase tracking-[0.1em] text-black">
          View package <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `;
}
