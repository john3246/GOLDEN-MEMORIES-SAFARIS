const fs = require('fs');

const file = 'apps/cms/src/pages/list.js';
let content = fs.readFileSync(file, 'utf8');

// The problematic lines:
//   ">${item.label} (${item.count})</option>`)
//           .join('')}`;
//         if (current && allSections.some(([label]) => label === current)) select.value = current;
//       }

content = content.replace(/">.*?\(\$\{item\.count\}\)<\/option>`\)\s*\.join\(''\)\}`;/g, '');
content = content.replace(/if \(current && allSections\.some\(\(\[label\]\) => label === current\)\) select\.value = current;/g, '');
content = content.replace(/\s*\}/g, '}');

// A safer way: I'll just rewrite the `refresh()` function entirely so it's clean.
