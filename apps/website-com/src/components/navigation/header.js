import { navLinks, site } from '../../pages/home/content.js';

/**
 * Header layout matched to zaratanzaniaadventures.com:
 * 1) White brand row — tagline + gold utility strip + phone
 * 2) Overlapping logo spanning both rows
 * 3) Black nav bar — links + gold CTA
 */
export function renderHeader() {
  const utilityLinks = [
    { label: 'About Us', href: '/about/', icon: 'users' },
    { label: 'Contact Us', href: '/contact/', icon: 'phone' },
    { label: 'Travel Info', href: '#travel-info', icon: 'book' },
  ];

  const icons = {
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>`,
  };

  const utility = utilityLinks
    .map(
      (link) => `
        <a class="utility-item" href="${link.href}">
          <span class="utility-icon">${icons[link.icon]}</span>
          <span>${link.label}</span>
        </a>
      `
    )
    .join('');

  const desktopLinks = navLinks
    .map(
      (link) =>
        `<a class="nav-link" href="${link.href}" ${link.current ? 'aria-current="page"' : ''}>${link.label}</a>`
    )
    .join('');

  const mobileLinks = navLinks
    .map(
      (link) =>
        `<a class="mobile-nav-link" href="${link.href}" ${link.current ? 'aria-current="page"' : ''}>${link.label}</a>`
    )
    .join('');

  return `
    <header class="site-header sticky top-0 z-50" data-site-header>
      <div class="header-stack">
        <div class="container-site header-stack-inner">
          <a class="brand-logo" href="/" aria-label="${site.name} home">
            <span class="brand-logo-frame">
              <img
                src="/images/logo.webp"
                alt="Golden Memories Safaris"
                width="200"
                height="200"
                decoding="async"
              />
            </span>
          </a>

          <div class="brand-row">
            <p class="brand-tagline">${site.tagline}</p>
            <div class="brand-row-right">
              <div class="utility-bar">
                ${utility}
              </div>
              <p class="header-phone">
                Have questions? Toll Free:
                <a href="tel:+255786383273">${site.phone}</a>
              </p>
            </div>
          </div>

          <div class="nav-row">
            <nav class="primary-nav" aria-label="Primary">
              ${desktopLinks}
            </nav>

            <a class="nav-cta desktop-only" href="/contact/">
              <span class="nav-cta-icon">${icons.bag}</span>
              Let's plan a trip
            </a>

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
          <a class="mobile-nav-phone" href="tel:+255786383273">${site.phone}</a>
          ${mobileLinks}
          <a class="nav-cta mobile-nav-cta" href="/contact/">Let's plan a trip</a>
        </div>
      </div>
    </header>
  `;
}

export function initHeader() {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-nav-toggle]');

  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      header.classList.toggle('nav-open', !open);
    });
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}
