/**
 * Cloned from https://www.gmsafaris.com/trip-search-result/ (WP Travel Engine trips).
 * Photos: local GMS gallery only.
 */
import { assignUniqueCovers } from '../../media/gallery.js';
import {
  PDF_PACKAGES,
  REPLACED_SAFARI_SLUGS,
  toWebsiteTrip,
} from '../../../../api/src/modules/safaris/pdf-packages.js';

export const safariStyles = [
  { slug: 'wildlife', label: 'Wildlife Safari Tours' },
  { slug: 'luxury', label: 'Luxury Safaris' },
  { slug: 'cultural', label: 'Cultural & Historical Tours' },
  { slug: 'fly-in', label: 'Fly-in Tanzania Safaris' },
  { slug: 'honeymoon', label: 'Honeymoon Packages' },
  { slug: 'mountain', label: 'Mountain Climbing & Treks' },
  { slug: 'photographic', label: 'Photographic Safaris' },
  { slug: 'zanzibar', label: 'Zanzibar & Beach Holidays' },
];

export const mostBookedSlugs = [
  '4-day-midrange-private-safari',
  '8-day-luxury-tanzania-safari-zanzibar-beach-escape',
  '5-day-midrange-migration-safari',
  '3-day-serengeti-hot-air-balloon-safari',
  '7-day-ndutu-zanzibar-honeymoon-safari',
];

