import { emptyDestinationDocument, normalizeDestinationDocument } from '@gm-safaris/safari-ui';
import { api } from '../api/client.js';
import { shell } from './shell.js';
import { bindImagePickers, galleryField, imageField } from '../components/image-picker.js';
import { collectChecks, filterPickers, relationPicker } from '../components/relation-picker.js';
import { notifyError, notifySuccess } from '../components/toast.js';

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
    <section class="cms-page cms-doc-editor" data-destination-id="${id}">
      <div class="cms-page-head">
        <div>
          <a class="cms-muted" href="#/destinations">← All destinations</a>
          <h1>Edit destination</h1>
          <p class="cms-lead" id="editor-status">Loading…</p>
        </div>
        <div class="cms-dashboard-actions">
          <a class="cms-btn" href="#/destinations/${id}/preview">Live preview</a>
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

function renderFields(doc, tours, lodges, posts) {
  return `
    ${group(
      'Name and hero',
      `
      ${field('Name', 'title', doc.title)}
      ${field('Slug', 'slug', doc.slug)}
      <div class="cms-grid-2">
        ${field('Region', 'region', doc.region)}
        ${field('Country', 'country', doc.country || 'Tanzania')}
      </div>
      <div class="cms-grid-2">
        ${field('Kicker', 'kicker', doc.kicker)}
        ${field('Button label', 'cta', doc.cta)}
      </div>
      ${field('Tagline', 'tagline', doc.tagline, 'textarea')}
      ${field('Short blurb / excerpt', 'blurb', doc.blurb, 'textarea')}
      ${field('Location', 'location', doc.location)}
      ${imageField('Cover photo', 'image', doc.image)}
      ${field('Cover alt text', 'image_alt', doc.image_alt || doc.title)}
      ${galleryField('Gallery photos', 'gallery', doc.gallery || [])}
    `,
      true
    )}
    ${group('Page copy, images and tables', blockEditor(doc.blocks), true)}
    ${group(
      'Map, climate and travel',
      `
      <div class="cms-grid-2">
        ${field('Latitude', 'lat', doc.lat)}
        ${field('Longitude', 'lng', doc.lng)}
      </div>
      <p class="cms-hint">Used for the embedded map on the public destination page. Leave blank to use the park default.</p>
      ${field('Climate', 'climate', doc.climate, 'textarea', 'Dry season — … / Rainy season — … / Average temperature — …, one per line')}
      ${field('How to get there', 'getting_there', doc.getting_there, 'textarea', 'Airports, road times, and airstrip notes')}
      ${field('Airstrips and transfers', 'airstrips', doc.airstrips, 'textarea', 'One item per line')}
      ${field('Park fees and rules', 'entry_fees', doc.entry_fees, 'textarea')}
    `,
      true
    )}
    ${group(
      'Facts, seasons and wildlife',
      `
      ${field('Highlights', 'highlights', doc.highlights, 'textarea', 'Title — body, one per line')}
      ${field('Quick facts', 'facts', doc.facts, 'textarea', 'Label | Value, one per line')}
      ${field('Best time to visit', 'seasons', doc.seasons, 'textarea', 'Title — body, one per line')}
      ${field('Wildlife', 'wildlife', doc.wildlife, 'textarea', 'One item per line')}
      ${field('Activities', 'activities', doc.activities, 'textarea', 'Title — body, one per line')}
      ${field('Attractions', 'attractions', doc.attractions, 'textarea', 'One item per line')}
      ${field('Match keywords', 'match', doc.match, 'textarea', 'Used to attach related tours when no package is picked. One per line.')}
      ${field('FAQs', 'faqs', doc.faqs, 'textarea', 'Question | Answer, one per line')}
    `
    )}
    ${group(
      'Tours, lodges and articles',
      `
      <p class="cms-hint">Search and tick the packages, stays, and journal stories that belong on this destination page.</p>
      ${relationPicker('tour_slugs', doc.tour_slugs, tours, 'Publish safari packages first.')}
      ${relationPicker('lodge_ids', doc.lodge_ids, lodges, 'Publish lodges under Accommodations first.')}
      ${relationPicker('related_post_slugs', doc.related_post_slugs, posts, 'Publish journal articles first.')}
    `,
      true
    )}
    ${group(
      'SEO',
      `
      ${field('Meta title', 'seo_title', doc.seo_title)}
      ${field('Meta description', 'seo_description', doc.seo_description, 'textarea')}
      ${field('Keywords', 'seo_keywords', doc.seo_keywords, 'text', 'Comma-separated')}
      ${field('Canonical URL', 'canonical_url', doc.canonical_url)}
      ${imageField('Open Graph image', 'og_image', doc.og_image || doc.image)}
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
    country: form.country?.value,
    kicker: form.kicker?.value,
    tagline: form.tagline?.value,
    blurb: form.blurb?.value,
    location: form.location?.value,
    cta: form.cta?.value,
    image: form.image?.value,
    image_alt: form.image_alt?.value,
    gallery: form.gallery?.value,
    lat: form.lat?.value,
    lng: form.lng?.value,
    climate: form.climate?.value,
    getting_there: form.getting_there?.value,
    airstrips: form.airstrips?.value,
    entry_fees: form.entry_fees?.value,
    match: form.match?.value,
    highlights: form.highlights?.value,
    facts: form.facts?.value,
    seasons: form.seasons?.value,
    wildlife: form.wildlife?.value,
    activities: form.activities?.value,
    attractions: form.attractions?.value,
    faqs: form.faqs?.value,
    tour_slugs: collectChecks(form, 'tour_slugs'),
    lodge_ids: collectChecks(form, 'lodge_ids'),
    related_post_slugs: collectChecks(form, 'related_post_slugs'),
    seo_title: form.seo_title?.value,
    seo_description: form.seo_description?.value,
    seo_keywords: form.seo_keywords?.value,
    canonical_url: form.canonical_url?.value,
    og_image: form.og_image?.value,
    blocks,
  });
}

