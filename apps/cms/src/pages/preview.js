import {
  emptySafariDocument,
  initBlogArticle,
  normalizeBlogDocument,
  normalizeDestinationDocument,
  renderBlogPage,
  renderDestinationBlocks,
  renderSafariPage,
} from '@gm-safaris/safari-ui';
import { lodgeCategoryLabel } from '@gm-safaris/shared-types';
import { api } from '../api/client.js';
import { shell } from './shell.js';

function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function publicUrl(type, slug) {
  if (type === 'safaris') return `gmsafaris.com/tours/${slug || 'preview'}/`;
  if (type === 'posts') return `gmsafaris.com/blog/${slug || 'preview'}/`;
  if (type === 'destinations') return `gmsafaris.com/destinations/${slug || 'preview'}/`;
  if (type === 'lodges') return `gmsafaris.com/accommodations/`;
  if (type === 'departures') return `gmsafaris.com/join-safari/`;
  if (type === 'pages') return `gmsafaris.com/${slug || ''}/`;
  return `gmsafaris.com/`;
}

function listPreview(type, id) {
  if (type === 'safaris') return '#/safaris';
  return `#/${type}`;
}

function editHref(type, id) {
  if (type === 'safaris') return `#/safaris/${id}`;
  return `#/${type}/${id}`;
}

function galleryUrls(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split('\n');
  return list
    .map((item) => (typeof item === 'string' ? item : item?.url || ''))
    .map((item) => item.trim())
    .filter(Boolean);
}

function destinationHtml(doc) {
  const body =
    renderDestinationBlocks(doc.blocks) ||
    (doc.paragraphs || '')
      .split('\n')
      .filter(Boolean)
      .map((item) => `<p class="mt-5">${escapeValue(item)}</p>`)
      .join('');
  return `
    <article class="dest-cms-preview-page">
      <p class="section-kicker">${escapeValue(doc.kicker || doc.region || 'Destination')}</p>
      <h1 class="section-title">${escapeValue(doc.title || 'Untitled destination')}</h1>
      <p>${escapeValue(doc.tagline || doc.blurb || '')}</p>
      ${doc.image ? `<img src="${escapeValue(doc.image)}" alt="" />` : ''}
      <div class="dest-cms-body">${body || '<p class="cms-muted">Add paragraphs, images, or tables to fill this page.</p>'}</div>
    </article>
  `;
}

function genericHtml(type, doc) {
  const cover = doc.hero_image?.url || doc.image || '';
  const gallery = galleryUrls(doc.gallery);
  const body = doc.body || doc.quote || doc.overview || doc.answer || doc.blurb || doc.excerpt || '';
  const kicker =
    type === 'lodges'
      ? lodgeCategoryLabel(doc.category) || 'Accommodation'
      : type === 'faqs'
        ? doc.group || 'FAQ'
        : type === 'testimonials'
          ? doc.detail || 'Guest review'
          : type;
  return `
    <article class="cms-generic-preview">
      <p class="section-kicker">${escapeValue(kicker)}</p>
      <h1 class="section-title">${escapeValue(doc.title || 'Untitled')}</h1>
      ${body ? `<p class="mt-4">${escapeValue(body)}</p>` : ''}
      ${cover ? `<img class="cms-generic-preview-cover" src="${escapeValue(cover)}" alt="" />` : ''}
      ${
        gallery.length
          ? `<div class="cms-generic-preview-grid">${gallery
              .map((url) => `<img src="${escapeValue(url)}" alt="" />`)
              .join('')}</div>`
          : ''
      }
    </article>
  `;
}

export function renderPreview(user, type, id) {
  const nav = type === 'safaris' ? 'safaris' : type;
  return shell(
    user,
    nav,
    `
    <section class="cms-preview-page">
      <header class="cms-preview-toolbar">
        <div>
          <a class="cms-muted" href="${editHref(type, id)}">← Edit</a>
          <p class="cms-preview-kicker">Preview</p>
          <p class="cms-preview-hint" id="preview-status">Loading…</p>
        </div>
        <div class="cms-editor-actions">
          <a class="cms-btn" href="${listPreview(type, id)}">Back to list</a>
          <div class="cms-vp-switch" role="group" aria-label="Preview width">
            <button class="is-active" type="button" data-vp="desktop">Desktop</button>
            <button type="button" data-vp="tablet">Tablet</button>
            <button type="button" data-vp="mobile">Phone</button>
          </div>
        </div>
      </header>
      <div class="cms-preview-stage">
        <div class="cms-preview-browser is-desktop">
          <div class="cms-preview-chrome" aria-hidden="true">
            <span class="cms-preview-dots"><i></i><i></i><i></i></span>
            <div class="cms-preview-address" id="preview-url">gmsafaris.com/</div>
          </div>
          <div class="cms-preview-frame" id="cms-preview-frame"></div>
        </div>
      </div>
    </section>
  `
  );
}

