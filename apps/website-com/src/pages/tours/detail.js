import { safariCard } from '../../components/cards/safari-card.js';
import { renderSafariPage, applySafariMeta, renderSafariCard } from '@gm-safaris/safari-ui';
import { media as GM } from '../home/content.js';
import { getTourBySlug, relatedTours } from './catalog.js';

function dayImage(item, tour) {
  if (item.image) return item.image;
  const t = `${item.title} ${item.body}`.toLowerCase();
  if (t.includes('tarangire')) return GM.tarangire;
  if (t.includes('manyara')) return GM.manyara;
  if (t.includes('ngorongoro') || t.includes('crater')) return GM.ngorongoro;
  if (t.includes('migration') || t.includes('wildebeest')) return GM.migration;
  if (t.includes('serengeti')) return GM.northern;
  if (t.includes('ruaha')) return GM.southern;
  if (t.includes('selous') || t.includes('nyerere') || t.includes('rufiji')) return GM.selous;
  if (t.includes('mikumi')) return GM.dayTrip;
  if (t.includes('materuni') || t.includes('coffee')) return GM.materuni;
  if (t.includes('spice') || t.includes('stone town')) return GM.spice;
  if (t.includes('zanzibar') || t.includes('beach')) return GM.zanzibarBeach;
  if (t.includes('machame')) return GM.machame;
  if (t.includes('meru') || t.includes('momella')) return GM.meru;
  if (t.includes('kilimanjaro') || t.includes('marangu') || t.includes('summit')) return GM.kilimanjaro;
  if (t.includes('eyasi')) return GM.lakeEyasi;
  if (t.includes('gombe') || t.includes('mahale')) return GM.western;
  return tour.image;
}

function dayFacts(item, tour, index, total) {
  const isClimb = /kilimanjaro|meru|machame|marangu|trekking|climb|mountain/i.test(
    `${tour.title} ${tour.activity || ''}`
  );
  const last = index === total - 1;
  const facts = [
    item.distance ? ['Duration', item.distance] : null,
    item.viewing !== null
      ? ['Game viewing', item.viewing || (isClimb ? null : last ? 'Morning game drive' : '6–7 hours')]
      : null,
    ['Transport', item.transport || (isClimb ? 'On foot with mountain crew' : '4x4 safari vehicle')],
    ['Meals included', item.meals || (last ? 'Breakfast' : 'Breakfast, lunch & dinner')],
    ['Accommodation', item.stay || (last ? 'Own arrangements / onward transfer' : isClimb ? 'Mountain hut or camp' : 'Lodge or camp as confirmed')],
  ].filter((row) => row && row[1]);

  return facts;
}

/**
 * Individual safari / trek / day-trip page.
 * CMS-published Safaris use the shared renderer; other catalog tours keep the static path.
 * @param {string} slug
 * @param {Record<string, unknown> | null} [cmsSafari]
 * @param {Array<Record<string, unknown>>} [cmsRelated]
 */
