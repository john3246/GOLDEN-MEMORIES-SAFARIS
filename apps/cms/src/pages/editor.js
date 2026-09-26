import { SAFARI_SECTION_TYPES, lodgeCategoryLabel } from '@gm-safaris/shared-types';
import {
  emptySafariDocument,
  emptyGroupSafariDocument,
  safariCompletenessErrors,
  clampSeoTitle,
  safariPackageTitle,
} from '@gm-safaris/safari-ui';
import { api } from '../api/client.js';
import { shell } from './shell.js';
import { bindImagePickers, galleryField, imageField } from '../components/image-picker.js';
import { notifyError, notifySuccess } from '../components/toast.js';

const SECTION_LABELS = {
  hero: 'Hero',
  overview: 'Overview',
  highlights: 'Highlights',
  gallery: 'Gallery',
  facts: 'Safari facts',
  itinerary: 'Itinerary',
  accommodation: 'Accommodation',
  lodges: 'Lodges',
  included: 'Included',
  excluded: 'Excluded',
  destination: 'Destination',
  map: 'Map',
  faq: 'FAQ',
  related: 'Related packages',
  booking_cta: 'Booking CTA',
};

const EDITOR = {
  safaris: {
    nav: 'safaris',
    listHref: '#/safaris',
    listLabel: 'All safari packages',
    heading: 'Edit safari',
    empty: emptySafariDocument,
    preview: (id) => `#/safaris/${id}/preview`,
    load: (id) => api.getSafari(id),
    save: (id, doc) => api.saveSafari(id, doc),
    publish: (id) => api.action(id, 'publish'),
    unpublish: (id) => api.action(id, 'unpublish'),
    duplicate: (id) => api.action(id, 'duplicate'),
    archive: (id) => api.action(id, 'archive'),
    groupFields: false,
    saved: 'Safari draft saved.',
    published: 'Safari published to the website.',
  },
  departures: {
    nav: 'departures',
    listHref: '#/departures',
    listLabel: 'All group safaris',
    heading: 'Edit group safari',
    empty: emptyGroupSafariDocument,
    preview: (id) => `#/departures/${id}/preview`,
    load: (id) => api.getContent('departures', id),
    save: (id, doc) => api.saveContent('departures', id, doc),
    publish: (id) => api.publishContent('departures', id),
    unpublish: (id) => api.unpublishContent('departures', id),
    duplicate: null,
    archive: null,
    groupFields: true,
    saved: 'Group safari draft saved.',
    published: 'Group safari published to the website.',
  },
};

function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderEditor(user, id, kind = 'safaris') {
  const spec = EDITOR[kind] || EDITOR.safaris;
  return shell(
    user,
    spec.nav,
    `
    <section class="cms-page cms-doc-editor" data-safari-id="${id}" data-editor-kind="${spec.nav}">
      <div class="cms-page-head">
        <div>
          <a class="cms-muted" href="${spec.listHref}">← ${spec.listLabel}</a>
          <h1>${spec.heading}</h1>
          <p class="cms-lead" id="editor-status">Loading…</p>
        </div>
        <div class="cms-dashboard-actions">
          <a class="cms-btn" href="${spec.preview(id)}">Preview</a>
          <button class="cms-btn cms-btn-gold" type="button" data-save>Save draft</button>
          <button class="cms-btn cms-btn-navy" type="button" data-publish>Publish</button>
          <button class="cms-btn" type="button" data-unpublish>Unpublish</button>
          ${spec.duplicate ? '<button class="cms-btn" type="button" data-duplicate>Duplicate</button>' : ''}
          ${spec.archive ? '<button class="cms-btn cms-btn-danger" type="button" data-archive>Archive</button>' : '<button class="cms-btn cms-btn-danger" type="button" data-delete>Delete</button>'}
        </div>
      </div>
      <p class="cms-error" id="editor-error" hidden></p>
      <p class="cms-hint" id="safari-ready"></p>
      <div class="cms-panel" id="editor-fields"></div>
    </section>
  `
  );
}

