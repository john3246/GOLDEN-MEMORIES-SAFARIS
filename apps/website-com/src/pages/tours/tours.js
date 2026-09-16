import { tourCard } from '../../components/cards/tour-card.js';
import { uniqueCoverFor } from '../../media/gallery.js';
import { testimonials as homeQuotes } from '../home/content.js';
import { allTours } from './catalog.js';
import { gmsTrips, styleBySlug } from './gms-trips.js';
import { renderSafariFilters } from './filters.js';
import { safariHero, safariIntro, whySafari, safariFaqs, testimonials } from './content.js';

const quotes = (testimonials.length ? testimonials : homeQuotes)
  .map(
    (t) => `
      <blockquote class="quote-card bg-white p-5 sm:p-6">
        <p class="font-display text-base italic leading-relaxed text-ink/80">“${t.quote}”</p>
        <footer class="mt-4">
          <cite class="not-italic font-body text-sm font-bold uppercase tracking-[0.1em] text-black">${t.name}</cite>
          <p class="mt-1 text-sm text-ink/55">${t.detail}</p>
        </footer>
      </blockquote>
    `
  )
  .join('');

/**
 * Safari listing — filter/sort board aligned to serengetiwakandatours.com/safaris
 * @param {Array<Record<string, unknown>>} [cmsPackages]
 */
export function renderTours(cmsPackages) {
  const style = new URLSearchParams(window.location.search).get('style') || '';
  const styleMeta = styleBySlug(style);
  const catalog = allTours();
  const bySlug = new Map(catalog.map((item) => [item.slug, item]));
  if (Array.isArray(cmsPackages)) {
    for (const item of cmsPackages) {
      const price = item.price_from ?? item.price;
      if (!(Number(price) > 0)) continue;
      const gms = gmsTrips.find((trip) => trip.slug === item.slug);
      bySlug.set(item.slug, {
        slug: item.slug,
        title: item.title,
        duration: item.duration_label || item.duration || gms?.duration || '',
        places: item.destination || gms?.places || '',
        image: uniqueCoverFor(gms || item),
        featured: item.featured,
        price_from: price,
        currency: item.currency || 'USD',
        minimum_people: item.minimum_people,
        activity: gms?.activity,
        style: gms?.style,
      });
    }
  }
  const sourced = [...bySlug.values()].filter((tour) => Number(tour.price_from || tour.price) > 0);
  const packageGrid = sourced
    .map((item) =>
      tourCard({
        ...item,
        image: uniqueCoverFor(item),
      })
    )
    .join('');
  const whyCards = whySafari
    .map(
      (item) => `
        <article class="bg-white p-5 sm:p-6">
          <h3 class="font-display text-lg font-semibold text-black">${item.title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink/70">${item.body}</p>
        </article>
      `
    )
    .join('');
  const faqs = safariFaqs
    .map(
      (item) => `
        <details class="safari-faq bg-white">
          <summary>${item.q}</summary>
          <p>${item.a}</p>
        </details>
      `
    )
    .join('');
  const listingTitle = styleMeta ? styleMeta.label : 'Browse Tanzania safaris';

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="safari-hero-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${safariHero.image}"
          alt="Tanzania safari game drive with Golden Memories Safaris"
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col justify-end py-7 sm:min-h-[13rem] sm:py-8 lg:min-h-[14rem]">
          <p class="font-body text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
            Home <span aria-hidden="true">›</span> ${styleMeta ? styleMeta.label : 'Tanzania safari tours'}
          </p>
          <h1 id="safari-hero-title" class="mt-2 max-w-3xl font-display text-2xl font-semibold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.65rem]">
            ${styleMeta ? styleMeta.label : 'Tanzania safari tours and safari packages'}
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            ${sourced.length} priced safari packages across the Northern Circuit and joining group safaris — published per person.
          </p>
        </div>
      </section>

      <section class="safari-intro bg-white" aria-labelledby="safari-intro-title">
        <div class="container-site safari-intro-copy">
          <h2 id="safari-intro-title">${safariIntro.title}</h2>
          <p>${safariIntro.paragraphs[0]}</p>
        </div>
      </section>

      <section class="safari-board bg-mist" data-safari-board aria-labelledby="packages-title">
        <div class="container-site">
          <div class="safari-board-head">
            <div>
              <p class="section-kicker">Our itineraries</p>
              <h2 id="packages-title" class="section-title">${listingTitle}</h2>
            </div>
            <div class="safari-board-tools">
              <button type="button" class="safari-filter-toggle" data-filter-toggle>Filter safaris</button>
              <p class="safari-board-count" data-filter-count>${sourced.length} safaris match your search</p>
              <label class="safari-sort">
                Sort by
                <select data-safari-sort>
                  <option value="popular">Most popular</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="duration-asc">Shortest first</option>
                  <option value="duration-desc">Longest first</option>
                </select>
              </label>
            </div>
          </div>
          <div class="safari-board-layout">
            ${renderSafariFilters(style)}
            <div>
              <div class="safari-grid" data-safari-grid>
                ${packageGrid}
              </div>
              <p class="safari-empty" data-filter-empty hidden>
                No packages match these filters. <a class="underline" href="/tours/">View all safaris</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="why-safari-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Why book with us</p>
            <h2 id="why-safari-title" class="section-title">Why travellers choose Golden Memories</h2>
          </div>
          <div class="reveal mt-8 grid gap-4 md:grid-cols-3">
            ${whyCards}
          </div>
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="safari-quotes-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">Testimonies</p>
            <h2 id="safari-quotes-title" class="section-title">What our clients say</h2>
          </div>
          <div class="reveal mt-8 grid gap-5 md:grid-cols-2">
            ${quotes}
          </div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="faq-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">FAQs</p>
            <h2 id="faq-title" class="section-title">Frequently asked questions</h2>
          </div>
          <div class="reveal mx-auto mt-8 max-w-3xl space-y-3">
            ${faqs}
          </div>
        </div>
      </section>

      <section class="bg-black py-8 sm:py-10" aria-labelledby="book-title">
        <div class="container-site flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="book-title" class="font-display text-2xl font-semibold tracking-tight text-gold sm:text-3xl">
              Can’t find the right safari?
            </h2>
            <p class="mt-2 max-w-xl text-white/80">
              Tell us your dates and pace — our Arusha team will tailor a private itinerary.
            </p>
          </div>
          <a class="reveal btn-gold !rounded-none shrink-0" href="/contact/">Talk to an expert</a>
        </div>
      </section>
    </main>
  `;
}
