import { galleryPhoto, assignUniqueCovers } from '../../media/gallery.js';
import { media as GM } from '../home/content.js';
import { allTours } from '../tours/catalog.js';
import { lodges } from '../accommodations/content.js';

/**
 * Park / place detail records. Facts distilled from Tanzania Odyssey park pages
 * and rewritten in Golden Memories Safaris voice (structure unchanged).
 */
export const destinationPlaces = [
  {
    slug: 'serengeti',
    name: 'Serengeti National Park',
    kicker: 'Africa’s most famous plains',
    tagline: 'Endless grassland, the Great Migration, and the highest predator densities in Africa',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Book your Serengeti safari',
    image: GM.northern,
    gallery: [GM.northern, GM.migration, GM.savanna],
    match: ['serengeti', 'migration'],
    paragraphs: [
      'The Serengeti National Park is Africa’s best-known safari country: a UNESCO World Heritage landscape of open grassland that still outruns its reputation. The Maasai name Siringet, the place where the land runs on forever, describes the southern short-grass plains, but the park itself is far larger. Kopjes break the north, acacia dotted plains run south, and the Seronera river system keeps water and game in the centre all year. Golden Memories Safaris plans Serengeti nights from Arusha so you sit in the right sector for your dates, not a random lodge that happens to be on the map.',
      'The Great Migration is the headline: up to two million wildebeest, around 200,000 zebra, and hundreds of thousands of Thomson’s, Grant’s and impala gazelle moving with the rains. Predator viewing is exceptional, several thousand lion, plus leopard, cheetah and hyena in numbers few parks can match. Topi, eland, hartebeest, buffalo, elephant, giraffe, jackal, mongoose, crocodile and more than 500 bird species share the same country. The herds are in the Serengeti all year; the question is which corner of the park holds them when you travel.',
      'Four regions matter. Central Seronera is the year-round heart: river valleys, dense resident game, and the migration passing north from mid-April to late June and south again in November–December. The Western Corridor follows the Grumeti toward Lake Victoria, May to mid-July is when herds cross crocodile water. The far north (Lobo, Kogatende, Lamai) is quieter and harder to reach; July to October it holds the Mara River crossings and some of the only walking allowed inside the park. The southern plains, including Ndutu, fill from December through March or April; February is calving, when thousands of wildebeest are born each day for a short, intense window.',
      'A northern circuit from Arusha usually pairs the Serengeti with Ngorongoro, Tarangire and Lake Manyara. Flying between airstrips saves long drives; a private vehicle from Kilimanjaro Airport is the classic overland shape. Night drives are not allowed inside the national park (they are possible in adjoining concessions such as Grumeti and Loliondo). Balloon mornings, Maasai visits in the highlands, and a crater day on the way in or out complete the usual Serengeti journey we build.',
    ],
    highlights: [
      { title: 'Great Migration, year-round', body: 'Herds stay in the Serengeti all year. Calving is February on the southern plains; Mara River crossings run July–October in the north.' },
      { title: 'Predator country', body: 'Among the highest lion, leopard, cheetah and hyena concentrations on the continent, with resident game even when the migration is elsewhere.' },
      { title: 'Four distinct regions', body: 'Seronera for year-round water, Grumeti for May–July crossings, Kogatende for the Mara, Ndutu for calving, location has to match your month.' },
      { title: 'UNESCO wilderness', body: 'A World Heritage ecosystem that still feels bigger than any single game drive, from kopjes in the north to endless grass in the south.' },
    ],
    seasons: [
      { title: 'December–April · southern plains & Ndutu', body: 'Short-grass plains and calving (especially February). Superb predator action on newborn wildebeest. Mobile camps sit here for the season.' },
      { title: 'May–mid-July · Western Corridor & Grumeti', body: 'Herds push west and cross the Grumeti. Fewer vehicles than the Mara, still dramatic river action.' },
      { title: 'July–October · north, Kogatende & Lamai', body: 'Mara River crossings, quieter roads than Kenya’s Masai Mara, and the finest walking inside the park. A long drive or a flight from Seronera.' },
      { title: 'Year-round · Seronera', body: 'River valleys hold water and resident game when the migration is elsewhere. Busier hotels; we often base on the edge so you can dip in and out.' },
    ],
    wildlife: [
      'Great Migration: up to 2 million wildebeest, ~200,000 zebra, and ~350,000 gazelle (Thomson’s, Grant’s, impala).',
      'Predators: roughly 3–4,000 lion, plus leopard, cheetah, hyena, jackal, caracal, serval and bat-eared fox.',
      'Plains and woodland: buffalo, elephant, giraffe, topi, eland, hartebeest, crocodile, monitor lizard, hyrax, genet, porcupine, aardvark and aardwolf.',
      'Primates: baboon, vervet and colobus. Birds: more than 500 species.',
    ],
    activities: [
      { title: 'Daytime game drives', body: 'The core of a Serengeti safari. Night driving is not permitted inside the national park.' },
      { title: 'Hot-air balloon', body: 'Sunrise over the plains, then a bush breakfast, best booked with your camp nights so the launch site matches your sector.' },
      { title: 'Walking (limited)', body: 'Allowed in parts of the far north and at a few southern camps; rules change, so we confirm before we book.' },
      { title: 'Highlands & crater add-on', body: 'Maasai country and a Ngorongoro Crater day sit naturally on the drive or flight from Arusha.' },
    ],
    attractions: ['Great Migration', 'Seronera Valley', 'Grumeti River', 'Mara River crossings', 'Southern short-grass plains', 'Ndutu calving', 'Kopjes of the north'],
    faqs: [
      { q: 'When is the Great Migration in the Serengeti?', a: 'The herds are in the Serengeti all year. February is calving in the south (Ndutu). May–July they cross the Grumeti in the west. July–October they cross the Mara in the north. We place your nights in that sector, not “somewhere in the Serengeti.”' },
      { q: 'Serengeti or Masai Mara?', a: 'They are the same ecosystem, split by the Kenya border. The wildebeest spend most of the year in Tanzania. July–October you can see river crossings from the Serengeti side, usually with fewer vehicles than the Mara.' },
      { q: 'How do I get there?', a: 'Fly from Arusha to Seronera, Kogatende or another seasonal airstrip (the practical choice if you are combining parks), or drive 5–6 hours from Arusha with your Golden Memories guide. International arrivals use Kilimanjaro Airport, about 45 minutes from Arusha.' },
      { q: 'Is the Serengeti only about the migration?', a: 'No. Take the migration away and it is still one of Africa’s finest parks: resident lion, leopard, cheetah plains, and huge grazing herds. We still time camps to the herds if that is your priority.' },
      { q: 'Can I do a night drive?', a: 'Not inside Serengeti National Park. Night drives are offered in adjoining private reserves (for example Grumeti and Loliondo) if we add those nights to the itinerary.' },
    ],
    facts: [
      ['Size', '14,763 sq km (5,700 sq mi)'],
      ['Established', '1951'],
      ['Location', 'Northern Tanzania, contiguous with Kenya’s Masai Mara'],
      ['UNESCO Status', 'World Heritage Site'],
      ['Regions', 'Seronera, Western Corridor, North (Kogatende/Lamai), Southern plains / Ndutu'],
      ['Best Time', 'Year-round; camp location must match the month'],
    ],
    location: 'Northern Tanzania, extending to the Kenya border',
  },
  {
    slug: 'ngorongoro',
    name: 'Ngorongoro Conservation Area',
    kicker: 'World’s largest intact caldera',
    tagline: 'East Africa’s best Big Five day, and a highland home to the Maasai',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Plan your Ngorongoro safari',
    image: GM.ngorongoro,
    gallery: [GM.ngorongoro, GM.ngorongoroTourists, GM.ngorongoroAlt],
    match: ['ngorongoro', 'crater'],
    paragraphs: [
      'The Ngorongoro Crater is one of the most beautiful wildlife settings on earth and, on a good day, the most reliable place in East Africa to see the Big Five. It is the world’s largest intact volcanic caldera: a volcano that exploded and collapsed about three million years ago, leaving a bowl of fertile grazing that now holds Africa’s highest density of large mammals. UNESCO lists the wider Ngorongoro Conservation Area as a World Heritage Site. Golden Memories Safaris treats a crater descent as a full, unhurried day, not a tick-box hour on the way to the Serengeti.',
      'Because the floor is relatively small and famous, it can be busy. We usually plan two nights in the highlands or on the rim so you can reach the gate early, then continue to the Serengeti for quieter, more private game. Wildlife stays in the crater all year, so there is no “wrong” month; higher water in Lake Magadi often means more flamingos. A unique micro-climate keeps the floor productive even when surrounding plains are dry.',
      'You reach Ngorongoro by road from Arusha (share a private vehicle from Kilimanjaro Airport if your party is large enough) or by flying into Lake Manyara airstrip for a camp pickup. Stay on the rim for the view, or twenty minutes away in the Karatu highlands for smaller lodges, walks, and coffee country. You cannot sleep on the crater floor. Inside the caldera, activity is game drives only, with picnic sites the only places you may leave the vehicle. The wider conservation area adds walking, Olduvai Gorge, Empakaai, and Maasai visits.',
      'Black rhino and some of Tanzania’s last big-tusk elephants are the prize sightings. Lion, leopard and hyena are strong; wildebeest, buffalo and zebra fill the short grass; serval, cheetah, jackal, Grant’s and Thomson’s gazelle, bat-eared fox and around 400 bird species complete a packed day. Pair the crater with Serengeti and Tarangire, that is the classic northern circuit we drive from Arusha.',
    ],
    highlights: [
      { title: 'Best Big Five odds in Tanzania', body: 'Black rhino, large-tusk elephant, lion, leopard and buffalo in one volcanic bowl, the highest big-game density in Africa.' },
      { title: 'Two nights, then the Serengeti', body: 'The floor gets busy. An early gate start and a second highland night beat a rushed single descent.' },
      { title: 'Year-round micro-climate', body: 'Resident game does not migrate out. Flamingos on Lake Magadi rise with water levels after rain.' },
      { title: 'Highlands beyond the rim', body: 'Maasai country, Olduvai Gorge, walking and coffee lodges in Karatu when you want a quieter base than the big rim hotels.' },
    ],
    seasons: [
      { title: 'Any month', body: 'Game stays on the floor year-round. Low season can mean fewer vehicles and a more pleasant crater day.' },
      { title: 'After rains · Lake Magadi', body: 'Higher water often concentrates flamingos in the centre of the crater.' },
      { title: 'Dry months (June–October)', body: 'Clear skies, easier roads from Arusha, and the classic northern-circuit weather window.' },
    ],
    wildlife: [
      'Big Five: lion, leopard, elephant, endangered black rhino, Cape buffalo, Ngorongoro is Tanzania’s most consistent Big Five day.',
      'Herds: wildebeest, zebra, buffalo, Grant’s and Thomson’s gazelle, hippo, eland, waterbuck, warthog.',
      'Predators and smaller carnivores: spotted hyena, cheetah, jackal, serval, bat-eared fox.',
      'Birds: about 400 species, including flamingos on Lake Magadi, ostrich and crowned crane.',
    ],
    activities: [
      { title: 'Crater-floor game drive', body: 'A half- or full-day descent. Picnic sites only for leaving the vehicle. We aim for the early gate to stay ahead of traffic.' },
      { title: 'Olduvai Gorge', body: 'The “Cradle of Mankind” on the Serengeti road, a short museum and landscape stop when the itinerary allows.' },
      { title: 'Maasai highlands', body: 'Village visits and walking in the conservation area, not on the crater floor.' },
      { title: 'Empakaai & Olmoti', body: 'Quieter volcanic craters and rim hikes for guests who want more than a single Ngorongoro day.' },
    ],
    attractions: ['Ngorongoro Crater', 'Lake Magadi', 'Olduvai Gorge', 'Empakaai Crater', 'Olmoti Crater', 'Karatu highlands', 'Maasai villages'],
    faqs: [
      { q: 'Can I stay on the crater floor?', a: 'No. Overnight stays are not allowed on the floor. Sleep on the rim for the view, or in Karatu for smaller lodges and extra activities, both work for an early descent.' },
      { q: 'How do I get there from Arusha?', a: 'Drive 3–4 hours with your Golden Memories vehicle (often the same guide from Kilimanjaro Airport). Fly-in camps use Lake Manyara airstrip. A night either side of the descent is essential if you are driving.' },
      { q: 'When should I visit?', a: 'Any month. The crater is a unique micro-climate. We still prefer two nights so you are not sharing the floor with the late-morning rush.' },
      { q: 'Will I see black rhino?', a: 'Ngorongoro is one of the best places in Tanzania to see black rhino. Sightings are never guaranteed, but the odds here are better than in the Serengeti.' },
      { q: 'What can I do besides game drives?', a: 'Inside the crater, drives only. In the wider conservation area: walking, Olduvai, Empakaai, mountain biking from some highland lodges, and Maasai visits.' },
    ],
    facts: [
      ['Conservation area', '8,292 sq km'],
      ['Crater floor', '~260 sq km'],
      ['Formed', 'Caldera collapse ~3 million years ago'],
      ['UNESCO Status', 'World Heritage Site'],
      ['Access', 'Drive from Arusha or fly to Lake Manyara airstrip'],
      ['Best Time', 'Year-round; two nights recommended'],
    ],
    location: 'Ngorongoro District, Arusha Region, Tanzania',
  },
  {
    slug: 'tarangire',
    name: 'Tarangire National Park',
    kicker: 'Quiet elephant country',
    tagline: 'A seasonal northern park of baobabs, river herds, and Tanzania’s finest birding',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Explore Tarangire',
    image: GM.tarangire,
    gallery: [GM.tarangire, galleryPhoto('tarangire', 1), galleryPhoto('tarangire', 2)],
    match: ['tarangire'],
    paragraphs: [
      'Tarangire sits slightly off the main northern route and that is its gift. Most travellers skip it or spend a few hours on the way through, which leaves large parts of the park almost empty. It is roughly ten times the game-viewing area of nearby Lake Manyara, with a completely different habitat: baobab woodland, the Tarangire River, and a localised migration that packs the river in the dry months. Golden Memories Safaris uses it as a proper park night, or two, not a drive-through.',
      'July through October is when Tarangire is exceptional. Up to about 3,000 elephants gather, with wildebeest, zebra, giraffe, buffalo, Thomson’s gazelle, greater and lesser kudu, eland, leopard and cheetah. Dwarf mongoose, oryx and gerenuk are the rare prizes. It is one of Tanzania’s finest birding destinations. Outside those months much of the game walks out onto the Rift floor and the Maasai steppe; you will still find space and atmosphere, but not the same river concentrations. Tsetse can be heavy from December to March, so we usually keep that window for Serengeti calving instead.',
      'The south of the park is especially quiet. Walking, night drives and (at some camps) fly-camping are possible in a way the Serengeti and Ngorongoro do not allow, though TANAPA rules shift, so we confirm what your lodge can actually run. Staying inside the park beats the border hotels if you want dawn and dusk on the river. From Arusha it is about two hours, which is why it works as the first or last night of a northern circuit as well as a destination in its own right.',
    ],
    highlights: [
      { title: 'Elephant migration', body: 'Up to ~3,000 elephants in peak months, herds along the Tarangire River that rival Ngorongoro for concentration, with a fraction of the vehicles.' },
      { title: 'Baobab landscape', body: 'A habitat unlike Serengeti grass or crater floor: ancient baobabs, swamp and woodland.' },
      { title: 'Birding standout', body: 'One of Tanzania’s richest bird lists, including yellow-collared lovebird and ashy starling.' },
      { title: 'Walking and night drives', body: 'Possible inside or beside the park at selected camps, activities the Serengeti national park does not offer.' },
    ],
    seasons: [
      { title: 'June–October (best game)', body: 'Dry-season river concentrations. This is when Tarangire earns its place on a northern itinerary.' },
      { title: 'November–May', body: 'Game spreads onto the Maasai steppe. Quieter roads, still worth it if you want space rather than density. December–March can be tsetse-heavy.' },
    ],
    wildlife: [
      'Elephants: the main draw, with peak-season numbers around 3,000.',
      'Dry-season herds: wildebeest, zebra, giraffe, buffalo, Thomson’s gazelle, greater and lesser kudu, eland.',
      'Predators: lion, leopard, cheetah. Rare: oryx, gerenuk, dwarf mongoose.',
      'Birds: one of Tanzania’s finest lists (550+ species), including yellow-collared lovebird.',
    ],
    activities: [
      { title: 'River game drives', body: 'Morning, afternoon and full days along the Tarangire River and into the quieter south.' },
      { title: 'Walking safaris', body: 'Guided walks from selected camps; stronger in the south.' },
      { title: 'Night drives', body: 'Offered by some lodges inside the park (not all). We check TANAPA permissions when we book.' },
      { title: 'Birding', body: 'A serious add-on for anyone who cares about East African specials, not just the Big Five.' },
    ],
    attractions: ['Tarangire River', 'Baobab woodland', 'Silale Swamp', 'Southern wilderness', 'Maasai steppe (seasonal)'],
    faqs: [
      { q: 'When must I visit Tarangire?', a: 'June–October if you want the famous river herds. Other months are quieter and greener, with less concentrated game. We usually skip December–March here because of tsetse and because Serengeti calving is a better use of those dates.' },
      { q: 'How far from Arusha?', a: 'About two hours by road, an easy first or last park on a northern circuit.' },
      { q: 'Is it less crowded than the Serengeti?', a: 'Yes. Many groups never leave the northern gate area. Stay deeper (or in the south) and you will see far fewer vehicles than on Seronera or the crater floor.' },
      { q: 'Night drives?', a: 'Allowed in Tarangire, but only some lodges operate them. Camps outside the park generally cannot. Tell us if a night drive is a priority.' },
    ],
    facts: [
      ['Size', '2,850 sq km'],
      ['Established', '1970'],
      ['Location', 'Manyara Region, ~2 hours from Arusha'],
      ['Peak elephants', 'Up to ~3,000 in the dry season'],
      ['Bird species', '550+'],
      ['Best Time', 'June–October'],
    ],
    location: 'Manyara Region, Northern Tanzania',
  },
  {
    slug: 'lake-manyara',
    name: 'Lake Manyara National Park',
    kicker: 'Rift escarpment & soda lake',
    tagline: 'A scenic half-day on the road to Ngorongoro, tree lions, flamingos, and forest',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Plan your Manyara safari',
    image: GM.manyara,
    gallery: [GM.manyara, GM.ngorongoroAlt, GM.tarangire],
    match: ['manyara'],
    paragraphs: [
      'Lake Manyara sits in the shadow of the Great Rift Valley escarpment, on the drive from Arusha toward Ngorongoro. The soda lake fills most of the park; game concentrates on a strip of groundwater forest, acacia woodland and lakeshore. It is a beautiful first or last afternoon on a northern circuit, not a park we would give two full days when Serengeti, Ngorongoro and Tarangire are on the same itinerary. Golden Memories Safaris uses it as a soft introduction: tree-climbing lions if you are lucky, elephants, huge baboon troops, and some of the north’s best raptor watching.',
      'Why the lions climb trees is still debated; seeing a pride in an acacia is the photograph people come for, but it is never guaranteed. Flamingos can number in the thousands or barely at all, they move between East African soda lakes, so a pink shoreline is luck of the draw. Wildebeest, buffalo, hippo, zebra, warthog, waterbuck, giraffe, dik-dik and impala share the strip. Official peak season follows the same July–October dry window as the rest of the north, but the park is small enough that we will still stop if you are driving past in other months.',
      'Daytime game drives are the core. Night drives and short walks are possible from camps inside the park; lodges on the Rift rim and in Karatu open up walking, village visits, hiking and cycling without using extra park hours. Manyara airstrip is also the usual fly-in for Ngorongoro. A treetop walkway now runs through the groundwater forest, a different angle on a park most people only see from a Land Cruiser.',
    ],
    highlights: [
      { title: 'Tree-climbing lions', body: 'The park’s calling card. Not guaranteed, but Manyara is still the place in Tanzania where this behaviour is most often seen.' },
      { title: 'Rift Valley scenery', body: 'Escarpment, groundwater forest and a soda lake in one compact drive, the landscape is the real reason to stop.' },
      { title: 'Birding and flamingos', body: 'Strong raptor watching. Flamingos may be one bird or ten thousand; we never promise a pink lake.' },
      { title: 'On the way to Ngorongoro', body: 'An afternoon game drive that earns its place on a northern circuit without stealing nights from heavier parks.' },
    ],
    seasons: [
      { title: 'July–October', body: 'Official peak for the regional dry-season pattern. Vegetation is thinner; lions in trees are easier to pick out.' },
      { title: 'Year-round as a stop', body: 'Game densities never match Tarangire or the crater. If you are driving past, Manyara is still worth a few hours in any month.' },
    ],
    wildlife: [
      'Tree-climbing lions, famous, unpredictable. Elephants and some of Africa’s largest baboon troops.',
      'Lakeshore game: wildebeest, buffalo, hippo, flamingo, zebra, warthog, waterbuck, giraffe, dik-dik, impala.',
      'Birds: excellent raptor watching plus waterbirds; flamingo numbers swing wildly between lakes.',
    ],
    activities: [
      { title: 'Daytime game drives', body: 'Forest, acacia and lakeshore in a few hours, the usual shape on a northern circuit.' },
      { title: 'Night drives & short walks', body: 'Offered from some camps inside the park. Rim and Karatu lodges add hiking, cycling and village visits.' },
      { title: 'Treetop walkway', body: 'A canopy walk through the groundwater forest, a different view from the vehicle circuit.' },
      { title: 'Birding', body: 'Raptors and waterbirds; flamingos only when the lake happens to hold them.' },
    ],
    attractions: ['Lake Manyara', 'Rift Valley escarpment', 'Groundwater forest', 'Tree-climbing lions', 'Treetop walkway', 'Manyara airstrip (for Ngorongoro)'],
    faqs: [
      { q: 'Is Manyara worth a night?', a: 'Usually a half day or an afternoon on the way to Ngorongoro is enough. Game is not in the same league as Tarangire, the crater or the Serengeti. Stay longer only if you want rim walks, night drives, or a slow start before the highlands.' },
      { q: 'Will I see flamingos?', a: 'Maybe. They move between East African soda lakes. You might see one bird or thousands. We do not build an itinerary around a pink shoreline.' },
      { q: 'Tree-climbing lions, guaranteed?', a: 'No. It is the park’s famous behaviour, not a daily certainty. Even without them, the forest-and-escarpment drive is worth the stop.' },
      { q: 'How far from Arusha?', a: 'About two hours by road, on the way to Karatu and Ngorongoro. Manyara airstrip is the usual flight in for crater lodges.' },
    ],
    facts: [
      ['Size', '330 sq km (much of it lake)'],
      ['Established', '1960'],
      ['Location', 'Base of the Rift escarpment, Manyara Region'],
      ['Best as', 'Half day or afternoon on a northern circuit'],
      ['Peak window', 'July–October (still useful year-round as a stop)'],
      ['Access', 'Road from Arusha; airstrip for Ngorongoro fly-ins'],
    ],
    location: 'Manyara Region, Northern Tanzania',
  },
  {
    slug: 'arusha-national-park',
    name: 'Arusha National Park',
    kicker: 'Meru, lakes and forest',
    tagline: 'A quiet day from Arusha, walking, canoeing, and Kilimanjaro’s little brother',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Plan your Arusha National Park visit',
    image: GM.meru,
    gallery: [GM.meru, GM.materuni, GM.kilimanjaro],
    match: ['arusha national', 'meru', 'momella', 'momela'],
    paragraphs: [
      'Arusha is the gateway to Tanzania’s northern circuit, but the national park on its doorstep is not a Big Five substitute for Serengeti or Ngorongoro. It sits in fertile volcanic country at the foot of Mount Meru, Kilimanjaro’s “little brother,” about 45 minutes from town. Predators are scarce. What you get instead is quiet: montane forest, black-and-white colobus, the Momella Lakes, Ngurdoto Crater, and some of the few walking and canoeing days allowed this close to Arusha. Golden Memories Safaris uses it as a half or full day before a late flight, after a Kilimanjaro descent, or when you want to walk rather than sit in a closed vehicle.',
      'Mount Meru (4,566 m) is a more technical climb than Kilimanjaro and a serious mountain in its own right, several days, not a stroll. Game drives still have giraffe, buffalo, zebra, warthog, bushbuck and waterbuck against that backdrop. On clear mornings Kilimanjaro shows on the horizon. Coffee plantations around the town make a natural overnight before or after the parks; we rarely recommend lingering in Arusha itself when the circuit or the mountain is why you came.',
    ],
    highlights: [
      { title: 'Walking and canoeing', body: 'Rare in the north. Guided forest walks and Momella canoeing, a useful contrast to closed-vehicle days in Serengeti and the crater.' },
      { title: 'Black-and-white colobus', body: 'The forest’s signature primate, with blue monkeys and olive baboons in the same canopy.' },
      { title: 'Mount Meru', body: 'Tanzania’s second peak: a technical multi-day climb, and the park’s skyline even if you stay on the lakes.' },
      { title: 'Close to Arusha', body: 'Half a day that fits a late Kilimanjaro International arrival or an extra morning before you fly home.' },
    ],
    seasons: [
      { title: 'June–October', body: 'Clearer views of Meru and Kilimanjaro; better trails for Meru climbs.' },
      { title: 'November–May', body: 'Green forest, strong birding, seasonal flamingos on the lakes. Still an easy day from town.' },
    ],
    wildlife: [
      'Primates: black-and-white colobus, blue monkeys, olive baboons, the park’s real draw.',
      'Plains and forest: giraffe, buffalo, zebra, warthog, bushbuck, waterbuck, duiker. Leopard is present but rarely seen; this is not predator country.',
      'Birds: 400+ species, including seasonal flamingos on Momella, turacos, trogons and fish eagles.',
    ],
    activities: [
      { title: 'Walking safari', body: 'Guided on foot through forest and lakeshore, one of the few northern parks that allow it.' },
      { title: 'Canoeing Momella Lakes', body: 'A quiet afternoon with Meru on the skyline; useful if you have a late flight.' },
      { title: 'Game drive', body: 'Ngurdoto Crater, forest and lakes in a compact loop.' },
      { title: 'Mount Meru climb', body: 'Multi-day trekking for experienced hikers; harder and less crowded than Kilimanjaro.' },
    ],
    attractions: ['Mount Meru', 'Momella Lakes', 'Ngurdoto Crater', 'Montane forest', 'Fig Tree Arch', 'Kilimanjaro views (clear days)'],
    faqs: [
      { q: 'Is this a substitute for Serengeti?', a: 'No. It lacks the predator densities of the circuit parks. Come for walking, canoeing, colobus and Meru, then drive or fly to Tarangire, Ngorongoro and Serengeti for classic game.' },
      { q: 'How far from Arusha?', a: 'About 45 minutes to an hour from town. International flights land at Kilimanjaro Airport, roughly the same drive in the other direction.' },
      { q: 'Can I climb Meru instead of Kilimanjaro?', a: 'Yes, if you want a quieter, more technical mountain. Most first-time visitors still choose Kilimanjaro and use this park as a rest or walking day.' },
      { q: 'When should I add it?', a: 'Arrival or departure days, after a Kilimanjaro trek, or when you specifically want to walk. We do not insert it in the middle of a tight Serengeti itinerary.' },
    ],
    facts: [
      ['Size', '552 sq km'],
      ['Established', '1960'],
      ['Highest point', 'Mount Meru, 4,566 m'],
      ['From Arusha', 'About 45–60 minutes'],
      ['Known for', 'Walking, canoeing, colobus, Meru'],
      ['Best Time', 'June–October for views and climbing'],
    ],
    location: 'Arusha Region, Northern Tanzania',
  },
  {
    slug: 'kilimanjaro',
    name: 'Mount Kilimanjaro',
    kicker: 'Roof of Africa',
    tagline: 'A free-standing volcano at 5,895 m, endurance, altitude, and five climate zones',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Start your Kilimanjaro adventure',
    image: GM.kilimanjaro,
    gallery: [GM.kilimanjaro, GM.machame, galleryPhoto('kilimanjaro', 3)],
    match: ['kilimanjaro', 'machame', 'marangu', 'lemosho', 'umbwe'],
    paragraphs: [
      'Kilimanjaro is a snow-capped dormant volcano on the Tanzania–Kenya border east of Arusha: 5,895 m (19,340 ft), the highest free-standing mountain on earth and the roof of Africa. From the plains you often cannot see the whole massif; from Kenya’s Amboseli, or from a Nairobi flight on a clear day, the cone is unmistakable. Tens of thousands of people attempt it each year, so this is not wilderness solitude. It is still a serious endurance test. Altitude, not technical climbing, is why most people turn around. Golden Memories Safaris pairs the mountain with northern-park nights because it would be a waste to come this far and skip Serengeti, Ngorongoro or Tarangire.',
      'You do not need ropes. You do need fitness, a doctor’s all-clear, and enough days. The fastest itineraries are four nights; most people take six to eight, and nine on the Northern Circuit almost everyone summits. Machame is the busiest scenic route. Lemosho and Shira give more acclimatisation and quieter western approaches. Rongai comes up the north, a strong six-day line, with a seventh day if you can spare it. Marangu is the hut route. March through May is the long rains and a poor time to trek. July to October matches the best safari weather and the clearest summits.',
      'The mountain is a stack of climates. Montane forest (about 1,850–2,800 m) is wet, rivered and full of endemic trees; heath and protea sit just above the tree line. From around 3,200 m the moorland opens, skies clear, and giant senecio and lobelia give the slopes a prehistoric look. Above 4,000 m oxygen thins into alpine desert; beyond 5,000 m it is rock and ice. Easterly routes meet west of the saddle near Gillman’s Point; Uhuru Peak sits on Kibo’s crater rim above the ash pit. After the summit, most climbers add a safari or Zanzibar rather than flying straight home.',
    ],
    highlights: [
      { title: 'Highest free-standing mountain', body: 'Uhuru Peak at 5,895 m, a Seven Summit by hiking, not technical mountaineering.' },
      { title: 'Five climate zones', body: 'Rainforest, heath, moorland, alpine desert, then ice. The scenery changes every day you walk.' },
      { title: 'Route choice matters', body: 'Longer itineraries raise summit rates. Machame is busy; Lemosho, Shira, Rongai and the Northern Circuit buy space and acclimatisation.' },
      { title: 'Safari next door', body: 'The northern parks sit a day’s drive or a short flight away. We plan the climb and the game drives as one journey.' },
    ],
    seasons: [
      { title: 'July–October', body: 'Peak climbing and peak safari weather. Best chance of a clear summit morning.' },
      { title: 'December–February', body: 'A second good window. Warmer lower slopes; still serious at the crater.' },
      { title: 'March–May (and November)', body: 'Long rains on the forest; snow and ice higher up. We usually wait this out.' },
    ],
    wildlife: [
      'Forest: colobus, blue monkeys, bushbuck, duiker, and dense birdlife in the wet montane zone.',
      'Moorland: giant lobelia and senecio rather than large mammals.',
      'High mountain: little wildlife, klipspringer, white-necked raven, augur buzzard, sunbirds, occasional bearded vulture.',
    ],
    activities: [
      { title: 'Summit trek', body: 'Non-technical hiking. Altitude is the difficulty. We staff routes for safety, not speed.' },
      { title: 'Route planning', body: 'Machame, Lemosho, Shira, Rongai, Northern Circuit or Marangu, chosen for days, crowds and success rate, not fashion.' },
      { title: 'Acclimatisation days', body: 'Extra nights are the cheapest way to raise the odds of Uhuru rather than Stella or Gillman’s only.' },
      { title: 'Safari or coast after', body: 'Northern circuit parks or Zanzibar as recovery, most climbers do not fly home the day they descend.' },
    ],
    attractions: ['Uhuru Peak', 'Stella Point & Gillman’s Point', 'Kibo crater and ash pit', 'Shira Plateau', 'Five ecological zones', 'Machame, Lemosho, Rongai, Northern Circuit'],
    faqs: [
      { q: 'Do I need technical climbing experience?', a: 'No ropes or alpine gear. You do need cardiovascular fitness, stamina, and respect for altitude. Many operators require a medical check before you start.' },
      { q: 'How long should I take?', a: 'Four nights is the minimum and a poor idea for most people. Six to eight nights is the usual range. Nine on the Northern Circuit has the highest summit rate because almost everyone has time to acclimatise.' },
      { q: 'Which route?', a: 'Machame is popular and crowded. Lemosho (about eight days) balances scenery and success. Rongai is the strongest six-day north-side option. Marangu uses huts. We match the line to your dates, group size and how much solitude you want.' },
      { q: 'When should I climb?', a: 'Avoid March–May. July–October is the clearest, and it lines up with northern safari season. December–February is the second window.' },
      { q: 'Can I add a safari?', a: 'Yes, and you should. Kilimanjaro sits next to the same parks we run from Arusha. A crater or Serengeti week after the descent is the usual Golden Memories shape.' },
    ],
    facts: [
      ['Height', '5,895 m / 19,340 ft (Uhuru Peak)'],
      ['Type', 'Dormant free-standing volcano'],
      ['First ascent', '1889, Hans Meyer and Ludwig Purtscheller'],
      ['Typical duration', '6–8 nights (4 minimum; 9 on Northern Circuit)'],
      ['Main risk', 'Altitude sickness, not technical climbing'],
      ['Best Time', 'July–October; also December–February'],
    ],
    location: 'Kilimanjaro Region, on the Tanzania–Kenya border',
  },
  {
    slug: 'lake-eyasi',
    name: 'Lake Eyasi',
    kicker: 'Hadzabe country',
    tagline: 'A Rift Valley salt lake south of Ngorongoro, hunter-gatherers, Datoga, and space',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Experience Lake Eyasi',
    image: GM.lakeEyasi,
    gallery: [GM.lakeEyasi, GM.materuni, GM.manyara],
    match: ['eyasi'],
    paragraphs: [
      'Lake Eyasi is a seasonal shallow salt lake on the Rift floor, south of the Serengeti and the Ngorongoro Highlands. It is not a wildlife park. The northern circuit’s off-track chapter is cultural: the Hadzabe, among Africa’s last hunter-gatherer communities, and the Datoga, pastoralists and metalworkers. Golden Memories Safaris treats a day here as a considered visit with local guides, not a performance. Walking, hunting with bows, and time at a Datoga homestead sit outside the tightly regulated national parks, which is why Eyasi exists on an itinerary when you want to get off the crater rim.',
      'When the lake holds water it draws flamingos and other waterbirds; neighbouring Lake Natron, further north, is the flamingo breeding ground of East Africa. Access is by 4x4 from Karatu or the highlands, rough, scenic, two to three hours. Dry months (June–October) are easier on the road and better for walking with the Hadzabe. We keep groups small and the schedule honest: this is a living landscape, not a museum.',
    ],
    highlights: [
      { title: 'Hadzabe', body: 'A walking day with hunter-gatherers, bow hunting and honey, on their terms, with a local interpreter.' },
      { title: 'Datoga', body: 'Pastoralists and blacksmiths; metalwork and homestead life rather than a game-drive narrative.' },
      { title: 'Off the park circuit', body: 'Walking is tightly limited inside Serengeti and Ngorongoro. Eyasi is where a northern itinerary can still go on foot.' },
      { title: 'Rift lake', body: 'A seasonal soda lake; birds when there is water, empty salt flats when there is not.' },
    ],
    seasons: [
      { title: 'June–October', body: 'Best access and walking weather. The usual window if we add Eyasi to a northern circuit.' },
      { title: 'November–May', body: 'Greener, muddier roads, fewer visitors. Possible if you accept slower travel.' },
    ],
    wildlife: [
      'Birds when the lake has water: flamingos, pelicans, storks and other waterbirds.',
      'Occasional zebra, giraffe and small antelope on the surrounding steppe, this is not a game park.',
      'Lake Natron (further north) is the region’s great flamingo breeding site if birding is the priority.',
    ],
    activities: [
      { title: 'Hadzabe walk', body: 'Early start with a local guide: tracking, bows, and honey collecting when the community is hunting that day.' },
      { title: 'Datoga visit', body: 'Blacksmithing, livestock, and homestead time, slower than a park gate schedule.' },
      { title: 'Lakeshore', body: 'Birding when there is water; otherwise the empty Rift floor is the landscape.' },
    ],
    attractions: ['Hadzabe community', 'Datoga homesteads', 'Lake Eyasi', 'Ngorongoro Highlands approach', 'Lake Natron (flamingo breeding, separate day)'],
    faqs: [
      { q: 'Is this a safari destination?', a: 'No. Come for people and landscape, not Big Five lists. Pair it with Ngorongoro and Serengeti if you also want game drives.' },
      { q: 'How do I get there?', a: '4x4 from Karatu or the crater highlands, typically two to three hours on a rough road. We do not send a minibus.' },
      { q: 'Can I stay overnight?', a: 'Yes, simple camps and lodges near the lake. Many guests do a long day from Karatu instead.' },
      { q: 'Is a hunt guaranteed?', a: 'No. You join what the Hadzabe are doing that morning. We do not stage a hunt for cameras.' },
    ],
    facts: [
      ['Location', 'Rift Valley, south of Ngorongoro / Serengeti'],
      ['Lake type', 'Seasonal shallow salt lake'],
      ['Communities', 'Hadzabe (hunter-gatherers), Datoga (pastoralists)'],
      ['Access', '4x4 from Karatu, 2–3 hours'],
      ['Best Time', 'June–October'],
    ],
    location: 'Manyara Region, Northern Tanzania',
  },
  {
    slug: 'zanzibar',
    name: 'Zanzibar Archipelago',
    kicker: 'Spice islands & Indian Ocean',
    tagline: 'Swahili history, tidal beaches, and the natural last chapter after safari',
    region: 'The Coast',
    regionSlug: 'the-coast',
    cta: 'Plan your island getaway',
    image: GM.zanzibarBeach,
    gallery: [GM.zanzibarBeach, GM.spice, GM.coast],
    match: ['zanzibar', 'spice', 'stone town', 'coast', 'unguja'],
    paragraphs: [
      'The Zanzibar archipelago sits off Tanzania’s coast: Unguja (the main island), quieter Pemba, and smaller islands in the same turquoise water. It is a Swahili heartland, sultans’ palaces, spice plantations, dhow sails, and the usual last chapter after a safari, not a substitute for one. Golden Memories Safaris books it as beach recovery after the north or south: Stone Town for a night or two, then sand. Nyerere (Selous) is about 45 minutes by air; Ruaha a little further; Serengeti roughly an hour. Dar es Salaam is a 20-minute hop, or a two-hour ferry.',
      'Beaches are not interchangeable. Nungwi and Kendwa in the north have the classic non-tidal powder and can be busy. Pongwe on the east is a sheltered pocket, often seaweed-free when the tide is out. Paje and Dongwe are tidal, beautiful hotels, a longer walk to deep water. Matemwe sits slightly east of the north-east, also tidal, with strong snorkelling toward Mnemba. Pemba is for divers and people who want culture over a swimming beach; Mafia, further south, is whale-shark country from October to March. Prison Island (Changuu) is a short boat from Stone Town for Aldabra tortoises, despite the name.',
      'July to October is the reliable dry season and lines up with southern-park game viewing. December to February is warm and workable. November’s short rains and April–May’s long rains are the months we usually skip if you want consistent sun. Jozani Forest holds the endemic red colobus; spice tours explain cloves, nutmeg and cinnamon; reefs off the east and north are the snorkel default, with Pemba for serious diving.',
    ],
    highlights: [
      { title: 'After-safari coast', body: 'A short flight from Nyerere, Ruaha or the Serengeti. Dust, then dhows, the pairing Tanzania is built for.' },
      { title: 'North vs east beaches', body: 'Nungwi and Kendwa for swimming at any tide; east coast for quieter hotels and tidal flats. We match the shore to how you actually want to use the water.' },
      { title: 'Stone Town & spices', body: 'UNESCO lanes, a night or two, then a plantation visit, the island’s history, not only its sand.' },
      { title: 'Reefs and Jozani', body: 'Snorkelling off the east and north; red colobus in the island’s only national park; Pemba if you came to dive.' },
    ],
    seasons: [
      { title: 'July–October', body: 'Prime dry weather, calm seas, and the best window to combine with Selous or Ruaha.' },
      { title: 'December–February', body: 'Warm, generally good beach days. Whale sharks at Mafia October–March.' },
      { title: 'April–May (and November)', body: 'Long rains in April–May; short rains in November. We avoid these if sunshine is the point.' },
    ],
    wildlife: [
      'Reefs: tropical fish, turtles, dolphins; seasonal humpback whales. Mnemba and Chumbe for snorkel and dive days.',
      'Jozani Forest: endemic Zanzibar red colobus, plus other forest primates.',
      'Mafia Island (separate): whale sharks October–March. Pemba: some of the region’s strongest coral diving.',
      'Prison Island: Aldabra giant tortoises, 30 minutes by boat from Stone Town.',
    ],
    activities: [
      { title: 'Beach time', body: 'Nungwi, Kendwa, Pongwe, Paje, Matemwe, chosen for tide, crowds and hotel style, not a single “best beach.”' },
      { title: 'Stone Town & spice tour', body: 'A walking day in the old city plus a plantation. Two nights in town is plenty for most people.' },
      { title: 'Snorkel and dive', body: 'East and north reefs from Unguja; Pemba for serious diving; Mafia for whale sharks in season.' },
      { title: 'Jozani & dhow sunset', body: 'Red colobus in forest; traditional sail at the end of the day.' },
    ],
    attractions: ['Stone Town', 'Nungwi & Kendwa', 'Pongwe, Paje, Matemwe', 'Spice plantations', 'Jozani Forest', 'Mnemba Atoll', 'Pemba Island', 'Mafia Island', 'Prison Island'],
    faqs: [
      { q: 'How do I get there?', a: 'Fly into Zanzibar (ZNZ), or take the ferry from Dar es Salaam (about two hours). From safari, scheduled light aircraft from Nyerere (~45 minutes), Ruaha, or the Serengeti (~one hour).' },
      { q: 'North or east coast?', a: 'North (Nungwi, Kendwa) if you want to swim regardless of tide. East if you prefer quieter boutique hotels and accept tidal flats. Tell us which matters more.' },
      { q: 'How many nights in Stone Town?', a: 'One or two. It is loud, atmospheric, and wonderful by day. Most guests then move to a beach hotel for sleep.' },
      { q: 'Safari then beach, or beach then safari?', a: 'Safari first is the usual Golden Memories order so you land on the island tired in a good way. Fly-in from Zanzibar to the north is possible if the holiday starts on the coast.' },
      { q: 'Visa?', a: 'Zanzibar is part of Tanzania. One Tanzania visa covers both. Check current entry rules before you fly.' },
    ],
    facts: [
      ['Islands', 'Unguja (Zanzibar), Pemba, plus smaller islets; Mafia is a separate archipelago south'],
      ['Capital', 'Zanzibar City (Stone Town)'],
      ['From Dar', '~20 min flight or ~2 hour ferry'],
      ['From Nyerere', '~45 min flight'],
      ['From Serengeti', '~1 hour flight'],
      ['Best Time', 'July–October; also December–February'],
    ],
    location: 'Indian Ocean, off the coast of Tanzania',
  },
  {
    slug: 'stone-town',
    name: 'Stone Town & spice tours',
    kicker: 'Sultans, doors and cloves',
    tagline: 'A UNESCO labyrinth, one or two nights, then the beach',
    region: 'The Coast',
    regionSlug: 'the-coast',
    cta: 'Plan a Stone Town day',
    image: GM.spice,
    gallery: [GM.spice, GM.zanzibarBeach, galleryPhoto('zanzibar', 4)],
    match: ['stone town', 'spice'],
    paragraphs: [
      'Almost everyone arrives and leaves Unguja through Stone Town, the old capital: a UNESCO World Heritage maze of palaces, bath houses, mosques and carved doors from the sultanate and the gold-and-spice trade. It is still a working Swahili city, muezzin at dawn, markets, cats, and a waterfront where you eat grilled fish in the evening. Golden Memories Safaris keeps most guests here one or two nights. Longer than that and the noise wins; the island’s rest is on the coast.',
      'A guided walk beats getting lost for the first hour. Pair it with a spice plantation, cloves, nutmeg, cinnamon, vanilla, which is why these islands sat on every old map. Prison Island is a thirty-minute boat for giant tortoises. Jozani Forest sits on the same day if you want red colobus before you transfer north or east. Boutique hotels now make the old town comfortable; it is still not the place for a quiet night’s sleep if you are sensitive to the call to prayer.',
    ],
    highlights: [
      { title: 'UNESCO Stone Town', body: 'Sultanate architecture, carved doors, and a living harbour city, not a reconstructed set.' },
      { title: 'Spice farm', body: 'The plantation visit that makes “spice island” more than a slogan.' },
      { title: 'Gateway nights', body: 'Arrive, walk, eat on the seafront, then move to Nungwi, Kendwa or the east coast.' },
    ],
    seasons: [
      { title: 'July–October', body: 'Drier, cooler walking weather in the lanes.' },
      { title: 'December–February', body: 'Hotter; still a good stopover between safari and beach.' },
    ],
    wildlife: [
      'Harbour birds along the waterfront.',
      'Aldabra giant tortoises on Prison Island, a short boat from town.',
      'Red colobus in Jozani if you add the forest on the same day.',
    ],
    activities: [
      { title: 'Stone Town walking tour', body: 'Lanes, palaces, markets, and the waterfront with a guide who can actually read the doors.' },
      { title: 'Spice tour', body: 'Plantation tasting and lunch, usually half a day.' },
      { title: 'Prison Island', body: 'Boat to the tortoise colony, the name is leftover; it was a yellow-fever isolation site.' },
    ],
    attractions: ['Stone Town', 'Spice plantations', 'Forodhani waterfront', 'Prison Island', 'Jozani Forest (add-on)'],
    faqs: [
      { q: 'Can it be a day tour only?', a: 'Yes. Morning in town, afternoon on a spice farm, then transfer to the beach. Overnight is better if your flight lands late.' },
      { q: 'How many nights?', a: 'One or two. After that, most people sleep better on the north or east coast.' },
      { q: 'Is it after the safari?', a: 'Usually yes, a rest-and-history day on Unguja before beach nights, or the reverse if you fly into Zanzibar first.' },
    ],
    facts: [
      ['Location', 'Zanzibar City, Unguja'],
      ['Status', 'UNESCO World Heritage Site'],
      ['Typical stay', '1–2 nights'],
      ['Best with', 'Beach nights on Unguja, or a safari-and-coast itinerary'],
    ],
    location: 'Zanzibar City, Unguja',
  },
  {
    slug: 'safari-from-zanzibar',
    name: 'Safari from Zanzibar',
    kicker: 'Beach first, then the parks',
    tagline: 'Short-hop flights from Unguja to Nyerere, the north, or a compact crater circuit',
    region: 'The Coast',
    regionSlug: 'the-coast',
    cta: 'Plan a fly-in safari',
    image: GM.ngorongoroAlt,
    gallery: [GM.ngorongoroAlt, GM.tarangire, GM.zanzibarBeach],
    match: ['zanzibar', 'tarangire', 'ngorongoro'],
    paragraphs: [
      'Zanzibar sits close enough to Tanzania’s parks that a beach holiday can still include real safari days. Nyerere National Park (Selous) is about 45 minutes by light aircraft, the easiest, cheapest pairing, and the one Golden Memories Safaris recommends if the island comes first and you want walking, boats and open-sided vehicles. Ruaha is a little further west and wilder. The northern circuit is possible too, but the flights cost more: a little over an hour to the Serengeti, or a compact Tarangire-and-Ngorongoro loop if time is tight.',
      'The two-day mainland add-on we list from Zanzibar is Tarangire elephants and baobabs, overnight, then a Ngorongoro Crater floor drive before you fly back. It is a taste, not a migration safari. If you have more nights, add Serengeti or switch the whole add-on to Nyerere. Your guide and vehicle wait on the mainland; you do not start from Arusha unless the rest of the trip already lives in the north.',
    ],
    highlights: [
      { title: 'Nyerere in 45 minutes', body: 'The natural fly-in from Zanzibar: boat safari, walking, and fewer vehicles than the north.' },
      { title: 'Compact northern loop', body: 'Tarangire then Ngorongoro when you specifically want crater-floor Big Five and baobabs.' },
      { title: 'Same journey, two landscapes', body: 'Indian Ocean and game country without a long Arusha road transfer.' },
    ],
    seasons: [
      { title: 'July–October', body: 'Best overlap: dry-season parks and reliable island weather.' },
      { title: 'Year-round (with caveats)', body: 'Possible whenever flights run. April–May rains hit both beach and south; we plan around them.' },
    ],
    wildlife: [
      'Nyerere: lion, wild dog, hippo and crocodile on the Rufiji, plus woodland game.',
      'Tarangire: dry-season elephant concentrations and baobab country.',
      'Ngorongoro: crater-floor Big Five chance, including black rhino.',
    ],
    activities: [
      { title: 'Fly-in Nyerere or Ruaha', body: 'The stronger wildlife add-on from the island if you can spare three or more park nights.' },
      { title: 'Two-day north circuit', body: 'Tarangire, overnight, crater, return to Unguja, short and specific.' },
      { title: 'Private guiding', body: 'Vehicle and guide on the mainland; scheduled flights from Zanzibar.' },
    ],
    attractions: ['Nyerere (Selous)', 'Ruaha', 'Tarangire National Park', 'Ngorongoro Crater', 'Zanzibar flights'],
    faqs: [
      { q: 'Which park is easiest from Zanzibar?', a: 'Nyerere (Selous): about 45 minutes. It is also the better match for a short safari, boats, walking, open vehicles. The north is a longer, pricier hop.' },
      { q: 'How long is the listed two-day safari?', a: 'Tarangire, overnight, Ngorongoro, back to Zanzibar. Add Serengeti if you have more time.' },
      { q: 'Safari first or beach first?', a: 'Safari first is calmer. Beach first works if that is how your flights fall; we just keep the park block in one piece.' },
    ],
    facts: [
      ['Start', 'Zanzibar (Unguja)'],
      ['Nearest park flight', 'Nyerere ~45 minutes'],
      ['North option', 'Tarangire & Ngorongoro (typically 2 days); Serengeti ~1 hour'],
      ['Best overlap', 'July–October'],
    ],
    location: 'Reached from Zanzibar by scheduled light aircraft',
  },
  {
    slug: 'ruaha',
    name: 'Ruaha National Park',
    kicker: 'Tanzania’s largest park',
    tagline: 'Baobab hills, the Great Ruaha River, and predator densities the north cannot match for space',
    region: 'Southern Tanzania',
    regionSlug: 'southern-tanzania',
    cta: 'Plan a Ruaha safari',
    image: GM.southern,
    gallery: [GM.southern, GM.savanna, GM.selous],
    match: ['ruaha'],
    paragraphs: [
      'Ruaha sits at the heart of Tanzania, west of Nyerere and south of the Serengeti: the country’s largest national park, and the quieter twin on the southern circuit. Distance keeps visitor numbers down. What you fly in for is baobab-studded hills, rocky escarpments, the Great Ruaha River, and predators that justify the extra hop, around a tenth of the world’s lions, one of East Africa’s four cheetah populations, and the third-largest wild dog population on earth, plus huge elephant and buffalo herds. East and southern African species overlap here: sable, roan, Grant’s gazelle, greater and lesser kudu beside zebra, defassa waterbuck, impala and giraffe. Birding tops 500 species.',
      'Game viewing is stronger than in neighbouring Nyerere, but you give up boat safaris. Daytime drives are the core; night drives are not allowed. Walking exists at selected camps (some skip it because of elephant numbers). Fly-camping, a night under the stars, is rare and camp-dependent. This is a classic dry-season park: game tightens on remaining water as the year goes on. December to March is exceptional for birds and almost empty of other vehicles. Daily flights come from Dar es Salaam, Nyerere, and sometimes the Serengeti. Golden Memories Safaris pairs Ruaha with Nyerere on an eight-day south, or uses it as a wilder contrast after the north.',
    ],
    highlights: [
      { title: 'Predator country', body: 'Lion (especially around Mwagusi), leopard, cheetah, wild dog and hyena, concentrations that rival anywhere in Tanzania, with far fewer vehicles.' },
      { title: 'East meets south', body: 'Sable, roan and both kudus in the same landscape as classic East African plains game.' },
      { title: 'Largest national park', body: 'Room, baobabs, river and escarpment, a wilder feel than the northern circuit’s busy lodges.' },
      { title: 'Pairs with Nyerere', body: 'Fly between the two: boats and walking in Nyerere, stronger game in Ruaha.' },
    ],
    seasons: [
      { title: 'Late dry (July–October, into November)', body: 'Best overall concentrations as rivers and pools shrink. The later you go, the tighter the game.' },
      { title: 'December–March', body: 'World-class birding, green country, almost no other cars. Pockets of resident game remain.' },
      { title: 'Peak rains', body: 'Some camps close. We usually wait unless you specifically want emptiness.' },
    ],
    wildlife: [
      'Predators: lion, leopard, cheetah, African wild dog, hyena, Ruaha’s headline.',
      'Megafauna: elephant and buffalo in large herds throughout the park.',
      'Crossover antelope: sable, roan, greater and lesser kudu, Grant’s gazelle, hartebeest, plus zebra, giraffe, impala, defassa waterbuck.',
      'Birds: 500+ species; December–March is the standout window.',
    ],
    activities: [
      { title: 'Daytime game drives', body: 'Riverine circuits, Mwagusi sand rivers, baobab ridges. Night driving is not permitted.' },
      { title: 'Walking (selected camps)', body: 'Not every lodge walks, elephant density is the reason. We book a walking camp if that is a priority.' },
      { title: 'Fly-camping', body: 'Rare; a night under the stars from camps that still run it.' },
      { title: 'Hot-air balloon', body: 'Offered in season for a river-and-baobab overview, book with the stay, not as an afterthought.' },
    ],
    attractions: ['Great Ruaha River', 'Mwagusi Sand River', 'Baobab ridges and escarpment', 'Usangu wetlands (seasonal)'],
    faqs: [
      { q: 'Ruaha or Nyerere?', a: 'Ruaha usually has the better game; Nyerere has boats, walking and an easier hop from Zanzibar. The strongest southern itinerary is both.' },
      { q: 'How do I get there?', a: 'Scheduled light aircraft from Dar es Salaam, Nyerere, or (less often) the Serengeti. Overland is a longer southern road trip, not a day transfer from Arusha.' },
      { q: 'Is it right for a first safari?', a: 'Yes, if you want space and can fly. If the Great Migration or Ngorongoro Crater is the dream, start in the north and add Ruaha when you have extra nights.' },
      { q: 'Night drives?', a: 'Not inside the national park. Walking depends on the camp.' },
    ],
    facts: [
      ['Status', 'Tanzania’s largest national park'],
      ['Known for', 'Lions, wild dog, elephant, baobabs, Ruaha River'],
      ['Birds', '500+ species'],
      ['Access', 'Fly from Dar, Nyerere or Serengeti'],
      ['Best Time', 'July–October (dry); Dec–Mar for birds'],
    ],
    location: 'Southern / central Tanzania, west of Nyerere',
  },
  {
    slug: 'nyerere',
    name: 'Nyerere (Selous)',
    kicker: 'Africa’s largest game reserve, now a park',
    tagline: 'Rufiji boats, walking, fly-camp, the southern park with the widest range of activities',
    region: 'Southern Tanzania',
    regionSlug: 'southern-tanzania',
    cta: 'Plan a Nyerere safari',
    image: GM.selous,
    gallery: [GM.selous, GM.southern, GM.dayTrip],
    match: ['selous', 'nyerere', 'rufiji'],
    paragraphs: [
      'Nyerere National Park is still widely called Selous: a vast southern wilderness of rivers and lakes, far quieter than the northern circuit and only a short flight from Dar es Salaam or Zanzibar. The Rufiji system is the park’s pulse, elephant, buffalo, hippo, crocodile, strong lion prides, leopard, and more than half of Africa’s remaining wild dogs, plus giraffe, eland, sable, kudu, wildebeest, zebra, impala, hartebeest, hyena, baboon, colobus and vervet. Bird lists run past 440 species. East and southern African game overlap here, resident and migratory.',
      'What sets Nyerere apart is not only size. It offers the widest mix of safari activities in Tanzania: daytime drives in open-sided vehicles, some of the country’s finest boat safaris, serious walking, and fly-camping nights under the stars. That combination is tightly limited in Serengeti and Ngorongoro. July to October is the classic dry-season peak; later in the dry is better still. January and February can be excellent for birds but you must choose camp location carefully as game shifts to greener feeding grounds. Golden Memories Safaris uses Nyerere as a first safari from the coast, or as the boat-and-walk half of a Ruaha pairing.',
    ],
    highlights: [
      { title: 'Rufiji boat safari', body: 'Hippo, crocodile and kingfishers from the water, the activity the northern parks simply do not run.' },
      { title: 'Walking and fly-camp', body: 'Among the best walking operations in Africa, plus nights out under the stars if you want them.' },
      { title: 'Wild dog and lion', body: 'Over half of remaining African wild dog, and lion prides that use the lakes and riverine woodland.' },
      { title: 'Close to Zanzibar', body: 'About 45 minutes by air, the natural beach-and-safari pairing from Unguja.' },
    ],
    seasons: [
      { title: 'July–October', body: 'Greatest overall concentrations; boat days are reliable. Later dry season is stronger still.' },
      { title: 'January–February', body: 'World-class birding; game more scattered, camp location matters more than in the dry.' },
      { title: 'Other months', body: 'Resident game remains in river and lake systems. Some camps are seasonal.' },
    ],
    wildlife: [
      'Predators: lion, leopard, hyena, and over 50% of remaining African wild dog.',
      'River: hippo, crocodile, elephant, buffalo.',
      'Woodland and lakes: giraffe, eland, sable, kudu, wildebeest, zebra, impala, hartebeest, baboon, colobus, vervet.',
      'Birds: 440–450+ species; outstanding in the green months.',
    ],
    activities: [
      { title: 'Boat safari', body: 'On the Rufiji and lakes, the signature Nyerere day.' },
      { title: 'Game drives', body: 'Open-sided vehicles through lakes and woodland; a different feel from closed northern Cruisers.' },
      { title: 'Walking', body: 'Guided walks from selected camps; among the strongest in Tanzania.' },
      { title: 'Fly-camping', body: 'Walking days and a night under the stars, adventurous, not for everyone.' },
    ],
    attractions: ['Rufiji River', 'Lakes and channels', 'Walking trails', 'Fly-camp sites'],
    faqs: [
      { q: 'Is it still called Selous?', a: 'The park is officially Nyerere National Park. Travellers and older maps still say Selous. We use both so you can find it.' },
      { q: 'Boat and drive in one stay?', a: 'Yes. A typical stay mixes Rufiji boat time with 4x4 circuits and, if you want it, a walk.' },
      { q: 'Nyerere or Ruaha?', a: 'Nyerere for boats, walking and an easy Zanzibar hop. Ruaha for denser predators and baobab hills. Both is the full southern story.' },
      { q: 'How do I get there?', a: 'Daily scheduled flights from Dar es Salaam and Zanzibar. That is why it works as a short safari, not only a two-week expedition.' },
    ],
    facts: [
      ['Former name', 'Selous Game Reserve (now Nyerere National Park)'],
      ['Known for', 'Rufiji boats, walking, fly-camp, wild dog'],
      ['Birds', '440+ species'],
      ['From Zanzibar', '~45 minutes by air'],
      ['Best Time', 'July–October'],
    ],
    location: 'Southern Tanzania, Rufiji River system',
  },
  {
    slug: 'mikumi',
    name: 'Mikumi National Park',
    kicker: 'Mkata floodplain',
    tagline: 'Open grassland on the Dar–south road, a practical first taste, not a Serengeti substitute',
    region: 'Southern Tanzania',
    regionSlug: 'southern-tanzania',
    cta: 'Plan Mikumi',
    image: GM.dayTrip,
    gallery: [GM.dayTrip, GM.southern, GM.selous],
    match: ['mikumi'],
    paragraphs: [
      'Mikumi National Park sits on the highway west of Dar es Salaam, at the edge of the same vast Selous–Nyerere ecosystem. It is the southern circuit’s accessible grassland: zebra, wildebeest, giraffe, buffalo, elephant and lion on the Mkata floodplain, hippo pools, and a bird list that rewards a slow morning. Golden Memories Safaris uses it as a fly-in or road day from the coast when time is short, or as a first night on the drive toward Nyerere and Ruaha, not as a week-long centrepiece.',
      'The landscape looks like a pocket Serengeti, which is both the appeal and the limit. You will not find migration river crossings or crater-floor density. You will find fewer logistics than a full Ruaha stay, open-sided game viewing if we base you properly, and a park that still works when Zanzibar or Dar is your start point. Dry months (June–October) give the cleanest plains viewing. Overnight beats a rushed day trip if you want a dawn drive.',
    ],
    highlights: [
      { title: 'Close to Dar and the coast', body: 'A savannah day without committing to the full southern fly-in circuit.' },
      { title: 'Mkata floodplain', body: 'Classic open-grassland game: zebra, wildebeest, giraffe, lion.' },
      { title: 'On the way south', body: 'A sensible first or last park if you are driving toward Nyerere or Ruaha.' },
    ],
    seasons: [
      { title: 'June–October', body: 'Best visibility on the plains; animals nearer remaining water.' },
      { title: 'Green season', body: 'Lush and quieter; still workable as a day or an overnight from Dar.' },
    ],
    wildlife: [
      'Plains: zebra, wildebeest, giraffe, buffalo, elephant, lion.',
      'Hippo pools and a strong bird list along water.',
      'Not a wild-dog or boat-safari park, that is Nyerere, further south.',
    ],
    activities: [
      { title: 'Game drives', body: 'Half-day or full-day on the Mkata floodplain.' },
      { title: 'Fly-in or road day', body: 'From Dar or Zanzibar when you want wildlife without a long circuit.' },
      { title: 'Overnight', body: 'Worth it for a dawn drive rather than a midday dash from the city.' },
    ],
    attractions: ['Mkata floodplain', 'Hippo pools', 'Dar–south highway access'],
    faqs: [
      { q: 'Is Mikumi a day trip?', a: 'Yes, from Dar es Salaam. An overnight is better if you want a dawn drive. From Zanzibar it is usually a fly-in rather than a same-day ferry-and-drive.' },
      { q: 'How does it compare to Serengeti?', a: 'Smaller, closer to the coast, and a practical add-on. It is not a Great Migration or crater-floor day.' },
      { q: 'Should I skip it for Nyerere?', a: 'If you have three or more park nights, fly to Nyerere. Use Mikumi when time or budget keeps you near Dar.' },
    ],
    facts: [
      ['Region', 'Southern Tanzania, west of Dar es Salaam'],
      ['Landscape', 'Mkata floodplain grassland'],
      ['Best as', 'Day trip or 1-night stay'],
      ['Access', 'Road from Dar or fly-in from the coast'],
      ['Best Time', 'June–October'],
    ],
    location: 'Southern Tanzania, on the Dar es Salaam–Iringa road',
  },
];