function lines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function field(label, name, value, type = 'text', hint = '', extra = '') {
  if (type === 'textarea') {
    return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><textarea id="${name}" name="${name}" rows="5">${escapeValue(value)}</textarea>${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
  }
  if (type === 'checkbox') {
    return `<label class="cms-check"><input type="checkbox" name="${name}" ${value ? 'checked' : ''} /> ${label}</label>`;
  }
  return `<div class="cms-field"><label class="cms-label" for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeValue(value)}" ${extra} />${hint ? `<p class="cms-hint">${hint}</p>` : ''}</div>`;
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

function lodgePicker(selected, lodges) {
  const ids = new Set(selected || []);
  const cards = (lodges || [])
    .map((lodge) => {
      const doc = lodge.published || lodge.draft || {};
      const checked = ids.has(lodge.id);
      return `
        <label class="cms-lodge-pick${checked ? ' is-on' : ''}">
          <input type="checkbox" name="lodge_ids" value="${escapeValue(lodge.id)}" ${checked ? 'checked' : ''} />
          <span class="cms-lodge-pick-media">${doc.image ? `<img src="${escapeValue(doc.image)}" alt="" />` : ''}</span>
          <span>
            <strong>${escapeValue(doc.title || lodge.title || 'Lodge')}</strong>
            <small>${lodgeCategoryLabel(doc.category)}${doc.place ? ` · ${escapeValue(doc.place)}` : ''}</small>
          </span>
        </label>`;
    })
    .join('');
  return `<p class="cms-hint">Pick lodges for this itinerary. Their photos appear on the public tour page.</p><div class="cms-lodge-grid">${cards || '<p class="cms-muted">Publish lodges under Accommodations first.</p>'}</div>`;
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
        ${imageField('Day photo', `day.${index}.image`, day.image)}
      </article>`
    )
    .join('');
  return `<p class="cms-hint">Add one itinerary day for each duration day, and give every day a title.</p><button class="cms-btn cms-btn-navy" type="button" data-add-day>Add itinerary day</button>${blocks}`;
}

function renderFields(doc, lodges = [], groupFields = false) {
  return `
    ${
      groupFields
        ? group(
            'Group departure',
            `
      <div class="cms-grid-2">
        ${field('Dates label', 'dates', doc.dates, 'text', 'For example Open 2026–2027 or 12 Feb 2027.')}
        ${field('Spaces', 'spaces', doc.spaces, 'text', 'For example Shared vehicle · lodge nights.')}
      </div>
      <div class="cms-grid-2">
        ${field('Start date', 'start', doc.start, 'text', 'YYYY-MM-DD. Leave blank for an open departure.')}
        ${field('End date', 'end', doc.end, 'text', 'YYYY-MM-DD. Leave blank for an open departure.')}
      </div>
      ${field('Deposit / join label', 'deposit', doc.deposit, 'text', 'For example Join group or 30% deposit.')}
    `,
            true
          )
        : ''
    }
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
        ${field('Duration (days)', 'duration', doc.duration, 'number', 'Must match the number of itinerary days.')}
        ${field('Duration label', 'duration_label', doc.duration_label)}
        ${field('Price per person', 'price_from', doc.price_from, 'number', 'Required. Shown on the website. Based on two travellers sharing unless you set a different minimum.')}
        ${field('Currency', 'currency', doc.currency || 'USD')}
        ${field('Best season', 'best_season', doc.best_season)}
        ${field('Display order', 'display_order', doc.display_order, 'number')}
        ${field('Minimum people', 'minimum_people', doc.minimum_people, 'number')}
        ${field('Maximum people', 'maximum_people', doc.maximum_people, 'number')}
      </div>
      ${field('Featured package', 'featured', doc.featured, 'checkbox')}
    `,
      true
    )}
    ${group(
      'Hero and gallery',
      `
      ${imageField('Hero photo', 'hero_url', doc.hero_image?.url)}
      ${field('Hero alt text', 'hero_alt', doc.hero_image?.alt)}
      ${galleryField('Gallery photos', 'gallery', (doc.gallery || []).map((item) => item.url))}
    `,
      true
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
    ${group('Lodges on this tour', lodgePicker(doc.lodge_ids, lodges), true)}
    ${group('Itinerary', itineraryEditor(doc.itinerary), true)}
    ${group(
      'Search and sharing',
      `
      ${field(
        'SEO title',
        'seo_title',
        doc.seo?.title,
        'text',
        'Google shows about 70 characters. Longer titles are shortened automatically when you save or publish.',
        'maxlength="180"'
      )}
      ${field('SEO description', 'seo_description', doc.seo?.description, 'textarea')}
      ${field('Canonical URL', 'seo_canonical', doc.seo?.canonical)}
      ${imageField('Share photo', 'seo_og_image', doc.seo?.og_image)}
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
    title: safariPackageTitle(form.title?.value),
    slug: form.slug?.value,
    short_description: safariPackageTitle(form.short_description?.value),
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
      title: clampSeoTitle(form.seo_title?.value, form.title?.value),
      description: form.seo_description?.value,
      canonical: form.seo_canonical?.value,
      og_title: clampSeoTitle(form.seo_title?.value, form.title?.value),
      og_description: form.seo_description?.value,
      og_image: form.seo_og_image?.value,
      robots: form.seo_robots?.value,
    },
    itinerary: days,
    lodge_ids: [...form.querySelectorAll('input[name="lodge_ids"]:checked')].map((input) => input.value),
    sections: sections.length ? sections : current.sections,
    dates: form.dates?.value,
    start: form.start?.value,
    end: form.end?.value,
    spaces: form.spaces?.value,
    deposit: form.deposit?.value,
    overview: form.short_description?.value,
    image: form.hero_url?.value,
    product_type: form.dates ? 'join_safari' : current.product_type,
  };
}

function paintReady(doc) {
  const hint = document.querySelector('#safari-ready');
  const save = document.querySelector('[data-save]');
  const publish = document.querySelector('[data-publish]');
  const errors = safariCompletenessErrors(doc);
  if (hint) {
    hint.hidden = false;
    hint.className = errors.length ? 'cms-error' : 'cms-hint';
    hint.textContent = errors.length
      ? errors.join(' ')
      : 'This tour has a price and an itinerary that matches the number of days.';
  }
  if (save) save.disabled = Boolean(errors.length);
  if (publish) publish.disabled = Boolean(errors.length);
}

