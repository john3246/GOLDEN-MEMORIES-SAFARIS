import { testimonials, media as GM } from '../home/content.js';

export const reviewsHero = { image: GM.savanna };

export const reviewList = [
  ...testimonials,
  {
    quote: 'Our guide knew the parks inside out. We saw lions, elephants, and a crater floor that felt unreal — and the pacing never felt rushed.',
    name: 'Couple safari',
    detail: 'Ngorongoro and Serengeti',
  },
  {
    quote: 'Clear communication from Arusha before we arrived, and lodges that matched what we were promised. We would book again for Kilimanjaro.',
    name: 'Friends group',
    detail: 'Northern Circuit',
  },
];
