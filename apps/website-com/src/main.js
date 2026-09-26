import './styles/main.css';
import { pagePath, tourSlugFromPath } from './pages/tours/paths.js';
import { destinationSlugFromPath } from './pages/destinations/paths.js';
import { blogSlugFromPath } from './pages/blog/paths.js';
import { joinSlugFromPath } from './pages/join-safari/paths.js';
import { SEO_ROUTES, seoRouteKey, keywordsText } from '@gm-safaris/safari-ui';

function isToursListing() {
  return pagePath() === '/tours';
}

function isDestinationsPage() {
  return pagePath() === '/destinations';
}

function isAboutPage() {
  return pagePath() === '/about';
}

function isAccommodationsPage() {
  return pagePath() === '/accommodations';
}

function isReviewsPage() {
  return pagePath() === '/reviews';
}

function isJoinSafariPage() {
  return pagePath() === '/join-safari';
}

function isContactPage() {
  return pagePath() === '/contact';
}

function isBookingPage() {
  return pagePath() === '/booking';
}

function isKilimanjaroPage() {
  return pagePath() === '/kilimanjaro';
}

function isBlogPage() {
  return pagePath() === '/blog';
}

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

/**
 * Keep title, description, keywords, canonical and social tags in sync with
 * the page being shown (the server already sends them for crawlers; this
 * covers in-browser navigation and the local dev server).
 */
function setMeta(title, content, extra = {}) {
  if (title) document.title = title;
  if (content) upsertMeta('meta[name="description"]', { name: 'description', content });
  if (extra.keywords) upsertMeta('meta[name="keywords"]', { name: 'keywords', content: extra.keywords });
  const url = `${window.location.origin}${window.location.pathname}`;
  upsertMeta('link[rel="canonical"]', { rel: 'canonical', href: url });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
  if (title) {
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  }
  if (content) {
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content });
  }
  if (extra.image) {
    const image = new URL(extra.image, window.location.origin).href;
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
  }
  if (extra.robots) upsertMeta('meta[name="robots"]', { name: 'robots', content: extra.robots });
}

/** Default SEO for a static route, with CMS → Pages overrides. */
function routeSeo(key, cmsPage) {
  const route = SEO_ROUTES[key];
  if (!route) return;
  setMeta(cmsPage?.seo_title || route.title, cmsPage?.seo_description || route.description, {
    keywords: keywordsText(cmsPage?.seo_keywords) || keywordsText(route.keywords),
    image: (typeof cmsPage?.og_image === 'string' && cmsPage.og_image) || route.image,
  });
}

const KNOWN_SECTIONS = new Set(['', 'tours', 'destinations', 'about', 'accommodations', 'reviews', 'join-safari', 'contact', 'booking', 'kilimanjaro', 'blog']);

function isKnownPath() {
  const parts = pagePath().split('/').filter(Boolean);
  if (!parts.length) return true;
  if (!KNOWN_SECTIONS.has(parts[0])) return false;
  return parts.length <= 2;
}

function renderNotFound() {
  return `
    <main id="main" class="bg-mist py-16 sm:py-24">
      <div class="container-site max-w-2xl text-center">
        <p class="section-kicker">Error 404</p>
        <h1 class="section-title">We could not find that page</h1>
        <p class="mt-4 font-body text-base leading-relaxed text-ink/75">The page may have moved, or the link may be out of date. Try one of these instead:</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a class="btn-navy !rounded-none" href="/tours/">Safari packages</a>
          <a class="btn-navy !rounded-none" href="/kilimanjaro/">Kilimanjaro</a>
          <a class="btn-navy !rounded-none" href="/destinations/">Destinations</a>
          <a class="btn-navy !rounded-none" href="/contact/">Contact us</a>
        </div>
      </div>
    </main>`;
}

/** Replace any photo that fails to load with a matching gallery shot instead of a broken icon. */
function installImageFallback() {
  const FALLBACK = '/images/gallery/serengeti-01.webp';
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = '1';
      const card = img.getAttribute('src') || '';
      // A missing "-card" thumbnail usually has a full-size original next to it.
      if (/-card\.webp$/i.test(card)) {
        img.src = card.replace(/-card\.webp$/i, '.webp');
        img.dataset.fallbackDone = '';
        img.dataset.fallbackStage = '1';
        return;
      }
      img.src = img.getAttribute('data-fallback') || FALLBACK;
      img.srcset = '';
      img.classList.add('img-fallback');
    },
    true
  );
}

/**
 * Lazy-load every image that is not explicitly marked as above-the-fold
 * (fetchpriority="high"), so pages only download photos as you scroll.
 */
function lazyImages(html) {
  return html.replace(/<img\b(?![^>]*\bloading=)(?![^>]*fetchpriority=)/g, '<img loading="lazy" decoding="async"');
}

function initReveals() {
  const nodes = document.querySelectorAll('.reveal');
  if (!nodes.length) return;
  if (!('IntersectionObserver' in window)) {
    nodes.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0, rootMargin: '0px 0px -40px 0px' }
  );
  nodes.forEach((el) => observer.observe(el));
}

function cmsTimeout(ms = 2500) {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => window.clearTimeout(timer) };
}

/**
 * Website entry — header + page + footer. Page modules load on demand
 * so the first paint does not parse every route.
 */
