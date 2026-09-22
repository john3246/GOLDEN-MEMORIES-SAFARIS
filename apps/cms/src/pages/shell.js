import { isStaffAdmin } from '../auth/roles.js';

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
            ${item('#/testimonials', 'Reviews', current, 'testimonials')}
            ${item('#/faqs', 'FAQs', current, 'faqs')}
            ${item('#/departures', 'Join safari', current, 'departures')}
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
            ${admin ? item('#/api-clients', 'API & integrations', current, 'clients') : ''}
            ${admin ? item('#/activity', 'Audit log', current, 'activity') : ''}
            ${admin ? item('#/users', 'Users', current, 'users') : ''}
            ${admin ? item('#/settings', 'Site settings', current, 'settings') : ''}
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
          <div class="cms-user">
            <span>
              <strong>${name}</strong>
              <small>${user?.role || 'Viewer'}</small>
            </span>
            <button class="cms-nav-logout" id="cms-logout" type="button">Sign out</button>
          </div>
        </header>
        <div class="cms-workspace">${inner}</div>
      </div>
    </div>
  `;
}

export function initShell() {
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
