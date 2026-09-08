import { navLinks, site } from '../../pages/home/content.js';

function pagePath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function isCurrentNav(link) {
  const path = pagePath();
  const hash = window.location.hash;
  const [hrefPath, hrefHash] = link.href.split('#');
  const normalized = (hrefPath || '/').replace(/\/+$/, '') || '/';

  if (hrefHash) {
    return path === normalized && hash === `#${hrefHash}`;
  }

  if (normalized === '/tours') {
    if (hash) return false;
    return path === '/tours' || path.startsWith('/tours/');
  }

  if (normalized === '/destinations') {
    return path === '/destinations' || path.startsWith('/destinations/');
  }

  return path === normalized;
}

function telHref(phone) {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

const ICONS = {
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
  Facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"/></svg>`,
  X: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 4h2.3l-5.1 5.8L21 20h-4.6l-3.6-4.7L8.7 20H6.4l5.4-6.2L4 4h4.7l3.3 4.4L17.5 4zm-.8 14.4h1.3L8.4 5.5H7L16.7 18.4z"/></svg>`,
  TikTok: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.5 4c.4 2.4 1.8 4 4 4.4v2.3c-1.4 0-2.7-.4-3.8-1.2v6.3A5.8 5.8 0 1 1 9 10.1v2.5a3.3 3.3 0 1 0 2.7 3.2V4h2.8z"/></svg>`,
  Instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none"/></svg>`,
};

const MORE_HREFS = new Set(['/tours/#kilimanjaro', '/tours/#excursions']);

/**
 * Header layout from the live GM screenshot:
 * gold contact bar, then black bar with logo | nav | search + Book Now.
 */
export function renderHeader() {
  const moreLinks = navLinks.filter((link) => MORE_HREFS.has(link.href));
  const contactLink = navLinks.find((link) => link.href === '/contact/');
  const primaryLinks = navLinks.filter(
    (link) => !MORE_HREFS.has(link.href) && link.href !== '/contact/'
  );

  const linkMarkup = (link) => {
    const current = isCurrentNav(link);
    return `<a class="nav-link" href="${link.href}" ${current ? 'aria-current="page"' : ''}>${link.label}</a>`;
  };

  const desktopLinks = primaryLinks.map(linkMarkup).join('');
  const contactMarkup = contactLink ? linkMarkup(contactLink) : '';

  const moreMenu = moreLinks.length
    ? `
      <div class="nav-more" data-nav-more>
        <button type="button" class="nav-link nav-more-btn" data-nav-more-toggle aria-expanded="false" aria-haspopup="true">
          More
          <span class="nav-more-chevron">${ICONS.chevron}</span>
        </button>
        <div class="nav-more-menu" data-nav-more-menu hidden>
          ${moreLinks
            .map((link) => {
              const current = isCurrentNav(link);
              return `<a href="${link.href}" ${current ? 'aria-current="page"' : ''}>${link.label}</a>`;
            })
            .join('')}
        </div>
      </div>
    `
    : '';

  const mobileLinks = navLinks
    .map((link) => {
      const current = isCurrentNav(link);
      return `<a class="mobile-nav-link" href="${link.href}" ${current ? 'aria-current="page"' : ''}>${link.label}</a>`;
    })
    .join('');

  const socials = site.socials
    .map((item) => {
      const icon = ICONS[item.label];
      if (!icon) return '';
      return `<a class="header-social" href="${item.href}" aria-label="${item.label}" target="_blank" rel="noreferrer">${icon}</a>`;
    })
    .join('');

  return `
    <header class="site-header sticky top-0 z-50" data-site-header>
      <div class="header-top">
        <div class="container-site header-top-inner">
          <div class="header-top-contact">
            <a href="${telHref(site.phone)}">
              <span class="header-top-icon">${ICONS.phone}</span>
              ${site.phone}
            </a>
            <a class="header-top-email" href="mailto:${site.email}">
              <span class="header-top-icon">${ICONS.mail}</span>
              ${site.email}
            </a>
          </div>
          <div class="header-top-socials">
            ${socials}
          </div>
        </div>
      </div>

      <div class="header-main">
        <div class="container-site header-main-inner">
          <a class="brand-logo" href="/" aria-label="${site.name} home">
            <img
              src="/images/logo.webp"
              alt="Golden Memories Safaris"
              width="200"
              height="72"
              decoding="async"
            />
          </a>

          <nav class="primary-nav" aria-label="Primary">
            ${desktopLinks}
            ${moreMenu}
            ${contactMarkup}
          </nav>

          <div class="header-actions">
            <div class="header-search" data-header-search>
              <form class="search-form" data-search-form>
                <label class="sr-only" for="header-search">Search</label>
                <input id="header-search" type="search" name="q" placeholder="Search" autocomplete="off" />
              </form>
              <button type="button" class="search-btn" data-search-toggle aria-label="Search" aria-expanded="false">
                ${ICONS.search}
              </button>
            </div>

            <a class="nav-cta desktop-only" href="/contact/">Book Now</a>

            <button
              type="button"
              class="nav-burger"
              data-nav-toggle
              aria-expanded="false"
              aria-controls="mobile-nav"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-nav" class="mobile-nav" data-mobile-nav>
        <div class="container-site mobile-nav-inner">
          ${mobileLinks}
          <a class="nav-cta mobile-nav-cta" href="/contact/">Book Now</a>
        </div>
      </div>
    </header>
  `;
}

export function initHeader() {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const more = document.querySelector('[data-nav-more]');
  const moreBtn = document.querySelector('[data-nav-more-toggle]');
  const moreMenu = document.querySelector('[data-nav-more-menu]');
  const searchWrap = document.querySelector('[data-header-search]');
  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = searchForm?.querySelector('input');

  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      header.classList.toggle('nav-open', !open);
    });
  }

  const closeMore = () => {
    if (!moreBtn || !moreMenu) return;
    moreBtn.setAttribute('aria-expanded', 'false');
    moreMenu.hidden = true;
  };

  if (more && moreBtn && moreMenu) {
    moreBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = moreBtn.getAttribute('aria-expanded') === 'true';
      moreBtn.setAttribute('aria-expanded', String(!open));
      moreMenu.hidden = open;
    });
  }

  const closeSearch = () => {
    if (!searchWrap || !searchToggle) return;
    searchWrap.classList.remove('is-open');
    searchToggle.setAttribute('aria-expanded', 'false');
  };

  if (searchWrap && searchToggle && searchInput) {
    searchToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = searchWrap.classList.toggle('is-open');
      searchToggle.setAttribute('aria-expanded', String(open));
      if (open) searchInput.focus();
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      if (!query) return;
      const match = navLinks.find((link) => link.label.toLowerCase().includes(query));
      if (match) window.location.href = match.href;
    });
  }

  document.addEventListener('click', (event) => {
    if (more && !more.contains(event.target)) closeMore();
    if (searchWrap && !searchWrap.contains(event.target)) closeSearch();
  });

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}
