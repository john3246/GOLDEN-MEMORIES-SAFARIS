import {
  GALLERY_POOLS,
  galleryKindForDay,
  hashSeed,
  isLocalGalleryUrl,
  photoFromPool,
} from './gallery-kind.js';
import { publicMediaUrl } from './media-url.js';

/** First photo of each park — used by CMS seeds and PDF packages. */
export const SAFARI_DAY_IMAGES = {
  packages: GALLERY_POOLS.serengeti[1],
  migration: GALLERY_POOLS.serengeti[2],
  selous: GALLERY_POOLS.tarangire[10],
  tarangire: GALLERY_POOLS.tarangire[0],
  ngorongoro: GALLERY_POOLS.ngorongoro[0],
  ngorongoroTourists: GALLERY_POOLS.ngorongoro[4],
  ngorongoroAlt: GALLERY_POOLS.ngorongoro[2],
  manyara: GALLERY_POOLS.ngorongoro[5],
  serengeti: GALLERY_POOLS.serengeti[0],
  eyasi: GALLERY_POOLS.culture[0],
  zanzibar: GALLERY_POOLS.zanzibar[0],
  spice: GALLERY_POOLS.zanzibar[1],
  arusha: GALLERY_POOLS.culture[2],
  savanna: GALLERY_POOLS.serengeti[5],
  ruaha: GALLERY_POOLS.tarangire[12],
  kilimanjaro: GALLERY_POOLS.kilimanjaro[0],
};

/**
 * Photo for one itinerary day. Uses the park named that day, offset by safari
 * slug so two different safaris do not share the same day sequence.
 *
 * @param {Record<string, unknown>} item
 * @param {Record<string, unknown>} [safari]
 * @param {number} [index]
 */
export function resolveDayImage(item, safari = {}, index = 0) {
  const picked = publicMediaUrl(typeof item?.image === 'string' ? item.image : item?.image?.url);
  if (picked) return picked;
  const kind = galleryKindForDay(item, safari);
  const seed = hashSeed(safari.slug || safari.id || safari.title || '');
  return photoFromPool(kind, seed, index);
}

export { isLocalGalleryUrl };
