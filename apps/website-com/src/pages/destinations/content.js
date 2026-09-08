import { media as GM, destinations as regions } from '../home/content.js';

export { regions };

export const destinationsHero = {
  kicker: 'Explore Tanzania',
  title: 'Tanzania Safari Destinations',
  cta: 'Plan this journey',
  image: GM.northern,
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
      'The northern circuit is Tanzania’s signature safari: Tarangire, Manyara, Ngorongoro, and the Serengeti, with Kilimanjaro and Arusha National Park close to town.',
    parks: [
      {
        slug: 'serengeti',
        name: 'Serengeti National Park',
        blurb: 'Endless plains, big cats, and the Great Migration — the centrepiece of most first Tanzania safaris.',
        image: GM.northern,
      },
      {
        slug: 'ngorongoro',
        name: 'Ngorongoro Conservation Area',
        blurb: 'A UNESCO caldera with an extraordinary density of wildlife, including the chance of black rhino.',
        image: GM.ngorongoro,
      },
      {
        slug: 'tarangire',
        name: 'Tarangire National Park',
        blurb: 'Baobabs, the Tarangire River, and some of the largest elephant herds in the north.',
        image: GM.tarangire,
      },
      {
        slug: 'lake-manyara',
        name: 'Lake Manyara National Park',
        blurb: 'Rift Valley escarpment, groundwater forest, birdlife, and the park’s famous tree-climbing lions.',
        image: GM.manyara,
      },
      {
        slug: 'arusha-national-park',
        name: 'Arusha National Park',
        blurb: 'Mount Meru, colobus monkeys, and walking or canoeing days close to the safari gateway.',
        image: GM.meru,
      },
      {
        slug: 'kilimanjaro',
        name: 'Mount Kilimanjaro',
        blurb: 'Africa’s highest peak — trek it before or after the safari, with rest days built into the plan.',
        image: GM.kilimanjaro,
      },
      {
        slug: 'lake-eyasi',
        name: 'Lake Eyasi',
        blurb: 'A seasonal salt lake and a considered cultural day with Hadzabe and Datoga communities.',
        image: GM.lakeEyasi,
      },
    ],
  },
  {
    ...regions[1],
    id: 'the-coast',
    kicker: 'Indian Ocean',
    summary:
      'Zanzibar is the natural last chapter after the dust of the parks: Stone Town, spice farms, and beach days on Unguja.',
    parks: [
      {
        slug: 'zanzibar',
        name: 'Zanzibar Archipelago',
        blurb: 'Turquoise water, historic Stone Town, and spice tours after the northern or southern circuit.',
        image: GM.zanzibarBeach,
      },
      {
        slug: 'stone-town',
        name: 'Stone Town & spice tours',
        blurb: 'Carved doors, waterfront lanes, and a farm visit that explains why the islands were once the spice trade’s heart.',
        image: GM.spice,
      },
      {
        slug: 'safari-from-zanzibar',
        name: 'Safari from Zanzibar',
        blurb: 'Fly in for Tarangire and Ngorongoro when time is short, then return to the coast.',
        image: GM.ngorongoroAlt,
      },
    ],
  },
  {
    ...regions[2],
    id: 'southern-tanzania',
    kicker: 'Quieter parks',
    summary:
      'Ruaha, Nyerere (Selous), and Mikumi reward travellers who want space, walking potential, and fewer vehicles on the road.',
    parks: [
      {
        slug: 'ruaha',
        name: 'Ruaha National Park',
        blurb: 'Tanzania’s largest national park: baobab ridges, the Great Ruaha River, and outstanding predator country.',
        image: GM.southern,
      },
      {
        slug: 'nyerere',
        name: 'Nyerere (Selous)',
        blurb: 'Boat safari on the Rufiji, fly-camp energy, and a wilder southern circuit than the north.',
        image: GM.selous,
      },
      {
        slug: 'mikumi',
        name: 'Mikumi National Park',
        blurb: 'Open grassland and a practical fly-in day trip from the coast or Dar es Salaam.',
        image: GM.dayTrip,
      },
    ],
  },
  {
    ...regions[3],
    id: 'western-tanzania',
    kicker: 'Chimpanzee country',
    summary:
      'The far west is for longer journeys: chimpanzee tracking on the shores of Lake Tanganyika, with forest and boat days rather than classic game drives.',
    parks: [
      {
        slug: 'gombe',
        name: 'Gombe Stream National Park',
        blurb: 'Jane Goodall’s forest on Lake Tanganyika — compact, steep, and devoted to chimpanzee trekking.',
        image: GM.western,
      },
      {
        slug: 'mahale',
        name: 'Mahale Mountains',
        blurb: 'Remoter chimp habitat, lake beaches, and a fly-in stay that pairs with a longer Tanzania itinerary.',
        image: GM.savanna,
      },
    ],
  },
];
