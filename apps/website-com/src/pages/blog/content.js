import { media as GM } from '../home/content.js';
import { destinationSlugsFromCopy } from '../destinations/catalog.js';
import { rewrittenJournalArticles } from './rewritten-journal.js';
import { zaraInspiredJournalArticles } from './zara-inspired-journal.js';

export const blogIntro = {
  title: 'Golden Memories Safaris Blog',
  body: 'Here you will find practical articles about Kilimanjaro expeditions, Tanzanian wildlife safaris, Zanzibar and the coast, plus notes on Tanzania’s history, culture, and the locally owned Arusha team behind Golden Memories Safaris.',
};

export const blogTopics = [
  {
    slug: 'climbing',
    name: 'Climbing',
    blurb: 'Kilimanjaro routes, training, and summit-day advice.',
    image: GM.kilimanjaro,
  },
  {
    slug: 'safari',
    name: 'Safari',
    blurb: 'Parks, seasons, packing, and how a game-drive day actually feels.',
    image: GM.northern,
  },
  {
    slug: 'about-us',
    name: 'About Us',
    blurb: 'The Arusha crew, guiding style, and how we plan trips.',
    image: GM.ngorongoroTourists,
  },
  {
    slug: 'about-tanzania',
    name: 'About Tanzania',
    blurb: 'Visas, weather, and getting around before the safari starts.',
    image: GM.savanna,
  },
  {
    slug: 'islands',
    name: 'Islands',
    blurb: 'Zanzibar beaches, Stone Town, and spice-island days after the dust.',
    image: GM.zanzibarBeach,
  },
  {
    slug: 'wildlife',
    name: 'Wildlife',
    blurb: 'Big Five, migration, and the animals you meet on the mountain.',
    image: GM.migration,
  },
  {
    slug: 'itineraries',
    name: 'Itineraries',
    blurb: 'Day-by-day safari outlines, route notes, and how we pace a northern-circuit trip.',
    image: GM.savanna,
  },
];

/**
 * Original journal copy. Used only to seed the CMS on a fresh database —
 * the public site never shows these directly.
 */