export async function initDestinationEditor(id) {
  const status = document.querySelector('#editor-status');
  const fields = document.querySelector('#editor-fields');
  const error = document.querySelector('#editor-error');
  let current = emptyDestinationDocument();
  let record = null;
  let tours = [];
  let lodges = [];
  let posts = [];

  function showError(err) {
    error.hidden = false;
    error.textContent = err.message || String(err);
    notifyError(err.message || String(err));
  }

  function redraw() {
    fields.innerHTML = `<form id="destination-form">${renderFields(current, tours, lodges, posts)}</form>`;
    bindForm();
  }

  function bindForm() {
    const form = document.querySelector('#destination-form');
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
    filterPickers(form);
  }

  async function loadRelations() {
    try {
      const [safariResult, lodgeResult, postResult] = await Promise.all([
        api.listSafaris({ limit: 200 }).catch(() => ({ data: [] })),
        api.listContent('lodges').catch(() => ({ data: [] })),
        api.listContent('posts').catch(() => ({ data: [] })),
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
      posts = (postResult.data || []).map((item) => {
        const doc = item.published || item.draft || {};
        return {
          value: doc.slug || item.slug,
          title: doc.title || item.title || item.slug,
          detail: doc.topic || doc.date || item.slug,
          image: doc.hero_image?.url || doc.image || '',
        };
      });
    } catch {
      tours = [];
      lodges = [];
      posts = [];
    }
  }

  async function load() {
    await loadRelations();
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
      status.textContent = record.status === 'PUBLISHED'
        ? 'Draft saved · click Publish to update the live page'
        : `Draft saved · ${record.status}`;
      error.hidden = true;
      notifySuccess(record.status === 'PUBLISHED' ? 'Draft saved. Click Publish to put the changes live.' : 'Destination draft saved.');
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
      notifySuccess('Destination published to the website.');
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-unpublish]')?.addEventListener('click', async () => {
    try {
      record = await api.unpublishContent('destinations', id);
      status.textContent = `Unpublished · ${record.slug}`;
      notifySuccess('Destination unpublished.');
    } catch (err) {
      showError(err);
    }
  });
  document.querySelector('[data-delete]')?.addEventListener('click', async () => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await api.deleteContent('destinations', id);
      notifySuccess('Destination deleted.');
      window.location.hash = '#/destinations';
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