export function destinationSlugsFromCopy(text, existing = []) {
  const listed = (Array.isArray(existing) ? existing : []).map((slug) => String(slug || '').trim()).filter(Boolean);
  if (listed.length) return listed;
  const hay = String(text || '').toLowerCase();
  if (!hay.trim()) return [];
  return destinationPlaces
    .filter((place) => {
      if (place.slug === 'safari-from-zanzibar') {
        return /safari from zanzibar|zanzibar safari|fly in from zanzibar/.test(hay);
      }
      const shortName = String(place.name || '')
        .replace(/ National Park| Conservation Area| Archipelago/gi, '')
        .trim()
        .toLowerCase();
      const keys = [place.slug.replace(/-/g, ' '), shortName, ...(place.match || [])];
      return keys.some((key) => {
        const needle = String(key || '').toLowerCase().trim();
        return needle.length > 3 && hay.includes(needle);
      });
    })
    .map((place) => place.slug);
}

export function allDestinations() {
  return destinationPlaces;
}

export function getDestinationBySlug(slug) {
  return destinationPlaces.find((item) => item.slug === slug) || null;
}

export function allDestinationSlugs() {
  return destinationPlaces.map((item) => item.slug);
}

export function relatedDestinations(place, count = 3) {
  const sameRegion = destinationPlaces.filter(
    (item) => item.slug !== place.slug && item.regionSlug === place.regionSlug
  );
  const rest = destinationPlaces.filter(
    (item) => item.slug !== place.slug && item.regionSlug !== place.regionSlug
  );
  return [...sameRegion, ...rest].slice(0, count);
}

