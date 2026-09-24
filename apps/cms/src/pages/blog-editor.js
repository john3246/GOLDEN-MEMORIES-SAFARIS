import { BLOG_SECTION_TYPES } from '@gm-safaris/shared-types';
import { emptyBlogDocument, normalizeBlogDocument } from '@gm-safaris/safari-ui';
import { api } from '../api/client.js';
import { BLOG_TOPICS } from '../content/cards.js';
import { shell } from './shell.js';
import { bindImagePickers, galleryField, imageField } from '../components/image-picker.js';
import { notifyError, notifySuccess } from '../components/toast.js';

const BLOCK_LABELS = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  list: 'List',
  quote: 'Quote',
  image: 'Image',
  gallery: 'Gallery',
  cta: 'Button / link',
  callout: 'Callout box',
  map: 'Map / itinerary highlight',
  tours: 'Featured tours',
  lodges: 'Featured lodges',
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
    'blog',
    `
    <section class="cms-page cms-doc-editor" data-post-id="${id}">
      <div class="cms-page-head">
        <div>
          <a class="cms-muted" href="#/posts">← All articles</a>
          <h1>Edit article</h1>
          <p class="cms-lead" id="editor-status">Loading…</p>
        </div>
        <div class="cms-dashboard-actions">
          <a class="cms-btn" href="#/posts/${id}/preview">Live preview</a>
          <button class="cms-btn cms-btn-gold" type="button" data-save>Save draft</button>
          <button class="cms-btn cms-btn-navy" type="button" data-publish>Publish</button>
          <button class="cms-btn" type="button" data-unpublish>Unpublish</button>
          <button class="cms-btn cms-btn-danger" type="button" data-delete>Delete</button>
        </div>
      </div>
      <p class="cms-error" id="editor-error" hidden></p>
      <div class="cms-panel" id="editor-fields"></div>
    </section>
  `
  );
}

