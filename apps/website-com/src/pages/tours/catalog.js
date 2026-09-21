import { uniqueCoverFor } from '../../media/gallery.js';
import { PDF_PACKAGES, toWebsiteTrip } from '../../../../api/src/modules/safaris/pdf-packages.js';
import { dayTrips, kilimanjaro, zanzibar } from '../home/content.js';
import { openJoiningPackages } from '../join-safari/packages.js';
import { safariPackages } from './content.js';
import { gmsTrips } from './gms-trips.js';
import { slugify } from './paths.js';

const sharedIncluded = [
  'Park fees and conservation levies as per the itinerary',
  'Private 4x4 safari vehicle with pop-up roof and driver-guide',
  'Lodge or camp nights on a full-board basis unless noted',
  'Airport or hotel transfers in Arusha on safari days',
  'Bottled water on game drives',
];

const sharedExcluded = [
  'International flights and visa fees',
  'Tips for guides, cooks, and camp staff',
  'Travel insurance and personal expenses',
  'Optional balloon safari or cultural visits not listed',
];

const climbIncluded = [
  'Park fees, hut or camp fees, and rescue fees as applicable',
  'Professional mountain guide, assistant guides, cook, and porters',
  'Mountain tents or huts as per the route',
  'Meals on the mountain',
  'Transfers from Arusha or Moshi as agreed',
];

const climbExcluded = [
  'International flights and visa fees',
  'Tips for the mountain crew',
  'Personal trekking gear (available to hire)',
  'Travel insurance including high-altitude cover',
];

function days(items) {
  return items.map(([day, title, body, extra = {}]) => ({ day, title, body, ...extra }));
}

const pdfExtras = Object.fromEntries(
  PDF_PACKAGES.map((pkg) => {
    const trip = toWebsiteTrip(pkg);
    return [
      pkg.slug,
      {
        overview: trip.overview,
        highlights: trip.highlights,
        itinerary: trip.itinerary,
        included: trip.included,
        excluded: trip.excluded,
      },
    ];
  })
);

