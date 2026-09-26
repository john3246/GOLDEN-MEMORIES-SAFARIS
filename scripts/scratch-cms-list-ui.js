const fs = require('fs');

const file = 'apps/cms/src/pages/list.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the <header> in shell with the new filter bar
content = content.replace(
  /shell\(\{[\s\S]*?mount\.innerHTML = \`/,
  `shell({
    title: 'Safari Packages',
    actions: \`<button type="button" class="btn-navy" data-create>+ New Package</button>\`,
  });

  mount.innerHTML = \`
    <div class="cms-filters sticky top-[4rem] z-10 bg-mist pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-col gap-4 border-b border-ink/10 mb-6">
      <div class="flex flex-wrap gap-2 text-sm font-semibold text-ink/70" id="tour-tabs">
        <button class="px-3 py-1.5 rounded-full bg-ink text-white" data-type="all">All (<span id="count-all">0</span>)</button>
        <button class="px-3 py-1.5 rounded-full hover:bg-ink/10" data-type="safari">Wildlife Safaris</button>
        <button class="px-3 py-1.5 rounded-full hover:bg-ink/10" data-type="mountain">Mountain Trekking</button>
        <button class="px-3 py-1.5 rounded-full hover:bg-ink/10" data-type="beach">Zanzibar & Coastal</button>
      </div>
      <div class="flex gap-4">
        <input type="search" id="tour-search" placeholder="Search tours by name..." class="cms-input flex-1 max-w-sm" />
        <select id="tour-status" class="cms-input w-40">
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>
    </div>
    <div id="tour-list" class="cms-tour-grid"></div>
  \`;`
);

// We need to implement client-side filtering on the fetched data, or pass them to api.listSafaris.
// Since the prompt says "Check the CMS tour fetch endpoint... Ensure the API returns all tours or provides pagination/search support."
// and "Add a Search bar and a quick dropdown to filter by status", I will fetch all (200 limit is fine) and filter client side for responsiveness, OR pass them to the API if it supports it. The API parseAdminQuery supports `q` and `status`!

fs.writeFileSync(file, content);
console.log('Updated list.js shell/header');
