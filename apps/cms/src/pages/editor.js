import { SAFARI_SECTION_TYPES } from '@gm-safaris/shared-types';
import { renderSafariPage, emptySafariDocument } from '@gm-safaris/safari-ui';
import { api } from '../api/client.js';
import { shell } from './shell.js';

const SECTION_LABELS = {
  hero: 'Hero',
  overview: 'Overview',
  highlights: 'Highlights',
  gallery: 'Gallery',
  facts: 'Safari facts',
  itinerary: 'Itinerary',
  accommodation: 'Accommodation',
  included: 'Included',
  excluded: 'Excluded',
  destination: 'Destination',
  map: 'Map',
  faq: 'FAQ',
  related: 'Related packages',
  booking_cta: 'Booking CTA',
};

function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderEditor(user, id) {
  return shell(
    user,
    'safaris',
    `
    <section class="cms-editor is-edit" data-safari-id="${id}">
      <div class="cms-editor-switch">
        <button class="cms-btn is-active" type="button" data-pane="edit">Content</button>
        <button class="cms-btn" type="button" data-pane="preview">Preview</button>
      </div>
      <aside class="cms-editor-side">
        <div class="cms-editor-toolbar">
          <div>
            <a class="cms-muted" href="#/safaris">← All safari packages</a>
            <div id="editor-status" class="cms-muted" style="margin-top:0.25rem">Loading…</div>
          </div>
          <div class="cms-editor-actions">
            <button class="cms-btn cms-btn-gold" type="button" data-save>Save draft</button>
            <button class="cms-btn cms-btn-navy" type="button" data-publish>Publish</button>
            <button class="cms-btn" type="button" data-unpublish>Unpublish</button>
            <button class="cms-btn" type="button" data-duplicate>Duplicate</button>
            <button class="cms-btn cms-btn-danger" type="button" data-archive>Archive</button>
          </div>
          <p class="cms-error" id="editor-error" hidden></p>
        </div>
        <div class="cms-editor-fields" id="editor-fields"></div>
      </aside>
      <div class="cms-preview-wrap">
        <header class="cms-preview-toolbar">
          <div>
            <p class="cms-preview-kicker">Live preview</p>
            <p class="cms-preview-hint">Public tour page</p>
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
              <div class="cms-preview-address" id="preview-url">gmsafaris.com/tours/</div>
            </div>
            <div class="cms-preview-frame" id="safari-preview"></div>
          </div>
        </div>
      </div>
    </section>
  `
  );
}

