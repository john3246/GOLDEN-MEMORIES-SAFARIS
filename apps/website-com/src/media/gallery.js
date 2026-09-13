/**
 * Local GMS gallery only — files copied from Assets 001/gms gallery.
 * Counts must match files actually present in public/images/gallery.
 */

function numbered(prefix, count) {
  return Array.from(
    { length: count },
    (_, index) => `/images/gallery/${prefix}-${String(index + 1).padStart(2, '0')}.jpg`
  );
}

export const gallery = {
  serengeti: numbered('serengeti', 9),
  ngorongoro: numbered('ngorongoro', 14),
  culture: numbered('culture', 7),
};

const ALLOWED = new Set(Object.values(gallery).flat());

export function isGalleryUrl(url) {
  return ALLOWED.has(String(url || '').split('?')[0]);
}

export function galleryPhoto(kind, index = 0) {
  const pool = gallery[kind] || gallery.serengeti;
  return pool[Math.abs(Number(index) || 0) % pool.length];
}

export function photoForText(text, index = 0) {
  const t = String(text || '').toLowerCase();
  if (/cultur|materuni|maasai|hadzabe|eyasi|usambara|village|spice|wedding/.test(t)) {
    return galleryPhoto('culture', index);
  }
  if (/ngorongoro|crater|manyara|tarangire|arusha|kilimanjaro|meru|mountain/.test(t)) {
    return galleryPhoto('ngorongoro', index);
  }
  return galleryPhoto('serengeti', index);
}

export function ensureGalleryUrl(url, hint, index = 0) {
  if (isGalleryUrl(url)) return String(url).split('?')[0];
  return photoForText(hint, index);
}

export function photoForTrip(trip, index = 0) {
  return photoForText(`${trip?.title || ''} ${trip?.slug || ''} ${trip?.style || ''} ${trip?.places || ''}`, index);
}