export const seedBlogArticles = [
  {
    slug: 'best-time-to-climb-kilimanjaro',
    topic: 'climbing',
    featured: true,
    date: '12 August 2026',
    title: 'When is the best time to climb Kilimanjaro?',
    excerpt: 'Dry months, shoulder seasons, and what rain actually does to the trail.',
    image: GM.kilimanjaro,
    paragraphs: [
      'Most climbers aim for January to early March or June to October. Those windows are drier on the lower slopes, with clearer summit views and more stable trail conditions.',
      'April, May, and November bring heavier rain in the forest. The mountain is still climbable, but paths are muddier, views come and go, and you will want serious waterproofs. Some guests prefer these months for quieter camps.',
      'December can be warm and busy around the holidays. Summit night is cold in every season, pack for that regardless of the month you choose.',
      'If you are pairing the trek with a northern safari, June to October also lines up with classic dry-season game viewing. Share your dates and we will say whether to trek first or safari first.',
    ],
  },
  {
    slug: 'how-to-choose-a-kilimanjaro-route',
    topic: 'climbing',
    date: '4 August 2026',
    title: 'How to choose a Kilimanjaro route',
    excerpt: 'Marangu huts, Machame scenery, and when a quieter western start is worth the extra day.',
    image: GM.machame,
    paragraphs: [
      'There is no single “best” route. The right trail depends on how many days you have, whether you want huts or tents, and how much solitude you want in the first days.',
      'Marangu is the hut route: a steadier gradient and a bunk each night. Machame is camping, with the Shira Plateau and Barranco Wall, and a strong acclimatisation profile on seven days.',
      'Lemosho and the Londorossi start add quieter forest at the beginning. Rongai approaches from the north and stays drier when the south is wet. Umbwe is steep and better for experienced walkers.',
      'As a rule, more days beat a shorter itinerary. Extra nights on the mountain are the most reliable way to arrive at Uhuru Peak feeling well. We walk this through with you before we book park fees.',
    ],
  },
  {
    slug: 'how-to-prepare-for-kilimanjaro',
    topic: 'climbing',
    date: '22 July 2026',
    title: 'How to prepare for a Kilimanjaro climb',
    excerpt: 'Fitness, gear, and the slow pace that gets more people to the crater rim.',
    image: GM.machame,
    paragraphs: [
      'Kilimanjaro is a long walk at altitude, not a technical climb. The work is in your legs, lungs, and patience. Start hill walking, stairs, or loaded day hikes at least eight to twelve weeks out.',
      'Broken-in boots, layered clothing, and a sleeping system rated for well below freezing on summit night matter more than brand-new kit. We send a packing list and can arrange hire in Arusha or Moshi.',
      'On the trail the mantra is pole pole, slowly. Groups that rush the first days pay for it later. Drink more water than you think you need, eat even when appetite drops, and tell your guide how you feel.',
      'Travel insurance should cover trekking to 6,000 metres. We also brief you on Diamox, summit-night pacing, and when turning around is the right call.',
    ],
  },
  {
    slug: 'kilimanjaro-packing-list',
    topic: 'climbing',
    date: '9 July 2026',
    title: 'A practical Kilimanjaro packing list',
    excerpt: 'What goes on your back, what the porters carry, and what you can hire in town.',
    image: GM.materuni,
    paragraphs: [
      'You carry a daypack: water, layers, snacks, camera, and rain cover. Porters take the duffel with your sleeping bag, spare clothes, and the rest of camp life, keep that bag within the weight limit we confirm before the gate.',
      'Essentials: waterproof jacket and trousers, insulating mid-layer, warm hat and gloves for summit night, sun hat, sunglasses, headlamp, and trekking poles. Softshell or fleece for wind on the crater rim.',
      'Leave cotton for town. Quick-dry shirts, two or three trekking trousers, and enough socks to finish the week with dry feet. A small personal first-aid kit sits alongside the crew’s medical bag.',
      'We check kit the evening before the climb. If something is missing, Moshi and Arusha hire shops usually have it. Do not buy a brand-new boot the night before the gate.',
    ],
  },
  {
    slug: 'best-time-for-a-tanzania-safari',
    topic: 'safari',
    date: '18 August 2026',
    title: 'When is the best time for a Tanzania safari?',
    excerpt: 'Dry-season game drives, calving on the southern plains, and river crossings in the north.',
    image: GM.northern,
    paragraphs: [
      'June to October is the classic dry season: grass is shorter, animals gather around water, and the northern circuit is at its most reliable for game viewing.',
      'January to March is calving time on the southern Serengeti and Ndutu plains, short grass, predators, and newborn wildebeest. It is a different safari from a July river crossing, not a lesser one.',
      'April and May are greener and quieter, with more rain and some camps closing. Birdlife is excellent. If you like space on the road and can live with the odd storm, it can be a thoughtful time to travel.',
      'There is no single month that is “best” for every park. We match Tarangire, Serengeti, Ngorongoro, or the south to the dates you actually have.',
    ],
  },
  {
    slug: 'the-great-migration-explained',
    topic: 'safari',
    date: '1 August 2026',
    title: 'The Great Migration, explained simply',
    excerpt: 'Where the herds are through the year, and why we never promise a crossing on a fixed day.',
    image: GM.migration,
    paragraphs: [
      'A million-plus wildebeest, plus zebra and gazelle, move with the rain around the Serengeti–Mara ecosystem. It is a cycle, not a single event, and the front of the herd is not always where last year’s map said it would be.',
      'Calving is typically December to March in the south. The long trek north builds through the western corridor in the middle of the year. River crossings on the Mara usually peak between July and October, weather and the herds decide the exact week.',
      'A good migration safari is about extra nights in the right sector, not a two-hour appointment at a riverbank. We place camps where the animals are using current reports, then stay flexible on the game-drive plan.',
      'If your dates miss the crossing, you still have Serengeti: resident cats, elephant, and the open grassland that makes the park famous. We will be honest about what the season can and cannot show you.',
    ],
  },
  {
    slug: 'what-to-pack-for-a-tanzania-safari',
    topic: 'safari',
    date: '15 July 2026',
    title: 'What to pack for a Tanzania safari',
    excerpt: 'Neutral clothes, a warm dawn layer, and the small things that make a 4x4 day easier.',
    image: GM.tarangire,
    paragraphs: [
      'Pack light, muted colours. Early game drives are cold in the crater highlands; afternoons can be hot and dusty. A fleece or light down jacket earns its place even in the dry season.',
      'Closed shoes for the vehicle, a sun hat, sunglasses, high-SPF sunscreen, and binoculars. A camera with a spare battery, charging is available at lodges, but not always between drives.',
      'Malaria prophylaxis is a conversation with your doctor. We recommend travel insurance, any personal medication in original packaging, and a small kit for blisters and stomach upsets.',
      'Leave drones at home unless you have park permission. Soft bags beat hard suitcases on light aircraft. We send a full list with your confirmation.',
    ],
  },
  {
    slug: 'local-guides-from-arusha',
    topic: 'about-us',
    date: '28 June 2026',
    title: 'Why we guide from Arusha',
    excerpt: 'A locally owned company, park-wise driver-guides, and itineraries that are not copy-pasted.',
    image: GM.ngorongoroTourists,
    paragraphs: [
      'Golden Memories Safaris is based in Njiro, Arusha, close to Kilimanjaro Airport, the northern parks, and the mountain trailheads. We are a Tanzanian team, not a foreign desk booking a local operator at the last minute.',
      'Your driver-guide is the person you will spend the most time with. We choose people who know the roads, the animals, and when to wait at a kopje instead of racing the next gate.',
      'Safari and trek plans are built around your dates, not a brochure that never changes. If you want a slower crater day, a migration focus, or a Kilimanjaro route with an extra night, we say so in the itinerary before you pay a deposit.',
      'Read more about the company on our About page, or write to us with the month you want to travel.',
    ],
  },
  {
    slug: 'tanzania-visa-guide',
    topic: 'about-tanzania',
    date: '20 August 2026',
    title: 'Tanzania visa guide',
    excerpt: 'eVisa, arrival visas, and the documents we ask you to keep with your passport.',
    image: GM.savanna,
    paragraphs: [
      'Most visitors need a visa for Tanzania. Many nationalities can apply online for an eVisa before travel, or arrange a visa on arrival at Kilimanjaro International Airport and other main entry points. Rules change, check the official immigration site for your passport.',
      'Have a passport valid for at least six months, a return or onward ticket, and proof of where you are staying. Yellow fever certificates are required if you are arriving from a country with risk of transmission.',
      'We are a tour operator, not an embassy. We share current joining notes with your itinerary, but you are responsible for entering the country legally. Start the visa process early in high season.',
      'If you are combining Zanzibar with the mainland, you are still in the United Republic of Tanzania, you do not need a second visa for the island. Keep your entry stamp handy for domestic flights.',
    ],
  },
  {
    slug: 'tanzania-weather-guide',
    topic: 'about-tanzania',
    date: '6 July 2026',
    title: 'Tanzania weather guide',
    excerpt: 'Long rains, short rains, and why the crater rim can freeze in a “warm” month.',
    image: GM.ngorongoro,
    paragraphs: [
      'Tanzania sits just south of the equator. Seasons are more about rain than about snow, except on Kilimanjaro. The long rains usually fall around March to May; shorter rains often arrive in November.',
      'The northern parks are generally driest from June to October. Days are warm, nights can be cold at Ngorongoro, and the light is excellent for photography. January and February are often clear and warm on the southern Serengeti plains.',
      'The coast is humid year-round. Zanzibar has its own rain pattern; beach days are still possible in green months, with the odd tropical shower.',
      'Pack layers, not a single “safari outfit.” We design days around weather as well as wildlife, an early start on the crater floor, shade at midday, and a warm jacket for the drive back to the rim.',
    ],
  },
  {
    slug: 'things-to-do-in-zanzibar',
    topic: 'islands',
    date: '11 August 2026',
    title: 'Things to do in Zanzibar after a safari',
    excerpt: 'Stone Town, spices, and a few slow beach days when the game drives are done.',
    image: GM.zanzibarBeach,
    paragraphs: [
      'Zanzibar is the classic exhale after Serengeti dust. Fly from Arusha or Kilimanjaro to Unguja, transfer to a beach lodge, and let the tide set the pace.',
      'Stone Town is carved doors, waterfront lanes, and a history of trade that still shows in the architecture. A spice farm visit explains why cloves, nutmeg, and cinnamon still matter here.',
      'Beyond the main beaches: a dhow snorkel, Prison Island’s giant tortoises, or a simple day of swimming. If you want wildlife again, a short safari from Zanzibar to Tarangire and Ngorongoro is possible.',
      'We book beach nights as part of a through-itinerary so you are not stitching flights together at midnight. Tell us how many idle days you want, two is a taste, five is a holiday.',
    ],
  },
  {
    slug: 'the-big-five-in-tanzania',
    topic: 'wildlife',
    date: '25 July 2026',
    title: 'The Big Five in Tanzania',
    excerpt: 'Where lion, leopard, elephant, buffalo, and rhino are realistically seen on a northern circuit.',
    image: GM.ngorongoro,
    paragraphs: [
      'The Big Five, lion, leopard, elephant, buffalo, and rhino, is a hunting-era list, not a scorecard. You can have an outstanding safari without ticking every name, and a rushed safari that ticks them and misses everything else.',
      'Ngorongoro Crater is one of the more reliable places in Tanzania to look for black rhino, along with dense concentrations of lion, buffalo, and elephant. Leopard is always a gift: more often Serengeti or Tarangire woodland than a guarantee.',
      'Tarangire is elephant country in the dry season. The Serengeti holds the cats and the great herds. We plan game drives for habitat, not for a posed list.',
      'If seeing rhino or leopard is especially important, say so. We will be honest about odds and put you in the parks and seasons that help, without pretending wildlife keeps appointments.',
    ],
  },
  {
    slug: 'wildlife-on-kilimanjaro',
    topic: 'wildlife',
    date: '30 June 2026',
    title: 'Wildlife on Mount Kilimanjaro',
    excerpt: 'Colobus in the forest, ravens at the huts, and why the high camps feel empty.',
    image: GM.kilimanjaro,
    paragraphs: [
      'Kilimanjaro is a trek through climate zones. The forest belt still holds colobus and blue monkeys, duiker, and a lot of birdlife. You hear more than you see once the trail steepens.',
      'Moorland brings giant senecios and lobelias. Above that, the alpine desert is sparse: the odd skink, a raven at camp, and very little else. Summit night is about rock, ice, and headlamps, not animals.',
      'That contrast is part of the story. Guests who safari after the climb often say the plains feel even more alive. Those who climb after a safari notice how quiet the mountain is.',
      'Mount Meru, inside Arusha National Park, is the trek where wildlife and walking really mix, giraffe and buffalo on the lower trail, then a sharp crater rim. It is a serious peak in its own right.',
    ],
  },
  {
    slug: 'serengeti-or-ngorongoro',
    topic: 'safari',
    date: '8 September 2026',
    title: 'Serengeti or Ngorongoro, how we choose',
    excerpt: 'Open plains versus a crater floor: both belong on most northern itineraries, for different reasons.',
    image: GM.ngorongoro,
    paragraphs: [
      'The Serengeti is scale: kopjes, riverine woodland, and enough country that camp location matters more than the park name on the permit. Ngorongoro is concentration, a caldera you descend into, with a full-day crater drive and a highland night on the rim.',
      'We almost never treat them as either/or. A classic circuit uses both: Serengeti nights for cats and space, then a crater day that often produces rhino, dense lion, and a picnic that guests remember for years.',
      'If time is short, two Serengeti nights and one crater day still work. If you only have a day from Arusha, the crater is the stronger single hit. If migration is the priority, we add Serengeti nights in the right sector and keep Ngorongoro as the bookend.',
      'Tell us the month and how many nights you have. We will say which park should get the extra night, not a generic “do both” that ignores the calendar.',
    ],
  },
  {
    slug: 'how-many-days-for-a-northern-circuit-safari',
    topic: 'safari',
    date: '2 September 2026',
    title: 'How many days for a northern circuit safari?',
    excerpt: 'Four days is a taste. Six to eight is the shape we recommend when Tarangire, Serengeti, and the crater all matter.',
    image: GM.savanna,
    paragraphs: [
      'A four-day private safari from Arusha can cover Tarangire and Ngorongoro with a night in between. It is a real safari, not a sample day, but you will feel the road.',
      'Six days lets Serengeti in: two nights on the plains, a crater day, and Tarangire without rushing every gate. Eight days is when we stop arguing with the clock, extra game-drive mornings, a slower transfer, or a second Serengeti sector.',
      'Families and first-timers usually thank us for the sixth night. Photographers and migration travellers often want eight or more, plus a flight between airstrips if the herds are far north.',
      'We would rather cut a park than squeeze three parks into three days. Share your dates; we will draw the shortest itinerary that still feels like Tanzania.',
    ],
  },
  {
    slug: 'flying-or-driving-between-tanzania-parks',
    topic: 'safari',
    date: '26 August 2026',
    title: 'Flying or driving between Tanzania parks',
    excerpt: 'When a scheduled hop saves a safari day, and when the road is part of the story.',
    image: GM.northern,
    paragraphs: [
      'The northern circuit is built for vehicles: Arusha to Tarangire, across to Serengeti, up to the crater rim. Those drives are game-viewing time, not dead hours, if we time the gates well.',
      'Flying makes sense when the Serengeti camp is in the far north or west, or when you are coming from Zanzibar and cannot spare two road days. A short hop to Seronera or Kogatende can replace a long transfer.',
      'Light aircraft have tight bag limits. Soft duffels, not hard cases. We put the weight rules in the joining notes so nobody is surprised at the airstrip.',
      'A mixed plan is common: drive the classic parks, fly one leg to protect a game-drive morning. We price both so you can choose with the map in front of you.',
    ],
  },
  {
    slug: 'tanzania-safari-with-children',
    topic: 'safari',
    date: '21 August 2026',
    title: 'Tanzania safari with children',
    excerpt: 'Ages, pacing, crater rules, and the lodges that still feel like a family trip.',
    image: GM.ngorongoroTourists,
    paragraphs: [
      'A private vehicle is the difference for families. You stop when someone needs a biscuit, a bathroom, or five quiet minutes with elephants instead of the next sighting.',
      'Some crater and camp rules set a minimum age. We check that before we book, and we pick lodges with family rooms or connecting tents rather than hoping a twin will do.',
      'Short game drives, a midday swim or rest, and an afternoon loop beat a heroic dawn-to-dusk schedule. Teenagers who want migration often handle longer Serengeti days; younger children usually prefer Tarangire and a single crater descent.',
      'We brief guides on allergies, naps, and how much wildlife commentary you want. The aim is a trip the adults remember fondly, not a test of endurance.',
    ],
  },
  {
    slug: 'after-kilimanjaro-what-comes-next',
    topic: 'climbing',
    date: '16 August 2026',
    title: 'After Kilimanjaro: rest, safari, or the coast',
    excerpt: 'Give the knees a night in town, then choose plains or ocean, not both on the same afternoon.',
    image: GM.kilimanjaro,
    paragraphs: [
      'Summit night empties people. We plan a hotel night in Moshi or Arusha after the descent: a shower, a real bed, and a meal that is not freeze-dried.',
      'A safari after the climb works if you leave a buffer. One rest night, then Tarangire or the crater, is kinder than a 5 a.m. game drive the morning you come off the mountain.',
      'Zanzibar is the other classic finish: fly to the island and let salt water do the recovery. Combining a hard trek, a full northern circuit, and a beach week in one tight itinerary is how trips feel rushed.',
      'Tell us whether the mountain or the wildlife is the headline. We will order the chapters so the last day still feels like a holiday.',
    ],
  },
  {
    slug: 'nungwi-or-the-east-coast-zanzibar',
    topic: 'islands',
    date: '10 August 2026',
    title: 'Nungwi or the east coast: choosing a Zanzibar beach',
    excerpt: 'Swimmable water in the north, tidal flats in the east, and why Stone Town still deserves a night.',
    image: GM.zanzibarBeach,
    paragraphs: [
      'Nungwi and Kendwa sit on the north-west: fewer extreme tides, more all-day swimming, and a livelier evening scene. East-coast beaches are quieter, with long low-tide walks and seaweed farms in the shallows.',
      'Neither is wrong. Couples who want to float after safari usually prefer the north. Guests who like space, kitesurf, or a slower village feel often take the east.',
      'Stone Town is not a beach. It is one or two nights of doors, rooftops, and spice history before you transfer. Skipping it to go straight to a resort is fine if rest is the only goal.',
      'We book the beach as the last chapter so you are not reverse-commuting through Unguja with dusty bags. Say how many idle days you want, and whether swimming at all tides matters.',
    ],
  },
  ...rewrittenJournalArticles,
  ...zaraInspiredJournalArticles,
];

