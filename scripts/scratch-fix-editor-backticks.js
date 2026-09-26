const fs = require('fs');
let file = 'apps/cms/src/pages/editor.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`');
fs.writeFileSync(file, content);
