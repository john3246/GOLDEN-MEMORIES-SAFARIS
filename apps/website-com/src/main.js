import './styles/main.css';
import { pagePath, tourSlugFromPath } from './pages/tours/paths.js';
import { destinationSlugFromPath } from './pages/destinations/paths.js';
import { blogSlugFromPath } from './pages/blog/paths.js';

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

function isKilimanjaroPage() {
  return pagePath() === '/kilimanjaro';
}

function isBlogPage() {
  return pagePath() === '/blog';
}

function setMeta(title, content) {
  document.title = title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', content);
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

function cmsTimeout(ms = 700) {
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

  const { hydrateFromCms, seoForPath } = await import('./services/cms/overlay.js');
  await hydrateFromCms();

  const [{ renderHeader, initHeader }, { renderFooter }, { renderFab }] = await Promise.all([
    import('./components/navigation/header.js'),
    import('./components/layout/footer.js'),
    import('./components/widgets/fab.js'),
  ]);

  const slug = tourSlugFromPath();
  const destSlug = destinationSlugFromPath();
  const blogSlug = blogSlugFromPath();
  let page = '';
  let afterPaint = async () => {};

  if (destSlug) {
    const { renderDestinationDetail, applyDestinationMeta } = await import('./pages/destinations/detail.js');
    page = renderDestinationDetail(destSlug);
    applyDestinationMeta(destSlug);
  } else if (isDestinationsPage()) {
    const { renderDestinations } = await import('./pages/destinations/destinations.js');
    page = renderDestinations();
    setMeta(
      'Tanzania Safari Destinations | Golden Memories Safaris',
      'Explore Tanzania safari destinations with Golden Memories Safaris — Serengeti, Ngorongoro, Tarangire, Kilimanjaro, Zanzibar, and the southern and western parks.'
    );
  } else if (isJoinSafariPage()) {
    const { renderJoinSafari, initJoinSafari } = await import('./pages/join-safari/join.js');
    page = renderJoinSafari();
    setMeta(
      'Join a Group Safari | 6 Days Wildebeest Calving | Golden Memories Safaris',
      'Join the 6 Days Great Wildebeest Calving Experience, 15–20 February 2027. Ndutu plains, Ngorongoro Crater, and Ang’ata Migration Camp — spaces limited.'
    );
    afterPaint = async () => initJoinSafari();
  } else if (isKilimanjaroPage()) {
    const { renderKilimanjaro } = await import('./pages/kilimanjaro/kilimanjaro.js');
    page = renderKilimanjaro();
    setMeta(
      'Kilimanjaro Climbing Packages | Golden Memories Safaris',
      'Climb Mount Kilimanjaro with Golden Memories Safaris. Marangu, Machame, Lemosho, Rongai, and Umbwe routes — guided treks from Arusha and Moshi.'
    );
  } else if (blogSlug || isBlogPage()) {
    const blog = await import('./pages/blog/index.js');
    if (blogSlug && blog.topicBySlug(blogSlug)) {
      page = blog.renderBlog(blogSlug);
      const topic = blog.topicBySlug(blogSlug);
      setMeta(`${topic.name} Articles | Golden Memories Safaris Blog`, topic.blurb);
    } else if (blogSlug) {
      page = blog.renderBlogArticle(blogSlug);
      blog.applyBlogArticleMeta(blogSlug);
    } else {
      page = blog.renderBlog();
      setMeta(
        'Tanzania Travel Blog | Golden Memories Safaris',
        'Articles on Kilimanjaro climbs, Tanzania safaris, Zanzibar, visas, and wildlife — written by the Golden Memories Safaris team in Arusha.'
      );
    }
  } else if (isAboutPage()) {
    const { renderAbout } = await import('./pages/about/about.js');
    page = renderAbout();
    setMeta(
      'About Golden Memories Safaris | Local Tanzanian Safari Experts Since 2023',
      'Golden Memories Safaris is a 100% locally owned tour company in Arusha, crafting personalized Tanzania safaris, Kilimanjaro treks, and Zanzibar holidays.'
    );
  } else if (isAccommodationsPage()) {
    const { renderAccommodations } = await import('./pages/accommodations/accommodations.js');
    page = renderAccommodations();
    setMeta(
      'Safari Lodges and Camps | Golden Memories Safaris',
      'Lodges and tented camps Golden Memories Safaris books across the Serengeti, Ngorongoro, and Zanzibar.'
    );
  } else if (isReviewsPage()) {
    const { renderReviews } = await import('./pages/reviews/reviews.js');
    page = renderReviews();
    setMeta(
      'Guest Reviews | Golden Memories Safaris',
      'Guest reviews of Golden Memories Safaris — Tanzania wildlife itineraries planned from Arusha.'
    );
  } else if (isContactPage()) {
    const { renderContact, initContactForm } = await import('./pages/contact/contact.js');
    page = renderContact();
    setMeta(
      'Contact Golden Memories Safaris | Tanzania Safari Experts in Arusha',
      'Contact Golden Memories Safaris in Arusha. Call +255 786 383 273, email info@gmsafaris.co.tz, or send a message to plan your Tanzania safari.'
    );
    afterPaint = async () => initContactForm();
  } else if (slug) {
    const { renderTourDetail, applyTourMeta } = await import('./pages/tours/detail.js');
    const { fetchPublishedSafariBySlug, fetchPublishedSafaris } = await import('./services/api/safaris.js');
    const wait = cmsTimeout();
    let cmsSafari = null;
    let cmsRelated = [];
    try {
      cmsSafari = await fetchPublishedSafariBySlug(slug, wait.signal);
      if (cmsSafari) {
        const all = await fetchPublishedSafaris({ limit: 12, sort: 'display_order' }, wait.signal);
        cmsRelated = all.filter((item) => item.slug !== slug).slice(0, 4);
      }
    } catch {
      cmsSafari = null;
    } finally {
      wait.done();
    }
    page = renderTourDetail(slug, cmsSafari, cmsRelated);
    applyTourMeta(slug, cmsSafari);
  } else if (isToursListing()) {
    const { renderTours } = await import('./pages/tours/tours.js');
    const { initToursFilters } = await import('./pages/tours/filters.js');
    page = renderTours();
    afterPaint = async () => initToursFilters();
  } else {
    const { renderHome } = await import('./pages/home/home.js');
    const { initWhyUsSlideshow } = await import('./components/gallery/why-slideshow.js');
    page = renderHome();
    afterPaint = async () => initWhyUsSlideshow();
  }

  const cmsPage = seoForPath(pagePath());
  if (cmsPage?.seo_title || cmsPage?.title) {
    setMeta(
      cmsPage.seo_title || `${cmsPage.title} | Golden Memories Safaris`,
      cmsPage.seo_description || cmsPage.excerpt || document.querySelector('meta[name="description"]')?.content || ''
    );
  }

  app.innerHTML = `${renderHeader()}${page}${renderFooter()}${renderFab()}`;
  initHeader();
  initReveals();
  await afterPaint();

  if (window.location.hash) {
    document.querySelector(window.location.hash)?.scrollIntoView();
  }
}

mount();
