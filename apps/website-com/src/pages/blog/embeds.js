import { destinationPlaces } from '../destinations/catalog.js';
import { tourCard } from '../../components/cards/tour-card.js';
import { featuredTours } from '../home/content.js';
import { lodges } from '../accommodations/content.js';
import { safariPackages } from '../tours/content.js';
import { gmsTrips } from '../tours/gms-trips.js';
import { lodgeCategoryLabel } from '@gm-safaris/safari-ui';

function slugKey(value) {
  return String(value || '')
    .toLowerCase()
    .trim();
}

export function findTour(slug) {
  const key = slugKey(slug);
  if (!key) return null;
  return (
    safariPackages.find((item) => slugKey(item.slug) === key) ||
    featuredTours.find((item) => slugKey(item.slug) === key) ||
    gmsTrips.find((item) => slugKey(item.slug) === key) ||
    null
  );
}

export function findLodge(id) {
  const key = slugKey(id);
  if (!key) return null;
  return (
    lodges.find(
      (item) =>
        slugKey(item.id) === key ||
        slugKey(item.name) === key ||
        slugKey(item.name).replace(/\s+/g, '-') === key
    ) || null
  );
}

export function tourEmbedHtml(slug) {
  const tour = findTour(slug);
  return tour ? tourCard(tour) : '';
}

export function lodgeEmbedHtml(id) {
  const lodge = findLodge(id);
  if (!lodge) return '';
  return `
    <article class="tour-card flex h-full min-w-0 flex-col border border-ink/10">
      <a href="/accommodations/" class="relative block aspect-[16/9] overflow-hidden bg-mist">
        <img class="absolute inset-0 h-full w-full object-cover" src="${lodge.image}" alt="${lodge.name}" loading="lazy" decoding="async" width="800" height="450" />
      </a>
      <div class="flex flex-1 flex-col p-3.5 sm:p-4">
        <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${lodgeCategoryLabel(lodge.category)}${lodge.place ? ` · ${lodge.place}` : ''}</p>
        <h3 class="mt-1 font-display text-base font-semibold leading-snug text-black sm:text-lg">${lodge.name}</h3>
        <p class="mt-1.5 line-clamp-3 text-sm leading-snug text-ink/65">${lodge.blurb || ''}</p>
        <a href="/accommodations/" class="card-link mt-auto pt-3 font-body text-xs font-bold uppercase tracking-[0.1em] text-black">
          View stay <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>`;
}

export function featuredToursHtml(slugs = []) {
  return slugs.map((slug) => tourEmbedHtml(slug)).filter(Boolean).join('');
}

export function featuredLodgesHtml(ids = []) {
  return ids.map((id) => lodgeEmbedHtml(id)).filter(Boolean).join('');
}

export function destinationEmbedHtml(slug) {
  const place = destinationPlaces.find((item) => item.slug === slug);
  if (!place) return '';
  const href = `/destinations/${place.slug}/`;
  return `
    <a class="park-card blog-dest-card" href="${href}">
      <div class="park-card-media">
        <img src="${place.image}" alt="${place.name}" loading="lazy" decoding="async" width="800" height="520" />
      </div>
      <div class="park-card-body">
        <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${place.region || place.kicker || 'Tanzania'}</p>
        <h3 class="mt-2 font-display text-xl font-semibold text-black">${place.name}</h3>
        <p class="mt-2 text-sm leading-relaxed text-ink/70">${place.tagline || ''}</p>
        <p class="mt-4 font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">View destination</p>
      </div>
    </a>`;
}

export function featuredDestinationsHtml(slugs = []) {
  return slugs.map((slug) => destinationEmbedHtml(slug)).filter(Boolean).join('');
}

export function destinationBadgesHtml(slugs = []) {
  return slugs
    .map((slug) => destinationPlaces.find((item) => item.slug === slug))
    .filter(Boolean)
    .map(
      (place) =>
        `<a class="blog-dest-badge" href="/destinations/${place.slug}/">${place.name}</a>`
    )
    .join('');
}