const legacyGmsTrips = [
  {
    "slug": "5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro-crater-exclusive-retreat",
    "sourceSlug": "5-day-luxury-tanzania-safari-tarangire-serengeti-ngorongoro-crater-exclusive-retreat",
    "title": "5-Day Luxury Tanzania Safari",
    "duration": "5 Days / 4 Nights",
    "activity": "Luxury Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "luxury",
    "featured": true,
    "price_from": 4925,
    "currency": "USD",
    "minimum_people": 2
  },
  {
    "slug": "3-day-lake-natron-adventure-oldoinyo-lengai-volcano-trek",
    "sourceSlug": "3-day-lake-natron-adventure-oldoinyo-lengai-volcano-trek",
    "title": "3-Day Lake Natron & Oldoinyo Lengai",
    "duration": "3 Days / 2 Nights",
    "activity": "Cultural Experience",
    "places": "Lake Natron",
    "image": "/images/gallery/culture-01.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "4-day-usambara-mountains-hiking-cultural-experience",
    "sourceSlug": "4-day-usambara-mountains-hiking-cultural-experience",
    "title": "4-Day Usambara Mountains Hiking & Cultural Experience",
    "duration": "4 Days / 3 Nights",
    "activity": "Cultural Experience",
    "places": "Usambara",
    "image": "/images/gallery/culture-02.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "5-day-mount-kilimanjaro-climbing-adventure-via-marangu-route",
    "sourceSlug": "5-day-mount-kilimanjaro-climbing-adventure-via-marangu-route",
    "title": "6-Day Mount Kilimanjaro Climbing Adventure Via Marangu Route",
    "duration": "6 Days / 5 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "5-days-zanzibar-and-mikumi-luxury-tour",
    "sourceSlug": "5-days-zanzibar-and-mikumi-luxury-tour",
    "title": "5-Day Mount Kilimanjaro Climb Via Umbwe Route",
    "duration": "5 Days / 4 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "7-day-mount-kilimanjaro-climbing-adventure-via-lemosho-route",
    "sourceSlug": "7-day-mount-kilimanjaro-climbing-adventure-via-lemosho-route",
    "title": "7-Day Mount Kilimanjaro Climbing Adventure Via Lemosho Route",
    "duration": "7 Days / 6 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "6-day-mount-kilimanjaro-climbing-via-machame-route",
    "sourceSlug": "6-day-mount-kilimanjaro-climbing-via-machame-route",
    "title": "6-Day Mount Kilimanjaro Climbing Via Machame Route",
    "duration": "6 Days / 5 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "7-day-mount-kilimanjaro-climbing-adventure-via-machame-route",
    "sourceSlug": "7-day-mount-kilimanjaro-climbing-adventure-via-machame-route",
    "title": "7-Day Mount Kilimanjaro Climbing Adventure Via Machame Route",
    "duration": "7 Days / 6 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "6-day-mount-kilimanjaro-climbing-adventure-via-umbwe-route",
    "sourceSlug": "6-day-mount-kilimanjaro-climbing-adventure-via-umbwe-route",
    "title": "6-Day Mount Kilimanjaro Climbing Adventure Via Umbwe Route",
    "duration": "6 Days / 5 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "7-day-mount-kilimanjaro-climbing-adventure-via-rongai-route",
    "sourceSlug": "7-day-mount-kilimanjaro-climbing-adventure-via-rongai-route",
    "title": "7-Day Mount Kilimanjaro Climbing Adventure via Rongai Route",
    "duration": "7 Days / 6 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "9-day-mount-kilimanjaro-trekking-adventure-via-northern-circuit-route",
    "sourceSlug": "9-day-mount-kilimanjaro-trekking-adventure-via-northern-circuit-route",
    "title": "9-Day Mount Kilimanjaro Trekking Adventure Via Northern Circuit Route",
    "duration": "9 Days / 8 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "8-day-mount-kilimanjaro-trekking-adventure-via-lemosho-route",
    "sourceSlug": "8-day-mount-kilimanjaro-trekking-adventure-via-lemosho-route",
    "title": "8-Day Mount Kilimanjaro Trekking Adventure Via Lemosho Route",
    "duration": "8 Days / 7 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "3-days-mt-meru-trekking-momella-gate",
    "sourceSlug": "3-days-mt-meru-trekking-momella-gate",
    "title": "3-Day Mt Meru Trekking Via Momella Gate",
    "duration": "3 Days / 2 Nights",
    "activity": "Mountain climbing",
    "places": "Mount Meru",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "4-days-mt-meru-trekking-via-momella-gate",
    "sourceSlug": "4-days-mt-meru-trekking-via-momella-gate",
    "title": "4-Day Mt Meru Trekking Via Momella Gate",
    "duration": "4 Days / 3 Nights",
    "activity": "Mountain climbing",
    "places": "Mount Meru",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "4-day-midrange-tanzania-safari",
    "sourceSlug": "4-day-midrange-tanzania-safari",
    "title": "4-Day Serengeti and Ngorongoro Safari",
    "duration": "4 Days / 3 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti · Ngorongoro",
    "image": "/images/gallery/serengeti-02.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "5-day-great-migration-safari",
    "sourceSlug": "5-day-great-migration-safari",
    "title": "5-Day Great Migration Safari",
    "duration": "5 Days / 4 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-03.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "6-day-family-tour-tanzania",
    "sourceSlug": "6-day-family-tour-tanzania",
    "title": "6-Day Tanzania Family Safari",
    "duration": "6 Days / 5 Nights",
    "activity": "Wildlife Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-04.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "3-day-serengeti-hot-air-balloon-safari",
    "sourceSlug": "3-day-serengeti-hot-air-balloon-safari",
    "title": "3-Day Serengeti Hot Air Balloon Safari",
    "duration": "3 Days / 2 Nights",
    "activity": "Photographic Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-05.webp",
    "style": "photographic",
    "featured": false
  },
  {
    "slug": "7-days-ndutu-zanzibar-honeymoon-safari",
    "sourceSlug": "7-days-ndutu-zanzibar-honeymoon-safari",
    "title": "7-Day Serengeti Migration & Zanzibar Honeymoon Safari",
    "duration": "7 Days / 6 Nights",
    "activity": "Honeymoon",
    "places": "Serengeti · Zanzibar",
    "image": "/images/gallery/serengeti-06.webp",
    "style": "honeymoon",
    "featured": false
  },
  {
    "slug": "5-days-mid-range-safari-serengeti-ngorongoro-crater",
    "sourceSlug": "5-days-mid-range-safari-serengeti-ngorongoro-crater",
    "title": "5-Day Serengeti & Ngorongoro Crater Safari",
    "duration": "5 Days / 4 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti · Ngorongoro",
    "image": "/images/gallery/serengeti-07.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "7-day-family-wildebeest-migration-safari",
    "sourceSlug": "7-day-family-wildebeest-migration-safari",
    "title": "7-Day Family Wildebeest Migration Safari",
    "duration": "7 Days / 6 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-08.webp",
    "style": "wildlife",
    "featured": true,
    "price_from": 3094,
    "currency": "USD",
    "minimum_people": 2
  },
  {
    "slug": "4-day-affordable-private-tanzania-safari-tarangire-serengeti-ngorongoro-crater-adventure",
    "sourceSlug": "4-day-affordable-private-tanzania-safari-tarangire-serengeti-ngorongoro-crater-adventure",
    "title": "4-Day Affordable Private Tanzania Safari – Tarangire, Serengeti & Ngorongoro Crater Adventure",
    "duration": "4 Days / 3 Nights",
    "activity": "Wildlife Safari",
    "places": "Tarangire · Serengeti · Ngorongoro",
    "image": "/images/gallery/serengeti-09.webp",
    "style": "wildlife",
    "featured": true,
    "price_from": 2168,
    "currency": "USD",
    "minimum_people": 2
  },
  {
    "slug": "6-day-luxury-great-migration-safari-serengeti-river-crossing-exclusive-experience",
    "sourceSlug": "6-day-luxury-great-migration-safari-serengeti-river-crossing-exclusive-experience",
    "title": "6-Day Luxury Great Migration Safari – Serengeti River Crossing Exclusive Experience",
    "duration": "6 Days / 5 Nights",
    "activity": "Luxury Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "luxury",
    "featured": true,
    "price_from": 5010,
    "currency": "USD",
    "minimum_people": 2
  },
  {
    "slug": "14-day-tanzania-luxury-safari-zanzibar-escape",
    "sourceSlug": "14-day-tanzania-luxury-safari-zanzibar-escape",
    "title": "14-Day Tanzania Luxury Safari & Zanzibar Escape",
    "duration": "14 Days / 13 Nights",
    "activity": "Safari & Beach",
    "places": "Zanzibar",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "zanzibar",
    "featured": true,
    "price_from": 7148,
    "currency": "USD",
    "minimum_people": 2
  },
  {
    "slug": "fly-in-fly-out-mikumi-national-park-day-trip",
    "sourceSlug": "fly-in-fly-out-mikumi-national-park-day-trip",
    "title": "Fly-In Fly-Out Mikumi National Park Day Trip",
    "duration": "1 Day",
    "activity": "Fly-in Safari",
    "places": "Mikumi",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "fly-in",
    "featured": false
  },
  {
    "slug": "3-day-fly-in-serengeti-safari",
    "sourceSlug": "3-day-fly-in-serengeti-safari",
    "title": "3-Day Fly In Serengeti Safari",
    "duration": "3 Days / 2 Nights",
    "activity": "Fly-in Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-02.webp",
    "style": "fly-in",
    "featured": false
  },
  {
    "slug": "2-day-tanzania-express-safari",
    "sourceSlug": "2-day-tanzania-express-safari",
    "title": "2-Day Tanzania Express Safari",
    "duration": "2 Days / 1 Nights",
    "activity": "Wildlife Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-03.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "2-days-tarangire-ngorongoro-safari",
    "sourceSlug": "2-days-tarangire-ngorongoro-safari",
    "title": "2-Day Tarangire & Ngorongoro Safari",
    "duration": "2 Days / 1 Nights",
    "activity": "Wildlife Safari",
    "places": "Tarangire · Ngorongoro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "3-day-safari-cultural-experience",
    "sourceSlug": "3-day-safari-cultural-experience",
    "title": "3-Day Safari & Cultural Experience",
    "duration": "3 Days / 2 Nights",
    "activity": "Cultural Experience",
    "places": "Tanzania",
    "image": "/images/gallery/culture-03.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "4-day-tanzania-safari-tarangireserengeti-ngorongoro-crater",
    "sourceSlug": "4-day-tanzania-safari-tarangireserengeti-ngorongoro-crater",
    "title": "4-Day Tanzania safari- Tarangire,Serengeti & Ngorongoro Crater",
    "duration": "4 Days / 3 Nights",
    "activity": "Wildlife Safari",
    "places": "Tarangire · Serengeti · Ngorongoro",
    "image": "/images/gallery/serengeti-04.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "5-day-tanzania-northern-circuit-safari",
    "sourceSlug": "5-day-tanzania-northern-circuit-safari",
    "title": "5-Day Tanzania Northern Circuit Safari",
    "duration": "5 Days / 4 Nights",
    "activity": "Wildlife Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-05.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "6-day-wildlife-cultural-safari",
    "sourceSlug": "6-day-wildlife-cultural-safari",
    "title": "6-Day Wildlife & Cultural Safari",
    "duration": "6 Days / 5 Nights",
    "activity": "Cultural Experience",
    "places": "Tanzania",
    "image": "/images/gallery/culture-04.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "13-day-tanzania-and-zanzibar-adventure",
    "sourceSlug": "13-day-tanzania-and-zanzibar-adventure",
    "title": "13-Day Tanzania And Zanzibar Adventure",
    "duration": "13 Days / 12 Nights",
    "activity": "Beach holiday",
    "places": "Zanzibar",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "zanzibar",
    "featured": false
  },
  {
    "slug": "5-day-tanzania-safari-adventure",
    "sourceSlug": "5-day-tanzania-safari-adventure",
    "title": "5-Day Tanzania Safari Adventure",
    "duration": "5 Days / 4 Nights",
    "activity": "Wildlife Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-06.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "7-day-tanzania-safari",
    "sourceSlug": "7-day-tanzania-safari",
    "title": "7-Day Midrange Tanzania Safari",
    "duration": "7 Days / 6 Nights",
    "activity": "Wildlife Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-07.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "5-days-safari-to-gombe-stream-national-park",
    "sourceSlug": "5-days-safari-to-gombe-stream-national-park",
    "title": "5-Day Safari to Gombe Stream National Park",
    "duration": "5 Days / 4 Nights",
    "activity": "Wildlife Safari",
    "places": "Gombe",
    "image": "/images/gallery/serengeti-08.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "tarangire-ngorongoro-luxury-fly-in-out-safari",
    "sourceSlug": "tarangire-ngorongoro-luxury-fly-in-out-safari",
    "title": "2-Day Tarangire Ngorongoro Luxury Fly in & out Safari",
    "duration": "2 Days / 1 Nights",
    "activity": "Fly-in Safari",
    "places": "Tarangire · Ngorongoro",
    "image": "/images/gallery/ngorongoro-02.webp",
    "style": "fly-in",
    "featured": false
  },
  {
    "slug": "private-luxury-safari-serengeti-ngorongoro",
    "sourceSlug": "private-luxury-safari-serengeti-ngorongoro",
    "title": "3-Day Private Luxury Safari Serengeti & Ngorongoro",
    "duration": "3 Days / 2 Nights",
    "activity": "Luxury Safari",
    "places": "Serengeti · Ngorongoro",
    "image": "/images/gallery/serengeti-09.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "tarangire-ngorongoro-manyara-safari",
    "sourceSlug": "tarangire-ngorongoro-manyara-safari",
    "title": "3-Day Tarangire, Ngorongoro & Manyara Safari",
    "duration": "3 Days / 2 Nights",
    "activity": "Wildlife Safari",
    "places": "Tarangire · Ngorongoro · Lake Manyara",
    "image": "/images/gallery/ngorongoro-03.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "luxury-safari-tarangire-serengeti-and-ngorongoro",
    "sourceSlug": "luxury-safari-tarangire-serengeti-and-ngorongoro",
    "title": "4-Day Luxury Safari, Tarangire, Serengeti and Ngorongoro",
    "duration": "4 Days / 3 Nights",
    "activity": "Luxury Safari",
    "places": "Tarangire · Serengeti · Ngorongoro",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "8-day-luxury-tanzania-safari-zanzibar-beach-escape",
    "sourceSlug": "8-day-luxury-tanzania-safari-zanzibar-beach-escape",
    "title": "8-Day Luxury Tanzania Safari & Zanzibar Beach Escape",
    "duration": "8 Days / 7 Nights",
    "activity": "Safari & Beach",
    "places": "Zanzibar",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "zanzibar",
    "featured": false
  },
  {
    "slug": "4-day-luxury-tanzania-safari",
    "sourceSlug": "4-day-luxury-tanzania-safari",
    "title": "4-Day Luxury Tanzania Safari",
    "duration": "4 Days / 3 Nights",
    "activity": "Luxury Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-02.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "5-day-luxury-wildebeest-migration-safari-serengeti-focus",
    "sourceSlug": "5-day-luxury-wildebeest-migration-safari-serengeti-focus",
    "title": "5-Day Luxury Wildebeest Migration Safari (Serengeti Focus)",
    "duration": "5 Days / 4 Nights",
    "activity": "Luxury Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-03.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "7-day-luxury-big-five-wildebeest-migration-safari-from-arusha",
    "sourceSlug": "7-day-luxury-big-five-wildebeest-migration-safari-from-arusha",
    "title": "7-Day Luxury Big Five & Wildebeest Migration Safari (From Arusha)",
    "duration": "7 Days / 6 Nights",
    "activity": "Luxury Safari",
    "places": "Serengeti · Arusha",
    "image": "/images/gallery/serengeti-04.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "4-day-luxury-serengeti-hot-air-balloon-safari",
    "sourceSlug": "4-day-luxury-serengeti-hot-air-balloon-safari",
    "title": "4-Day Luxury Serengeti Hot Air Balloon Safari",
    "duration": "4 Days / 3 Nights",
    "activity": "Photographic Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-05.webp",
    "style": "photographic",
    "featured": false
  },
  {
    "slug": "6-day-luxury-great-migration-river-crossing-safari-northern-serengeti-focus",
    "sourceSlug": "6-day-luxury-great-migration-river-crossing-safari-northern-serengeti-focus",
    "title": "6-Day Luxury Great Migration River Crossing Safari (Northern Serengeti Focus)",
    "duration": "6 Days / 5 Nights",
    "activity": "Luxury Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-06.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "4-days-in-arusha-national-park",
    "sourceSlug": "4-days-in-arusha-national-park",
    "title": "4-Day in Arusha National park",
    "duration": "4 Days / 3 Nights",
    "activity": "Wildlife Safari",
    "places": "Arusha",
    "image": "/images/gallery/ngorongoro-04.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "day-hike-mount-kilimanjaro-via-machame-route",
    "sourceSlug": "day-hike-mount-kilimanjaro-via-machame-route",
    "title": "Day Hike Mount Kilimanjaro via Machame Route",
    "duration": "1 Day",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "day-trip-to-mkomazi-national-park",
    "sourceSlug": "day-trip-to-mkomazi-national-park",
    "title": "Day trip to Mkomazi National Park",
    "duration": "1 Day",
    "activity": "Day trip",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "day-trip-to-chemka-hot-springs",
    "sourceSlug": "day-trip-to-chemka-hot-springs",
    "title": "Day Trip to Chemka Hot Springs",
    "duration": "1 Day",
    "activity": "Cultural Experience",
    "places": "Tanzania",
    "image": "/images/gallery/culture-05.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "day-trip-to-mount-meru-waterfalls-hike",
    "sourceSlug": "day-trip-to-mount-meru-waterfalls-hike",
    "title": "Day Trip to Mount Meru Waterfalls Hike",
    "duration": "1 Day",
    "activity": "Mountain climbing",
    "places": "Mount Meru",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "day-trip-to-olmoti-and-empakai-crater-in-ngorongoro-highlands",
    "sourceSlug": "day-trip-to-olmoti-and-empakai-crater-in-ngorongoro-highlands",
    "title": "Day Trip to Olmoti and Empakai Crater in Ngorongoro Highlands",
    "duration": "1 Day",
    "activity": "Day trip",
    "places": "Ngorongoro",
    "image": "/images/gallery/ngorongoro-05.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "day-trip-to-arusha-national-park",
    "sourceSlug": "day-trip-to-arusha-national-park",
    "title": "Day Trip to Arusha National Park",
    "duration": "1 Day",
    "activity": "Day trip",
    "places": "Arusha",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "materuni-waterfalls-and-coffee-tour",
    "sourceSlug": "1602",
    "title": "Day Trip to Materuni Waterfalls and Coffee Tour",
    "duration": "1 Day",
    "activity": "Cultural Experience",
    "places": "Materuni",
    "image": "/images/gallery/culture-06.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "9-day-trip-climbing-kilimanjaro",
    "sourceSlug": "9-day-trip-climbing-kilimanjaro",
    "title": "8-Day Trip: Climbing Kilimanjaro",
    "duration": "8 Days / 7 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "8-day-trip-climbing-kilimanjaro-via-the-5-day-marangu-route-with-huts",
    "sourceSlug": "8-day-trip-climbing-kilimanjaro-via-the-5-day-marangu-route-with-huts",
    "title": "8-Day Mt. Kilimanjaro via Marangu Route",
    "duration": "8 Days / 7 Nights",
    "activity": "Mountain climbing",
    "places": "Kilimanjaro",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "mountain",
    "featured": false
  },
  {
    "slug": "8-days-wildebeest-migration-safari",
    "sourceSlug": "8-days-wildebeest-migration-safari",
    "title": "8-Day Wildebeest Migration Safari",
    "duration": "8 Days / 7 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-07.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "4-days-big-tanzania-shared-safari-serengeti-adventures",
    "sourceSlug": "4-days-big-tanzania-shared-safari-serengeti-adventures",
    "title": "4-Day Big Tanzania Shared Safari/Serengeti Adventures.",
    "duration": "4 Days / 3 Nights",
    "activity": "Camping Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-08.webp",
    "style": "mobile",
    "featured": false
  },
  {
    "slug": "6-days-migration-western-corridor-serengeti",
    "sourceSlug": "6-days-migration-western-corridor-serengeti",
    "title": "6-Day Migration Western Corridor Serengeti",
    "duration": "6 Days / 5 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-09.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "6-days-migration-safari-in-ndutu",
    "sourceSlug": "6-days-migration-safari-in-ndutu",
    "title": "6-Day Migration Safari in Ndutu",
    "duration": "6 Days / 5 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "5-days-zanzibar-beach-holiday",
    "sourceSlug": "5-days-zanzibar-beach-holiday",
    "title": "5-Day Zanzibar Beach Holiday",
    "duration": "5 Days / 4 Nights",
    "activity": "Beach holiday",
    "places": "Zanzibar",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "zanzibar",
    "featured": false
  },
  {
    "slug": "stone-town-zanzibarcity-tour",
    "sourceSlug": "stone-town-zanzibarcity-tour",
    "title": "2-Day Zanzibar Stonetown Special",
    "duration": "2 Days / 1 Nights",
    "activity": "Beach holiday",
    "places": "Zanzibar",
    "image": "/images/gallery/serengeti-01.webp",
    "style": "zanzibar",
    "featured": false
  },
  {
    "slug": "tarangire-national-park-day-trip",
    "sourceSlug": "tarangire-national-park-day-trip",
    "title": "Tarangire National Park Day Trip",
    "duration": "1 Day",
    "activity": "Day trip",
    "places": "Tarangire",
    "image": "/images/gallery/ngorongoro-01.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "ngorongoro-crater-day-trip",
    "sourceSlug": "ngorongoro-crater-day-trip",
    "title": "Ngorongoro Crater Day Trip",
    "duration": "1 Day",
    "activity": "Day trip",
    "places": "Ngorongoro",
    "image": "/images/gallery/ngorongoro-06.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "9-days-best-tanzania-adventure-safari",
    "sourceSlug": "9-days-best-tanzania-adventure-safari",
    "title": "9-Day Best Tanzania Adventure Safari",
    "duration": "9 Days / 8 Nights",
    "activity": "Wildlife Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-02.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "6-days-walking-adventure-safari",
    "sourceSlug": "6-days-walking-adventure-safari",
    "title": "6-Day Walking & Adventure Safari",
    "duration": "6 Days / 5 Nights",
    "activity": "Cultural Experience",
    "places": "Tanzania",
    "image": "/images/gallery/culture-07.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "7-days-tanzania-wilderness-and-cultural-safari",
    "sourceSlug": "7-days-tanzania-wilderness-and-cultural-safari",
    "title": "7-Day Tanzania Wilderness And Cultural Safari",
    "duration": "7 Days / 6 Nights",
    "activity": "Cultural Experience",
    "places": "Tanzania",
    "image": "/images/gallery/culture-01.webp",
    "style": "cultural",
    "featured": false
  },
  {
    "slug": "7-days-cultural-tanzania-camping-budget-safari",
    "sourceSlug": "7-days-cultural-tanzania-camping-budget-safari",
    "title": "7-Day Cultural Tanzania Camping & Budget Safari",
    "duration": "7 Days / 6 Nights",
    "activity": "Camping Safari",
    "places": "Tanzania",
    "image": "/images/gallery/culture-02.webp",
    "style": "mobile",
    "featured": false
  },
  {
    "slug": "6-days-tanzania-luxury-experience",
    "sourceSlug": "6-days-tanzania-luxury-experience",
    "title": "6-Day Tanzania Luxury Experience",
    "duration": "6 Days / 5 Nights",
    "activity": "Luxury Safari",
    "places": "Tanzania",
    "image": "/images/gallery/ngorongoro-07.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "6-days-tanzania-luxury-adventure-experience",
    "sourceSlug": "6-days-tanzania-luxury-adventure-experience",
    "title": "6-Day Tanzania Luxury Adventure Experience",
    "duration": "6 Days / 5 Nights",
    "activity": "Luxury Safari",
    "places": "Tanzania",
    "image": "/images/gallery/ngorongoro-08.webp",
    "style": "luxury",
    "featured": false
  },
  {
    "slug": "6-days-honeymoon-experience-safari",
    "sourceSlug": "6-days-honeymoon-experience-safari",
    "title": "6-Day Honeymoon Experience Safari",
    "duration": "6 Days / 5 Nights",
    "activity": "Honeymoon",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-03.webp",
    "style": "honeymoon",
    "featured": false
  },
  {
    "slug": "6-days-best-tanzania-adventure-safari",
    "sourceSlug": "6-days-best-tanzania-adventure-safari",
    "title": "6-Day Best Tanzania Adventure Safari",
    "duration": "6 Days / 5 Nights",
    "activity": "Wildlife Safari",
    "places": "Tanzania",
    "image": "/images/gallery/serengeti-04.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "2-days-safari-from-zanzibar-tarangire-national-park-and-the-ngorongoro-crater-overview",
    "sourceSlug": "2-days-safari-from-zanzibar-tarangire-national-park-and-the-ngorongoro-crater-overview",
    "title": "2-Day Safari From Zanzibar (Tarangire National Park And The Ngorongoro Crater)",
    "duration": "2 Days / 1 Nights",
    "activity": "Safari & Beach",
    "places": "Tarangire · Ngorongoro · Zanzibar",
    "image": "/images/gallery/ngorongoro-09.webp",
    "style": "zanzibar",
    "featured": false
  },
  {
    "slug": "10-days-river-crossing-great-wildebeest-migration-safari",
    "sourceSlug": "10-days-river-crossing-great-wildebeest-migration-safari",
    "title": "10-Day River Crossing & Great Wildebeest Migration Safari",
    "duration": "10 Days / 9 Nights",
    "activity": "Wildlife Safari",
    "places": "Serengeti",
    "image": "/images/gallery/serengeti-05.webp",
    "style": "wildlife",
    "featured": false
  },
  {
    "slug": "3-days-tarangire-national-park-and-ngorongoro-crater",
    "sourceSlug": "3-days-tarangire-national-park-and-ngorongoro-crater",
    "title": "3-Day Tarangire National Park And Ngorongoro Crater",
    "duration": "3 Days / 2 Nights",
    "activity": "Wildlife Safari",
    "places": "Tarangire · Ngorongoro",
    "image": "/images/gallery/ngorongoro-10.webp",
    "style": "wildlife",
    "featured": false
  }
];

