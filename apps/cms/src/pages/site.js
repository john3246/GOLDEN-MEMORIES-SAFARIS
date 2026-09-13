export function publicOrigin() {
  if (import.meta.env.VITE_PUBLIC_SITE_URL) return import.meta.env.VITE_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:4175';
  return window.location.origin;
}

export function apiOrigin() {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  return import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;
}

export function siteHref(path = '/') {
  return new URL(path, `${publicOrigin()}/`).href;
}
