import { escapeHtml, paragraphs } from '../escape.js';
import { editAttr } from '../edit.js';
import { safariPrice } from '../price.js';

function bookingUrl(safari) {
  const slug = safari?.slug;
  return slug ? `/booking/?safari=${encodeURIComponent(slug)}` : '/booking/';
}

export function renderHero(safari, options = {}) {
  const editable = Boolean(options.editable);
  const image = safari.hero_image?.url || '';
  const kicker = safari.featured
    ? 'Trip of the month'
    : safari.difficulty || 'Safari package';
  const duration = safari.duration_label || (safari.duration ? `${safari.duration} Days` : '');
  const places = safari.destination ? ` · ${escapeHtml(safari.destination)}` : '';
  const price = safariPrice(safari);

  return `
    <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="tour-title"${editAttr(editable, 'hero_image')}>
      ${
        image
          ? `<img class="absolute inset-0 h-full w-full object-cover" src="${escapeHtml(image)}" alt="${escapeHtml(safari.hero_image?.alt || '')}" width="2000" height="900" fetchpriority="high" />`
          : `<div class="absolute inset-0 bg-black"></div>`
      }
      <div class="absolute inset-0 bg-black/55"></div>
      <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem]">
        <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">${escapeHtml(kicker)}</p>
        <h1 id="tour-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"${editAttr(editable, 'title')}>
          ${escapeHtml(safari.title || 'Untitled safari')}
        </h1>
        <p class="mt-4 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white/85">
          ${escapeHtml(duration)}${places}
        </p>
        ${
          price
            ? `<p class="safari-price-hero mt-5 font-body text-lg font-semibold tracking-wide text-gold sm:text-xl">${escapeHtml(price.hero)}</p>
        <p class="mt-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white/70">${escapeHtml(price.sharing)} for ${price.share} sharing</p>`
            : ''
        }
        <a class="btn-navy mt-8 !rounded-none" href="${bookingUrl(safari)}">Book this safari</a>
      </div>
    </section>
  `;
}

export function renderOverview(safari, options = {}) {
  const editable = Boolean(options.editable);
  const price = safariPrice(safari);
  const highlights = (safari.highlights || [])
    .filter(Boolean)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  return `
    <section class="bg-gold py-8 sm:py-10" aria-labelledby="tour-overview-title">
      <div class="container-site grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:gap-16">
        <div class="reveal bg-white p-6 sm:p-10">
          <p class="section-kicker">Overview</p>
          <h2 id="tour-overview-title" class="section-title">About this itinerary</h2>
          <div class="mt-5 font-body text-base leading-relaxed text-ink/75 space-y-4"${editAttr(editable, 'description')}>
            ${paragraphs(safari.description || safari.short_description)}
          </div>
        </div>
        <aside class="reveal safari-aside">
          <p class="section-kicker">At a glance</p>
          <h2 class="font-display text-2xl font-semibold text-black">Plan this trip</h2>
          <dl class="mt-6 space-y-3 font-body text-sm"${editAttr(editable, 'facts')}>
            ${factRow('Duration', safari.duration_label || (safari.duration ? `${safari.duration} Days` : ''))}
            ${factRow('Places', safari.destination)}
            ${factRow('Style', safari.difficulty)}
            ${factRow('Best season', safari.best_season)}
            ${price ? factRow('Price per person', price.perPerson) : ''}
            ${price ? factRow(`For ${price.share} sharing`, price.sharing) : ''}
          </dl>
          ${price ? `<p class="mt-4 font-body text-xs leading-relaxed text-ink/60">${escapeHtml(price.note)}</p>` : ''}
          ${
            highlights
              ? `<h3 class="mt-8 font-body text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">Highlights</h3>
            <ul class="safari-bullets mt-3"${editAttr(editable, 'highlights')}>${highlights}</ul>`
              : ''
          }
          <a class="btn-navy mt-8 w-full !rounded-none" href="${bookingUrl(safari)}">Book this safari</a>
        </aside>
      </div>
    </section>
  `;
}

function factRow(label, value) {
  if (!value) return '';
  return `
    <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
      <dt class="text-ink/55">${escapeHtml(label)}</dt>
      <dd class="text-right font-bold text-black">${escapeHtml(value)}</dd>
    </div>
  `;
}