export function toursForDestination(place, count = 4) {
  const all = allTours();
  const explicit = (place.tourSlugs || []).map((slug) => all.find((tour) => tour.slug === slug)).filter(Boolean);
  const keys = place.match || [place.slug];
  const rest = all.filter((tour) => {
    if (explicit.includes(tour)) return false;
    const hay = `${tour.title} ${tour.places || ''}`.toLowerCase();
    return keys.some((key) => hay.includes(String(key).toLowerCase()));
  });
  return [...explicit, ...rest].slice(0, count);
}

const LODGE_REGION_KEYS = {
  serengeti: ['serengeti'],
  ngorongoro: ['ngorongoro', 'karatu'],
  tarangire: ['tarangire'],
  'lake-manyara': ['manyara'],
  'arusha-national-park': ['arusha'],
  kilimanjaro: ['kilimanjaro', 'moshi', 'arusha'],
  'lake-eyasi': ['eyasi', 'karatu', 'ngorongoro'],
  zanzibar: ['zanzibar', 'unguja', 'stone'],
  'stone-town': ['zanzibar', 'stone'],
  'safari-from-zanzibar': ['zanzibar'],
  ruaha: ['ruaha'],
  nyerere: ['nyerere', 'selous'],
  mikumi: ['mikumi'],
};

export function lodgesForDestination(place, count = 6) {
  const explicitIds = new Set(place.lodgeIds || []);
  const keys = LODGE_REGION_KEYS[place.slug] || (place.match || [place.slug]).map((key) => String(key).toLowerCase());
  const picked = [];
  const rest = [];
  for (const lodge of lodges) {
    if (explicitIds.has(lodge.id) || explicitIds.has(lodge.name)) {
      picked.push(lodge);
      continue;
    }
    const hay = `${lodge.name} ${lodge.place || ''} ${lodge.region || ''}`.toLowerCase();
    if (keys.some((key) => hay.includes(key))) rest.push(lodge);
  }
  return [...picked, ...rest].slice(0, count);
}

assignUniqueCovers(destinationPlaces);