const extras = {
  ...pdfExtras,
  '6-days-best-tanzania-adventure-safari': {
    overview:
      'A six-day northern-circuit safari from Arusha: Tarangire’s elephants, two nights in the Serengeti, and a full crater day at Ngorongoro before you return to town.',
    highlights: ['Tarangire elephant herds', 'Serengeti game drives', 'Ngorongoro Crater floor', 'Private vehicle from Arusha'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire National Park', 'Meet your guide in Arusha and drive to Tarangire National Park. Afternoon game drive along the river and among the baobabs, then overnight at a lodge or camp near the park.', { distance: '120 km', viewing: '6–7 hours', stay: 'Lodge or camp near Tarangire' }],
      ['Day 2', 'Tarangire National Park to Serengeti National Park', 'Morning in Tarangire, then continue west across the highlands into Serengeti National Park with a game drive as you enter. Overnight in the Serengeti.', { distance: '240 km', viewing: '6–7 hours', stay: 'Serengeti lodge or camp' }],
      ['Day 3', 'Serengeti National Park', 'Dawn and afternoon drives on the plains. In season this is migration and big-cat country; year-round it is open grassland, kopjes, and resident wildlife.', { viewing: '6–7 hours', stay: 'Serengeti lodge or camp' }],
      ['Day 4', 'Serengeti National Park to Ngorongoro Conservation Area', 'A last Serengeti morning, then drive to the Ngorongoro Conservation Area and overnight on the crater rim.', { distance: '145 km', viewing: '6–7 hours', stay: 'Ngorongoro rim lodge or camp' }],
      ['Day 5', 'Ngorongoro Crater Tour', 'Descend to the crater floor for a full-day game drive and picnic lunch. Return to the rim in the afternoon.', { viewing: '5–6 hours', stay: 'Ngorongoro rim lodge or camp' }],
      ['Day 6', 'Return to Arusha', 'Breakfast, then drive back to Arusha for your hotel, onward flight, or a Zanzibar connection.', { distance: '180 km', viewing: 'Morning departure', meals: 'Breakfast', stay: 'Own arrangements / onward transfer' }],
    ]),
  },
  '10-days-river-crossing-great-wildebeest-migration-safari': {
    overview:
      'A longer northern itinerary with extra Serengeti nights timed for river crossings or calving, plus Tarangire and Ngorongoro. Best when your dates match the herds.',
    highlights: ['Extended Serengeti stay', 'Seasonal river crossings or calving', 'Ngorongoro Crater', 'Tarangire elephants'],
    itinerary: days([
      ['Day 1', 'Arrive Arusha', 'Meet at Kilimanjaro Airport or your Arusha hotel. Briefing with your consultant and overnight in town.'],
      ['Day 2', 'Arusha to Tarangire', 'Drive to Tarangire for an afternoon game drive among baobabs and along the river.'],
      ['Day 3', 'Tarangire to Serengeti', 'Continue into the Serengeti, positioning the camp toward the herds for the season you travel.'],
      ['Day 4', 'Serengeti game drives', 'Full day in the sector that holds the migration — south in calving months, west or north when the rivers run.'],
      ['Day 5', 'Serengeti game drives', 'Second full day: dawn start, picnic on the plains, and time at a crossing point if the herds are moving.'],
      ['Day 6', 'Serengeti game drives', 'A third Serengeti day to stay with the wildlife rather than the road.'],
      ['Day 7', 'Serengeti to Ngorongoro', 'Morning drive, then transfer to the crater highlands for a rim overnight.'],
      ['Day 8', 'Ngorongoro Crater', 'Full day on the crater floor — lion, elephant, buffalo, and a chance of rhino.'],
      ['Day 9', 'Highlands and return', 'Optional Maasai visit or a last highland walk, then begin the journey toward Arusha.'],
      ['Day 10', 'Arusha departure', 'Breakfast and transfer to the airport or your next chapter on the coast.'],
    ]),
  },
  '8-days-best-safari-to-ruaha-and-selous': {
    overview:
      'Eight days in the south: Ruaha’s riverine landscapes and Nyerere (Selous) with a boat safari on the Rufiji. Quieter parks, wilder roads, and fewer vehicles.',
    highlights: ['Ruaha predator country', 'Rufiji boat safari', 'Fly-in or drive options', 'Fewer vehicles on the road'],
    itinerary: days([
      ['Day 1', 'To Ruaha', 'Fly or drive to Ruaha National Park. Afternoon game drive along the Great Ruaha River.'],
      ['Day 2', 'Ruaha', 'Full day in the park — baobab ridges, lion, elephant, and outstanding birdlife.'],
      ['Day 3', 'Ruaha', 'Second full day. Walking or a longer circuit if camp and season allow.'],
      ['Day 4', 'Ruaha to Nyerere', 'Transfer to Nyerere National Park (Selous) by light aircraft or road as agreed.'],
      ['Day 5', 'Nyerere game drive', 'Morning and afternoon drives in the lakes and woodland of the reserve.'],
      ['Day 6', 'Rufiji boat safari', 'Boat on the Rufiji for hippo, crocodile, and kingfishers, with a game drive at either end of the day.'],
      ['Day 7', 'Nyerere', 'A last full day in camp — walking, drives, or a second boat depending on water levels.'],
      ['Day 8', 'Departure', 'Return flight to Dar es Salaam, Zanzibar, or Arusha.'],
    ]),
  },
  '5-days-budget-tanzania-lodge-safari': {
    overview:
      'A considered lodge safari for travellers who want the northern highlights without extra Serengeti nights: Tarangire, Ngorongoro, and a return to Arusha.',
    highlights: ['Lodge nights', 'Tarangire and Ngorongoro', 'Private guide', 'Sensible pacing from Arusha'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire', 'Drive to Tarangire for an afternoon game drive and lodge overnight.'],
      ['Day 2', 'Tarangire', 'Full day in the park among elephants and baobabs.'],
      ['Day 3', 'To Ngorongoro', 'Transfer to the crater highlands and overnight on the rim.'],
      ['Day 4', 'Ngorongoro Crater', 'Descend for a crater-floor game drive and picnic lunch.'],
      ['Day 5', 'Return to Arusha', 'Drive back to Arusha for your hotel or flight.'],
    ]),
  },
  'ngorongoro-northern-circuit-safari': {
    overview:
      'Seven days on the classic northern circuit: Tarangire, the Serengeti, and Ngorongoro, with enough nights to game-drive rather than only transit.',
    highlights: ['Classic northern routing', 'Serengeti nights', 'Crater day', 'Tarangire start'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire', 'Meet in Arusha and drive to Tarangire for an afternoon game drive.'],
      ['Day 2', 'Tarangire to Serengeti', 'Game drive as you travel west into the Serengeti.'],
      ['Day 3', 'Serengeti', 'Full day on the plains.'],
      ['Day 4', 'Serengeti', 'Second Serengeti day — dawn drive and a slower afternoon.'],
      ['Day 5', 'Serengeti to Ngorongoro', 'Transfer to the crater rim.'],
      ['Day 6', 'Ngorongoro Crater', 'Full day on the crater floor.'],
      ['Day 7', 'Return to Arusha', 'Drive to Arusha for departure or a coast connection.'],
    ]),
  },
  'tarangire-elephant-safari': {
    overview:
      'A short safari focused on Tarangire’s elephants and a Lake Manyara day under the Rift escarpment — ideal when time is tight.',
    highlights: ['Tarangire elephants', 'Baobab landscapes', 'Lake Manyara forest', 'Short drive from Arusha'],
    itinerary: days([
      ['Day 1', 'Arusha to Tarangire', 'Afternoon game drive and overnight near the park.'],
      ['Day 2', 'Tarangire', 'Full day along the river and in the woodlands.'],
      ['Day 3', 'Lake Manyara', 'Drive to Manyara for forest, floodplain, and birdlife, then overnight nearby.'],
      ['Day 4', 'Return to Arusha', 'Morning in Manyara or a direct return to Arusha.'],
    ]),
  },
  'serengeti-wildlife-safari': {
    overview:
      'Six days shaped around the Serengeti, with Ngorongoro on the way home. Built for guests who want more time on the plains than on the crater floor.',
    highlights: ['Serengeti focus', 'Big-cat country', 'Ngorongoro finale', 'Private 4x4'],
    itinerary: days([
      ['Day 1', 'Arusha to Serengeti', 'Drive or fly into the Serengeti; afternoon game drive from camp.'],
      ['Day 2', 'Serengeti', 'Full day game drives.'],
      ['Day 3', 'Serengeti', 'Second full day — kopjes, river lines, and resident game.'],
      ['Day 4', 'Serengeti', 'A third plains day so the itinerary is not only a transfer.'],
      ['Day 5', 'Ngorongoro Crater', 'Leave the Serengeti for a crater-floor game drive and rim overnight.'],
      ['Day 6', 'Return to Arusha', 'Breakfast and transfer to Arusha.'],
    ]),
  },
  'classic-tanzania-lodge-safari': {
    overview:
      'Five lodge nights on the northern circuit: Manyara, Ngorongoro, and Tarangire — a classic first safari with comfortable rooms and private game drives.',
    highlights: ['Lodge safari', 'Three northern parks', 'Crater day', 'Arusha start and finish'],
    itinerary: days([
      ['Day 1', 'Arusha to Lake Manyara', 'Afternoon game drive under the escarpment.'],
      ['Day 2', 'Manyara to Ngorongoro', 'Transfer to the crater highlands.'],
      ['Day 3', 'Ngorongoro Crater', 'Full day on the crater floor.'],
      ['Day 4', 'Tarangire', 'Continue to Tarangire for elephants and baobabs.'],
      ['Day 5', 'Return to Arusha', 'Morning drive, then back to Arusha.'],
    ]),
  },
  'ngorongoro-crater-day-trip': {
    overview:
      'A long, rewarding day from Arusha: descend into Ngorongoro Crater with a picnic lunch and return the same evening.',
    highlights: ['Crater floor game drive', 'Picnic in the caldera', 'Return to Arusha', 'Private vehicle'],
    itinerary: days([
      ['Day 1', 'Arusha – Ngorongoro – Arusha', 'Early departure from Arusha, crater-floor game drive, picnic lunch, and return to your hotel in the evening.'],
    ]),
    included: ['Park fees', 'Private 4x4 and driver-guide', 'Picnic lunch', 'Bottled water'],
    excluded: ['Hotel in Arusha', 'Tips', 'Personal extras'],
  },
  'materuni-waterfalls-and-coffee-tour': {
    overview:
      'A village day near Moshi: hike to Materuni waterfall, a Chagga coffee demonstration from cherry to cup, and a relaxed lunch.',
    highlights: ['Waterfall hike', 'Coffee from bean to cup', 'Chagga village visit', 'Day trip from Moshi or Arusha'],
    itinerary: days([
      ['Day 1', 'Materuni village', 'Transfer to Materuni, waterfall walk, coffee tour, lunch, and return.'],
    ]),
    included: ['Village visit and guiding', 'Coffee demonstration', 'Lunch', 'Transfers from Moshi or Arusha as agreed'],
    excluded: ['Tips', 'Personal shopping', 'Travel insurance'],
  },
  'fly-in-fly-out-mikumi-national-park': {
    overview:
      'A fly-in day in Mikumi’s open grassland — a practical taste of the southern savannah from the coast or Dar es Salaam.',
    highlights: ['Light-aircraft access', 'Open-grassland game drive', 'Back the same day', 'Southern circuit snapshot'],
    itinerary: days([
      ['Day 1', 'Fly to Mikumi', 'Morning flight, game drive, picnic, and return flight in the afternoon.'],
    ]),
    included: ['Park fees', 'Game drive', 'Picnic lunch', 'Flights as quoted'],
    excluded: ['Coast hotel', 'Tips', 'Personal extras'],
  },
  '8-days-mt-kilimanjaro-via-marangu-route': {
    overview:
      'The Marangu (“Coca-Cola”) route uses mountain huts and a steady profile. Eight days includes extra acclimatisation before the Uhuru Peak attempt.',
    highlights: ['Hut overnight', 'Mandara, Horombo, Kibo', 'Uhuru Peak attempt', 'Guided crew from Moshi or Arusha'],
    itinerary: days([
      ['Day 1', 'Arrive Moshi or Arusha', 'Gear check, briefing, and overnight in town.'],
      ['Day 2', 'Marangu Gate to Mandara', 'Forest trek to Mandara Hut.'],
      ['Day 3', 'Mandara to Horombo', 'Moorland to Horombo Hut.'],
      ['Day 4', 'Acclimatisation', 'A short hike toward Zebra Rocks and back to Horombo.'],
      ['Day 5', 'Horombo to Kibo', 'Alpine desert to Kibo Hut.'],
      ['Day 6', 'Summit night', 'Midnight start for Gilman’s Point and Uhuru Peak, then descend to Horombo.'],
      ['Day 7', 'Descend to the gate', 'Forest descent and transfer to town.'],
      ['Day 8', 'Depart', 'Airport transfer or onward safari.'],
    ]),
    included: climbIncluded,
    excluded: climbExcluded,
  },
  '7-day-kilimanjaro-climb-via-machame-route': {
    overview:
      'Machame is a camping route with strong acclimatisation (“climb high, sleep low”). Seven days is the standard profile for fit trekkers.',
    highlights: ['Machame camp', 'Shira plateau', 'Barranco Wall', 'Barafu summit night'],
    itinerary: days([
      ['Day 1', 'Arrive', 'Briefing and overnight in Moshi or Arusha.'],
      ['Day 2', 'Machame Gate to Machame Camp', 'Rainforest ascent.'],
      ['Day 3', 'Shira Camp', 'Onto the plateau with Kilimanjaro views.'],
      ['Day 4', 'Barranco Camp', 'Via Lava Tower, then down to Barranco.'],
      ['Day 5', 'Karanga to Barafu', 'Barranco Wall, then high camp.'],
      ['Day 6', 'Summit and Mweka', 'Night ascent to Uhuru Peak, descend to Mweka Camp.'],
      ['Day 7', 'Mweka Gate', 'Final descent and transfer to town.'],
    ]),
    included: climbIncluded,
    excluded: climbExcluded,
  },
  '4-days-mt-meru-trekking-via-momella-gate': {
    overview:
      'Mount Meru is Tanzania’s second peak and a serious trek in its own right — forest wildlife, a crater rim, and a sharp summit ridge via Momella Gate.',
    highlights: ['Arusha National Park', 'Momella Gate', 'Socialist Peak attempt', 'Wildlife on the trail'],
    itinerary: days([
      ['Day 1', 'Momella to Miriakamba', 'Enter Arusha National Park and trek to Miriakamba Hut.'],
      ['Day 2', 'Saddle Hut', 'Ascent through forest and moorland.'],
      ['Day 3', 'Summit and descend', 'Pre-dawn ridge to Socialist Peak, then down toward Miriakamba.'],
      ['Day 4', 'To the gate', 'Descend to Momella and return to Arusha.'],
    ]),
    included: climbIncluded,
    excluded: climbExcluded,
  },
  '5-days-zanzibar-beach-holiday': {
    overview:
      'Five nights on Unguja after the safari: beach lodge, optional spice or Stone Town, and time in the Indian Ocean.',
    highlights: ['Beach lodge', 'Stone Town option', 'Spice tour option', 'Fits after a northern safari'],
    itinerary: days([
      ['Day 1', 'Arrive Zanzibar', 'Transfer from the airport or ferry to your beach hotel.'],
      ['Day 2', 'Beach day', 'At leisure — snorkel, dhow, or simply the tide.'],
      ['Day 3', 'Spice or Stone Town', 'A guided half-day, then return to the beach.'],
      ['Day 4', 'Beach day', 'Free day on the east or north coast as booked.'],
      ['Day 5', 'Depart', 'Transfer to the airport for your international or safari flight.'],
    ]),
    included: ['Beach lodge nights as quoted', 'Daily breakfast', 'Airport or ferry transfers on Zanzibar'],
    excluded: ['Flights from the mainland', 'Lunches and dinners unless stated', 'Water sports'],
  },
  'spices-and-stone-town-tour-in-zanzibar': {
    overview:
      'A single day on Unguja: Stone Town’s waterfront and a spice farm, useful as a stopover or a rest day between safari and beach.',
    highlights: ['Stone Town walking', 'Spice farm', 'Day tour', 'Private or small group'],
    itinerary: days([
      ['Day 1', 'Stone Town and spices', 'Morning in Stone Town, afternoon on a spice farm (or the reverse), with lunch and return to your hotel.'],
    ]),
    included: ['Guiding', 'Spice farm visit', 'Lunch', 'Local transfers'],
    excluded: ['Hotel', 'Tips', 'Personal shopping'],
  },
  '2-days-safari-from-zanzibar': {
    overview:
      'Fly from Zanzibar for Tarangire and Ngorongoro, then return to the coast — a compact wildlife add-on when beach days come first.',
    highlights: ['Flights from Zanzibar', 'Tarangire', 'Ngorongoro Crater', 'Two-day circuit'],
    itinerary: days([
      ['Day 1', 'Zanzibar to Tarangire', 'Fly to the mainland, game drive in Tarangire, overnight at a lodge.'],
      ['Day 2', 'Ngorongoro and return', 'Crater-floor game drive, then fly back to Zanzibar in the evening.'],
    ]),
  },
};