function field(label, name, value, type = 'text', hint = '') {
  if (type === 'textarea') {
    return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><textarea id="${name}" name="${name}" rows="4">${escapeValue(value)}</textarea>${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
  }
  if (type === 'checkbox') {
    return `<label class="cms-check"><input id="${name}" name="${name}" type="checkbox" ${value ? 'checked' : ''} /> ${label}</label>`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeValue(value)}" />${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
}

function selectField(label, name, value, options) {
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><select id="${name}" name="${name}">${options
    .map(
      (option) =>
        `<option value="${escapeValue(option.value)}" ${option.value === value ? 'selected' : ''}>${escapeValue(option.label)}</option>`
    )
    .join('')}</select></div>`;
}

function group(title, inner, open = false) {
  return `<details class="cms-accordion"${open ? ' open' : ''}><summary>${title}</summary><div class="cms-accordion-body">${inner}</div></details>`;
}

function selectedSet(values) {
  return new Set((values || []).map((item) => String(item)));
}

function relationPicker(kind, selected, rows, emptyLabel) {
  const ids = selectedSet(selected);
  const cards = (rows || [])
    .map((row) => {
      const value = row.value;
      const checked = ids.has(value);
      return `
        <label class="cms-lodge-pick${checked ? ' is-on' : ''}" data-search="${escapeValue(`${row.title} ${row.detail} ${value}`.toLowerCase())}">
          <input type="checkbox" name="${kind}" value="${escapeValue(value)}" ${checked ? 'checked' : ''} />
          <span class="cms-lodge-pick-media">${row.image ? `<img src="${escapeValue(row.image)}" alt="" />` : ''}</span>
          <span>
            <strong>${escapeValue(row.title)}</strong>
            <small>${escapeValue(row.detail || value)}</small>
          </span>
        </label>`;
    })
    .join('');
  return `
    <div class="cms-field">
      <input class="cms-picker-search" type="search" data-picker-filter="${kind}" placeholder="Search ${String(kind).includes('lodge') ? 'lodges' : 'safaris'}…" />
    </div>
    <div class="cms-lodge-grid" data-picker-list="${kind}">${cards || `<p class="cms-muted">${emptyLabel}</p>`}</div>`;
}

function blockFields(block, index, tours, lodges) {
  if (block.type === 'heading') {
    return `${selectField('Level', `block.${index}.level`, String(block.level || 2), [
      { value: '2', label: 'Heading 2' },
      { value: '3', label: 'Heading 3' },
    ])}${field('Heading', `block.${index}.text`, block.text, 'textarea')}`;
  }
  if (block.type === 'list') {
    return `${selectField('List style', `block.${index}.list_style`, block.list_style || 'ul', [
      { value: 'ul', label: 'Bullets' },
      { value: 'ol', label: 'Numbered' },
    ])}${field('Items', `block.${index}.itemsText`, (block.items || []).join('\n'), 'textarea', 'One item per line')}`;
  }
  if (block.type === 'image') {
    return `${imageField('Photo', `block.${index}.url`, block.url)}${field('Alt text', `block.${index}.alt`, block.alt)}${field('Caption', `block.${index}.caption`, block.caption)}${selectField('Layout', `block.${index}.layout`, block.layout || 'full', [
      { value: 'full', label: 'Full width' },
      { value: 'center', label: 'Centered' },
      { value: 'float-left', label: 'Floated left' },
      { value: 'float-right', label: 'Floated right' },
    ])}`;
  }
  if (block.type === 'gallery') {
    const urls = (block.images || [])
      .map((image) => (typeof image === 'string' ? image : image?.url || ''))
      .map((url) => String(url).trim())
      .filter(Boolean);
    return `${galleryField('Photos', `block.${index}.imagesText`, urls)}${selectField('View', `block.${index}.gallery_mode`, block.gallery_mode || 'grid', [
      { value: 'grid', label: 'Grid' },
      { value: 'carousel', label: 'Carousel' },
      { value: 'lightbox', label: 'Lightbox' },
    ])}`;
  }
  if (block.type === 'cta') {
    return `${field('Button label', `block.${index}.text`, block.text)}${field('URL', `block.${index}.href`, block.href || block.url)}${selectField('Style', `block.${index}.variant`, block.variant || 'gold', [
      { value: 'gold', label: 'Gold' },
      { value: 'navy', label: 'Navy' },
      { value: 'light', label: 'Light' },
    ])}${selectField('Open', `block.${index}.target`, block.target || '_self', [
      { value: '_self', label: 'Same tab' },
      { value: '_blank', label: 'New tab' },
    ])}`;
  }
  if (block.type === 'callout') {
    return `${selectField('Type', `block.${index}.callout_type`, block.callout_type || 'tip', [
      { value: 'tip', label: 'Safari tip' },
      { value: 'info', label: 'Info' },
      { value: 'warning', label: 'Warning' },
    ])}${field('Title', `block.${index}.title`, block.title)}${field('Content', `block.${index}.text`, block.text, 'textarea')}`;
  }
  if (block.type === 'map') {
    return `${field('Title', `block.${index}.title`, block.title)}${field('Location', `block.${index}.location`, block.location)}${field('Day-by-day highlight', `block.${index}.days`, block.days, 'textarea')}${field('Notes', `block.${index}.text`, block.text, 'textarea')}${field('Embed URL (optional)', `block.${index}.embed_url`, block.embed_url)}`;
  }
  if (block.type === 'tours') {
    return relationPicker(`block.${index}.tour_slugs`, block.tour_slugs, tours, 'Publish safari packages first.');
  }
  if (block.type === 'lodges') {
    return relationPicker(`block.${index}.lodge_ids`, block.lodge_ids, lodges, 'Publish lodges under Accommodations first.');
  }
  return field(block.type === 'quote' ? 'Quote' : 'Paragraph', `block.${index}.text`, block.text, 'textarea');
}

function blockEditor(blocks, tours, lodges) {
  const rows = (blocks || [])
    .map(
      (block, index) => `
      <article class="cms-day" data-block-index="${index}">
        <div class="cms-day-head">
          <strong><span class="cms-drag-handle" aria-hidden="true">⋮⋮</span> ${BLOCK_LABELS[block.type] || block.type}</strong>
          <span class="cms-editor-actions">
            <button class="cms-btn" type="button" data-block-up>Up</button>
            <button class="cms-btn" type="button" data-block-down>Down</button>
            <button class="cms-btn cms-btn-danger" type="button" data-block-del>Remove</button>
          </span>
        </div>
        <input type="hidden" name="block.${index}.type" value="${escapeValue(block.type)}" />
        ${blockFields(block, index, tours, lodges)}
      </article>`
    )
    .join('');
  return `
    <p class="cms-hint">Add, reorder, or drag blocks. Live preview opens in its own page so you can check phone and desktop before publishing.</p>
    <div class="cms-block-palette">
      ${Object.entries(BLOCK_LABELS)
        .map(([type, label]) => `<button class="cms-btn" type="button" data-add-block="${type}">${label}</button>`)
        .join('')}
    </div>
    <div class="cms-block-stack">${rows}</div>`;
}

function renderFields(doc, tours, lodges) {
  const topicOptions = Object.entries(BLOG_TOPICS).map(([value, label]) => ({ value, label }));
  return `
    ${group(
      'Title, category and cover',
      `
      ${field('Title', 'title', doc.title)}
      ${field('Slug', 'slug', doc.slug)}
      <div class="cms-grid-2">
        ${selectField('Category', 'topic', doc.topic || 'safari', topicOptions)}
        ${field('Kicker', 'kicker', doc.kicker)}
      </div>
      <div class="cms-grid-2">
        ${field('Publish date', 'date', doc.date)}
        ${field('Author', 'author', doc.author)}
      </div>
      ${field('Author role', 'author_role', doc.author_role)}
      ${field('Author bio', 'author_bio', doc.author_bio, 'textarea')}
      ${imageField('Author photo', 'author_image', doc.author_image)}
      ${field('Excerpt', 'excerpt', doc.excerpt, 'textarea')}
      ${imageField('Cover photo', 'hero_url', doc.hero_image?.url || doc.image)}
      ${field('Cover alt text', 'hero_alt', doc.hero_image?.alt || doc.title)}
      ${galleryField('Extra gallery photos', 'gallery', (doc.gallery || []).map((item) => item.url || item).join('\n'))}
      ${field('Pin as featured article', 'featured', doc.featured, 'checkbox')}
      <p class="cms-hint">Read time is calculated automatically from the article body (${doc.read_time || 1} min).</p>
    `,
      true
    )}
    ${group('Layout blocks', blockEditor(doc.blocks, tours, lodges), true)}
    ${group(
      'Tours and lodges',
      `
      <p class="cms-hint">These appear in the article sidebar and can also be dropped into the body with Tour or Lodge blocks.</p>
      ${relationPicker('featured_tour_slugs', doc.featured_tour_slugs, tours, 'Publish safari packages first.')}
      ${relationPicker('featured_lodge_ids', doc.featured_lodge_ids, lodges, 'Publish lodges under Accommodations first.')}
    `,
      true
    )}
    ${group(
      'Page sections',
      (doc.sections || [])
        .map(
          (section, index) => `
        <div class="cms-section-row" data-section-index="${index}">
          <label class="cms-check"><input type="checkbox" data-section-enabled ${section.enabled !== false ? 'checked' : ''} /> ${section.type.replace(/_/g, ' ')}</label>
          <span class="cms-editor-actions">
            <button class="cms-btn" type="button" data-sec-up>Up</button>
            <button class="cms-btn" type="button" data-sec-down>Down</button>
          </span>
        </div>`
        )
        .join('')
    )}
    ${group(
      'Call to action',
      `
      ${field('Button label', 'cta_label', doc.cta_label)}
      ${field('Button link', 'cta_href', doc.cta_href)}
    `
    )}
    ${group(
      'SEO',
      `
      ${field('Meta title', 'seo_title', doc.seo_title)}
      ${field('Meta description', 'seo_description', doc.seo_description, 'textarea')}
      ${field('Keywords', 'seo_keywords', doc.seo_keywords, 'text', 'Comma-separated')}
      ${field('Canonical URL', 'canonical_url', doc.canonical_url)}
      ${imageField('Open Graph image', 'og_image', doc.og_image || doc.hero_image?.url)}
    `
    )}
  `;
}

function collectChecks(form, name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function collectBlock(form, block, index) {
  const imagesText = form[`block.${index}.imagesText`]?.value || '';
  const images = imagesText
    ? String(imagesText)
        .split('\n')
        .map((line) => {
          const [url, alt, caption] = line.split('|').map((part) => part.trim());
          const prev = (block.images || []).find((image) => (image.url || image) === url);
          return {
            url,
            alt: alt || prev?.alt || '',
            caption: caption || prev?.caption || '',
          };
        })
        .filter((item) => item.url)
    : block.images;
  return {
    id: block.id || `block_${index + 1}`,
    type: form[`block.${index}.type`]?.value || block.type,
    text: form[`block.${index}.text`]?.value || '',
    url: form[`block.${index}.url`]?.value || '',
    alt: form[`block.${index}.alt`]?.value || '',
    caption: form[`block.${index}.caption`]?.value || '',
    title: form[`block.${index}.title`]?.value || '',
    level: form[`block.${index}.level`]?.value || block.level,
    layout: form[`block.${index}.layout`]?.value || block.layout,
    items: form[`block.${index}.itemsText`]?.value || (block.items || []).join('\n'),
    list_style: form[`block.${index}.list_style`]?.value || block.list_style,
    variant: form[`block.${index}.variant`]?.value || block.variant,
    href: form[`block.${index}.href`]?.value || '',
    target: form[`block.${index}.target`]?.value || block.target,
    callout_type: form[`block.${index}.callout_type`]?.value || block.callout_type,
    gallery_mode: form[`block.${index}.gallery_mode`]?.value || block.gallery_mode,
    images,
    location: form[`block.${index}.location`]?.value || '',
    days: form[`block.${index}.days`]?.value || '',
    embed_url: form[`block.${index}.embed_url`]?.value || '',
    tour_slugs: collectChecks(form, `block.${index}.tour_slugs`),
    lodge_ids: collectChecks(form, `block.${index}.lodge_ids`),
  };
}

function collect(form, current) {
  const blocks = (current.blocks || []).map((block, index) => collectBlock(form, block, index));
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
    author_role: form.author_role?.value,
    author_bio: form.author_bio?.value,
    author_image: form.author_image?.value,
    excerpt: form.excerpt?.value,
    featured: Boolean(form.featured?.checked),
    hero_image: { url: form.hero_url?.value, alt: form.hero_alt?.value },
    image: form.hero_url?.value,
    gallery: String(form.gallery?.value || '')
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, alt: form.hero_alt?.value || current.title || '' })),
    featured_tour_slugs: collectChecks(form, 'featured_tour_slugs'),
    featured_lodge_ids: collectChecks(form, 'featured_lodge_ids'),
    cta_label: form.cta_label?.value,
    cta_href: form.cta_href?.value,
    seo_title: form.seo_title?.value,
    seo_description: form.seo_description?.value,
    seo_keywords: form.seo_keywords?.value,
    canonical_url: form.canonical_url?.value,
    og_image: form.og_image?.value,
    blocks,
    sections: sections.length ? sections : current.sections,
  });
}

function filterPickers(form) {
  form.querySelectorAll('[data-picker-filter]').forEach((input) => {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const list = form.querySelector(`[data-picker-list="${input.dataset.pickerFilter}"]`);
      list?.querySelectorAll('[data-search]').forEach((card) => {
        card.hidden = Boolean(q) && !card.dataset.search.includes(q);
      });
    });
  });
}

function bindDrag(form, current, redraw) {
  let from = null;
  form.querySelectorAll('[data-block-index]').forEach((row) => {
    const handle = row.querySelector('.cms-drag-handle');
    if (handle) {
      handle.draggable = true;
      handle.addEventListener('dragstart', (event) => {
        from = Number(row.dataset.blockIndex);
        row.classList.add('is-dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(from));
      });
      handle.addEventListener('dragend', () => row.classList.remove('is-dragging'));
    }
    row.addEventListener('dragover', (event) => event.preventDefault());
    row.addEventListener('drop', (event) => {
      event.preventDefault();
      const to = Number(row.dataset.blockIndex);
      if (from == null || from === to) return;
      const next = collect(form, current);
      const blocks = [...next.blocks];
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      Object.assign(current, next, { blocks });
      redraw();
    });
  });
}

export async function initBlogEditor(id) {
  const status = document.querySelector('#editor-status');
  const fields = document.querySelector('#editor-fields');
  const error = document.querySelector('#editor-error');
  let current = emptyBlogDocument();
  let record = null;
  let tours = [];
  let lodges = [];

  function showError(err) {
    error.hidden = false;
    error.textContent = err.message || String(err);
    notifyError(err.message || String(err));
  }

  function redraw() {
    fields.innerHTML = `<form id="blog-form">${renderFields(current, tours, lodges)}</form>`;
    bindForm();
  }

  function bindForm() {
    const form = document.querySelector('#blog-form');
    const refresh = () => {
      current = collect(form, current);
    };
    form?.addEventListener('input', refresh);
    form?.addEventListener('change', refresh);

    form?.querySelectorAll('[data-add-block]').forEach((btn) => {
      btn.addEventListener('click', () => {
        current = collect(form, current);
        current.blocks = [
          ...(current.blocks || []),
          { id: `block_${Date.now()}`, type: btn.dataset.addBlock, text: '', url: '', alt: '' },
        ];
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
    filterPickers(form);
    bindDrag(form, current, redraw);
    bindImagePickers(form);
  }

  async function loadRelations() {
    try {
      const [safariResult, lodgeResult] = await Promise.all([
        api.listSafaris({ limit: 200 }).catch(() => ({ data: [] })),
        api.listContent('lodges').catch(() => ({ data: [] })),
      ]);
      tours = (safariResult.data || []).map((item) => ({
        value: item.slug || item.id,
        title: item.title || item.slug,
        detail: item.duration_label || item.destination || item.status,
        image: item.hero_image?.url || '',
      }));
      lodges = (lodgeResult.data || []).map((item) => {
        const doc = item.published || item.draft || {};
        return {
          value: item.id,
          title: doc.title || item.title || 'Lodge',
          detail: [doc.place, doc.category].filter(Boolean).join(' · '),
          image: doc.image || '',
        };
      });
    } catch {
      tours = [];
      lodges = [];
    }
  }

  async function load() {
    await loadRelations();
    record = await api.getContent('posts', id);
    current = normalizeBlogDocument({ ...emptyBlogDocument(), ...record.draft, slug: record.slug });
    status.textContent = `${record.status} · ${record.slug} · ${current.read_time} min read`;
    redraw();
  }

  document.querySelector('[data-save]')?.addEventListener('click', async () => {
    try {
      current = collect(document.querySelector('#blog-form'), current);
      record = await api.saveContent('posts', id, current);
      current = normalizeBlogDocument(record.draft);
      status.textContent = `Draft saved · ${record.status} · ${current.read_time} min read`;
      error.hidden = true;
      notifySuccess('Article draft saved.');
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
      notifySuccess('Article published to the website.');
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-unpublish]')?.addEventListener('click', async () => {
    try {
      record = await api.unpublishContent('posts', id);
      status.textContent = `UNPUBLISHED · ${record.slug}`;
      notifySuccess('Article unpublished.');
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.deleteContent('posts', id);
      notifySuccess('Article deleted.');
      window.location.hash = '#/posts';
    } catch (err) {
      showError(err);
    }
  });

  try {
    await load();
  } catch (err) {
    showError(err);
  }
}