async function mount() {
  const app = document.querySelector('#app');
  if (!app) return;

  installImageFallback();
  const { hydrateFromCms, hydratePublishedPost, seoForPath } = await import('./services/cms/overlay.js');
  await hydrateFromCms();

  const [{ renderHeader, initHeader }, { renderFooter }, { renderFab }] = await Promise.all([
    import('./components/navigation/header.js'),
    import('./components/layout/footer.js'),
    import('./components/widgets/fab.js'),
  ]);

  const slug = tourSlugFromPath();
  const destSlug = destinationSlugFromPath();
  const blogSlug = blogSlugFromPath();
  const joinSlug = joinSlugFromPath();
  let page = '';
  let afterPaint = async () => {};

  if (destSlug) {
    const overlay = await import('./services/cms/overlay.js');
    if (overlay.hydratePublishedDestination) await overlay.hydratePublishedDestination(destSlug);
    const { renderDestinationDetail, applyDestinationMeta, initDestinationDetail } = await import('./pages/destinations/detail.js');
    page = renderDestinationDetail(destSlug);
    applyDestinationMeta(destSlug);
    afterPaint = async () => initDestinationDetail();
  } else if (isDestinationsPage()) {
    const { renderDestinations } = await import('./pages/destinations/destinations.js');
    page = renderDestinations();
  } else if (joinSlug) {
    const { renderJoinDetail, applyJoinMeta } = await import('./pages/join-safari/detail.js');
    page = renderJoinDetail(joinSlug);
    applyJoinMeta(joinSlug);
  } else if (isJoinSafariPage()) {
    const { renderJoinSafari, initJoinSafari } = await import('./pages/join-safari/join.js');
    page = renderJoinSafari();
    afterPaint = async () => initJoinSafari();
  } else if (isKilimanjaroPage()) {
    const { renderKilimanjaro } = await import('./pages/kilimanjaro/kilimanjaro.js');
    page = renderKilimanjaro();
  } else if (blogSlug || isBlogPage()) {
    const blog = await import('./pages/blog/index.js');
    if (blogSlug && blog.topicBySlug(blogSlug)) {
      page = blog.renderBlog(blogSlug);
      const topic = blog.topicBySlug(blogSlug);
      setMeta(`${topic.name} Articles | Golden Memories Safaris Blog`, topic.blurb);
    } else if (blogSlug) {
      await hydratePublishedPost(blogSlug);
      page = blog.renderBlogArticle(blogSlug);
      blog.applyBlogArticleMeta(blogSlug);
      afterPaint = async () => blog.initBlogArticle();
    } else {
      page = blog.renderBlog();
      afterPaint = async () => blog.initBlogIndex();
    }
  } else if (isAboutPage()) {
    const { renderAbout } = await import('./pages/about/about.js');
    page = renderAbout();
  } else if (isAccommodationsPage()) {
    const { renderAccommodations } = await import('./pages/accommodations/accommodations.js');
    page = renderAccommodations();
  } else if (isReviewsPage()) {
    const { renderReviews } = await import('./pages/reviews/reviews.js');
    page = renderReviews();
  } else if (isContactPage()) {
    const { renderContact, initContactForm } = await import('./pages/contact/contact.js');
    page = renderContact();
    afterPaint = async () => initContactForm();
  } else if (isBookingPage()) {
    const { renderBooking, initBookingForm } = await import('./pages/booking/booking.js');
    page = renderBooking();
    afterPaint = async () => initBookingForm();
  } else if (slug) {
    const { renderTourDetail, applyTourMeta } = await import('./pages/tours/detail.js');
    const { cmsSafaris } = await import('./services/cms/overlay.js');
    // The site bundle already carries every published tour — no extra request.
    let cmsSafari = cmsSafaris.find((item) => item.slug === slug) || null;
    let cmsRelated = cmsSafari ? cmsSafaris.filter((item) => item.slug !== slug).slice(0, 4) : [];
    if (!cmsSafari && !cmsSafaris.length) {
      const { fetchPublishedSafariBySlug } = await import('./services/api/safaris.js');
      const wait = cmsTimeout();
      try {
        cmsSafari = await fetchPublishedSafariBySlug(slug, wait.signal);
      } catch {
        cmsSafari = null;
      } finally {
        wait.done();
      }
      cmsRelated = [];
    }
    page = renderTourDetail(slug, cmsSafari, cmsRelated);
    applyTourMeta(slug, cmsSafari);
  } else if (!isKnownPath()) {
    page = renderNotFound();
    setMeta('Page not found | Golden Memories Safaris', 'The page you were looking for has moved or no longer exists.', { robots: 'noindex,follow' });
  } else if (isToursListing()) {
    const { renderTours } = await import('./pages/tours/tours.js');
    const { initToursFilters } = await import('./pages/tours/filters.js');
    page = renderTours();
    afterPaint = async () => initToursFilters();
  } else {
    const { renderHome, initHomeHero } = await import('./pages/home/home.js');
    const { initWhyUsSlideshow } = await import('./components/gallery/why-slideshow.js');
    page = renderHome();
    afterPaint = async () => {
      initHomeHero();
      await initWhyUsSlideshow();
    };
  }

  const routeKey = seoRouteKey(pagePath());
  if (routeKey) {
    routeSeo(routeKey, seoForPath(pagePath()));
  }

  app.innerHTML = lazyImages(`${renderHeader()}${page}${renderFooter()}${renderFab()}`);
  initHeader();
  initReveals();
  await afterPaint();

  if (window.location.hash) {
    document.querySelector(window.location.hash)?.scrollIntoView();
  }
}

mount();