function requireReady(doc) {
  const errors = safariCompletenessErrors(doc);
  if (errors.length) throw new Error(errors.join(' '));
}

export async function initEditor(id, kind = 'safaris') {
  const spec = EDITOR[kind] || EDITOR.safaris;
  const status = document.querySelector('#editor-status');
  const fields = document.querySelector('#editor-fields');
  const error = document.querySelector('#editor-error');
  let current = spec.empty();
  let record = null;
  let lodgeOptions = [];

  function showError(err) {
    error.hidden = false;
    error.textContent = err.message || String(err);
    notifyError(err.message || String(err));
  }

  function paintForm() {
    fields.innerHTML = `<form id="safari-form">${renderFields(current, lodgeOptions, spec.groupFields)}</form>`;
  }

  async function load() {
    record = await spec.load(id);
    current = spec.empty({ ...record.draft, slug: record.slug });
    try {
      const listed = await api.listContent('lodges');
      lodgeOptions = listed.data || [];
    } catch {
      lodgeOptions = [];
    }
    status.textContent = `${record.status} · ${record.slug}`;
    paintForm();
    const list = document.querySelector('#revision-list');
    if (list) {
      list.innerHTML =
        (record.revisions || [])
          .map((item) => `<li>v${item.version} ${item.action} · ${item.created_by_email || ''} · ${item.created_at?.slice(0, 16)}</li>`)
          .join('') || '<li>No revisions yet</li>';
    }
    paintReady(current);
    bindForm();
  }

  function bindForm() {
    const form = document.querySelector('#safari-form');
    bindImagePickers(form);
    form?.addEventListener('input', () => {
      current = { ...current, ...collect(form, current) };
      paintReady(current);
    });
    form?.addEventListener('change', () => {
      current = { ...current, ...collect(form, current) };
      paintReady(current);
    });

    form?.querySelector('[data-add-day]')?.addEventListener('click', () => {
      current.itinerary = [
        ...(current.itinerary || []),
        { day: `Day ${(current.itinerary?.length || 0) + 1}`, title: '', description: '', activities: [] },
      ];
      paintForm();
      paintReady(current);
      bindForm();
    });

    form?.querySelectorAll('[data-day-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-day-index]')?.dataset.dayIndex);
        current.itinerary = current.itinerary.filter((_, i) => i !== index);
        paintForm();
        paintReady(current);
        bindForm();
      });
    });

    form?.querySelectorAll('[data-day-dup]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.closest('[data-day-index]')?.dataset.dayIndex);
        const copy = { ...current.itinerary[index], id: undefined };
        current.itinerary.splice(index + 1, 0, copy);
        paintForm();
        paintReady(current);
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
        paintForm();
        paintReady(current);
        bindForm();
      });
    });
  }

  document.querySelector('[data-save]')?.addEventListener('click', async () => {
    try {
      const form = document.querySelector('#safari-form');
      current = spec.empty({ ...current, ...collect(form, current) });
      record = await spec.save(id, current);
      current = spec.empty({ ...record.draft, slug: record.slug });
      const live = record.status === 'PUBLISHED';
      status.textContent = live
        ? 'Draft saved · the live page still shows the last published version — click Publish to update it'
        : `Draft saved · ${record.status}`;
      error.hidden = true;
      notifySuccess(live ? `${spec.saved} Click Publish to put the changes live.` : spec.saved);
      if (record.publishWarnings?.length) {
        error.hidden = false;
        error.textContent = `Before publishing: ${record.publishWarnings.join(' ')}`;
      }
      paintReady(current);
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-publish]')?.addEventListener('click', async () => {
    try {
      const form = document.querySelector('#safari-form');
      current = spec.empty({ ...current, ...collect(form, current) });
      requireReady(current);
      await spec.save(id, current);
      record = await spec.publish(id);
      status.textContent = `PUBLISHED · ${record.slug}`;
      notifySuccess(spec.published);
      paintReady(current);
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-unpublish]')?.addEventListener('click', async () => {
    try {
      record = await spec.unpublish(id);
      status.textContent = `UNPUBLISHED · ${record.slug}`;
      notifySuccess('Unpublished.');
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-duplicate]')?.addEventListener('click', async () => {
    try {
      const copy = await spec.duplicate(id);
      notifySuccess('Safari duplicated.');
      window.location.hash = `#/safaris/${copy.id}`;
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-archive]')?.addEventListener('click', async () => {
    try {
      record = await spec.archive(id);
      status.textContent = `ARCHIVED · ${record.slug}`;
      notifySuccess('Safari archived.');
    } catch (err) {
      showError(err);
    }
  });

  document.querySelector('[data-delete]')?.addEventListener('click', async () => {
    try {
      await api.deleteContent('departures', id);
      notifySuccess('Group safari deleted.');
      window.location.hash = '#/departures';
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
