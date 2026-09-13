function item(href, label, current, extra = '') {
  const key = href.replace(/^#\//, '').split('/')[0] || 'dashboard';
  const active = current === extra || current === key || (extra && current.startsWith(extra));
  return `<a class="cms-side-link${active ? ' is-active' : ''}" href="${href}">${label}</a>`;
}

function group(title, inner) {
  return `<p class="cms-side-kicker">${title}</p>${inner}`;
}

export function shell(user, current, inner) {
  const admin = user?.role === 'Admin';
  const name = user?.name || (user?.email || 'Staff').split('@')[0];
  return `
    <div class="cms-app">
      <aside class="cms-sidebar">
        <a class="cms-side-brand" href="#/dashboard" aria-label="Golden Memories Safaris CMS">
          <img src="/images/logo.webp" alt="Golden Memories Safaris" width="200" height="72" />
        </a>
        <nav class="cms-side-nav">
          ${item('#/dashboard', 'Dashboard', current, 'dashboard')}
          ${group(
            'Content management',
            `
            ${item('#/safaris', 'Tours', current, 'safaris')}
            ${item('#/destinations', 'Destinations', current, 'destinations')}
            ${item('#/posts', 'Blog', current, 'posts')}
            ${item('#/pages', 'Pages', current, 'pages')}
            ${item('#/media', 'Media', current, 'media')}
            ${item('#/testimonials', 'Reviews', current, 'testimonials')}
            ${item('#/faqs', 'FAQs', current, 'faqs')}
            ${item('#/lodges', 'Lodges', current, 'lodges')}
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
            ${admin ? item('#/settings', 'Site settings', current, 'settings') : ''}
          `
          )}
        </nav>
      </aside>
      <div class="cms-frame">
        <header class="cms-topbar">
          <button class="cms-burger" type="button" data-cms-nav aria-label="Open menu">☰</button>
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
  toggle?.addEventListener('click', () => app?.classList.toggle('is-nav-open'));
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
