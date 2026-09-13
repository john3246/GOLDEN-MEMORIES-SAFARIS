import { api } from '../api/client.js';
import { shell } from './shell.js';

export function renderMedia(user) {
  return shell(
    user,
    'media',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Library</p>
          <h1>Media</h1>
          <p class="cms-lead">Every image used on tours, destinations, blog, lodges, and the project gallery — plus files you upload here.</p>
        </div>
      </div>
      <form id="media-form" class="cms-panel cms-form-stack">
        <div class="cms-field">
          <label class="cms-label" for="media-file">Upload file</label>
          <input id="media-file" type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" />
        </div>
        <div class="cms-field">
          <label class="cms-label" for="media-url">Or paste image URL</label>
          <input id="media-url" name="url" placeholder="https://" />
        </div>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label" for="media-alt">Alt text</label>
            <input id="media-alt" name="alt" placeholder="Describe the image" />
          </div>
          <div class="cms-field">
            <label class="cms-label" for="media-caption">Caption</label>
            <input id="media-caption" name="caption" placeholder="Optional caption" />
          </div>
        </div>
        <button class="cms-btn cms-btn-gold" type="submit">Add media</button>
      </form>
      <p class="cms-error" id="media-error" hidden></p>
      <div id="media-tabs" class="cms-media-tabs"></div>
      <p class="cms-muted" id="media-count"></p>
      <div id="media-grid" class="cms-media-grid"></div>
    </section>
  `
  );
}

function renderGrid(items) {
  if (!items.length) return '<p class="cms-muted">No media in this category.</p>';
  return items
    .map(
      (item) => `
        <figure class="cms-media-card">
          <img src="${item.url}" alt="${item.alt || ''}" />
          <figcaption>
            <strong>${item.alt || item.filename}</strong>
            <span>${(item.usedOn || []).join(' · ') || item.source}</span>
          </figcaption>
        </figure>`
    )
    .join('');
}

export async function initMedia() {
  const grid = document.querySelector('#media-grid');
  const tabs = document.querySelector('#media-tabs');
  const count = document.querySelector('#media-count');
  const error = document.querySelector('#media-error');
  let library = { total: 0, groups: [] };
  let active = 'all';

  function paint() {
    const group = library.groups.find((item) => item.id === active) || library.groups[0];
    const items = group?.items || [];
    tabs.innerHTML = library.groups
      .map(
        (item) =>
          `<button class="cms-media-tab${item.id === active ? ' is-active' : ''}" type="button" data-media-group="${item.id}">${item.label} <em>${item.count}</em></button>`
      )
      .join('');
    count.textContent = group ? `${group.count} files in ${group.label.toLowerCase()}` : '';
    grid.innerHTML = renderGrid(items);
  }

  async function refresh() {
    library = await api.mediaLibrary();
    if (!library.groups?.length) {
      const uploaded = await api.listMedia();
      library = {
        total: uploaded.length,
        groups: [{ id: 'all', label: 'All media', count: uploaded.length, items: uploaded }],
      };
    }
    paint();
  }

  tabs?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-media-group]');
    if (!button) return;
    active = button.getAttribute('data-media-group');
    paint();
  });

  document.querySelector('#media-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    const form = event.currentTarget;
    const file = form.file.files[0];
    try {
      if (file) await api.uploadMedia(file, form.alt.value, form.caption.value);
      else await api.addMediaUrl(form.url.value, form.alt.value, form.caption.value);
      form.reset();
      await refresh();
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    }
  });

  try {
    await refresh();
  } catch (err) {
    error.hidden = false;
    error.textContent = err.message;
  }
}
