import { safariCard } from '../../components/cards/safari-card.js';
import { allTours } from '../tours/catalog.js';
import { destinationHref } from './paths.js';
import { getDestinationBySlug } from './catalog.js';
import {
  destinationsHero,
  destinationsIntro,
  whyTanzania,
  destinationRegions,
} from './content.js';

function regionTours(regionId) {
  const map = {
    'northern-tanzania': ['northern', 'ngorongoro', 'tarangire', 'serengeti', 'arusha', 'manyara'],
    'the-coast': ['zanzibar', 'coast'],
    'southern-tanzania': ['ruaha', 'selous', 'nyerere', 'mikumi'],
  };
  const keys = map[regionId] || [];
  return allTours().filter((tour) => {
    const hay = `${tour.title} ${tour.places || ''}`.toLowerCase();
    return keys.some((key) => hay.includes(key));
  });
}

/**
 * Destinations page — regions and parks, same header/footer language as Safaris.
 */
export function renderDestinations() {
  const regionNav = destinationRegions
    .map(
      (region) => `
        <a class="destination-card block aspect-[16/11] sm:aspect-[4/3]" href="#${region.id}" aria-label="${region.name} — ${region.trips} trips">
          <img src="${region.image}" alt="${region.name}" loading="lazy" width="600" height="800" />
          <div class="absolute inset-0 destination-overlay bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"></div>
          <div class="destination-copy absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
            <p class="font-body text-xs font-bold uppercase tracking-[0.14em] text-gold">${region.trips} trips</p>
            <h3 class="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">${region.name}</h3>
            <p class="mt-2 max-w-xs text-sm text-white/85">${region.blurb}</p>
          </div>
        </a>
      `
    )
    .join('');

  const whyCards = whyTanzania
    .map(
      (item) => `
        <article class="bg-white p-6 sm:p-8">
          <h3 class="font-display text-xl font-semibold text-black">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">${item.body}</p>
        </article>
      `
    )
    .join('');

  const regionSections = destinationRegions
    .map((region, index) => {
      const parks = region.parks
        .map((park) => {
          const live = getDestinationBySlug(park.slug);
          const chips = (live?.highlights || []).slice(0, 2)
            .map((item) => `<span class="dest-card-chip">${item.title}</span>`)
            .join('');
          return `
            <a class="park-card" href="${destinationHref(park)}" aria-label="${park.name}">
              <div class="park-card-media">
                <img src="${park.image}" alt="${park.name}" loading="lazy" width="800" height="520" />
              </div>
              <div class="park-card-body">
                <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${live?.region || region.name}</p>
                <h3 class="font-display text-xl font-semibold text-black sm:text-2xl">${park.name}</h3>
                <p class="mt-2 text-sm leading-relaxed text-ink/70">${park.blurb}</p>
                ${chips ? `<p class="mt-3 flex flex-wrap gap-1.5">${chips}</p>` : ''}
                <p class="mt-4 font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">View details</p>
              </div>
            </a>
          `;
        })
        .join('');

      const related = regionTours(region.id).slice(0, 4).map(safariCard).join('');
      const band = index % 2 === 0 ? 'bg-mist' : 'bg-white';

      return `
        <section class="${band} dest-region py-8 sm:py-10" id="${region.id}" aria-labelledby="${region.id}-title">
          <div class="container-site">
            <div class="reveal max-w-3xl">
              <p class="section-kicker">${region.kicker}</p>
              <h2 id="${region.id}-title" class="section-title">${region.name}</h2>
              <p class="mt-4 text-base leading-relaxed text-ink/75 sm:text-lg">${region.summary}</p>
            </div>
            <div class="reveal mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              ${parks}
            </div>
            ${
              related
                ? `
              <div class="reveal mt-14">
                <h3 class="font-display text-2xl font-semibold text-black">Safaris in this region</h3>
                <div class="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
                  ${related}
                </div>
                <a class="btn-navy mt-8 !rounded-none" href="/tours/">View all safari packages</a>
              </div>
            `
                : ''
            }
          </div>
        </section>
      `;
    })
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="destinations-hero-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${destinationsHero.image}"
          alt="Tanzania safari destinations with Golden Memories Safaris"
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${destinationsHero.kicker}
          </p>
          <h1 id="destinations-hero-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${destinationsHero.title}
          </h1>
          <a class="btn-navy mt-8 !rounded-none" href="/contact/">${destinationsHero.cta}</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">Destinations</span>
        </div>
      </nav>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="destinations-intro-title">
        <div class="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="reveal overflow-hidden bg-black">
            <img
              class="aspect-[16/10] w-full object-cover sm:aspect-[16/11]"
              src="${destinationsIntro.image}"
              alt="${destinationsIntro.imageAlt}"
              width="900"
              height="1100"
              loading="lazy"
            />
          </div>
          <div class="reveal bg-white p-6 sm:p-10">
            <h2 id="destinations-intro-title" class="section-title">${destinationsIntro.title}</h2>
            ${destinationsIntro.paragraphs
              .map((p) => `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${p}</p>`)
              .join('')}
            <a class="btn-navy mt-8 !rounded-none" href="/tours/">Browse safari packages</a>
          </div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="regions-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">Discover</p>
            <h2 id="regions-title" class="section-title">Explore Tanzania by region</h2>
            <p class="mt-4 text-ink/70">Choose a circuit, then open the parks and sample itineraries below.</p>
          </div>
          <div class="reveal mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            ${regionNav}
          </div>
        </div>
      </section>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="why-tanzania-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Why Tanzania</p>
            <h2 id="why-tanzania-title" class="section-title">A safari destination like no other</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 md:grid-cols-3">
            ${whyCards}
          </div>
        </div>
      </section>

      ${regionSections}

      <section class="bg-black py-8 sm:py-10" aria-labelledby="dest-book-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="dest-book-title" class="font-display text-3xl font-semibold tracking-tight text-gold sm:text-4xl">
              Tell us which parks you want to see
            </h2>
            <p class="mt-3 max-w-xl text-white/80">
              We will shape nights, vehicles, and lodge style around the region and the season you travel.
            </p>
          </div>
          <a class="reveal btn-gold !rounded-none shrink-0" href="/contact/">Talk to an expert</a>
        </div>
      </section>
    </main>
  `;
}
