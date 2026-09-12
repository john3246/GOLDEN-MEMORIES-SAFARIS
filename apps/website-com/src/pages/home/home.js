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
} from './content.js';
import { joiningSafaris } from '../join-safari/content.js';

/**
 * Home landing page body (below header).
 * Journey: Discover → Destination → Tour → Enquiry
 */
export function renderHome() {
  const destinationGrid = destinations.map(destinationCard).join('');
  const safariGrid = featuredTours.map(tourCard).join('');
  const dayTripGrid = dayTrips.map(tourCard).join('');
  const climbGrid = kilimanjaro.map(tourCard).join('');
  const beachGrid = zanzibar.map(tourCard).join('');
  const whySlides = whyUsSlideshow(whyBook.slides);
  const quotes = testimonials
    .map(
      (t) => `
      <blockquote class="border-l-4 border-gold bg-white p-6 sm:p-8">
        <p class="font-display text-base italic leading-relaxed text-ink/80 sm:text-lg">“${t.quote}”</p>
        <footer class="mt-5">
          <cite class="not-italic font-body text-sm font-bold uppercase tracking-[0.1em] text-navy">${t.name}</cite>
          <p class="mt-1 text-sm text-ink/55">${t.detail}</p>
        </footer>
      </blockquote>
    `
    )
    .join('');

  const joining = joiningSafaris[0];
  const joinTeaser = joining
    ? `
      <section class="bg-gold py-16 sm:py-20" aria-labelledby="join-home-title">
        <div class="container-site grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <div class="reveal">
            <p class="section-kicker">Join a group safari</p>
            <h2 id="join-home-title" class="section-title">${joining.title}</h2>
            <p class="mt-3 font-body text-sm font-semibold uppercase tracking-[0.12em] text-black/60">${joining.datesLabel} · ${joining.duration}</p>
            <p class="mt-5 max-w-2xl font-body text-base leading-relaxed text-ink/80">${joining.overview}</p>
            <a class="btn-navy mt-8 !rounded-none" href="/join-safari/">View open departures</a>
          </div>
          <div class="reveal bg-white p-6 sm:p-8">
            <p class="font-body text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">${joining.spaces}</p>
            <ul class="safari-bullets mt-4">
              ${joining.highlights.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </div>
      </section>
    `
    : '';

  return `
    <main id="main">
      <!-- Hero: brand + one headline + one sentence + CTA group + full-bleed image -->
      <section class="relative isolate min-h-[88vh] overflow-hidden text-white" aria-labelledby="hero-brand">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${pageImages.hero}"
          alt="Safari experience with Golden Memories Safaris"
          width="2000"
          height="1200"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/55 to-ink/25"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/30"></div>

        <div class="container-site relative flex min-h-[88vh] flex-col justify-center py-20 sm:py-24">
          <div class="hero-animate max-w-3xl">
            <p id="hero-brand" class="font-body text-sm font-bold uppercase tracking-[0.18em] text-gold sm:text-base">
              Golden Memories Safaris
            </p>
            <h1 class="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
              Karibu Tanzania
            </h1>
            <p class="mt-5 max-w-xl text-base text-white/90 sm:text-lg">
              Grab your stuff and let’s get lost in Tanzania’s wonders.
            </p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a class="btn-gold" href="/contact/">Book now</a>
              <a class="btn-light !border-white/40 !bg-white/95" href="/tours/">Tanzania safaris</a>
              <a class="btn-light !border-white/40 !bg-white/95" href="/kilimanjaro/">Kilimanjaro trek</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Why book / about — Zara-style split -->
      <section class="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="why-title">
        <div class="container-site grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
          <div class="reveal order-2 lg:order-1">
            <p class="section-kicker">Why book with us</p>
            <h2 id="why-title" class="section-title">${whyBook.title}</h2>
            <p class="mt-6 font-body text-base leading-relaxed text-ink/75 sm:text-lg">
              ${whyBook.body}
            </p>
            <a class="btn-navy mt-8 !rounded-none" href="/about/">Read more</a>
          </div>
          <div class="reveal order-1 lg:order-2">
            ${whySlides}
          </div>
        </div>
      </section>

      <!-- Destinations -->
      <section class="bg-mist py-16 sm:py-20 lg:py-24" aria-labelledby="destinations-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">Discover</p>
            <h2 id="destinations-title" class="section-title">Explore Tanzania by region</h2>
            <p class="mt-4 text-ink/70">
              From the northern circuit to the coast, south, and west — choose where your story begins.
            </p>
          </div>
          <div class="reveal mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" data-destinations>
            ${destinationGrid}
          </div>
        </div>
      </section>

      <!-- Featured safaris -->
      <section class="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="safaris-title">
        <div class="container-site">
          <div class="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="section-kicker">Safaris</p>
              <h2 id="safaris-title" class="section-title">Featured Tanzania adventures</h2>
            </div>
            <a class="btn-navy !rounded-none self-start sm:self-auto" href="/tours/">View all safaris</a>
          </div>
          <div class="reveal mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4" data-featured-tours>
            ${safariGrid}
          </div>
        </div>
      </section>

      ${joinTeaser}

      <!-- Day trips -->
      <section class="bg-mist py-16 sm:py-20" aria-labelledby="daytrips-title" id="excursions">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Day trips</p>
            <h2 id="daytrips-title" class="section-title">Things to do in Tanzania</h2>
            <p class="mt-4 text-ink/70">Short adventures when you want the highlights in a single day.</p>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-3">
            ${dayTripGrid}
          </div>
        </div>
      </section>

      <!-- Kilimanjaro -->
      <section class="relative isolate overflow-hidden py-16 text-white sm:py-20 lg:py-24" id="kilimanjaro" aria-labelledby="kili-title">
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
            <h2 id="kili-title" class="section-title !text-white">Climb Kilimanjaro &amp; Meru</h2>
            <p class="mt-4 text-white/80">Guided routes for summit seekers — Marangu, Machame, and Mount Meru.</p>
            <a class="btn-gold mt-6 !rounded-none" href="/kilimanjaro/">Kilimanjaro climbing</a>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-3">
            ${climbGrid}
          </div>
        </div>
      </section>

      <!-- Zanzibar -->
      <section class="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="zanzibar-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Beach vacations</p>
            <h2 id="zanzibar-title" class="section-title">Explore Zanzibar Island</h2>
            <p class="mt-4 text-ink/70">Spice tours, Stone Town, and beach days after the safari dust settles.</p>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-3">
            ${beachGrid}
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="bg-mist py-16 sm:py-20" aria-labelledby="testimonials-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">Testimonies</p>
            <h2 id="testimonials-title" class="section-title">Stories from the trail</h2>
            <p class="mt-4 text-ink/70">
              We are rated 5/5 by customers — a commitment we renew on every journey.
            </p>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-2">
            ${quotes}
          </div>
        </div>
      </section>

      <!-- Plan a trip CTA band -->
      <section class="bg-gold py-14 sm:py-16" aria-labelledby="plan-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="plan-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Let’s plan your dream trip together
            </h2>
            <p class="mt-3 max-w-xl text-ink/80">
              Tell us your dates, pace, and style — our Arusha team will craft your Tanzania itinerary.
            </p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="/contact/">Start planning</a>
        </div>
      </section>
    </main>
  `;
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
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  nodes.forEach((el) => observer.observe(el));
}
