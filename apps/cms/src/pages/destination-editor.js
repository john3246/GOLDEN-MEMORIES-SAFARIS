import { emptyDestinationDocument, normalizeDestinationDocument, renderDestinationBlocks } from '@gm-safaris/safari-ui';
import { api } from '../api/client.js';
import { shell } from './shell.js';
import { bindImagePickers, galleryField, imageField } from '../components/image-picker.js';

const BLOCK_LABELS = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  image: 'Image',
  table: 'Table',
};

function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderDestinationEditor(user, id) {
  return shell(
    user,
    'destinations',
    `
    <section class="cms-editor is-edit" data-destination-id="${id}">
      <div class="cms-editor-switch">
        <button class="cms-btn is-active" type="button" data-pane="edit">Content</button>
        <button class="cms-btn" type="button" data-pane="preview">Preview</button>
      </div>
      <aside class="cms-editor-side">
        <div class="cms-editor-toolbar">
          <div>
            <a class="cms-muted" href="#/destinations">← All destinations</a>
            <div id="editor-status" class="cms-muted" style="margin-top:0.25rem">Loading…</div>
          </div>
          <div class="cms-editor-actions">
            <button class="cms-btn cms-btn-gold" type="button" data-save>Save draft</button>
            <button class="cms-btn cms-btn-navy" type="button" data-publish>Publish</button>
            <button class="cms-btn" type="button" data-unpublish>Unpublish</button>
            <button class="cms-btn cms-btn-danger" type="button" data-delete>Delete</button>
          </div>
          <p class="cms-error" id="editor-error" hidden></p>
        </div>
        <div class="cms-editor-fields" id="editor-fields"></div>
      </aside>
      <div class="cms-preview-wrap">
        <header class="cms-preview-toolbar">
          <div>
            <p class="cms-preview-kicker">Live preview</p>
            <p class="cms-preview-hint">Public destination page</p>
          </div>
          <div class="cms-vp-switch" role="group" aria-label="Preview width">
            <button class="is-active" type="button" data-vp="desktop">Desktop</button>
            <button type="button" data-vp="tablet">Tablet</button>
            <button type="button" data-vp="mobile">Phone</button>
          </div>
        </header>
        <div class="cms-preview-stage">
          <div class="cms-preview-browser is-desktop">
            <div class="cms-preview-chrome" aria-hidden="true">
              <span class="cms-preview-dots"><i></i><i></i><i></i></span>
              <div class="cms-preview-address" id="preview-url">gmsafaris.com/destinations/</div>
            </div>
            <div class="cms-preview-frame dest-cms-preview" id="destination-preview"></div>
          </div>
        </div>
      </div>
    </section>
  `
  );
}

