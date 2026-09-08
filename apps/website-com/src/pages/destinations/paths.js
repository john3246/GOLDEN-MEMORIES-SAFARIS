/**
 * Destination URLs — /destinations/:slug/ matches the tours folder pattern.
 */
export function destinationHref(destination) {
  const slug = destination.slug || destination.id;
  return `/destinations/${slug}/`;
}

export function destinationSlugFromPath() {
  const path = (window.location.pathname.replace(/\/+$/, '') || '/');
  const match = path.match(/^\/destinations\/([^/]+)$/);
  return match ? match[1] : '';
}
