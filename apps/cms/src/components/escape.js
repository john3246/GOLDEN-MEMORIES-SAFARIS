/** Escape text before putting it into innerHTML. Use for EVERY value that came from a user or the API. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only allow http(s), relative and data:image URLs in src/href attributes. */
export function safeUrl(value) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('/') || url.startsWith('#') || /^data:image\//i.test(url)) return esc(url);
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
  return esc(url);
}
