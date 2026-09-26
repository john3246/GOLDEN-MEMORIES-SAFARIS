const fs = require('fs');

const file = 'apps/cms/src/pages/list.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the old cms-filters with new tabs
const newFilters = `<div class="cms-filters cms-panel !flex-row !flex-wrap !items-center !gap-4">
        <div class="flex items-center gap-2 mr-auto" id="category-tabs">
          <button type="button" class="cms-btn cms-btn-navy" data-category="">All</button>
          <button type="button" class="cms-btn" data-category="Wildlife safari tours">Wildlife Safaris</button>
          <button type="button" class="cms-btn" data-category="Mountain climbing & treks">Mountain Trekking</button>
          <button type="button" class="cms-btn" data-category="Zanzibar & beach">Zanzibar & Coastal</button>
        </div>
        <div class="cms-field !mb-0 !w-auto">
          <input id="filter-q" placeholder="Search tours..." style="min-width: 250px" />
        </div>
        <div class="cms-field !mb-0 !w-auto">
          <select id="filter-status">
            <option value="">All statuses</option>
            <option>PUBLISHED</option>
            <option>DRAFT</option>
          </select>
        </div>
        <button class="cms-btn cms-btn-navy" type="button" data-refresh style="display:none">Apply</button>
      </div>`;

content = content.replace(/<div class="cms-filters cms-panel">[\s\S]*?<\/div>\s*<div id="safari-table">/, newFilters + '\n      <div id="safari-table">');

// Now, update initList to handle the category tabs
const tabLogic = `
  let selectedCategory = '';
  document.querySelectorAll('#category-tabs button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#category-tabs button').forEach(b => {
        b.classList.remove('cms-btn-navy');
      });
      e.target.classList.add('cms-btn-navy');
      selectedCategory = e.target.dataset.category;
      refresh();
    });
  });

  const searchInput = document.querySelector('#filter-q');
  let searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(refresh, 300);
  });

  document.querySelector('#filter-status')?.addEventListener('change', refresh);
`;

content = content.replace(/async function refresh\(\) \{/, tabLogic + '\n  async function refresh() {');

// Inside refresh(), instead of passing selectedCategory to an old dropdown, just use selectedCategory directly
content = content.replace(
  /const selected = document\.querySelector\('#filter-category'\)\?\.value \|\| '';/,
  `const selected = selectedCategory;`
);

content = content.replace(
  /const select = document\.querySelector\('#filter-category'\);[\s\S]*?if \(select\) \{[\s\S]*?\}/,
  `
      // Update All count
      const allBtn = document.querySelector('#category-tabs button[data-category=""]');
      if (allBtn && !selectedCategory) allBtn.textContent = \`All (\${result.meta.total})\`;
  `
);

// Remove the old filter-category change listener
content = content.replace(/document\.querySelector\('#filter-category'\)\?\.addEventListener\('change', refresh\);/, '');

fs.writeFileSync(file, content);
console.log('Updated list.js with tabs');
