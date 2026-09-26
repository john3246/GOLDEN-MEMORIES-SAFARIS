import fs from 'node:fs';
import { OFFICIAL_KILIMANJARO_PACKAGES } from './seed-official-kilimanjaro-packages.mjs';

const targetFile = 'apps/website-com/src/pages/kilimanjaro/packages.js';

const fileContent = `import { galleryPhoto, assignUniqueCovers } from '../../media/gallery.js';

const climbIncluded = [
  'All national park entrance fees, camping or hut fees, rescue fees and 18% VAT',
  'Certified wilderness first responder English-speaking head guide, assistant guides, cook and porters',
  'Mountain huts or 4-season high-altitude mountain tents, foam sleeping pads, mess tent with tables and backed chairs',
  'Private chemical flush toilet tent throughout the trekking duration',
  'All meals on the mountain (hearty breakfasts, hot lunches on trail, dinners, and afternoon snacks)',
  'Emergency oxygen cylinder, pulse oximeter, and comprehensive medical first-aid kit',
  'Clean, purified drinking water provided daily on the trail',
  'Return airport transfers from Kilimanjaro International Airport (JRO) and trailhead transport',
  'Pre-climb gear inspection, briefing, and celebratory post-climb dinner',
];

const climbExcluded = [
  'International and domestic flights',
  'Entry visa fees for Tanzania',
  'Tips for the mountain crew (recommended guideline: $250–$350 per trekker total)',
  'Personal trekking gear (sleeping bag, trekking poles, warm apparel — rental available)',
  'Comprehensive travel and medical insurance with high-altitude evacuation up to 6,000m',
  'Alcoholic beverages and personal items',
];

export const kilimanjaroTreks = ${JSON.stringify(
  OFFICIAL_KILIMANJARO_PACKAGES.map((pkg, idx) => ({
    ...pkg,
    style: 'mountain',
    activity: 'Kilimanjaro trekking',
    places: 'Kilimanjaro',
    image: pkg.hero_image?.url || `/images/gallery/kilimanjaro-0${(idx % 9) + 1}.webp`,
    days: pkg.itinerary.map((d) => ({
      day_number: d.day_number,
      day: d.day,
      title: d.title,
      body: d.description,
      description: d.description,
      elevation: d.elevation,
      hiking_time: d.hiking_time,
      vegetation_zone: d.vegetation_zone,
      meals: d.meals,
      meals_included: d.meals_included,
      stay: d.accommodation_name,
      accommodation_name: d.accommodation_name,
      accommodation: d.accommodation_name,
      accommodation_image: d.accommodation_image,
      image: d.accommodation_image,
      transport: 'On foot with mountain crew',
      viewing: d.hiking_time,
    })),
    itinerary: pkg.itinerary.map((d) => ({
      day_number: d.day_number,
      day: d.day,
      title: d.title,
      body: d.description,
      description: d.description,
      elevation: d.elevation,
      hiking_time: d.hiking_time,
      vegetation_zone: d.vegetation_zone,
      meals: d.meals,
      meals_included: d.meals_included,
      stay: d.accommodation_name,
      accommodation_name: d.accommodation_name,
      accommodation: d.accommodation_name,
      accommodation_image: d.accommodation_image,
      image: d.accommodation_image,
      transport: 'On foot with mountain crew',
      viewing: d.hiking_time,
    })),
  })),
  null,
  2
)};

assignUniqueCovers(kilimanjaroTreks);
`;

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log('Successfully updated apps/website-com/src/pages/kilimanjaro/packages.js');
