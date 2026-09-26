const fs = require('fs');

const file = 'apps/website-com/src/pages/home/home.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Center the Region Cards (destinations)
content = content.replace(
  /<div class="reveal mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" data-destinations>/,
  `<div class="reveal mt-6 grid max-w-6xl mx-auto justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3" data-destinations>`
);

// 2. Zanzibar Section Dynamic Cards
// It already uses beachGrid, but beachGrid filters by hasTourPrice.
// Let's remove the filter so it shows the 3 packages.
content = content.replace(
  /const beachGrid = zanzibar\.filter\(hasTourPrice\)\.map\(tourCard\)\.join\(''\);/,
  `const beachGrid = zanzibar.slice(0, 3).map(tourCard).join('');`
);

// Make Zanzibar section layout nicer: text on left/top, grid on right/bottom.
// The prompt says: "Display a responsive carousel or grid (up to 3–4 cards) featuring the Zanzibar packages next to or beneath the description."
// Currently it is:
// <div class="container-site">
//   <div class="reveal max-w-2xl">...</div>
//   ${beachGrid ? \`<div class="reveal mt-6 grid gap-4 md:grid-cols-3">\${beachGrid}</div>\` : ''}
// </div>
// This is already beneath the description. Let's make it a nice 3-col grid.

fs.writeFileSync(file, content);
console.log('Updated home.js');
