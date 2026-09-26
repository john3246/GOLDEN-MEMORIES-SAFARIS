const fs = require('fs');

const file = 'apps/cms/src/pages/list.js';
let content = fs.readFileSync(file, 'utf8');

const newRefresh = `  async function refresh() {
    const params = {
      q: document.querySelector('#filter-q')?.value,
      status: document.querySelector('#filter-status')?.value,
      limit: 200,
    };
    try {
      const result = await api.listSafaris(params);
      if (!result.data.length) {
        mount.innerHTML = \`<p class="cms-muted">No safari packages match these filters.</p>\`;
        return;
      }
      const allSections = groupedSections(result.data, tourCategory, TOUR_ORDER);
      const selected = selectedCategory;
      const sections = allSections.filter(([label]) => !selected || label === selected);
      
      // Update All count
      const allBtn = document.querySelector('#category-tabs button[data-category=""]');
      if (allBtn && !selectedCategory) allBtn.textContent = \`All (\${result.meta.total})\`;
      
      mount.innerHTML = \`
        \${renderGroupedCards(sections, tourCard)}
        <p class="cms-muted" style="margin-top:1rem">\${result.meta.total} packages</p>
      \`;
    } catch (err) {
      notifyError(err.message);
      mount.innerHTML = \`<p class="cms-error">\${err.message}</p>\`;
    }
  }`;

// I will replace the broken refresh function
content = content.replace(/async function refresh\(\) \{[\s\S]*?mount\.innerHTML = `<p class="cms-error">\$\{err\.message\}<\/p>`;\s*\}\s*\}/, newRefresh);

fs.writeFileSync(file, content);
console.log('Fixed list.js refresh function');
