import { api } from '../api/client.js';
import { notifyError, notifySuccess } from './toast.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function prettyImageName(url) {
  const filename = String(url || '').split('?')[0].split('/').pop() || '';
  if (!filename) return 'No photo selected';
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function imageField(label, name, url = '') {
  const src = String(url || '').trim();
  return `
    <div class="cms-field cms-image-picker" data-image-picker>
      <span class="cms-label">${escapeHtml(label)}</span>
      <div class="cms-image-picker-row">
        <div class="cms-image-picker-thumb">${src ? `<img src="${escapeHtml(src)}" alt="" />` : '<span>No photo</span>'}</div>
        <div>
          <strong class="cms-image-picker-name">${escapeHtml(prettyImageName(src))}</strong>
          <p class="cms-hint">Choose a photo from the project gallery or upload one from this computer. You do not need to type a file name.</p>
          <div class="cms-editor-actions">
            <button class="cms-btn cms-btn-navy" type="button" data-pick>Choose photo</button>
            <button class="cms-btn" type="button" data-upload>Upload from device</button>
            ${src ? '<button class="cms-btn" type="button" data-clear>Remove</button>' : ''}
          </div>
          <details class="cms-image-picker-link">
            <summary>Paste a photo link instead</summary>
            <div class="cms-picker-url-row">
              <input type="text" data-url-input placeholder="/images/… or https://…" value="${escapeHtml(src)}" />
              <button class="cms-btn" type="button" data-url-apply>Use link</button>
            </div>
          </details>
        </div>
      </div>
      <input type="hidden" id="${escapeHtml(name)}" name="${escapeHtml(name)}" value="${escapeHtml(src)}" />
      <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" data-file />
    </div>`;
}

export function galleryField(label, name, urls = []) {
  const list = (Array.isArray(urls) ? urls : String(urls || '').split('\n'))
    .map((item) => (typeof item === 'string' ? item : item?.url || ''))
    .map((item) => item.trim())
    .filter(Boolean);
  const thumbs = list
    .map(
      (url, index) => `
      <figure class="cms-gallery-chip" data-gallery-index="${index}">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(prettyImageName(url))}" />
        <figcaption>${escapeHtml(prettyImageName(url))}</figcaption>
        <button class="cms-btn cms-btn-danger" type="button" data-gallery-remove>Remove</button>
      </figure>`
    )
    .join('');
  return `
    <div class="cms-field cms-gallery-picker" data-gallery-picker>
      <span class="cms-label">${escapeHtml(label)}</span>
      <p class="cms-hint">Add as many photos as you like. Pick from the gallery or upload from this device.</p>
      <div class="cms-gallery-chips">${thumbs || '<p class="cms-muted">No gallery photos yet.</p>'}</div>
      <div class="cms-editor-actions">
        <button class="cms-btn cms-btn-navy" type="button" data-gallery-add>Add photos</button>
        <button class="cms-btn" type="button" data-gallery-upload>Upload from device</button>
      </div>
      <textarea hidden id="${escapeHtml(name)}" name="${escapeHtml(name)}" rows="2">${escapeHtml(list.join('\n'))}</textarea>
      <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" multiple data-gallery-file />
    </div>`;
}

let libraryCache = null;
let modal = null;

async function loadLibrary(force = false) {
  if (libraryCache && !force) return libraryCache;
  libraryCache = await api.mediaLibrary();
  return libraryCache;
}

