import { safariCard } from '../../components/cards/safari-card.js';
import { getDestinationBySlug, relatedDestinations, toursForDestination } from './catalog.js';
import { destinationHref } from './paths.js';
import { withoutCover, uniqueCoverFor } from '../../media/gallery.js';

/**
 * Individual park / place page — live GM destination copy in our gold/black layout.
 * @param {string} slug
 */
export function renderDestinationDetail(slug) {
  const place = getDestinationBySlug(slug);
  if (!place) {
    return `
      <main id="main" class="bg-mist py-12">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Destinations</p>
          <h1 class="section-title">Destination not found</h1>
          <p class="mt-4 text-ink/70">That park is no longer listed. Browse Tanzania destinations instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/destinations/">View all destinations</a>
        </div>
      </main>
    `;
  }

  const cover = uniqueCoverFor(place);
  const facts = (place.facts || [])
    .map(
      ([label, value]) => `
        <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
          <dt class="text-ink/55">${label}</dt>
          <dd class="text-right font-bold text-black">${value}</dd>
        </div>
      `
    )
    .join('');

  const highlights = (place.highlights || [])
    .map(
      (item) => `
        <article class="bg-white p-6 sm:p-8">
          <h3 class="font-display text-xl font-semibold text-black">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70">${item.body}</p>
        </article>
      `
    )
    .join('');

  const seasons = (place.seasons || [])
    .map(
      (item) => `
        <article class="bg-white p-6 sm:p-8">
          <h3 class="font-display text-xl font-semibold text-black">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink/70">${item.body}</p>
        </article>
      `
    )
    .join('');

  const activities = (place.activities || [])
    .map(
      (item) => `
        <article class="border border-gold/30 p-6">
          <h3 class="font-display text-xl font-semibold text-gold">${item.title}</h3>
          <p class="mt-3 text-sm leading-relaxed text-white/75">${item.body}</p>
        </article>
      `
    )
    .join('');

  const wildlife = (place.wildlife || []).map((item) => `<li>${item}</li>`).join('');
  const attractions = (place.attractions || []).map((item) => `<span class="about-tag">${item}</span>`).join('');

  const faqs = (place.faqs || [])
    .map(
      (item) => `
        <article class="dest-faq">
          <h3>${item.q}</h3>
          <p>${item.a}</p>
        </article>
      `
    )
    .join('');

  const gallery = withoutCover(place.gallery, cover)
    .map(
      (src, index) => `
        <div class="dest-gallery-item">
          <img src="${src}" alt="${place.name}" loading="lazy" width="900" height="680" />
        </div>
      `
    )
    .join('');

  const relatedTours = toursForDestination(place, 4).map(safariCard).join('');
  const morePlaces = relatedDestinations(place, 3)
    .map(
      (item) => `
        <a class="park-card" href="${destinationHref(item)}">
          <div class="park-card-media">
            <img src="${uniqueCoverFor(item)}" alt="${item.name}" loading="lazy" width="800" height="520" />
          </div>
          <div class="park-card-body">
            <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${item.kicker}</p>
            <h3 class="mt-2 font-display text-xl font-semibold text-black sm:text-2xl">${item.name}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink/70">${item.tagline}</p>
          </div>
        </a>
      `
    )
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="dest-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${cover}"
          alt="${place.name}"
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${place.kicker}
          </p>
          <h1 id="dest-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            ${place.name}
          </h1>
          <p class="mt-4 max-w-2xl font-body text-base text-white/85 sm:text-lg">${place.tagline}</p>
          <a class="btn-navy mt-8 !rounded-none" href="/contact/">${place.cta}</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/destinations/">Destinations</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/destinations/#${place.regionSlug}">${place.region}</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">${place.name}</span>
        </div>
      </nav>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="dest-about-title">
        <div class="container-site grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-16">
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">About this destination</p>
            <h2 id="dest-about-title" class="section-title">About ${place.name}</h2>
            ${place.paragraphs.map((p) => `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${p}</p>`).join('')}
          </div>
          <aside class="reveal safari-aside">
            <p class="section-kicker">Quick facts</p>
            <h2 class="font-display text-2xl font-semibold text-black">Plan this visit</h2>
            <dl class="mt-6 space-y-3 font-body text-sm">${facts}</dl>
            <p class="mt-6 text-sm text-ink/70"><span class="font-bold text-black">Location. </span>${place.location}</p>
            <a class="btn-navy mt-8 w-full !rounded-none" href="/contact/">Enquire now</a>
          </aside>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="highlights-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Why go</p>
            <h2 id="highlights-title" class="section-title">Destination Highlights</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            ${highlights}
          </div>
        </div>
      </section>

      <section class="bg-white py-8 sm:py-10" aria-labelledby="season-title">
        <div class="container-site">
          <div class="reveal max-w-3xl">
            <p class="section-kicker">When to travel</p>
            <h2 id="season-title" class="section-title">Best Time to Visit</h2>
          </div>
          <div class="reveal mt-10 grid gap-5 md:grid-cols-2">
            ${seasons}
          </div>
        </div>
      </section>

      <section class="bg-black py-10 text-white sm:py-12 lg:py-14" aria-labelledby="wildlife-title">
        <div class="container-site grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div class="reveal">
            <p class="section-kicker !text-gold">On the ground</p>
            <h2 id="wildlife-title" class="section-title !text-white">Wildlife Highlights</h2>
            <ul class="dest-wildlife mt-6">${wildlife}</ul>
            <p class="mt-8 flex flex-wrap gap-2">${attractions}</p>
          </div>
          <div class="reveal">
            <p class="section-kicker !text-gold">What you’ll do</p>
            <h2 class="section-title !text-white">Activities &amp; Experiences</h2>
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              ${activities}
            </div>
          </div>
        </div>
      </section>

      ${
        gallery
          ? `
      <section class="bg-mist py-8 sm:py-10" aria-labelledby="gallery-title">
        <div class="container-site">
          <div class="reveal max-w-3xl">
            <p class="section-kicker">Photos from this destination</p>
            <h2 id="gallery-title" class="section-title">${place.name} Gallery</h2>
          </div>
          <div class="dest-gallery reveal mt-10">
            ${gallery}
          </div>
        </div>
      </section>
      `
          : ''
      }

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="faq-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-3xl text-center">
            <p class="section-kicker">Good to know</p>
            <h2 id="faq-title" class="section-title">Frequently Asked Questions</h2>
          </div>
          <div class="reveal mx-auto mt-10 grid max-w-4xl gap-4">
            ${faqs}
          </div>
        </div>
      </section>

      ${
        relatedTours
          ? `
      <section class="bg-black py-8 sm:py-10" aria-labelledby="dest-tours-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker !text-gold">Safaris in this destination</p>
            <h2 id="dest-tours-title" class="section-title !text-white">Packages that visit ${place.name}</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
            ${relatedTours}
          </div>
          <a class="btn-gold mt-10 !rounded-none" href="/tours/">View all safari packages</a>
        </div>
      </section>
      `
          : ''
      }

      <section class="bg-white py-8 sm:py-10" aria-labelledby="more-dest-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Explore more</p>
            <h2 id="more-dest-title" class="section-title">Other Tanzania destinations</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            ${morePlaces}
          </div>
        </div>
      </section>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="dest-cta-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal max-w-3xl">
            <h2 id="dest-cta-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Ready to explore ${place.name}?
            </h2>
            <p class="mt-3 text-ink/80">Our team is here to help you plan the perfect experience — nights, lodges, and the parks that sit next door.</p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="/contact/">Talk to an expert</a>
        </div>
      </section>
    </main>
  `;
}

export function applyDestinationMeta(slug) {
  const place = getDestinationBySlug(slug);
  if (!place) {
    document.title = 'Destination | Golden Memories Safaris';
    return;
  }
  document.title = `${place.name} Safari - Tanzania - Golden Memories Safaris`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', place.paragraphs[0]);
}
