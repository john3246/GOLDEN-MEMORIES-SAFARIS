import { BLOG_SECTION_TYPES } from '@gm-safaris/shared-types';
import { emptyBlogDocument, normalizeBlogDocument, renderBlogPage } from '@gm-safaris/safari-ui';
import { api } from '../api/client.js';
import { shell } from './shell.js';
import { bindImagePickers, galleryField, imageField } from '../components/image-picker.js';

const SECTION_LABELS = {
  hero: 'Hero',
  intro: 'Intro',
  body: 'Article body',
  gallery: 'Gallery',
  related: 'Related articles',
  booking_cta: 'Booking CTA',
};

const BLOCK_LABELS = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  image: 'Image',
  quote: 'Quote',
};

function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderBlogEditor(user, id) {
  return shell(
    user,
    'posts',
    `
    <section class="cms-editor is-edit" data-blog-id="${id}">
      <div class="cms-editor-switch">
        <button class="cms-btn is-active" type="button" data-pane="edit">Content</button>
        <button class="cms-btn" type="button" data-pane="preview">Preview</button>
      </div>
      <aside class="cms-editor-side">
        <div class="cms-editor-toolbar">
          <div>
            <a class="cms-muted" href="#/posts">← All blog articles</a>
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
            <p class="cms-preview-hint">Public blog article</p>
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
              <div class="cms-preview-address" id="preview-url">gmsafaris.com/blog/</div>
            </div>
            <div class="cms-preview-frame" id="blog-preview"></div>
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
  if (type === 'select') {
    const options = hint.split(',').map((item) => item.trim());
    return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><select id="${name}" name="${name}">${options
      .map((item) => `<option value="${escapeValue(item)}" ${item === value ? 'selected' : ''}>${escapeValue(item)}</option>`)
      .join('')}</select></div>`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeValue(value)}" /></div>`;
}

function group(title, inner, open = false) {
  return `<details class="cms-accordion"${open ? ' open' : ''}><summary>${title}</summary><div class="cms-accordion-body">${inner}</div></details>`;
}

function blockEditor(blocks) {
  const rows = (blocks || [])
    .map(
      (block, index) => `
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
        ${
          block.type === 'image'
            ? `${imageField('Photo', `block.${index}.url`, block.url)}${field('Alt text', `block.${index}.alt`, block.alt)}`
            : field(block.type === 'heading' ? 'Heading' : 'Text', `block.${index}.text`, block.text, 'textarea')
        }
      </article>`
    )
    .join('');
  return `
    <div class="cms-editor-actions" style="margin-bottom:0.75rem">
      <button class="cms-btn cms-btn-navy" type="button" data-add-block="paragraph">Add paragraph</button>
      <button class="cms-btn" type="button" data-add-block="heading">Add heading</button>
      <button class="cms-btn" type="button" data-add-block="image">Add image</button>
      <button class="cms-btn" type="button" data-add-block="quote">Add quote</button>
    </div>
    ${rows}`;
}