function ensureModal() {
  if (modal) return modal;
  modal = document.createElement('div');
  modal.className = 'cms-picker-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="cms-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="cms-picker-title">
      <header class="cms-picker-head">
        <div>
          <p class="cms-kicker">Photos</p>
          <h2 id="cms-picker-title">Choose a photo</h2>
        </div>
        <button class="cms-btn" type="button" data-picker-close>Close</button>
      </header>
      <div class="cms-picker-toolbar">
        <input class="cms-picker-search" type="search" placeholder="Search by name, park, or folder…" />
        <button class="cms-btn cms-btn-gold" type="button" data-picker-upload>Upload from this device</button>
        <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" multiple data-picker-file />
      </div>
      <div class="cms-picker-tabs" data-picker-tabs></div>
      <p class="cms-muted" data-picker-count></p>
      <div class="cms-picker-grid" data-picker-grid></div>
      <footer class="cms-picker-foot">
        <div class="cms-picker-url-row">
          <input type="text" placeholder="Or paste a photo link…" data-picker-url-input />
          <button class="cms-btn" type="button" data-picker-url-use>Use link</button>
        </div>
        <p class="cms-muted" data-picker-selected>Select a photo to use it.</p>
        <button class="cms-btn cms-btn-navy" type="button" data-picker-use hidden>Use selected</button>
      </footer>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

function paintGrid(items, selected) {
  const grid = modal.querySelector('[data-picker-grid]');
  if (!items.length) {
    grid.innerHTML = '<p class="cms-muted">No photos in this group. Upload one from your device or try another folder.</p>';
    return;
  }
  grid.innerHTML = items
    .map((item) => {
      const active = selected.has(item.url) ? ' is-selected' : '';
      return `
        <button class="cms-picker-card${active}" type="button" data-picker-url="${escapeHtml(item.url)}" title="${escapeHtml(item.label || item.filename)}">
          <img src="${escapeHtml(item.url)}" alt="" />
          <span>${escapeHtml(item.label || prettyImageName(item.filename))}</span>
        </button>`;
    })
    .join('');
}

export function openImagePicker({ multiple = false, selected = [], onPick } = {}) {
  const root = ensureModal();
  const chosen = new Set(selected.filter(Boolean));
  let active = 'all';
  let query = '';
  const title = root.querySelector('#cms-picker-title');
  const useBtn = root.querySelector('[data-picker-use]');
  const selectedHint = root.querySelector('[data-picker-selected]');
  title.textContent = multiple ? 'Add photos' : 'Choose a photo';
  useBtn.hidden = !multiple;

  function currentItems(library) {
    const group = library.groups.find((item) => item.id === active) || library.groups[0];
    const needle = query.trim().toLowerCase();
    return (group?.items || []).filter((item) => {
      if (!needle) return true;
      return [item.label, item.filename, item.alt, item.folder, ...(item.usedOn || [])]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }

  function refreshSelection() {
    selectedHint.textContent = multiple
      ? `${chosen.size} photo${chosen.size === 1 ? '' : 's'} selected`
      : 'Click a photo to use it.';
    useBtn.disabled = multiple && !chosen.size;
    root.querySelectorAll('[data-picker-url]').forEach((card) => {
      card.classList.toggle('is-selected', chosen.has(card.getAttribute('data-picker-url')));
    });
  }

  async function paint() {
    const library = await loadLibrary();
    const tabs = root.querySelector('[data-picker-tabs]');
    const count = root.querySelector('[data-picker-count]');
    tabs.innerHTML = library.groups
      .map(
        (item) =>
          `<button class="cms-media-tab${item.id === active ? ' is-active' : ''}" type="button" data-picker-group="${item.id}">${escapeHtml(item.label)} <em>${item.count}</em></button>`
      )
      .join('');
    const items = currentItems(library);
    count.textContent = `${items.length} photos`;
    paintGrid(items, chosen);
    refreshSelection();
  }

  function close() {
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    root.inert = true;
  }

  async function uploadFiles(files) {
    const list = [...files];
    if (!list.length) return;
    for (const file of list) {
      const uploaded = await api.uploadMedia(file, prettyImageName(file.name), '');
      if (uploaded?.url) chosen.add(uploaded.url);
    }
    await loadLibrary(true);
    notifySuccess('Photo uploaded.');
    if (!multiple && chosen.size) {
      const url = [...chosen].at(-1);
      close();
      onPick?.(url);
      return;
    }
    active = 'uploads';
    await paint();
  }

  root.hidden = false;
  root.removeAttribute('aria-hidden');
  root.inert = false;
  paint().catch((err) => {
    root.querySelector('[data-picker-grid]').innerHTML = `<p class="cms-error">${escapeHtml(err.message)}</p>`;
  });

  root.onclick = async (event) => {
    if (event.target === root || event.target.closest('[data-picker-close]')) {
      close();
      return;
    }
    const tab = event.target.closest('[data-picker-group]');
    if (tab) {
      active = tab.getAttribute('data-picker-group');
      await paint();
      return;
    }
    const card = event.target.closest('[data-picker-url]');
    if (card) {
      const url = card.getAttribute('data-picker-url');
      if (multiple) {
        if (chosen.has(url)) chosen.delete(url);
        else chosen.add(url);
        refreshSelection();
        card.classList.toggle('is-selected', chosen.has(url));
        return;
      }
      close();
      onPick?.(url);
      return;
    }
    if (event.target.closest('[data-picker-use]')) {
      close();
      onPick?.([...chosen]);
      return;
    }
    if (event.target.closest('[data-picker-upload]')) {
      root.querySelector('[data-picker-file]')?.click();
      return;
    }
    if (event.target.closest('[data-picker-url-use]')) {
      const pasted = root.querySelector('[data-picker-url-input]')?.value.trim();
      if (!pasted) return;
      close();
      onPick?.(multiple ? [...chosen, pasted] : pasted);
    }
  };

  root.querySelector('.cms-picker-search').oninput = (event) => {
    query = event.target.value;
    paint();
  };
  root.querySelector('[data-picker-file]').onchange = async (event) => {
    try {
      await uploadFiles(event.target.files || []);
    } catch (err) {
      root.querySelector('[data-picker-grid]').innerHTML = `<p class="cms-error">${escapeHtml(err.message)}</p>`;
      notifyError(err.message || 'Could not upload that photo.');
    }
    event.target.value = '';
  };
}

function emitChange(input) {
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function setPickerValue(picker, url) {
  const input = picker.querySelector('input[type="hidden"]');
  const thumb = picker.querySelector('.cms-image-picker-thumb');
  const name = picker.querySelector('.cms-image-picker-name');
  const link = picker.querySelector('[data-url-input]');
  input.value = url || '';
  if (link) link.value = url || '';
  thumb.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="" />` : '<span>No photo</span>';
  if (name) name.textContent = prettyImageName(url);
  const actions = picker.querySelector('.cms-editor-actions');
  let clear = picker.querySelector('[data-clear]');
  if (url && !clear && actions) {
    clear = document.createElement('button');
    clear.className = 'cms-btn';
    clear.type = 'button';
    clear.dataset.clear = '';
    clear.textContent = 'Remove';
    actions.appendChild(clear);
    clear.addEventListener('click', () => setPickerValue(picker, ''));
  }
  if (!url && clear) clear.remove();
  emitChange(input);
}

function setGalleryValue(picker, urls) {
  const input = picker.querySelector('textarea[name], textarea');
  input.value = urls.join('\n');
  const chips = picker.querySelector('.cms-gallery-chips');
  chips.innerHTML = urls.length
    ? urls
        .map(
          (url, index) => `
      <figure class="cms-gallery-chip" data-gallery-index="${index}">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(prettyImageName(url))}" />
        <figcaption>${escapeHtml(prettyImageName(url))}</figcaption>
        <button class="cms-btn cms-btn-danger" type="button" data-gallery-remove>Remove</button>
      </figure>`
        )
        .join('')
    : '<p class="cms-muted">No gallery photos yet.</p>';
  emitChange(input);
}

function galleryUrls(picker) {
  return String(picker.querySelector('textarea')?.value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function bindImagePickers(root) {
  root?.querySelectorAll('[data-image-picker]').forEach((picker) => {
    picker.querySelector('[data-pick]')?.addEventListener('click', () => {
      const current = picker.querySelector('input[type="hidden"]')?.value || '';
      openImagePicker({
        selected: current ? [current] : [],
        onPick: (url) => setPickerValue(picker, Array.isArray(url) ? url[0] : url),
      });
    });
    picker.querySelector('[data-upload]')?.addEventListener('click', () => picker.querySelector('[data-file]')?.click());
    picker.querySelector('[data-file]')?.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const uploaded = await api.uploadMedia(file, prettyImageName(file.name), '');
        if (uploaded?.url) {
          await loadLibrary(true);
          setPickerValue(picker, uploaded.url);
          notifySuccess('Photo uploaded.');
        }
      } catch (err) {
        notifyError(err.message || 'Could not upload that photo.');
      }
      event.target.value = '';
    });
    picker.querySelector('[data-clear]')?.addEventListener('click', () => setPickerValue(picker, ''));
    picker.querySelector('[data-url-apply]')?.addEventListener('click', () => {
      const pasted = picker.querySelector('[data-url-input]')?.value.trim();
      if (pasted) setPickerValue(picker, pasted);
    });
  });

  root?.querySelectorAll('[data-gallery-picker]').forEach((picker) => {
    picker.querySelector('[data-gallery-add]')?.addEventListener('click', () => {
      openImagePicker({
        multiple: true,
        selected: galleryUrls(picker),
        onPick: (urls) => setGalleryValue(picker, Array.isArray(urls) ? urls : [urls]),
      });
    });
    picker.querySelector('[data-gallery-upload]')?.addEventListener('click', () => picker.querySelector('[data-gallery-file]')?.click());
    picker.querySelector('[data-gallery-file]')?.addEventListener('change', async (event) => {
      const files = [...(event.target.files || [])];
      if (!files.length) return;
      try {
        const next = galleryUrls(picker);
        for (const file of files) {
          const uploaded = await api.uploadMedia(file, prettyImageName(file.name), '');
          if (uploaded?.url) next.push(uploaded.url);
        }
        await loadLibrary(true);
        setGalleryValue(picker, next);
        notifySuccess('Photos uploaded.');
      } catch (err) {
        notifyError(err.message || 'Could not upload those photos.');
      }
      event.target.value = '';
    });
    picker.addEventListener('click', (event) => {
      const remove = event.target.closest('[data-gallery-remove]');
      if (!remove) return;
      const index = Number(remove.closest('[data-gallery-index]')?.dataset.galleryIndex);
      const next = galleryUrls(picker).filter((_, i) => i !== index);
      setGalleryValue(picker, next);
    });
  });
}
