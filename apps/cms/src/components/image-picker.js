import { api } from '../api/client.js';
import { notifyError, notifySuccess } from './toast.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function encodeKey(url) {
  return encodeURIComponent(String(url || ''));
}

function decodeKey(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch {
    return String(value || '');
  }
}

function bindBrokenImage(img) {
  if (!img || img.dataset.brokenBound) return;
  img.dataset.brokenBound = '1';
  img.addEventListener('error', () => {
    img.classList.add('is-broken');
  });
}

function bindBrokenImages(root) {
  root?.querySelectorAll('img').forEach(bindBrokenImage);
}

export function prettyImageName(url) {
  const filename = String(url || '').split('?')[0].split('/').pop() || '';
  if (!filename) return 'No photo selected';
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function thumbMarkup(url) {
  const src = String(url || '').trim();
  if (!src) return '<span>No photo</span>';
  return `<img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" draggable="false" />`;
}

export function imageField(label, name, url = '') {
  const src = String(url || '').trim();
  return `
    <div class="cms-field cms-image-picker" data-image-picker>
      <span class="cms-label">${escapeHtml(label)}</span>
      <div class="cms-image-picker-row">
        <div class="cms-image-picker-thumb">${thumbMarkup(src)}</div>
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

function galleryChip(url, index) {
  return `
      <figure class="cms-gallery-chip" data-gallery-index="${index}">
        <img src="${escapeHtml(url)}" alt="${escapeHtml(prettyImageName(url))}" loading="lazy" decoding="async" draggable="false" />
        <figcaption>${escapeHtml(prettyImageName(url))}</figcaption>
        <button class="cms-btn cms-btn-danger" type="button" data-gallery-remove>Remove</button>
      </figure>`;
}

export function galleryField(label, name, urls = []) {
  const list = (Array.isArray(urls) ? urls : String(urls || '').split('\n'))
    .map((item) => (typeof item === 'string' ? item : item?.url || ''))
    .map((item) => item.trim())
    .filter(Boolean);
  const thumbs = list.map((url, index) => galleryChip(url, index)).join('');
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
let pickerState = null;
let pickerSeq = 0;

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
  modal.setAttribute('aria-hidden', 'true');
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
        <p class="cms-muted cms-picker-count" data-picker-count></p>
        <button class="cms-btn cms-btn-gold" type="button" data-picker-upload>Upload from this device</button>
        <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" multiple data-picker-file />
      </div>
      <div class="cms-picker-tabs" data-picker-tabs></div>
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
  bindModal(modal);
  return modal;
}

function closePicker() {
  if (!modal) return;
  pickerState = null;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  modal.inert = true;
  document.body.classList.remove('cms-picker-open');
}

function paintGrid(items, selected) {
  const grid = modal.querySelector('[data-picker-grid]');
  if (!items.length) {
    grid.innerHTML = '<p class="cms-muted">No photos in this group. Upload one from your device or try another folder.</p>';
    return;
  }
  grid.innerHTML = items
    .map((item) => {
      const url = item.url || '';
      const active = selected.has(url) ? ' is-selected' : '';
      const label = item.label || prettyImageName(item.filename);
      const meta = (item.usedOn || []).filter(Boolean)[0] || item.folder || item.source || '';
      return `
        <button class="cms-picker-card${active}" type="button" data-picker-key="${encodeKey(url)}" aria-pressed="${selected.has(url) ? 'true' : 'false'}" title="${escapeHtml(label)}">
          <span class="cms-picker-thumb">
            ${thumbMarkup(url)}
            <span class="cms-picker-check" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="14" height="14" focusable="false"><path fill="currentColor" d="M7.7 14.3 3.4 10l1.4-1.4 2.9 2.9 6.5-6.5L15.6 6.4z"/></svg>
            </span>
            <span class="cms-picker-caption">
              <span class="cms-picker-caption-title">${escapeHtml(label)}</span>
              ${meta ? `<span class="cms-picker-caption-meta">${escapeHtml(meta)}</span>` : ''}
            </span>
          </span>
        </button>`;
    })
    .join('');
  bindBrokenImages(grid);
}

async function paintPicker(state) {
  if (!state || state.id !== pickerState?.id) return;
  const library = await loadLibrary();
  if (state.id !== pickerState?.id) return;
  const root = modal;
  const tabs = root.querySelector('[data-picker-tabs]');
  const count = root.querySelector('[data-picker-count]');
    tabs.innerHTML = (library.groups || [])
      .map(
        (item) =>
          `<button class="cms-picker-chip${item.id === state.active ? ' is-active' : ''}" type="button" data-picker-group="${escapeHtml(item.id)}">${escapeHtml(item.label)} <em>${item.count}</em></button>`
      )
      .join('');
  tabs.querySelector('.cms-picker-chip.is-active')?.scrollIntoView({
    block: 'nearest',
    inline: 'center',
    behavior: 'smooth',
  });
  const group = library.groups.find((item) => item.id === state.active) || library.groups[0];
  const needle = state.query.trim().toLowerCase();
  const items = (group?.items || []).filter((item) => {
    if (!needle) return true;
    return [item.label, item.filename, item.alt, item.folder, ...(item.usedOn || [])]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });
  count.textContent = `${items.length} photos`;
  paintGrid(items, state.chosen);
  refreshSelection(state);
}

function refreshSelection(state) {
  if (!modal || !state) return;
  const selectedHint = modal.querySelector('[data-picker-selected]');
  const useBtn = modal.querySelector('[data-picker-use]');
  selectedHint.textContent = state.multiple
    ? `${state.chosen.size} photo${state.chosen.size === 1 ? '' : 's'} selected`
    : 'Click a photo to use it.';
  useBtn.disabled = state.multiple && !state.chosen.size;
  modal.querySelectorAll('[data-picker-key]').forEach((card) => {
    const on = state.chosen.has(decodeKey(card.getAttribute('data-picker-key')));
    card.classList.toggle('is-selected', on);
    card.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function applyPick(value) {
  const onPick = pickerState?.onPick;
  closePicker();
  onPick?.(value);
}

async function uploadPickerFiles(files) {
  const state = pickerState;
  if (!state) return;
  const list = [...files];
  if (!list.length) return;
  for (const file of list) {
    const uploaded = await api.uploadMedia(file, prettyImageName(file.name), '');
    if (uploaded?.url) state.chosen.add(uploaded.url);
  }
  await loadLibrary(true);
  notifySuccess('Photo uploaded.');
  if (!state.multiple && state.chosen.size) {
    applyPick([...state.chosen].at(-1));
    return;
  }
  state.active = 'uploads';
  await paintPicker(state);
}

function bindModal(root) {
  root.addEventListener('click', async (event) => {
    const state = pickerState;
    if (!state || root.hidden) return;
    if (event.target === root || event.target.closest('[data-picker-close]')) {
      closePicker();
      return;
    }
    const tab = event.target.closest('[data-picker-group]');
    if (tab) {
      state.active = tab.getAttribute('data-picker-group');
      await paintPicker(state);
      return;
    }
    const card = event.target.closest('[data-picker-key]');
    if (card) {
      const url = decodeKey(card.getAttribute('data-picker-key'));
      if (!url) return;
      if (state.multiple) {
        if (state.chosen.has(url)) state.chosen.delete(url);
        else state.chosen.add(url);
        refreshSelection(state);
        return;
      }
      applyPick(url);
      return;
    }
    if (event.target.closest('[data-picker-use]')) {
      if (!state.chosen.size) return;
      applyPick([...state.chosen]);
      return;
    }
    if (event.target.closest('[data-picker-upload]')) {
      root.querySelector('[data-picker-file]')?.click();
      return;
    }
    if (event.target.closest('[data-picker-url-use]')) {
      const pasted = root.querySelector('[data-picker-url-input]')?.value.trim();
      if (!pasted) return;
      applyPick(state.multiple ? [...state.chosen, pasted] : pasted);
    }
  });

  root.querySelector('.cms-picker-search').addEventListener('input', (event) => {
    if (!pickerState) return;
    pickerState.query = event.target.value;
    paintPicker(pickerState);
  });

  root.querySelector('[data-picker-file]').addEventListener('change', async (event) => {
    try {
      await uploadPickerFiles(event.target.files || []);
    } catch (err) {
      root.querySelector('[data-picker-grid]').innerHTML = `<p class="cms-error">${escapeHtml(err.message)}</p>`;
      notifyError(err.message || 'Could not upload that photo.');
    }
    event.target.value = '';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && pickerState && !modal?.hidden) {
      event.preventDefault();
      closePicker();
    }
  });
}

export function openImagePicker({ multiple = false, selected = [], onPick } = {}) {
  const root = ensureModal();
  const state = {
    id: ++pickerSeq,
    multiple,
    chosen: new Set((selected || []).filter(Boolean)),
    active: 'all',
    query: '',
    onPick,
  };
  pickerState = state;
  root.querySelector('#cms-picker-title').textContent = multiple ? 'Add photos' : 'Choose a photo';
  root.querySelector('[data-picker-use]').hidden = !multiple;
  root.querySelector('.cms-picker-search').value = '';
  root.querySelector('[data-picker-url-input]').value = '';
  root.hidden = false;
  root.removeAttribute('aria-hidden');
  root.inert = false;
  document.body.classList.add('cms-picker-open');
  loadLibrary(true)
    .then(() => paintPicker(state))
    .catch((err) => {
      if (pickerState?.id !== state.id) return;
      root.querySelector('[data-picker-grid]').innerHTML = `<p class="cms-error">${escapeHtml(err.message)}</p>`;
    });
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
  thumb.innerHTML = thumbMarkup(url);
  bindBrokenImages(thumb);
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
  }
  if (!url && clear) clear.remove();
  emitChange(input);
}

function setGalleryValue(picker, urls) {
  const input = picker.querySelector('textarea[name], textarea');
  const unique = [...new Set((urls || []).map((item) => String(item || '').trim()).filter(Boolean))];
  input.value = unique.join('\n');
  const chips = picker.querySelector('.cms-gallery-chips');
  chips.innerHTML = unique.length
    ? unique.map((url, index) => galleryChip(url, index)).join('')
    : '<p class="cms-muted">No gallery photos yet.</p>';
  bindBrokenImages(chips);
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
    if (picker.dataset.pickerBound) return;
    picker.dataset.pickerBound = '1';
    bindBrokenImages(picker);
    picker.addEventListener('click', (event) => {
      if (event.target.closest('[data-pick]')) {
        const current = picker.querySelector('input[type="hidden"]')?.value || '';
        openImagePicker({
          selected: current ? [current] : [],
          onPick: (url) => setPickerValue(picker, Array.isArray(url) ? url[0] : url),
        });
        return;
      }
      if (event.target.closest('[data-upload]')) {
        picker.querySelector('[data-file]')?.click();
        return;
      }
      if (event.target.closest('[data-clear]')) {
        setPickerValue(picker, '');
        return;
      }
      if (event.target.closest('[data-url-apply]')) {
        const pasted = picker.querySelector('[data-url-input]')?.value.trim();
        if (pasted) setPickerValue(picker, pasted);
      }
    });
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
  });

  root?.querySelectorAll('[data-gallery-picker]').forEach((picker) => {
    if (picker.dataset.pickerBound) return;
    picker.dataset.pickerBound = '1';
    bindBrokenImages(picker);
    picker.addEventListener('click', (event) => {
      if (event.target.closest('[data-gallery-add]')) {
        openImagePicker({
          multiple: true,
          selected: galleryUrls(picker),
          onPick: (urls) => setGalleryValue(picker, Array.isArray(urls) ? urls : [urls]),
        });
        return;
      }
      if (event.target.closest('[data-gallery-upload]')) {
        picker.querySelector('[data-gallery-file]')?.click();
        return;
      }
      const remove = event.target.closest('[data-gallery-remove]');
      if (remove) {
        const index = Number(remove.closest('[data-gallery-index]')?.dataset.galleryIndex);
        const next = galleryUrls(picker).filter((_, i) => i !== index);
        setGalleryValue(picker, next);
      }
    });
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
  });
}