function placesFromText(text) {
  const t = String(text || '').replace(/-/g, ' ').toLowerCase();
  const bits = [];
  if (/tarangire/.test(t)) bits.push('Tarangire');
  if (/serengeti|ndutu|migration|wildebeest/.test(t)) bits.push('Serengeti');
  if (/ngorongoro|crater/.test(t)) bits.push('Ngorongoro');
  if (/manyara/.test(t)) bits.push('Lake Manyara');
  if (/zanzibar/.test(t)) bits.push('Zanzibar');
  if (/kilimanjaro/.test(t)) bits.push('Kilimanjaro');
  if (/\bmeru\b/.test(t)) bits.push('Mount Meru');
  if (/arusha/.test(t)) bits.push('Arusha');
  if (/mikumi/.test(t)) bits.push('Mikumi');
  if (/gombe/.test(t)) bits.push('Gombe');
  if (/usambara/.test(t)) bits.push('Usambara');
  if (/natron|lengai/.test(t)) bits.push('Lake Natron');
  if (/materuni/.test(t)) bits.push('Materuni');
  return [...new Set(bits)].join(' · ');
}

export const gmsTrips = [
  ...PDF_PACKAGES.map(toWebsiteTrip),
  ...legacyGmsTrips.filter((trip) => !REPLACED_SAFARI_SLUGS.has(trip.slug)),
];

for (const trip of gmsTrips) {
  const fromSlug = placesFromText(`${trip.title} ${trip.slug}`);
  if (fromSlug) trip.places = fromSlug;
}

const pricedTrips = gmsTrips.filter((trip) => Number(trip.price_from) > 0);
gmsTrips.length = 0;
gmsTrips.push(...pricedTrips);
assignUniqueCovers(gmsTrips);

export function tripsByStyle(style) {
  if (!style) return gmsTrips;
  return gmsTrips.filter((trip) => trip.style === style);
}

export function styleBySlug(slug) {
  return safariStyles.find((item) => item.slug === slug) || null;
}
