import { api } from '../api/client.js';
import { shell } from './shell.js';
import { notifyError, notifySuccess } from '../components/toast.js';
import { esc, safeUrl } from '../components/escape.js';

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
          <p class="cms-lead">Every photo used on tours, destinations, the blog, lodges and pages, plus the files you upload. Uploads are resized and converted to fast-loading WebP automatically and saved in the database, so they survive server updates. Check <strong>Needs attention</strong> for missing or broken photos.</p>
        </div>
      </div>
      <form id="media-form" class="cms-panel cms-form-stack">
        <div class="cms-field">
          <label class="cms-label" for="media-file">Upload photos (you can pick several)</label>
          <input id="media-file" type="file" name="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" />
          <p class="cms-hint">JPG, PNG, WebP or GIF, up to 10 MB each. Large photos are resized to 2000 px.</p>
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
        <button class="cms-btn cms-btn-gold" type="submit" data-media-submit>Add media</button>
      </form>
      <p class="cms-error" id="media-error" hidden></p>
      <div id="media-tabs" class="cms-media-tabs"></div>
      <p class="cms-muted" id="media-count"></p>
      <div id="media-grid" class="cms-media-grid"></div>
      <dialog class="cms-media-lightbox" id="media-lightbox">
        <img alt="" />
        <form method="dialog"><button class="cms-btn" type="submit">Close</button></form>
      </dialog>
    </section>
  `
  );
}

function renderGrid(items) {
  if (!items.length) return '<p class="cms-muted">No media in this category.</p>';
  return items
    .map((item) => {
      const canDelete = item.deletable !== false;
      const label = item.alt || item.filename || 'image';
      return `
        <figure class="cms-media-card${item.problem ? ' has-problem' : ''}">
          <button class="cms-media-thumb" type="button" data-media-open="${esc(encodeURIComponent(item.url))}" aria-label="Open ${esc(label)}">
            <img src="${safeUrl(item.url)}" alt="${esc(item.alt || '')}" loading="lazy" decoding="async" draggable="false" />
          </button>
          <figcaption>
            <strong>${esc(label)}</strong>
            <span>${esc((item.usedOn || []).join(' · ') || item.source || '')}</span>
            ${item.problem ? `<span class="cms-error" style="display:block;margin:0.35rem 0 0">${esc(item.problem)}</span>` : ''}
            ${
              canDelete
                ? `<button class="cms-btn cms-btn-danger cms-media-delete" type="button" data-media-delete data-media-id="${esc(item.id || '')}" data-media-url="${esc(encodeURIComponent(item.url || ''))}">${item.source === 'upload' ? 'Delete' : 'Remove from site'}</button>`
                : ''
            }
          </figcaption>
        </figure>`;
    })
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
          `<button class="cms-media-tab${item.id === active ? ' is-active' : ''}${item.id === 'problems' ? ' is-warning' : ''}" type="button" data-media-group="${esc(item.id)}">${esc(item.label)} <em>${Number(item.count) || 0}</em></button>`
      )
      .join('');
    count.textContent = group ? `${group.count} files in ${group.label.toLowerCase()}` : '';
    grid.innerHTML = renderGrid(items);
    grid.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => img.classList.add('is-broken'));
    });
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

  const lightbox = document.querySelector('#media-lightbox');
  grid?.addEventListener('click', async (event) => {
    const remove = event.target.closest('[data-media-delete]');
    if (remove) {
      event.preventDefault();
      const label = remove.closest('figure')?.querySelector('strong')?.textContent || 'this photo';
      if (!window.confirm(`Remove "${label}"? It will be taken off every tour, destination, article or page that uses it.`)) {
        return;
      }
      try {
        await api.deleteMedia({
          id: remove.getAttribute('data-media-id') || undefined,
          url: decodeURIComponent(remove.getAttribute('data-media-url') || ''),
        });
        await refresh();
        notifySuccess('Photo deleted.');
      } catch (err) {
        error.hidden = false;
        error.textContent = err.message;
        notifyError(err.message);
      }
      return;
    }
    const button = event.target.closest('[data-media-open]');
    if (!button || !lightbox) return;
    const src = decodeURIComponent(button.getAttribute('data-media-open') || '');
    const img = lightbox.querySelector('img');
    if (img) {
      img.src = src;
      img.alt = button.querySelector('img')?.alt || '';
    }
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
  });

  document.querySelector('#media-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    const form = event.currentTarget;
    const files = [...(form.file.files || [])];
    const button = form.querySelector('[data-media-submit]');
    if (!files.length && !form.url.value.trim()) {
      notifyError('Choose a photo or paste an image address first.');
      return;
    }
    if (button) button.disabled = true;
    let done = 0;
    const failed = [];
    try {
      if (files.length) {
        for (const file of files) {
          if (button) button.textContent = `Uploading ${done + 1} of ${files.length}…`;
          try {
            await api.uploadMedia(file, form.alt.value || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), form.caption.value);
            done += 1;
          } catch (err) {
            failed.push(`${file.name}: ${err.message}`);
          }
        }
      } else {
        await api.addMediaUrl(form.url.value.trim(), form.alt.value, form.caption.value);
        done = 1;
      }
      form.reset();
      active = 'uploads';
      await refresh();
      if (done) notifySuccess(done === 1 ? 'Photo added.' : `${done} photos uploaded.`);
      if (failed.length) {
        error.hidden = false;
        error.textContent = failed.join(' · ');
        notifyError(`${failed.length} photo(s) could not be uploaded.`);
      }
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
      notifyError(err.message);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Add media';
      }
    }
  });

  try {
    await refresh();
  } catch (err) {
    error.hidden = false;
    error.textContent = err.message;
    notifyError(err.message);
  }
}
