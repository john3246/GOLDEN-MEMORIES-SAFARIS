/**
 * Local GMS gallery only — files copied from Assets 001/gms gallery.
 * Counts must match files actually present in public/images/gallery.
 */

import {
  GALLERY_POOLS,
  galleryKindForText as kindFromText,
  galleryKindForCover,
  isLocalGalleryUrl,
} from '@gm-safaris/safari-ui';

export const gallery = GALLERY_POOLS;
export { isLocalGalleryUrl as isGalleryUrl };

const ALLOWED = new Set(Object.values(gallery).flat());

function toWebp(url) {
  return String(url || '')
    .split('?')[0]
    .replace(/\/images\/gallery\/([^/]+)\.(jpe?g|png)$/i, '/images/gallery/$1.webp');
}

export function galleryPhoto(kind, index = 0) {
  const pool = gallery[kind] || gallery.serengeti;
  return pool[Math.abs(Number(index) || 0) % pool.length];
}

export function galleryKindForText(text) {
  return kindFromText(text);
}

export { galleryKindForCover };

const RELATED_KINDS = {
  serengeti: ['serengeti', 'ngorongoro', 'tarangire'],
  ngorongoro: ['ngorongoro', 'tarangire', 'serengeti'],
  tarangire: ['tarangire', 'ngorongoro', 'serengeti'],
  kilimanjaro: ['kilimanjaro', 'culture'],
  zanzibar: ['zanzibar', 'culture'],
  culture: ['culture', 'kilimanjaro', 'tarangire'],
};

const COVER_ALIASES = {
  '5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro':
    '5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro-crater-exclusive-retreat',
  '4-day-affordable-private-tanzania-safari':
    '4-day-affordable-private-tanzania-safari-tarangire-serengeti-ngorongoro-crater-adventure',
  '14-day-tanzania-safari-zanzibar-escape': '14-day-tanzania-luxury-safari-zanzibar-escape',
};

const coverByKey = new Map();
const usedCovers = new Set();

function coverKey(item) {
  const slug = String(item?.slug || item?.id || '').trim();
  if (slug) return COVER_ALIASES[slug] || slug;
  return String(item?.title || item?.name || '').trim();
}

function takeUnused(kinds) {
  for (const kind of kinds) {
    for (const url of gallery[kind] || []) {
      if (!usedCovers.has(url)) return url;
    }
  }
  return null;
}

/**
 * One cover photo per safari/destination slug. Matching park first; never reused
 * as another cover. Related northern parks only if that park’s photos are gone.
 */
export function uniqueCoverFor(item) {
  const key = coverKey(item);
  if (!key) return galleryPhoto(galleryKindForText(item), 0);
  if (coverByKey.has(key)) return coverByKey.get(key);
  const kind = galleryKindForCover(item);
  const chosen =
    takeUnused([kind]) ||
    takeUnused(RELATED_KINDS[kind] || [kind]) ||
    takeUnused(Object.keys(gallery)) ||
    galleryPhoto(kind, coverByKey.size);
  usedCovers.add(chosen);
  coverByKey.set(key, chosen);
  return chosen;
}

export function assignUniqueCovers(items) {
  for (const item of items || []) {
    if (!item) continue;
    item.image = uniqueCoverFor(item);
  }
  return items;
}

export function isCoverTaken(url) {
  return usedCovers.has(String(url || '').split('?')[0]);
}

export function photoForText(text, index = 0) {
  if (text && typeof text === 'object') {
    return uniqueCoverFor(text);
  }
  return galleryPhoto(galleryKindForText(text), index);
}

export function ensureGalleryUrl(url, hint, index = 0) {
  if (hint && typeof hint === 'object' && (hint.slug || hint.title || hint.name)) {
    return uniqueCoverFor(hint);
  }
  const webp = toWebp(url);
  if (ALLOWED.has(webp)) {
    const expected = galleryKindForText(hint);
    const prefix = webp.match(/\/images\/gallery\/([a-z]+)-/)?.[1];
    if (!hint || !expected || prefix === expected) return webp;
    return photoForText(hint, index);
  }
  if (isLocalGalleryUrl(url)) return String(url).split('?')[0];
  return photoForText(hint, index);
}

export function cardUrl(url, hint, index = 0) {
  const full =
    hint && typeof hint === 'object' && (hint.slug || hint.title || hint.name)
      ? uniqueCoverFor(hint)
      : ensureGalleryUrl(url, hint, index);
  if (full.endsWith('-card.webp')) return full;
  return full.replace(/\.webp$/i, '-card.webp');
}

export function photoForTrip(trip, index = 0) {
  if (trip && typeof trip === 'object') return uniqueCoverFor(trip);
  return photoForText(`${trip?.title || ''} ${trip?.slug || ''} ${trip?.style || ''} ${trip?.places || ''}`, index);
}

/**
 * Next unused gallery photo for a place/name on this page (itinerary days).
 * Stays in the matching park; does not steal another safari’s cover pool.
 */
export function uniquePhoto(hint, used = new Set(), preferredIndex = 0) {
  const kind = galleryKindForText(hint);
  const pool = gallery[kind] || gallery.serengeti;
  const start = Math.abs(Number(preferredIndex) || 0);
  for (let i = 0; i < pool.length; i += 1) {
    const url = pool[(start + i) % pool.length];
    if (!used.has(url)) {
      used.add(url);
      return url;
    }
  }
  for (const other of Object.values(gallery)) {
    for (const url of other) {
      if (!used.has(url)) {
        used.add(url);
        return url;
      }
    }
  }
  return pool[start % pool.length];
}

export function withoutCover(urls, cover) {
  return (urls || []).filter((url) => url && url !== cover);
}
