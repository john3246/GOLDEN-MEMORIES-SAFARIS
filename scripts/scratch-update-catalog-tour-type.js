const fs = require('fs');

const file = 'apps/website-com/src/pages/tours/catalog.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /slug,\s+overview:/,
  `slug,\n      tour_type: isClimb ? 'mountain' : (tour.tour_type || 'safari'),\n      overview:`
);

fs.writeFileSync(file, content);
console.log('Updated withDefaults in catalog.js to inject tour_type');
