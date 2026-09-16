/**
 * Stable URL for a safari / trek / day-trip package.
 * @param {{ slug?: string, title: string }} tour
 */
export function tourHref(tour) {
  const slug = tour.slug || slugify(tour.title);
  if (tour?.activity === 'Group Safari' || /joining/.test(String(slug))) {
    return `/join-safari/${slug}/`;
  }
  return `/tours/${slug}/`;
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pagePath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export function tourSlugFromPath() {
  const path = pagePath();
  const match = path.match(/^\/tours\/([^/]+)$/);
  return match ? match[1] : '';
}

export function bookingHref(tour) {
  if (!tour) return '/booking/';
  const slug = typeof tour === 'string' ? tour : tour.slug || tour.id || '';
  return slug ? `/booking/?safari=${encodeURIComponent(slug)}` : '/booking/';
}

export function safariSlugFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('safari') || params.get('tour') || params.get('package') || '';
}
