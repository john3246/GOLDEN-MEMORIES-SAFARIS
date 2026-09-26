import { galleryPhoto, assignUniqueCovers } from '../../media/gallery.js';
import { openJoiningPackages } from './packages.js';

export { openJoiningPackages };

export const joinHero = {
  kicker: 'Scheduled group departure',
  title: 'Join a Group Safari',
  subtitle: 'Fixed dates, a small group and an experienced local guide, share the vehicle and the cost, not the experience.',
  cta: 'View open departures',
  image: galleryPhoto('serengeti', 8),
};

export const joiningSafaris = [
  {
    id: 'ndutu-calving-2027',
    slug: '6-days-great-wildebeest-calving-experience',
    title: '6-Day Great Wildebeest Calving Experience (Joining Safari)',
    datesLabel: 'February 15–20, 2027',
    start: '2027-02-15',
    end: '2027-02-20',
    duration: '6 Days / 5 Nights',
    places: 'Arusha · Ngorongoro · Ndutu',
    image: galleryPhoto('serengeti', 8),
    spaces: 'Spaces limited',
    deposit: 'Join group',
    activity: 'Group Safari',
    included: [
      'Park and crater fees as per the itinerary',
      'Shared 4x4 safari vehicle and professional English-speaking guide',
      'Lodge and tented camp nights as listed',
      'Meals as specified each day',
      'Drinking water on game drives',
      'Arusha airport or hotel transfers on safari days',
    ],
    excluded: [
      'International flights and Tanzania visa',
      'Travel insurance',
      'Drinks, tips, and personal expenses',
      'Optional balloon safari or cultural visits',
    ],
    tags: [
      { label: 'Calving season', detail: 'Ndutu plains' },
      { label: 'Crater game drive', detail: 'Ngorongoro' },
      { label: 'Big cats', detail: 'Predator action' },
    ],
    overview:
      'Experience one of Africa’s most spectacular wildlife events as thousands of wildebeest give birth across the Ndutu plains. Witness breathtaking predator action, endless wildlife, and unforgettable landscapes.',
    cta: 'Seats are limited to keep the group small, reserve yours early.',
    highlights: [
      'Great Wildebeest Calving Season',
      'Ngorongoro Crater Game Drive',
      'Full Days Exploring Ndutu',
      'Big Cats & Predator Action',
      'Expert Safari Guide',
      'Comfortable Lodge & Tented Camp Accommodation',
    ],
    days: [
      {
        iso: '2027-02-15',
        day: 'Day 1',
        dateLabel: 'February 15, 2027',
        title: 'Arrival in Arusha',
        body: 'Arrival in Arusha and overnight at Njiro Legacy.',
        stay: 'Njiro Legacy',
        viewing: '—',
        transport: 'Airport or hotel transfer',
        meals: 'Dinner',
        image: galleryPhoto('culture', 3),
      },
      {
        iso: '2027-02-16',
        day: 'Day 2',
        dateLabel: 'February 16, 2027',
        title: 'Ngorongoro Crater to Ndutu',
        body: 'Drive from Arusha to the breathtaking Ngorongoro Crater for a game drive, then continue to Ndutu. Overnight at Ang’ata Migration Camp, Ndutu.',
        stay: 'Ang’ata Migration Camp, Ndutu',
        viewing: 'Crater game drive',
        transport: '4x4 safari vehicle',
        meals: 'Breakfast, lunch & dinner',
        image: galleryPhoto('ngorongoro', 9),
      },
      {
        iso: '2027-02-17',
        day: 'Day 3',
        dateLabel: 'February 17, 2027',
        title: 'Full day in Ndutu',
        body: 'Full-day game drive in Ndutu, following the Great Migration and witnessing the calving season. Overnight at Ang’ata Migration Camp.',
        stay: 'Ang’ata Migration Camp, Ndutu',
        viewing: 'Full-day game drive',
        transport: '4x4 safari vehicle',
        meals: 'Breakfast, lunch & dinner',
        image: galleryPhoto('serengeti', 5),
      },
      {
        iso: '2027-02-18',
        day: 'Day 4',
        dateLabel: 'February 18, 2027',
        title: 'Ndutu predator country',
        body: 'Another full day exploring Ndutu, renowned for its abundant wildlife and thrilling predator encounters. Overnight at Ang’ata Migration Camp.',
        stay: 'Ang’ata Migration Camp, Ndutu',
        viewing: 'Full-day game drive',
        transport: '4x4 safari vehicle',
        meals: 'Breakfast, lunch & dinner',
        image: galleryPhoto('serengeti', 6),
      },
      {
        iso: '2027-02-19',
        day: 'Day 5',
        dateLabel: 'February 19, 2027',
        title: 'Last Ndutu morning, return to Arusha',
        body: 'Enjoy a final full-day game drive in Ndutu before driving back to Arusha in the late afternoon. Overnight at Njiro Legacy.',
        stay: 'Njiro Legacy',
        viewing: 'Morning & afternoon game drive',
        transport: '4x4 safari vehicle',
        meals: 'Breakfast, lunch & dinner',
        image: galleryPhoto('serengeti', 7),
      },
      {
        iso: '2027-02-20',
        day: 'Day 6',
        dateLabel: 'February 20, 2027',
        title: 'Departure',
        body: 'Departure from Arusha, airport transfer or onward travel as arranged.',
        stay: 'Own arrangements / onward transfer',
        viewing: '—',
        transport: 'Transfer',
        meals: 'Breakfast',
        image: galleryPhoto('culture', 4),
      },
    ],
  },
];

assignUniqueCovers(joiningSafaris);

export function isoInRange(iso, start, end) {
  return iso >= start && iso <= end;
}

export function departureForDate(iso) {
  return joiningSafaris.find((trip) => isoInRange(iso, trip.start, trip.end)) || null;
}

export function dayForDate(iso) {
  const trip = departureForDate(iso);
  if (!trip) return null;
  return trip.days.find((item) => item.iso === iso) || null;
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CALENDAR_YEARS = [2026, 2027, 2028];

export const joinIntro = {
  title: 'Open group safari departures',
  body: [
    'Joining safaris use a shared 4x4, a published itinerary, and a local Golden Memories guide. The 2026–2027 packages below have set prices per person. The Ndutu calving safari in February 2027 is a dated departure with its own camp nights.',
    'Pick a joining package, or choose a year and month for scheduled departures. If these dates do not fit, we can open another group or run the same route as a private safari.',
  ],
};

export const joinFaqs = [
  {
    q: 'How is a joining safari different from a private safari?',
    a: 'A joining safari has fixed dates, a shared vehicle, and a published itinerary. A private safari is only your party, you choose the start date, pace, and lodges. Both use the same guiding standard.',
  },
  {
    q: 'What if February 2027 does not fit my travel dates?',
    a: 'Write to us. We can look at opening another joining departure, or run the same Ndutu calving circuit as a private safari on dates that suit you.',
  },
  {
    q: 'Can a couple or a small family join together?',
    a: 'Yes. Couples and small groups often join this departure. Tell us your names and room sharing when you request a seat.',
  },
  {
    q: 'Is this departure guaranteed to run?',
    a: 'This calving-season joining safari is scheduled for 15–20 February 2027. We will confirm remaining seats when you enquire. Spaces are limited.',
  },
];
