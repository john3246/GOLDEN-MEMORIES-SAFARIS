/**
 * Default SEO for every public page. Used by the API (server-side meta tags,
 * sitemap) and the website (client-side updates). Editors can override any of
 * these per page in CMS → Pages → SEO, and per tour / destination / article.
 *
 * Titles are kept under ~60 characters and descriptions under ~160 so Google
 * shows them without truncation.
 */

export const SITE_NAME = 'Golden Memories Safaris';

export const DEFAULT_KEYWORDS = [
  'Tanzania safari',
  'Tanzania safari tours',
  'Serengeti safari',
  'Ngorongoro Crater tour',
  'Kilimanjaro climb',
  'Zanzibar holiday',
  'Arusha tour operator',
  'private safari Tanzania',
  'great migration safari',
];

export const SEO_ROUTES = Object.freeze({
  home: {
    path: '/',
    title: 'Tanzania Safaris, Kilimanjaro & Zanzibar | Golden Memories',
    description:
      'Private Tanzania safaris, Kilimanjaro climbs and Zanzibar holidays planned by a locally owned team in Arusha. Expert guides, honest prices, tailor-made trips.',
    keywords: [
      ...DEFAULT_KEYWORDS,
      'luxury safari Tanzania',
      'family safari Tanzania',
      'honeymoon safari Tanzania',
    ],
    image: '/images/gallery/serengeti-01.webp',
    priority: 1.0,
    changefreq: 'weekly',
  },
  tours: {
    path: '/tours/',
    title: 'Tanzania Safari Packages & Private Tours | Golden Memories',
    description:
      'Compare Tanzania safari packages, from 2-day Tarangire and Ngorongoro trips to Serengeti migration safaris. Private vehicles, expert guides and clear prices.',
    keywords: [
      'Tanzania safari packages',
      'Serengeti safari packages',
      'Ngorongoro Crater day trip',
      'Tarangire safari',
      'great migration tours',
      'private safari Tanzania',
      'budget safari Tanzania',
      'luxury safari Tanzania',
      'Northern Circuit safari',
    ],
    image: '/images/gallery/serengeti-02.webp',
    priority: 0.9,
    changefreq: 'weekly',
  },
  destinations: {
    path: '/destinations/',
    title: 'Tanzania Safari Destinations & National Parks | Golden Memories',
    description:
      'Where to go in Tanzania: Serengeti, Ngorongoro Crater, Tarangire, Lake Manyara, Kilimanjaro, Zanzibar and the southern parks, with seasons, wildlife and tips.',
    keywords: [
      'Tanzania national parks',
      'Serengeti National Park',
      'Ngorongoro Conservation Area',
      'Tarangire National Park',
      'Lake Manyara',
      'Nyerere National Park',
      'Ruaha National Park',
      'best time to visit Tanzania',
    ],
    image: '/images/gallery/ngorongoro-01.webp',
    priority: 0.8,
    changefreq: 'monthly',
  },
  kilimanjaro: {
    path: '/kilimanjaro/',
    title: 'Kilimanjaro Climbing Packages & Routes | Golden Memories',
    description:
      'Climb Mount Kilimanjaro on the Machame, Lemosho, Marangu, Rongai or Umbwe route with experienced mountain guides, quality equipment and careful acclimatisation.',
    keywords: [
      'Kilimanjaro climb',
      'Kilimanjaro trekking packages',
      'Machame route',
      'Lemosho route',
      'Marangu route',
      'Rongai route',
      'Kilimanjaro cost',
      'Uhuru Peak',
    ],
    image: '/images/gallery/kilimanjaro-01.webp',
    priority: 0.9,
    changefreq: 'monthly',
  },
  'join-safari': {
    path: '/join-safari/',
    title: 'Group Safari Departures in Tanzania | Golden Memories Safaris',
    description:
      'Join a small-group Tanzania safari on fixed dates and share the cost of the vehicle and guide, including the wildebeest calving season in Ndutu and the Serengeti.',
    keywords: [
      'group safari Tanzania',
      'join a safari',
      'shared safari Tanzania',
      'fixed departure safari',
      'wildebeest calving safari',
      'Ndutu safari',
      'budget group safari',
    ],
    image: '/images/gallery/serengeti-03.webp',
    priority: 0.8,
    changefreq: 'weekly',
  },
  accommodations: {
    path: '/accommodations/',
    title: 'Safari Lodges & Tented Camps in Tanzania | Golden Memories',
    description:
      'Mid-range, luxury and premium safari lodges and tented camps we book in Arusha, Tarangire, Lake Manyara, Ngorongoro and the Serengeti, chosen for location and service.',
    keywords: [
      'Tanzania safari lodges',
      'Serengeti tented camps',
      'Ngorongoro lodges',
      'Tarangire lodges',
      'luxury safari lodge Tanzania',
      'mid-range safari accommodation',
    ],
    image: '/images/accommodations/hero.webp',
    priority: 0.7,
    changefreq: 'monthly',
  },
  reviews: {
    path: '/reviews/',
    title: 'Guest Reviews: Tripadvisor, Google & SafariBookings | Golden Memories',
    description:
      'Read what travellers say about their Tanzania safaris and Kilimanjaro climbs with Golden Memories Safaris, including reviews from Tripadvisor, Google and SafariBookings.',
    keywords: [
      'Golden Memories Safaris reviews',
      'Tanzania safari reviews',
      'Tripadvisor safari Tanzania',
      'SafariBookings reviews',
      'best safari company Tanzania',
    ],
    image: '/images/gallery/tarangire-01.webp',
    priority: 0.7,
    changefreq: 'weekly',
  },
  about: {
    path: '/about/',
    title: 'About Us: Locally Owned Safari Company in Arusha | Golden Memories',
    description:
      'Golden Memories Safaris is a locally owned Tanzanian tour operator in Arusha. Meet the team behind our private safaris, Kilimanjaro climbs and Zanzibar holidays.',
    keywords: [
      'Arusha safari company',
      'local Tanzania tour operator',
      'Tanzanian owned safari company',
      'responsible safari Tanzania',
    ],
    image: '/images/gallery/culture-01.webp',
    priority: 0.6,
    changefreq: 'yearly',
  },
  contact: {
    path: '/contact/',
    title: 'Contact Us: Plan Your Tanzania Safari | Golden Memories Safaris',
    description:
      'Talk to our Arusha team by phone, WhatsApp or email. Share your dates, group size and interests and we will reply with a tailor-made safari proposal.',
    keywords: ['contact safari company', 'Tanzania safari quote', 'plan a Tanzania safari', 'Arusha tour operator contact'],
    image: '/images/gallery/serengeti-05.webp',
    priority: 0.6,
    changefreq: 'yearly',
  },
  booking: {
    path: '/booking/',
    title: 'Book Your Tanzania Safari | Golden Memories Safaris',
    description:
      'Reserve your Tanzania safari, group departure or Kilimanjaro climb. Send your preferred dates and party size and our Arusha team will confirm availability.',
    keywords: ['book Tanzania safari', 'safari booking', 'Kilimanjaro booking', 'Serengeti safari booking'],
    image: '/images/gallery/serengeti-04.webp',
    priority: 0.5,
    changefreq: 'yearly',
  },
  blog: {
    path: '/blog/',
    title: 'Tanzania Travel Blog: Safari & Kilimanjaro Advice | Golden Memories',
    description:
      'Practical advice for planning a Tanzania trip: when to go, safari costs, Kilimanjaro routes, visas, packing lists, Zanzibar and wildlife guides from our Arusha team.',
    keywords: [
      'Tanzania travel blog',
      'Tanzania safari tips',
      'Kilimanjaro guide',
      'best time for Tanzania safari',
      'Tanzania visa',
      'safari packing list',
    ],
    image: '/images/gallery/zanzibar-01.webp',
    priority: 0.7,
    changefreq: 'weekly',
  },
});

/** Map a URL path to its SEO_ROUTES key (or null for detail pages). */
export function seoRouteKey(pathname) {
  const clean = `/${String(pathname || '/').replace(/^\/+|\/+$/g, '')}`;
  if (clean === '/') return 'home';
  const first = clean.split('/')[1];
  const depth = clean.split('/').filter(Boolean).length;
  if (depth === 1 && SEO_ROUTES[first]) return first;
  return null;
}

export function clampText(text, max) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[,.;:\s]+$/, '')}…`;
}

export function keywordsText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return String(value || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ');
}

/** Add the brand to a title only when it still fits in Google's ~65 characters. */
export function brandTitle(title) {
  const base = String(title || '').trim();
  if (!base) return SITE_NAME;
  if (/golden memories/i.test(base)) return base;
  if (`${base} | ${SITE_NAME}`.length <= 65) return `${base} | ${SITE_NAME}`;
  if (`${base} | Golden Memories`.length <= 65) return `${base} | Golden Memories`;
  return base;
}
