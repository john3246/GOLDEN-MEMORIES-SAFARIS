import { testimonials, media as GM } from '../home/content.js';

export const reviewsHero = { image: GM.savanna };

/** Published CMS testimonials (filled from the CMS at runtime). */
export const reviewList = [...testimonials];
