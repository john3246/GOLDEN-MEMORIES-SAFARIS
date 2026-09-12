/**
 * Home page content — all photos linked from https://www.gmsafaris.com/
 * (no Unsplash / AI-generated images). Later: hydrate from central API / CMS.
 */

/** Real media URLs from the live GM Safaris WordPress media library */
const GM = {
  hero: 'https://www.gmsafaris.com/wp-content/uploads/2025/10/FB_IMG_1730556306660.webp',
  northern: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/serengeti-safaris-tanzania-wildlife-adventures.jpg',
  coast: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/zanzibar-beach1.jpg',
  southern: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/Ruaha-national-park-BW60CD.jpg',
  western: 'https://www.gmsafaris.com/wp-content/uploads/2026/06/western-tz-luxury-tanzania-safaris-grey.webp',
  safariPackages: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/7-Best-Tanzania-Safari-Packages.webp',
  migration: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/wildebeest-migration-4.jpg',
  selous: 'https://www.gmsafaris.com/wp-content/uploads/2026/06/Crocodiles_in_the_Selous_Game_Reserve_530504.webp',
  tarangire: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/trangire-5.jpg',
  ngorongoro: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/Ngorongoro-Crater-5.jpg',
  ngorongoroTourists: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/ngorongoro-wide-with-tourists.webp',
  manyara: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/Lake-Manyara-National-Park-1.jpg',
  lakeEyasi: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/lake-eyasi-tanzania-2.jpg',
  materuni: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/Materuni-Village-Experience-79.webp',
  dayTrip: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/IMG_3843-1.webp',
  kilimanjaro: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/climb-kilimanjaro.jpg',
  machame: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/Machame-Route-41.jpg',
  meru: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/shutterstock_285983723.webp',
  spice: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/buy-spice-scaled-1.jpg',
  zanzibarBeach: 'https://www.gmsafaris.com/wp-content/uploads/2025/01/zanzibar-beach1.jpg',
  ngorongoroAlt: 'https://www.gmsafaris.com/wp-content/uploads/2023/12/Ngorongoro-Crater-3.jpg',
  savanna: 'https://www.gmsafaris.com/wp-content/uploads/2026/06/tz.webp',
};

export const media = GM;

export const site = {
  name: 'Golden Memories Safaris',
  shortName: 'GM Safaris',
  tagline: 'Your Culture or Ours',
  phone: '+255 786 383 273',
  phoneAlt: '+255 754 750 070',
  email: 'info@gmsafaris.co.tz',
  address: 'Njiro, Arusha, Tanzania',
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/' },
    { label: 'X', href: 'https://x.com/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/' },
  ],
};

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about/' },
  { label: 'Destinations', href: '/destinations/' },
  { label: 'Safaris', href: '/tours/' },
  { label: 'Join Safari', href: '/join-safari/' },
  { label: 'Kilimanjaro', href: '/kilimanjaro/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Excursions', href: '/tours/#excursions' },
  { label: 'Contact Us', href: '/contact/' },
];

export const destinations = [
  {
    name: 'Northern Tanzania',
    slug: 'northern-tanzania',
    trips: 76,
    blurb: 'Serengeti, Ngorongoro, Tarangire, and Kilimanjaro country.',
    image: GM.northern,
  },
  {
    name: 'The Coast',
    slug: 'the-coast',
    trips: 9,
    blurb: 'Zanzibar spice routes, Stone Town, and Indian Ocean beaches.',
    image: GM.coast,
  },
  {
    name: 'Southern Tanzania',
    slug: 'southern-tanzania',
    trips: 3,
    blurb: 'Wild Ruaha, Selous/Nyerere, and quieter game country.',
    image: GM.southern,
  },
  {
    name: 'Western Tanzania',
    slug: 'western-tanzania',
    trips: 2,
    blurb: 'Chimpanzee tracking in Mahale and Gombe.',
    image: GM.western,
  },
];

export const featuredTours = [
  {
    slug: '7-day-family-wildebeest-migration-safari',
    title: '7-Day Family Wildebeest Migration Safari',
    duration: '7 Days / 6 Nights',
    activity: 'Family Safari',
    places: 'Tarangire · Serengeti · Ngorongoro · Lake Manyara',
    image: GM.migration,
    featured: true,
    price_from: 3094,
    currency: 'USD',
    minimum_people: 2,
  },
  {
    slug: '5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro',
    title: '5-Day Luxury Tanzania Safari',
    duration: '5 Days / 4 Nights',
    activity: 'Luxury Safari',
    places: 'Tarangire · Serengeti · Ngorongoro',
    image: GM.ngorongoroAlt,
    price_from: 4925,
    currency: 'USD',
    minimum_people: 2,
  },
  {
    slug: '4-day-affordable-private-tanzania-safari',
    title: '4-Day Affordable Private Tanzania Safari',
    duration: '4 Days / 3 Nights',
    activity: 'Private Safari',
    places: 'Tarangire · Serengeti · Ngorongoro',
    image: GM.tarangire,
    price_from: 2168,
    currency: 'USD',
    minimum_people: 2,
  },
  {
    slug: '14-day-tanzania-safari-zanzibar-escape',
    title: '14-Day Tanzania Safari & Zanzibar Escape',
    duration: '14 Days / 13 Nights',
    activity: 'Safari & Beach',
    places: 'Serengeti · Ngorongoro · Zanzibar',
    image: GM.zanzibarBeach,
    price_from: 7148,
    currency: 'USD',
    minimum_people: 2,
  },
];