function lines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function field(label, name, value, type = 'text', hint = '') {
  if (type === 'textarea') {
    return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><textarea id="${name}" name="${name}" rows="5">${escapeValue(value)}</textarea>${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
  }
  if (type === 'checkbox') {
    return `<label class="cms-check"><input type="checkbox" name="${name}" ${value ? 'checked' : ''} /> ${label}</label>`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeValue(value)}" />${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
}

function group(title, inner, open = false) {
  return `<details class="cms-accordion"${open ? ' open' : ''}><summary>${title}</summary><div class="cms-accordion-body">${inner}</div></details>`;
}

function sectionList(sections) {
  const rows = (sections || []).map(
    (item, index) => `
      <div class="cms-section-row" data-section-index="${index}">
        <label class="cms-check"><input type="checkbox" data-section-enabled ${item.enabled !== false ? 'checked' : ''} /> ${SECTION_LABELS[item.type] || item.type}</label>
        <span class="cms-editor-actions">
          <button class="cms-btn" type="button" data-sec-up>Up</button>
          <button class="cms-btn" type="button" data-sec-down>Down</button>
        </span>
      </div>`
  );
  return rows.join('');
}

function itineraryEditor(days) {
  const blocks = (days || [])
    .map(
      (day, index) => `
      <article class="cms-day" data-day-index="${index}">
        <div class="cms-day-head">
          <strong>${escapeValue(day.day || `Day ${index + 1}`)}</strong>
          <span class="cms-editor-actions">
            <button class="cms-btn" type="button" data-day-dup>Duplicate</button>
            <button class="cms-btn cms-btn-danger" type="button" data-day-del>Remove</button>
          </span>
        </div>
        <div class="cms-grid-2">
          ${field('Day label', `day.${index}.day`, day.day)}
          ${field('Title', `day.${index}.title`, day.title)}
        </div>
        ${field('Description', `day.${index}.description`, day.description, 'textarea')}
        ${field('Activities', `day.${index}.activities`, lines(day.activities), 'textarea', 'One activity per line.')}
        <div class="cms-grid-2">
          ${field('Accommodation', `day.${index}.accommodation`, day.accommodation)}
          ${field('Meals', `day.${index}.meals`, day.meals)}
        </div>
        ${field('Image URL', `day.${index}.image`, day.image)}
      </article>`
    )
    .join('');
  return `<button class="cms-btn cms-btn-navy" type="button" data-add-day>Add itinerary day</button>${blocks}`;
}

function renderFields(doc) {
  return `
    ${group(
      'Package details',
      `
      ${field('Title', 'title', doc.title)}
      ${field('Slug', 'slug', doc.slug, 'text', 'URL path, for example 4-days-serengeti-ngorongoro.')}
      ${field('Short description', 'short_description', doc.short_description, 'textarea')}
      ${field('Full description', 'description', doc.description, 'textarea')}
      <div class="cms-grid-2">
        ${field('Destination', 'destination', doc.destination)}
        ${field('Style / difficulty', 'difficulty', doc.difficulty)}
      </div>
    `,
      true
    )}
    ${group(
      'Duration, price and facts',
      `
      <div class="cms-grid-3">
        ${field('Duration (days)', 'duration', doc.duration, 'number')}
        ${field('Duration label', 'duration_label', doc.duration_label)}
        ${field('Price per person', 'price_from', doc.price_from, 'number', 'Shown on the website. Based on two travellers sharing unless you set a different minimum.')}
        ${field('Currency', 'currency', doc.currency || 'USD')}
        ${field('Best season', 'best_season', doc.best_season)}
        ${field('Display order', 'display_order', doc.display_order, 'number')}
        ${field('Minimum people', 'minimum_people', doc.minimum_people, 'number')}
        ${field('Maximum people', 'maximum_people', doc.maximum_people, 'number')}
      </div>
      ${field('Featured package', 'featured', doc.featured, 'checkbox')}
    `
    )}
    ${group(
      'Hero and gallery',
      `
      ${field('Hero image URL', 'hero_url', doc.hero_image?.url)}
      ${field('Hero alt text', 'hero_alt', doc.hero_image?.alt)}
      ${field('Gallery image URLs', 'gallery', (doc.gallery || []).map((i) => i.url).join('\n'), 'textarea', 'One HTTPS image URL per line.')}
    `
    )}
    ${group(
      'Highlights, inclusions and copy',
      `
      ${field('Highlights', 'highlights', lines(doc.highlights), 'textarea', 'One highlight per line.')}
      ${field('Inclusions', 'inclusions', lines(doc.inclusions), 'textarea', 'One item per line.')}
      ${field('Exclusions', 'exclusions', lines(doc.exclusions), 'textarea', 'One item per line.')}
      ${field('Accommodation notes', 'accommodation', doc.accommodation, 'textarea')}
      ${field('Transport notes', 'transport_information', doc.transport_information, 'textarea')}
      ${field('FAQs', 'faq', (doc.faq || []).map((i) => `${i.q || ''}||${i.a || ''}`).join('\n'), 'textarea', 'One FAQ per line, written as Question||Answer.')}
      ${field('Map embed URL', 'map_embed', doc.map?.embed_url)}
    `
    )}
    ${group('Itinerary', itineraryEditor(doc.itinerary), true)}
    ${group(
      'Search and sharing',
      `
      ${field('SEO title', 'seo_title', doc.seo?.title)}
      ${field('SEO description', 'seo_description', doc.seo?.description, 'textarea')}
      ${field('Canonical URL', 'seo_canonical', doc.seo?.canonical)}
      ${field('Share image URL', 'seo_og_image', doc.seo?.og_image)}
      ${field('Robots', 'seo_robots', doc.seo?.robots || 'index,follow')}
    `
    )}
    ${group('Page sections', sectionList(doc.sections))}
    ${group('Revision history', `<ol class="cms-revisions" id="revision-list"></ol>`)}
  `;
}

function readList(form, name) {
  return String(form[name]?.value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function collect(form, current) {
  const days = [];
  (current.itinerary || []).forEach((_day, index) => {
    days.push({
      id: current.itinerary[index]?.id,
      day: form[`day.${index}.day`]?.value,
      title: form[`day.${index}.title`]?.value,
      description: form[`day.${index}.description`]?.value,
      activities: readList(form, `day.${index}.activities`),
      accommodation: form[`day.${index}.accommodation`]?.value,
      meals: form[`day.${index}.meals`]?.value,
      image: form[`day.${index}.image`]?.value,
    });
  });

  const sectionRows = [...document.querySelectorAll('[data-section-index]')];
  const sections = sectionRows.map((row, order) => ({
    type: (current.sections || [])[Number(row.dataset.sectionIndex)]?.type || SAFARI_SECTION_TYPES[order],
    enabled: row.querySelector('[data-section-enabled]')?.checked !== false,
    order,
  }));

  return {
    title: form.title?.value,
    slug: form.slug?.value,
    short_description: form.short_description?.value,
    description: form.description?.value,
    duration: form.duration?.value ? Number(form.duration.value) : null,
    duration_label: form.duration_label?.value,
    price_from: form.price_from?.value ? Number(form.price_from.value) : null,
    currency: form.currency?.value,
    destination: form.destination?.value,
    difficulty: form.difficulty?.value,
    best_season: form.best_season?.value,
    minimum_people: form.minimum_people?.value ? Number(form.minimum_people.value) : null,
    maximum_people: form.maximum_people?.value ? Number(form.maximum_people.value) : null,
    featured: form.featured?.checked || false,
    display_order: form.display_order?.value ? Number(form.display_order.value) : 0,
    hero_image: { url: form.hero_url?.value, alt: form.hero_alt?.value, caption: '' },
    gallery: readList(form, 'gallery').map((url) => ({ url, alt: '', caption: '' })),
    highlights: readList(form, 'highlights'),
    inclusions: readList(form, 'inclusions'),
    exclusions: readList(form, 'exclusions'),
    accommodation: form.accommodation?.value,
    transport_information: form.transport_information?.value,
    faq: readList(form, 'faq').map((line) => {
      const [q, ...rest] = line.split('||');
      return { q: q?.trim(), a: rest.join('||').trim() };
    }),
    map: { embed_url: form.map_embed?.value, label: form.destination?.value },
    seo: {
      title: form.seo_title?.value,
      description: form.seo_description?.value,
      canonical: form.seo_canonical?.value,
      og_title: form.seo_title?.value,
      og_description: form.seo_description?.value,
      og_image: form.seo_og_image?.value,
      robots: form.seo_robots?.value,
    },
    itinerary: days,
    sections: sections.length ? sections : current.sections,
  };
}

function paintPreview(doc) {
  const frame = document.querySelector('#safari-preview');
  const url = document.querySelector('#preview-url');
  if (!frame) return;
  frame.innerHTML = renderSafariPage(doc, { editable: true, breadcrumb: true });
  if (url) url.textContent = `gmsafaris.com/tours/${doc.slug || 'preview'}/`;
}

export async function initEditor(id) {
  const status = document.querySelector('#editor-status');
  const fields = document.querySelector('#editor-fields');
  const error = document.querySelector('#editor-error');
  let current = emptySafariDocument();
  let record = null;

  function showError(err) {
    error.hidden = false;
    error.textContent = err.message || String(err);
  }

  async function load() {
    record = await api.getSafari(id);
    current = { ...emptySafariDocument(), ...record.draft, slug: record.slug };
    status.textContent = `${record.status} · ${record.slug}`;
    fields.innerHTML = `<form id="safari-form">${renderFields(current)}</form>`;
    const list = document.querySelector('#revision-list');
    if (list) {
      list.innerHTML = (record.revisions || [])
        .map((item) => `<li>v${item.version} ${item.action} · ${item.created_by_email || ''} · ${item.created_at?.slice(0, 16)}</li>`)
        .join('') || '<li>No revisions yet</li>';
    }
    paintPreview(current);
    bindForm();
  }

  function bindForm() {
    const form = document.querySelector('#safari-form');
    form?.addEventListener('input', () => {
      current = { ...current, ...collect(form, current) };
      paintPreview(current);
    });
    form?.addEventListener('change', () => {
      current = { ...current, ...collect(form, current) };
      paintPreview(current);
    });

    form?.querySelector('[data-add-day]')?.addEventListener('click', () => {
      current.itinerary = [
        ...(current.itinerary || []),
        { day: `Day ${(current.itinerary?.length || 0) + 1}`, title: '', description: '', activities: [] },
      ];
      fields.innerHTML = `<form id="safari-form">${renderFields(current)}</form>`;
      paintPreview(current);
      bindForm();
    });

    form?.querySelectorAll('[data-day-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-day-index]')?.dataset.dayIndex);
        current.itinerary = current.itinerary.filter((_, i) => i !== index);
        fields.innerHTML = `<form id="safari-form">${renderFields(current)}</form>`;
        paintPreview(current);
        bindForm();
      });
    });

    form?.querySelectorAll('[data-day-dup]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-day-index]')?.dataset.dayIndex);
        const copy = { ...current.itinerary[index], id: undefined };
        current.itinerary.splice(index + 1, 0, copy);
        fields.innerHTML = `<form id="safari-form">${renderFields(current)}</form>`;
        paintPreview(current);
        bindForm();
      });
    });

    form?.querySelectorAll('[data-sec-up], [data-sec-down]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-section-index]')?.dataset.sectionIndex);
        const next = [...current.sections];
        const swap = btn.hasAttribute('data-sec-up') ? index - 1 : index + 1;
        if (swap < 0 || swap >= next.length) return;
        [next[index], next[swap]] = [next[swap], next[index]];
        current.sections = next.map((item, order) => ({ ...item, order }));
        fields.innerHTML = `<form id="safari-form">${renderFields(current)}</form>`;
        paintPreview(current);
        bindForm();
      });
    });
  }

  document.querySelector('[data-save]')?.addEventListener('click', async () => {
    try {
      const form = document.querySelector('#safari-form');
      current = { ...current, ...collect(form, current) };
      record = await api.saveSafari(id, current);
      current = { ...emptySafariDocument(), ...record.draft };
      status.textContent = `Draft saved · ${record.status}`;
      error.hidden = true;
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-publish]')?.addEventListener('click', async () => {
    try {
      const form = document.querySelector('#safari-form');
      current = { ...current, ...collect(form, current) };
      await api.saveSafari(id, current);
      record = await api.action(id, 'publish');
      status.textContent = `PUBLISHED · ${record.slug}`;
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-unpublish]')?.addEventListener('click', async () => {
    try {
      record = await api.action(id, 'unpublish');
      status.textContent = `UNPUBLISHED · ${record.slug}`;
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-duplicate]')?.addEventListener('click', async () => {
    try {
      const copy = await api.action(id, 'duplicate');
      window.location.hash = `#/safaris/${copy.id}`;
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-archive]')?.addEventListener('click', async () => {
    try {
      record = await api.action(id, 'archive');
      status.textContent = `ARCHIVED · ${record.slug}`;
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

  document.querySelector('#safari-preview')?.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link) event.preventDefault();
    const target = event.target.closest('[data-safari-edit]');
    if (!target) return;
    event.preventDefault();
    const fieldName = target.getAttribute('data-safari-edit');
    const map = {
      title: 'title',
      description: 'description',
      highlights: 'highlights',
      itinerary: 'day.0.title',
      gallery: 'gallery',
      hero_image: 'hero_url',
      faq: 'faq',
      destination: 'destination',
    };
    const name = map[fieldName] || fieldName;
    const editor = document.querySelector('.cms-editor');
    editor?.classList.remove('is-preview');
    editor?.classList.add('is-edit');
    document.querySelectorAll('[data-pane]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.pane === 'edit');
    });
    document.querySelector(`[name="${name}"]`)?.focus();
  });

  try {
    await load();
  } catch (err) {
    showError(err);
  }
}
