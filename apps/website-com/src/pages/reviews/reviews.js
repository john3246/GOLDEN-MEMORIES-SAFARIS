import { reviewsHero, reviewList } from './content.js';
import { reviewData } from '../../services/cms/overlay.js';

const SOURCES = {
  google: { label: 'Google', cta: 'Read on Google' },
  tripadvisor: { label: 'Tripadvisor', cta: 'Read on Tripadvisor' },
  safaribookings: { label: 'SafariBookings', cta: 'Read on SafariBookings' },
  website: { label: 'Guest story', cta: '' },
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeHref(value) {
  const url = String(value || '').trim();
  return /^https:\/\//i.test(url) ? esc(url) : '';
}

function stars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.round(value);
  return `<span class="review-stars" role="img" aria-label="${value.toFixed(1)} out of 5 stars">${'★'.repeat(full)}<span class="review-stars-off">${'★'.repeat(5, full)}</span></span>`;
}

function formatDate(value) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function sourceBadges() {
  const sources = reviewData.summary?.sources || {};
  const links = reviewData.links || {};
  const cards = ['tripadvisor', 'google', 'safaribookings']
    .map((key) => {
      const row = sources[key] || {};
      const href = safeHref(row.url || links[key]);
      if (!row.rating && !href) return '';
      return `
        <a class="review-source" ${href ? `href="${href}" target="_blank" rel="noopener"` : ''}>
          <span class="review-source-name">${esc(SOURCES[key].label)}</span>
          ${row.rating ? `<strong>${Number(row.rating).toFixed(1)}</strong>${stars(row.rating)}` : '<strong>—</strong>'}
          <span class="review-source-count">${row.count ? `${Number(row.count).toLocaleString('en-GB')} reviews` : 'See our profile'}</span>
        </a>`;
    })
    .filter(Boolean)
    .join('');
  if (!cards) return '';
  const overall = reviewData.summary?.overall;
  return `
    <section class="bg-white py-8 sm:py-10" aria-labelledby="ratings-title">
      <div class="container-site">
        <p class="section-kicker">Independent ratings</p>
        <h2 id="ratings-title" class="section-title">${overall ? `Rated ${Number(overall).toFixed(1)} out of 5 by our guests` : 'What guests say on independent review sites'}</h2>
        <div class="review-sources mt-6">${cards}</div>
      </div>
    </section>`;
}

function reviewCard(item) {
  const source = SOURCES[item.source] || SOURCES.website;
  const href = safeHref(item.url);
  return `
    <article class="quote-card review-card bg-white p-5 sm:p-6">
      <header class="review-card-head">
        ${item.rating ? stars(item.rating) : ''}
        <span class="review-badge review-badge-${esc(item.source)}">${esc(source.label)}</span>
      </header>
      ${item.title ? `<h3 class="review-title">${esc(item.title)}</h3>` : ''}
      <p class="font-display text-base italic leading-relaxed text-ink/80">“${esc(item.text)}”</p>
      <footer class="mt-4">
        <cite class="not-italic font-body text-sm font-bold uppercase tracking-[0.1em] text-black">${esc(item.author)}</cite>
        <p class="mt-1 text-sm text-ink/55">${[esc(item.country), esc(formatDate(item.date))].filter(Boolean).join(' · ')}</p>
        ${href && source.cta ? `<a class="review-link" href="${href}" target="_blank" rel="noopener">${esc(source.cta)}</a>` : ''}
      </footer>
    </article>`;
}

export function renderReviews() {
  const imported = (reviewData.reviews || []).filter((item) => item.text);
  const fallback = reviewList.map((item) => ({
    source: 'website',
    author: item.name,
    country: item.detail,
    text: item.quote,
    rating: 5,
  }));
  const seen = new Set();
  const all = [...imported, ...fallback].filter((item) => {
    const key = `${item.author}|${String(item.text).slice(0, 40)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const cards = all.map(reviewCard).join('');
  const links = reviewData.links || {};
  const ta = safeHref(links.tripadvisor);
  const gg = safeHref(links.google);
  const sb = safeHref(links.safaribookings);
  const writeLinks = [ta && `<a class="btn-navy !rounded-none" href="${ta}" target="_blank" rel="noopener">Review us on Tripadvisor</a>`, gg && `<a class="btn-navy !rounded-none" href="${gg}" target="_blank" rel="noopener">Review us on Google</a>`, sb && `<a class="btn-navy !rounded-none" href="${sb}" target="_blank" rel="noopener">Review us on SafariBookings</a>`]
    .filter(Boolean)
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="reviews-hero-title">
        <img class="absolute inset-0 h-full w-full object-cover" src="${reviewsHero.image}" alt="Guests watching wildlife from a safari vehicle in Tanzania" width="2000" height="900" fetchpriority="high" />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col justify-end py-8 sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="font-body text-xs font-semibold uppercase tracking-[0.12em] text-white/80"><a href="/">Home</a> <span aria-hidden="true">›</span> Reviews</p>
          <h1 id="reviews-hero-title" class="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Guest reviews</h1>
          <p class="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">Honest feedback from travellers who explored Tanzania with our guides, collected from Tripadvisor, Google, SafariBookings and our own guests.</p>
        </div>
      </section>
      ${sourceBadges()}
      <section class="bg-mist py-8 sm:py-10">
        <div class="container-site">
          <p class="section-kicker">In their words</p>
          <h2 class="section-title">Stories from the road</h2>
          <div class="mt-6 grid gap-4 md:grid-cols-2">${cards}</div>
          <div class="mt-10 max-w-2xl">
            <h2 class="section-title !text-2xl">Travelled with us?</h2>
            <p class="mt-3 text-base text-ink/75">Your review helps other travellers choose with confidence, and tells our guides and drivers that their work mattered. Thank you for taking a moment to share it.</p>
            <div class="mt-5 flex flex-wrap gap-3">${writeLinks}<a class="btn-navy !rounded-none" href="/contact/">Plan your safari</a></div>
          </div>
        </div>
      </section>
    </main>
  `;
}
