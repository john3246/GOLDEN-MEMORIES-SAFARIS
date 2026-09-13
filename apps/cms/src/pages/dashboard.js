import { api } from '../api/client.js';
import { shell } from './shell.js';
import { apiOrigin, siteHref } from './site.js';

function pill(status) {
  const kind = /confirm/i.test(status)
    ? 'is-live'
    : /pending|draft|new/i.test(status)
      ? 'is-draft'
      : '';
  return `<span class="cms-pill ${kind}">${status || '—'}</span>`;
}

function money(value) {
  const amount = Number(value || 0);
  if (!amount) return '—';
  return `$${amount.toLocaleString('en-US')}`;
}

function when(value) {
  if (!value) return '—';
  return String(value).slice(0, 16).replace('T', ' ');
}

const TYPE_LABELS = {
  safaris: 'Tours',
  pages: 'Pages',
  destinations: 'Destinations',
  posts: 'Blog',
  testimonials: 'Reviews',
  faqs: 'FAQs',
  lodges: 'Lodges',
  departures: 'Join safari',
  menus: 'Menus',
};

export function renderDashboard(user) {
  const first = (user?.name || user?.email || 'there').split(/[@\s]/)[0];
  const nice = first.charAt(0).toUpperCase() + first.slice(1);
  const now = new Date();
  const stamp = now.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return shell(
    user,
    'dashboard',
    `
    <section class="cms-dash">
      <article class="cms-welcome">
        <img class="cms-welcome-bg" src="/images/gallery/serengeti-01.webp" alt="" width="2000" height="900" />
        <div class="cms-welcome-copy">
          <h1>Welcome back, ${nice}!</h1>
          <p>Manage your entire website from one place. Keep content fresh, engage your audience, and grow the safari business.</p>
          <p class="cms-welcome-date">${stamp}</p>
        </div>
      </article>

      <div class="cms-kpi" id="cms-kpi">
        <article><strong id="kpi-tours">—</strong><span>Tours &amp; packages</span></article>
        <article><strong id="kpi-published">—</strong><span>Published content</span></article>
        <article><strong id="kpi-bookings">—</strong><span>Bookings</span></article>
        <article><strong id="kpi-inquiries">—</strong><span>Inquiries</span></article>
        <article><strong id="kpi-customers">—</strong><span>Customers</span></article>
        <article><strong id="kpi-media">—</strong><span>Media files</span></article>
        <article><strong id="kpi-clients">—</strong><span>API clients</span></article>
      </div>

      <div class="cms-dash-main">
        <section class="cms-panel cms-table-card">
          <header><h2>Recent bookings</h2><a href="#/bookings">View all</a></header>
          <div id="dash-bookings" class="cms-table-wrap">Loading…</div>
        </section>
        <section class="cms-panel cms-table-card">
          <header><h2>Latest inquiries</h2><a href="#/inquiries">View all</a></header>
          <div id="dash-inquiries" class="cms-table-wrap">Loading…</div>
        </section>
        <section class="cms-panel cms-quick">
          <header><h2>Quick actions</h2></header>
          <div class="cms-quick-grid">
            <a href="#/safaris">Add new tour</a>
            <a href="#/posts">Create blog post</a>
            <a href="#/pages">Manage pages</a>
            <a href="#/media">Upload media</a>
            <a href="#/bookings">View bookings</a>
            <a href="#/settings">Email &amp; site settings</a>
            <a href="#/inquiries">Inquiries</a>
            <a href="${apiOrigin()}/api/v1/docs" target="_blank" rel="noreferrer">API documentation</a>
          </div>
        </section>
      </div>

      <div class="cms-dash-mid">
        <section class="cms-panel">
          <header><h2>Content overview</h2></header>
          <div id="dash-chart" class="cms-bars">Loading…</div>
        </section>
        <section class="cms-panel">
          <header><h2>Latest media</h2><a href="#/media">View all</a></header>
          <div id="dash-media" class="cms-media-mini">Loading…</div>
        </section>
        <section class="cms-panel cms-status-card">
          <header><h2>Website status</h2></header>
          <div id="dash-status">Loading…</div>
        </section>
      </div>

      <div class="cms-dash-bottom">
        <section class="cms-panel cms-table-card">
          <header><h2>Upcoming bookings</h2><a href="#/bookings">View all</a></header>
          <div id="dash-upcoming" class="cms-table-wrap">Loading…</div>
        </section>
        <section class="cms-panel cms-table-card">
          <header><h2>Draft content needing review</h2><a href="#/pages">View all</a></header>
          <div id="dash-drafts" class="cms-table-wrap">Loading…</div>
        </section>
      </div>
      <p class="cms-error" id="cms-dash-error" hidden></p>
    </section>
  `
  );
}

