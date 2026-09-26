import { api } from '../api/client.js';
import { shell } from './shell.js';
import { bindImagePickers, galleryField, imageField } from '../components/image-picker.js';
import { notifyError, notifySuccess } from '../components/toast.js';

function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fieldMarkup(field, value) {
  if (field.type === 'select') {
    const options = field.options || [];
    return `<div class="cms-field"><label class="cms-label" for="${field.name}">${field.label}</label><select id="${field.name}" name="${field.name}">${options
      .map((option) => {
        const item = typeof option === 'string' ? { value: option, label: option } : option;
        return `<option value="${escapeValue(item.value)}"${item.value === value ? ' selected' : ''}>${escapeValue(item.label)}</option>`;
      })
      .join('')}</select>${field.hint ? `<p class="cms-hint">${field.hint}</p>` : ''}</div>`;
  }
  if (field.type === 'image') {
    return imageField(field.label, field.name, value);
  }
  if (field.type === 'gallery') {
    const urls = Array.isArray(value)
      ? value.map((item) => (typeof item === 'string' ? item : item?.url || '')).filter(Boolean)
      : String(value || '').split('\n');
    return galleryField(field.label, field.name, urls);
  }
  if (field.type === 'textarea') {
    return `<div class="cms-field"><label class="cms-label" for="${field.name}">${field.label}</label><textarea id="${field.name}" name="${field.name}" rows="6">${escapeValue(value)}</textarea>${field.hint ? `<p class="cms-hint">${field.hint}</p>` : ''}</div>`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${field.name}">${field.label}</label><input id="${field.name}" name="${field.name}" type="${field.type || 'text'}" value="${escapeValue(value)}" />${field.hint ? `<p class="cms-hint">${field.hint}</p>` : ''}</div>`;
}

export function renderContentEditor(user, spec, id) {
  return shell(
    user,
    spec.key,
    `
    <section class="cms-page cms-doc-editor" data-content-type="${spec.key}" data-content-id="${id}">
      <div class="cms-page-head">
        <div>
          <a class="cms-muted" href="#/${spec.key}">← ${spec.label}</a>
          <h1>${spec.singular}</h1>
          <p class="cms-lead" id="editor-status">Loading…</p>
        </div>
        <div class="cms-dashboard-actions">
          <a class="cms-btn" href="#/${spec.key}/${id}/preview">Preview</a>
          <button class="cms-btn cms-btn-gold" type="button" data-save>Save draft</button>
          <button class="cms-btn cms-btn-navy" type="button" data-publish>Publish</button>
          <button class="cms-btn" type="button" data-unpublish>Unpublish</button>
          <button class="cms-btn cms-btn-danger" type="button" data-delete>Delete</button>
        </div>
      </div>
      <p class="cms-error" id="editor-error" hidden></p>
      <form id="content-form" class="cms-panel cms-form-stack"></form>
    </section>
  `
  );
}

export async function initContentEditor(type, id, spec) {
  const form = document.querySelector('#content-form');
  const status = document.querySelector('#editor-status');
  const error = document.querySelector('#editor-error');
  let current = null;

  function showError(message) {
    error.hidden = false;
    error.textContent = message;
    notifyError(message);
  }

  function readForm() {
    const data = {};
    for (const field of spec.fields) {
      const value = form.elements[field.name]?.value || '';
      if (field.type === 'gallery') {
        data[field.name] = value
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);
      } else {
        data[field.name] = value;
      }
    }
    return data;
  }

  function renderFields(draft) {
    form.innerHTML = spec.fields.map((field) => fieldMarkup(field, draft?.[field.name] || '')).join('');
    bindImagePickers(form);
  }

  async function load() {
    current = await api.getContent(type, id);
    status.textContent = `${current.status} · ${current.slug}`;
    renderFields(current.draft || {});
  }

  document.querySelector('[data-save]')?.addEventListener('click', async () => {
    error.hidden = true;
    try {
      current = await api.saveContent(type, id, readForm());
      const live = current.status === 'PUBLISHED';
      status.textContent = live
        ? 'Draft saved · click Publish to update the live website'
        : `Saved draft · ${current.status}`;
      notifySuccess(live ? 'Draft saved. Click Publish to put the changes live.' : 'Draft saved.');
    } catch (err) {
      showError(err.message);
    }
  });
  document.querySelector('[data-publish]')?.addEventListener('click', async () => {
    error.hidden = true;
    try {
      await api.saveContent(type, id, readForm());
      current = await api.publishContent(type, id);
      status.textContent = 'Published to the public website';
      notifySuccess('Published to the website.');
    } catch (err) {
      showError(err.message);
    }
  });
  document.querySelector('[data-unpublish]')?.addEventListener('click', async () => {
    try {
      current = await api.unpublishContent(type, id);
      status.textContent = 'Unpublished';
      notifySuccess('Unpublished.');
    } catch (err) {
      showError(err.message);
    }
  });
  document.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.deleteContent(type, id);
      notifySuccess('Deleted.');
      window.location.hash = `#/${type}`;
    } catch (err) {
      showError(err.message);
    }
  });

  try {
    await load();
  } catch (err) {
    showError(err.message);
  }
}
