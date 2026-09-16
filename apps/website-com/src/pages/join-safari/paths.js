import { slugify } from '../tours/paths.js';

export function joinSlugFromPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const match = path.match(/^\/join-safari\/([^/]+)$/);
  return match ? match[1] : '';
}

export function joinHref(item) {
  const slug = item?.slug || item?.id || slugify(item?.title || '');
  return `/join-safari/${slug}/`;
}
