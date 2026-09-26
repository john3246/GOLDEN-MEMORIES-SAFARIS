import { PDF_PACKAGES, toWebsiteTrip } from '../../../../api/src/modules/safaris/pdf-packages.js';
import { media as GM, testimonials } from '../home/content.js';

export { testimonials };

export const safariHero = {
  kicker: 'Wildlife tour',
  title: 'Tanzania safari tours & packages',
  cta: 'Talk to an expert',
  image: GM.savanna,
};

export const safariIntro = {
  title: 'Private safaris across Tanzania’s most celebrated parks',
  image: GM.ngorongoroTourists,
  imageAlt: 'Guests viewing wildlife from a safari vehicle in Tanzania',
  paragraphs: [
    'Golden Memories Safaris designs private Tanzania wildlife itineraries from our base in Arusha, northern-circuit classics, quieter southern parks, and combinations that end on the coast.',
    'Each safari package is built around game drives, trusted lodges or camps, and the pace you want: migration season in the Serengeti, crater floors at Ngorongoro, elephant country in Tarangire, or wilder days in Ruaha and Nyerere.',
    'Tell us your dates and travel style. Our consultants will match parks, nights, and vehicle setup so the journey feels considered from the first transfer to the last sundowner.',
  ],
};

export const safariPackages = PDF_PACKAGES.map((pkg) => {
  const trip = toWebsiteTrip(pkg);
  return {
    ...trip,
    image: trip.image || GM.safariPackages,
  };
});

export const whySafari = [
  {
    title: 'Discover Tanzania with experienced safari guides',
    body: 'Our guides know the parks, the seasons, and how to pace a game drive so you see more without rushing the day.',
  },
  {
    title: 'Experience Tanzania’s beauty and wildlife',
    body: 'From crater rims to open plains, itineraries are chosen for landscape, animals, and the time of year you travel.',
  },
  {
    title: 'Seamless, stress-free safari planning',
    body: 'Park fees, lodges, vehicles, and transfers are handled by the Arusha team so you can focus on the journey.',
  },
];

export const bookingSteps = [
  {
    step: 'Step 1',
    title: 'Share your dates',
    body: 'Tell us who is travelling, your preferred parks, and how many days you have.',
  },
  {
    step: 'Step 2',
    title: 'Receive a tailored plan',
    body: 'We send a clear itinerary with lodges, game-drive days, and what is included.',
  },
  {
    step: 'Step 3',
    title: 'Confirm and travel',
    body: 'Lock in the safari, receive joining notes, and meet your guide in Arusha.',
  },
];

export const safariFaqs = [
  {
    q: 'When is the best time to go on a Tanzania safari?',
    a: 'The dry months of June to October are excellent for game viewing. The wildebeest calving season in the southern Serengeti is typically January to March, while river crossings in the north usually peak from July to October. We match the circuit to your dates.',
  },
  {
    q: 'What are the top safari destinations in Tanzania?',
    a: 'Most first-time visitors combine Tarangire, Serengeti, and Ngorongoro. The south (Ruaha and Nyerere/Selous) is quieter and wilder.',
  },
  {
    q: 'How much does a Tanzania safari cost?',
    a: 'Each package on this page shows a published rate per person, based on two travellers sharing. That figure includes park fees, lodges, meals, and the private 4x4 listed on the itinerary. Solo supplements, peak-season lodges, or extra activities can change the final invoice, we confirm the number before you pay.',
  },
  {
    q: 'What kind of wildlife can I expect to see?',
    a: 'The northern circuit is known for lion, elephant, buffalo, leopard, and rhino (especially in Ngorongoro), plus vast herds of wildebeest and zebra in season. Birdlife is strong year-round.',
  },
  {
    q: 'Is Tanzania safe for tourists on safari?',
    a: 'Safari parks are well managed and we use experienced driver-guides, maintained vehicles, and established camps. We brief you on park rules and health basics before you travel.',
  },
  {
    q: 'What should I pack for a Tanzania safari?',
    a: 'Neutral clothing, a warm layer for early drives, sun protection, binoculars, and any personal medication. We send a packing list with your confirmation.',
  },
  {
    q: 'Can I combine a safari with Kilimanjaro or Zanzibar?',
    a: 'Yes. Many guests trek Kilimanjaro or fly to Zanzibar after the safari. We plan the join-up so transfers and rest days make sense.',
  },
  {
    q: 'Are private or group safaris available?',
    a: 'We specialise in private safaris for couples, families, and friends. Ask if you prefer to join a small scheduled departure.',
  },
];

export const planningTips = [
  {
    title: 'Choose parks for the season',
    body: 'Migration, calving, and the long dry season each favour different corners of the Serengeti and north.',
  },
  {
    title: 'Allow enough nights',
    body: 'Two nights in a park is a minimum; three in the Serengeti gives game drives room to breathe.',
  },
  {
    title: 'Think about the last night',
    body: 'Many itineraries end near Arusha or fly on to the coast so you are not rushing an international departure.',
  },
];
