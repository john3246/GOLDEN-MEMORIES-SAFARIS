import { brandTitle } from '@gm-safaris/safari-ui';
import { safariCard } from '../../components/cards/safari-card.js';
import { articleCard } from '../../components/cards/article-card.js';
import {
  destinationCanonical,
  destinationJsonLd,
  destinationMapSrc,
  lodgeCategoryLabel,
  renderDestinationBlocks,
  renderMonthGuide,
} from '@gm-safaris/safari-ui';
import { getDestinationBySlug, lodgesForDestination, relatedDestinations, toursForDestination } from './catalog.js';
import { destinationHref } from './paths.js';
import { withoutCover, uniqueCoverFor } from '../../media/gallery.js';
import { blogArticles, topicLabel } from '../blog/content.js';

function articlesForDestination(place, count = 3) {
  const explicit = (place.relatedPostSlugs || [])
    .map((slug) => blogArticles.find((item) => item.slug === slug))
    .filter(Boolean);
  const rest = blogArticles.filter((article) => {
    if (explicit.includes(article)) return false;
    if ((article.destination_slugs || []).includes(place.slug)) return true;
    const hay = `${article.title} ${article.excerpt || ''}`.toLowerCase();
    return hay.includes(String(place.name || '').toLowerCase()) || hay.includes(String(place.slug || '').replace(/-/g, ' '));
  });
  return [...explicit, ...rest].slice(0, count);
}

