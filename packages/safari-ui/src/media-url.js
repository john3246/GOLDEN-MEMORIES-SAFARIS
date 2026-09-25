/**
 * CMS-picked media must render on the public site as-is.
 * Uploads are stored as /api/v1/media/{id}/file so the website proxy (and
 * same-origin production API) can serve them. Absolute localhost URLs are
 * rewritten so remote clients are not pointed at the editor's machine.
 */

export function isUsableMediaUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return false;
  if (raw.startsWith('/images/') || raw.startsWith('/api/v1/media/') || raw.startsWith('/uploads/')) return true;
  if (raw.startsWith('data:image/') || raw.startsWith('blob:')) return true;
  return /^https?:\/\//i.test(raw);
}

export function publicMediaUrl(url) {
  const raw = String(url || '').trim();
  if (!isUsableMediaUrl(raw)) return '';
  const stripped = raw.split('#')[0];
  const media = stripped.match(/\/api\/v1\/media\/[^/?#]+\/file/i);
  if (media) return media[0].startsWith('/') ? media[0] : `/${media[0]}`;
  try {
    if (/^https?:\/\//i.test(stripped)) {
      const parsed = new URL(stripped);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${parsed.pathname}${parsed.search || ''}`;
      }
    }
  } catch {
    return stripped;
  }
  return stripped;
}

export function pickedMediaUrl(item) {
  if (item == null) return '';
  if (typeof item === 'string') return publicMediaUrl(item);
  const raw =
    (item.hero_image && typeof item.hero_image === 'object' && item.hero_image.url) ||
    (typeof item.hero_image === 'string' && item.hero_image) ||
    (typeof item.image === 'string' && item.image) ||
    (item.image && typeof item.image === 'object' && item.image.url) ||
    item.cover ||
    '';
  return publicMediaUrl(raw);
}