export async function initPreview(type, id) {
  const frame = document.querySelector('#cms-preview-frame');
  const status = document.querySelector('#preview-status');
  const url = document.querySelector('#preview-url');

  document.querySelectorAll('[data-vp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const browser = document.querySelector('.cms-preview-browser');
      browser?.classList.remove('is-desktop', 'is-tablet', 'is-mobile');
      browser?.classList.add(`is-${btn.dataset.vp}`);
      document.querySelectorAll('[data-vp]').forEach((item) => item.classList.toggle('is-active', item === btn));
    });
  });

  try {
    let record;
    let html = '';
    let slug = '';
    if (type === 'safaris') {
      record = await api.getSafari(id);
      const doc = { ...emptySafariDocument(), ...(record.draft || {}), slug: record.slug };
      html = renderSafariPage(doc, { editable: false, breadcrumb: true });
      slug = doc.slug;
    } else if (type === 'posts') {
      record = await api.getContent('posts', id);
      const doc = normalizeBlogDocument({ ...(record.draft || {}), slug: record.slug });
      const [safariResult, lodgeResult] = await Promise.all([
        api.listSafaris({ limit: 200 }).catch(() => ({ data: [] })),
        api.listContent('lodges').catch(() => ({ data: [] })),
      ]);
      const tours = new Map((safariResult.data || []).map((item) => [item.slug || item.id, item]));
      const lodges = new Map((lodgeResult.data || []).map((item) => [item.id, item]));
      const tourHtml = (key) => {
        const item = tours.get(key);
        if (!item) return '';
        return `<article class="tour-card border border-ink/10 p-3"><p class="font-body text-xs uppercase tracking-[0.12em] text-black/60">${escapeValue(item.duration_label || 'Safari')}</p><h3 class="mt-2 font-display text-lg"><a href="/tours/${escapeValue(item.slug || '')}/">${escapeValue(item.title)}</a></h3><a class="card-link mt-3 inline-block" href="/tours/${escapeValue(item.slug || '')}/">View package</a></article>`;
      };
      const lodgeHtml = (key) => {
        const item = lodges.get(key);
        const lodge = item?.published || item?.draft || {};
        if (!lodge.title && !item) return '';
        return `<article class="tour-card border border-ink/10 p-3"><h3 class="font-display text-lg">${escapeValue(lodge.title || 'Lodge')}</h3><p class="text-sm text-ink/70">${escapeValue(lodge.place || '')}</p></article>`;
      };
      html = renderBlogPage(doc, {
        editable: false,
        embedTour: tourHtml,
        embedLodge: lodgeHtml,
        featuredToursHtml: (doc.featured_tour_slugs || []).map(tourHtml).join(''),
        featuredLodgesHtml: (doc.featured_lodge_ids || []).map(lodgeHtml).join(''),
      });
      slug = doc.slug;
    } else if (type === 'destinations') {
      record = await api.getContent('destinations', id);
      const doc = normalizeDestinationDocument({ ...(record.draft || {}), slug: record.slug });
      html = destinationHtml(doc);
      slug = doc.slug;
    } else {
      record = await api.getContent(type, id);
      const doc = { ...(record.draft || {}), slug: record.slug, title: record.title || record.draft?.title };
      html = genericHtml(type, doc);
      slug = record.slug;
    }
    if (frame) frame.innerHTML = html;
    if (type === 'posts') initBlogArticle(frame || document);
    if (url) url.textContent = publicUrl(type, slug);
    if (status) status.textContent = `${record.status || 'DRAFT'} · ${slug || id}`;
  } catch (err) {
    if (frame) frame.innerHTML = `<p class="cms-error">${escapeValue(err.message || err)}</p>`;
    if (status) status.textContent = 'Preview failed';
  }
}
