import { escapeHtml } from '../escape.js';
import { editAttr } from '../edit.js';

export function renderHighlights(safari, options = {}) {
  const items = (safari.highlights || []).filter(Boolean);
  if (!items.length && !options.editable) return '';
  const list = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `
    <section class="bg-white py-8 sm:py-10" aria-labelledby="highlights-title">
      <div class="container-site max-w-3xl">
        <p class="section-kicker">Highlights</p>
        <h2 id="highlights-title" class="section-title">What this safari is known for</h2>
        <ul class="safari-bullets mt-8"${editAttr(options.editable, 'highlights')}>${list || '<li class="text-ink/50">Add highlights in the editor.</li>'}</ul>
      </div>
    </section>
  `;
}

export function renderGallery(safari, options = {}) {
  const gallery = Array.isArray(safari.gallery) ? safari.gallery.filter((item) => item?.url) : [];
  if (!gallery.length && !options.editable) return '';
  const figures = gallery
    .map(
      (item) => `
        <figure class="overflow-hidden bg-mist">
          <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt || '')}" loading="lazy" width="900" height="680" class="h-64 w-full object-cover" />
          ${item.caption ? `<figcaption class="px-4 py-3 text-sm text-ink/70">${escapeHtml(item.caption)}</figcaption>` : ''}
        </figure>
      `
    )
    .join('');

  return `
    <section class="bg-mist py-4 sm:py-5" aria-labelledby="gallery-title"${editAttr(options.editable, 'gallery')}>
      <div class="container-site">
        <p class="section-kicker">Gallery</p>
        <h2 id="gallery-title" class="section-title">Moments on this route</h2>
        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${figures || '<p class="text-ink/60">Add gallery images in the editor.</p>'}
        </div>
      </div>
    </section>
  `;
}

export function renderFacts(safari, options = {}) {
  const rows = [
    ['Duration', safari.duration_label || (safari.duration ? `${safari.duration} Days` : '')],
    ['Destination', safari.destination],
    ['Difficulty', safari.difficulty],
    ['Best season', safari.best_season],
    ['Group size', groupSize(safari)],
    ['Transport', safari.transport_information],
  ].filter(([, value]) => value);

  if (!rows.length && !options.editable) return '';

  return `
    <section class="bg-white py-8 sm:py-10" aria-labelledby="facts-title"${editAttr(options.editable, 'facts')}>
      <div class="container-site max-w-3xl">
        <p class="section-kicker">Safari facts</p>
        <h2 id="facts-title" class="section-title">At a glance</h2>
        <dl class="mt-8 divide-y divide-black/10">
          ${rows
            .map(
              ([label, value]) => `
            <div class="flex justify-between gap-6 py-3 font-body text-sm">
              <dt class="text-ink/55">${escapeHtml(label)}</dt>
              <dd class="text-right font-bold text-black">${escapeHtml(value)}</dd>
            </div>`
            )
            .join('')}
        </dl>
      </div>
    </section>
  `;
}

function groupSize(safari) {
  if (!safari.minimum_people && !safari.maximum_people) return '';
  if (safari.minimum_people && safari.maximum_people) {
    return `${safari.minimum_people}–${safari.maximum_people} people`;
  }
  if (safari.minimum_people) return `From ${safari.minimum_people} people`;
  return `Up to ${safari.maximum_people} people`;
}
