/**
 * Shared park matching for covers and itinerary photos.
 * The first destination named in the text wins, so a Tarangire–Serengeti
 * safari is Tarangire — not a leftover Ngorongoro shot.
 */

export const GALLERY_COUNTS = {
  serengeti: 16,
  ngorongoro: 14,
  tarangire: 17,
  kilimanjaro: 19,
  zanzibar: 23,
  culture: 7,
  arusha: 5,
  eyasi: 3,
  maps: 10,
  mikumi: 3,
  ruaha: 6,
  selous: 5,
};

export const GALLERY_FOLDERS = {
  serengeti: 'Serengeti',
  ngorongoro: 'Ngorongoro',
  tarangire: 'Tarangire',
  kilimanjaro: 'Kilimanjaro',
  zanzibar: 'Zanzibar',
  culture: 'Culture',
  arusha: 'Arusha',
  eyasi: 'Lake Eyasi',
  maps: 'Kilimanjaro maps',
  mikumi: 'Mikumi',
  ruaha: 'Ruaha',
  selous: 'Selous',
};

export function numberedGallery(prefix, count) {
  return Array.from(
    { length: count },
    (_, index) => `/images/gallery/${prefix}-${String(index + 1).padStart(2, '0')}.webp`
  );
}

export const GALLERY_POOLS = Object.fromEntries(
  Object.keys(GALLERY_FOLDERS).map((prefix) => [prefix, numberedGallery(prefix, GALLERY_COUNTS[prefix] || 0)])
);

const PARKS = [
  { kind: 'maps', re: /route map|kili(?:manjaro)? maps?|uhuru peak map/i },
  { kind: 'arusha', re: /arusha national|arusha np|arusha park/i },
  { kind: 'eyasi', re: /eyasi|hadzabe/i },
  { kind: 'kilimanjaro', re: /kilimanjaro|marangu|machame|lemosho|umbwe|rongai|uhuru|\bkili\b|\bmeru\b|momella|northern circuit/i },
  { kind: 'zanzibar', re: /zanzibar|nungwi|kendwa|paje|stone town|unguja|pemba|spice island|beach holiday/i },
  { kind: 'mikumi', re: /mikumi/i },
  { kind: 'ruaha', re: /ruaha/i },
  { kind: 'selous', re: /selous|nyerere|rufiji/i },
  { kind: 'serengeti', re: /serengeti|ndutu|wildebeest|migration|grumeti|mara river/i },
  { kind: 'tarangire', re: /tarangire|baobab/i },
  { kind: 'ngorongoro', re: /ngorongoro|crater|manyara|olmoti|empakai/i },
  { kind: 'culture', re: /materuni|maasai|usambara|natron|lengai|\bcultur|wedding|\bvillage\b/i },
];

const NAMED_PARK =
  /kilimanjaro|marangu|machame|lemosho|zanzibar|serengeti|ndutu|wildebeest|migration|tarangire|ngorongoro|crater|manyara|ruaha|selous|nyerere|mikumi|materuni|maasai|eyasi|arusha national/i;

export function haystackFrom(value) {
  if (!value) return '';
  if (typeof value === 'object') {
    return [
      value.title,
      value.name,
      value.slug,
      value.style,
      value.places,
      value.destination,
      value.body,
      value.description,
      value.blurb,
    ]
      .filter(Boolean)
      .join(' ');
  }
  return String(value);
}

export function galleryKindForText(text) {
  const t = haystackFrom(text).replace(/-/g, ' ').toLowerCase();
  let bestKind = '';
  let bestIndex = Infinity;
  for (const park of PARKS) {
    const match = t.match(park.re);
    if (match && match.index < bestIndex) {
      bestIndex = match.index;
      bestKind = park.kind;
    }
  }
  if (bestKind) return bestKind;
  if (/arusha|arrival|departure|njiro|hotel transfer/i.test(t)) return 'culture';
  return 'serengeti';
}

export function galleryKindForDay(item, safari = {}) {
  const hay = `${item?.title || ''} ${item?.description || item?.body || ''} ${item?.accommodation || ''}`;
  if (NAMED_PARK.test(hay)) return galleryKindForText(hay);
  if (/arusha|arrival|departure|njiro/i.test(hay)) return 'culture';
  return galleryKindForText(safari);
}

export function galleryKindForCover(item) {
  const titleHay = `${item?.title || ''} ${item?.slug || ''} ${item?.name || ''}`.replace(/-/g, ' ');
  if (NAMED_PARK.test(titleHay)) return galleryKindForText(titleHay);
  const days = Array.isArray(item?.itinerary) ? item.itinerary : item?.days || [];
  if (days.length) {
    const counts = {};
    for (const day of days) {
      const hay = `${day.title || ''} ${day.description || day.body || ''}`;
      if (!NAMED_PARK.test(hay)) continue;
      const kind = galleryKindForText(hay);
      counts[kind] = (counts[kind] || 0) + 1;
    }
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (ranked[0]) return ranked[0][0];
  }
  return galleryKindForText(item);
}

export function galleryKindFromUrl(url) {
  const prefix = String(url || '')
    .split('?')[0]
    .match(/\/images\/gallery\/([a-z]+)-/i)?.[1];
  return prefix && GALLERY_POOLS[prefix] ? prefix : '';
}

export function isLocalGalleryUrl(url) {
  const raw = String(url || '').split('?')[0];
  return Object.values(GALLERY_POOLS).some((pool) => pool.includes(raw));
}

export function hashSeed(value) {
  return [...String(value || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function photoFromPool(kind, seed = 0, index = 0) {
  const pool = (GALLERY_POOLS[kind] || []).length ? GALLERY_POOLS[kind] : GALLERY_POOLS.serengeti;
  if (!pool.length) return '/images/gallery/serengeti-01.webp';
  return pool[Math.abs(Number(seed) + Number(index) || 0) % pool.length];
}
