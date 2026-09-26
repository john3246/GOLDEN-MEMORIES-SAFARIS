import fs from 'node:fs';

const path = 'apps/api/src/modules/safaris/safaris.validation.js';
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const oldBlock = `      accommodation: fail(validateOptionalString(day.accommodation || day.stay, \`itinerary[\${index}].accommodation\`, 400)),
      meals: fail(validateOptionalString(day.meals, \`itinerary[\${index}].meals\`, 200)),
      transport: fail(validateOptionalString(day.transport, \`itinerary[\${index}].transport\`, 200)),
      distance: fail(validateOptionalString(day.distance || day.distance_km, \`itinerary[\${index}].distance\`, 80)),
      viewing: fail(validateOptionalString(day.viewing || day.game_viewing, \`itinerary[\${index}].viewing\`, 80)),
      image: fail(validateOptionalString(day.image || day.accommodation_image, \`itinerary[\${index}].image\`, 2000)),
      elevation: fail(validateOptionalString(day.elevation, \`itinerary[\${index}].elevation\`, 200)),
      hiking_time: fail(validateOptionalString(day.hiking_time, \`itinerary[\${index}].hiking_time\`, 100)),
      vegetation_zone: fail(validateOptionalString(day.vegetation_zone, \`itinerary[\${index}].vegetation_zone\`, 150)),
      terrain: fail(validateOptionalString(day.terrain || day.terrain_or_highlight, \`itinerary[\${index}].terrain\`, 200)),`;

const newBlock = `      day_number: typeof day.day_number === 'number' ? day.day_number : (String(day.day).match(/\\d+/)?.[0] ? Number(String(day.day).match(/\\d+/)[0]) : index),
      accommodation: fail(validateOptionalString(day.accommodation_name || day.accommodation || day.stay, \`itinerary[\${index}].accommodation\`, 400)),
      accommodation_name: fail(validateOptionalString(day.accommodation_name || day.accommodation || day.stay, \`itinerary[\${index}].accommodation_name\`, 400)),
      accommodation_image: fail(validateOptionalString(day.accommodation_image, \`itinerary[\${index}].accommodation_image\`, 2000)),
      meals: fail(validateOptionalString(day.meals_included || day.meals, \`itinerary[\${index}].meals\`, 200)),
      meals_included: fail(validateOptionalString(day.meals_included || day.meals, \`itinerary[\${index}].meals_included\`, 200)),
      transport: fail(validateOptionalString(day.transport, \`itinerary[\${index}].transport\`, 200)),
      distance: fail(validateOptionalString(day.distance || day.distance_km, \`itinerary[\${index}].distance\`, 80)),
      viewing: fail(validateOptionalString(day.viewing || day.game_viewing, \`itinerary[\${index}].viewing\`, 80)),
      image: fail(validateOptionalString(day.image, \`itinerary[\${index}].image\`, 2000)),
      elevation: fail(validateOptionalString(day.elevation, \`itinerary[\${index}].elevation\`, 200)),
      hiking_time: fail(validateOptionalString(day.hiking_time, \`itinerary[\${index}].hiking_time\`, 100)),
      vegetation_zone: fail(validateOptionalString(day.vegetation_zone, \`itinerary[\${index}].vegetation_zone\`, 150)),
      terrain: fail(validateOptionalString(day.terrain || day.terrain_or_highlight, \`itinerary[\${index}].terrain\`, 200)),`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated safaris.validation.js');
} else {
  console.error('Could not find oldBlock in safaris.validation.js');
  process.exit(1);
}