function daysFromJoin(tour) {
  if (!Array.isArray(tour.days) || !tour.days.length) return null;
  return tour.days.map((item) => ({
    day: item.day,
    title: item.title,
    body: item.body,
    stay: item.stay,
    meals: item.meals,
    viewing: item.viewing,
    transport: item.transport,
    image: item.image,
  }));
}

function withDefaults(tour) {
  const slug = tour.slug || slugify(tour.title);
  const extra = extras[slug] || {};
  const isClimb = /kilimanjaro|meru|machame|marangu/i.test(tour.title);
  return {
    ...tour,
    slug,
    overview: extra.overview || tour.overview || `${tour.title} with Golden Memories Safaris — a private itinerary from Arusha, shaped around ${tour.places || 'Tanzania’s parks'}.`,
    highlights: extra.highlights || tour.highlights || [tour.places, tour.duration, tour.activity].filter(Boolean),
    itinerary: extra.itinerary || tour.itinerary || daysFromJoin(tour) || [{ day: 'Itinerary', title: tour.title, body: 'Share your dates and we will send a day-by-day plan for this package.' }],
    included: extra.included || tour.included || tour.inclusions || (isClimb ? climbIncluded : sharedIncluded),
    excluded: extra.excluded || tour.excluded || tour.exclusions || (isClimb ? climbExcluded : sharedExcluded),
  };
}

export function hasTourPrice(tour) {
  return Number(tour.price_from ?? tour.price) > 0;
}

export function allTours() {
  const seen = new Set();
  return [...gmsTrips, ...openJoiningPackages, ...safariPackages, ...dayTrips, ...kilimanjaro, ...zanzibar]
    .map(withDefaults)
    .filter((tour) => {
      if (!hasTourPrice(tour)) return false;
      if (seen.has(tour.slug)) return false;
      seen.add(tour.slug);
      return true;
    })
    .map((tour) => ({ ...tour, image: uniqueCoverFor(tour) }));
}

export function getTourBySlug(slug) {
  return allTours().find((tour) => tour.slug === slug) || null;
}

export function relatedTours(tour, count = 3) {
  return allTours()
    .filter((item) => item.slug !== tour.slug)
    .slice(0, count);
}

export function allTourSlugs() {
  return allTours().map((tour) => tour.slug);
}
