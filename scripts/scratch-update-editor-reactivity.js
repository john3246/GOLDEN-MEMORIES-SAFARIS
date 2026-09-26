const fs = require('fs');

const file = 'apps/cms/src/pages/editor.js';
let content = fs.readFileSync(file, 'utf8');

// Add change listener for tour_type in bindForm
const bindFormMatch = content.indexOf(`form?.addEventListener('change', () => {`);
if (bindFormMatch !== -1) {
  const injection = `
    form?.querySelector('[data-tour-type-select]')?.addEventListener('change', (e) => {
      current.tour_type = e.target.value;
      paintForm();
      paintReady(current);
      bindForm();
    });
`;
  content = content.substring(0, bindFormMatch) + injection + content.substring(bindFormMatch);
}

fs.writeFileSync(file, content);
console.log('Added tour_type reactivity');
