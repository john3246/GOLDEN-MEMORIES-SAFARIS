/**
 * Home page content — photos from the local GMS gallery only.
 */

import { galleryPhoto } from '../../media/gallery.js';
import { kilimanjaroTreks } from '../kilimanjaro/packages.js';
import { PDF_PACKAGES, toWebsiteTrip } from '../../../../api/src/modules/safaris/pdf-packages.js';

const GM = {
  hero: galleryPhoto('serengeti', 0),
  northern: galleryPhoto('serengeti', 1),
  coast: galleryPhoto('zanzibar', 0),
  southern: galleryPhoto('tarangire', 10),
  western: galleryPhoto('culture', 6),
  safariPackages: galleryPhoto('serengeti', 2),
  migration: galleryPhoto('serengeti', 3),
  selous: galleryPhoto('tarangire', 12),
  tarangire: galleryPhoto('tarangire', 0),
  ngorongoro: galleryPhoto('ngorongoro', 1),
  ngorongoroTourists: galleryPhoto('ngorongoro', 5),
  manyara: galleryPhoto('ngorongoro', 6),
  lakeEyasi: galleryPhoto('culture', 0),
  materuni: galleryPhoto('culture', 1),
  dayTrip: galleryPhoto('culture', 2),
  kilimanjaro: galleryPhoto('kilimanjaro', 0),
  machame: galleryPhoto('kilimanjaro', 1),
  meru: galleryPhoto('kilimanjaro', 2),
  spice: galleryPhoto('zanzibar', 1),
  zanzibarBeach: galleryPhoto('zanzibar', 2),
  ngorongoroAlt: galleryPhoto('ngorongoro', 3),
  savanna: galleryPhoto('serengeti', 7),
  cultureTeam: galleryPhoto('culture', 5),
};

export const media = GM;

export const site = {
  name: 'Golden Memories Safaris',
  shortName: 'GM Safaris',
  tagline: 'Your path to golden memories begins here',
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
  { label: 'Destinations', href: '/destinations/' },
  { label: 'Safaris', href: '/tours/' },
  { label: 'Group Safari', href: '/join-safari/' },
  { label: 'Kilimanjaro', href: '/kilimanjaro/' },
  { label: 'Excursions', href: '/tours/#excursions' },
  { label: 'Contact Us', href: '/contact/' },
];

export const utilityLinks = [
  { label: 'Accommodations', href: '/accommodations/', icon: 'bed' },
  { label: 'Blogs', href: '/blog/', icon: 'doc' },
  { label: 'About Us', href: '/about/', icon: 'people' },
  { label: 'Reviews', href: '/reviews/', icon: 'star' },
];

export const destinations = [
  {
    name: 'Northern Tanzania',
    slug: 'northern-tanzania',
    trips: 76,
    blurb: 'Serengeti, Ngorongoro Crater, Tarangire and Kilimanjaro: the classic safari and trekking region.',
    image: GM.northern,
  },
  {
    name: 'The Coast',
    slug: 'the-coast',
    trips: 9,
    blurb: 'Zanzibar’s beaches, spice farms and UNESCO-listed Stone Town on the Indian Ocean.',
    image: GM.coast,
  },
  {
    name: 'Southern Tanzania',
    slug: 'southern-tanzania',
    trips: 3,
    blurb: 'Ruaha and Nyerere (Selous): big wilderness, walking and boat safaris, few other vehicles.',
    image: GM.southern,
  },
];

const FEATURED_SLUGS = [
  '8-day-luxury-tanzania-safari-zanzibar-beach-escape',
  '4-day-midrange-private-safari',
  '6-day-family-tour-tanzania',
  '7-day-ndutu-zanzibar-honeymoon-safari',
];

export const featuredTours = FEATURED_SLUGS.map((slug) => PDF_PACKAGES.find((pkg) => pkg.slug === slug))
  .filter(Boolean)
  .map((pkg) => toWebsiteTrip(pkg));

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

export const kilimanjaro = kilimanjaroTreks;

export const zanzibar = [
  {
    slug: '5-days-zanzibar-beach-holiday',
    title: '5-Day Zanzibar Beach Holiday',
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
    title: '2-Day Safari From Zanzibar',
    duration: '2 Days',
    activity: 'Wildlife Safari',
    places: 'Tarangire · Ngorongoro',
    image: GM.ngorongoroAlt,
  },
];

/**
 * Real guest reviews are imported from Tripadvisor, Google and SafariBookings
 * (CMS → Guest reviews) and published testimonials come from the CMS. No
 * placeholder quotes are shown to visitors.
 */
export const testimonials = [];

export const whyBook = {
  title: 'Local experts, private safaris',
  body: 'Golden Memories Safaris is a locally owned tour operator based in Arusha. We plan private and small-group safaris, Kilimanjaro climbs and Zanzibar stays around your dates, budget and pace — with professional driver-guides, well-maintained 4x4 vehicles, carefully chosen lodges and one clear price that shows exactly what is included.',
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
  heroVideo: '/videos/hero.mp4',
  heroPoster: '/videos/hero-poster.webp',
  kilimanjaroSection: GM.kilimanjaro,
};

export const travelInfo = [
  { label: 'Tanzania Visa Guide', href: '/blog/tanzania-visa-guide/' },
  { label: 'Tanzania Travel Advice', href: '/blog/' },
  { label: 'Tanzania Weather Guide', href: '/blog/tanzania-weather-guide/' },
  { label: 'Travel Insurance for Tanzania', href: '/blog/how-to-prepare-for-kilimanjaro/' },
  { label: 'When is the Best Time to Visit Tanzania?', href: '/blog/best-time-for-a-tanzania-safari/' },
];

