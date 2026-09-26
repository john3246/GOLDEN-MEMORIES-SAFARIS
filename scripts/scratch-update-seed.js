const fs = require('fs');

const file = 'apps/api/src/modules/safaris/safaris.seed.js';
let content = fs.readFileSync(file, 'utf8');

// Replace PDF_PACKAGES with allTours import
content = content.replace(
  /import \{ PDF_PACKAGES, toSafariDocument \} from '\.\/pdf-packages\.js';/,
  `import { toSafariDocument } from './pdf-packages.js';\nimport { allTours } from '../../../../website-com/src/pages/tours/catalog.js';`
);

// Replace the loop to use allTours()
content = content.replace(
  /for \(const item of PDF_PACKAGES\) \{/,
  `const toursToSeed = typeof allTours === 'function' ? allTours() : [];\n  for (const item of toursToSeed) {`
);

// We need to inject tour_type if it is missing
content = content.replace(
  /const draft = toDraft\(item\);/,
  `const draft = toDraft(item);
    if (item.tour_type) {
      draft.tour_type = item.tour_type;
    }
    if (/kilimanjaro|meru/i.test(item.title)) {
      draft.tour_type = 'mountain';
    } else if (/zanzibar/i.test(item.title) || /zanzibar/i.test(item.places)) {
      draft.tour_type = 'beach';
    }`
);

fs.writeFileSync(file, content);
console.log('Updated safaris.seed.js to use allTours');
