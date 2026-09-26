import { escapeHtml } from '../escape.js';
import { editAttr } from '../edit.js';
import { resolveDayImage } from '../day-image.js';
import { lodgeCategoryLabel } from '@gm-safaris/shared-types';

export function renderItinerary(safari, options = {}) {
  const days = Array.isArray(safari.itinerary) ? safari.itinerary : [];
  if (!days.length && !options.editable) return '';
  const duration = safari.duration_label || (safari.duration ? `${safari.duration} Days` : 'Itinerary');
  const articles = days.map((item, index) => renderDay(item, safari, index, days.length)).join('');
  const isMountain = safari.tour_type === 'mountain' || /kilimanjaro|meru|climb|trek|machame|marangu|lemosho|umbwe|rongai/i.test(`${safari.title || ''} ${safari.activity || ''}`);

  const subtitle = isMountain 
    ? 'Daily trekking overview with altitudes, walking durations, and vegetation zones.'
    : 'Each day is paced for game drives, transfers, and a proper night in camp or lodge.';

  return `
    <section class="bg-black py-5 text-white sm:py-6" aria-labelledby="itinerary-title"${editAttr(options.editable, 'itinerary')}>
      <div class="container-site">
        <div class="reveal max-w-3xl">
          <p class="section-kicker !text-gold">Itinerary</p>
          <h2 id="itinerary-title" class="section-title !text-white">${escapeHtml(duration)} - day to day</h2>
          <p class="mt-3 text-white/75">${subtitle}</p>
        </div>
        <div class="safari-itinerary reveal mt-6">
          ${articles || '<p class="text-white/70">Add itinerary days in the editor.</p>'}
        </div>
      </div>
    </section>
  `;
}

function renderDay(item, safari, index, total) {
  const isMountain = safari.tour_type === 'mountain' || /kilimanjaro|meru|climb|trek|machame|marangu|lemosho|umbwe|rongai/i.test(`${safari.title || ''} ${safari.activity || ''}`);
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
  
  // resolveDayImage resolves the main side-by-side day illustration/image on the left
  const image = resolveDayImage(item, safari, index);
  const activities = Array.isArray(item.activities) ? item.activities.filter(Boolean) : [];
  const last = index === total - 1;

  // Dedicated Accommodation Section (Directly Below Specs Table)
  const accName = item.accommodation_name || item.accommodation || item.stay || (last ? '' : isMountain ? 'Mountain Camp or Hut' : 'Lodge or camp as confirmed');
  const accImage = item.accommodation_image || (typeof item.image === 'string' && !item.image.includes('gallery') ? item.image : '') || '';
  const fallbackImage = isMountain ? '/images/gallery/kilimanjaro-02.webp' : '/images/accommodations/tukaone-camp.webp';
  const displayImage = accImage || fallbackImage;

  const accCard = accName ? `
    <div class="mt-4 mb-3">
      <span class="text-xs uppercase tracking-wider text-amber-500 font-semibold">
        Accommodation
      </span>
      <p class="text-white font-medium text-base mt-0.5">
        ${escapeHtml(accName)}
      </p>
    </div>
    <div class="w-full h-64 md:h-72 rounded-2xl overflow-hidden border border-white/10 relative group bg-black/20">
      <img
        src="${escapeHtml(displayImage)}"
        alt="${escapeHtml(accName)}"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        onerror="this.onerror=null; this.src='${escapeHtml(fallbackImage)}';"
      />
    </div>
  ` : '';

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
        ${accCard}
      </div>
    </article>
  `;
}

function dayFacts(item, safari, index, total) {
  const isMountain = safari.tour_type === 'mountain' || /kilimanjaro|meru|climb|trek|machame|marangu|lemosho|umbwe|rongai/i.test(`${safari.title || ''} ${safari.activity || ''}`);
  const last = index === total - 1;
  const mealsDef = last ? 'Breakfast' : 'Breakfast, lunch & dinner';

  if (isMountain) {
    // Strictly exclude "Game viewing" and "Transport"
    return [
      item.elevation ? ['Elevation', item.elevation] : null,
      item.hiking_time ? ['Walking Time', item.hiking_time] : null,
      item.vegetation_zone ? ['Vegetation Zone', item.vegetation_zone] : null,
      ['Meals Included', item.meals_included || item.meals || mealsDef],
    ].filter((row) => row && row[1]);
  }

  // Wildlife Safaris: Transport, Game viewing, and Meals included
  return [
    ['Transport', item.transport || safari.transport_information || '4x4 safari vehicle with pop-up roof'],
    ['Game viewing', item.viewing || (last ? 'Morning game drive' : '6–7 hours game drives')],
    ['Meals included', item.meals_included || item.meals || mealsDef],
  ].filter((row) => row && row[1]);
}

export function renderLodges(safari, options = {}) {
  const lodges = Array.isArray(safari.lodges) ? safari.lodges.filter((item) => item?.name) : [];
  if (!lodges.length && !options.editable) return '';
  const cards = lodges
    .map(
      (item) => `
      <article class="safari-lodge">
        <div class="safari-lodge-media">
          <img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name)}" loading="lazy" width="600" height="400" />
        </div>
        <div class="safari-lodge-body">
          <p class="safari-lodge-kicker">${escapeHtml(item.place || '')}</p>
          <h3 class="safari-lodge-name">${escapeHtml(item.name)}</h3>
          <p class="safari-lodge-cat">${escapeHtml(lodgeCategoryLabel(item.category) || '')}</p>
          <p class="safari-lodge-blurb">${escapeHtml(item.blurb || '')}</p>
        </div>
      </article>
    `
    )
    .join('');

  return `
    <section class="bg-sand py-5 sm:py-6" aria-labelledby="lodges-title"${editAttr(options.editable, 'lodges')}>
      <div class="container-site">
        <div class="reveal max-w-2xl">
          <p class="section-kicker">Lodging</p>
          <h2 id="lodges-title" class="section-title">Where you stay</h2>
        </div>
        <div class="safari-lodges reveal mt-6">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

export function renderAccommodation(safari, options = {}) {
  if (!safari.accommodation && !options.editable) return '';
  return `
    <section class="bg-white py-8 sm:py-10" aria-labelledby="stay-title"${editAttr(options.editable, 'accommodation')}>
      <div class="container-site max-w-3xl">
        <p class="section-kicker">Accommodation</p>
        <h2 id="stay-title" class="section-title">Where you stay</h2>
        <p class="mt-6 font-body text-base leading-relaxed text-ink/75">${escapeHtml(safari.accommodation || 'Add accommodation notes in the editor.')}</p>
      </div>
    </section>
  `;
}
