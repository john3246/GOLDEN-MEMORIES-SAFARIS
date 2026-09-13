import { api } from '../api/client.js';
import { shell } from './shell.js';

function pill(status, featured) {
  const kind = status === 'PUBLISHED' ? 'is-live' : 'is-draft';
  return `<span class="cms-pill ${kind}">${status}</span>${featured ? ' <span class="cms-pill">Featured</span>' : ''}`;
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
      mount.innerHTML = `
        <div class="cms-package-list">
          ${result.data
            .map(
              (item) => `
            <article class="cms-package-card">
              <h3><a href="#/safaris/${item.id}">${item.title}</a></h3>
              <div>${pill(item.status, item.featured)}</div>
              <p class="cms-meta-row">
                <span>${item.destination || 'No destination'}</span>
                <span>${item.slug}</span>
                <span>${item.updated_at?.slice(0, 16)?.replace('T', ' ') || ''}</span>
              </p>
            </article>`
            )
            .join('')}
        </div>
        <p class="cms-muted" style="margin-top:1rem">${result.meta.total} packages</p>
      `;
    } catch (err) {
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  }

  document.querySelector('[data-refresh]')?.addEventListener('click', refresh);
  document.querySelector('[data-create]')?.addEventListener('click', async () => {
    try {
      const created = await api.createSafari({ title: 'New safari package' });
      window.location.hash = `#/safaris/${created.id}`;
    } catch (err) {
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  });
  refresh();
}