export async function initDashboard() {
  const error = document.querySelector('#cms-dash-error');
  try {
    const { data } = await api.overview();
    const stats = data.stats || {};
    const set = (id, value) => {
      const node = document.querySelector(id);
      if (node) node.textContent = String(value ?? 0);
    };
    set('#kpi-tours', stats.tours);
    set('#kpi-published', stats.published);
    set('#kpi-bookings', stats.bookings);
    set('#kpi-inquiries', stats.inquiries);
    set('#kpi-customers', stats.customers);
    set('#kpi-media', stats.media);
    set('#kpi-clients', stats.apiClients);

    const bookings = document.querySelector('#dash-bookings');
    if ((data.recentBookings || []).length) {
      bookings.innerHTML = `<table class="cms-table"><thead><tr><th>ID</th><th>Guest</th><th>Tour</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead><tbody>${data.recentBookings
        .map(
          (row) =>
            `<tr><td>${row.code || row.id.slice(0, 8)}</td><td>${row.customerName}</td><td>${row.safariTitle}</td><td>${row.travelDate || '—'}</td><td>${pill(row.status)}</td><td>${money(row.amount)}</td></tr>`
        )
        .join('')}</tbody></table>`;
    } else if ((data.recentSafaris || []).length) {
      bookings.innerHTML = `<table class="cms-table"><thead><tr><th>Tour package</th><th>Status</th><th>Updated</th></tr></thead><tbody>${data.recentSafaris
        .map(
          (row) =>
            `<tr><td><a href="#/safaris/${row.id}">${row.title}</a></td><td>${pill(row.status)}</td><td>${when(row.updated_at)}</td></tr>`
        )
        .join('')}</tbody></table>`;
    } else {
      bookings.innerHTML = '<p class="cms-muted">No bookings yet. Create one from Operations → Bookings.</p>';
    }

    const inquiries = document.querySelector('#dash-inquiries');
    inquiries.innerHTML = (data.recentInquiries || []).length
      ? `<table class="cms-table"><thead><tr><th>Name</th><th>Subject</th><th>Date</th><th>Status</th></tr></thead><tbody>${data.recentInquiries
          .map(
            (row) =>
              `<tr><td>${row.name}</td><td>${row.subject || 'Inquiry'}</td><td>${when(row.created_at)}</td><td>${pill(row.status)}</td></tr>`
          )
          .join('')}</tbody></table>`
      : '<p class="cms-muted">No inquiries yet. The public contact form writes them here.</p>';

    const chart = document.querySelector('#dash-chart');
    const byType = data.contentByType || {};
    const bars = Object.entries(byType)
      .map(([key, value]) => {
        const max = Math.max(1, ...Object.values(byType).map((item) => item.total || 0));
        const width = Math.round(((value.total || 0) / max) * 100);
        return `<div class="cms-bar"><span>${TYPE_LABELS[key] || key}</span><i style="width:${width}%"></i><em>${value.published}/${value.total}</em></div>`;
      })
      .join('');
    chart.innerHTML = bars || '<p class="cms-muted">Publish pages, posts, and destinations to fill this chart.</p>';

    const media = document.querySelector('#dash-media');
    media.innerHTML = (data.latestMedia || []).length
      ? data.latestMedia
          .slice(0, 4)
          .map((item) => `<figure><img src="${item.url || item.storagePath || ''}" alt="${item.alt || ''}" /><figcaption>${item.alt || item.filename || 'Media'}</figcaption></figure>`)
          .join('')
      : '<p class="cms-muted">Upload photos in the media library.</p>';

    const status = document.querySelector('#dash-status');
    const live = data.settings?.websiteLive !== false;
    status.innerHTML = `
      <p class="cms-pill ${live ? 'is-live' : 'is-draft'}">${live ? 'Website online' : 'Website paused'}</p>
      <p class="cms-muted">Published safari packages: ${stats.tours || 0}</p>
      <p class="cms-muted">Published site content: ${stats.published || 0}</p>
      <a class="cms-btn cms-btn-navy" href="${siteHref('/')}" target="_blank" rel="noreferrer">View live website</a>
    `;

    const upcoming = document.querySelector('#dash-upcoming');
    upcoming.innerHTML = (data.upcomingBookings || []).length
      ? `<table class="cms-table"><thead><tr><th>Date</th><th>Guest</th><th>Tour</th><th>Status</th></tr></thead><tbody>${data.upcomingBookings
          .map(
            (row) =>
              `<tr><td>${row.travelDate || '—'}</td><td>${row.customerName}</td><td>${row.safariTitle}</td><td>${pill(row.status)}</td></tr>`
          )
          .join('')}</tbody></table>`
      : '<p class="cms-muted">No upcoming travel dates recorded.</p>';

    const drafts = document.querySelector('#dash-drafts');
    drafts.innerHTML = (data.drafts || []).length
      ? `<table class="cms-table"><thead><tr><th>Title</th><th>Type</th><th>Updated</th><th>Status</th></tr></thead><tbody>${data.drafts
          .map(
            (row) =>
              `<tr><td><a href="${row.href}">${row.title}</a></td><td>${row.type}</td><td>${when(row.updated_at)}</td><td>${pill(row.status)}</td></tr>`
          )
          .join('')}</tbody></table>`
      : '<p class="cms-muted">Everything published is live.</p>';
  } catch (err) {
    if (error) {
      error.hidden = false;
      error.textContent = err.message;
    }
  }
}
