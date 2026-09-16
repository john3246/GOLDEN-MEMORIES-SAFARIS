import { joinCard } from '../../components/cards/join-card.js';
import { isGalleryUrl, uniquePhoto, uniqueCoverFor, galleryKindForText } from '../../media/gallery.js';
import { safariPrice } from '@gm-safaris/safari-ui';
import { bookingHref } from '../tours/paths.js';
import { getJoinPackageBySlug, relatedJoinPackages } from './catalog.js';

function dayImage(item, pkg, used) {
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
  return uniquePhoto(`${hint} ${pkg.places || pkg.title || ''}`, used, used.size);
}

function dayFacts(item) {
  return [
    ['Date', item.dateLabel],
    item.viewing && item.viewing !== '—' ? ['Game viewing', item.viewing] : null,
    ['Transport', item.transport || 'Shared 4x4 safari vehicle'],
    ['Meals included', item.meals],
    ['Accommodation', item.stay],
  ]
    .filter((row) => row && row[1])
    .map(
      ([label, value]) => `
        <div>
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `
    )
    .join('');
}

/**
 * Join-group safari detail — same shape as a private safari page, data from the joining package.
 * @param {string} slug
 */
export function renderJoinDetail(slug) {
  const pkg = getJoinPackageBySlug(slug);
  if (!pkg) {
    return `
      <main id="main" class="bg-mist py-12">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Join Safari</p>
          <h1 class="section-title">Package not found</h1>
          <p class="mt-4 text-ink/70">That joining safari is no longer listed. Browse current group departures instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/join-safari/">View joining safaris</a>
        </div>
      </main>
    `;
  }

  const book = bookingHref(pkg);
  const price = safariPrice(pkg);
  const cover = uniqueCoverFor(pkg);
  const used = new Set([cover]);
  const days = (pkg.itinerary || [])
    .map((item) => {
      const facts = dayFacts(item);
      return `
        <article class="safari-day">
          <div class="safari-day-media">
            <img src="${dayImage(item, pkg, used)}" alt="" loading="lazy" width="900" height="680" />
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

  const highlights = (pkg.highlights || []).map((item) => `<li>${item}</li>`).join('');
  const included = (pkg.included || []).map((item) => `<li>${item}</li>`).join('');
  const excluded = (pkg.excluded || []).map((item) => `<li>${item}</li>`).join('');
  const related = relatedJoinPackages(pkg, 4).map(joinCard).join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="join-tour-title">
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
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">Joining safari</p>
          <h1 id="join-tour-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            ${pkg.title}
          </h1>
          <p class="mt-4 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white/85">
            ${pkg.datesLabel || 'Open 2026–2027'} · ${pkg.duration}${pkg.places ? ` · ${pkg.places}` : ''}
          </p>
          ${price ? `<p class="mt-5 font-body text-lg font-semibold tracking-wide text-gold sm:text-xl">${price.hero}</p>` : ''}
          <a class="btn-navy mt-8 !rounded-none" href="${book}">Book this safari</a>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/join-safari/">Join Safari</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">${pkg.title}</span>
        </div>
      </nav>

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="join-overview-title">
        <div class="container-site grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-16">
          <div class="reveal bg-white p-6 sm:p-10">
            <p class="section-kicker">Overview</p>
            <h2 id="join-overview-title" class="section-title">About this itinerary</h2>
            <p class="mt-5 font-body text-base leading-relaxed text-ink/75">${pkg.overview}</p>
          </div>

          <aside class="reveal safari-aside">
            <p class="section-kicker">At a glance</p>
            <h2 class="font-display text-2xl font-semibold text-black">Join this group</h2>
            <dl class="mt-6 space-y-3 font-body text-sm">
              <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Duration</dt>
                <dd class="font-bold text-black">${pkg.duration}</dd>
              </div>
              ${
                pkg.places
                  ? `<div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Places</dt>
                <dd class="text-right font-bold text-black">${pkg.places}</dd>
              </div>`
                  : ''
              }
              <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Dates</dt>
                <dd class="text-right font-bold text-black">${pkg.datesLabel || 'Open 2026–2027'}</dd>
              </div>
              ${
                price
                  ? `<div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">From</dt>
                <dd class="font-bold text-black">${price.perPerson}</dd>
              </div>`
                  : ''
              }
              <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                <dt class="text-ink/55">Style</dt>
                <dd class="font-bold text-black">${pkg.activity || 'Shared group safari'}</dd>
              </div>
            </dl>
            ${highlights ? `<h3 class="mt-8 font-body text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">Highlights</h3>
            <ul class="safari-bullets mt-3">${highlights}</ul>` : ''}
            <a class="btn-navy mt-8 w-full !rounded-none" href="${book}">Book this safari</a>
          </aside>
        </div>
      </section>

      <section class="bg-black py-10 text-white sm:py-12 lg:py-14" aria-labelledby="join-itinerary-title">
        <div class="container-site">
          <div class="reveal max-w-3xl">
            <p class="section-kicker !text-gold">Itinerary</p>
            <h2 id="join-itinerary-title" class="section-title !text-white">${pkg.duration} — day to day</h2>
            <p class="mt-4 text-white/75">Shared 4x4, professional guide, and the published joining route from Arusha.</p>
          </div>
          <div class="safari-itinerary reveal mt-12">
            ${days}
          </div>
        </div>
      </section>

      ${
        included || excluded
          ? `<section class="bg-mist py-8 sm:py-10" aria-labelledby="join-included-title">
        <div class="container-site grid gap-6 md:grid-cols-2">
          ${
            included
              ? `<article class="reveal bg-white p-6 sm:p-8">
            <h2 id="join-included-title" class="font-display text-2xl font-semibold text-black">What’s included</h2>
            <ul class="safari-bullets mt-5">${included}</ul>
          </article>`
              : ''
          }
          ${
            excluded
              ? `<article class="reveal bg-white p-6 sm:p-8">
            <h2 class="font-display text-2xl font-semibold text-black">What’s not included</h2>
            <ul class="safari-bullets mt-5">${excluded}</ul>
          </article>`
              : ''
          }
        </div>
      </section>`
          : ''
      }

      ${
        related
          ? `<section class="bg-black py-8 sm:py-10" aria-labelledby="join-related-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker !text-gold">Keep exploring</p>
            <h2 id="join-related-title" class="section-title !text-white">Other joining safaris</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
            ${related}
          </div>
        </div>
      </section>`
          : ''
      }

      <section class="bg-gold py-8 sm:py-10" aria-labelledby="join-cta-title">
        <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div class="reveal">
            <h2 id="join-cta-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Ready to join this group?
            </h2>
            <p class="mt-3 max-w-xl text-ink/80">This safari is already selected on the booking form — add your dates and group size and we will confirm a seat.</p>
          </div>
          <a class="reveal btn-navy !rounded-none shrink-0" href="${book}">Book this safari</a>
        </div>
      </section>
    </main>
  `;
}

export function applyJoinMeta(slug) {
  const pkg = getJoinPackageBySlug(slug);
  if (!pkg) {
    document.title = 'Joining safari | Golden Memories Safaris';
    return;
  }
  document.title = `${pkg.title} | Golden Memories Safaris`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', pkg.overview || pkg.title);
}
