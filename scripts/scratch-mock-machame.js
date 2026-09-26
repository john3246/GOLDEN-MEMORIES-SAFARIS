const fs = require('fs');
const file = 'apps/website-com/src/pages/tours/catalog.js';
let content = fs.readFileSync(file, 'utf8');

// Mock data for Machame Day 2 to show metrics
content = content.replace(
  /\['Day 2', 'Machame Gate to Machame Camp', 'Rainforest ascent\.'\],/,
  `['Day 2', 'Machame Gate to Machame Camp', 'Rainforest ascent.', { elevation: '1,640m (5,380ft) to 2,850m (9,350ft)', hiking_time: '5-7 hours', vegetation_zone: 'Montane Rainforest', stay: 'Camping at Machame Camp' }],`
);

fs.writeFileSync(file, content);
console.log('Mocked Machame metrics');
