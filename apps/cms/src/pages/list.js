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
    title: item.title,
    image: cardImage(item.hero_image?.url),
    kicker: durationLabel(item),
    detail: item.destination || '',
    status: item.status,
    featured: item.featured,
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
      <div class="cms-filters cms-panel">
        <div class="cms-field">
          <label class="cms-label" for="filter-q">Search</label>
          <input id="filter-q" placeholder="Title or slug" />
        </div>
        <div class="cms-field">
          <label class="cms-label" for="filter-status">Status</label>
          <select id="filter-status">
            <option value="">All statuses</option>
            <option>DRAFT</option>
            <option>PUBLISHED</option>
            <option>UNPUBLISHED</option>
            <option>ARCHIVED</option>
          </select>
        </div>
        <div class="cms-field">
          <label class="cms-label" for="filter-category">Category</label>
          <select id="filter-category">
            <option value="">All categories</option>
          </select>
        </div>
        <div class="cms-field">
          <label class="cms-label" for="filter-featured">Featured</label>
          <select id="filter-featured">
            <option value="">Any</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </select>
        </div>
        <div class="cms-field">
          <label class="cms-label" for="filter-sort">Sort</label>
          <select id="filter-sort">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="display_order">Display order</option>
            <option value="updated">Recently updated</option>
          </select>
        </div>
        <button class="cms-btn cms-btn-navy" type="button" data-refresh>Apply</button>
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

  async function refresh() {
    const params = {
      q: document.querySelector('#filter-q')?.value,
      status: document.querySelector('#filter-status')?.value,
      featured: document.querySelector('#filter-featured')?.value,
      sort: document.querySelector('#filter-sort')?.value,
      limit: 200,
    };
    try {
      const result = await api.listSafaris(params);
      if (!result.data.length) {
        mount.innerHTML = `<p class="cms-muted">No safari packages match these filters.</p>`;
        return;
      }
      const allSections = groupedSections(result.data, tourCategory, TOUR_ORDER);
      const selected = document.querySelector('#filter-category')?.value || '';
      const sections = allSections.filter(([label]) => !selected || label === selected);
      const select = document.querySelector('#filter-category');
      if (select) {
        const current = select.value;
        select.innerHTML = `<option value="">All categories</option>${categoryOptions(allSections)
          .map((item) => `<option value="${item.label}">${item.label} (${item.count})</option>`)
          .join('')}`;
        if (current && allSections.some(([label]) => label === current)) select.value = current;
      }
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
  document.querySelector('#filter-category')?.addEventListener('change', refresh);
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
  refresh();
}
