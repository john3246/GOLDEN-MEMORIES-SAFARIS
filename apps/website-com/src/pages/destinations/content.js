import { media as GM, destinations as regions } from '../home/content.js';
import { uniqueCoverFor } from '../../media/gallery.js';

export { regions };

export const destinationsHero = {
  kicker: 'Explore Tanzania',
  title: 'Tanzania Safari Destinations',
  cta: 'Plan this journey',
  image: '/images/gallery/serengeti-01.webp',
};

export const destinationsIntro = {
  title: 'Parks, mountains, lakes, and the coast — each region a different chapter',
  image: GM.ngorongoro,
  imageAlt: 'Ngorongoro Crater wildlife country in northern Tanzania',
  paragraphs: [
    'Tanzania is home to some of Africa’s most iconic landscapes: the Serengeti plains, the Ngorongoro Crater, Kilimanjaro, and the beaches of Zanzibar. Each destination offers a distinct pace, wildlife, and way of travelling.',
    'Golden Memories Safaris plans private itineraries from Arusha so parks sit in a sensible order — enough nights in the right places, without rushing the game drives or the last transfer.',
    'Browse the regions below, then tell us your dates. We will match the circuit to the season, from migration months in the north to quieter days in the south and west.',
  ],
};

export const whyTanzania = [
  {
    title: 'A safari country like no other',
    body: 'More than a quarter of Tanzania is protected. Savannah, crater floors, rainforest, and alpine desert sit within one journey if you give the itinerary enough days.',
  },
  {
    title: 'Wildlife with room to breathe',
    body: 'The Serengeti holds the Great Migration. Ngorongoro concentrates game in a volcanic caldera. Tarangire is elephant country. The south and west are quieter, and often wilder.',
  },
  {
    title: 'Culture beside the parks',
    body: 'Hadzabe and Datoga visits at Lake Eyasi, Chagga coffee at Materuni, and Stone Town on the coast sit naturally next to game-drive days when the routing is considered.',
  },
];

export const destinationRegions = [
  {
    ...regions[0],
    id: 'northern-tanzania',
    kicker: 'The classic circuit',
    summary:
      'Africa’s best-known safari country: Serengeti migration and predators, Ngorongoro’s Big Five crater, Tarangire’s dry-season elephants, Manyara as a scenic stop, plus Kilimanjaro, Meru and Eyasi off the main loop.',
    parks: [
      {
        slug: 'serengeti',
        name: 'Serengeti National Park',
        blurb: 'Four regions, two million wildebeest, and the highest predator densities in Africa — camp location must match the month.',
        image: GM.northern,
      },
      {
        slug: 'ngorongoro',
        name: 'Ngorongoro Conservation Area',
        blurb: 'The world’s largest intact caldera: Big Five including black rhino, best as two nights, crater drives only by day.',
        image: GM.ngorongoro,
      },
      {
        slug: 'tarangire',
        name: 'Tarangire National Park',
        blurb: 'Quiet northern park: ~3,000 elephants on the river June–October, baobabs, birding, and walking or night drives at some camps.',
        image: GM.tarangire,
      },
      {
        slug: 'lake-manyara',
        name: 'Lake Manyara National Park',
        blurb: 'Rift escarpment and soda lake — a scenic half-day for tree lions and flamingos, not a heavyweight game park.',
        image: GM.manyara,
      },
      {
        slug: 'arusha-national-park',
        name: 'Arusha National Park',
        blurb: 'Quiet day from town: Meru, colobus, walking and canoeing. Beautiful, few predators — not a Serengeti substitute.',
        image: GM.meru,
      },
      {
        slug: 'kilimanjaro',
        name: 'Mount Kilimanjaro',
        blurb: '5,895 m free-standing volcano. Altitude, not ropes, is the test — then add the northern parks.',
        image: GM.kilimanjaro,
      },
      {
        slug: 'lake-eyasi',
        name: 'Lake Eyasi',
        blurb: 'Rift salt lake and Hadzabe country — walking and cultural time the national parks do not allow.',
        image: GM.lakeEyasi,
      },
    ],
  },
  {
    ...regions[1],
    id: 'the-coast',
    kicker: 'Indian Ocean',
    summary:
      'Swahili islands after safari: Stone Town for a night or two, then Nungwi, Kendwa or the tidal east. Nyerere is 45 minutes by air; the north is a longer hop.',
    parks: [
      {
        slug: 'zanzibar',
        name: 'Zanzibar Archipelago',
        blurb: 'Spice-island history, north vs east beaches, reefs and Jozani — the usual last chapter after the parks.',
        image: GM.zanzibarBeach,
      },
      {
        slug: 'stone-town',
        name: 'Stone Town & spice tours',
        blurb: 'UNESCO labyrinth of sultans’ doors and markets. One or two nights, then the beach.',
        image: GM.spice,
      },
      {
        slug: 'safari-from-zanzibar',
        name: 'Safari from Zanzibar',
        blurb: 'Easiest hop is Nyerere (~45 min). Compact north option: Tarangire and Ngorongoro, then back to Unguja.',
        image: GM.ngorongoroAlt,
      },
    ],
  },
  {
    ...regions[2],
    id: 'southern-tanzania',
    kicker: 'Quieter parks',
    summary:
      'Quieter than the north, with open-sided vehicles, walking, boats and fly-camp. Ruaha for predators and baobabs; Nyerere for the Rufiji; Mikumi when you only have a day from Dar.',
    parks: [
      {
        slug: 'ruaha',
        name: 'Ruaha National Park',
        blurb: 'Largest national park: ~10% of the world’s lions, wild dog, elephant, and a dry-season river safari with almost no crowds.',
        image: GM.southern,
      },
      {
        slug: 'nyerere',
        name: 'Nyerere (Selous)',
        blurb: 'Africa’s former largest reserve: Rufiji boats, walking, fly-camp, and over half of remaining wild dog — 45 minutes from Zanzibar.',
        image: GM.selous,
      },
      {
        slug: 'mikumi',
        name: 'Mikumi National Park',
        blurb: 'Mkata floodplain on the Dar road — a pocket grassland day, not a week-long Serengeti.',
        image: GM.dayTrip,
      },
    ],
  },
  {
    ...regions[3],
    id: 'western-tanzania',
    kicker: 'Chimpanzee country',
    summary:
      'Infrequent, expensive flights and no classic game-drive loop: chimpanzee forest on Lake Tanganyika. Gombe is steep and compact; Mahale is a fly-in beach-and-chimp stay, best in July–October.',
    parks: [
      {
        slug: 'gombe',
        name: 'Gombe Stream National Park',
        blurb: 'Jane Goodall’s forest — boat from Kigoma, then walk. Tanzania’s smallest park, not a 4x4 safari.',
        image: GM.western,
      },
      {
        slug: 'mahale',
        name: 'Mahale Mountains',
        blurb: 'Finest chimp viewing in the country plus gin-clear lake days. Walks get easier August–October.',
        image: GM.savanna,
      },
    ],
  },
];

for (const region of destinationRegions) {
  for (const park of region.parks || []) {
    park.image = uniqueCoverFor(park);
  }
}
