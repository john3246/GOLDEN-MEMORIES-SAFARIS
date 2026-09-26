const fs = require('fs');
['join-safari/detail.js', 'destinations/detail.js'].forEach(f => {
  let file = 'apps/website-com/src/pages/' + f;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  fs.writeFileSync(file, content);
});
console.log('Fixed backticks');
