/** Destination photos used when an itinerary day has no image of its own. */
export const SAFARI_DAY_IMAGES = {
  packages: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/7-Best-Tanzania-Safari-Packages.webp',
  migration: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/wildebeest-migration-4.jpg',
  selous: 'https://www.gmsafaris.com/wp-content/uploads/2026/06/Crocodiles_in_the_Selous_Game_Reserve_530504.webp',
  tarangire: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/trangire-5.jpg',
  ngorongoro: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/Ngorongoro-Crater-5.jpg',
  ngorongoroTourists: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/ngorongoro-wide-with-tourists.webp',
  ngorongoroAlt: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/Ngorongoro-Crater-3.jpg',
  manyara: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/Lake-Manyara-National-Park-1.jpg',
  serengeti: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/serengeti-safaris-tanzania-wildlife-adventures.jpg',
  eyasi: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/lake-eyasi-tanzania-2.jpg',
  zanzibar: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/zanzibar-beach1.jpg',
  spice: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/buy-spice-scaled-1.jpg',
  arusha: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/shutterstock_285983723.webp',
  savanna: 'https://www.gmsafaris.com/wp-content/uploads/2026/06/tz.webp',
  ruaha: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/Ruaha-national-park-BW60CD.jpg',
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
export function resolveDayImage(item, safari = {}, index = 0) {
  const explicit = String(item?.image || '').trim();
  if (explicit) return explicit;

  const hay = `${item?.title || ''} ${item?.description || item?.body || ''} ${item?.day || ''} ${item?.accommodation || ''}`;
  for (const [pattern, keys] of RULES) {
    if (pattern.test(hay)) {
      return SAFARI_DAY_IMAGES[keys[index % keys.length]];
    }
  }

  const gallery = (safari.gallery || []).map((entry) => entry?.url).filter(Boolean);
  if (gallery[index]) return gallery[index];
  if (gallery.length) return gallery[index % gallery.length];

  return ROTATION[index % ROTATION.length] || safari.hero_image?.url || SAFARI_DAY_IMAGES.packages;
}
