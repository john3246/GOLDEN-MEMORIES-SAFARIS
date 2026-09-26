import { reviewQuotes } from '../../components/cards/review-quotes.js';
import { tourCard } from '../../components/cards/tour-card.js';
import { tourHref } from '../tours/paths.js';
import {
  climbPackages,
  kiliClose,
  kiliFaqs,
  kiliHero,
  kiliIntro,
  kiliRoutes,
} from './content.js';

/**
 * Kilimanjaro climbing page — Zara-style structure, GM tour and park cards.
 */
export function renderKilimanjaro() {
  const pricedClimbs = climbPackages.filter((item) => Number(item.price_from || item.price) > 0);
  const routeGrid = kiliRoutes
    .map((route) => {
      const href = route.slug ? tourHref({ slug: route.slug, title: route.name }) : route.href || '/contact/';
      return `
        <a class="park-card" href="${href}" aria-label="${route.name}">
          <div class="park-card-media">
            <img src="${route.image}" alt="${route.name}" loading="lazy" width="800" height="520" />
          </div>
          <div class="park-card-body">
            <h3 class="font-display text-xl font-semibold text-black sm:text-2xl">${route.name}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink/70">${route.body}</p>
            <p class="mt-4 font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">
              ${route.slug ? 'View package' : 'Ask about this route'}
            </p>
          </div>
        </a>
      `;
    })
    .join('');

  const packageGrid = pricedClimbs.map(tourCard).join('');

  const quotes = reviewQuotes({ limit: 4, match: /kilimanjaro|summit|uhuru|machame|lemosho|marangu|trek|climb/i });

  const faqs = kiliFaqs
    .map(
      (item) => `
        <details class="safari-faq bg-white">
          <summary>${item.q}</summary>
          <p>${item.a}</p>
        </details>
      `
    )
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="kili-hero-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${kiliHero.image}"
          alt="Mount Kilimanjaro climbing with Golden Memories Safaris"
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${kiliHero.kicker}
          </p>
          <h1 id="kili-hero-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${kiliHero.title}
          </h1>
          <a class="btn-navy mt-8 !rounded-none" href="/contact/">${kiliHero.cta}</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">Kilimanjaro Climbing</span>
        </div>
      </nav>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="kili-intro-title">
        <div class="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="reveal overflow-hidden bg-black">
            <img
              class="aspect-[16/10] w-full object-cover sm:aspect-[16/11]"
              src="${kiliIntro.image}"
              alt="${kiliIntro.imageAlt}"
              width="900"
              height="1100"
              loading="lazy"
            />
          </div>
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">${kiliIntro.kicker}</p>
            <h2 id="kili-intro-title" class="section-title">${kiliIntro.title}</h2>
            ${kiliIntro.paragraphs
              .map((p) => `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${p}</p>`)
              .join('')}
            <a class="btn-navy mt-8 !rounded-none" href="/contact/">Talk to a mountain specialist</a>
          </div>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="kili-routes-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Choose your trail</p>
            <h2 id="kili-routes-title" class="section-title">Extraordinary Kilimanjaro route options</h2>
            <p class="mt-4 text-ink/70">
              Join our guiding team on the routes that make Kilimanjaro famous — from hut-to-hut Marangu to the camping days of Machame and the quieter west.
            </p>
          </div>
          <div class="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            ${routeGrid}
          </div>
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="kili-close-title">
        <div class="container-site max-w-3xl">
          <div class="reveal">
            <h2 id="kili-close-title" class="section-title">${kiliClose.title}</h2>
            <p class="mt-6 font-body text-base leading-relaxed text-ink/75">${kiliClose.body}</p>
            <a class="btn-navy mt-8 !rounded-none" href="/contact/">Book your Kilimanjaro trek</a>
          </div>
        </div>
      </section>

      ${
        packageGrid
          ? `
      <section class="bg-black py-8 sm:py-10" id="packages" aria-labelledby="kili-packages-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker !text-gold">Our trekking packages</p>
            <h2 id="kili-packages-title" class="section-title !text-white">Kilimanjaro trekking packages</h2>
            <p class="mt-4 text-white/75">Guided Kilimanjaro routes with park fees, crew, meals, and transfers as agreed from Arusha or Moshi. Prices are per person for two climbers sharing.</p>
          </div>
          <div class="reveal mt-12 grid gap-6 md:grid-cols-3">
            ${packageGrid}
          </div>
        </div>
      </section>`
          : ''
      }

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="kili-quotes-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <p class="section-kicker">What our clients say</p>
            <h2 id="kili-quotes-title" class="section-title">Stories from the mountain</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            ${quotes || '<p class="text-ink/70 md:col-span-2"><a class="underline" href="/reviews/">Read our guest reviews from Tripadvisor, Google and SafariBookings</a></p>'}
          </div>
        </div>
      </section>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="kili-faq-title">
        <div class="container-site max-w-3xl">
          <div class="reveal">
            <p class="section-kicker">On-the-trek notes</p>
            <h2 id="kili-faq-title" class="section-title">Tips for climbers</h2>
          </div>
          <div class="reveal mt-8 space-y-3">
            ${faqs}
          </div>
        </div>
      </section>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="kili-plan-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="kili-plan-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Ready for Uhuru Peak?
            </h2>
            <p class="mt-3 max-w-xl text-ink/80">
              Tell us your dates and we will recommend a route, crew size, and whether a safari or Zanzibar should follow.
            </p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="/contact/">Start planning</a>
        </div>
      </section>
    </main>
  `;
}
