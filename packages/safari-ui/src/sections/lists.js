import { escapeHtml } from '../escape.js';
import { editAttr } from '../edit.js';
import { safariPrice } from '../price.js';

export function renderIncluded(safari, options = {}) {
  const items = (safari.inclusions || safari.included || []).filter(Boolean);
  if (!items.length && !options.editable) return '';
  return listSection({
    id: 'included-title',
    title: 'What’s included',
    field: 'inclusions',
    items,
    editable: options.editable,
    empty: 'Add inclusions in the editor.',
  });
}

export function renderExcluded(safari, options = {}) {
  const items = (safari.exclusions || safari.excluded || []).filter(Boolean);
  if (!items.length && !options.editable) return '';
  return listSection({
    id: 'excluded-title',
    title: 'What’s not included',
    field: 'exclusions',
    items,
    editable: options.editable,
    empty: 'Add exclusions in the editor.',
  });
}

export function renderIncludedExcluded(safari, options = {}) {
  const included = renderIncluded(safari, options);
  const excluded = renderExcluded(safari, options);
  if (!included && !excluded) return '';
  return `
    <section class="bg-mist py-8 sm:py-10" aria-labelledby="included-title">
      <div class="container-site grid gap-6 md:grid-cols-2">
        ${included}
        ${excluded}
      </div>
    </section>
  `;
}

function listSection({ id, title, field, items, editable, empty }) {
  const list = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `
    <article class="bg-white p-6 sm:p-8" aria-labelledby="${id}"${editAttr(editable, field)}>
      <h2 id="${id}" class="font-display text-2xl font-semibold text-black">${escapeHtml(title)}</h2>
      <ul class="safari-bullets mt-5">${list || `<li>${escapeHtml(empty)}</li>`}</ul>
    </article>
  `;
}

export function renderDestination(safari, options = {}) {
  if (!safari.destination && !options.editable) return '';
  return `
    <section class="bg-white py-8 sm:py-10" aria-labelledby="destination-title"${editAttr(options.editable, 'destination')}>
      <div class="container-site max-w-3xl">
        <p class="section-kicker">Destination</p>
        <h2 id="destination-title" class="section-title">${escapeHtml(safari.destination || 'Destination')}</h2>
        <p class="mt-6 font-body text-base leading-relaxed text-ink/75">${escapeHtml(safari.short_description || '')}</p>
      </div>
    </section>
  `;
}

export function renderMap(safari, options = {}) {
  const map = safari.map;
  if (!map && !options.editable) return '';
  const label = map?.label || safari.destination || 'Map';
  const embed = map?.embed_url;
  return `
    <section class="bg-mist py-8 sm:py-10" aria-labelledby="map-title"${editAttr(options.editable, 'map')}>
      <div class="container-site">
        <p class="section-kicker">Map</p>
        <h2 id="map-title" class="section-title">${escapeHtml(label)}</h2>
        ${
          embed
            ? `<div class="mt-8 overflow-hidden bg-white aspect-[16/9]"><iframe title="${escapeHtml(label)}" src="${escapeHtml(embed)}" class="h-full w-full border-0" loading="lazy"></iframe></div>`
            : `<p class="mt-6 text-ink/70">${escapeHtml(map?.notes || 'Add a map embed URL in the editor.')}</p>`
        }
      </div>
    </section>
  `;
}

export function renderFaq(safari, options = {}) {
  const items = Array.isArray(safari.faq) ? safari.faq.filter((item) => item?.q) : [];
  if (!items.length && !options.editable) return '';
  const details = items
    .map(
      (item) => `
        <details class="safari-faq bg-white">
          <summary>${escapeHtml(item.q)}</summary>
          <p>${escapeHtml(item.a || '')}</p>
        </details>
      `
    )
    .join('');

  return `
    <section class="bg-mist py-8 sm:py-10" aria-labelledby="faq-title"${editAttr(options.editable, 'faq')}>
      <div class="container-site max-w-3xl">
        <p class="section-kicker">FAQ</p>
        <h2 id="faq-title" class="section-title">Questions about this safari</h2>
        <div class="mt-8 space-y-3">${details || '<p class="text-ink/60">Add FAQs in the editor.</p>'}</div>
      </div>
    </section>
  `;
}

export function renderBookingCta(safari, options = {}) {
  const price = safariPrice(safari);
  return `
    <section class="bg-gold py-8 sm:py-10" aria-labelledby="tour-cta-title"${editAttr(options.editable, 'booking_cta')}>
      <div class="container-site flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div class="reveal">
          <h2 id="tour-cta-title" class="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Ready to travel this route?
          </h2>
          ${
            price
              ? `<p class="mt-3 font-body text-xl font-semibold text-ink">${escapeHtml(price.hero)}</p>
          <p class="mt-1 font-body text-sm text-ink/70">${escapeHtml(price.sharing)} for ${price.share} travellers sharing</p>`
              : ''
          }
          <p class="mt-3 max-w-xl text-ink/80">${escapeHtml(safari.short_description || 'Share your dates and group size — we will confirm lodges, park fees, and the vehicle setup.')}</p>
        </div>
        <a class="reveal btn-navy !rounded-none shrink-0" href="${safari?.slug ? `/booking/?safari=${encodeURIComponent(safari.slug)}` : '/booking/'}">Book this safari</a>
      </div>
    </section>
  `;
}

export function renderRelated(relatedHtml) {
  if (!relatedHtml) return '';
  return `
    <section class="bg-black py-8 sm:py-10" aria-labelledby="related-title">
      <div class="container-site">
        <div class="reveal max-w-2xl">
          <p class="section-kicker !text-gold">Keep exploring</p>
          <h2 id="related-title" class="section-title !text-white">Other Tanzania itineraries</h2>
        </div>
        <div class="reveal mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
          ${relatedHtml}
        </div>
      </div>
    </section>
  `;
}
