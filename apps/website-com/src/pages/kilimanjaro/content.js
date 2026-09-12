import { media as GM, testimonials as homeQuotes, kilimanjaro as climbPackages } from '../home/content.js';

export { climbPackages };

export const kiliHero = {
  kicker: 'The roof of Africa',
  title: 'Climb the Magnificent Mount Kilimanjaro',
  cta: 'Plan this climb',
  image: GM.kilimanjaro,
};

export const kiliIntro = {
  kicker: 'Uhuru Peak · 5,895 m',
  title: 'A wilderness trek to Africa’s highest point',
  image: GM.machame,
  imageAlt: 'Trekkers on the Machame Route of Mount Kilimanjaro',
  paragraphs: [
    'Climbing Mount Kilimanjaro — the highest free-standing mountain in the world — sits on the bucket list of many adventure travellers. Summiting Uhuru Peak is a unique wilderness experience: you walk from rainforest to alpine desert to a glacier rim, then watch sunrise over the continent.',
    'The trails are well established and non-technical. What they ask of you is fitness, patience, and time to acclimatise. Even when the days are hard, reaching the roof of Africa with a dedicated Tanzanian crew is a once-in-a-lifetime reward.',
    'Golden Memories Safaris runs climbs with experienced mountain guides, cooks, and porters from Arusha and Moshi. We match the route to your dates, pace, and whether you prefer mountain huts or tents.',
  ],
};

export const kiliRoutes = [
  {
    name: 'Marangu Route',
    slug: '8-days-mt-kilimanjaro-via-marangu-route',
    image: GM.kilimanjaro,
    body: 'A gradual ascent on the “Coca-Cola” trail, with overnight in mountain huts. You pass rainforest, moorland, and alpine desert — a classic, less strenuous profile for first-time trekkers who want a structured hut-to-hut climb.',
  },
  {
    name: 'Machame Route',
    slug: '7-day-kilimanjaro-climb-via-machame-route',
    image: GM.machame,
    body: 'A more scenic camping route: rainforest, the Shira Plateau, and the Barranco Wall. “Climb high, sleep low” gives a strong acclimatisation profile and some of the best views on the mountain.',
  },
  {
    name: 'Lemosho Route',
    href: '/contact/',
    image: GM.kilimanjaro,
    body: 'A quieter western start through forest and onto the Shira Plateau, then the Barranco Wall. Excellent acclimatisation and fewer crowds in the first days — a favourite when you can spare eight days.',
  },
  {
    name: 'Rongai Route',
    href: '/contact/',
    image: GM.meru,
    body: 'The northern approach: drier slopes, more solitude, and a different angle on Kilimanjaro. A good choice in the wetter months, with a remote wilderness feel before you join the summit ridge.',
  },
  {
    name: 'Londorossi Gate',
    href: '/contact/',
    image: GM.kilimanjaro,
    body: 'A western-gate start used on longer Lemosho-style itineraries. Tranquil forest, a pristine wilderness feel, and extra days to settle into the altitude before the high camps.',
  },
  {
    name: 'Umbwe Route',
    href: '/contact/',
    image: GM.machame,
    body: 'The steepest and most direct path. For experienced trekkers who want a challenging ascent and do not mind a tougher acclimatisation profile. We brief this one carefully before we book it.',
  },
];

export const kiliClose = {
  title: 'Climb Kilimanjaro with Golden Memories Safaris',
  body: 'Whether you choose the hut nights of Marangu or the camping days of Machame, our mountain team looks after safety, meals, and the slow pace that gets more people to Uhuru Peak. Ask us about extra acclimatisation days, gear hire, and pairing the trek with a safari or Zanzibar.',
};

export const kiliFaqs = [
  {
    q: 'Do I need climbing experience to climb Kilimanjaro?',
    a: 'No. Kilimanjaro is a trek, not a technical climb. You do not need ropes or mountaineering skills. Good fitness, a sensible number of days, and a willing crew matter more.',
  },
  {
    q: 'What is the best route to climb Kilimanjaro?',
    a: 'Machame and Lemosho are popular for scenery and camping. Marangu is the hut route with a gentler gradient. Longer itineraries (seven days or more) give better acclimatisation and higher summit rates.',
  },
  {
    q: 'How fit do I need to be?',
    a: 'You should be comfortable walking several hours a day on hills. Hiking, stairs, and cardio in the months before the climb make summit night far more manageable.',
  },
  {
    q: 'What is the success rate for summiting?',
    a: 'Rates vary with route length and how you feel at altitude. Longer routes (7–9 days) typically see higher success because the body has more time to adapt. We never rush a group that needs to turn around.',
  },
  {
    q: 'Can I combine Kilimanjaro with a safari?',
    a: 'Yes. Many guests trek first, rest in Arusha, then continue to the northern parks or fly to Zanzibar. We plan the join-up so transfers and rest days make sense.',
  },
];

export const kiliQuotes = [
  ...homeQuotes,
  {
    quote:
      'Pole pole, good food, and a crew that knew exactly when to push and when to wait. Standing on Uhuru Peak felt earned — and carefully looked after.',
    name: 'Summit group',
    detail: 'Machame Route',
  },
];
