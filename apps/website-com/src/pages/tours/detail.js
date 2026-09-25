import { safariCard } from '../../components/cards/safari-card.js';
import { renderSafariPage, applySafariMeta, renderSafariCard, normalizeItinerary } from '@gm-safaris/safari-ui';
import { isGalleryUrl, uniquePhoto, uniqueCoverFor, galleryKindForText } from '../../media/gallery.js';
import { publicMediaUrl } from '@gm-safaris/safari-ui';
import { getTourBySlug, relatedTours } from './catalog.js';
import { bookingHref } from './paths.js';

function withCatalogItinerary(cmsSafari, slug) {
  const catalog = getTourBySlug(slug);
  const cmsDays = normalizeItinerary(cmsSafari.itinerary);
  if (cmsDays.length) return { ...cmsSafari, itinerary: cmsDays };
  const fallback = normalizeItinerary(catalog?.itinerary);
  return fallback.length ? { ...cmsSafari, itinerary: fallback } : { ...cmsSafari, itinerary: cmsDays };
}

function localizeSafari(doc, index = 0) {
  if (!doc) return doc;
  const used = new Set();
  const image = uniqueCoverFor(doc);
  if (image) used.add(image);
  const gallery = Array.isArray(doc.gallery)
    ? doc.gallery.map((item, offset) => {
        const picked = publicMediaUrl(typeof item === 'string' ? item : item?.url);
        const url = picked || uniquePhoto(item?.alt || item?.caption || doc, used, index + offset + 1);
        if (url) used.add(url);
        return typeof item === 'object' && item ? { ...item, url } : { url };
      })
    : doc.gallery;
  return {
    ...doc,
    image,
    hero_image: { ...(doc.hero_image || {}), url: image, alt: doc.hero_image?.alt || doc.title || '' },
    gallery,
    seo: doc.seo ? { ...doc.seo, og_image: publicMediaUrl(doc.seo.og_image) || image } : doc.seo,
  };
}

function dayImage(item, tour, used) {
  const picked = publicMediaUrl(typeof item.image === 'string' ? item.image : item.image?.url);
  if (picked) {
    used.add(picked);
    return picked;
  }
  const hint = `${item.title} ${item.body || ''}`;
  if (item.image && isGalleryUrl(item.image)) {
    const url = String(item.image).split('?')[0];
    const prefix = url.match(/\/images\/gallery\/([a-z]+)-/)?.[1];
    const expected = galleryKindForText(hint);
    if (prefix === expected && !used.has(url)) {
      used.add(url);
      return url;
    }
  }
  return uniquePhoto(`${hint} ${tour.places || tour.title || ''}`, used, used.size);
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
    const local = localizeSafari(withCatalogItinerary(cmsSafari, slug));
    const relatedHtml = cmsRelated.map((item, index) => renderSafariCard(localizeSafari(item, index + 1))).join('');
    return renderSafariPage(local, { relatedHtml });
  }

  const tour = getTourBySlug(slug);
  if (!tour) {
    return `
      <main id="main" class="bg-mist py-12">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Safaris</p>
          <h1 class="section-title">Package not found</h1>
          <p class="mt-4 text-ink/70">That itinerary is no longer listed. Browse current Tanzania safari packages instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/tours/">View all safaris</a>
        </div>
      </main>
    `;
  }

  const book = bookingHref(tour);
  const cover = uniqueCoverFor(tour);
  const used = new Set([cover]);
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
            <img src="${dayImage(item, tour, used)}" alt="" loading="lazy" width="900" height="680" />
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
          src="${cover}"
          alt=""
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">${tour.activity || 'Safari package'}</p>
          <h1 id="tour-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            ${tour.title}
          </h1>
          <p class="mt-4 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white/85">
            ${tour.duration}${tour.places ? ` · ${tour.places}` : ''}
          </p>
          <a class="btn-navy mt-8 !rounded-none" href="${book}">Book this safari</a>
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

      <section class="bg-gold py-3 sm:py-4" aria-labelledby="tour-overview-title">
        <div class="container-site">
          <div class="grid items-stretch overflow-hidden bg-white lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.85fr)]">
            <div class="flex h-full flex-col p-5 sm:p-7 lg:p-8">
              <p class="section-kicker">Overview</p>
              <h2 id="tour-overview-title" class="section-title">About this itinerary</h2>
              <p class="mt-4 font-body text-base leading-relaxed text-ink/75">${tour.overview}</p>
              <h3 class="mt-6 font-body text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">Highlights</h3>
              <ul class="safari-bullets mt-3 columns-1 gap-x-8 sm:columns-2">${highlights}</ul>
            </div>
            <aside class="safari-aside border-t border-black/10 lg:border-l lg:border-t-0">
              <p class="section-kicker">At a glance</p>
              <h2 class="font-display text-2xl font-semibold text-black">Plan this trip</h2>
              <dl class="mt-5 space-y-3 font-body text-sm">
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
              <div class="mt-auto pt-5">
                <a class="btn-navy w-full !rounded-none" href="${book}">Book this safari</a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section class="bg-black py-5 text-white sm:py-6" aria-labelledby="itinerary-title">
        <div class="container-site">
          <div class="reveal max-w-3xl">
            <p class="section-kicker !text-gold">Itinerary</p>
            <h2 id="itinerary-title" class="section-title !text-white">${tour.duration} — day to day</h2>
            <p class="mt-3 text-white/75">Each day is paced for game drives, transfers, and a proper night in camp or lodge — the same shape as a classic Tanzania circuit.</p>
          </div>
          <div class="safari-itinerary reveal mt-6">
            ${days}
          </div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="included-title">
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

      <section class="bg-black py-8 sm:py-10" aria-labelledby="related-title">
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

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="tour-cta-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="tour-cta-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Ready to travel this route?
            </h2>
            <p class="mt-3 max-w-xl text-ink/80">Share your dates and group size — we will confirm lodges, park fees, and the vehicle setup.</p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="${book}">Book this safari</a>
        </div>
      </section>
    </main>
  `;
}

export function applyTourMeta(slug, cmsSafari = null) {
  if (cmsSafari) {
    applySafariMeta(localizeSafari(cmsSafari));
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
