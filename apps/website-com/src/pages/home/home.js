import { destinationCard } from '../../components/cards/destination-card.js';
import { tourCard } from '../../components/cards/tour-card.js';
import { whyUsSlideshow } from '../../components/gallery/why-slideshow.js';
import {
  destinations,
  featuredTours,
  dayTrips,
  kilimanjaro,
  zanzibar,
  testimonials,
  whyBook,
  pageImages,
  site,
} from './content.js';
import { joiningSafaris } from '../join-safari/content.js';
import { openJoiningPackages } from '../join-safari/packages.js';
import { hasTourPrice } from '../tours/catalog.js';
import { reviewData } from '../../services/cms/overlay.js';

/**
 * Home landing page body (below header).
 * Journey: Discover → Destination → Tour → Enquiry
 */
export function renderHome() {
  const destinationGrid = destinations.map(destinationCard).join('');
  const safariGrid = featuredTours.filter(hasTourPrice).map(tourCard).join('');
  const dayTripGrid = dayTrips.filter(hasTourPrice).map(tourCard).join('');
  const climbGrid = kilimanjaro.filter((tour) => tour.featured && hasTourPrice(tour)).map(tourCard).join('');
  const beachGrid = zanzibar.filter(hasTourPrice).map(tourCard).join('');
  const whySlides = whyUsSlideshow(whyBook.slides);
  const esc = (value) =>
    String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const realReviews = (reviewData.reviews || [])
    .filter((row) => row.text && (row.rating || 5) >= 4)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 4)
    .map((row) => ({
      quote: row.text.length > 320 ? `${row.text.slice(0, 317).trim()}…` : row.text,
      name: row.author,
      detail: [row.country, { google: 'Google review', tripadvisor: 'Tripadvisor review', safaribookings: 'SafariBookings review' }[row.source]]
        .filter(Boolean)
        .join(' · '),
    }));
  const quotes = (realReviews.length ? realReviews : testimonials)
    .map(
      (t) => `
      <blockquote class="quote-card bg-white p-6 sm:p-8">
        <p class="font-display text-base italic leading-relaxed text-ink/80 sm:text-lg">“${esc(t.quote)}”</p>
        <footer class="mt-5">
          <cite class="not-italic font-body text-sm font-bold uppercase tracking-[0.1em] text-navy">${esc(t.name)}</cite>
          <p class="mt-1 text-sm text-ink/55">${esc(t.detail)}</p>
        </footer>
      </blockquote>
    `
    )
    .join('');

  const joining = openJoiningPackages[0] || joiningSafaris[0];
  const joinTeaser = joining
    ? `
      <section class="relative isolate overflow-hidden text-white" aria-labelledby="join-home-title">
        <img class="absolute inset-0 h-full w-full object-cover" src="${joining.image}" alt="" width="2000" height="900" loading="lazy" />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative grid items-center gap-6 py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:py-14">
          <div class="reveal">
            <p class="section-kicker !text-gold">Join a group safari</p>
            <h2 id="join-home-title" class="section-title !text-white">${joining.title}</h2>
            <p class="mt-3 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white/70">${joining.datesLabel} · ${joining.duration}${
              joining.price_from ? ` · from USD ${Number(joining.price_from).toLocaleString('en-US')}` : ''
            }</p>
            <p class="mt-5 max-w-2xl font-body text-base leading-relaxed text-white/85">${joining.overview}</p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a class="btn-navy !rounded-none" href="/join-safari/">View open departures</a>
              <a class="btn-gold !rounded-none" href="/booking/?safari=${encodeURIComponent(joining.slug || '')}">Book this safari</a>
            </div>
          </div>
          <div class="reveal bg-black/35 p-6 sm:p-8 ring-1 ring-white/20">
            <p class="font-body text-xs font-bold uppercase tracking-[0.14em] text-gold">${joining.spaces}</p>
            <ul class="safari-bullets mt-4 !text-white">
              ${joining.highlights.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </div>
      </section>
    `
    : '';

  return `
    <main id="main">
      <!-- Hero: brand + one headline + one sentence + CTA group + looping video -->
      <section class="home-hero relative isolate overflow-hidden text-white" aria-labelledby="hero-brand">
        <div class="home-hero-media" aria-hidden="true">
          <img
            class="home-hero-poster"
            src="${pageImages.heroPoster}"
            alt=""
            width="1600"
            height="900"
            fetchpriority="high"
            decoding="async"
          />
          <video
            class="home-hero-video"
            data-home-hero-video
            muted
            loop
            playsinline
            preload="none"
            poster="${pageImages.heroPoster}"
            data-video-src="${pageImages.heroVideo}"
          >
          </video>
        </div>
        <div class="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/55 to-ink/25"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/30"></div>

        <div class="container-site relative flex min-h-[inherit] flex-col justify-center py-12 sm:py-16">
          <div class="hero-animate max-w-3xl">
            <p id="hero-brand" class="font-body text-sm font-bold uppercase tracking-[0.18em] text-gold sm:text-base">
              Karibu Tanzania · Golden Memories Safaris
            </p>
            <h1 class="home-hero-title mt-4 font-display font-semibold leading-[1.05] tracking-tight">
              Tanzania safaris, Kilimanjaro climbs &amp; Zanzibar escapes
            </h1>
            <p class="mt-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-gold sm:text-base">
              ${site.tagline}
            </p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a class="btn-gold" href="/contact/">Plan my trip</a>
              <a class="btn-light !border-white/40 !bg-white/95" href="/tours/">View safari packages</a>
              <a class="btn-light !border-white/40 !bg-white/95" href="/kilimanjaro/">Climb Kilimanjaro</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Why book / about — Zara-style split -->
      <section class="bg-white py-8 sm:py-10 lg:py-12" aria-labelledby="why-title">
        <div class="container-site grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
          <div class="reveal order-2 lg:order-1">
            <p class="section-kicker">Why book with us</p>
            <h2 id="why-title" class="section-title">${whyBook.title}</h2>
            <p class="mt-4 font-body text-base leading-relaxed text-ink/75">
              ${whyBook.body}
            </p>
            <a class="btn-navy mt-6 !rounded-none" href="/about/">Meet the team</a>
          </div>
          <div class="reveal order-1 lg:order-2">
            ${whySlides}
          </div>
        </div>
      </section>

      <!-- Destinations -->
      <section class="bg-mist py-8 sm:py-10 lg:py-12" aria-labelledby="destinations-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">Discover</p>
            <h2 id="destinations-title" class="section-title">Explore Tanzania by region</h2>
            <p class="mt-3 text-ink/70">
              The Northern Circuit for the classic Big Five, the south for wilderness without the crowds, and the coast for white sand and Swahili history.
            </p>
          </div>
          <div class="reveal mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" data-destinations>
            ${destinationGrid}
          </div>
        </div>
      </section>

      <!-- Featured safaris -->
      <section class="bg-white py-8 sm:py-10 lg:py-12" aria-labelledby="safaris-title">
        <div class="container-site">
          <div class="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="section-kicker">Safaris</p>
              <h2 id="safaris-title" class="section-title">Featured Tanzania adventures</h2>
            </div>
            <a class="btn-navy !rounded-none self-start sm:self-auto" href="/tours/">View all safaris</a>
          </div>
          <div class="reveal mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-featured-tours>
            ${safariGrid}
          </div>
        </div>
      </section>

      ${joinTeaser}

      ${
        dayTripGrid
          ? `
      <section class="bg-mist py-8 sm:py-10" aria-labelledby="daytrips-title" id="excursions">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Day trips</p>
            <h2 id="daytrips-title" class="section-title">Things to do in Tanzania</h2>
            <p class="mt-3 text-ink/70">Short on time? These guided day trips from Arusha, Moshi and Zanzibar fit a full experience into one day.</p>
          </div>
          <div class="reveal mt-6 grid gap-4 md:grid-cols-3">
            ${dayTripGrid}
          </div>
        </div>
      </section>`
          : ''
      }

      <!-- Kilimanjaro -->
      <section class="relative isolate overflow-hidden py-8 text-white sm:py-10 lg:py-12" id="kilimanjaro" aria-labelledby="kili-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${pageImages.kilimanjaroSection}"
          alt=""
          loading="lazy"
          aria-hidden="true"
        />
        <div class="absolute inset-0 bg-black/85"></div>
        <div class="container-site relative">
          <div class="reveal max-w-2xl">
            <p class="section-kicker !text-gold">Mountain climbing &amp; treks</p>
            <h2 id="kili-title" class="section-title !text-white">Climb Kilimanjaro</h2>
            <p class="mt-4 text-white/80">Fully supported climbs on the Marangu, Machame, Lemosho, Rongai, Umbwe and Northern Circuit routes, with experienced mountain guides and itineraries built for acclimatisation.</p>
            <a class="btn-gold mt-6 !rounded-none" href="/kilimanjaro/">Kilimanjaro climbing</a>
          </div>
            ${climbGrid ? `<div class="reveal mt-6 grid gap-4 md:grid-cols-3">${climbGrid}</div>` : ''}
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="zanzibar-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Beach vacations</p>
            <h2 id="zanzibar-title" class="section-title">Explore Zanzibar Island</h2>
            <p class="mt-3 text-ink/70">End your safari on the Indian Ocean: spice farms, the lanes of Stone Town and quiet beaches on Zanzibar.</p>
            <a class="btn-navy mt-6 !rounded-none" href="/destinations/zanzibar/">View Zanzibar</a>
          </div>
          ${beachGrid ? `<div class="reveal mt-6 grid gap-4 md:grid-cols-3">${beachGrid}</div>` : ''}
        </div>
      </section>

      <!-- Testimonials -->
      <section class="bg-mist py-8 sm:py-10" aria-labelledby="testimonials-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">Guest reviews</p>
            <h2 id="testimonials-title" class="section-title">What our travellers say</h2>
            <p class="mt-3 text-ink/70">
              Independent reviews from Tripadvisor, Google and SafariBookings. <a class="underline" href="/reviews/">Read all reviews</a>.
            </p>
          </div>
          ${quotes ? `<div class="reveal mt-6 grid gap-4 md:grid-cols-2">${quotes}</div>` : `<div class="reveal mt-6 text-center"><a class="btn-navy !rounded-none" href="/reviews/">Read our guest reviews</a></div>`}
        </div>
      </section>

      <!-- Plan a trip CTA band -->
      <section class="bg-gold py-8 sm:py-10" aria-labelledby="plan-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="plan-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Start planning your Tanzania trip
            </h2>
            <p class="mt-3 max-w-xl text-ink/80">
              Share your dates, group size and interests. A travel consultant in Arusha will reply with a tailor-made itinerary and a clear, all-inclusive price.
            </p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="/contact/">Request a free quote</a>
        </div>
      </section>
    </main>
  `;
}

export function initHomeHero() {
  const video = document.querySelector('[data-home-hero-video]');
  if (!video) return;
  const conn = navigator.connection || {};
  const slow = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  // Skip the 4 MB background video for reduced-motion users, data-saver /
  // 2G connections and small phones — the poster image stays.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || slow || window.innerWidth < 640) {
    video.remove();
    return;
  }
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  // Only now start downloading the video (after the page is painted).
  if (!video.currentSrc && video.dataset.videoSrc) {
    video.src = video.dataset.videoSrc;
    video.preload = 'auto';
    video.load();
  }
  const play = () => {
    const start = video.play();
    if (start && typeof start.catch === 'function') start.catch(() => {});
  };
  if (video.readyState >= 2) play();
  else video.addEventListener('canplay', play, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && video.paused) play();
  });
}

export function initHomeReveals() {
  const nodes = document.querySelectorAll('.reveal');
  if (!nodes.length) return;

  if (!('IntersectionObserver' in window)) {
    nodes.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0, rootMargin: '0px 0px -40px 0px' }
  );

  nodes.forEach((el) => observer.observe(el));
}
