/**
 * Stable URL for a safari / trek / day-trip package.
 * @param {{ slug?: string, title: string }} tour
 */
export function tourHref(tour) {
  const slug = tour.slug || slugify(tour.title);
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
