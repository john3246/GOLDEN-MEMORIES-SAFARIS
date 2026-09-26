const fs = require('fs');
const file = 'apps/cms/src/pages/list.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /kicker: durationLabel\(item\),/,
  `kicker: item.tour_type === 'mountain' ? \`🏔️ Mountain Trek • \${durationLabel(item)}\` : durationLabel(item),`
);

fs.writeFileSync(file, content);
console.log('Added mountain badge to tourCard kicker');
