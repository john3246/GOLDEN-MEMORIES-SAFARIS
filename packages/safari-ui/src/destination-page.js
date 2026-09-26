import { escapeAttr, escapeHtml } from './escape.js';
import { MONTH_SHORT } from './destination-model.js';

export function destinationMapSrc(lat, lng, _zoom = 8) {
  const y = Number(lat);
  const x = Number(lng);
  if (!Number.isFinite(y) || !Number.isFinite(x)) return '';
  const d = 1.2;
  const bbox = `${x - d},${y - d},${x + d},${y + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${y},${x}`)}`;
}

export function destinationCanonical(place) {
  return place?.canonical_url || `https://www.gmsafaris.com/destinations/${place?.slug || ''}/`;
}

export function destinationJsonLd(place) {
  const image = place?.og_image || place?.image || '';
  const abs = image.startsWith('http') ? image : image ? `https://www.gmsafaris.com${image}` : '';
  const lat = Number(place?.lat ?? place?.coordinates?.lat);
  const lng = Number(place?.lng ?? place?.coordinates?.lng);
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place?.name || place?.title,
    description: place?.seo_description || place?.tagline || place?.blurb || '',
    image: abs ? [abs] : undefined,
    url: destinationCanonical(place),
    address: {
      '@type': 'PostalAddress',
      addressLocality: place?.location || place?.region || '',
      addressCountry: place?.country || 'Tanzania',
    },
    geo:
      Number.isFinite(lat) && Number.isFinite(lng)
        ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }
        : undefined,
    touristType: 'Safari',
    isAccessibleForFree: false,
  };
}

export function renderMonthGuide(months = []) {
  const rows = months.length ? months : MONTH_SHORT.map((label) => ({ label, active: false }));
  return `
    <ol class="dest-month-guide" aria-label="Best months to visit">
      ${rows
        .map(
          (month) =>
            `<li class="${month.active ? 'is-on' : ''}" title="${escapeAttr(month.title || month.label)}"><span>${escapeHtml(month.label)}</span></li>`
        )
        .join('')}
    </ol>`;
}
