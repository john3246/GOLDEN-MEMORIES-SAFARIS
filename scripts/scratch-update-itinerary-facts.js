const fs = require('fs');

const file = 'packages/safari-ui/src/sections/itinerary.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\['Meals included', item\.meals \|\| mealsDef\],/,
  `['Meals included', item.meals || mealsDef],\n      ['Accommodation', item.accommodation || item.stay || (last ? '' : 'Lodge or camp as confirmed')],`
);

fs.writeFileSync(file, content);
console.log('Added accommodation back to mountain facts');
