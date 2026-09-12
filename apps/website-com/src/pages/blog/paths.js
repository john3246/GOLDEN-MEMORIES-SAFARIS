/**
 * Blog URL helpers.
 */
export function pagePath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export function blogSlugFromPath() {
  const match = pagePath().match(/^\/blog\/([^/]+)$/);
  return match ? match[1] : '';
}
