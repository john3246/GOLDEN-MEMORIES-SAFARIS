import { emptySafariDocument, SAFARI_DAY_IMAGES as IMG } from '@gm-safaris/safari-ui';

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

const SHARED_OUT = [
  'International flights',
  'Visa fees',
  'Travel and medical insurance',
  'Alcoholic and soft drinks',
  'Personal expenses and souvenirs',
  'Tips and gratuities for guides and lodge staff',
  'Optional activities not listed in the itinerary',
];

export const REPLACED_SAFARI_SLUGS = new Set([
  '7-day-family-wildebeest-migration-safari',
  '5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro',
  '5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro-crater-exclusive-retreat',
  '4-day-affordable-private-tanzania-safari',
  '4-day-affordable-private-tanzania-safari-tarangire-serengeti-ngorongoro-crater-adventure',
  '6-day-luxury-great-migration-safari-serengeti-river-crossing-exclusive-experience',
  '6-day-luxury-great-migration-safari',
  '14-day-tanzania-luxury-safari-zanzibar-escape',
  '14-day-tanzania-safari-zanzibar-escape',
  '6-days-best-tanzania-adventure-safari',
  '10-days-river-crossing-great-wildebeest-migration-safari',
  '8-days-best-safari-to-ruaha-and-selous',
  '5-days-budget-tanzania-lodge-safari',
  'ngorongoro-northern-circuit-safari',
  'tarangire-elephant-safari',
  'serengeti-wildlife-safari',
  'classic-tanzania-lodge-safari',
  '5-days-mid-range-safari-serengeti-ngorongoro-crater',
]);

