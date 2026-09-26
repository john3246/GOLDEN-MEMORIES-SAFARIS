import { api } from '../api/client.js';
import { shell } from './shell.js';
import { esc, safeUrl } from '../components/escape.js';
import { notifyError, notifySuccess } from '../components/toast.js';
import { isStaffAdmin } from '../auth/roles.js';

const SOURCE_LABELS = { google: 'Google', tripadvisor: 'TripAdvisor', safaribookings: 'SafariBookings', website: 'Website' };

function stars(rating) {
  const n = Math.round(Number(rating) || 0);
  return `<span class="cms-stars" aria-label="${n} out of 5">${'★'.repeat(n)}${'☆'.repeat(Math.max(0, 5 - n))}</span>`;
}

export function renderReviews(user) {
  const admin = isStaffAdmin(user);
  return shell(
    user,
    'reviews',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Content</p>
          <h1>Guest reviews</h1>
          <p class="cms-lead">Reviews from Google, TripAdvisor and SafariBookings in one place. Google and TripAdvisor import automatically every 12 hours once connected; SafariBookings reviews are pasted in. Hide any review you do not want on the website, or feature your favourites.</p>
        </div>
        <button class="cms-btn cms-btn-gold" type="button" data-sync>Import now</button>
      </div>
      <p class="cms-error" id="reviews-error" hidden></p>
      <div id="reviews-summary" class="cms-kpi"></div>

      ${
        admin
          ? `<details class="cms-panel" id="reviews-sources">
        <summary><strong>Connect review sources</strong></summary>
        <form id="reviews-settings" class="cms-form-stack" style="margin-top:1rem"></form>
      </details>`
          : ''
      }

      <details class="cms-panel">
        <summary><strong>Paste reviews (SafariBookings or any source)</strong></summary>
        <form id="reviews-import" class="cms-form-stack" style="margin-top:1rem">
          <div class="cms-grid-2">
            <div class="cms-field">
              <label class="cms-label" for="import-source">Source</label>
              <select id="import-source" name="source">
                <option value="safaribookings">SafariBookings</option>
                <option value="tripadvisor">TripAdvisor</option>
                <option value="google">Google</option>
                <option value="website">Website / email</option>
              </select>
            </div>
          </div>
          <div class="cms-field">
            <label class="cms-label" for="import-text">One review per line: Name | Country | Rating (1–5) | Date | Title | Review text</label>
            <textarea id="import-text" name="text" rows="6" placeholder="Sarah M | United Kingdom | 5 | 2026-08-14 | Unforgettable Serengeti trip | Our guide Joseph found a leopard on day one…"></textarea>
          </div>
          <button class="cms-btn cms-btn-navy" type="submit">Import reviews</button>
        </form>
      </details>

      <div class="cms-toolbar" style="margin:1rem 0">
        <select id="reviews-filter">
          <option value="">All sources</option>
          <option value="google">Google</option>
          <option value="tripadvisor">TripAdvisor</option>
          <option value="safaribookings">SafariBookings</option>
          <option value="website">Website</option>
        </select>
        <select id="reviews-status">
          <option value="">Shown and hidden</option>
          <option value="published">Shown on website</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      <div id="reviews-list" class="cms-package-list">Loading…</div>
    </section>
  `
  );
}

export async function initReviews() {
  const error = document.querySelector('#reviews-error');
  const list = document.querySelector('#reviews-list');
  const summaryEl = document.querySelector('#reviews-summary');
  let data = { reviews: [], summary: {}, settings: {}, sourceStatus: {} };

  function fail(err) {
    error.hidden = false;
    error.textContent = err.message;
    notifyError(err.message);
  }

  function paintSummary() {
    const sources = data.summary?.sources || {};
    const cards = Object.entries(sources).map(
      ([key, row]) =>
        `<article><strong>${row.rating ? Number(row.rating).toFixed(1) : '—'}</strong><span>${esc(SOURCE_LABELS[key] || key)} · ${Number(row.count || 0)} reviews${row.url ? ` · <a href="${safeUrl(row.url)}" target="_blank" rel="noopener">profile</a>` : ''}</span></article>`
    );
    const overall = data.summary?.overall
      ? `<article><strong>${Number(data.summary.overall).toFixed(1)}</strong><span>Overall · ${Number(data.summary.totalCount || 0)} reviews</span></article>`
      : '';
    const errors = Object.entries(data.sourceStatus || {})
      .filter(([, row]) => row?.error)
      .map(([key, row]) => `<article class="is-error"><strong>!</strong><span>${esc(SOURCE_LABELS[key] || key)}: ${esc(row.error)}</span></article>`);
    summaryEl.innerHTML = [overall, ...cards, ...errors].join('') || '<p class="cms-muted">No review sources connected yet.</p>';
  }

  function paintSettings() {
    const form = document.querySelector('#reviews-settings');
    if (!form) return;
    const s = data.settings || {};
    const g = s.google || {};
    const t = s.tripadvisor || {};
    const sb = s.safaribookings || {};
    form.innerHTML = `
      <h3>Google Business Profile</h3>
      <p class="cms-hint">Needs a Google Cloud API key with <em>Places API (New)</em> enabled, and your Place ID (find it with Google's "Place ID finder"). Google returns the overall rating and up to 5 reviews.</p>
      <label class="cms-check"><input type="checkbox" name="g_enabled" ${g.enabled ? 'checked' : ''}/> Import Google reviews</label>
      <div class="cms-grid-2">
        <div class="cms-field"><label class="cms-label">Place ID</label><input name="g_placeId" value="${esc(g.placeId)}" placeholder="ChIJ…" /></div>
        <div class="cms-field"><label class="cms-label">API key</label><input name="g_apiKey" type="password" autocomplete="off" value="${esc(g.apiKey)}" placeholder="AIza…" /></div>
        <div class="cms-field"><label class="cms-label">Google profile link (optional)</label><input name="g_profileUrl" value="${esc(g.profileUrl)}" placeholder="https://g.page/…" /></div>
      </div>
      <h3>TripAdvisor</h3>
      <p class="cms-hint">Needs a TripAdvisor Content API key (request one at tripadvisor.com/developers) and your location ID — the number after "-d" in your TripAdvisor page address. Add your website domain in the key's allowed domains.</p>
      <label class="cms-check"><input type="checkbox" name="t_enabled" ${t.enabled ? 'checked' : ''}/> Import TripAdvisor reviews</label>
      <div class="cms-grid-2">
        <div class="cms-field"><label class="cms-label">Location ID</label><input name="t_locationId" value="${esc(t.locationId)}" placeholder="12345678" /></div>
        <div class="cms-field"><label class="cms-label">API key</label><input name="t_apiKey" type="password" autocomplete="off" value="${esc(t.apiKey)}" /></div>
        <div class="cms-field"><label class="cms-label">TripAdvisor page link</label><input name="t_profileUrl" value="${esc(t.profileUrl)}" placeholder="https://www.tripadvisor.com/Attraction_Review-…" /></div>
      </div>
      <h3>SafariBookings</h3>
      <p class="cms-hint">SafariBookings has no public API. Paste new reviews using the box below and keep the overall score here up to date.</p>
      <div class="cms-grid-2">
        <div class="cms-field"><label class="cms-label">Profile link</label><input name="sb_profileUrl" value="${esc(sb.profileUrl)}" placeholder="https://www.safaribookings.com/reviews/p…" /></div>
        <div class="cms-field"><label class="cms-label">Overall rating (e.g. 4.9)</label><input name="sb_rating" value="${esc(sb.rating)}" inputmode="decimal" /></div>
        <div class="cms-field"><label class="cms-label">Number of reviews</label><input name="sb_count" value="${esc(sb.count)}" inputmode="numeric" /></div>
      </div>
      <h3>Moderation</h3>
      <label class="cms-check"><input type="checkbox" name="autoPublish" ${s.autoPublish !== false ? 'checked' : ''}/> Show new imported reviews on the website automatically</label>
      <div class="cms-field" style="max-width:240px"><label class="cms-label">…only when the rating is at least</label><input name="minRatingToPublish" value="${esc(s.minRatingToPublish ?? 4)}" inputmode="decimal" /></div>
      <button class="cms-btn cms-btn-navy" type="submit">Save review sources</button>`;
  }

  function paintList() {
    const source = document.querySelector('#reviews-filter')?.value || '';
    const status = document.querySelector('#reviews-status')?.value || '';
    const rows = (data.reviews || []).filter((row) => (!source || row.source === source) && (!status || row.status === status));
    list.innerHTML = rows.length
      ? rows
          .map(
            (row) => `
        <article class="cms-package-card${row.status === 'hidden' ? ' is-muted' : ''}" data-review-id="${esc(row.id)}">
          <p class="cms-meta-row"><span class="cms-pill">${esc(SOURCE_LABELS[row.source] || row.source)}</span>${stars(row.rating)}<span>${esc(String(row.date || '').slice(0, 10))}</span>${row.featured ? '<span class="cms-pill is-live">Featured</span>' : ''}${row.status === 'hidden' ? '<span class="cms-pill is-draft">Hidden</span>' : ''}</p>
          <h3>${esc(row.title || row.author)}</h3>
          <p>${esc(row.text).slice(0, 600)}</p>
          <p class="cms-muted">— ${esc(row.author)}${row.country ? `, ${esc(row.country)}` : ''}${row.url ? ` · <a href="${safeUrl(row.url)}" target="_blank" rel="noopener">original</a>` : ''}</p>
          <div class="cms-editor-actions">
            <button class="cms-btn" type="button" data-toggle-status>${row.status === 'hidden' ? 'Show on website' : 'Hide'}</button>
            <button class="cms-btn" type="button" data-toggle-featured>${row.featured ? 'Unfeature' : 'Feature'}</button>
            <button class="cms-btn cms-btn-danger" type="button" data-delete>Delete</button>
          </div>
        </article>`
          )
          .join('')
      : '<p class="cms-muted">No reviews yet. Connect Google or TripAdvisor above, or paste reviews.</p>';
  }

  async function refresh() {
    error.hidden = true;
    data = await api.reviewsAdmin();
    paintSummary();
    paintSettings();
    paintList();
  }

  document.querySelector('#reviews-filter')?.addEventListener('change', paintList);
  document.querySelector('#reviews-status')?.addEventListener('change', paintList);

  document.querySelector('[data-sync]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Importing…';
    try {
      const results = await api.syncReviews();
      if (!results.length) notifyError('No sources are switched on. Connect Google or TripAdvisor first.');
      for (const row of results) {
        if (row.error) notifyError(`${SOURCE_LABELS[row.source]}: ${row.error}`);
        else notifySuccess(`${SOURCE_LABELS[row.source]}: ${row.added} new, ${row.updated} updated.`);
      }
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      button.disabled = false;
      button.textContent = 'Import now';
    }
  });

  document.querySelector('#reviews-sources')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const f = new FormData(event.target);
    try {
      await api.saveReviewSettings({
        autoPublish: f.get('autoPublish') === 'on',
        minRatingToPublish: f.get('minRatingToPublish'),
        google: { enabled: f.get('g_enabled') === 'on', placeId: f.get('g_placeId'), apiKey: f.get('g_apiKey'), profileUrl: f.get('g_profileUrl') },
        tripadvisor: { enabled: f.get('t_enabled') === 'on', locationId: f.get('t_locationId'), apiKey: f.get('t_apiKey'), profileUrl: f.get('t_profileUrl') },
        safaribookings: { profileUrl: f.get('sb_profileUrl'), rating: f.get('sb_rating'), count: f.get('sb_count') },
      });
      notifySuccess('Review sources saved.');
      await refresh();
    } catch (err) {
      fail(err);
    }
  });

  document.querySelector('#reviews-import')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const f = new FormData(event.target);
    try {
      const result = await api.importReviews({ source: f.get('source'), text: f.get('text') });
      notifySuccess(`${result.added} review(s) added, ${result.updated} updated.`);
      event.target.reset();
      await refresh();
    } catch (err) {
      fail(err);
    }
  });

  list.addEventListener('click', async (event) => {
    const card = event.target.closest('[data-review-id]');
    if (!card) return;
    const id = card.getAttribute('data-review-id');
    const row = data.reviews.find((item) => item.id === id);
    try {
      if (event.target.closest('[data-toggle-status]')) {
        await api.updateReview(id, { status: row.status === 'hidden' ? 'published' : 'hidden' });
      } else if (event.target.closest('[data-toggle-featured]')) {
        await api.updateReview(id, { featured: !row.featured });
      } else if (event.target.closest('[data-delete]')) {
        if (!window.confirm('Delete this review from the CMS? (It stays on the original site.)')) return;
        await api.deleteReview(id);
      } else {
        return;
      }
      await refresh();
    } catch (err) {
      fail(err);
    }
  });

  try {
    await refresh();
  } catch (err) {
    fail(err);
  }
}
