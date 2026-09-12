import { safariCard } from '../../components/cards/safari-card.js';
import { tourCard } from '../../components/cards/tour-card.js';
import { dayTrips, kilimanjaro, testimonials as homeQuotes } from '../home/content.js';
import {
  safariHero,
  safariIntro,
  safariPackages,
  whySafari,
  bookingSteps,
  safariFaqs,
  planningTips,
  testimonials,
} from './content.js';

const quotes = (testimonials.length ? testimonials : homeQuotes)
  .map(
    (t) => `
      <blockquote class="border-l-4 border-gold bg-white p-6 sm:p-8">
        <p class="font-display text-base italic leading-relaxed text-ink/80 sm:text-lg">“${t.quote}”</p>
        <footer class="mt-5">
          <cite class="not-italic font-body text-sm font-bold uppercase tracking-[0.1em] text-black">${t.name}</cite>
          <p class="mt-1 text-sm text-ink/55">${t.detail}</p>
        </footer>
      </blockquote>
    `
  )
  .join('');

/**
 * Safari packages page — layout aligned to zaratanzaniaadventures.com/tanzania-safari-packages/
 * @param {Array<Record<string, unknown>>} [cmsPackages]
 */
export function renderTours(cmsPackages) {
  const sourced =
    Array.isArray(cmsPackages) && cmsPackages.length
      ? cmsPackages.map((item) => ({
          slug: item.slug,
          title: item.title,
          duration: item.duration_label || item.duration || '',
          places: item.destination || '',
          image: item.hero_image?.url || '',
          featured: item.featured,
          price_from: item.price_from ?? item.price,
          currency: item.currency || 'USD',
          minimum_people: item.minimum_people,
        }))
      : safariPackages;
  const packageGrid = sourced.map(safariCard).join('');
  const whyCards = whySafari
    .map(
      (item) => `
        <article class="bg-white p-6 sm:p-8">
          <h3 class="font-display text-xl font-semibold text-black">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">${item.body}</p>
        </article>
      `
    )
    .join('');
  const steps = bookingSteps
    .map(
      (item) => `
        <article class="bg-white p-6 sm:p-8">
          <p class="section-kicker">${item.step}</p>
          <h3 class="font-display text-xl font-semibold text-black">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70">${item.body}</p>
        </article>
      `
    )
    .join('');
  const tips = planningTips
    .map(
      (item) => `
        <article class="bg-white p-6 sm:p-8">
          <h3 class="font-display text-lg font-semibold text-black">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70">${item.body}</p>
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
  const dayGrid = dayTrips.map(tourCard).join('');
  const climbGrid = kilimanjaro.map(tourCard).join('');

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
        <div class="container-site relative flex min-h-[28rem] flex-col items-center justify-center py-20 text-center sm:min-h-[32rem] lg:min-h-[36rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${safariHero.kicker}
          </p>
          <h1 id="safari-hero-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${safariHero.title}
          </h1>
          <a class="btn-navy mt-8 !rounded-none" href="/contact/">${safariHero.cta}</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">Tanzania Safari Packages</span>
        </div>
      </nav>

      <section class="bg-gold py-16 sm:py-20 lg:py-24" aria-labelledby="safari-intro-title">
        <div class="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="reveal overflow-hidden bg-black">
            <img
              class="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
              src="${safariIntro.image}"
              alt="${safariIntro.imageAlt}"
              width="900"
              height="1100"
              loading="lazy"
            />
          </div>
          <div class="reveal bg-white p-6 sm:p-10">
            <h2 id="safari-intro-title" class="section-title">${safariIntro.title}</h2>
            ${safariIntro.paragraphs
              .map((p) => `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${p}</p>`)
              .join('')}
            <a class="btn-navy mt-8 !rounded-none" href="/contact/">Plan this safari</a>
          </div>
        </div>
      </section>

      <section class="bg-black py-16 sm:py-20 lg:py-24" aria-labelledby="packages-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker !text-gold">Our best-selling Tanzania safaris</p>
            <h2 id="packages-title" class="section-title !text-white">Safari Packages</h2>
          </div>
          <div class="reveal mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4 xl:gap-8">
            ${packageGrid}
          </div>
        </div>
      </section>

      <section class="bg-gold py-16 sm:py-20" aria-labelledby="why-safari-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Why book with us</p>
            <h2 id="why-safari-title" class="section-title">Why Choose Golden Memories Safaris for Your Tanzania Safari?</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 md:grid-cols-3">
            ${whyCards}
          </div>
        </div>
      </section>

      <section class="bg-gold py-16 sm:py-20" aria-labelledby="tips-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Plan well</p>
            <h2 id="tips-title" class="section-title">Essential Tanzania Safari Planning Tips</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 md:grid-cols-3">
            ${tips}
          </div>
        </div>
      </section>

      <section class="bg-mist py-16 sm:py-20" id="excursions" aria-labelledby="daytrips-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Day trips</p>
            <h2 id="daytrips-title" class="section-title">Things to do in Tanzania</h2>
            <p class="mt-4 text-ink/70">Short adventures when you want the highlights in a single day.</p>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-3">
            ${dayGrid}
          </div>
        </div>
      </section>

      <section class="relative isolate overflow-hidden bg-black py-16 text-white sm:py-20" id="kilimanjaro" aria-labelledby="kili-title">
        <div class="container-site relative">
          <div class="reveal max-w-2xl">
            <p class="section-kicker !text-gold">Mountain climbing &amp; treks</p>
            <h2 id="kili-title" class="section-title !text-white">Combine your safari with Kilimanjaro</h2>
            <p class="mt-4 text-white/80">Guided routes for summit seekers — Marangu, Machame, and Mount Meru.</p>
            <a class="btn-gold mt-6 !rounded-none" href="/kilimanjaro/">All Kilimanjaro routes</a>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-3">
            ${climbGrid}
          </div>
        </div>
      </section>

      <section class="bg-gold py-16 sm:py-20" aria-labelledby="steps-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">How it works</p>
            <h2 id="steps-title" class="section-title">Simple steps to book</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 md:grid-cols-3">
            ${steps}
          </div>
        </div>
      </section>

      <section class="bg-gold py-16 sm:py-20" aria-labelledby="safari-quotes-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">Testimonies</p>
            <h2 id="safari-quotes-title" class="section-title">What our clients say</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-2">
            ${quotes}
          </div>
        </div>
      </section>

      <section class="bg-gold py-16 sm:py-20" aria-labelledby="faq-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">FAQs</p>
            <h2 id="faq-title" class="section-title">Frequently asked questions</h2>
          </div>
          <div class="reveal mx-auto mt-10 max-w-3xl space-y-3">
            ${faqs}
          </div>
        </div>
      </section>

      <section class="bg-black py-14 sm:py-16" aria-labelledby="book-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="book-title" class="font-display text-3xl font-semibold tracking-tight text-gold sm:text-4xl">
              Book your Tanzania safari vacation today
            </h2>
            <p class="mt-3 max-w-xl text-white/80">
              Share your dates and we will craft a private itinerary from Arusha.
            </p>
          </div>
          <a class="reveal btn-gold !rounded-none shrink-0" href="/contact/">Talk to an expert</a>
        </div>
      </section>
    </main>
  `;
}