for (const article of seedBlogArticles) {
  if (article.destination_slugs?.length) continue;
  article.destination_slugs = destinationSlugsFromCopy(
    `${article.title || ''} ${article.excerpt || ''} ${article.slug || ''} ${(article.paragraphs || []).join(' ')}`
  );
}

/**
 * Articles shown on the website: filled only from posts PUBLISHED in the CMS
 * (see services/cms/overlay.js). Unpublished or draft posts never appear.
 */
export const blogArticles = [];

export function topicBySlug(slug) {
  return blogTopics.find((topic) => topic.slug === slug) || null;
}

export function articleBySlug(slug) {
  return blogArticles.find((article) => article.slug === slug) || null;
}

export function articlesForTopic(topicSlug) {
  return blogArticles.filter((article) => article.topic === topicSlug);
}

export function topicLabel(slug) {
  return topicBySlug(slug)?.name || slug;
}

export function relatedArticles(article, count = 3) {
  const same = blogArticles.filter((item) => item.topic === article.topic && item.slug !== article.slug);
  const rest = blogArticles.filter((item) => item.topic !== article.topic && item.slug !== article.slug);
  return [...same, ...rest].slice(0, count);
}

export function allBlogSlugs() {
  return [...blogTopics.map((topic) => topic.slug), ...blogArticles.map((article) => article.slug)];
}

const MONTHS = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export function articleStamp(article) {
  const match = String(article?.date || '').match(/^(\d+) (\w+) (\d+)$/);
  if (!match) return Date.parse(article?.date || '') || 0;
  return Date.UTC(Number(match[3]), MONTHS[match[2]] ?? 0, Number(match[1]));
}

export function sortedArticles() {
  return [...blogArticles].sort((a, b) => articleStamp(b) - articleStamp(a));
}

export function featuredArticle() {
  return blogArticles.find((item) => item.featured) || sortedArticles()[0] || null;
}
