import { navLinks, site, utilityLinks } from '../../pages/home/content.js';
import { safariStyles, mostBookedSlugs, gmsTrips } from '../../pages/tours/gms-trips.js';
import { tourHref } from '../../pages/tours/paths.js';
import { destinationRegions } from '../../pages/destinations/content.js';
import { destinationHref } from '../../pages/destinations/paths.js';
import { cardUrl } from '../../media/gallery.js';

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

  if (normalized === '/blog') {
    return path === '/blog' || path.startsWith('/blog/');
  }

  if (normalized === '/accommodations') {
    return path === '/accommodations' || path.startsWith('/accommodations/');
  }

  if (normalized === '/reviews') {
    return path === '/reviews' || path.startsWith('/reviews/');
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
  paw: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="5.5" cy="9" r="1.6"/><circle cx="9.5" cy="6.2" r="1.6"/><circle cx="14.5" cy="6.2" r="1.6"/><circle cx="18.5" cy="9" r="1.6"/><path d="M8 14.5c.6-2 2.2-3.2 4-3.2s3.4 1.2 4 3.2c.4 1.3-.2 3.5-4 3.5s-4.4-2.2-4-3.5z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.4 2.3 4.7 5.2.8-3.8 3.6.9 5.2L12 15.6 7.4 17.7l.9-5.2-3.8-3.6 5.2-.8z"/></svg>`,
  people: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 1.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.2 19.2c.6-3.1 3.2-5.2 6.3-5.2s5.7 2.1 6.3 5.2c.1.4-.2.8-.6.8H2.8c-.4 0-.7-.4-.6-.8zm9.9-.2c.5-2.2 1.8-4 3.7-5.1 1.3.8 2.2 2.1 2.6 3.6.1.5-.2.9-.7.9h-5.1c-.3 0-.5-.2-.5-.6z"/></svg>`,
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 18v-6.5A2.5 2.5 0 0 1 5.5 9H21v9"/><path d="M3 18h18M3 14h18"/><path d="M7 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>`,
  WhatsApp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.38-1.41a10 10 0 0 0 4.66 1.13h.01c5.46 0 9.89-4.4 9.89-9.83S17.5 2 12.04 2zm5.76 14.2c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.13.1-1.82-.11-.42-.14-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.2-1.18-1.57-1.18-3 0-1.41.74-2.11 1-2.4.24-.27.64-.39.86-.39h.62c.2 0 .46-.05.72.55.27.64.91 2.22.99 2.38.08.16.13.35.03.56-.1.22-.16.35-.31.54-.16.19-.33.42-.47.56-.16.16-.32.33-.14.64.19.32.84 1.38 1.8 2.24 1.24 1.1 2.28 1.45 2.6 1.61.32.16.5.13.69-.08.19-.2.8-.93 1.02-1.25.21-.32.43-.26.72-.16.3.1 1.88.89 2.2 1.05.32.16.54.24.62.38.08.13.08.77-.16 1.45z"/></svg>`,
  Facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"/></svg>`,
  X: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 4h2.3l-5.1 5.8L21 20h-4.6l-3.6-4.7L8.7 20H6.4l5.4-6.2L4 4h4.7l3.3 4.4L17.5 4zm-.8 14.4h1.3L8.4 5.5H7L16.7 18.4z"/></svg>`,
  TikTok: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.5 4c.4 2.4 1.8 4 4 4.4v2.3c-1.4 0-2.7-.4-3.8-1.2v6.3A5.8 5.8 0 1 1 9 10.1v2.5a3.3 3.3 0 1 0 2.7 3.2V4h2.8z"/></svg>`,
  Instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none"/></svg>`,
};

const MORE_HREFS = new Set(['/kilimanjaro/', '/tours/#excursions']);

/**
 * Header layout from the live GM screenshot:
 * gold contact bar, then black bar with logo | nav | search + Book Now.
 */