function field(label, name, value, type = 'text', hint = '') {
  if (type === 'textarea') {
    return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><textarea id="${name}" name="${name}" rows="4">${escapeValue(value)}</textarea>${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeValue(value)}" />${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
}

function group(title, inner, open = false) {
  return `<details class="cms-accordion"${open ? ' open' : ''}><summary>${title}</summary><div class="cms-accordion-body">${inner}</div></details>`;
}

function blockEditor(blocks) {
  const rows = (blocks || [])
    .map((block, index) => {
      const extra =
        block.type === 'image'
          ? `${imageField('Photo', `block.${index}.url`, block.url)}${field('Caption / alt text', `block.${index}.alt`, block.alt || block.caption)}`
          : block.type === 'table'
            ? `${field('Table caption', `block.${index}.caption`, block.caption)}${field('Column headings', `block.${index}.headersText`, block.headersText, 'text', 'Separate columns with |')}${field('Rows', `block.${index}.rowsText`, block.rowsText, 'textarea', 'One row per line, cells split with |')}`
            : field(block.type === 'heading' ? 'Heading' : 'Paragraph', `block.${index}.text`, block.text, 'textarea');
      return `
      <article class="cms-day" data-block-index="${index}">
        <div class="cms-day-head">
          <strong>${BLOCK_LABELS[block.type] || block.type}</strong>
          <span class="cms-editor-actions">
            <button class="cms-btn" type="button" data-block-up>Up</button>
            <button class="cms-btn" type="button" data-block-down>Down</button>
            <button class="cms-btn cms-btn-danger" type="button" data-block-del>Remove</button>
          </span>
        </div>
        <input type="hidden" name="block.${index}.type" value="${escapeValue(block.type)}" />
        ${extra}
      </article>`;
    })
    .join('');
  return `
    <p class="cms-hint">Add paragraphs, headings, photos, and tables. Publish to show the same content on the website destination page.</p>
    <div class="cms-editor-actions" style="margin-bottom:0.75rem">
      <button class="cms-btn cms-btn-navy" type="button" data-add-block="paragraph">Add paragraph</button>
      <button class="cms-btn" type="button" data-add-block="heading">Add heading</button>
      <button class="cms-btn" type="button" data-add-block="image">Add image</button>
      <button class="cms-btn" type="button" data-add-block="table">Add table</button>
    </div>
    ${rows}`;
}

function renderFields(doc) {
  return `
    ${group(
      'Name and hero',
      `
      ${field('Name', 'title', doc.title)}
      ${field('Slug', 'slug', doc.slug)}
      <div class="cms-grid-2">
        ${field('Region', 'region', doc.region)}
        ${field('Kicker', 'kicker', doc.kicker)}
      </div>
      ${field('Tagline', 'tagline', doc.tagline, 'textarea')}
      ${field('Short blurb', 'blurb', doc.blurb, 'textarea')}
      ${field('Location', 'location', doc.location)}
      ${field('Button label', 'cta', doc.cta)}
      ${imageField('Cover photo', 'image', doc.image)}
      ${galleryField('Gallery photos', 'gallery', doc.gallery || [])}
    `,
      true
    )}
    ${group('Page copy, images and tables', blockEditor(doc.blocks), true)}
    ${group(
      'Facts, seasons and wildlife',
      `
      ${field('Highlights', 'highlights', doc.highlights, 'textarea', 'Title — body, one per line')}
      ${field('Quick facts', 'facts', doc.facts, 'textarea', 'Label | Value, one per line')}
      ${field('Best time to visit', 'seasons', doc.seasons, 'textarea', 'Title — body, one per line')}
      ${field('Wildlife', 'wildlife', doc.wildlife, 'textarea', 'One item per line')}
      ${field('Activities', 'activities', doc.activities, 'textarea', 'Title — body, one per line')}
      ${field('Attractions', 'attractions', doc.attractions, 'textarea', 'One item per line')}
      ${field('FAQs', 'faqs', doc.faqs, 'textarea', 'Question | Answer, one per line')}
    `
    )}
    ${group(
      'SEO',
      `
      ${field('SEO title', 'seo_title', doc.seo_title)}
      ${field('SEO description', 'seo_description', doc.seo_description, 'textarea')}
    `
    )}
  `;
}

function collect(form, current) {
  const blocks = (current.blocks || []).map((block, index) => ({
    id: block.id || `block_${index + 1}`,
    type: form[`block.${index}.type`]?.value || block.type,
    text: form[`block.${index}.text`]?.value || '',
    url: form[`block.${index}.url`]?.value || '',
    alt: form[`block.${index}.alt`]?.value || '',
    caption: form[`block.${index}.caption`]?.value || form[`block.${index}.alt`]?.value || '',
    headers: form[`block.${index}.headersText`]?.value || block.headersText || '',
    rows: form[`block.${index}.rowsText`]?.value || block.rowsText || '',
  }));
  return normalizeDestinationDocument({
    ...current,
    title: form.title?.value,
    slug: form.slug?.value,
    region: form.region?.value,
    kicker: form.kicker?.value,
    tagline: form.tagline?.value,
    blurb: form.blurb?.value,
    location: form.location?.value,
    cta: form.cta?.value,
    image: form.image?.value,
    gallery: form.gallery?.value,
    highlights: form.highlights?.value,
    facts: form.facts?.value,
    seasons: form.seasons?.value,
    wildlife: form.wildlife?.value,
    activities: form.activities?.value,
    attractions: form.attractions?.value,
    faqs: form.faqs?.value,
    seo_title: form.seo_title?.value,
    seo_description: form.seo_description?.value,
    blocks,
  });
}

function paintPreview(doc) {
  const frame = document.querySelector('#destination-preview');
  const url = document.querySelector('#preview-url');
  const body = renderDestinationBlocks(doc.blocks) || (doc.paragraphs || '')
    .split('\n')
    .filter(Boolean)
    .map((item) => `<p class="mt-5">${escapeValue(item)}</p>`)
    .join('');
  if (frame) {
    frame.innerHTML = `
      <article class="dest-cms-preview-page">
        <p class="section-kicker">${escapeValue(doc.kicker || doc.region || 'Destination')}</p>
        <h1 class="section-title">${escapeValue(doc.title || 'Untitled destination')}</h1>
        <p>${escapeValue(doc.tagline || doc.blurb || '')}</p>
        ${doc.image ? `<img src="${escapeValue(doc.image)}" alt="" />` : ''}
        <div class="dest-cms-body">${body || '<p class="cms-muted">Add paragraphs, images, or tables to fill this page.</p>'}</div>
      </article>
    `;
  }
  if (url) url.textContent = `gmsafaris.com/destinations/${doc.slug || 'preview'}/`;
}

export async function initDestinationEditor(id) {
  const status = document.querySelector('#editor-status');
  const fields = document.querySelector('#editor-fields');
  const error = document.querySelector('#editor-error');
  let current = emptyDestinationDocument();
  let record = null;

  function showError(err) {
    error.hidden = false;
    error.textContent = err.message || String(err);
  }

  function redraw() {
    fields.innerHTML = `<form id="destination-form">${renderFields(current)}</form>`;
    paintPreview(current);
    bindForm();
  }

  function bindForm() {
    const form = document.querySelector('#destination-form');
    const refresh = () => {
      current = collect(form, current);
      paintPreview(current);
    };
    form?.addEventListener('input', refresh);
    form?.addEventListener('change', refresh);
    form?.querySelectorAll('[data-add-block]').forEach((btn) => {
      btn.addEventListener('click', () => {
        current = collect(form, current);
        current.blocks = [
          ...(current.blocks || []),
          { id: `block_${Date.now()}`, type: btn.dataset.addBlock, text: '', url: '', alt: '', caption: '', headers: [], rows: [] },
        ];
        current = normalizeDestinationDocument(current);
        redraw();
      });
    });
    form?.querySelectorAll('[data-block-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-block-index]')?.dataset.blockIndex);
        current = collect(form, current);
        current.blocks = current.blocks.filter((_, i) => i !== index);
        redraw();
      });
    });
    form?.querySelectorAll('[data-block-up], [data-block-down]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-block-index]')?.dataset.blockIndex);
        current = collect(form, current);
        const next = [...current.blocks];
        const swap = btn.hasAttribute('data-block-up') ? index - 1 : index + 1;
        if (swap < 0 || swap >= next.length) return;
        [next[index], next[swap]] = [next[swap], next[index]];
        current.blocks = next;
        redraw();
      });
    });
    bindImagePickers(form);
  }

  async function load() {
    record = await api.getContent('destinations', id);
    current = normalizeDestinationDocument({ ...emptyDestinationDocument(), ...record.draft, slug: record.slug });
    status.textContent = `${record.status} · ${record.slug}`;
    redraw();
  }

  document.querySelector('[data-save]')?.addEventListener('click', async () => {
    try {
      current = collect(document.querySelector('#destination-form'), current);
      record = await api.saveContent('destinations', id, current);
      current = normalizeDestinationDocument(record.draft);
      status.textContent = `Draft saved · ${record.status}`;
      error.hidden = true;
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-publish]')?.addEventListener('click', async () => {
    try {
      current = collect(document.querySelector('#destination-form'), current);
      await api.saveContent('destinations', id, current);
      record = await api.publishContent('destinations', id);
      status.textContent = `Published to the website · ${record.slug}`;
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-unpublish]')?.addEventListener('click', async () => {
    try {
      record = await api.unpublishContent('destinations', id);
      status.textContent = `Unpublished · ${record.slug}`;
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await api.deleteContent('destinations', id);
      window.location.hash = '#/destinations';
    } catch (err) {
      showError(err);
    }
  });
  document.querySelectorAll('[data-pane]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const editor = document.querySelector('.cms-editor');
      editor.classList.remove('is-edit', 'is-preview');
      editor.classList.add(`is-${btn.dataset.pane}`);
      document.querySelectorAll('[data-pane]').forEach((item) => item.classList.toggle('is-active', item === btn));
    });
  });
  document.querySelectorAll('[data-vp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const browser = document.querySelector('.cms-preview-browser');
      browser?.classList.remove('is-desktop', 'is-tablet', 'is-mobile');
      browser?.classList.add(`is-${btn.dataset.vp}`);
      document.querySelectorAll('[data-vp]').forEach((item) => item.classList.toggle('is-active', item === btn));
    });
  });

  try {
    await load();
  } catch (err) {
    showError(err);
  }
}
