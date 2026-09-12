import { SafariStatus } from '@gm-safaris/shared-types';
import { emptySafariDocument, SAFARI_DAY_IMAGES } from '@gm-safaris/safari-ui';
import { config } from '../../config/index.js';
import { updateStore } from '../../cms-store/index.js';
import { safarisRepository } from './safaris.repository.js';
import { PDF_PACKAGES } from './pdf-packages.js';

const IMG = SAFARI_DAY_IMAGES;

function hero(url, alt) {
  return { id: null, url, alt, caption: '' };
}

function days(rows) {
  return rows.map(([day, title, description, extra], index) => ({
    id: `day_${index + 1}`,
    day,
    title,
    description,
    activities: [],
    accommodation: extra?.accommodation || '',
    meals: extra?.meals || '',
    transport: '',
    distance: '',
    viewing: '',
    image: extra?.image || '',
  }));
}

const PACKAGES = [
  {
    slug: '6-days-best-tanzania-adventure-safari',
    title: '6 Days Best Tanzania Adventure Safari',
    duration: 6,
    duration_label: '6 Days / 5 Nights',
    destination: 'Arusha · Ngorongoro · Serengeti · Tarangire',
    difficulty: 'Game Drive',
    featured: true,
    display_order: 1,
    hero_image: hero(IMG.packages, 'Tanzania safari vehicle on the savanna'),
    description:
      'A six-day northern-circuit safari from Arusha: Tarangire’s elephants, two nights in the Serengeti, and a full crater day at Ngorongoro before you return to town.',
    highlights: ['Tarangire elephant herds', 'Serengeti game drives', 'Ngorongoro Crater floor', 'Private vehicle from Arusha'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire National Park', 'Meet your guide in Arusha and drive to Tarangire for an afternoon game drive among baobabs.'],
      ['Day 2', 'Tarangire to Serengeti National Park', 'Morning in Tarangire, then continue west into the Serengeti.'],
      ['Day 3', 'Serengeti National Park', 'Dawn and afternoon drives on the plains.'],
      ['Day 4', 'Serengeti to Ngorongoro Conservation Area', 'A last Serengeti morning, then overnight on the crater rim.'],
      ['Day 5', 'Ngorongoro Crater Tour', 'Descend to the crater floor for a full-day game drive and picnic lunch.'],
      ['Day 6', 'Return to Arusha', 'Breakfast, then drive back to Arusha for your hotel or onward flight.'],
    ]),
  },
  {
    slug: '10-days-river-crossing-great-wildebeest-migration-safari',
    title: '10 Days River Crossing & Great Wildebeest Migration Safari',
    duration: 10,
    duration_label: '10 Days / 9 Nights',
    destination: 'Serengeti · Ngorongoro · Tarangire',
    difficulty: 'Wildlife Safari',
    display_order: 2,
    hero_image: hero(IMG.migration, 'Wildebeest migration in the Serengeti'),
    description: 'A longer northern itinerary with extra Serengeti nights timed for river crossings or calving, plus Tarangire and Ngorongoro.',
    highlights: ['Extended Serengeti stay', 'Seasonal river crossings or calving', 'Ngorongoro Crater', 'Tarangire elephants'],
    itinerary: days([
      ['Day 1', 'Arrive Arusha', 'Meet at Kilimanjaro Airport or your Arusha hotel.'],
      ['Day 2', 'Arusha to Tarangire', 'Afternoon game drive among baobabs and along the river.'],
      ['Day 3', 'Tarangire to Serengeti', 'Continue into the Serengeti toward the herds for the season you travel.'],
      ['Day 4', 'Serengeti game drives', 'Full day in the sector that holds the migration.'],
      ['Day 5', 'Serengeti game drives', 'Second full day on the plains.'],
      ['Day 6', 'Serengeti game drives', 'A third Serengeti day to stay with the wildlife.'],
      ['Day 7', 'Serengeti to Ngorongoro', 'Transfer to the crater highlands.'],
      ['Day 8', 'Ngorongoro Crater', 'Full day on the crater floor.'],
      ['Day 9', 'Highlands and return', 'Begin the journey toward Arusha.'],
      ['Day 10', 'Arusha departure', 'Breakfast and transfer to the airport or the coast.'],
    ]),
  },
  {
    slug: '8-days-best-safari-to-ruaha-and-selous',
    title: '8 Days Best Safari To Ruaha And Selous',
    duration: 8,
    duration_label: '8 Days / 7 Nights',
    destination: 'Ruaha · Selous / Nyerere',
    difficulty: 'Wildlife Safari',
    display_order: 3,
    hero_image: hero(IMG.selous, 'Nyerere National Park landscape'),
    description: 'Eight days in the south: Ruaha’s riverine landscapes and Nyerere (Selous) with a boat safari on the Rufiji.',
    highlights: ['Ruaha predator country', 'Rufiji boat safari', 'Fly-in or drive options', 'Fewer vehicles on the road'],
    itinerary: days([
      ['Day 1', 'To Ruaha', 'Fly or drive to Ruaha National Park. Afternoon game drive.'],
      ['Day 2', 'Ruaha', 'Full day in the park.'],
      ['Day 3', 'Ruaha', 'Second full day — walking or a longer circuit if season allows.'],
      ['Day 4', 'Ruaha to Nyerere', 'Transfer to Nyerere National Park (Selous).'],
      ['Day 5', 'Nyerere game drive', 'Morning and afternoon drives among lakes and woodland.'],
      ['Day 6', 'Rufiji boat safari', 'Boat on the Rufiji for hippo, crocodile, and kingfishers.'],
      ['Day 7', 'Nyerere', 'A last full day in camp.'],
      ['Day 8', 'Departure', 'Return flight to Dar es Salaam, Zanzibar, or Arusha.'],
    ]),
  },
  {
    slug: '5-days-budget-tanzania-lodge-safari',
    title: '5 Days Budget Tanzania Lodge Safari',
    duration: 5,
    duration_label: '5 Days / 4 Nights',
    destination: 'Ngorongoro · Tarangire · Arusha',
    difficulty: 'Lodge Safari',
    display_order: 4,
    hero_image: hero(IMG.tarangire, 'Elephants in Tarangire'),
    description: 'A lodge safari for travellers who want the northern highlights without extra Serengeti nights.',
    highlights: ['Lodge nights', 'Tarangire and Ngorongoro', 'Private guide', 'Sensible pacing from Arusha'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire', 'Afternoon game drive and lodge overnight.'],
      ['Day 2', 'Tarangire', 'Full day among elephants and baobabs.'],
      ['Day 3', 'To Ngorongoro', 'Transfer to the crater highlands.'],
      ['Day 4', 'Ngorongoro Crater', 'Crater-floor game drive and picnic lunch.'],
      ['Day 5', 'Return to Arusha', 'Drive back to Arusha.'],
    ]),
  },
  {
    slug: 'ngorongoro-northern-circuit-safari',
    title: 'Ngorongoro & Northern Circuit Safari',
    duration: 7,
    duration_label: '7 Days / 6 Nights',
    destination: 'Tarangire · Serengeti · Ngorongoro',
    difficulty: 'Game Drive',
    display_order: 5,
    hero_image: hero(IMG.ngorongoro, 'Ngorongoro Crater'),
    description: 'Seven days on the classic northern circuit with enough nights to game-drive rather than only transit.',
    highlights: ['Classic northern routing', 'Serengeti nights', 'Crater day', 'Tarangire start'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire', 'Afternoon game drive in Tarangire.'],
      ['Day 2', 'Tarangire to Serengeti', 'Game drive as you travel west.'],
      ['Day 3', 'Serengeti', 'Full day on the plains.'],
      ['Day 4', 'Serengeti', 'Second Serengeti day.'],
      ['Day 5', 'Serengeti to Ngorongoro', 'Transfer to the crater rim.'],
      ['Day 6', 'Ngorongoro Crater', 'Full day on the crater floor.'],
      ['Day 7', 'Return to Arusha', 'Drive to Arusha.'],
    ]),
  },
  {
    slug: 'tarangire-elephant-safari',
    title: 'Tarangire Elephant Safari',
    duration: 4,
    duration_label: '4 Days / 3 Nights',
    destination: 'Tarangire · Lake Manyara',
    difficulty: 'Game Drive',
    display_order: 6,
    hero_image: hero(IMG.manyara, 'Lake Manyara forest'),
    description: 'A short safari focused on Tarangire’s elephants and a Lake Manyara day under the Rift escarpment.',
    highlights: ['Tarangire elephants', 'Baobab landscapes', 'Lake Manyara forest', 'Short drive from Arusha'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire', 'Afternoon game drive and overnight near the park.'],
      ['Day 2', 'Tarangire', 'Full day along the river and in the woodlands.'],
      ['Day 3', 'Lake Manyara', 'Forest, floodplain, and birdlife.'],
      ['Day 4', 'Return to Arusha', 'Morning in Manyara or a direct return to Arusha.'],
    ]),
  },
  {
    slug: 'serengeti-wildlife-safari',
    title: 'Serengeti Wildlife Safari',
    duration: 6,
    duration_label: '6 Days / 5 Nights',
    destination: 'Serengeti · Ngorongoro',
    difficulty: 'Wildlife Safari',
    display_order: 7,
    hero_image: hero(IMG.serengeti, 'Serengeti plains'),
    description: 'Six days shaped around the Serengeti, with Ngorongoro on the way home.',
    highlights: ['Serengeti focus', 'Big-cat country', 'Ngorongoro finale', 'Private 4x4'],
    itinerary: days([
      ['Day 1', 'Arusha to Serengeti', 'Drive or fly into the Serengeti; afternoon game drive from camp.'],
      ['Day 2', 'Serengeti', 'Full day game drives.'],
      ['Day 3', 'Serengeti', 'Second full day — kopjes, river lines, and resident game.'],
      ['Day 4', 'Serengeti', 'A third plains day.'],
      ['Day 5', 'Ngorongoro Crater', 'Crater-floor game drive and rim overnight.'],
      ['Day 6', 'Return to Arusha', 'Breakfast and transfer to Arusha.'],
    ]),
  },
  {
    slug: 'classic-tanzania-lodge-safari',
    title: 'Classic Tanzania Lodge Safari',
    duration: 5,
    duration_label: '5 Days / 4 Nights',
    destination: 'Lake Manyara · Ngorongoro · Tarangire',
    difficulty: 'Lodge Safari',
    display_order: 8,
    hero_image: hero(IMG.ngorongoroAlt, 'Guests overlooking Ngorongoro'),
    description: 'Five lodge nights on the northern circuit: Manyara, Ngorongoro, and Tarangire.',
    highlights: ['Lodge safari', 'Three northern parks', 'Crater day', 'Arusha start and finish'],
    itinerary: days([
      ['Day 1', 'Arusha to Lake Manyara', 'Afternoon game drive under the escarpment.'],
      ['Day 2', 'Manyara to Ngorongoro', 'Transfer to the crater highlands.'],
      ['Day 3', 'Ngorongoro Crater', 'Full day on the crater floor.'],
      ['Day 4', 'Tarangire', 'Elephants and baobabs.'],
      ['Day 5', 'Return to Arusha', 'Morning drive, then back to Arusha.'],
    ]),
  },
];

