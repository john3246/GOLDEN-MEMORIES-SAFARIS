/** Destination photos used when an itinerary day has no image of its own. */
export const SAFARI_DAY_IMAGES = {
  packages: '/images/gallery/serengeti-02.jpg',
  migration: '/images/gallery/serengeti-03.jpg',
  selous: '/images/gallery/ngorongoro-04.jpg',
  tarangire: '/images/gallery/ngorongoro-01.jpg',
  ngorongoro: '/images/gallery/ngorongoro-02.jpg',
  ngorongoroTourists: '/images/gallery/ngorongoro-05.jpg',
  ngorongoroAlt: '/images/gallery/ngorongoro-03.jpg',
  manyara: '/images/gallery/ngorongoro-06.jpg',
  serengeti: '/images/gallery/serengeti-01.jpg',
  eyasi: '/images/gallery/culture-01.jpg',
  zanzibar: '/images/gallery/culture-04.jpg',
  spice: '/images/gallery/culture-03.jpg',
  arusha: '/images/gallery/ngorongoro-08.jpg',
  savanna: '/images/gallery/serengeti-06.jpg',
  ruaha: '/images/gallery/ngorongoro-07.jpg',
};

const RULES = [
  [/zanzibar|nungwi|melia zanzibar|stone town|spice|beach|indian ocean/i, ['zanzibar', 'spice']],
  [/eyasi|hadzabe/i, ['eyasi']],
  [/manyara/i, ['manyara']],
  [/ngorongoro|crater/i, ['ngorongoro', 'ngorongoroTourists', 'ngorongoroAlt']],
  [/northern|mara river|crossing|migration|wildebeest/i, ['migration', 'serengeti']],
  [/serengeti/i, ['serengeti', 'savanna', 'migration']],
  [/tarangire|baobab/i, ['tarangire']],
  [/ruaha/i, ['ruaha']],
  [/selous|nyerere|rufiji/i, ['selous']],
  [/arusha|departure|arrival/i, ['arusha', 'packages']],
];

const ROTATION = [
  SAFARI_DAY_IMAGES.tarangire,
  SAFARI_DAY_IMAGES.serengeti,
  SAFARI_DAY_IMAGES.ngorongoro,
  SAFARI_DAY_IMAGES.manyara,
  SAFARI_DAY_IMAGES.migration,
  SAFARI_DAY_IMAGES.ngorongoroTourists,
  SAFARI_DAY_IMAGES.savanna,
  SAFARI_DAY_IMAGES.packages,
];

/**
 * Photo for one itinerary day. Prefers the CMS image, then the destination in the
 * day copy, then a rotating park photo so the public page can zigzag image / text.
 *
 * @param {Record<string, unknown>} item
 * @param {Record<string, unknown>} [safari]
 * @param {number} [index]
 */
function isLocalGalleryUrl(url) {
  return /^\/images\/gallery\/(serengeti-0[1-9]|ngorongoro-(0[1-9]|1[0-4])|culture-0[1-7])\.(jpe?g|png|webp)$/i.test(
    String(url || '').split('?')[0]
  );
}

export function resolveDayImage(item, safari = {}, index = 0) {
  const explicit = String(item?.image || '').trim();
  if (isLocalGalleryUrl(explicit)) return explicit.split('?')[0];

  const hay = `${item?.title || ''} ${item?.description || item?.body || ''} ${item?.day || ''} ${item?.accommodation || ''}`;
  for (const [pattern, keys] of RULES) {
    if (pattern.test(hay)) {
      return SAFARI_DAY_IMAGES[keys[index % keys.length]];
    }
  }

  const gallery = (safari.gallery || []).map((entry) => entry?.url).filter(isLocalGalleryUrl);
  if (gallery[index]) return gallery[index];
  if (gallery.length) return gallery[index % gallery.length];

  const hero = safari.hero_image?.url;
  return ROTATION[index % ROTATION.length] || (isLocalGalleryUrl(hero) ? hero : '') || SAFARI_DAY_IMAGES.packages;
}