export const dayTrips = [
  {
    slug: 'ngorongoro-crater-day-trip',
    title: 'Ngorongoro Crater Day Trip',
    duration: '1 Day',
    activity: 'Game Drive',
    places: 'Ngorongoro',
    image: GM.ngorongoroTourists,
  },
  {
    slug: 'materuni-waterfalls-and-coffee-tour',
    title: 'Materuni Waterfalls and Coffee Tour',
    duration: '1 Day',
    activity: 'Cultural Experience',
    places: 'Materuni',
    image: GM.materuni,
  },
  {
    slug: 'fly-in-fly-out-mikumi-national-park',
    title: 'Fly-In Fly-Out Mikumi National Park',
    duration: '1 Day',
    activity: 'Game Drive',
    places: 'Mikumi',
    image: GM.dayTrip,
  },
];

export const kilimanjaro = [
  {
    slug: '8-days-mt-kilimanjaro-via-marangu-route',
    title: '8 Days Mt. Kilimanjaro via Marangu Route',
    duration: '8 Days',
    activity: 'Mountain climbing',
    places: 'Kilimanjaro',
    image: GM.kilimanjaro,
  },
  {
    slug: '7-day-kilimanjaro-climb-via-machame-route',
    title: '7 Day Kilimanjaro Climb via Machame Route',
    duration: '7 Days',
    activity: 'Mountain climbing',
    places: 'Kilimanjaro',
    image: GM.machame,
  },
  {
    slug: '4-days-mt-meru-trekking-via-momella-gate',
    title: '4 Days Mt Meru Trekking via Momella Gate',
    duration: '4 Days',
    activity: 'Mountain climbing',
    places: 'Mount Meru',
    image: GM.meru,
  },
];

export const zanzibar = [
  {
    slug: '5-days-zanzibar-beach-holiday',
    title: '5 Days Zanzibar Beach Holiday',
    duration: '5 Days',
    activity: 'Beach vacation',
    places: 'Zanzibar',
    image: GM.zanzibarBeach,
  },
  {
    slug: 'spices-and-stone-town-tour-in-zanzibar',
    title: 'Spices And Stone Town Tour In Zanzibar',
    duration: '1 Day',
    activity: 'Cultural Experience',
    places: 'Zanzibar',
    image: GM.spice,
  },
  {
    slug: '2-days-safari-from-zanzibar',
    title: '2 Days Safari From Zanzibar',
    duration: '2 Days',
    activity: 'Wildlife Safari',
    places: 'Tarangire · Ngorongoro',
    image: GM.ngorongoroAlt,
  },
];

export const testimonials = [
  {
    quote:
      'An unforgettable safari — professional guides, thoughtful pacing, and wildlife moments we will never forget.',
    name: 'Traveler review',
    detail: 'Rated 5/5 by served clients',
  },
  {
    quote:
      'From Serengeti game drives to our Zanzibar stay, Golden Memories made every day feel carefully planned.',
    name: 'Family safari',
    detail: 'Northern Circuit + Coast',
  },
];

export const whyBook = {
  title: 'Professional Safari Experts',
  body: 'Golden Memories Safaris is a premier tour operator based in Tanzania, specializing in creating unforgettable wildlife experiences. Our team of expert guides and travel consultants are dedicated to providing authentic safari adventures that showcase Tanzania’s breathtaking landscapes and incredible wildlife.',
  slides: [
    { src: GM.ngorongoro, alt: 'Ngorongoro Crater wildlife viewing' },
    { src: GM.northern, alt: 'Serengeti safari wildlife adventure' },
    { src: GM.migration, alt: 'Great wildebeest migration in Tanzania' },
    { src: GM.kilimanjaro, alt: 'Mount Kilimanjaro climbing experience' },
    { src: GM.zanzibarBeach, alt: 'Zanzibar beach holiday' },
  ],
};

export const pageImages = {
  hero: GM.hero,
  kilimanjaroSection: GM.kilimanjaro,
};

export const travelInfo = [
  { label: 'Tanzania Visa Guide', href: '/blog/tanzania-visa-guide/' },
  { label: 'Tanzania Travel Advice', href: '/blog/' },
  { label: 'Tanzania Weather Guide', href: '/blog/tanzania-weather-guide/' },
  { label: 'Travel Insurance for Tanzania', href: '/blog/how-to-prepare-for-kilimanjaro/' },
  { label: 'When is the Best Time to Visit Tanzania?', href: '/blog/best-time-for-a-tanzania-safari/' },
];
