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
          <p class="cms-lead">Upload an image or attach an existing HTTPS URL. Files stay on disk, not in the database.</p>
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
      <div id="media-grid" class="cms-media-grid" style="margin-top:1rem"></div>
    </section>
  `
  );
}

export async function initMedia() {
  const grid = document.querySelector('#media-grid');
  const error = document.querySelector('#media-error');

  async function refresh() {
    const items = await api.listMedia();
    grid.innerHTML = items.length
      ? items
          .map(
            (item) => `
        <figure class="cms-media-card">
          <img src="${item.url}" alt="${item.alt || ''}" style="width:100%;height:10rem;object-fit:cover;border-radius:0.25rem" />
          <figcaption class="cms-muted" style="margin-top:0.6rem;overflow-wrap:anywhere">${item.alt || item.filename || item.url}</figcaption>
        </figure>`
          )
          .join('')
      : '<p class="cms-muted">No media yet.</p>';
  }

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