function lodgeCard(lodge) {
  return `
    <article class="tour-card flex h-full min-w-0 flex-col border border-ink/10">
      <a href="/accommodations/" class="relative block aspect-[16/9] overflow-hidden bg-mist">
        <img class="absolute inset-0 h-full w-full object-cover" src="${lodge.image}" alt="${lodge.name}" loading="lazy" decoding="async" width="800" height="450" />
      </a>
      <div class="flex flex-1 flex-col p-3.5 sm:p-4">
        <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${lodgeCategoryLabel(lodge.category)}${lodge.place ? ` · ${lodge.place}` : ''}</p>
        <h3 class="mt-1 font-display text-lg font-semibold text-black">${lodge.name}</h3>
        <p class="mt-2 text-sm leading-relaxed text-ink/70">${lodge.blurb || ''}</p>
        <a href="/accommodations/" class="card-link mt-auto pt-4 font-body text-sm font-bold uppercase tracking-[0.1em] text-black">View stays <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
}

function sectionNav(place) {
  const items = [
    { href: '#overview', label: 'Overview' },
    { href: '#highlights', label: 'Highlights' },
    { href: '#when-to-go', label: 'Best time' },
    { href: '#getting-there', label: 'Getting there' },
    { href: '#tours', label: 'Tours' },
    { href: '#stay', label: 'Where to stay' },
    { href: '#guides', label: 'Guides' },
  ];
  return `
    <nav class="dest-section-nav" aria-label="On this page">
      <div class="container-site dest-section-nav-row">
        ${items.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
        <a class="dest-section-nav-cta" href="/contact/">${place.cta || 'Plan a safari'}</a>
      </div>
    </nav>`;
}

function factBar(place) {
  const best = (place.seasons || [])[0]?.title || (place.facts || []).find((row) => /best time/i.test(row[0] || ''))?.[1] || 'Year-round';
  const wildlife = (place.wildlife || [])[0] || (place.attractions || [])[0] || 'Resident game';
  return `
    <div class="dest-factbar">
      <div><p>Best time</p><strong>${best}</strong></div>
      <div><p>Wildlife &amp; highlights</p><strong>${wildlife}</strong></div>
      <div><p>Region</p><strong>${place.region || place.country || 'Tanzania'}</strong></div>
    </div>`;
}

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
  const coverAlt = place.imageAlt || place.heroImage?.alt || place.name;
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

  const climate = (place.climate || [])
    .map(
      (item) => `
        <article class="border border-ink/10 bg-white p-6">
          <h3 class="font-display text-lg font-semibold text-black">${item.title}</h3>
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
        <button class="dest-gallery-item" type="button" data-dest-lightbox="${src}" data-dest-alt="${place.name}">
          <img src="${src}" alt="${place.name} gallery photo ${index + 1}" loading="lazy" width="900" height="680" />
        </button>
      `
    )
    .join('');

  const relatedTours = toursForDestination(place, 4).map(safariCard).join('');
  const stays = lodgesForDestination(place, 6).map(lodgeCard).join('');
  const guides = articlesForDestination(place, 3)
    .map((article) => articleCard(article, topicLabel(article.topic)))
    .join('');
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

  const mapSrc = destinationMapSrc(place.lat, place.lng);
  const airstrips = (place.airstrips || []).map((item) => `<li>${item}</li>`).join('');
  const gettingThere = place.gettingThere || (place.faqs || []).find((item) => /how do i get|getting there/i.test(item.q || ''))?.a || '';

  return `
    <main id="main" class="dest-detail-page">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="dest-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${cover}"
          alt="${coverAlt}"
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

      ${sectionNav(place)}

      <section class="bg-mist py-4 sm:py-5" aria-label="Quick facts">
        <div class="container-site">${factBar(place)}</div>
      </section>

      <section class="bg-gold py-8 sm:py-10" id="overview" aria-labelledby="dest-about-title">
        <div class="container-site grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-16">
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">About this destination</p>
            <h2 id="dest-about-title" class="section-title">Overview &amp; Highlights</h2>
            ${
              place.blocks?.length
                ? renderDestinationBlocks(place.blocks)
                : (place.paragraphs || []).map((p) => `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${p}</p>`).join('')
            }
          </div>
          <aside class="reveal safari-aside dest-sticky-cta">
            <p class="section-kicker">Plan a custom safari</p>
            <h2 class="font-display text-2xl font-semibold text-black">Ask the Arusha team</h2>
            <dl class="mt-6 space-y-3 font-body text-sm">${facts}</dl>
            <p class="mt-6 text-sm text-ink/70"><span class="font-bold text-black">Location. </span>${place.location}</p>
            <a class="btn-navy mt-8 w-full !rounded-none" href="/contact/">Plan a custom safari</a>
            <p class="mt-3 text-center text-xs text-ink/55">Nights, lodges, and park order — matched to your dates.</p>
          </aside>
        </div>
      </section>

      <section class="bg-mist py-8 sm:py-10" id="highlights" aria-labelledby="highlights-title">
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

      <section class="bg-white py-8 sm:py-10" id="when-to-go" aria-labelledby="season-title">
        <div class="container-site">
          <div class="reveal max-w-3xl">
            <p class="section-kicker">When to travel</p>
            <h2 id="season-title" class="section-title">Best Time to Visit &amp; Climate</h2>
          </div>
          <div class="reveal mt-8">${renderMonthGuide(place.monthGuide)}</div>
          <div class="reveal mt-10 grid gap-5 md:grid-cols-2">
            ${seasons}
          </div>
          ${
            climate
              ? `<div class="reveal mt-8 grid gap-4 md:grid-cols-3">${climate}</div>`
              : ''
          }
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

      <section class="bg-mist py-8 sm:py-10" id="getting-there" aria-labelledby="getting-title">
        <div class="container-site grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div class="reveal">
            <p class="section-kicker">Travel logistics</p>
            <h2 id="getting-title" class="section-title">How to Get There</h2>
            ${gettingThere ? `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${gettingThere}</p>` : ''}
            ${airstrips ? `<ul class="dest-wildlife mt-6 text-ink/80">${airstrips}</ul>` : ''}
            ${place.entryFees ? `<div class="mt-6 border border-ink/10 bg-white p-6"><h3 class="font-display text-xl font-semibold text-black">Park fees and rules</h3><p class="mt-3 text-sm leading-relaxed text-ink/70">${place.entryFees}</p></div>` : ''}
          </div>
          ${
            mapSrc
              ? `<div class="reveal dest-map-wrap"><iframe src="${mapSrc}" title="Map of ${place.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
              : ''
          }
        </div>
      </section>

      ${
        gallery
          ? `
      <section class="bg-white py-8 sm:py-10" aria-labelledby="gallery-title">
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
      <section class="bg-black py-8 sm:py-10" id="tours" aria-labelledby="dest-tours-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker !text-gold">Featured tours &amp; packages</p>
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

      ${
        stays
          ? `
      <section class="bg-mist py-8 sm:py-10" id="stay" aria-labelledby="stay-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Where to stay</p>
            <h2 id="stay-title" class="section-title">Lodges and camps in this region</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            ${stays}
          </div>
          <a class="btn-navy mt-8 !rounded-none" href="/accommodations/">Browse all stays</a>
        </div>
      </section>
      `
          : ''
      }

      ${
        guides
          ? `
      <section class="bg-white py-8 sm:py-10" id="guides" aria-labelledby="guides-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Related travel guides</p>
            <h2 id="guides-title" class="section-title">Journal stories from ${place.name}</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            ${guides}
          </div>
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
      <div class="dest-lightbox" hidden data-dest-lightbox-root>
        <button type="button" class="dest-lightbox-close" data-dest-lightbox-close aria-label="Close image">×</button>
        <img alt="" />
      </div>
    </main>
  `;
}

function upsertMeta(selector, attr, value) {
  if (!value) return;
  let node = document.querySelector(selector);
  if (!node) {
    node = document.createElement(selector.startsWith('meta') ? 'meta' : selector.startsWith('link') ? 'link' : 'meta');
    const match = selector.match(/\[([^=]+)="([^"]+)"\]/);
    if (match) node.setAttribute(match[1], match[2]);
    document.head.appendChild(node);
  }
  node.setAttribute(attr, value);
}

export function applyDestinationMeta(slug) {
  const place = getDestinationBySlug(slug);
  if (!place) return;
  const shortName = String(place.name || '').replace(/ National Park| Conservation Area/, '');
  const title = place.seo_title && place.seo_title !== place.name ? place.seo_title : brandTitle(`${shortName} Safari Guide & Best Time to Visit`);
  const description = place.seo_description || place.tagline || place.paragraphs?.[0] || '';
  const url = destinationCanonical(place);
  const image = place.og_image || place.image || '';
  const abs = image.startsWith('http') ? image : image ? `https://www.gmsafaris.com${image}` : '';
  document.title = title;
  upsertMeta('meta[name="description"]', 'content', description);
  upsertMeta('meta[name="keywords"]', 'content', place.seo_keywords);
  upsertMeta('link[rel="canonical"]', 'href', url);
  upsertMeta('meta[property="og:title"]', 'content', place.seo_title || place.name);
  upsertMeta('meta[property="og:description"]', 'content', description);
  upsertMeta('meta[property="og:type"]', 'content', 'website');
  upsertMeta('meta[property="og:url"]', 'content', url);
  upsertMeta('meta[property="og:image"]', 'content', abs);
  upsertMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  let script = document.querySelector('#destination-json-ld');
  if (!script) {
    script = document.createElement('script');
    script.id = 'destination-json-ld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(destinationJsonLd(place));
}

export function initDestinationDetail() {
  const page = document.querySelector('.dest-detail-page');
  if (!page) return;
  const lightbox = page.querySelector('[data-dest-lightbox-root]');
  const lightboxImg = lightbox?.querySelector('img');
  page.querySelectorAll('[data-dest-lightbox]').forEach((node) => {
    node.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = node.getAttribute('data-dest-lightbox') || '';
      lightboxImg.alt = node.getAttribute('data-dest-alt') || '';
      lightbox.hidden = false;
    });
  });
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.hasAttribute('data-dest-lightbox-close')) {
      lightbox.hidden = true;
      if (lightboxImg) lightboxImg.src = '';
    }
  });
  const links = [...page.querySelectorAll('.dest-section-nav a[href^="#"]')];
  const headings = links.map((link) => page.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (links.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = `#${visible.target.id}`;
        links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === id));
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 1] }
    );
    headings.forEach((heading) => observer.observe(heading));
  }
}