const SHARED_IN = [
  'Park fees and conservation levies as per the itinerary',
  'Private 4x4 safari vehicle with pop-up roof and driver-guide',
  'Lodge or camp nights on a full-board basis unless noted',
  'Airport or hotel transfers in Arusha on safari days',
  'Bottled water on game drives',
];

const SHARED_OUT = [
  'International flights and visa fees',
  'Tips for guides, cooks, and camp staff',
  'Travel insurance and personal expenses',
  'Optional balloon safari or cultural visits not listed',
];

function toDraft(item) {
  const description = item.description || '';
  return {
    ...emptySafariDocument(),
    ...item,
    short_description: item.short_description || description,
    inclusions: item.inclusions || SHARED_IN,
    exclusions: item.exclusions || SHARED_OUT,
    accommodation: item.accommodation || 'Lodge or camp as confirmed with your consultant.',
    transport_information: item.transport_information || 'Private 4x4 safari vehicle with pop-up roof.',
    currency: item.currency || 'USD',
    seo: {
      title: `${item.title} | Golden Memories Safaris`,
      description: description.slice(0, 320),
      og_title: item.title,
      og_description: description.slice(0, 320),
      og_image: item.hero_image?.url,
      robots: 'index,follow',
      ...item.seo,
      canonical: item.seo?.canonical || `${config.sites.com}/tours/${item.slug}/`,
      og_image: item.seo?.og_image || item.hero_image?.url,
    },
  };
}

export async function seedSafariPackages() {
  if (process.env.CMS_SEED_SAFARIS === 'false') return;
  if (!config.cms.seedSafaris && process.env.CMS_SEED_SAFARIS !== 'true') return;

  const catalog = [...PDF_PACKAGES, ...PACKAGES];
  for (const item of catalog) {
    let record = await safarisRepository.findBySlug(item.slug, { includeUnpublished: true });
    if (!record) {
      record = await safarisRepository.create({ draft: toDraft(item), actor: { userId: 'seed' } });
    }
    if (record.status === SafariStatus.PUBLISHED && record.published) continue;
    if (record.created_by !== 'seed') continue;
    record.status = SafariStatus.PUBLISHED;
    record.published = { ...record.draft };
    record.published_at = record.published_at || new Date().toISOString();
    await safarisRepository.save(record);
  }

  await updateStore((s) => {
    s.meta.seededSafaris = true;
  });
}
