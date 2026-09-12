import { escapeHtml } from '../escape.js';
import { editAttr } from '../edit.js';
import { resolveDayImage } from '../day-image.js';

export function renderItinerary(safari, options = {}) {
  const days = Array.isArray(safari.itinerary) ? safari.itinerary : [];
  if (!days.length && !options.editable) return '';
  const duration = safari.duration_label || (safari.duration ? `${safari.duration} Days` : 'Itinerary');
  const articles = days.map((item, index) => renderDay(item, safari, index, days.length)).join('');

  return `
    <section class="bg-black py-16 text-white sm:py-20 lg:py-24" aria-labelledby="itinerary-title"${editAttr(options.editable, 'itinerary')}>
      <div class="container-site">
        <div class="reveal max-w-3xl">
          <p class="section-kicker !text-gold">Itinerary</p>
          <h2 id="itinerary-title" class="section-title !text-white">${escapeHtml(duration)} — day to day</h2>
          <p class="mt-4 text-white/75">Each day is paced for game drives, transfers, and a proper night in camp or lodge.</p>
        </div>
        <div class="safari-itinerary reveal mt-12">
          ${articles || '<p class="text-white/70">Add itinerary days in the editor.</p>'}
        </div>
      </div>
    </section>
  `;
}

function renderDay(item, safari, index, total) {
  const facts = dayFacts(item, safari, index, total)
    .map(
      ([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `
    )
    .join('');
  const image = resolveDayImage(item, safari, index);
  const activities = Array.isArray(item.activities) ? item.activities.filter(Boolean) : [];

  return `
    <article class="safari-day">
      ${
        image
          ? `<div class="safari-day-media"><img src="${escapeHtml(image)}" alt="${escapeHtml(item.title || '')}" loading="lazy" width="900" height="680" /></div>`
          : ''
      }
      <div class="safari-day-copy">
        <p class="safari-day-label">${escapeHtml(item.day || `Day ${index + 1}`)}</p>
        <h3 class="safari-day-title">${escapeHtml(item.title || '')}</h3>
        <p class="safari-day-body">${escapeHtml(item.description || item.body || '')}</p>
        ${
          activities.length
            ? `<ul class="mt-4 list-disc space-y-1 pl-5 text-sm text-white/80">${activities
                .map((activity) => `<li>${escapeHtml(activity)}</li>`)
                .join('')}</ul>`
            : ''
        }
        ${facts ? `<dl class="safari-day-facts">${facts}</dl>` : ''}
      </div>
    </article>
  `;
}

function dayFacts(item, safari, index, total) {
  const last = index === total - 1;
  return [
    item.distance ? ['Duration', item.distance] : null,
    item.viewing ? ['Game viewing', item.viewing] : null,
    ['Transport', item.transport || safari.transport_information || '4x4 safari vehicle'],
    ['Meals included', item.meals || (last ? 'Breakfast' : 'Breakfast, lunch & dinner')],
    ['Accommodation', item.accommodation || item.stay || safari.accommodation || 'Lodge or camp as confirmed'],
  ].filter((row) => row && row[1]);
}

export function renderAccommodation(safari, options = {}) {
  if (!safari.accommodation && !options.editable) return '';
  return `
    <section class="bg-white py-16 sm:py-20" aria-labelledby="stay-title"${editAttr(options.editable, 'accommodation')}>
      <div class="container-site max-w-3xl">
        <p class="section-kicker">Accommodation</p>
        <h2 id="stay-title" class="section-title">Where you stay</h2>
        <p class="mt-6 font-body text-base leading-relaxed text-ink/75">${escapeHtml(safari.accommodation || 'Add accommodation notes in the editor.')}</p>
      </div>
    </section>
  `;
}