export function renderHeader() {
  const moreLinks = navLinks.filter((link) => MORE_HREFS.has(link.href));
  const contactLink = navLinks.find((link) => link.href === '/contact/');
  const primaryLinks = navLinks.filter(
    (link) => !MORE_HREFS.has(link.href) && link.href !== '/contact/' && link.href !== '/tours/'
  );
  const booked = mostBookedSlugs.map((slug) => gmsTrips.find((trip) => trip.slug === slug)).filter(Boolean);
  const feature = booked[0] || gmsTrips[0];

  const linkMarkup = (link) => {
    const current = isCurrentNav(link);
    return `<a class="nav-link" href="${link.href}" ${current ? 'aria-current="page"' : ''}>${link.label}</a>`;
  };

  const safariCurrent = isCurrentNav({ href: '/tours/' });
  const safariMega = `
      <div class="nav-mega" data-nav-mega>
        <button type="button" class="nav-link nav-mega-btn" data-nav-mega-toggle aria-expanded="false" aria-haspopup="true" ${safariCurrent ? 'aria-current="page"' : ''}>
          Safaris
          <span class="nav-more-chevron">${ICONS.chevron}</span>
        </button>
        <div class="nav-mega-panel" data-nav-mega-panel>
          <div class="container-site nav-mega-grid">
            <div class="nav-mega-intro">
              <p class="nav-mega-kicker">Tanzania safaris</p>
              <p>Private, tailor-made and small-group safaris across Tanzania’s Northern Circuit.</p>
              <a class="nav-mega-all" href="/tours/">Browse all ${gmsTrips.length}+ safaris <span aria-hidden="true">→</span></a>
            </div>
            <div>
              <p class="nav-mega-kicker">Safari styles</p>
              <ul class="nav-mega-styles">
                ${safariStyles
                  .map(
                    (style) => `
                      <li>
                        <a href="/tours/?style=${style.slug}">
                          <span class="nav-mega-icon">${ICONS.paw}</span>
                          ${style.label}
                        </a>
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            </div>
            <div>
              <p class="nav-mega-kicker">Most booked</p>
              <ul class="nav-mega-booked">
                ${booked
                  .map((trip) => {
                    const price = trip.price_from
                      ? `From $${Number(trip.price_from).toLocaleString('en-US')}`
                      : '';
                    return `
                      <li>
                        <a href="${tourHref(trip)}">
                          <span class="nav-mega-icon">${ICONS.star}</span>
                          <span>
                            <strong>${trip.title}</strong>
                            <small>${trip.duration}${price ? ` · ${price}` : ''}</small>
                          </span>
                        </a>
                      </li>
                    `;
                  })
                  .join('')}
              </ul>
            </div>
            <a class="nav-mega-feature" href="${tourHref(feature)}">
              <img src="${cardUrl(feature.image, feature, 0)}" alt="" width="480" height="360" loading="lazy" decoding="async" />
              <span>
                <small>Featured journey</small>
                <strong>${feature.title}</strong>
                <em>${feature.duration}</em>
              </span>
            </a>
          </div>
        </div>
      </div>
    `;
  const destCurrent = isCurrentNav({ href: '/destinations/' });
  const destParks = destinationRegions.flatMap((region) => region.parks).slice(0, 8);
  const destFeature = destParks[0];
  const destMega = `
      <div class="nav-mega" data-nav-mega>
        <button type="button" class="nav-link nav-mega-btn" data-nav-mega-toggle aria-expanded="false" aria-haspopup="true" ${destCurrent ? 'aria-current="page"' : ''}>
          Destinations
          <span class="nav-more-chevron">${ICONS.chevron}</span>
        </button>
        <div class="nav-mega-panel" data-nav-mega-panel>
          <div class="container-site nav-mega-grid">
            <div class="nav-mega-intro">
              <p class="nav-mega-kicker">Tanzania parks</p>
              <p>Northern Circuit classics, quieter southern parks, chimpanzee country, and the Zanzibar coast.</p>
              <a class="nav-mega-all" href="/destinations/">Browse all destinations <span aria-hidden="true">→</span></a>
            </div>
            <div>
              <p class="nav-mega-kicker">Regions</p>
              <ul class="nav-mega-styles">
                ${destinationRegions
                  .map(
                    (region) => `
                      <li>
                        <a href="/destinations/#${region.id}">
                          <span class="nav-mega-icon">${ICONS.pin}</span>
                          ${region.name}
                        </a>
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            </div>
            <div>
              <p class="nav-mega-kicker">Featured parks</p>
              <ul class="nav-mega-booked">
                ${destParks
                  .slice(0, 6)
                  .map(
                    (park) => `
                      <li>
                        <a href="${destinationHref(park)}">
                          <span class="nav-mega-icon">${ICONS.star}</span>
                          <span>
                            <strong>${park.name}</strong>
                          </span>
                        </a>
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            </div>
            <a class="nav-mega-feature" href="${destinationHref(destFeature)}">
              <img src="${cardUrl(destFeature.image, destFeature.name, 0)}" alt="" width="480" height="360" loading="lazy" decoding="async" />
              <span>
                <small>Start here</small>
                <strong>${destFeature.name}</strong>
                <em>${destFeature.blurb}</em>
              </span>
            </a>
          </div>
        </div>
      </div>
    `;
  const desktopLinks = primaryLinks
    .map((link) => {
      if (link.href === '/destinations/') return `${destMega}${safariMega}`;
      return linkMarkup(link);
    })
    .join('');
  const contactMarkup = contactLink ? linkMarkup(contactLink) : '';

  const moreMenu = moreLinks.length
    ? `
      <div class="nav-more" data-nav-more>
        <button type="button" class="nav-link nav-more-btn" data-nav-more-toggle aria-expanded="false" aria-haspopup="true">
          More
          <span class="nav-more-chevron">${ICONS.chevron}</span>
        </button>
        <div class="nav-more-menu" data-nav-more-menu>
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

  const mobileSafari = `
      <div class="mobile-nav-group">
        <p class="mobile-nav-link" aria-hidden="true">Safaris</p>
        <a class="mobile-nav-sub" href="/tours/">All safari packages</a>
        ${safariStyles.map((style) => `<a class="mobile-nav-sub" href="/tours/?style=${style.slug}">${style.label}</a>`).join('')}
      </div>
    `;
  const mobileDest = `
      <div class="mobile-nav-group">
        <p class="mobile-nav-link" aria-hidden="true">Destinations</p>
        <a class="mobile-nav-sub" href="/destinations/">All destinations</a>
        ${destinationRegions.map((region) => `<a class="mobile-nav-sub" href="/destinations/#${region.id}">${region.name}</a>`).join('')}
      </div>
    `;
  const mobileUtility = utilityLinks
    .map((link) => {
      const current = isCurrentNav(link);
      return `<a class="mobile-nav-link" href="${link.href}" ${current ? 'aria-current="page"' : ''}>${link.label}</a>`;
    })
    .join('');
  const mobileLinks = navLinks
    .map((link) => {
      if (link.href === '/tours/') return mobileSafari;
      if (link.href === '/destinations/') return mobileDest;
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
          <nav class="header-utility" aria-label="Quick links">
            ${utilityLinks
              .map((link) => {
                const current = isCurrentNav(link);
                return `<a href="${link.href}" ${current ? 'aria-current="page"' : ''}>
                  <span class="header-utility-icon">${ICONS[link.icon] || ICONS.star}</span>
                  ${link.label}
                </a>`;
              })
              .join('')}
          </nav>
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
          <form class="mobile-search" data-mobile-search>
            <label class="sr-only" for="mobile-search">Search trips</label>
            <input id="mobile-search" type="search" name="q" placeholder="Search safaris" autocomplete="off" />
            <button type="submit">Search</button>
          </form>
          <a class="mobile-nav-phone" href="${telHref(site.phone)}">${site.phone}</a>
          <a class="mobile-nav-phone" href="mailto:${site.email}">${site.email}</a>
          ${mobileLinks}
          ${mobileUtility}
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
    const setNavOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      header.classList.toggle('nav-open', open);
      document.body.classList.toggle('nav-locked', open);
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      setNavOpen(!open);
    });

    header.querySelector('[data-mobile-nav]')?.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const url = new URL(link.getAttribute('href'), window.location.href);
      const here = window.location.pathname.replace(/\/+$/, '') || '/';
      const there = url.pathname.replace(/\/+$/, '') || '/';
      if (there === here) setNavOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setNavOpen(false);
    });

    window.addEventListener(
      'resize',
      () => {
        if (window.matchMedia('(min-width: 1024px)').matches) setNavOpen(false);
      },
      { passive: true }
    );
  }

  const stillInside = (node, ...roots) =>
    Boolean(node && roots.some((root) => root && (root === node || root.contains(node))));

  const closeMoreNow = () => {
    window.clearTimeout(moreTimer);
    if (!moreBtn || !moreMenu) return;
    moreBtn.setAttribute('aria-expanded', 'false');
    moreMenu.classList.remove('is-open');
  };

  const openMore = () => {
    window.clearTimeout(moreTimer);
    closeAllMegasNow();
    if (!moreBtn || !moreMenu) return;
    moreBtn.setAttribute('aria-expanded', 'true');
    moreMenu.classList.add('is-open');
  };

  let moreTimer = 0;

  const megas = [...document.querySelectorAll('[data-nav-mega]')].map((root) => ({
    root,
    btn: root.querySelector('[data-nav-mega-toggle]'),
    panel: root.querySelector('[data-nav-mega-panel]'),
    timer: 0,
  }));

  const closeMegaNow = (item) => {
    window.clearTimeout(item.timer);
    if (!item.btn || !item.panel) return;
    item.btn.setAttribute('aria-expanded', 'false');
    item.panel.classList.remove('is-open');
  };

  const closeAllMegasNow = () => {
    megas.forEach(closeMegaNow);
  };

  const openMega = (item) => {
    if (!item.btn || !item.panel) return;
    window.clearTimeout(item.timer);
    closeMoreNow();
    megas.forEach((other) => {
      if (other !== item) closeMegaNow(other);
    });
    item.btn.setAttribute('aria-expanded', 'true');
    item.panel.classList.add('is-open');
  };

  const scheduleCloseMega = (item) => {
    window.clearTimeout(item.timer);
    item.timer = window.setTimeout(() => closeMegaNow(item), 120);
  };

  if (more && moreBtn && moreMenu) {
    moreBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      closeAllMegasNow();
      const open = moreBtn.getAttribute('aria-expanded') === 'true';
      if (open) closeMoreNow();
      else openMore();
    });
    moreBtn.addEventListener('mouseenter', openMore);
    more.addEventListener('mouseleave', (event) => {
      if (stillInside(event.relatedTarget, more, moreMenu)) return;
      closeMoreNow();
    });
    moreMenu.addEventListener('mouseenter', openMore);
    moreMenu.addEventListener('mouseleave', (event) => {
      if (stillInside(event.relatedTarget, more)) return;
      closeMoreNow();
    });
  }

  for (const item of megas) {
    if (!item.btn || !item.panel) continue;
    item.btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = item.btn.getAttribute('aria-expanded') === 'true';
      if (open) closeMegaNow(item);
      else openMega(item);
    });
    item.btn.addEventListener('mouseenter', () => openMega(item));
    item.btn.addEventListener('mouseleave', (event) => {
      if (stillInside(event.relatedTarget, item.panel)) {
        window.clearTimeout(item.timer);
        return;
      }
      scheduleCloseMega(item);
    });
    item.panel.addEventListener('mouseenter', () => openMega(item));
    item.panel.addEventListener('mouseleave', (event) => {
      if (stillInside(event.relatedTarget, item.btn)) {
        window.clearTimeout(item.timer);
        return;
      }
      closeMegaNow(item);
    });
  }

  header
    ?.querySelectorAll('.primary-nav > a.nav-link, .nav-cta, .brand-logo, .search-btn')
    .forEach((el) => {
      el.addEventListener('mouseenter', () => {
        closeAllMegasNow();
        if (!more?.contains(el)) closeMoreNow();
      });
    });

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
      const match =
        navLinks.find((link) => link.label.toLowerCase().includes(query)) ||
        gmsTrips.find((trip) => trip.title.toLowerCase().includes(query));
      if (match) window.location.href = match.href || tourHref(match);
    });
  }

  const mobileSearch = document.querySelector('[data-mobile-search]');
  if (mobileSearch) {
    mobileSearch.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = String(new FormData(mobileSearch).get('q') || '')
        .trim()
        .toLowerCase();
      if (!query) return;
      const match =
        navLinks.find((link) => link.label.toLowerCase().includes(query)) ||
        gmsTrips.find((trip) => trip.title.toLowerCase().includes(query));
      if (match) window.location.href = match.href || tourHref(match);
    });
  }

  document.addEventListener('click', (event) => {
    if (more && !more.contains(event.target)) closeMoreNow();
    if (!megas.some((item) => item.root.contains(event.target))) closeAllMegasNow();
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