const luxuryEight = {
  slug: '8-day-luxury-tanzania-safari-zanzibar-beach-escape',
  title: '8-Day Luxury Tanzania Safari & Zanzibar Beach Escape',
  duration: 8,
  duration_label: '8 Days / 7 Nights',
  destination: 'Arusha · Tarangire · Serengeti · Ngorongoro · Zanzibar',
  difficulty: 'Luxury Safari',
  activity: 'Luxury Safari',
  style: 'luxury',
  featured: true,
  display_order: 1,
  price: 7800,
  price_from: 7800,
  currency: 'USD',
  best_season: 'Year-round; migration typically June–October',
  minimum_people: 2,
  hero_image: hero(IMG.zanzibar, 'Zanzibar beach after a Tanzania luxury safari'),
  gallery: [
    hero(IMG.tarangire, 'Elephants in Tarangire National Park'),
    hero(IMG.serengeti, 'Serengeti plains'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
    hero(IMG.zanzibar, 'Zanzibar coastline'),
  ],
  short_description:
    'An 8-day luxury journey from Arusha through Tarangire, the Serengeti, and Ngorongoro Crater, finishing on Zanzibar’s beaches — USD 7,800 per person.',
  description:
    'Experience the ultimate blend of wildlife adventure and tropical relaxation on this 8-day luxury journey through Tanzania. From the iconic Northern Safari Circuit to the white-sand beaches of Zanzibar, the itinerary pairs luxury lodges and tented camps with a scenic domestic flight to the island. Your adventure begins in Arusha before exploring elephant-rich Tarangire, two nights in the Serengeti, and a Ngorongoro Crater game drive. A scheduled flight then takes you to Zanzibar for beach days at a luxury resort.',
  highlights: [
    'Tarangire National Park safari experience',
    'Two nights in the legendary Serengeti National Park',
    'Ngorongoro Crater game drive',
    'Opportunity to spot the Big Five',
    'Luxury lodges, tented camps, and beach resorts',
    'Scenic domestic flight to Zanzibar',
    'White-sand beaches and turquoise waters',
    'Professional English-speaking safari guide',
  ],
  accommodation:
    'Luxury lodges and camps such as Arusha Coffee Lodge, Gran Meliá Arusha, Nimali Tarangire, Four Seasons or Meliá Serengeti, then Meliá Zanzibar or similar beach resorts — confirmed to your dates.',
  transport_information: 'Private luxury 4×4 safari vehicle with pop-up roof and professional English-speaking guide; domestic flight from Northern Tanzania to Zanzibar.',
  inclusions: [
    'Luxury safari accommodation on a full-board basis',
    'Luxury Zanzibar beach accommodation with breakfast',
    'Private luxury 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'Domestic flight from Northern Tanzania to Zanzibar',
    'All national park entrance fees and conservation fees',
    'All scheduled game drives',
    'Airport transfers as per itinerary',
    'Bottled drinking water during safari',
    'Government taxes and VAT',
  ],
  exclusions: [
    ...SHARED_OUT,
    'Lunches and dinners in Zanzibar unless otherwise specified',
    'Optional excursions and activities in Zanzibar',
    'Spa treatments and premium resort services',
  ],
  itinerary: [
    day(
      1,
      'Arrival in Arusha',
      'Upon arrival at Kilimanjaro International Airport (JRO), you are welcomed and transferred to your luxury hotel in Arusha. The remainder of the day is at leisure. In the evening a safari briefing prepares you for the days ahead.',
      {
        image: IMG.arusha,
        accommodation: 'Arusha Coffee Lodge · Gran Meliá Arusha · Mount Meru Hotel · Sanna Boutique Hotel',
        meals: 'Dinner',
      }
    ),
    day(
      2,
      'Tarangire National Park – Elephant Paradise',
      'After breakfast, depart for Tarangire National Park, famous for massive elephant herds, ancient baobabs, and abundant wildlife. Enjoy a full-day game drive with a picnic lunch in the park, searching for elephants, lions, giraffes, zebras, wildebeest, and birdlife.',
      {
        image: IMG.tarangire,
        accommodation: 'Nimali Tarangire · Acacia Tarangire Luxury Camp · Nyikani Tarangire Camp · Tarangire Treetops',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      3,
      'Journey to Serengeti National Park',
      'Travel through the Ngorongoro Conservation Area toward Serengeti National Park. Wildlife sightings continue en route. An afternoon game drive introduces the endless plains of one of Africa’s most celebrated wildlife destinations.',
      {
        image: IMG.serengeti,
        accommodation: 'Four Seasons Safari Lodge Serengeti · Meliá Serengeti Lodge · Nimali Serengeti · Robins Serengeti Camp',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      4,
      'Full-Day Serengeti Safari',
      'Spend a full day exploring the Serengeti: vast plains, rocky kopjes, and riverine forest while tracking predators. Depending on season you may see part of the Great Wildebeest Migration. Your guide shares ecology and behaviour throughout the day.',
      {
        image: IMG.migration,
        accommodation: 'Serengeti Pioneer Camp · Sanctuary Kusini Camp · Serengeti Serena Safari Lodge · Lemala Ewanjan Tented Camp',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      5,
      'Ngorongoro Crater & Flight to Zanzibar',
      'After an early breakfast, descend into Ngorongoro Crater for a Big Five game drive. Following a picnic lunch, transfer to the airstrip for your scheduled flight to Zanzibar and continue to your luxury beachfront resort.',
      {
        image: IMG.ngorongoro,
        accommodation: 'Meliá Zanzibar · The Mora Zanzibar · TUI Blue Bahari · Ocean Paradise · Zanzibar Serena · Nungwi Dreams · Mwezi Boutique Resort',
        meals: 'Breakfast & Lunch',
      }
    ),
    day(
      6,
      'Zanzibar Beach Relaxation',
      'A full day at leisure on Zanzibar. Relax on white sand, swim in the Indian Ocean, or use your resort’s facilities and amenities.',
      { image: IMG.zanzibar, accommodation: 'Selected Zanzibar beach resort', meals: 'Breakfast' }
    ),
    day(
      7,
      'Zanzibar Leisure Day',
      'Another day at your own pace. Optional activities include Stone Town, spice plantations, snorkelling, diving, dolphin tours, a sunset dhow cruise, or simply the beach.',
      { image: IMG.spice, accommodation: 'Selected Zanzibar beach resort', meals: 'Breakfast' }
    ),
    day(
      8,
      'Departure',
      'Breakfast at the resort, then transfer to Zanzibar Airport for your onward flight — departing with the wildlife, landscapes, and coastline of Tanzania.',
      { image: IMG.zanzibar, accommodation: 'Departure day', meals: 'Breakfast' }
    ),
  ],
};

const luxuryFour = {
  slug: '4-day-luxury-tanzania-safari',
  title: '4-Day Luxury Tanzania Safari',
  duration: 4,
  duration_label: '4 Days / 3 Nights',
  destination: 'Arusha · Tarangire · Serengeti',
  difficulty: 'Luxury Safari',
  activity: 'Luxury Safari',
  style: 'luxury',
  featured: true,
  display_order: 2,
  price: 3000,
  price_from: 3000,
  currency: 'USD',
  best_season: 'Year-round',
  minimum_people: 2,
  hero_image: hero(IMG.serengeti, 'Luxury game drive in the Serengeti'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire elephants'),
    hero(IMG.serengeti, 'Serengeti wildlife'),
    hero(IMG.arusha, 'Arusha lodge'),
  ],
  short_description:
    'A 4-day luxury northern-circuit safari: Arusha, a full day in Tarangire, the Serengeti, and a scenic flight back to Arusha — USD 3,000 per person.',
  description:
    'An unforgettable 4-day luxury safari through Tanzania’s most iconic wildlife destinations. The journey begins in Arusha, continues to elephant-rich Tarangire, then the Serengeti — home to spectacular wildlife concentrations and the Great Migration in season. A scenic flight from Serengeti back to Arusha on the final day maximises time in the bush.',
  highlights: [
    'Luxury safari accommodations throughout',
    'Full-day game drive in Tarangire National Park',
    'Extensive wildlife viewing in Serengeti National Park',
    'Opportunity to spot the Big Five',
    'Scenic flight from Serengeti to Arusha',
    'Professional English-speaking safari guide',
    'Luxury 4×4 safari vehicle with pop-up roof',
  ],
  accommodation:
    'Luxury lodges such as Arusha Coffee Lodge, Nimali Tarangire or Tarangire Treetops, and Four Seasons, Meliá, or Nimali Serengeti — confirmed to your dates.',
  transport_information: 'Private luxury 4×4 with pop-up roof; domestic flight from Serengeti to Arusha on day 4.',
  inclusions: [
    'Luxury accommodation as specified in the itinerary',
    'All national park entrance fees and conservation fees',
    'Domestic flight from Serengeti to Arusha',
    'Private luxury 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All scheduled game drives',
    'Airport transfers',
    'All meals as indicated in the itinerary',
    'Bottled drinking water during safari',
    'Government taxes and VAT',
  ],
  exclusions: SHARED_OUT,
  itinerary: [
    day(
      1,
      'Arrival in Arusha',
      'Upon arrival at Kilimanjaro International Airport (JRO) or Arusha Airport, you are met and transferred to your luxury accommodation in Arusha. The remainder of the day is at leisure. In the evening receive a detailed safari briefing.',
      {
        image: IMG.arusha,
        accommodation: 'Arusha Coffee Lodge · Gran Meliá Arusha · Mount Meru Hotel',
        meals: 'Dinner',
      }
    ),
    day(
      2,
      'Tarangire National Park – Elephant Paradise',
      'After breakfast, depart for Tarangire National Park. Enjoy a full-day game drive among elephant herds, giant baobabs, lions, giraffes, zebras, and wildebeest, with a picnic lunch in the park.',
      {
        image: IMG.tarangire,
        accommodation: 'Nimali Tarangire · Tarangire Treetops · Acacia Tarangire Luxury Camp',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      3,
      'Serengeti National Park – Wildlife Spectacle',
      'Journey to Serengeti National Park through the Ngorongoro Conservation Area. Afternoon game drive across the plains, focusing on the Seronera region for lions, leopards, cheetahs, elephants, and resident game.',
      {
        image: IMG.serengeti,
        accommodation: 'Four Seasons Safari Lodge Serengeti · Meliá Serengeti Lodge · Nimali Serengeti',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      4,
      'Serengeti Game Drive & Flight to Arusha',
      'After breakfast, a final game drive in Central Serengeti. Later transfer to the airstrip for your scheduled flight to Arusha, then connect with your international departure or onward travel. No overnight on this day.',
      { image: IMG.savanna, accommodation: 'Departure day — no overnight', meals: 'Breakfast & Lunch Box' }
    ),
  ],
};

const luxuryMigrationFive = {
  slug: '5-day-luxury-wildebeest-migration-safari',
  title: '5-Day Luxury Wildebeest Migration Safari (Serengeti Focus)',
  duration: 5,
  duration_label: '5 Days / 4 Nights',
  destination: 'Tarangire · Central Serengeti · Northern Serengeti · Ngorongoro',
  difficulty: 'Luxury Safari',
  activity: 'Luxury Safari',
  style: 'luxury',
  featured: true,
  display_order: 3,
  price: 4500,
  price_from: 4500,
  currency: 'USD',
  best_season: 'Migration typically June–October; resident game year-round',
  minimum_people: 2,
  hero_image: hero(IMG.migration, 'Wildebeest migration in the Serengeti'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire elephants'),
    hero(IMG.serengeti, 'Serengeti predators'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 5-day luxury migration safari from Kilimanjaro Airport: Tarangire, three Serengeti nights, and Ngorongoro Crater — USD 4,500 per person.',
  description:
    'An exclusive 5-day luxury migration safari through Tanzania’s most iconic wildlife destinations, with a strong Serengeti focus. Starting from Kilimanjaro International Airport, the safari immerses you immediately in the bush: Tarangire, three nights in the Serengeti (central and migration zones), and a Ngorongoro Crater finale. Ideal for travellers who want river crossings and predator action when the season is right.',
  highlights: [
    'Tarangire elephant herds and baobab landscapes',
    '3 nights in Serengeti National Park (migration focus)',
    'Great Wildebeest Migration experience (seasonal)',
    'Big Five wildlife viewing opportunities',
    'Luxury tented camps and lodges throughout',
    'Ngorongoro Crater safari experience',
    'Professional safari guide and private 4×4 vehicle',
  ],
  accommodation:
    'Luxury camps and lodges such as Nimali Tarangire, Chem Chem, Four Seasons or Meliá Serengeti, Nyikani Migration Camp, and Lemala Ewanjan — confirmed to your dates.',
  transport_information: 'Private 4×4 safari vehicle with pop-up roof and professional English-speaking guide; start and finish at Kilimanjaro Airport / Arusha.',
  inclusions: [
    'Luxury safari accommodation on a full-board basis',
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All park entry fees and conservation charges',
    'All game drives as per itinerary',
    'Ngorongoro Crater service fees',
    'Bottled drinking water during safari',
    'Airport transfers',
    'Government taxes and VAT',
  ],
  exclusions: SHARED_OUT,
  itinerary: [
    day(
      1,
      'Arrival at JRO & Transfer to Tarangire National Park',
      'Met at Kilimanjaro International Airport and immediately depart for Tarangire. Scenic drive through Maasai country, then an afternoon game drive among elephant herds and baobabs along the Tarangire River before dinner at your luxury lodge.',
      {
        image: IMG.tarangire,
        accommodation: 'Nimali Tarangire · Tarangire Treetops · Chem Chem Lodge · Acacia Tarangire Luxury Camp',
        meals: 'Lunch & Dinner',
      }
    ),
    day(
      2,
      'Serengeti National Park (Central / Migration Region)',
      'Depart for Serengeti National Park via the Ngorongoro Conservation Area. Afternoon game drive in the Seronera region — a wildlife hub for resident predators and seasonal migration movement.',
      {
        image: IMG.serengeti,
        accommodation: 'Four Seasons Safari Lodge Serengeti · Meliá Serengeti Lodge · Nimali Serengeti · Serengeti Pioneer Camp',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      3,
      'Full-Day Serengeti Migration Safari',
      'A full day tracking the migration by season: river lines, open plains, or northern corridors. Expect wildebeest and zebra herds with lions, cheetahs, and hyenas in attendance.',
      {
        image: IMG.migration,
        accommodation: 'Nyikani Migration Camp · Lemala Ewanjan Tented Camp · Sanctuary Serengeti Migration Camp · Serengeti Serena Safari Lodge',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      4,
      'Serengeti Safari (Extended Exploration)',
      'Deeper Serengeti: kopjes, river valleys, and grasslands, staying flexible so the vehicle can follow wildlife movement and predator–prey action.',
      {
        image: IMG.savanna,
        accommodation: 'Mobile Migration Camp · Serengeti Safari Camp · Meliá Serengeti Lodge · Kubu Kubu Tented Lodge',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      5,
      'Ngorongoro Crater & Departure',
      'Early breakfast, then drive to Ngorongoro Conservation Area and descend for a half-day crater game drive. After lunch inside the crater, ascend and transfer to Arusha or Kilimanjaro International Airport.',
      { image: IMG.ngorongoro, accommodation: 'Departure day', meals: 'Breakfast & Lunch' }
    ),
  ],
};

const luxurySeven = {
  slug: '7-day-luxury-big-five-wildebeest-migration-safari',
  title: '7-Day Luxury Big Five & Wildebeest Migration Safari (From Arusha)',
  duration: 7,
  duration_label: '7 Days / 6 Nights',
  destination: 'Arusha · Tarangire · Serengeti · Ngorongoro · Lake Manyara',
  difficulty: 'Luxury Safari',
  activity: 'Luxury Safari',
  style: 'luxury',
  featured: false,
  display_order: 4,
  price: 5900,
  price_from: 5900,
  currency: 'USD',
  best_season: 'Year-round; migration typically June–October',
  minimum_people: 2,
  hero_image: hero(IMG.ngorongoroAlt, 'Ngorongoro Crater luxury safari'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire'),
    hero(IMG.serengeti, 'Serengeti'),
    hero(IMG.manyara, 'Lake Manyara'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 7-day luxury safari from Arusha: Tarangire, three Serengeti nights, Ngorongoro Crater, and Lake Manyara — USD 5,900 per person.',
  description:
    'An exceptional 7-day luxury safari from Arusha combining Tanzania’s iconic northern-circuit parks. Extended Serengeti time for the Big Five and seasonal wildebeest migration, plus Tarangire, Ngorongoro Crater, and Lake Manyara. Handpicked luxury lodges, private game drives, and photography-focused guiding.',
  highlights: [
    'Tarangire elephant herds and baobab landscapes',
    '3 nights in Serengeti National Park (migration focus)',
    'Big Five wildlife viewing opportunities',
    'Ngorongoro Crater safari experience',
    'Lake Manyara tree-climbing lions and birdlife',
    'Luxury lodges and tented camps throughout',
    'Professional safari guide and private 4×4 vehicle',
  ],
  accommodation:
    'Luxury properties such as Arusha Coffee Lodge, Tarangire Treetops, Four Seasons or Meliá Serengeti, Ngorongoro Serena or The Manor, and Lake Manyara Kilimamoja Lodge — confirmed to your dates.',
  transport_information: 'Private 4×4 safari vehicle with pop-up roof from Arusha, returning to Arusha or Kilimanjaro Airport.',
  inclusions: [
    'Luxury accommodation on a full-board basis',
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All park entry and conservation fees',
    'Ngorongoro Crater service fees',
    'All scheduled game drives',
    'Airport transfers',
    'Bottled drinking water during safari',
    'Government taxes and VAT',
  ],
  exclusions: SHARED_OUT,
  itinerary: [
    day(
      1,
      'Arrival in Arusha – Luxury Welcome',
      'Met at Kilimanjaro International Airport and transferred to your luxury hotel in Arusha. The rest of the day is at leisure. Evening safari briefing.',
      {
        image: IMG.arusha,
        accommodation: 'Arusha Coffee Lodge · Gran Meliá Arusha · Mount Meru Hotel · Sanna Boutique Hotel',
        meals: 'Dinner',
      }
    ),
    day(
      2,
      'Tarangire National Park – Elephant Paradise',
      'Full-day game drive in Tarangire among elephant herds, baobabs, and seasonal concentrations along the river, with a picnic lunch in the park.',
      {
        image: IMG.tarangire,
        accommodation: 'Tarangire Treetops · Sanctuary Swala Camp · Lemala Mpingo Ridge · Kichuguu Camp',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      3,
      'Serengeti National Park – Migration Frontier',
      'Travel to the Serengeti via the Ngorongoro Conservation Area. First game drive on the plains, focusing on predator-rich Seronera and seasonal migration herds.',
      {
        image: IMG.serengeti,
        accommodation: 'Four Seasons Safari Lodge Serengeti · Meliá Serengeti Lodge · Nimali Serengeti · Serengeti Serena Safari Lodge',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      4,
      'Full-Day Serengeti Migration Safari',
      'A fully flexible day across plains, river valleys, and kopjes to maximise wildlife sightings, including predator–prey interactions and large herbivore herds.',
      {
        image: IMG.migration,
        accommodation: 'Serengeti Pioneer Camp · Sanctuary Kusini Camp · Lemala Ewanjan Tented Camp · &Beyond Klein’s Camp',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      5,
      'Serengeti to Ngorongoro – Crater Rim Stay',
      'Early morning game drive, then continue toward Ngorongoro Conservation Area. Arrive at a crater-rim lodge in time for sunset over the caldera.',
      {
        image: IMG.ngorongoro,
        accommodation: 'Ngorongoro Serena Safari Lodge · Melia Ngorongoro · Ngorongoro Sopa Lodge · The Manor at Ngorongoro',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      6,
      'Ngorongoro Crater – Big Five Safari & Lake Manyara',
      'Descend into Ngorongoro Crater for a half-day game drive — one of Africa’s most wildlife-dense ecosystems. After a picnic lunch, continue to Lake Manyara for evening relaxation at your lodge.',
      {
        image: IMG.manyara,
        accommodation: 'Lake Manyara Kilimamoja Lodge · Escarpment Luxury Lodge · Kirurumu Manyara Lodge · Manyara Wildlife Camp',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      7,
      'Lake Manyara National Park & Return to Arusha',
      'Morning game drive in Lake Manyara — tree-climbing lions, flamingos, elephants, and birdlife — then return to Arusha for your airport transfer.',
      { image: IMG.manyara, accommodation: 'Departure day', meals: 'Breakfast & Lunch' }
    ),
  ],
};

const luxuryBalloonFour = {
  slug: '4-day-luxury-serengeti-hot-air-balloon-safari',
  title: '4-Day Luxury Serengeti Hot Air Balloon Safari (2026–2027)',
  duration: 4,
  duration_label: '4 Days / 3 Nights',
  destination: 'Central Serengeti · Ngorongoro',
  difficulty: 'Luxury Safari',
  activity: 'Luxury Safari',
  style: 'luxury',
  featured: false,
  display_order: 5,
  price: 3500,
  price_from: 3500,
  currency: 'USD',
  best_season: 'Year-round; balloon flights subject to weather',
  minimum_people: 2,
  hero_image: hero(IMG.packages, 'Sunrise over the Serengeti plains'),
  gallery: [
    hero(IMG.serengeti, 'Central Serengeti'),
    hero(IMG.savanna, 'Open grassland'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 4-day luxury Serengeti safari with a sunrise hot air balloon flight, champagne bush breakfast, and Ngorongoro Crater — USD 3,500 per person.',
  description:
    'An exclusive 4-day luxury safari combining high-end camps, exceptional Central Serengeti game viewing, and a sunrise hot air balloon flight over the savannah with a champagne bush breakfast. The journey concludes with Ngorongoro Crater. Built for travellers who want a premium, immersive short safari with adventure and comfort in balance.',
  highlights: [
    'Luxury Serengeti safari experience',
    'Sunrise hot air balloon flight over Serengeti plains',
    'Champagne bush breakfast after balloon safari',
    'Central Serengeti luxury camps',
    'Big Five wildlife viewing opportunities',
    'Ngorongoro Crater safari experience',
    'Professional private safari guide and 4×4 vehicle',
  ],
  accommodation:
    'Luxury Serengeti lodges such as Four Seasons, Meliá, Nimali, or Serena, then Ngorongoro Serena, Melia Ngorongoro, or The Highlands — confirmed to your dates.',
  transport_information: 'Private 4×4 from Kilimanjaro Airport / Arusha into the Serengeti, returning via Ngorongoro.',
  inclusions: [
    'Luxury accommodation throughout the safari',
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'Hot air balloon safari experience in the Serengeti',
    'Champagne bush breakfast after the balloon flight',
    'All national park entrance fees and crater service fees',
    'All scheduled game drives',
    'All meals as per itinerary',
    'Bottled drinking water in the safari vehicle',
    'Airport transfers',
  ],
  exclusions: SHARED_OUT,
  itinerary: [
    day(
      1,
      'Arrival & Central Serengeti Game Drive',
      'Met at Kilimanjaro International Airport and travel toward Serengeti National Park through the Ngorongoro Highlands. Afternoon game drive in Central Serengeti — lions, elephants, giraffes, buffalo, and antelope — then dinner at your luxury camp.',
      {
        image: IMG.serengeti,
        accommodation: 'Four Seasons Safari Lodge Serengeti · Meliá Serengeti Lodge · Nimali Serengeti Camp · Serengeti Serena Safari Lodge',
        meals: 'Lunch & Dinner',
      }
    ),
    day(
      2,
      'Hot Air Balloon Safari & Full-Day Game Drive',
      'Before sunrise, transfer to the balloon launch site and float over the plains as wildlife becomes active. After landing, enjoy a champagne bush breakfast, then a full Central Serengeti game drive tracking predators and herds.',
      {
        image: IMG.packages,
        accommodation: 'Serengeti Pioneer Camp · Sanctuary Serengeti Migration Camp · Lemala Ewanjan Tented Camp · &Beyond Serengeti Under Canvas',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Balloon flight plus full-day game drive',
      }
    ),
    day(
      3,
      'Serengeti Morning Safari & Transfer to Ngorongoro',
      'Early morning game drive when wildlife is most active, then explore kopjes, plains, and river valleys. After lunch, depart for the Ngorongoro Conservation Area and arrive at a crater-rim lodge for sunset views.',
      {
        image: IMG.ngorongoro,
        accommodation: 'Ngorongoro Serena Safari Lodge · Melia Ngorongoro Lodge · Ngorongoro Lodge · The Highlands Ngorongoro',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      4,
      'Ngorongoro Crater Safari & Departure',
      'Descend early into Ngorongoro Crater for a half-day luxury game drive across forests, lakes, and grassland. After a picnic lunch, ascend and return to Arusha or Kilimanjaro International Airport.',
      { image: IMG.ngorongoroTourists, accommodation: 'Departure day', meals: 'Breakfast & Lunch' }
    ),
  ],
};

const luxuryRiverSix = {
  slug: '6-day-luxury-great-migration-river-crossing-safari',
  title: '6-Day Luxury Great Migration River Crossing Safari (Northern Serengeti Focus)',
  duration: 6,
  duration_label: '6 Days / 5 Nights',
  destination: 'Lake Manyara · Northern Serengeti · Central Serengeti · Ngorongoro',
  difficulty: 'Luxury Safari',
  activity: 'Luxury Safari',
  style: 'luxury',
  featured: true,
  display_order: 6,
  price: 4800,
  price_from: 4800,
  currency: 'USD',
  best_season: 'July–October for Mara River crossings',
  minimum_people: 2,
  hero_image: hero(IMG.migration, 'Great Migration river crossing in Northern Serengeti'),
  gallery: [
    hero(IMG.manyara, 'Lake Manyara'),
    hero(IMG.serengeti, 'Northern Serengeti'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 6-day luxury Great Migration safari focused on Mara River crossings in Northern Serengeti, plus Lake Manyara and Ngorongoro — USD 4,800 per person.',
  description:
    'An exclusive 6-day luxury Great Migration safari with a strong Northern Serengeti focus for dramatic Mara River crossings (July–October). The route combines Lake Manyara, Central Serengeti, two nights in the northern migration region, and Ngorongoro Crater for a complete Big Five and migration experience. Luxury camps sit near prime crossing points.',
  highlights: [
    'Luxury Great Migration safari experience',
    'Mara River crossings in Northern Serengeti (seasonal, July–October)',
    '2 nights in the Northern Serengeti migration region',
    'Central Serengeti predator-rich game viewing',
    'Lake Manyara tree-climbing lions and birdlife',
    'Ngorongoro Crater Big Five safari',
    'Luxury tented camps in prime wildlife locations',
  ],
  accommodation:
    'Luxury lodges such as Lake Manyara Kilimamoja or Escarpment Lodge, Sayari Camp or &Beyond Klein’s Camp in the north, and Ngorongoro Serena or The Highlands — confirmed to your dates.',
  transport_information: 'Private 4×4 safari vehicle with pop-up roof from Kilimanjaro Airport / Arusha.',
  inclusions: [
    'Luxury accommodation on a full-board basis',
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All park entrance and conservation fees',
    'Mara River migration game drives',
    'Ngorongoro Crater service fees',
    'All scheduled game drives',
    'Bottled drinking water during safari',
    'Airport transfers',
  ],
  exclusions: SHARED_OUT,
  itinerary: [
    day(
      1,
      'Lake Manyara National Park – Luxury Start',
      'Met at Kilimanjaro International Airport and travel to Lake Manyara National Park. Afternoon game drive through groundwater forest for flamingos, elephants, and tree-climbing lions — a compact introduction to the northern circuit.',
      {
        image: IMG.manyara,
        accommodation: 'Lake Manyara Kilimamoja Lodge · Escarpment Luxury Lodge · Manyara Serena Safari Lodge · Kirurumu Luxury Tented Camp',
        meals: 'Lunch & Dinner',
      }
    ),
    day(
      2,
      'Journey to Northern Serengeti – Migration Frontier',
      'Depart for Northern Serengeti via the Ngorongoro highlands and Central Serengeti. Arrive in the remote north, the heart of the Great Migration river-crossing zone, where herds may already be gathering on the Mara River.',
      {
        image: IMG.serengeti,
        accommodation: 'Sayari Camp · &Beyond Klein’s Camp · Lemala Mara Camp · Serengeti River Camp',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      3,
      'Northern Serengeti – Mara River Crossing Safari',
      'Full day tracking the migration along the Mara River. Your guide positions you near active crossing points for stampedes, crocodiles, and predator–prey action — the highlight of the safari.',
      {
        image: IMG.migration,
        accommodation: 'Sayari Camp · Mara Under Canvas · Lemala Kuria Hills Lodge · Serengeti Migration Camp (Northern sector)',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day river-crossing game drives',
      }
    ),
    day(
      4,
      'Northern Serengeti – Continued Migration Action',
      'A second full day on northern crossing hotspots and surrounding plains, increasing the chance of multiple crossings and extended time with lions, hyenas, and crocodiles.',
      {
        image: IMG.savanna,
        accommodation: 'Sayari Camp · Lemala Mara Camp · &Beyond Klein’s Camp · Migration Mobile Luxury Camp',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      5,
      'Serengeti to Ngorongoro Crater Rim',
      'Final morning game drive in the Serengeti, then travel through Central Serengeti toward Ngorongoro Conservation Area. Arrive at a crater-rim luxury lodge for sunset over the caldera.',
      {
        image: IMG.ngorongoro,
        accommodation: 'Ngorongoro Serena Safari Lodge · Melia Ngorongoro Lodge · The Highlands Ngorongoro · Ngorongoro Crater Lodge',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      6,
      'Ngorongoro Crater Safari & Departure',
      'Descend early into Ngorongoro Crater for a half-day game drive — rhinos, lions, elephants, buffalo, and flamingos at Lake Magadi. After a picnic lunch, return to Arusha or Kilimanjaro International Airport.',
      { image: IMG.ngorongoroTourists, accommodation: 'Departure day', meals: 'Breakfast & Lunch' }
    ),
  ],
};

const midrangeFour = {
  slug: '4-day-midrange-private-safari',
  title: '4-Day Midrange Private Safari',
  duration: 4,
  duration_label: '4 Days / 3 Nights',
  destination: 'Tarangire · Serengeti · Ngorongoro',
  difficulty: 'Midrange Safari',
  activity: 'Private Safari',
  style: 'wildlife',
  featured: true,
  display_order: 7,
  price: 1800,
  price_from: 1800,
  currency: 'USD',
  best_season: 'Year-round',
  minimum_people: 2,
  hero_image: hero(IMG.tarangire, 'Tarangire elephants on a private midrange safari'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire'),
    hero(IMG.serengeti, 'Serengeti'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 4-day private midrange safari from Arusha: Tarangire, Serengeti, and Ngorongoro Crater in a private 4×4 — USD 1,800 per person.',
  description:
    'Track lions, elephants, buffalo, leopards, and rhinos in Tanzania’s top national parks on this 4-day private adventure. Travel in a private 4×4 with pop-up roof and a dedicated professional guide. Game viewing runs from Tarangire’s elephant herds to the predator-rich Serengeti and the wildlife-dense Ngorongoro Crater, home to the endangered black rhino.',
  highlights: [
    'Private 4×4 safari vehicle with pop-up roof',
    'Tarangire elephant herds and baobabs',
    'Serengeti predator country',
    'Ngorongoro Crater rhino search',
    'Comfortable midrange lodges and tented camps',
    'All meals as specified',
  ],
  accommodation:
    'Comfortable safari lodges or tented camps in or near Tarangire and in Serengeti National Park — confirmed to your dates. Day 4 has no overnight.',
  transport_information: 'Private 4×4 safari vehicle with pop-up roof and professional English-speaking guide from Arusha, returning to Arusha.',
  inclusions: [
    'Comfortable safari accommodations',
    'All meals as specified in the itinerary',
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All national park entry fees and conservation charges',
    'Bottled drinking water throughout the safari',
    'Government taxes and transfer fees',
    'Picnic lunches and wildlife experiences',
    'Personalized safari planning and support',
  ],
  exclusions: [
    'International flights and visa fees',
    'Travel and medical insurance',
    'Alcoholic beverages and soft drinks',
    'Personal expenses and souvenirs',
    'Tips for guides and lodge staff',
    'Optional activities not listed in the itinerary',
    'Additional upgrades or personal requests',
  ],
  itinerary: [
    day(
      1,
      'Arusha to Tarangire National Park – Elephant Paradise',
      'Depart Arusha after breakfast for Tarangire National Park. Picnic lunch overlooking the Tarangire River, then an afternoon game drive for elephants, lions, buffalo, and baobabs. Evening at a comfortable safari lodge near the park.',
      {
        image: IMG.tarangire,
        accommodation: 'Comfortable safari lodge in or near Tarangire National Park',
        meals: 'Lunch & Dinner',
      }
    ),
    day(
      2,
      'Tarangire to Serengeti National Park – Predator Paradise',
      'Early game drive in Tarangire, then travel to the Serengeti through the Ngorongoro Conservation Area. Picnic lunch in the park, afternoon drives for lions, leopards, and cheetahs, then dinner at your Serengeti lodge or tented camp.',
      {
        image: IMG.serengeti,
        accommodation: 'Comfortable safari lodge or tented camp in Serengeti National Park',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      3,
      'Full Day Serengeti Big Five Search',
      'A full day exploring different areas of the Serengeti for the Big Five, with special attention to predator activity. Bush picnic, rocky outcrops, riverine forest, and open plains. Evening at camp.',
      {
        image: IMG.savanna,
        accommodation: 'Comfortable safari lodge or tented camp in Serengeti National Park',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      4,
      'Serengeti to Ngorongoro Crater – Rhino Search and Return to Arusha',
      'Final Serengeti game drive, then descend into Ngorongoro Crater — your best chance of black rhino — with a picnic lunch near the hippo pool. Ascend and drive back to Arusha for your onward transfer. No overnight.',
      { image: IMG.ngorongoro, accommodation: 'No overnight stay — return to Arusha', meals: 'Breakfast & Lunch' }
    ),
  ],
};

const midrangeMigrationFive = {
  slug: '5-day-midrange-migration-safari',
  title: '5-Day Migration Safari',
  duration: 5,
  duration_label: '5 Days / 4 Nights',
  destination: 'Tarangire · Central Serengeti · Northern Serengeti · Ngorongoro',
  difficulty: 'Midrange Safari',
  activity: 'Wildlife Safari',
  style: 'wildlife',
  featured: true,
  display_order: 8,
  price: 2000,
  price_from: 2000,
  currency: 'USD',
  best_season: 'July–October for Mara River crossings',
  minimum_people: 2,
  hero_image: hero(IMG.migration, 'Great Migration in Northern Serengeti'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire'),
    hero(IMG.serengeti, 'Central Serengeti'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 5-day midrange Great Migration safari: Tarangire, Central and Northern Serengeti river crossings, and Ngorongoro Crater — USD 2,000 per person.',
  description:
    'Witness the Great Migration in Serengeti National Park. From July to October more than 1.5 million wildebeest, with zebras and gazelles, move toward dramatic Mara River crossings in Northern Serengeti. This 5-day safari is planned to maximise crossing chances while covering Tarangire, Central Serengeti, and Ngorongoro Crater.',
  highlights: [
    'Tarangire elephant paradise',
    'Central Serengeti predator country',
    'Northern Serengeti Mara River crossings (July–October)',
    'Ngorongoro Crater Big Five finale',
    'Private 4×4 with professional driver-guide',
    'Great Migration tracking',
  ],
  accommodation:
    'Comfortable safari lodges or tented camps near Tarangire, in Central Serengeti, and in Northern Serengeti — confirmed to your dates.',
  transport_information: 'Private 4×4 safari vehicle with pop-up roof from Arusha, returning to Arusha.',
  inclusions: [
    'Full-board accommodation throughout the safari',
    'Private safari transportation with a professional driver-guide',
    'Private 4×4 safari vehicle with pop-up roof',
    'All national park entrance fees and Ngorongoro Crater service fees',
    'Freshly prepared meals during the safari',
    'Great Migration tracking and strategic positioning for Mara River crossings',
    'Complimentary binoculars and wildlife guidebook',
    'Bottled drinking water during game drives',
  ],
  exclusions: [
    'International flights and visa fees',
    'Travel and medical insurance',
    'Alcoholic beverages',
    'Personal expenses and souvenirs',
    'Tips for your driver-guide and lodge staff',
    'Optional hot air balloon safari',
  ],
  itinerary: [
    day(
      1,
      'Tarangire National Park – Elephant Paradise',
      'Depart Arusha for Tarangire National Park. Afternoon game drive for elephants, lions, leopards, giraffes, and birdlife, with dry-season concentrations along the Tarangire River. Overnight at a comfortable lodge or tented camp near the park.',
      {
        image: IMG.tarangire,
        accommodation: 'Comfortable safari lodge or tented camp in or near Tarangire National Park',
        meals: 'Lunch & Dinner',
      }
    ),
    day(
      2,
      'Central Serengeti – Heart of the Wildlife',
      'Travel to Serengeti National Park through Naabi Hill Gate. Afternoon game drive in Seronera — lions, cheetahs, leopards, elephants, and hippos — with migration herds often moving north in season.',
      {
        image: IMG.serengeti,
        accommodation: 'Comfortable safari lodge or tented camp in Central Serengeti',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      3,
      'Northern Serengeti – Mara River Crossing Experience',
      'Travel to Northern Serengeti for Mara River crossings. Your guide tracks herd movements and monitors crossing activity as wildebeest and zebras gather on the banks.',
      {
        image: IMG.migration,
        accommodation: 'Comfortable safari lodge or tented camp in Northern Serengeti',
        meals: 'Breakfast, Lunch & Dinner',
        viewing: 'River-crossing game drives',
      }
    ),
    day(
      4,
      'Return to Central Serengeti',
      'Morning in Northern Serengeti for further migration viewing, then return to Central Serengeti with game viewing across the plains for elephants, giraffes, predators, hippos, and birdlife.',
      {
        image: IMG.savanna,
        accommodation: 'Comfortable safari lodge or tented camp in Central Serengeti',
        meals: 'Breakfast, Lunch & Dinner',
      }
    ),
    day(
      5,
      'Ngorongoro Crater – The Grand Finale',
      'Descend about 600 metres into Ngorongoro Crater for a full game drive: lions, elephants, buffalo, hippos, flamingos, and black rhino. Picnic lunch, then return to Arusha for hotel or airport drop-off.',
      { image: IMG.ngorongoro, accommodation: 'Departure day — return to Arusha', meals: 'Breakfast & Lunch' }
    ),
  ],
};

const familySix = {
  slug: '6-day-family-tour-tanzania',
  title: '6 Days Family Tour Tanzania 2026–2027',
  duration: 6,
  duration_label: '6 Days / 5 Nights',
  destination: 'Arusha · Lake Manyara · Serengeti · Ngorongoro',
  difficulty: 'Family Safari',
  activity: 'Family Safari',
  style: 'wildlife',
  featured: true,
  display_order: 9,
  price: 2750,
  price_from: 2750,
  currency: 'USD',
  best_season: 'Year-round',
  minimum_people: 2,
  hero_image: hero(IMG.ngorongoroTourists, 'Family safari in Tanzania'),
  gallery: [
    hero(IMG.manyara, 'Lake Manyara'),
    hero(IMG.serengeti, 'Serengeti'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 6-day family safari with a relaxed pace: Arusha, Lake Manyara, three Serengeti days, and Ngorongoro Crater — USD 2,750 per person.',
  description:
    'Create unforgettable family memories on this 6-day Tanzania safari, combining adventure, comfort, and education for all ages. Built for a relaxed pace, extended wildlife viewing, and meaningful shared experiences: family-friendly lodges, child-friendly meals, flexible game drives, and three full days in the Serengeti before a Ngorongoro Crater finale.',
  highlights: [
    'Family-friendly private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide specialised in family travel',
    'Comfortable family lodges with interconnected rooms',
    'Three full days in Serengeti for extended wildlife viewing',
    'Lake Manyara tree-climbing lions experience',
    'Ngorongoro Crater Big Five safari finale',
    'Child-friendly meals, picnic spots, and flexible game drives',
  ],
  accommodation:
    'Family hotel in Arusha, family lodge near Lake Manyara, and family lodges in the Serengeti — confirmed to your dates.',
  transport_information: 'Family-friendly private 4×4 with pop-up roof from Arusha, returning to Arusha or the airport.',
  inclusions: [
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All national park and conservation fees',
    'Full-board accommodation throughout safari',
    'Bottled drinking water during game drives',
    'All meals with child-friendly options',
    'Flexible family-oriented game drives',
    'Wildlife viewing and educational guiding',
  ],
  exclusions: [
    'International flights and visa fees',
    'Travel and medical insurance',
    'Alcoholic beverages and personal drinks',
    'Tips for guide and lodge staff',
    'Personal expenses and souvenirs',
    'Optional activities not mentioned',
  ],
  itinerary: [
    day(
      1,
      'Arrival & Family Welcome in Arusha',
      'Welcome at Kilimanjaro or Arusha Airport and transfer to a comfortable Arusha hotel. Afternoon to acclimatise, then a family briefing covering the itinerary and wildlife expectations. Welcome dinner with child-friendly options.',
      { image: IMG.arusha, accommodation: 'Family hotel in Arusha', meals: 'Dinner' }
    ),
    day(
      2,
      'Lake Manyara National Park – Family Wildlife Introduction',
      'Relaxed family game drive in Lake Manyara for tree-climbing lions, flamingos, baboons, giraffes, and elephants. Picnic lunch in the park, then return to your lodge near Manyara.',
      {
        image: IMG.manyara,
        accommodation: 'Family lodge near Lake Manyara',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      3,
      'Serengeti National Park – Family Safari Adventure',
      'Travel through the Ngorongoro Highlands into Serengeti National Park. Afternoon game drive introducing lions, elephants, giraffes, zebras, and antelopes, with interactive guiding for children.',
      {
        image: IMG.serengeti,
        accommodation: 'Family lodge in Serengeti',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      4,
      'Serengeti National Park – Full Day Exploration',
      'Full day at a flexible family pace: morning and afternoon drives, picnic lunches, and rest stops so children stay comfortable while you watch predators, herbivores, and migratory herds.',
      {
        image: IMG.savanna,
        accommodation: 'Family lodge in Serengeti',
        meals: 'Breakfast, lunch, dinner',
        viewing: 'Full-day game drives',
      }
    ),
    day(
      5,
      'Serengeti National Park – Extended Wildlife Experience',
      'A third Serengeti day tailored to your family’s interests — lions, elephants, birdlife, or migration herds — with picnic lunch or a lodge midday break.',
      {
        image: IMG.migration,
        accommodation: 'Family lodge in Serengeti',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      6,
      'Ngorongoro Crater – Safari Finale & Departure',
      'Descend into Ngorongoro Crater for a Big Five game drive with excellent visibility and short distances, ideal for families. Picnic lunch, then return to Arusha for airport or hotel transfer.',
      { image: IMG.ngorongoro, accommodation: 'Departure day', meals: 'Breakfast, lunch' }
    ),
  ],
};

const midrangeBalloonThree = {
  slug: '3-day-serengeti-hot-air-balloon-safari',
  title: '3 Day Serengeti Hot Air Balloon Safari 2026–2027',
  duration: 3,
  duration_label: '3 Days / 2 Nights',
  destination: 'Central Serengeti',
  difficulty: 'Midrange Safari',
  activity: 'Wildlife Safari',
  style: 'wildlife',
  featured: false,
  display_order: 10,
  price: 1900,
  price_from: 1900,
  currency: 'USD',
  best_season: 'Year-round; balloon flights subject to weather',
  minimum_people: 2,
  hero_image: hero(IMG.serengeti, 'Central Serengeti balloon safari'),
  gallery: [hero(IMG.packages, 'Serengeti sunrise'), hero(IMG.savanna, 'Serengeti plains')],
  short_description:
    'A 3-day Central Serengeti safari with a sunrise hot air balloon flight and champagne bush breakfast — USD 1,900 per person.',
  description:
    'One of Africa’s most exclusive short safaris: classic game drives plus a sunrise hot air balloon flight over the Serengeti. Designed for travellers seeking a premium, compact wildlife experience in Central Serengeti, with a champagne bush breakfast after landing.',
  highlights: [
    'Sunrise hot air balloon flight over Serengeti plains',
    'Champagne bush breakfast after landing',
    'Central Serengeti game drives with high wildlife concentration',
    'Professional English-speaking safari guide',
    'Private 4×4 safari vehicle with pop-up roof',
    'Big Five wildlife viewing opportunities',
  ],
  accommodation: 'Comfortable tented camp or lodge in Central Serengeti for two nights.',
  transport_information: 'Private 4×4 from Arusha through the Ngorongoro Conservation Area into Serengeti National Park, returning to Arusha.',
  inclusions: [
    'Hot air balloon safari experience over Serengeti',
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All park entry and conservation fees',
    'Full-board accommodation during safari',
    'Champagne bush breakfast after balloon flight',
    'Bottled drinking water during game drives',
    'All scheduled game drives as per itinerary',
  ],
  exclusions: [
    'International flights and visa fees',
    'Travel and medical insurance',
    'Alcoholic beverages and personal drinks',
    'Tips for guide and camp staff',
    'Personal expenses and souvenirs',
    'Optional activities not listed in the itinerary',
  ],
  itinerary: [
    day(
      1,
      'Arrival & Central Serengeti Exploration',
      'Early departure from Arusha through the Ngorongoro Conservation Area into Serengeti National Park. Afternoon game drive in Central Serengeti for lions, elephants, giraffes, zebras, and antelope. Dinner at camp.',
      {
        image: IMG.serengeti,
        accommodation: 'Comfortable tented camp or lodge in Central Serengeti',
        meals: 'Lunch, dinner',
      }
    ),
    day(
      2,
      'Sunrise Balloon Safari & Full Game Drive',
      'Before sunrise, transfer to the balloon launch site. Drift above the plains as the sun rises, then enjoy a champagne bush breakfast. Full game drive across Central Serengeti tracking wildlife seen from the air.',
      {
        image: IMG.packages,
        accommodation: 'Central Serengeti lodge or tented camp',
        meals: 'Breakfast, lunch, dinner',
        viewing: '1-hour sunrise balloon flight plus full-day game drive',
      }
    ),
    day(
      3,
      'Final Game Drive & Return to Arusha',
      'Early morning game drive while wildlife is most active, then breakfast and the journey back to Arusha with scenic stops. Afternoon hotel or airport drop-off.',
      { image: IMG.arusha, accommodation: 'Departure day — return to Arusha', meals: 'Breakfast, lunch' }
    ),
  ],
};

const honeymoonSeven = {
  slug: '7-day-ndutu-zanzibar-honeymoon-safari',
  title: '7 Days Ndutu & Zanzibar Honeymoon Safari 2026–2027',
  duration: 7,
  duration_label: '7 Days / 6 Nights',
  destination: 'Arusha · Tarangire · Ndutu · Ngorongoro · Zanzibar',
  difficulty: 'Honeymoon Safari',
  activity: 'Honeymoon Safari',
  style: 'honeymoon',
  featured: true,
  display_order: 11,
  price: 3200,
  price_from: 3200,
  currency: 'USD',
  best_season: 'December–April for Ndutu calving',
  minimum_people: 2,
  hero_image: hero(IMG.zanzibar, 'Zanzibar honeymoon after Ndutu safari'),
  gallery: [
    hero(IMG.tarangire, 'Tarangire'),
    hero(IMG.migration, 'Ndutu calving plains'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
    hero(IMG.zanzibar, 'Zanzibar beach'),
  ],
  short_description:
    'A 7-day honeymoon: private safari through Tarangire, Ndutu calving season, Ngorongoro Crater, then Zanzibar beaches — USD 3,200 per person.',
  description:
    'The perfect blend of wilderness and tropical romance. This 7-day honeymoon combines private safari days in Tarangire, the Ndutu region during Great Migration calving season (December–April), and Ngorongoro Crater with a domestic flight to Zanzibar for beachfront nights, private dining, and couple-focused activities.',
  highlights: [
    'Private safari across Tarangire, Ndutu, and Ngorongoro Crater',
    'Great Migration calving season (December–April)',
    'Exclusive game drives in a private 4×4',
    'Midrange honeymoon lodges, tented camps, and beachfront resorts',
    'Domestic flight from the safari region to Zanzibar',
    'Romantic beach relaxation on the Indian Ocean',
    'Private dining, sunset experiences, and couple-focused activities',
  ],
  accommodation:
    'Midrange hotel in Arusha, lodge near Tarangire, tented camp in Ndutu, then a midrange beach resort in Zanzibar — confirmed to your dates.',
  transport_information: 'Private 4×4 safari vehicle with professional guide; domestic flight from the safari region to Zanzibar.',
  inclusions: [
    'Private 4×4 safari vehicle with professional guide',
    'All national park and conservation fees',
    'Full-board accommodation during safari',
    'Domestic flight from safari region to Zanzibar',
    'Daily meals as specified',
    'Bottled drinking water during safari',
    'Private honeymoon arrangements and romantic setups',
  ],
  exclusions: [
    'International flights and visa fees',
    'Travel and medical insurance',
    'Alcoholic beverages and personal drinks',
    'Tips for guides and hotel staff',
    'Optional activities not listed in itinerary',
    'Personal expenses and souvenirs',
  ],
  itinerary: [
    day(
      1,
      'Romantic Arrival & Arusha Stay',
      'Arrive at Kilimanjaro International Airport for a private transfer to your Arusha hotel. Evening welcome setup and a private candlelit dinner.',
      { image: IMG.arusha, accommodation: 'Midrange hotel in Arusha', meals: 'Dinner' }
    ),
    day(
      2,
      'Tarangire National Park – Private Safari Experience',
      'Private game drive in Tarangire among elephant herds and baobabs, with a romantic picnic lunch in the wild, then a peaceful evening at your lodge.',
      {
        image: IMG.tarangire,
        accommodation: 'Midrange lodge near Tarangire',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      3,
      'Ndutu Plains – Calving Season Spectacle',
      'Travel to Ndutu, heart of the Great Migration calving season (December to April). Full-day game viewing of wildebeest and zebra on the open plains, with predators close by, and a private bush picnic.',
      {
        image: IMG.migration,
        accommodation: 'Midrange tented camp in Ndutu',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      4,
      'Ndutu – Exclusive Wildlife & Romantic Moments',
      'Flexible private game drives in Ndutu — sunrise viewing, walking where permitted, and a scenic bush lunch. Sundowner and private dinner under the stars.',
      {
        image: IMG.savanna,
        accommodation: 'Midrange tented camp in Ndutu',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      5,
      'Ngorongoro Crater & Flight to Zanzibar',
      'Descend into Ngorongoro Crater for a Big Five game drive including black rhino. Picnic lunch, then transfer to the airstrip for your flight to Zanzibar and a beachfront resort.',
      {
        image: IMG.zanzibar,
        accommodation: 'Midrange hotel in Zanzibar',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      6,
      'Zanzibar – Private Beach Relaxation',
      'A leisure day on the Indian Ocean. Optional couple’s spa, private beach time, or a sunset dhow cruise, with a private romantic dinner on the beach.',
      { image: IMG.zanzibar, accommodation: 'Midrange beach resort in Zanzibar', meals: 'Breakfast, dinner' }
    ),
    day(
      7,
      'Romantic Departure',
      'Breakfast overlooking the ocean, a last beach walk or swim depending on flight time, then transfer to Zanzibar International Airport.',
      { image: IMG.spice, accommodation: 'Departure day', meals: 'Breakfast' }
    ),
  ],
};

const midrangeFive = {
  slug: '5-day-midrange-serengeti-ngorongoro-safari',
  title: '5 Days Mid-Range Safari: Serengeti & Ngorongoro Crater 2026–2027',
  duration: 5,
  duration_label: '5 Days / 4 Nights',
  destination: 'Serengeti · Ngorongoro',
  difficulty: 'Midrange Safari',
  activity: 'Wildlife Safari',
  style: 'wildlife',
  featured: false,
  display_order: 12,
  price: 2050,
  price_from: 2050,
  currency: 'USD',
  best_season: 'Year-round; Great Migration seasonal',
  minimum_people: 2,
  hero_image: hero(IMG.ngorongoro, 'Ngorongoro Crater on a midrange safari'),
  gallery: [
    hero(IMG.serengeti, 'Serengeti plains'),
    hero(IMG.savanna, 'Big cat country'),
    hero(IMG.ngorongoro, 'Ngorongoro Crater'),
  ],
  short_description:
    'A 5-day midrange safari through Serengeti National Park and Ngorongoro Crater — from USD 2,050 per person.',
  description:
    'An authentic 5-day mid-range safari through Tanzania’s most iconic wildlife destinations: the endless Serengeti plains, famous for the Great Migration and big cats, and Ngorongoro Crater, a UNESCO World Heritage Site and one of Africa’s densest wildlife habitats. Comfortable 4×4 vehicles, an experienced Big Five guide, and carefully selected mid-range lodges and tented camps.',
  highlights: [
    'Serengeti National Park Big Five & Great Migration (seasonal)',
    'Ngorongoro Crater black rhino and dense wildlife',
    'Private or small-group safari experience',
    'Professional English-speaking safari guide',
    'Mid-range lodges and tented camps',
    'Full-board meals throughout safari',
  ],
  accommodation:
    'Mid-range lodge or tented camp in the Serengeti for three nights, then a mid-range lodge on or near the Ngorongoro Crater rim.',
  transport_information: 'Private 4×4 safari vehicle with pop-up roof from Arusha, returning to Arusha.',
  inclusions: [
    'Full-board accommodation (mid-range lodges and tented camps)',
    'Private 4×4 safari vehicle with pop-up roof',
    'Professional English-speaking safari guide',
    'All park entry and conservation fees',
    'Daily meals as per itinerary',
    'Bottled drinking water during game drives',
    'Transport and driver-guide services throughout safari',
  ],
  exclusions: [
    'International flights and visa fees',
    'Travel and medical insurance',
    'Alcoholic and soft drinks',
    'Personal expenses and souvenirs',
    'Tips for driver-guide and lodge staff',
    'Optional activities not mentioned',
  ],
  itinerary: [
    day(
      1,
      'Arusha to Serengeti National Park',
      'Depart Arusha after breakfast through the Ngorongoro highlands. Picnic lunch en route, then an afternoon game drive as you enter the Serengeti — elephants, giraffes, zebras, and possibly lions. Dinner at your mid-range camp.',
      {
        image: IMG.serengeti,
        accommodation: 'Mid-range lodge or tented camp in Serengeti',
        meals: 'Lunch, dinner',
      }
    ),
    day(
      2,
      'Full Day Serengeti Game Drive',
      'Full day across the Serengeti tracking lions, leopards, and cheetahs, with seasonal Great Migration herds. Picnic lunch in the bush, then evening at camp.',
      {
        image: IMG.savanna,
        accommodation: 'Serengeti mid-range lodge or tented camp',
        meals: 'Breakfast, lunch, dinner',
        viewing: 'Full-day game drive',
      }
    ),
    day(
      3,
      'Serengeti Exploration',
      'A second full day in Serengeti for deeper exploration — Seronera Valley and other wildlife-rich zones depending on seasonal movement. Morning and afternoon drives for photography.',
      {
        image: IMG.migration,
        accommodation: 'Serengeti mid-range lodge or tented camp',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      4,
      'Serengeti to Ngorongoro Conservation Area',
      'Morning game drive in the Serengeti, then transfer to the Ngorongoro Conservation Area. Afternoon at a crater-rim lodge with panoramic views, preparing for the crater safari.',
      {
        image: IMG.ngorongoro,
        accommodation: 'Mid-range lodge on or near Ngorongoro Crater rim',
        meals: 'Breakfast, lunch, dinner',
      }
    ),
    day(
      5,
      'Ngorongoro Crater Safari & Return to Arusha',
      'Early descent into Ngorongoro Crater for a half-day game drive: lions, elephants, buffalo, black rhino, hippos, and flamingos. After lunch, ascend and return to Arusha.',
      { image: IMG.ngorongoroTourists, accommodation: 'Departure day — return to Arusha', meals: 'Breakfast, lunch' }
    ),
  ],
};

export const PDF_PACKAGES = [
  luxuryEight,
  luxuryFour,
  luxuryMigrationFive,
  luxurySeven,
  luxuryBalloonFour,
  luxuryRiverSix,
  midrangeFour,
  midrangeMigrationFive,
  familySix,
  midrangeBalloonThree,
  honeymoonSeven,
  midrangeFive,
].map((item) => ({
  ...item,
  seo: seo(item),
}));

export const PDF_PACKAGE_SLUGS = new Set(PDF_PACKAGES.map((item) => item.slug));

export function toSafariDocument(item) {
  const description = item.description || '';
  return {
    ...emptySafariDocument(),
    ...item,
    short_description: item.short_description || description,
    price: item.price ?? item.price_from ?? null,
    price_from: item.price_from ?? item.price ?? null,
    currency: item.currency || 'USD',
    seo: {
      ...seo(item),
      ...item.seo,
    },
  };
}

export function toWebsiteTrip(pkg) {
  return {
    slug: pkg.slug,
    sourceSlug: pkg.slug,
    title: pkg.title,
    duration: pkg.duration_label,
    activity: pkg.activity || pkg.difficulty,
    places: pkg.destination,
    image: pkg.hero_image?.url || '',
    style: pkg.style || 'wildlife',
    featured: Boolean(pkg.featured),
    price_from: pkg.price_from ?? pkg.price,
    currency: pkg.currency || 'USD',
    minimum_people: pkg.minimum_people ?? 2,
    overview: pkg.short_description || pkg.description,
    highlights: pkg.highlights || [],
    included: pkg.inclusions || [],
    excluded: pkg.exclusions || [],
    itinerary: (pkg.itinerary || []).map((entry) => ({
      day: entry.day,
      title: entry.title,
      body: entry.description,
      stay: entry.accommodation,
      meals: entry.meals,
      image: entry.image,
      viewing: entry.viewing,
    })),
  };
}
