import { api } from '../api/client.js';
import { shell } from './shell.js';
import {
  BLOG_ORDER,
  blogCategory,
  cardImage,
  categoryOptions,
  destinationCategory,
  DESTINATION_ORDER,
  groupedSections,
  photoCard,
  pill,
  renderGroupedCards,
  shortText,
} from '../content/cards.js';

function packageCards(type, rows) {
  return `
    <div class="cms-package-list">
      ${rows
        .map(
          (item) => `
        <article class="cms-package-card">
          <h3><a href="#/${type}/${item.id}">${item.title}</a></h3>
          <div>${pill(item.status)}</div>
          <p class="cms-meta-row">
            <span>${item.slug}</span>
            <span>${item.updated_at?.slice(0, 16)?.replace('T', ' ') || ''}</span>
          </p>
        </article>`
        )
        .join('')}
    </div>`;
}

function destinationCard(item) {
  const doc = item.draft || item.published || {};
  return photoCard({
    href: `#/destinations/${item.id}`,
    title: item.title,
    image: cardImage(doc.image),
    kicker: destinationCategory(item, doc),
    detail: shortText(doc.blurb),
    status: item.status,
  });
}

function blogCard(item) {
  const doc = item.draft || item.published || {};
  return photoCard({
    href: `#/posts/${item.id}`,
    title: item.title,
    image: cardImage(doc.image),
    kicker: blogCategory(item, doc),
    detail: shortText(doc.excerpt || doc.date),
    status: item.status,
  });
}

function photoSections(type, rows, selected) {
  const getCategory =
    type === 'destinations'
      ? (item) => destinationCategory(item, item.draft || item.published || {})
      : (item) => blogCategory(item, item.draft || item.published || {});
  const order = type === 'destinations' ? DESTINATION_ORDER : BLOG_ORDER;
  const renderItem = type === 'destinations' ? destinationCard : blogCard;
  const sections = groupedSections(rows, getCategory, order).filter(([label]) => !selected || label === selected);
  const select = document.querySelector('#filter-category');
  if (select) {
    const options = categoryOptions(groupedSections(rows, getCategory, order));
    const current = select.value;
    select.innerHTML = `<option value="">All categories</option>${options
      .map((item) => `<option value="${item.label}">${item.label} (${item.count})</option>`)
      .join('')}`;
    if (current && options.some((item) => item.label === current)) select.value = current;
  }
  return renderGroupedCards(sections, renderItem);
}

export function renderContentList(user, spec) {
  const photo = spec.key === 'destinations' || spec.key === 'posts';
  return shell(
    user,
    spec.key,
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Content</p>
          <h1>${spec.label}</h1>
          <p class="cms-lead">Edit drafts, then publish so the public website updates. Same workflow as safari packages.</p>
        </div>
        <button class="cms-btn cms-btn-gold" type="button" data-create>${spec.createTitle}</button>
      </div>
      <div class="cms-filters cms-panel">
        <div class="cms-field">
          <label class="cms-label" for="filter-q">Search</label>
          <input id="filter-q" placeholder="Title or slug" />
        </div>
        <div class="cms-field">
          <label class="cms-label" for="filter-status">Status</label>
          <select id="filter-status">
            <option value="">All statuses</option>
            <option>DRAFT</option>
            <option>PUBLISHED</option>
            <option>UNPUBLISHED</option>
            <option>ARCHIVED</option>
          </select>
        </div>
        ${
          photo
            ? `<div class="cms-field">
          <label class="cms-label" for="filter-category">Category</label>
          <select id="filter-category">
            <option value="">All categories</option>
          </select>
        </div>`
            : ''
        }
        <button class="cms-btn cms-btn-navy" type="button" data-refresh>Apply</button>
      </div>
      <div id="content-table">Loading…</div>
    </section>
  `
  );
}

export function initContentList(type) {
  const mount = document.querySelector('#content-table');
  const saved = sessionStorage.getItem('gm_cms_search');
  if (saved) {
    const input = document.querySelector('#filter-q');
    if (input) input.value = saved;
    sessionStorage.removeItem('gm_cms_search');
  }

  async function refresh() {
    try {
      const result = await api.listContent(type, {
        q: document.querySelector('#filter-q')?.value,
        status: document.querySelector('#filter-status')?.value,
      });
      if (!result.data.length) {
        mount.innerHTML = '<p class="cms-muted">Nothing here yet. Create the first item and publish it to the website.</p>';
        return;
      }
      const selected = document.querySelector('#filter-category')?.value || '';
      const body =
        type === 'destinations' || type === 'posts'
          ? photoSections(type, result.data, selected)
          : packageCards(type, result.data);
      mount.innerHTML = `
        ${body}
        <p class="cms-muted" style="margin-top:1rem">${result.meta?.total ?? result.data.length} items</p>
      `;
    } catch (err) {
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  }

  document.querySelector('[data-refresh]')?.addEventListener('click', refresh);
  document.querySelector('#filter-category')?.addEventListener('change', refresh);
  document.querySelector('[data-create]')?.addEventListener('click', async () => {
    try {
      const created = await api.createContent(type, { title: 'Untitled' });
      window.location.hash = `#/${type}/${created.id}`;
    } catch (err) {
      mount.innerHTML = `<p class="cms-error">${err.message}</p>`;
    }
  });
  refresh();
}
