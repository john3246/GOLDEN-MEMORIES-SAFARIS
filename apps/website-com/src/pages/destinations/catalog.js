import { galleryPhoto, assignUniqueCovers } from '../../media/gallery.js';
import { media as GM } from '../home/content.js';
import { allTours } from '../tours/catalog.js';

/**
 * Park / place detail records — copy pulled from gmsafaris.co.tz destination pages
 * where they exist; remaining parks follow the same section shape.
 */
export const destinationPlaces = [
  {
    slug: 'serengeti',
    name: 'Serengeti National Park',
    kicker: "Africa's Iconic Wilderness",
    tagline: 'Discover the Endless Plains',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Book your Serengeti safari',
    image: GM.northern,
    gallery: [GM.northern, GM.migration, GM.savanna],
    match: ['serengeti', 'migration'],
    paragraphs: [
      'The Serengeti National Park is a UNESCO World Heritage Site and one of the most iconic safari destinations on Earth. Its name, derived from the Maasai word “Siringet,” meaning “the place where the land runs on forever,” perfectly captures the essence of these vast, endless plains. The Serengeti is synonymous with the Great Migration, the largest overland wildlife migration on the planet, where over 1.5 million wildebeest, 200,000 zebras, and thousands of gazelles traverse the plains in search of fresh grazing.',
      'Beyond the migration, the Serengeti offers exceptional year-round wildlife viewing. The park is home to the Big Five (lion, leopard, elephant, rhino, buffalo) and an astonishing density of predators. The Seronera Valley, in the central Serengeti, is particularly famous for its high concentration of big cats. Whether you are witnessing a river crossing, watching a lioness stalk her prey, or simply taking in the vastness of the plains, the Serengeti is an experience that will stay with you forever.',
    ],
    highlights: [
      { title: 'The Great Migration', body: 'Witness over 1.5 million wildebeest and thousands of zebras on their annual journey.' },
      { title: 'Big Five Destination', body: 'Home to lion, leopard, elephant, rhino, and buffalo.' },
      { title: 'Superb Wildlife Viewing', body: 'Exceptional year-round game viewing with high predator density.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Peak season for wildlife viewing. The migration is in the northern Serengeti, with dramatic Mara River crossings.' },
      { title: 'Wet/Green Season (November–May)', body: 'Calving season (Jan–Feb) in the southern Serengeti (Ndutu area). Lush landscapes, lower rates, and excellent predator action.' },
    ],
    wildlife: [
      'The Big Five: Lion, leopard, African elephant, black rhino, and Cape buffalo.',
      'Predators: Cheetah, hyena, jackal, wild dog, serval.',
      'Herbivores: Wildebeest, zebra, giraffe, impala, topi, eland, gazelle, waterbuck.',
      'Birds: Over 500 species including ostriches, secretary birds, and numerous raptors.',
    ],
    activities: [
      { title: 'Game Drives', body: 'Morning, afternoon, and full-day game drives across the vast plains.' },
      { title: 'Hot Air Balloon Safaris', body: 'Float over the Serengeti at sunrise followed by a champagne breakfast.' },
      { title: 'Walking Safaris', body: 'Guided walking safaris in designated areas with an armed ranger.' },
      { title: 'Cultural Visits', body: 'Visit a Maasai boma to learn about traditional Maasai culture.' },
    ],
    attractions: ['Great Migration', 'Seronera Valley', 'Grumeti River', 'Mara River', 'Olduvai Gorge (nearby)'],
    faqs: [
      { q: 'What is the best time to see the Great Migration?', a: 'The migration is a year-round cycle. Calving season is Jan–Feb in the south (Ndutu). River crossings occur Jun–Oct in the north (Mara River).' },
      { q: 'How do I get to Serengeti National Park?', a: 'You can fly into Seronera Airstrip from Arusha or drive from Arusha (approx. 5–6 hours). Most safaris include transfers.' },
      { q: 'Can I see the Big Five in Serengeti?', a: 'Yes, the Serengeti is one of the best places in Africa to see all members of the Big Five.' },
      { q: 'Is Serengeti safe for tourists?', a: 'Yes, Serengeti is very safe for tourists. All game drives are conducted by experienced guides, and camps have security measures in place.' },
    ],
    facts: [
      ['Size', '14,763 sq km (5,700 sq mi)'],
      ['Established', '1951'],
      ['Location', 'Northern Tanzania, extending to Kenya'],
      ['UNESCO Status', 'World Heritage Site (1981)'],
      ['Main Attractions', 'Great Migration, Seronera Valley, Grumeti River, Mara River'],
      ['Best Time', 'Year-round, depending on migration location'],
    ],
    location: 'Northern Tanzania, extending to Kenya border',
  },
  {
    slug: 'ngorongoro',
    name: 'Ngorongoro Conservation Area',
    kicker: 'A Natural & Cultural Jewel',
    tagline: 'The Ngorongoro Crater & Beyond',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Plan your Ngorongoro safari',
    image: GM.ngorongoro,
    gallery: [GM.ngorongoro, GM.ngorongoroTourists, GM.ngorongoroAlt],
    match: ['ngorongoro', 'crater'],
    paragraphs: [
      'The Ngorongoro Conservation Area is a UNESCO World Heritage Site and one of Africa’s most remarkable natural wonders. At its heart lies the Ngorongoro Crater, the world’s largest intact volcanic caldera, often referred to as “Africa’s Garden of Eden.” This natural amphitheater, spanning 260 square kilometers, is home to an estimated 25,000 large animals, creating one of the highest wildlife densities in Africa.',
      'Beyond the crater, the conservation area encompasses vast highland plains, forests, and lakes. It is also a unique multi-use area where Maasai pastoralists live alongside wildlife. The nearby Olduvai Gorge, often called the “Cradle of Mankind,” is one of the most important paleoanthropological sites in the world, where some of the earliest human remains have been discovered.',
    ],
    highlights: [
      { title: 'The Ngorongoro Crater', body: 'The world’s largest intact volcanic caldera, teeming with wildlife.' },
      { title: 'Incredible Wildlife Density', body: 'Home to approximately 25,000 large animals within the crater.' },
      { title: 'Big Five Sightings', body: 'Excellent chance to see all Big Five, including the endangered black rhino.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Excellent wildlife viewing as animals congregate around water sources. Clear skies and pleasant temperatures.' },
      { title: 'Wet/Green Season (November–May)', body: 'Lush green scenery, fewer crowds, and lower rates. Good for birdwatching and photography.' },
    ],
    wildlife: [
      'The Big Five: Lion, leopard, African elephant, black rhino, and Cape buffalo.',
      'Herbivores: Zebra, wildebeest, gazelle, hippo, warthog, eland, waterbuck.',
      'Predators: Spotted hyena, cheetah, jackal, serval.',
      'Birds: Flamingos (seasonal), ostriches, crowned cranes, and many waterbirds.',
    ],
    activities: [
      { title: 'Crater Game Drive', body: 'Descend into the crater for a half-day or full-day game drive on the crater floor.' },
      { title: 'Olduvai Gorge Visit', body: 'Explore the “Cradle of Mankind” and visit the museum.' },
      { title: 'Maasai Village Visit', body: 'Experience traditional Maasai culture and way of life.' },
      { title: 'Empakaai Crater Hike', body: 'Hike to the rim of Empakaai Crater for stunning views.' },
    ],
    attractions: ['Ngorongoro Crater', 'Olduvai Gorge', 'Empakaai Crater', 'Olmoti Crater', 'Shifting Sands', 'Maasai villages'],
    faqs: [
      { q: 'Can I stay overnight in the Ngorongoro Crater?', a: 'No, overnight stays are not permitted on the crater floor. Accommodation is available on the crater rim.' },
      { q: 'What is the best time to visit Ngorongoro?', a: 'The crater offers excellent wildlife viewing year-round. The dry season (June–October) is ideal for game viewing.' },
      { q: 'How do I get to Ngorongoro from Arusha?', a: 'The drive from Arusha to Ngorongoro takes approximately 3–4 hours. Most safaris include transportation.' },
      { q: 'Can I see black rhinos in Ngorongoro?', a: 'Yes, the Ngorongoro Crater is one of the best places in Tanzania to see the endangered black rhino.' },
    ],
    facts: [
      ['Size', '8,292 sq km (3,202 sq mi)'],
      ['Crater Size', '260 sq km (100 sq mi)'],
      ['Crater Depth', '610 meters (2,000 ft)'],
      ['UNESCO Status', 'World Heritage Site (1979)'],
      ['Location', 'Ngorongoro District, Arusha Region'],
      ['Best Time', 'Year-round, dry season (Jun–Oct) ideal'],
    ],
    location: 'Ngorongoro District, Arusha Region, Tanzania',
  },
  {
    slug: 'tarangire',
    name: 'Tarangire National Park',
    kicker: 'Land of Giants',
    tagline: 'Tarangire: Elephants & Baobabs',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Explore Tarangire',
    image: GM.tarangire,
    gallery: [GM.tarangire, galleryPhoto('tarangire', 1), galleryPhoto('tarangire', 2)],
    match: ['tarangire'],
    paragraphs: [
      'Tarangire National Park is a hidden gem in northern Tanzania, often described as the “Land of Giants” for its massive elephant herds and iconic baobab trees. Spanning 2,850 square kilometers, the park is named after the Tarangire River, which serves as the lifeline for wildlife during the dry season. During this time, the park hosts one of the highest concentrations of wildlife outside the Serengeti.',
      'The park is particularly famous for its elephant population, with herds of up to 300 individuals. The ancient baobab trees, some over 1,000 years old, create a surreal and photogenic landscape. Tarangire is also a birdwatcher’s paradise, with over 550 species recorded, including the rare yellow-collared lovebird. With fewer crowds than the Serengeti, Tarangire offers a more intimate and exclusive safari experience.',
    ],
    highlights: [
      { title: 'Huge Elephant Herds', body: 'Home to some of the largest elephant herds in East Africa, with groups of up to 300.' },
      { title: 'Iconic Baobab Trees', body: 'Ancient baobab trees create a surreal and photogenic landscape.' },
      { title: 'Superb Bird Watching', body: 'Over 550 species, including the rare yellow-collared lovebird.' },
      { title: 'Less Crowded', body: 'Offers a more intimate and exclusive safari experience.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Peak wildlife viewing season. Animals congregate along the Tarangire River, offering exceptional game viewing.' },
      { title: 'Green Season (November–May)', body: 'Lush landscapes, excellent bird watching, and fewer crowds. Some lodges offer reduced rates.' },
    ],
    wildlife: [
      'Elephants: Some of the largest herds in East Africa, with groups of up to 300 individuals.',
      'Predators: Lions, leopards, cheetahs, spotted hyenas, and wild dogs.',
      'Birdlife: Over 550 species including yellow-collared lovebird, ashy starling, and kori bustard.',
      'Other Wildlife: Giraffes, zebras, wildebeests, greater kudu, eland, and oryx.',
    ],
    activities: [
      { title: 'Game Drives', body: 'Morning, afternoon, and full-day game drives along the river and across the park.' },
      { title: 'Walking Safaris', body: 'Guided walking safaris in designated areas with experienced rangers.' },
      { title: 'Bird Watching', body: 'Excellent birding opportunities with over 550 species.' },
      { title: 'Cultural Visits', body: 'Visit Maasai and Barabaig communities near the park.' },
    ],
    attractions: ['Tarangire River', 'Baobab trees', 'Silale Swamp', 'Matete Woodlands', 'Kitibong Hill viewpoint'],
    faqs: [
      { q: 'How far is Tarangire from Arusha?', a: 'Tarangire National Park is approximately a 2-hour drive from Arusha, making it easily accessible for day trips.' },
      { q: 'What is Tarangire best known for?', a: 'Tarangire is best known for its massive elephant herds, iconic baobab trees, and excellent bird watching.' },
      { q: 'Is Tarangire less crowded than Serengeti?', a: 'Yes, Tarangire receives far fewer visitors than Serengeti, offering a more intimate safari experience.' },
      { q: 'What is the best time to visit Tarangire?', a: 'The dry season (June to October) is the best time for wildlife viewing as animals gather around the Tarangire River.' },
    ],
    facts: [
      ['Size', '2,850 sq km (1,100 sq mi)'],
      ['Established', '1970'],
      ['Location', 'Manyara Region, Northern Tanzania'],
      ['Main Attractions', 'Elephant herds, baobab trees, Tarangire River'],
      ['Bird Species', 'Over 550 species'],
      ['Best Time', 'June to October (dry season)'],
    ],
    location: 'Manyara Region, Northern Tanzania',
  },
  {
    slug: 'lake-manyara',
    name: 'Lake Manyara National Park',
    kicker: 'Rift Valley Gem',
    tagline: 'Lake Manyara: Lions in Trees & Pink Hues',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Plan your Manyara safari',
    image: GM.manyara,
    gallery: [GM.manyara, GM.ngorongoroAlt, GM.tarangire],
    match: ['manyara'],
    paragraphs: [
      'Nestled dramatically at the base of the Great Rift Valley escarpment, Lake Manyara National Park offers a compact yet incredibly diverse safari experience. Famous for its elusive tree-climbing lions and the vast flocks of flamingos that tinge the alkaline lake pink, Manyara provides a beautiful introduction or addition to a northern circuit safari.',
      'Explore the unique groundwater forest teeming with baboons and monkeys, drive along the scenic lakeshore watching hippos and water birds, and marvel at the stunning backdrop of the rift wall. Despite its smaller size, Manyara packs a punch with varied habitats and surprising wildlife encounters.',
    ],
    highlights: [
      { title: 'Tree-Climbing Lions', body: 'One of the best places in Tanzania to potentially spot lions resting in acacia trees.' },
      { title: 'Flamingo Flocks', body: 'Witness thousands of pink flamingos wading in the alkaline lake.' },
      { title: 'Abundant Birdlife', body: 'Over 400 species recorded, including waterfowl, raptors, and forest birds.' },
      { title: 'Groundwater Forest', body: 'Explore a unique, lush forest environment fed by underground springs.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Easier wildlife viewing as animals congregate near water. Tree-climbing lions are often easier to spot in sparser vegetation.' },
      { title: 'Wet Season (November–May)', body: 'Lush green scenery and landscape. More flamingos as the lake fills with water.' },
    ],
    wildlife: [
      'Tree-Climbing Lions: While not guaranteed, Manyara is famous for this unusual behaviour, often seen resting in sausage or acacia trees.',
      'Baboons: Home to some of Africa’s largest troops. Blue monkeys are also common in the forest.',
      'Elephants: Present year-round, often seen browsing in the woodlands or near the water.',
      'Birds: Thousands of flamingos feed in the algae-rich lake, alongside pelicans, storks, cormorants, and hornbills.',
    ],
    activities: [
      { title: 'Game Drives', body: 'Explore the park’s diverse habitats on a game drive along the lakeshore.' },
      { title: 'Bird Watching', body: 'Excellent birding opportunities with over 400 species including flamingos.' },
      { title: 'Photography', body: 'Stunning landscapes with the Rift Valley escarpment backdrop.' },
      { title: 'Cultural Visits', body: 'Visit local communities near the park.' },
    ],
    attractions: ['Lake Manyara', 'Rift Valley escarpment', 'Groundwater Forest', 'Tree-climbing lions'],
    faqs: [
      { q: 'What is Lake Manyara best known for?', a: 'Lake Manyara is best known for its tree-climbing lions, vast flocks of flamingos, and stunning Rift Valley scenery.' },
      { q: 'How far is Lake Manyara from Arusha?', a: 'Lake Manyara is approximately a 2-hour drive from Arusha, making it easily accessible.' },
      { q: 'Can I see tree-climbing lions in Lake Manyara?', a: 'While not guaranteed, Lake Manyara is one of the best places in Africa to see this unusual behaviour.' },
      { q: 'What is the best time to visit Lake Manyara?', a: 'The park offers good wildlife viewing year-round. The dry season (June–October) is ideal for game viewing.' },
    ],
    facts: [
      ['Size', '330 sq km (127 sq mi)'],
      ['Established', '1960'],
      ['Location', 'Manyara Region, Northern Tanzania'],
      ['Main Attractions', 'Tree-climbing lions, Lake Manyara, Rift Valley escarpment'],
      ['Bird Species', 'Over 400 species'],
      ['Best Time', 'Year-round, dry season (Jun–Oct) ideal'],
    ],
    location: 'Manyara Region, Northern Tanzania',
  },
  {
    slug: 'arusha-national-park',
    name: 'Arusha National Park',
    kicker: "Tanzania's Scenic Microcosm",
    tagline: 'Explore Diverse Arusha National Park',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Plan your Arusha National Park visit',
    image: GM.meru,
    gallery: [GM.meru, GM.materuni, GM.kilimanjaro],
    match: ['arusha national', 'meru', 'momella', 'momela'],
    paragraphs: [
      'Arusha National Park, a hidden gem in northern Tanzania, offers a remarkable diversity of landscapes within a relatively small area. From the towering peak of Mount Meru to the tranquil Momella Lakes and the lush montane forests, this park is a microcosm of Tanzania’s natural beauty. Located just a short drive from Arusha town, it is the perfect destination for a day trip or a multi-day adventure.',
      'The park is dominated by Mount Meru (4,566m), Tanzania’s second-highest mountain, which provides a stunning backdrop for game drives and walking safaris. The Momella Lakes, a series of seven alkaline lakes, are a haven for birdlife, including seasonal flamingos. The Ngurdoto Crater, often called “Little Ngorongoro,” offers a unique caldera experience. With its diverse habitats, Arusha National Park is a paradise for nature lovers, hikers, and photographers.',
    ],
    highlights: [
      { title: 'Colobus Monkey Haven', body: 'Spot the striking black-and-white colobus monkeys leaping through the canopy.' },
      { title: 'Walking Safaris', body: 'One of the few parks in Tanzania where guided walking safaris are permitted.' },
      { title: 'Mount Meru Backdrop', body: 'Tanzania’s second-highest peak provides a dramatic and scenic backdrop.' },
      { title: 'Momella Lakes', body: 'Seven alkaline lakes offering stunning scenery and excellent birdwatching.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Peak wildlife viewing season. Clear skies and optimal hiking conditions for Mount Meru climbs.' },
      { title: 'Wet/Green Season (November–May)', body: 'Lush green landscapes, abundant birdlife, and fewer crowds. The park is at its most beautiful.' },
    ],
    wildlife: [
      'Primates: Black-and-white colobus monkeys, blue monkeys, and olive baboons.',
      'Mammals: Giraffes, buffaloes, zebras, warthogs, bushbucks, waterbucks, and duikers.',
      'Birds: Over 400 species, including flamingos (seasonal), turacos, trogons, bee-eaters, and fish eagles.',
      'Predators: Leopards (rarely seen), hyenas, and jackals.',
    ],
    activities: [
      { title: 'Walking Safaris', body: 'Guided walking safaris through the forest and along the lakeshores.' },
      { title: 'Canoeing on Momella Lakes', body: 'Paddle across the serene Momella Lakes with views of Mount Meru.' },
      { title: 'Game Drives', body: 'Explore the park’s diverse habitats on a game drive.' },
      { title: 'Mount Meru Climb', body: 'Multi-day trek to the summit of Tanzania’s second-highest peak.' },
    ],
    attractions: ['Mount Meru', 'Momella Lakes', 'Ngurdoto Crater', 'Montane Forest', 'Fig Tree Arch'],
    faqs: [
      { q: 'How far is Arusha National Park from Arusha?', a: 'The park is approximately 45 minutes to 1 hour drive from Arusha town center.' },
      { q: 'Can I do a walking safari in Arusha National Park?', a: 'Yes, Arusha National Park is one of the few parks in Tanzania where guided walking safaris are permitted.' },
      { q: 'What is the best time to visit Arusha National Park?', a: 'The dry season (June to October) is ideal for wildlife viewing and hiking. The green season (November to May) offers lush landscapes and excellent birdwatching.' },
      { q: 'Can I see Mount Kilimanjaro from Arusha National Park?', a: 'Yes, on clear days you can see Mount Kilimanjaro in the distance, especially from higher elevations.' },
    ],
    facts: [
      ['Size', '552 sq km (137 sq mi)'],
      ['Established', '1960'],
      ['Location', 'Arusha Region, Northern Tanzania'],
      ['Highest Point', 'Mount Meru (4,566m)'],
      ['Main Attractions', 'Mount Meru, Momella Lakes, Ngurdoto Crater'],
      ['Best Time', 'June to October (dry season)'],
    ],
    location: 'Arusha Region, Northern Tanzania',
  },
  {
    slug: 'kilimanjaro',
    name: 'Mount Kilimanjaro',
    kicker: 'Conquer the Legend',
    tagline: 'The Ultimate Kilimanjaro Trek',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Start your Kilimanjaro adventure',
    image: GM.kilimanjaro,
    gallery: [GM.kilimanjaro, GM.machame, galleryPhoto('kilimanjaro', 3)],
    match: ['kilimanjaro', 'machame', 'marangu', 'lemosho', 'umbwe'],
    paragraphs: [
      'Embark on the adventure of a lifetime: climbing Mount Kilimanjaro. Standing at 5,895 meters (19,341 ft), it’s not just Africa’s highest peak but also the world’s tallest free-standing mountain, rising dramatically from the surrounding plains. Reaching the summit, Uhuru Peak, is a profound personal achievement accessible to determined hikers.',
      'The journey takes you through breathtakingly diverse ecological zones, from tropical rainforest to alpine desert and finally to the arctic conditions of the summit’s glaciers. With Golden Memories Safaris, you’ll have experienced guides, a dedicated support crew, and a focus on safety and acclimatization, maximizing your chances of successfully standing on the Roof of Africa.',
    ],
    highlights: [
      { title: 'Reach a “Seven Summit”', body: 'Join an elite group by conquering one of the world’s continental high points.' },
      { title: 'Stand on Africa’s Roof', body: 'Experience the sunrise from the highest point on the continent.' },
      { title: 'Achievable Hiking Summit', body: 'No technical climbing gear or experience needed, just fitness and determination.' },
      { title: 'Journey Through Ecosystems', body: 'Trek through 5 distinct climate zones in just a matter of days.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Peak climbing season. Clear skies, less precipitation, and optimal summit conditions.' },
      { title: 'Warm Season (December–March)', body: 'Second best season. Warmer temperatures at lower elevations. Good summit conditions.' },
      { title: 'Wet Season (March–May & November)', body: 'Heavy rainfall on the lower slopes. Snow and ice at the summit. Fewer crowds but more challenging conditions.' },
    ],
    wildlife: [
      'Montane Forest: Colobus monkeys, blue monkeys, bushbucks, duikers, and numerous bird species.',
      'Moorland Zone: Unique high-altitude plants like giant lobelias and senecios.',
      'Alpine Zone: Minimal wildlife; occasional sightings of klipspringer and high-flying birds.',
      'Birds: White-necked ravens, augur buzzards, sunbirds, and the majestic lammergeyer (bearded vulture).',
    ],
    activities: [
      { title: 'Kilimanjaro Climb', body: 'Multi-day trek to the summit of Africa’s highest peak.' },
      { title: 'Route Selection', body: 'Choose from Machame, Lemosho, Marangu, Rongai, or Northern Circuit routes.' },
      { title: 'Acclimatization Hikes', body: 'Extra days for better acclimatization and higher summit success rates.' },
      { title: 'Photography', body: 'Capture stunning landscapes, glaciers, and sunrise from the summit.' },
    ],
    attractions: ['Uhuru Peak', 'Glaciers', '5 ecological zones', 'Machame Route', 'Lemosho Route', 'Marangu Route'],
    faqs: [
      { q: 'Do I need climbing experience to climb Kilimanjaro?', a: 'No, Kilimanjaro is a non-technical climb. No ropes or climbing gear are needed. Good physical fitness and determination are the key requirements.' },
      { q: 'What is the best route to climb Kilimanjaro?', a: 'The best route depends on your preferences. Machame and Lemosho are popular for scenery. Marangu is the only route with hut accommodation. Longer routes (7+ days) offer better acclimatization.' },
      { q: 'How fit do I need to be to climb Kilimanjaro?', a: 'Good cardiovascular fitness is essential. Regular hiking, jogging, or stair-climbing in the months before your climb will greatly improve your experience and chances of success.' },
      { q: 'What is the success rate for summiting Kilimanjaro?', a: 'Overall success rates vary from 50–80%. Longer routes (7–9 days) have significantly higher success rates (over 85%) due to better acclimatization.' },
    ],
    facts: [
      ['Height', '5,895m (19,341 ft)'],
      ['Location', 'Kilimanjaro Region, Tanzania'],
      ['First Ascent', '1889 by Hans Meyer & Ludwig Purtscheller'],
      ['Difficulty', 'Moderate (non-technical)'],
      ['Duration', '5–9 days depending on route'],
      ['Best Time', 'June–October & December–March'],
    ],
    location: 'Kilimanjaro Region, Tanzania',
  },
  {
    slug: 'lake-eyasi',
    name: 'Lake Eyasi',
    kicker: 'Off the Beaten Track',
    tagline: 'Lake Eyasi Cultural Adventure',
    region: 'Northern Tanzania',
    regionSlug: 'northern-tanzania',
    cta: 'Experience Lake Eyasi',
    image: GM.lakeEyasi,
    gallery: [GM.lakeEyasi, GM.materuni, GM.manyara],
    match: ['eyasi'],
    paragraphs: [
      'Lake Eyasi is a remote and seasonal shallow salt lake located south of the Serengeti and Ngorongoro Highlands. Unlike the wildlife-focused destinations of northern Tanzania, Lake Eyasi offers a unique cultural experience. It is home to the Hadzabe people, one of Africa’s last remaining hunter-gatherer tribes, and the Datoga people, traditional pastoralists and blacksmiths.',
      'A visit to Lake Eyasi is a journey into a way of life that has remained largely unchanged for thousands of years. You can join the Hadzabe on a hunting expedition, learn about Datoga blacksmithing and pottery, and experience traditional songs and dances. The lake itself, when it has water, attracts a variety of birdlife. Lake Eyasi is a must-visit for those seeking authentic cultural encounters and off-the-beaten-path adventures.',
    ],
    highlights: [
      { title: 'Hadzabe Tribe', body: 'Meet one of Africa’s last hunter-gatherer tribes and learn their ancient way of life.' },
      { title: 'Datoga Tribe', body: 'Visit traditional pastoralists and blacksmiths, known for their metalworking skills.' },
      { title: 'Authentic Experiences', body: 'Join hunting expeditions, learn pottery, and experience traditional songs and dances.' },
      { title: 'Remote Adventure', body: 'Experience one of Tanzania’s most remote and untouched regions.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Best time for cultural visits and easier access. Good conditions for hunting expeditions with the Hadzabe.' },
      { title: 'Wet Season (November–May)', body: 'Green landscapes but roads can be challenging. Fewer visitors.' },
    ],
    wildlife: [
      'Birds: Flamingos, pelicans, storks, and various waterbirds when the lake has water.',
      'Mammals: Occasional sightings of zebras, giraffes, and small antelopes in the surrounding areas.',
      'Unique Flora: Acacia woodlands and scrubland typical of the Rift Valley.',
    ],
    activities: [
      { title: 'Hadzabe Hunting Trip', body: 'Join the Hadzabe on a traditional hunting expedition with bows and arrows.' },
      { title: 'Honey Collecting', body: 'Learn traditional honey collecting techniques from the Hadzabe.' },
      { title: 'Traditional Dances', body: 'Experience traditional songs and dances of the Hadzabe and Datoga.' },
      { title: 'Datoga Pottery', body: 'Learn about traditional Datoga pottery and blacksmithing.' },
    ],
    attractions: ['Hadzabe tribe', 'Datoga tribe', 'Lake Eyasi', 'Hunting expeditions', 'Traditional blacksmithing'],
    faqs: [
      { q: 'How do I get to Lake Eyasi?', a: 'Lake Eyasi is accessible by 4x4 vehicle from Karatu or Ngorongoro (approx. 2–3 hours). The road is rough but scenic.' },
      { q: 'What is the best time to visit Lake Eyasi?', a: 'The dry season (June–October) offers the best conditions for cultural visits and easier access.' },
      { q: 'Can I stay overnight at Lake Eyasi?', a: 'Yes, there are basic camps and lodges near Lake Eyasi offering accommodation.' },
      { q: 'Is Lake Eyasi safe for tourists?', a: 'Yes, Lake Eyasi is safe for tourists. Local guides accompany all cultural visits and activities.' },
    ],
    facts: [
      ['Location', 'Manyara Region, Northern Tanzania'],
      ['Lake Type', 'Seasonal shallow salt lake'],
      ['Main Tribes', 'Hadzabe (hunter-gatherers), Datoga (pastoralists)'],
      ['Best Time', 'June–October (dry season)'],
    ],
    location: 'Manyara Region, Northern Tanzania',
  },
  {
    slug: 'zanzibar',
    name: 'Zanzibar Archipelago',
    kicker: 'Islands of Spice & Splendor',
    tagline: 'Discover the Zanzibar Archipelago',
    region: 'The Coast',
    regionSlug: 'the-coast',
    cta: 'Plan your island getaway',
    image: GM.zanzibarBeach,
    gallery: [GM.zanzibarBeach, GM.spice, GM.coast],
    match: ['zanzibar', 'spice', 'stone town', 'coast', 'unguja'],
    paragraphs: [
      'Beyond the famous main island lies the captivating Zanzibar Archipelago, a collection of islands scattered in the Indian Ocean off the coast of Tanzania. From the historical depths of Stone Town and the aromatic allure of spice plantations to the pristine beaches ideal for relaxation and vibrant coral reefs perfect for diving and snorkeling.',
      'The heart and soul of Zanzibar, Stone Town is a maze of narrow streets, historic buildings, and bustling markets. A UNESCO World Heritage Site, it bears witness to the island’s rich trading history. The archipelago includes Unguja (the main island) and Pemba Island, known as the “Green Island” for its lush hills and clove production.',
    ],
    highlights: [
      { title: 'World-Class Beaches', body: 'Pristine white sands and turquoise waters awaiting you.' },
      { title: 'Rich History & Culture', body: 'Explore UNESCO World Heritage Stone Town.' },
      { title: 'The Spice Islands', body: 'Discover cloves, nutmeg, cinnamon and more on spice tours.' },
      { title: 'Diving & Snorkeling', body: 'Vibrant coral reefs and marine life.' },
    ],
    seasons: [
      { title: 'June–October (Dry Season)', body: 'Best weather, lowest humidity. Clear skies, calm seas.' },
      { title: 'November–March (Warmer)', body: 'Warmer but pleasant. Good for beach activities.' },
    ],
    wildlife: [
      'Marine Life: Coral reefs with tropical fish, sea turtles, dolphins, humpback whales (seasonal).',
      'Jozani Forest: Home to the endemic Zanzibar red colobus monkey.',
      'Birds: Various seabirds, flamingos, and migratory species.',
      'Marine Parks: Mnemba Atoll and Chumbe Island Coral Park for snorkeling and diving.',
    ],
    activities: [
      { title: 'Stone Town Tour', body: 'Explore the historic UNESCO World Heritage Site.' },
      { title: 'Spice Tour', body: 'Visit spice plantations and learn about Zanzibar’s spice heritage.' },
      { title: 'Beach Relaxation', body: 'Enjoy pristine beaches in Nungwi, Kendwa, and Paje.' },
      { title: 'Sunset Dhow Cruise', body: 'Traditional sailing experience at sunset.' },
    ],
    attractions: ['Stone Town', 'Spice Plantations', 'Nungwi Beach', 'Kendwa Beach', 'Mnemba Atoll', 'Pemba Island', 'Jozani Forest'],
    faqs: [
      { q: 'How do I get to Zanzibar?', a: 'You can fly directly to Zanzibar International Airport (ZNZ) from many international destinations, or take a ferry from Dar es Salaam (approx. 2 hours).' },
      { q: 'Do I need a visa for Zanzibar?', a: 'Zanzibar is part of Tanzania. Most visitors need a Tanzania visa, which can be obtained on arrival or online in advance.' },
      { q: 'What is the best time to visit Zanzibar?', a: 'June to October offers the best weather with low humidity and clear skies. November to March is warmer but still pleasant.' },
      { q: 'Is Zanzibar safe for tourists?', a: 'Yes, Zanzibar is generally safe for tourists. Standard precautions apply, especially in crowded areas and at night.' },
    ],
    facts: [
      ['Location', 'Indian Ocean, off Tanzania coast'],
      ['Main Islands', 'Unguja (Zanzibar) and Pemba'],
      ['Capital', 'Zanzibar City (Stone Town)'],
      ['Language', 'Swahili, English'],
      ['Best Time', 'June–October (dry season)'],
    ],
    location: 'Indian Ocean, off the coast of Tanzania',
  },
  {
    slug: 'stone-town',
    name: 'Stone Town & spice tours',
    kicker: 'UNESCO streets & spice farms',
    tagline: 'Carved doors, waterfront lanes, and the spice trade',
    region: 'The Coast',
    regionSlug: 'the-coast',
    cta: 'Plan a Stone Town day',
    image: GM.spice,
    gallery: [GM.spice, GM.zanzibarBeach, galleryPhoto('zanzibar', 4)],
    match: ['stone town', 'spice'],
    paragraphs: [
      'Stone Town is a maze of narrow streets, historic buildings, and bustling markets. A UNESCO World Heritage Site, it bears witness to the island’s rich trading history. A walking day here sits naturally after a northern safari, before you continue to the east or north coast beaches.',
      'A spice farm visit explains why the islands were once the heart of the spice trade — cloves, nutmeg, cinnamon, and vanilla, with tasting and stories from the plantation.',
    ],
    highlights: [
      { title: 'UNESCO Stone Town', body: 'Carved doors, waterfront lanes, and a living Swahili city.' },
      { title: 'Spice farm', body: 'A guided plantation visit that makes the spice islands tangible.' },
      { title: 'Fits a rest day', body: 'Useful as a stopover or a day between safari and beach.' },
    ],
    seasons: [
      { title: 'June–October', body: 'Drier, cooler walking weather in town.' },
      { title: 'November–March', body: 'Warmer; still a good day trip between beach nights.' },
    ],
    wildlife: ['Jozani Forest red colobus if you add a forest stop.', 'Harbour birdlife along the waterfront.'],
    activities: [
      { title: 'Stone Town walking', body: 'Guided lanes, markets, and the waterfront.' },
      { title: 'Spice tour', body: 'Farm visit with tasting and local lunch.' },
    ],
    attractions: ['Stone Town', 'Spice plantations', 'Forodhani waterfront'],
    faqs: [
      { q: 'Can Stone Town be a day tour?', a: 'Yes. Morning in Stone Town and afternoon on a spice farm (or the reverse) is the usual shape.' },
      { q: 'Is it after the safari?', a: 'Most guests add it as a rest day on Unguja before or after beach nights.' },
    ],
    facts: [
      ['Location', 'Unguja, Zanzibar'],
      ['Status', 'UNESCO World Heritage Site'],
      ['Best with', 'Beach holiday or safari-and-coast itinerary'],
    ],
    location: 'Zanzibar City, Unguja',
  },
  {
    slug: 'safari-from-zanzibar',
    name: 'Safari from Zanzibar',
    kicker: 'When beach days come first',
    tagline: 'Fly in for Tarangire and Ngorongoro, then return to the coast',
    region: 'The Coast',
    regionSlug: 'the-coast',
    cta: 'Plan a fly-in safari',
    image: GM.ngorongoroAlt,
    gallery: [GM.ngorongoroAlt, GM.tarangire, GM.zanzibarBeach],
    match: ['zanzibar', 'tarangire', 'ngorongoro'],
    paragraphs: [
      'Fly from Zanzibar for Tarangire and Ngorongoro, then return to the coast — a compact wildlife add-on when beach days come first.',
      'Golden Memories Safaris arranges the flights, park days, and overnight lodge so the circuit stays short without losing the crater floor or the baobabs.',
    ],
    highlights: [
      { title: 'Flights from Zanzibar', body: 'Skip the long Arusha road when your holiday starts on the island.' },
      { title: 'Tarangire', body: 'Elephants and baobabs on day one.' },
      { title: 'Ngorongoro Crater', body: 'A crater-floor game drive before you fly back.' },
    ],
    seasons: [
      { title: 'June–October', body: 'Strongest wildlife concentrations in both parks.' },
      { title: 'Year-round', body: 'Possible whenever flights and lodges are open; we time the crater day to your dates.' },
    ],
    wildlife: ['Tarangire elephants and baobab country.', 'Ngorongoro crater-floor Big Five chance, including black rhino.'],
    activities: [
      { title: 'Two-day circuit', body: 'Mainland parks with an overnight, then back to Unguja.' },
      { title: 'Private guiding', body: 'Your vehicle and guide wait on the mainland.' },
    ],
    attractions: ['Tarangire National Park', 'Ngorongoro Crater', 'Zanzibar flights'],
    faqs: [
      { q: 'How long is the fly-in safari?', a: 'The listed package is two days: Tarangire, overnight, then Ngorongoro and return to Zanzibar.' },
      { q: 'Can it be longer?', a: 'Yes. Add Serengeti nights if you have more time on the mainland.' },
    ],
    facts: [
      ['Start', 'Zanzibar'],
      ['Parks', 'Tarangire & Ngorongoro'],
      ['Duration', 'Typically 2 days'],
    ],
    location: 'Northern circuit, reached from Zanzibar',
  },
  {
    slug: 'ruaha',
    name: 'Ruaha National Park',
    kicker: 'Quieter parks',
    tagline: 'Tanzania’s largest national park',
    region: 'Southern Tanzania',
    regionSlug: 'southern-tanzania',
    cta: 'Plan a Ruaha safari',
    image: GM.southern,
    gallery: [GM.southern, GM.savanna, GM.selous],
    match: ['ruaha'],
    paragraphs: [
      'Ruaha is Tanzania’s largest national park: baobab ridges, the Great Ruaha River, and outstanding predator country. It rewards travellers who want space, walking potential, and fewer vehicles on the road than the northern circuit.',
      'Golden Memories Safaris shapes southern itineraries around riverine game drives, fly-in or drive options, and enough nights to settle into the park rather than rush the transfer.',
    ],
    highlights: [
      { title: 'Largest national park', body: 'Room to roam — baobab ridges and the Great Ruaha River.' },
      { title: 'Predator country', body: 'Lion, leopard, and wild dog in wilder, quieter landscape.' },
      { title: 'Fewer vehicles', body: 'A southern circuit that feels less busy than Serengeti roads.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Wildlife concentrates along the Great Ruaha River. Best game viewing.' },
      { title: 'Green Season (November–May)', body: 'Lush, photogenic, and quieter still. Some camps close in peak rains.' },
    ],
    wildlife: [
      'Elephants, buffalo, giraffe, kudu, and sable in mixed woodland.',
      'Predators: lion, leopard, cheetah, and African wild dog.',
      'Outstanding birdlife along the river.',
    ],
    activities: [
      { title: 'Game drives', body: 'Riverine circuits and baobab ridges.' },
      { title: 'Walking (where camp allows)', body: 'Guided walks in designated areas.' },
    ],
    attractions: ['Great Ruaha River', 'Baobab ridges', 'Mwagusi Sand River'],
    faqs: [
      { q: 'How do I get to Ruaha?', a: 'Most guests fly from Dar es Salaam or Arusha. Overland is possible on a longer southern itinerary.' },
      { q: 'Is Ruaha good for first-time visitors?', a: 'Yes, if you want space. First-timers who need classic migration often start in the north, then add Ruaha on a longer trip.' },
    ],
    facts: [
      ['Region', 'Southern Tanzania'],
      ['Known for', 'River, baobabs, predators'],
      ['Best Time', 'June to October'],
    ],
    location: 'Southern Tanzania',
  },
  {
    slug: 'nyerere',
    name: 'Nyerere (Selous)',
    kicker: 'Boat safari country',
    tagline: 'The Rufiji and a wilder southern reserve',
    region: 'Southern Tanzania',
    regionSlug: 'southern-tanzania',
    cta: 'Plan a Nyerere safari',
    image: GM.selous,
    gallery: [GM.selous, GM.southern, GM.dayTrip],
    match: ['selous', 'nyerere', 'rufiji'],
    paragraphs: [
      'Nyerere National Park — still widely known as Selous — is boat-safari country on the Rufiji, with fly-camp energy and a wilder southern circuit than the north.',
      'Hippo, crocodile, and kingfishers from the water, then woodland and lakes on game drives. It pairs naturally with Ruaha on an eight-day south itinerary.',
    ],
    highlights: [
      { title: 'Rufiji boat safari', body: 'A different pace from a 4x4 day — river, hippo, and birds.' },
      { title: 'Wilder roads', body: 'Fewer vehicles than the classic northern parks.' },
      { title: 'Pairs with Ruaha', body: 'Fly or drive between the two southern heavyweights.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Strongest game viewing and reliable boat days.' },
      { title: 'Green Season', body: 'Lush and bird-rich; some camps seasonal.' },
    ],
    wildlife: ['Hippo and crocodile on the Rufiji.', 'Lion, elephant, wild dog, and a huge bird list.', 'Lakes and woodland game drives.'],
    activities: [
      { title: 'Boat safari', body: 'On the Rufiji for hippo, crocodile, and kingfishers.' },
      { title: 'Game drives', body: 'Morning and afternoon in lakes and woodland.' },
    ],
    attractions: ['Rufiji River', 'Lakes', 'Fly-camp energy'],
    faqs: [
      { q: 'Is it still called Selous?', a: 'The park is officially Nyerere National Park. Many travellers still search for Selous — we use both names so you can find it.' },
      { q: 'Boat and drive in one stay?', a: 'Yes. A typical stay mixes a Rufiji boat day with 4x4 circuits.' },
    ],
    facts: [
      ['Region', 'Southern Tanzania'],
      ['Known for', 'Rufiji boat safari'],
      ['Best Time', 'June to October'],
    ],
    location: 'Southern Tanzania',
  },
  {
    slug: 'mikumi',
    name: 'Mikumi National Park',
    kicker: 'Open grassland',
    tagline: 'A practical fly-in day from the coast or Dar',
    region: 'Southern Tanzania',
    regionSlug: 'southern-tanzania',
    cta: 'Plan Mikumi',
    image: GM.dayTrip,
    gallery: [GM.dayTrip, GM.southern, GM.selous],
    match: ['mikumi'],
    paragraphs: [
      'Mikumi is open grassland and a practical fly-in day trip from the coast or Dar es Salaam — a taste of the savannah when time is short.',
      'It sits on the southern circuit as a first or last park: zebra, giraffe, and lion on the plains, without the logistics of a full Ruaha stay.',
    ],
    highlights: [
      { title: 'Accessible savannah', body: 'Useful from Dar or as a fly-in from Zanzibar.' },
      { title: 'Open grassland', body: 'Classic plains game in a compact park.' },
    ],
    seasons: [
      { title: 'Dry Season (June–October)', body: 'Best visibility on the plains.' },
      { title: 'Green Season', body: 'Lush and quieter; still workable as a day trip.' },
    ],
    wildlife: ['Zebra, wildebeest, giraffe, buffalo, elephant, and lion on the plains.', 'Hippo pools and a strong bird list.'],
    activities: [
      { title: 'Game drives', body: 'Half-day or full-day on the Mkata floodplain.' },
      { title: 'Fly-in day', body: 'From the coast when you want wildlife without a long circuit.' },
    ],
    attractions: ['Mkata floodplain', 'Hippo pools'],
    faqs: [
      { q: 'Is Mikumi a day trip?', a: 'Yes, from Dar es Salaam or as a fly-in. Overnight stays are better if you want a dawn drive.' },
      { q: 'How does it compare to Serengeti?', a: 'Smaller, closer to the coast, and a practical add-on rather than a migration spectacle.' },
    ],
    facts: [
      ['Region', 'Southern Tanzania'],
      ['Best as', 'Day trip or short stay'],
      ['Access', 'Road from Dar or fly-in'],
    ],
    location: 'Southern Tanzania',
  },
  {
    slug: 'gombe',
    name: 'Gombe Stream National Park',
    kicker: 'Chimpanzee country',
    tagline: 'Jane Goodall’s forest on Lake Tanganyika',
    region: 'Western Tanzania',
    regionSlug: 'western-tanzania',
    cta: 'Plan chimpanzee trekking',
    image: GM.western,
    gallery: [GM.western, GM.savanna, GM.meru],
    match: ['gombe', 'chimpanzee', 'chimp'],
    paragraphs: [
      'Gombe Stream National Park is Jane Goodall’s forest on Lake Tanganyika — compact, steep, and devoted to chimpanzee trekking.',
      'This is not a classic game-drive park. You boat along the lake, then walk into forest with a guide. It belongs on longer Tanzania journeys that already include the north or south.',
    ],
    highlights: [
      { title: 'Chimpanzee trekking', body: 'The reason to come west — habituated chimps in steep forest.' },
      { title: 'Lake Tanganyika', body: 'Forest and boat days rather than savannah 4x4 circuits.' },
      { title: 'Compact park', body: 'Small, intense, and unlike the northern circuit.' },
    ],
    seasons: [
      { title: 'Dry Season (May–October)', body: 'Easier forest walking and more reliable chimp tracking.' },
      { title: 'Rains', body: 'Possible but steeper, muddier trails.' },
    ],
    wildlife: ['Chimpanzees — the focus of every visit.', 'Colobus, baboons, forest birds, and the lake shore.'],
    activities: [
      { title: 'Chimp trekking', body: 'Guided forest walks to habituated communities.' },
      { title: 'Lake boat', body: 'Access and scenery along Tanganyika.' },
    ],
    attractions: ['Chimpanzee trekking', 'Lake Tanganyika', 'Forest trails'],
    faqs: [
      { q: 'Is Gombe a game-drive park?', a: 'No. You trek on foot. Combine it with a northern or southern safari if you also want 4x4 wildlife.' },
      { q: 'How do I get there?', a: 'Typically fly to Kigoma, then boat to the park. We build this into a longer itinerary.' },
    ],
    facts: [
      ['Region', 'Western Tanzania'],
      ['Focus', 'Chimpanzee trekking'],
      ['Setting', 'Lake Tanganyika forest'],
    ],
    location: 'Western Tanzania, Lake Tanganyika',
  },
  {
    slug: 'mahale',
    name: 'Mahale Mountains',
    kicker: 'Remoter chimp habitat',
    tagline: 'Lake beaches and a fly-in forest stay',
    region: 'Western Tanzania',
    regionSlug: 'western-tanzania',
    cta: 'Plan Mahale',
    image: GM.savanna,
    gallery: [GM.savanna, GM.western, GM.zanzibarBeach],
    match: ['mahale'],
    paragraphs: [
      'Mahale is remoter chimpanzee habitat, lake beaches, and a fly-in stay that pairs with a longer Tanzania itinerary.',
      'Unlike Gombe’s compact trails, Mahale is a slower, lodge-based forest experience on Tanganyika — chimps inland, swimming and boat time on the lake.',
    ],
    highlights: [
      { title: 'Fly-in forest', body: 'A destination stay, not a day trip from Arusha.' },
      { title: 'Chimps and beach', body: 'Trekking inland, lake time in the afternoon.' },
      { title: 'Pairs with a longer trip', body: 'Add after the north or south when you have extra nights.' },
    ],
    seasons: [
      { title: 'Dry Season (May–October)', body: 'Best forest walking and chimp viewing.' },
      { title: 'Shoulder months', body: 'Possible with flexible walking; some camps seasonal.' },
    ],
    wildlife: ['Chimpanzees in Mahale forest.', 'Lake shore birds, colobus, and the occasional hippo in bays.'],
    activities: [
      { title: 'Chimp trekking', body: 'Guided forest days from camp.' },
      { title: 'Lake time', body: 'Boat, snorkel, or simply the beach after the walk.' },
    ],
    attractions: ['Mahale Mountains', 'Lake Tanganyika beaches', 'Chimpanzee habitat'],
    faqs: [
      { q: 'Gombe or Mahale?', a: 'Gombe is shorter and closer to Kigoma. Mahale is a fly-in lodge stay with more lake time. We help you choose by nights and budget.' },
      { q: 'Can it combine with Serengeti?', a: 'Yes, as a fly-in add-on after the northern circuit on a longer journey.' },
    ],
    facts: [
      ['Region', 'Western Tanzania'],
      ['Access', 'Fly-in'],
      ['Focus', 'Chimps and Lake Tanganyika'],
    ],
    location: 'Western Tanzania, Lake Tanganyika',
  },
];

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
  const keys = place.match || [place.slug];
  return allTours()
    .filter((tour) => {
      const hay = `${tour.title} ${tour.places || ''}`.toLowerCase();
      return keys.some((key) => hay.includes(key));
    })
    .slice(0, count);
}

assignUniqueCovers(destinationPlaces);
