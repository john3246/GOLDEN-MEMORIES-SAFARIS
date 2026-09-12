import { SAFARI_DAY_IMAGES as IMG } from '@gm-safaris/safari-ui';

function hero(url, alt) {
  return { id: null, url, alt, caption: '' };
}

function day(n, title, description, extra = {}) {
  return {
    id: `day_${n}`,
    day: `Day ${n}`,
    title,
    description,
    activities: extra.activities || [],
    accommodation: extra.accommodation || '',
    meals: extra.meals || '',
    transport: extra.transport || '',
    distance: extra.distance || '',
    viewing: extra.viewing || '',
    image: extra.image || '',
  };
}

function seo(item) {
  const description = (item.short_description || item.description || '').slice(0, 320);
  return {
    title: `${item.title} | Golden Memories Safaris`,
    description,
    canonical: '',
    og_title: item.title,
    og_description: description,
    og_image: item.hero_image?.url || '',
    robots: 'index,follow',
  };
}

const family = {
  slug: '7-day-family-wildebeest-migration-safari',
  title: '7-Day Family Wildebeest Migration Safari',
  duration: 7,
  duration_label: '7 Days / 6 Nights',
  destination: 'Tarangire · Central Serengeti · Northern Serengeti · Ngorongoro · Lake Manyara',
  difficulty: 'Family Safari',
  featured: true,
  display_order: 1,
  price_from: 3094,
  currency: 'USD',
  best_season: 'Year-round; river crossings typically July–October',
  minimum_people: 2,
  hero_image: hero(IMG.migration, 'Wildebeest herds on the Serengeti plains'),
  gallery: [
    hero(IMG.tarangire, 'Elephants in Tarangire'),
    hero(IMG.serengeti, 'Central Serengeti wildlife'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
    hero(IMG.manyara, 'Lake Manyara'),
  ],
  short_description:
    'A paced family safari through Tarangire, Central and Northern Serengeti, Ngorongoro Crater, and Lake Manyara — private 4x4, family-friendly lodges, and the Great Migration when the season is right.',
  description:
    'This 7-day Family Wildebeest Migration Safari is designed for families travelling together. The route covers Tanzania’s most iconic northern parks: Tarangire, Central Serengeti, Northern Serengeti, Ngorongoro Crater, and Lake Manyara. Days are paced so children and adults can enjoy game viewing without exhausting transfers. Travel is in a private 4x4 with a professional guide. Lodges and camps are chosen for location, safety, and a family-friendly atmosphere, on a full-board basis.',
  highlights: [
    'Great Wildebeest Migration (seasonal river crossings)',
    'Tarangire elephant herds and baobabs',
    'Central Serengeti predator country',
    'Northern Serengeti migration routes',
    'Ngorongoro Crater floor',
    'Lake Manyara forest, flamingos, and tree-climbing lions',
  ],
  accommodation:
    'Mid-range family lodges and camps: Ngare Lodge (Karatu), Moyo Tented Camp (Central Serengeti), Misako Camp (Northern Serengeti), Ngorongoro Wild Camp, Karatu Villas, and Green Mountain Arusha — confirmed to your dates.',
  transport_information: 'Private 4x4 safari vehicle with an experienced professional guide.',
  inclusions: [
    'Private 4x4 safari vehicle',
    'Professional English-speaking safari guide',
    'Park fees as per itinerary',
    'Full-board lodge and camp nights',
    'Game drives as listed',
    'Bottled drinking water',
    'Airport or hotel transfers on safari days',
  ],
  exclusions: [
    'International flights and visa fees',
    'Travel insurance',
    'Tips for guides and camp staff',
    'Optional balloon safari or cultural visits not listed',
    'Personal expenses',
  ],
  itinerary: [
    day(
      1,
      'Arusha – Tarangire National Park – Karatu',
      'After breakfast, depart Arusha for a full-day game drive in Tarangire National Park, known for elephant herds, baobabs, lions, giraffes, zebras, and antelope. Picnic lunch in the park, then continue to Karatu.',
      { image: IMG.tarangire, accommodation: 'Ngare Lodge, Karatu', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      2,
      'Central Serengeti National Park',
      'Drive through the Ngorongoro Conservation Area toward Central Serengeti. Afternoon game drive for lions, leopards, cheetahs, elephants, and open-plain herds.',
      { image: IMG.serengeti, accommodation: 'Moyo Tented Camp, Central Serengeti', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      3,
      'Northern Serengeti',
      'Continue north along migration routes toward the Mara River. Seasonal crossings, predators, and large herds depending on the month you travel.',
      { image: IMG.migration, accommodation: 'Misako Camp, Northern Serengeti', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      4,
      'Central Serengeti',
      'Morning game drive in the north, then return toward Central Serengeti with wildlife viewing along the way. Evening at camp in the highlands / crater area as routed.',
      { image: IMG.savanna, accommodation: 'Ngorongoro Wild Camp', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      5,
      'Ngorongoro Crater',
      'Early descent onto the crater floor for a full-day game drive: lions, elephants, buffalo, zebra, hippo, hyena, and possible black rhino. Picnic lunch on the floor, then drive to Manyara Best View Lodge.',
      { image: IMG.ngorongoro, accommodation: 'Manyara Best View Lodge', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      6,
      'Lake Manyara National Park – Arusha',
      'Full-day game drive in Lake Manyara: groundwater forest, flamingos, hippos, birdlife, and tree-climbing lions. Picnic lunch, then return to Arusha for dinner and overnight.',
      { image: IMG.manyara, accommodation: 'Green Mountain Arusha or similar', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      7,
      'Departure',
      'Relaxed morning at the lodge, then transfer to Arusha or Kilimanjaro Airport timed to your flight.',
      { image: IMG.arusha, accommodation: 'Departure day', meals: 'Breakfast' }
    ),
  ],
};

const luxuryFive = {
  slug: '5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro',
  title: '5-Day Luxury Tanzania Safari – Tarangire, Serengeti & Ngorongoro',
  duration: 5,
  duration_label: '5 Days / 4 Nights',
  destination: 'Tarangire · Serengeti · Ngorongoro Crater',
  difficulty: 'Luxury Safari',
  featured: false,
  display_order: 2,
  price_from: 4925,
  currency: 'USD',
  best_season: 'Year-round',
  minimum_people: 2,
  hero_image: hero(IMG.ngorongoroAlt, 'Luxury safari overlooking Ngorongoro'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire elephants'),
    hero(IMG.serengeti, 'Serengeti plains'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
    hero(IMG.packages, 'Private safari vehicle'),
  ],
  short_description:
    'A private luxury safari through Tarangire, Serengeti, and Ngorongoro Crater — premium lodges, a dedicated 4x4, and unhurried game drives.',
  description:
    'A five-day luxury journey through Tarangire National Park, Serengeti National Park, and Ngorongoro Crater for travellers who want privacy, comfort, and high-end service. Travel in a private 4x4 with an expert guide. Each day mixes immersive wildlife viewing with refined lodges: a Tarangire luxury lodge, Serengeti Ark (or similar), Ngorongoro Retreat, and a Melia Collection crater-highland stay where availability allows.',
  highlights: [
    'Private luxury 4x4 and guide',
    'Tarangire elephants and baobabs',
    'Full-day Serengeti game drives',
    'Ngorongoro Crater picnic lunch',
    'Premium lodges and camps',
  ],
  accommodation:
    'Luxury Tarangire lodge; Serengeti Ark Luxury Camp or similar; Ngorongoro Retreat; Ngorongoro Melia Collection or similar, subject to availability.',
  transport_information: 'Private luxury 4x4 safari vehicle with professional English-speaking guide.',
  inclusions: [
    'Private luxury 4x4 safari vehicle',
    'Professional English-speaking safari guide',
    'Luxury accommodations throughout',
    'All park fees and crater service fees',
    'Full-board meals (breakfast, lunch, dinner)',
    'Private game drives',
    'Bottled drinking water',
    'Airport transfers',
    'Personalized safari experience',
  ],
  exclusions: [
    'International flights and visas',
    'Travel insurance',
    'Premium alcoholic beverages',
    'Optional activities (e.g. hot air balloon safari)',
    'Personal expenses and tips',
  ],
  itinerary: [
    day(
      1,
      'Arrival & Tarangire National Park',
      'Private pick-up from Arusha and transfer to Tarangire. Relaxed game drive among baobabs and elephant herds. Late afternoon at your luxury lodge.',
      { image: IMG.tarangire, accommodation: 'Luxury Tarangire Lodge', meals: 'Lunch & dinner' }
    ),
    day(
      2,
      'Tarangire to Serengeti',
      'After breakfast, drive to Serengeti via the Ngorongoro highlands. Afternoon game drive on the plains, then check in at your luxury Serengeti camp.',
      { image: IMG.serengeti, accommodation: 'Serengeti Ark Luxury Camp / lodge', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      3,
      'Full-day luxury Serengeti safari',
      'Private full-day game drive across predator country and seasonal migration routes. Bush lunch, golden-hour viewing, sunset dinner at camp.',
      { image: IMG.migration, accommodation: 'Serengeti Ark Luxury Camp / similar', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      4,
      'Serengeti to Ngorongoro Retreat',
      'Morning game drive, then transfer to the Ngorongoro highlands. Afternoon at the retreat — spa, views, and a quiet fine-dining evening.',
      { image: IMG.ngorongoroTourists, accommodation: 'Ngorongoro Retreat (luxury highland lodge)', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      5,
      'Ngorongoro Crater & departure',
      'Early descent into the crater for a private game drive and picnic near the hippo pool. Ascend and return to Arusha or Kilimanjaro Airport.',
      { image: IMG.ngorongoro, accommodation: 'Ngorongoro Melia Collection or similar / departure', meals: 'Breakfast & lunch' }
    ),
  ],
};

const affordableFour = {
  slug: '4-day-affordable-private-tanzania-safari',
  title: '4-Day Affordable Private Tanzania Safari – Tarangire, Serengeti & Ngorongoro',
  duration: 4,
  duration_label: '4 Days / 3 Nights',
  destination: 'Tarangire · Serengeti · Ngorongoro Crater',
  difficulty: 'Private Safari',
  featured: false,
  display_order: 3,
  price_from: 2168,
  currency: 'USD',
  best_season: 'Year-round',
  minimum_people: 2,
  hero_image: hero(IMG.tarangire, 'Tarangire National Park elephants'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire'),
    hero(IMG.serengeti, 'Serengeti'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A private four-day circuit of Tarangire, Serengeti, and Ngorongoro Crater — your own 4x4 and guide, mid-range lodges, and strong wildlife value.',
  description:
    'This 4-day affordable private safari is for travellers who want a genuine Tanzania safari with privacy and flexibility, without a group vehicle. You have exclusive use of a 4x4 and professional guide through Tarangire, Serengeti, and Ngorongoro Crater. Mid-range lodges and camps balance comfort and price. Days stay focused on wildlife, scenery, and time at sightings rather than a rushed group timetable.',
  highlights: [
    'Fully private 4x4 and guide',
    'Tarangire elephants and baobabs',
    'Serengeti plains and predators',
    'Ngorongoro Crater floor',
    'Mid-range lodges in Karatu and Serengeti',
  ],
  accommodation: 'Ngare Lodge or Karatu Villas; Out of Africa Camp or Serengeti mid-range camp — confirmed to your dates.',
  transport_information: 'Private 4x4 safari vehicle with professional English-speaking guide.',
  inclusions: [
    'Private 4x4 safari vehicle',
    'Professional English-speaking guide',
    'Park entry fees (Tarangire, Serengeti, Ngorongoro)',
    'Mid-range accommodation',
    'All meals during safari',
    'Drinking water',
    'Game drives as per itinerary',
    'Airport/hotel pickup and drop-off',
  ],
  exclusions: [
    'International flights and visas',
    'Travel insurance',
    'Optional activities (hot air balloon safari, etc.)',
    'Alcoholic beverages',
    'Tips and personal expenses',
  ],
  itinerary: [
    day(
      1,
      'Tarangire National Park',
      'Morning pickup in Arusha and a full game drive in Tarangire — elephants, baobabs, lions, giraffes, zebra, and birdlife. Evening transfer to Karatu.',
      { image: IMG.tarangire, accommodation: 'Ngare Lodge / Karatu Villas', meals: 'Lunch & dinner' }
    ),
    day(
      2,
      'Karatu to Serengeti National Park',
      'Drive through the Ngorongoro highlands into Serengeti. Afternoon game drive on the plains until sunset, then camp nearby or inside the ecosystem.',
      { image: IMG.serengeti, accommodation: 'Out of Africa Camp / Serengeti mid-range camp', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      3,
      'Full-day Serengeti safari',
      'A full day of private game drives for predators, seasonal migration herds, and classic savanna. Picnic lunch in the bush.',
      { image: IMG.migration, accommodation: 'Serengeti mid-range camp / Out of Africa Camp', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      4,
      'Ngorongoro Crater & return to Arusha',
      'Descend into Ngorongoro Crater for a private floor drive — rhino, lion, elephant, buffalo, hippo, flamingo. Picnic by the hippo pool, then return to Arusha.',
      { image: IMG.ngorongoro, accommodation: 'Departure / Arusha drop-off', meals: 'Breakfast & lunch' }
    ),
  ],
};

const luxurySix = {
  slug: '6-day-luxury-great-migration-safari',
  title: '6-Day Luxury Great Migration Safari – Serengeti River Crossing',
  duration: 6,
  duration_label: '6 Days / 5 Nights',
  destination: 'Tarangire · Central Serengeti · Northern Serengeti · Ngorongoro · Lake Manyara',
  difficulty: 'Luxury Safari',
  featured: false,
  display_order: 4,
  price_from: 5010,
  currency: 'USD',
  best_season: 'July–October for Mara River crossings; excellent wildlife year-round',
  minimum_people: 2,
  hero_image: hero(IMG.serengeti, 'Northern Serengeti migration country'),
  gallery: [
    hero(IMG.migration, 'Great Migration'),
    hero(IMG.tarangire, 'Tarangire'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
    hero(IMG.manyara, 'Lake Manyara'),
  ],
  short_description:
    'A private luxury safari built around Northern Serengeti river crossings, Central Serengeti predators, Ngorongoro Crater, Tarangire, and Lake Manyara.',
  description:
    'This 6-day luxury safari pairs wildlife intensity with high-end camps: Northern Serengeti for seasonal Mara River crossings, Central Serengeti for resident predators, plus Tarangire, Ngorongoro Crater, and a final Lake Manyara morning. Travel is fully private in a luxury 4x4. Lodges include Manyara Best View, Melia or Serena Serengeti, a northern luxury camp / Serengeti Ark, and crater-highland properties such as Lion’s Paw or Melia Ngorongoro.',
  highlights: [
    'Northern Serengeti migration / river crossings (seasonal)',
    'Central Serengeti full-day game drive',
    'Ngorongoro Crater Big Five habitat',
    'Tarangire elephants',
    'Lake Manyara scenic finale',
    'Luxury 4x4 and premium camps',
  ],
  accommodation:
    'Manyara Best View; Melia Serengeti or Serena Serengeti; Northern Serengeti luxury camp / Serengeti Ark; Ngorongoro Lion’s Paw or Melia Ngorongoro — subject to availability.',
  transport_information: 'Private luxury 4x4 safari vehicle with professional English-speaking guide.',
  inclusions: [
    'Private luxury 4x4 safari vehicle',
    'Professional English-speaking safari guide',
    'Luxury accommodations (Serengeti & Ngorongoro circuit)',
    'All park entry fees',
    'Full-board meals during safari',
    'Private game drives',
    'Drinking water',
    'Airport transfers',
    'Personalized safari planning',
  ],
  exclusions: [
    'International flights and visas',
    'Travel insurance',
    'Optional hot air balloon safari',
    'Premium alcoholic beverages',
    'Tips and personal expenses',
  ],
  itinerary: [
    day(
      1,
      'Tarangire National Park',
      'Private pick-up in Arusha and a full-day game drive in Tarangire among elephant herds and baobabs. Evening at a luxury Karatu lodge.',
      { image: IMG.tarangire, accommodation: 'Manyara Best View', meals: 'Lunch & dinner' }
    ),
    day(
      2,
      'Central Serengeti via Ngorongoro Highlands',
      'Scenic drive through the conservation area into Central Serengeti. Full-day private game drive, picnic in the bush, luxury camp at sunset.',
      { image: IMG.serengeti, accommodation: 'Melia Serengeti / Serena Serengeti', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      3,
      'Northern Serengeti river crossing',
      'Track Great Migration herds toward the Mara River. Seasonal crossings, crocodiles, lions, and a more remote northern landscape.',
      { image: IMG.migration, accommodation: 'Northern Serengeti Luxury Camp / Serengeti Ark', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      4,
      'Return to Central Serengeti',
      'Morning drive in the north, then a continuous safari south to Central Serengeti for afternoon predator viewing.',
      { image: IMG.savanna, accommodation: 'Ngorongoro Lion’s Paw / Ngorongoro Melia', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      5,
      'Ngorongoro Crater',
      'Descend early into the crater for the Big Five habitat, flamingo lakes, and a picnic on the floor. Overnight at Manyara Best View Lodge.',
      { image: IMG.ngorongoro, accommodation: 'Manyara Best View Lodge', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      6,
      'Lake Manyara & departure',
      'Shorter private game drive in Lake Manyara — Rift scenery, forest, flamingos, tree-climbing lions — then transfer to Arusha or Kilimanjaro Airport. No overnight.',
      { image: IMG.manyara, accommodation: 'Departure day', meals: 'Breakfast & lunch' }
    ),
  ],
};

const fourteen = {
  slug: '14-day-tanzania-safari-zanzibar-escape',
  title: '14-Day Tanzania Safari & Zanzibar Escape',
  duration: 14,
  duration_label: '14 Days / 13 Nights',
  destination: 'Tarangire · Serengeti · Ngorongoro · Lake Eyasi · Zanzibar',
  difficulty: 'Safari & Beach',
  featured: false,
  display_order: 5,
  price_from: 7148,
  currency: 'USD',
  best_season: 'Year-round; dry months June–October for game viewing',
  minimum_people: 2,
  hero_image: hero(IMG.zanzibar, 'Zanzibar coastline after safari'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire'),
    hero(IMG.serengeti, 'Serengeti'),
    hero(IMG.ngorongoro, 'Ngorongoro'),
    hero(IMG.eyasi, 'Lake Eyasi'),
    hero(IMG.zanzibar, 'Nungwi beach'),
    hero(IMG.spice, 'Zanzibar spices'),
  ],
  short_description:
    'Northern-circuit wildlife — Tarangire, Serengeti, Ngorongoro, Lake Eyasi — then Stone Town, Nungwi, and a Melia Zanzibar beach stay, with a domestic flight from Arusha.',
  description:
    'A 14-day private journey balancing wilderness and the Indian Ocean. Mainland days cover Tarangire, Central and Northern Serengeti, Ngorongoro Crater, Lake Manyara routing, and a Lake Eyasi cultural day with the Hadzabe, all in a private 4x4. You then fly Arusha to Zanzibar for Stone Town, Nungwi Dreams by Mantis, and several nights at Melia Zanzibar. Safari logistics, park fees, the domestic flight, and listed meals are included.',
  highlights: [
    'Northern safari circuit including migration country',
    'Ngorongoro Crater full day',
    'Hadzabe cultural morning at Lake Eyasi',
    'Domestic flight Arusha → Zanzibar',
    'Stone Town and Nungwi beaches',
    'Melia Zanzibar luxury resort nights',
  ],
  accommodation:
    'Ngare Lodge; Tukaone Tented Camp; Misako Camp; Ngorongoro Wild Camp; Manyara Best View; Arusha night; Nungwi Dreams by Mantis; Melia Zanzibar.',
  transport_information: 'Private 4x4 on the mainland; domestic flight Arusha to Zanzibar; resort transfers on the island.',
  inclusions: [
    'Private safari 4x4 vehicle (mainland safari)',
    'Professional English-speaking guide',
    'Park fees (Tarangire, Manyara, Ngorongoro, Serengeti)',
    'Cultural experiences (Maasai & Hadzabe as listed)',
    'Domestic flight Arusha → Zanzibar',
    'Accommodation as per itinerary',
    'Meals as specified',
    'Airport transfers',
    'Bottled drinking water',
  ],
  exclusions: [
    'International flights',
    'Visa fees',
    'Travel insurance',
    'Optional excursions (diving, spa, dhow cruise, spice tours)',
    'Alcoholic beverages',
    'Tips and personal expenses',
  ],
  itinerary: [
    day(
      1,
      'Arusha – Tarangire – Karatu',
      'Full-day Tarangire game drive among elephants and baobabs. Picnic in the park, overnight at Ngare Lodge in Karatu.',
      { image: IMG.tarangire, accommodation: 'Ngare Lodge', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      2,
      'Central Serengeti National Park',
      'Drive through Ngorongoro Conservation Area into Central Serengeti. Afternoon game drive; overnight Tukaone Tented Camp.',
      { image: IMG.serengeti, accommodation: 'Tukaone Tented Camp', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      3,
      'Northern Serengeti',
      'Follow migration routes north toward the Mara River. Overnight at Misako Camp.',
      { image: IMG.migration, accommodation: 'Misako Camp', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      4,
      'Central Serengeti',
      'Morning in the north, then return toward Central Serengeti. Overnight Ngorongoro Wild Camp.',
      { image: IMG.savanna, accommodation: 'Ngorongoro Wild Camp', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      5,
      'Ngorongoro Crater',
      'Full-day crater-floor game drive and picnic lunch, then Manyara Best View Lodge.',
      { image: IMG.ngorongoro, accommodation: 'Manyara Best View Lodge', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      6,
      'Lake Eyasi cultural experience',
      'Visit Lake Eyasi and spend time with the Hadzabe hunter-gatherer community. Overnight in Arusha.',
      { image: IMG.eyasi, accommodation: 'Arusha hotel', meals: 'Breakfast, lunch & dinner' }
    ),
    day(
      7,
      'Fly to Zanzibar & Stone Town',
      'Morning flight Arusha to Zanzibar. Transfer to Stone Town — Old Fort, House of Wonders, spice markets — then Nungwi Dreams by Mantis.',
      { image: IMG.spice, accommodation: 'Nungwi Dreams by Mantis', meals: 'Breakfast & dinner' }
    ),
    day(
      8,
      'Nungwi beach',
      'Transfer to the north coast. Swim, walk the sand, and settle into Nungwi’s calm, all-day swimming water.',
      { image: IMG.zanzibar, accommodation: 'Nungwi Dreams by Mantis', meals: 'Breakfast' }
    ),
    day(
      9,
      'Full beach leisure in Nungwi',
      'A free day for the beach, snorkelling, diving, a sunset dhow, or the turtle aquarium.',
      { image: IMG.zanzibar, accommodation: 'Nungwi Dreams by Mantis', meals: 'Breakfast' }
    ),
    day(
      10,
      'Transfer to Melia Zanzibar',
      'Move to the east/northeast coast luxury resort — private beach, pools, and gardens.',
      { image: IMG.zanzibar, accommodation: 'Melia Zanzibar', meals: 'Breakfast' }
    ),
    day(
      11,
      'Luxury beach & ocean',
      'Resort day: spa, snorkelling, or a dhow cruise, then seafood-focused dining.',
      { image: IMG.packages, accommodation: 'Melia Zanzibar', meals: 'Breakfast' }
    ),
    day(
      12,
      'Zanzibar at your pace',
      'Stay at the resort or add a spice farm, Jozani Forest (red colobus), or a dolphin trip.',
      { image: IMG.spice, accommodation: 'Melia Zanzibar', meals: 'Breakfast' }
    ),
    day(
      13,
      'Final full day in Zanzibar',
      'Last beach hours, sunset, or a private ocean dinner before departure.',
      { image: IMG.zanzibar, accommodation: 'Melia Zanzibar', meals: 'Breakfast' }
    ),
    day(
      14,
      'Departure from Zanzibar',
      'Breakfast, check-out, and transfer to Zanzibar Airport for your international flight.',
      { image: IMG.arusha, accommodation: 'Departure day', meals: 'Breakfast' }
    ),
  ],
};

export const PDF_PACKAGES = [family, luxuryFive, affordableFour, luxurySix, fourteen].map((item) => ({
  ...item,
  seo: seo(item),
}));