function renderFields(doc) {
  return `
    ${group(
      'Title and layout',
      `
      ${field('Title', 'title', doc.title)}
      ${field('Slug', 'slug', doc.slug, 'text')}
      ${field('Topic', 'topic', doc.topic, 'select', 'climbing,safari,about-us,about-tanzania,islands,wildlife')}
      ${field('Kicker', 'kicker', doc.kicker)}
      <div class="cms-grid-2">
        ${field('Date', 'date', doc.date)}
        ${field('Author', 'author', doc.author)}
      </div>
      ${field('Excerpt', 'excerpt', doc.excerpt, 'textarea')}
    `,
      true
    )}
    ${group(
      'Hero and gallery',
      `
      ${imageField('Hero photo', 'hero_url', doc.hero_image?.url || doc.image)}
      ${field('Hero alt text', 'hero_alt', doc.hero_image?.alt)}
      ${galleryField(
        'Gallery photos',
        'gallery',
        (doc.gallery || []).map((item) => (typeof item === 'string' ? item : item?.url || '')).filter(Boolean)
      )}
    `,
      true
    )}
    ${group('Article body', blockEditor(doc.blocks), true)}
    ${group(
      'CTA and SEO',
      `
      ${field('Button label', 'cta_label', doc.cta_label)}
      ${field('Button link', 'cta_href', doc.cta_href)}
      ${field('SEO title', 'seo_title', doc.seo?.title || doc.seo_title)}
      ${field('SEO description', 'seo_description', doc.seo?.description || doc.seo_description, 'textarea')}
    `
    )}
    ${group(
      'Page sections',
      (doc.sections || []).map(
        (item, index) => `
        <div class="cms-section-row" data-section-index="${index}">
          <label class="cms-check"><input type="checkbox" data-section-enabled ${item.enabled !== false ? 'checked' : ''} /> ${SECTION_LABELS[item.type] || item.type}</label>
          <span class="cms-editor-actions">
            <button class="cms-btn" type="button" data-sec-up>Up</button>
            <button class="cms-btn" type="button" data-sec-down>Down</button>
          </span>
        </div>`
      ).join('')
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
  }));
  const sectionRows = [...document.querySelectorAll('[data-section-index]')];
  const sections = sectionRows.map((row, order) => ({
    type: (current.sections || [])[Number(row.dataset.sectionIndex)]?.type || BLOG_SECTION_TYPES[order],
    enabled: row.querySelector('[data-section-enabled]')?.checked !== false,
    order,
  }));
  return normalizeBlogDocument({
    ...current,
    title: form.title?.value,
    slug: form.slug?.value,
    topic: form.topic?.value,
    kicker: form.kicker?.value,
    date: form.date?.value,
    author: form.author?.value,
    excerpt: form.excerpt?.value,
    hero_image: { url: form.hero_url?.value, alt: form.hero_alt?.value },
    image: form.hero_url?.value,
    gallery: String(form.gallery?.value || '')
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, alt: form.hero_alt?.value || current.title || '' })),
    cta_label: form.cta_label?.value,
    cta_href: form.cta_href?.value,
    seo_title: form.seo_title?.value,
    seo_description: form.seo_description?.value,
    blocks,
    sections: sections.length ? sections : current.sections,
  });
}

function paintPreview(doc) {
  const frame = document.querySelector('#blog-preview');
  const url = document.querySelector('#preview-url');
  if (frame) frame.innerHTML = renderBlogPage(doc, { editable: true });
  if (url) url.textContent = `gmsafaris.com/blog/${doc.slug || 'preview'}/`;
}

export async function initBlogEditor(id) {
  const status = document.querySelector('#editor-status');
  const fields = document.querySelector('#editor-fields');
  const error = document.querySelector('#editor-error');
  let current = emptyBlogDocument();
  let record = null;

  function showError(err) {
    error.hidden = false;
    error.textContent = err.message || String(err);
  }

  function redraw() {
    fields.innerHTML = `<form id="blog-form">${renderFields(current)}</form>`;
    paintPreview(current);
    bindForm();
  }

  function bindForm() {
    const form = document.querySelector('#blog-form');
    const refresh = () => {
      current = collect(form, current);
      paintPreview(current);
    };
    form?.addEventListener('input', refresh);
    form?.addEventListener('change', refresh);

    form?.querySelectorAll('[data-add-block]').forEach((btn) => {
      btn.addEventListener('click', () => {
        current = collect(form, current);
        current.blocks = [...(current.blocks || []), { id: `block_${Date.now()}`, type: btn.dataset.addBlock, text: '', url: '', alt: '' }];
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
    form?.querySelectorAll('[data-sec-up], [data-sec-down]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-section-index]')?.dataset.sectionIndex);
        current = collect(form, current);
        const next = [...current.sections];
        const swap = btn.hasAttribute('data-sec-up') ? index - 1 : index + 1;
        if (swap < 0 || swap >= next.length) return;
        [next[index], next[swap]] = [next[swap], next[index]];
        current.sections = next.map((item, order) => ({ ...item, order }));
        redraw();
      });
    });
    bindImagePickers(form);
  }

  async function load() {
    record = await api.getContent('posts', id);
    current = normalizeBlogDocument({ ...emptyBlogDocument(), ...record.draft, slug: record.slug });
    status.textContent = `${record.status} · ${record.slug}`;
    redraw();
  }

  document.querySelector('[data-save]')?.addEventListener('click', async () => {
    try {
      current = collect(document.querySelector('#blog-form'), current);
      record = await api.saveContent('posts', id, current);
      current = normalizeBlogDocument(record.draft);
      status.textContent = `Draft saved · ${record.status}`;
      error.hidden = true;
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-publish]')?.addEventListener('click', async () => {
    try {
      current = collect(document.querySelector('#blog-form'), current);
      await api.saveContent('posts', id, current);
      record = await api.publishContent('posts', id);
      status.textContent = `PUBLISHED · ${record.slug}`;
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-unpublish]')?.addEventListener('click', async () => {
    try {
      record = await api.unpublishContent('posts', id);
      status.textContent = `UNPUBLISHED · ${record.slug}`;
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.deleteContent('posts', id);
      window.location.hash = '#/posts';
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