export function renderTourDetail(slug, cmsSafari = null, cmsRelated = []) {
  if (cmsSafari) {
    const relatedHtml = cmsRelated.map((item) => renderSafariCard(item)).join('');
    return renderSafariPage(cmsSafari, { relatedHtml });
  }

  const tour = getTourBySlug(slug);
  if (!tour) {
    return `
      <main id="main" class="bg-mist py-24">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Safaris</p>
          <h1 class="section-title">Package not found</h1>
          <p class="mt-4 text-ink/70">That itinerary is no longer listed. Browse current Tanzania safari packages instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/tours/">View all safaris</a>
        </div>
      </main>
    `;
  }

  const days = tour.itinerary
    .map((item, index) => {
      const facts = dayFacts(item, tour, index, tour.itinerary.length)
        .map(
          ([label, value]) => `
            <div>
              <dt>${label}</dt>
              <dd>${value}</dd>
            </div>
          `
        )
        .join('');

      return `
        <article class="safari-day">
          <div class="safari-day-media">
            <img src="${dayImage(item, tour)}" alt="" loading="lazy" width="900" height="680" />
          </div>
          <div class="safari-day-copy">
            <p class="safari-day-label">${item.day}</p>
            <h3 class="safari-day-title">${item.title}</h3>
            <p class="safari-day-body">${item.body}</p>
            ${facts ? `<dl class="safari-day-facts">${facts}</dl>` : ''}
          </div>
        </article>
      `;
    })
    .join('');

  const highlights = tour.highlights.map((item) => `<li>${item}</li>`).join('');
  const included = tour.included.map((item) => `<li>${item}</li>`).join('');
  const excluded = tour.excluded.map((item) => `<li>${item}</li>`).join('');
  const related = relatedTours(tour, 4).map(safariCard).join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="tour-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${tour.image}"
          alt=""
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[26rem] flex-col items-center justify-center py-20 text-center sm:min-h-[30rem]">
          ${tour.featured ? `<p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">Trip of the month</p>` : `<p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">${tour.activity || 'Safari package'}</p>`}
          <h1 id="tour-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            ${tour.title}
          </h1>
          <p class="mt-4 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white/85">
            ${tour.duration}${tour.places ? ` · ${tour.places}` : ''}
          </p>
          <a class="btn-navy mt-8 !rounded-none" href="/contact/">Book this safari</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/tours/">Safaris</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">${tour.title}</span>
        </div>
      </nav>

      <section class="bg-gold py-16 sm:py-20 lg:py-24" aria-labelledby="tour-overview-title">
        <div class="container-site grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-16">
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">Overview</p>
            <h2 id="tour-overview-title" class="section-title">About this itinerary</h2>
            <p class="mt-5 font-body text-base leading-relaxed text-ink/75">${tour.overview}</p>
          </div>

          <aside class="reveal safari-aside">
            <p class="section-kicker">At a glance</p>
            <h2 class="font-display text-2xl font-semibold text-black">Plan this trip</h2>
            <dl class="mt-6 space-y-3 font-body text-sm">
              <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Duration</dt>
                <dd class="font-bold text-black">${tour.duration}</dd>
              </div>
              ${
                tour.places
                  ? `<div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Places</dt>
                <dd class="text-right font-bold text-black">${tour.places}</dd>
              </div>`
                  : ''
              }
              ${
                tour.activity
                  ? `<div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Style</dt>
                <dd class="font-bold text-black">${tour.activity}</dd>
              </div>`
                  : ''
              }
            </dl>
            <h3 class="mt-8 font-body text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">Highlights</h3>
            <ul class="safari-bullets mt-3">${highlights}</ul>
            <a class="btn-navy mt-8 w-full !rounded-none" href="/contact/">Enquire now</a>
          </aside>
        </div>
      </section>

      <section class="bg-black py-16 text-white sm:py-20 lg:py-24" aria-labelledby="itinerary-title">
        <div class="container-site">
          <div class="reveal max-w-3xl">
            <p class="section-kicker !text-gold">Itinerary</p>
            <h2 id="itinerary-title" class="section-title !text-white">${tour.duration} — day to day</h2>
            <p class="mt-4 text-white/75">Each day is paced for game drives, transfers, and a proper night in camp or lodge — the same shape as a classic Tanzania circuit.</p>
          </div>
          <div class="safari-itinerary reveal mt-12">
            ${days}
          </div>
        </div>
      </section>

      <section class="bg-mist py-16 sm:py-20" aria-labelledby="included-title">
        <div class="container-site grid gap-6 md:grid-cols-2">
          <article class="reveal bg-white p-6 sm:p-8">
            <h2 id="included-title" class="font-display text-2xl font-semibold text-black">What’s included</h2>
            <ul class="safari-bullets mt-5">${included}</ul>
          </article>
          <article class="reveal bg-white p-6 sm:p-8">
            <h2 class="font-display text-2xl font-semibold text-black">What’s not included</h2>
            <ul class="safari-bullets mt-5">${excluded}</ul>
          </article>
        </div>
      </section>

      <section class="bg-black py-16 sm:py-20" aria-labelledby="related-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker !text-gold">Keep exploring</p>
            <h2 id="related-title" class="section-title !text-white">Other Tanzania itineraries</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
            ${related}
          </div>
        </div>
      </section>

      <section class="bg-gold py-14 sm:py-16" aria-labelledby="tour-cta-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="tour-cta-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Ready to travel this route?
            </h2>
            <p class="mt-3 max-w-xl text-ink/80">Share your dates and group size — we will confirm lodges, park fees, and the vehicle setup.</p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="/contact/">Talk to an expert</a>
        </div>
      </section>
    </main>
  `;
}

export function applyTourMeta(slug, cmsSafari = null) {
  if (cmsSafari) {
    applySafariMeta(cmsSafari);
    return;
  }
  const tour = getTourBySlug(slug);
  if (!tour) {
    document.title = 'Safari package | Golden Memories Safaris';
    return;
  }
  document.title = `${tour.title} | Golden Memories Safaris`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', tour.overview);
}
