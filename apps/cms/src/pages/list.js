import { safariPackageTitle } from '@gm-safaris/safari-ui';
import { api } from '../api/client.js';
import { shell } from './shell.js';
import {
  cardImage,
  categoryOptions,
  groupedSections,
  photoCard,
  renderGroupedCards,
  TOUR_ORDER,
  tourCategory,
} from '../content/cards.js';
import { notifyError, notifySuccess } from '../components/toast.js';

function durationLabel(item) {
  if (item.duration_label) return item.duration_label;
  if (item.duration) return `${item.duration} Days`;
  return '';
}

function tourCard(item) {
  return photoCard({
    href: `#/safaris/${item.id}`,
    previewHref: `#/safaris/${item.id}/preview`,
    title: safariPackageTitle(item.title),
    image: cardImage(item.hero_image?.url),
    kicker: item.tour_type === 'mountain' ? `🏔️ Mountain Trek • ${durationLabel(item)}` : durationLabel(item),
    detail: item.destination || '',
    status: item.status,
    featured: item.featured,
    itemId: item.id,
    itemType: 'safaris',
  });
}

export function renderList(user) {
  return shell(
    user,
    'safaris',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Content</p>
          <h1>Safari packages</h1>
          <p class="cms-lead">Edit itineraries, media, and copy, then publish when the package is ready for the public site.</p>
        </div>
        <button class="cms-btn cms-btn-gold" type="button" data-create>New safari</button>
      </div>
      <div class="cms-filters cms-panel !flex-row !flex-wrap !items-center !gap-4">
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
      </div>
      <div id="safari-table">Loading…</div>
    </section>
  `
  );
}

export function initList() {
  const mount = document.querySelector('#safari-table');
  const saved = sessionStorage.getItem('gm_cms_search');
  if (saved) {
    const input = document.querySelector('#filter-q');
    if (input) input.value = saved;
    sessionStorage.removeItem('gm_cms_search');
  }

  
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

    async function refresh() {
    const params = {
      q: document.querySelector('#filter-q')?.value,
      status: document.querySelector('#filter-status')?.value,
      limit: 200,
    };
    try {
      const result = await api.listSafaris(params);
      if (!result.data.length) {
        mount.innerHTML = `<p class="cms-muted">No safari packages match these filters.</p>`;
        return;
      }
      const allSections = groupedSections(result.data, tourCategory, TOUR_ORDER);
      const selected = selectedCategory;
      const sections = allSections.filter(([label]) => !selected || label === selected);
      
      // Update All count
      const allBtn = document.querySelector('#category-tabs button[data-category=""]');
      if (allBtn && !selectedCategory) allBtn.textContent = `All (${result.meta.total})`;
      
      mount.innerHTML = `
        ${renderGroupedCards(sections, tourCard)}
        <p class="cms-muted" style="margin-top:1rem">${result.meta.total} packages</p>
      `;
    } catch (err) {
      notifyError(err.message);
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  }

  document.querySelector('[data-refresh]')?.addEventListener('click', refresh);
  
  document.querySelector('[data-create]')?.addEventListener('click', async () => {
    try {
      const created = await api.createSafari({ title: 'New safari package' });
      notifySuccess('New safari created.');
      window.location.hash = `#/safaris/${created.id}`;
    } catch (err) {
      notifyError(err.message);
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  });

  // Quick publish / unpublish from the safari list card
  mount.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-quick-toggle]');
    if (!btn) return;
    event.preventDefault();
    const id = btn.dataset.itemId;
    const currentStatus = btn.dataset.currentStatus;
    if (!id) return;
    btn.disabled = true;
    btn.textContent = '…';
    try {
      if (currentStatus === 'PUBLISHED') {
        await api.action(id, 'unpublish');
        notifySuccess('Unpublished — no longer visible on the public website.');
      } else {
        await api.action(id, 'publish');
        notifySuccess('Published — now visible on the public website.');
      }
      await refresh();
    } catch (err) {
      notifyError(err.message);
      btn.disabled = false;
      btn.textContent = currentStatus === 'PUBLISHED' ? 'Unpublish' : 'Publish';
    }
  });

  refresh();
}

