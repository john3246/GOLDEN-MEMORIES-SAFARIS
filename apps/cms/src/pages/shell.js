import { isStaffAdmin } from '../auth/roles.js';
import { api } from '../api/client.js';
import { esc } from '../components/escape.js';

let escapeBound = false;

function item(href, label, current, extra = '') {
  const key = href.replace(/^#\//, '').split('/')[0] || 'dashboard';
  const active = current === extra || current === key || (extra && current.startsWith(extra));
  return `<a class="cms-side-link${active ? ' is-active' : ''}" href="${href}">${label}</a>`;
}

function group(title, inner) {
  return `<p class="cms-side-kicker">${title}</p>${inner}`;
}

export function shell(user, current, inner) {
  const admin = isStaffAdmin(user);
  const name = user?.name || (user?.email || 'Staff').split('@')[0];
  return `
    <div class="cms-app">
      <div class="cms-nav-backdrop" data-cms-nav-close></div>
      <aside class="cms-sidebar" id="cms-sidebar">
        <div class="cms-side-head">
          <a class="cms-side-brand" href="#/dashboard" aria-label="Golden Memories Safaris CMS">
            <img src="/images/logo.webp" alt="Golden Memories Safaris" width="200" height="72" />
          </a>
          <button class="cms-nav-close" type="button" data-cms-nav-close aria-label="Close menu">Close</button>
        </div>
        <nav class="cms-side-nav">
          ${item('#/dashboard', 'Dashboard', current, 'dashboard')}
          ${group(
            'Content management',
            `
            ${item('#/safaris', 'Tours', current, 'safaris')}
            ${item('#/lodges', 'Accommodations', current, 'lodges')}
            ${item('#/destinations', 'Destinations', current, 'destinations')}
            ${item('#/posts', 'Blog', current, 'posts')}
            ${item('#/pages', 'Pages', current, 'pages')}
            ${item('#/media', 'Media', current, 'media')}
            ${item('#/reviews', 'Guest reviews', current, 'reviews')}
            ${item('#/testimonials', 'Testimonials', current, 'testimonials')}
            ${item('#/faqs', 'FAQs', current, 'faqs')}
            ${item('#/departures', 'Group Safari', current, 'departures')}
            ${item('#/menus', 'Menus', current, 'menus')}
          `
          )}
          ${group(
            'Operations',
            `
            ${item('#/bookings', 'Bookings', current, 'bookings')}
            ${item('#/inquiries', 'Inquiries', current, 'inquiries')}
            ${item('#/customers', 'Customers', current, 'customers')}
          `
          )}
          ${group(
            'System',
            `
            ${admin ? item('#/integrations', 'Integrations & webhooks', current, 'integrations') : ''}
            ${admin ? item('#/api-clients', 'API keys', current, 'clients') : ''}
            ${admin ? item('#/users', 'Users & roles', current, 'users') : ''}
            ${admin ? item('#/settings', 'Site settings', current, 'settings') : ''}
            ${admin ? item('#/system', 'System status', current, 'system') : ''}
            ${admin ? item('#/activity', 'Audit log', current, 'activity') : ''}
            ${item('#/profile', 'My profile', current, 'profile')}
          `
          )}
        </nav>
      </aside>
      <div class="cms-frame">
        <header class="cms-topbar">
          <button class="cms-burger" type="button" data-cms-nav aria-label="Open menu" aria-controls="cms-sidebar" aria-expanded="false">☰</button>
          <form class="cms-search" data-cms-search>
            <input name="q" type="search" placeholder="Search anything… (tours, destinations, blog, media, etc.)" />
          </form>
          <div class="cms-bell-wrap">
            <button class="cms-bell" type="button" data-cms-bell aria-label="Notifications" aria-expanded="false">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1Z"/></svg>
              <span class="cms-bell-count" data-cms-bell-count hidden>0</span>
            </button>
            <div class="cms-bell-panel" data-cms-bell-panel hidden></div>
          </div>
          <div class="cms-user">
            <span>
              <strong>${esc(name)}</strong>
              <small>${esc(user?.role || 'Viewer')}</small>
            </span>
            <button class="cms-nav-logout" id="cms-logout" type="button">Sign out</button>
          </div>
        </header>
        <div class="cms-workspace">${inner}</div>
      </div>
    </div>
  `;
}

let bellTimer = null;

function timeAgo(value) {
  const diff = Math.max(0, Date.now() - Date.parse(value || ''));
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

async function refreshBell() {
  const count = document.querySelector('[data-cms-bell-count]');
  const panel = document.querySelector('[data-cms-bell-panel]');
  if (!count || !panel) return;
  try {
    const data = await api.notifications();
    const total = (data.unread || 0) + (data.alerts || []).filter((a) => a.level === 'error').length;
    count.hidden = !total;
    count.textContent = total > 99 ? '99+' : String(total);
    const alerts = (data.alerts || [])
      .map(
        (a) =>
          `<a class="cms-bell-item is-${esc(a.level)}" href="${esc(a.link || '#/system')}"><strong>${esc(a.title)}</strong><span>${esc(a.body || '')}</span></a>`
      )
      .join('');
    const items = (data.items || [])
      .map(
        (n) =>
          `<a class="cms-bell-item${n.unread ? ' is-unread' : ''}" href="${esc(n.link || '#/dashboard')}" data-note-id="${esc(n.id)}"><strong>${esc(n.title)}</strong><span>${esc(n.body || '')} · ${esc(timeAgo(n.created_at))}</span></a>`
      )
      .join('');
    panel.innerHTML = `
      <header><strong>Notifications</strong>${data.unread ? '<button type="button" class="cms-link" data-cms-read-all>Mark all read</button>' : ''}</header>
      <p class="cms-bell-counts"><a href="#/inquiries">${Number(data.counts?.newInquiries || 0)} new inquiries</a> · <a href="#/bookings">${Number(data.counts?.pendingBookings || 0)} pending bookings</a></p>
      ${alerts}
      ${items || '<p class="cms-muted" style="padding:0.75rem 1rem">No notifications yet.</p>'}`;
  } catch {
    /* offline or signed out — the next API call handles it */
  }
}

export function initShell() {
  const bell = document.querySelector('[data-cms-bell]');
  const bellPanel = document.querySelector('[data-cms-bell-panel]');
  bell?.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = bellPanel.hidden;
    bellPanel.hidden = !open;
    bell.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) refreshBell();
  });
  bellPanel?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-cms-read-all]')) {
      event.preventDefault();
      await api.markNotificationsRead([]);
      refreshBell();
      return;
    }
    const note = event.target.closest('[data-note-id]');
    if (note) {
      api.markNotificationsRead([note.getAttribute('data-note-id')]).catch(() => undefined);
      bellPanel.hidden = true;
    }
  });
  document.addEventListener('click', (event) => {
    if (bellPanel && !bellPanel.hidden && !event.target.closest('.cms-bell-wrap')) bellPanel.hidden = true;
  });
  refreshBell();
  if (bellTimer) window.clearInterval(bellTimer);
  bellTimer = window.setInterval(refreshBell, 60_000);

  const app = document.querySelector('.cms-app');
  const toggle = document.querySelector('[data-cms-nav]');

  function setNav(open) {
    app?.classList.toggle('is-nav-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (toggle) toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle?.addEventListener('click', () => setNav(!app?.classList.contains('is-nav-open')));
  app?.querySelectorAll('[data-cms-nav-close]').forEach((node) => {
    node.addEventListener('click', () => setNav(false));
  });
  if (!escapeBound) {
    escapeBound = true;
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const open = document.querySelector('.cms-app.is-nav-open');
      if (!open) return;
      open.classList.remove('is-nav-open');
      const burger = open.querySelector('[data-cms-nav]');
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      }
    });
  }
  app?.querySelectorAll('.cms-side-link').forEach((link) => {
    link.addEventListener('click', () => setNav(false));
  });
  document.querySelector('[data-cms-search]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get('q') || '').trim();
    if (!q) return;
    sessionStorage.setItem('gm_cms_search', q);
    const current = window.location.hash.replace(/^#\//, '').split('/')[0];
    const searchable = [
      'safaris',
      'pages',
      'destinations',
      'posts',
      'testimonials',
      'faqs',
      'lodges',
      'departures',
      'menus',
      'bookings',
      'inquiries',
      'customers',
      'media',
    ];
    const target = `#/${searchable.includes(current) ? current : 'safaris'}`;
    if (window.location.hash === target) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = target;
    }
  });
}
