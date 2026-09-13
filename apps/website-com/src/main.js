import './styles/main.css';
import { renderHeader, initHeader } from './components/navigation/header.js';
import { renderFooter } from './components/layout/footer.js';
import { renderFab } from './components/widgets/fab.js';
import { renderHome, initHomeReveals } from './pages/home/home.js';
import { renderTours } from './pages/tours/tours.js';
import { initToursFilters } from './pages/tours/filters.js';
import { renderTourDetail, applyTourMeta } from './pages/tours/detail.js';
import { renderDestinations } from './pages/destinations/destinations.js';
import { renderDestinationDetail, applyDestinationMeta } from './pages/destinations/detail.js';
import { renderAbout } from './pages/about/about.js';
import { renderAccommodations } from './pages/accommodations/accommodations.js';
import { renderReviews } from './pages/reviews/reviews.js';
import { renderContact, initContactForm } from './pages/contact/contact.js';
import { renderJoinSafari, initJoinSafari } from './pages/join-safari/join.js';
import { renderKilimanjaro } from './pages/kilimanjaro/kilimanjaro.js';
import { applyBlogArticleMeta, renderBlog, renderBlogArticle, topicBySlug } from './pages/blog/index.js';
import { blogSlugFromPath } from './pages/blog/paths.js';
import { initWhyUsSlideshow } from './components/gallery/why-slideshow.js';
import { pagePath, tourSlugFromPath } from './pages/tours/paths.js';
import { destinationSlugFromPath } from './pages/destinations/paths.js';
import { fetchPublishedSafariBySlug, fetchPublishedSafaris } from './services/api/safaris.js';

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

function applyDestinationsMeta() {
  setMeta(
    'Tanzania Safari Destinations | Golden Memories Safaris',
    'Explore Tanzania safari destinations with Golden Memories Safaris — Serengeti, Ngorongoro, Tarangire, Kilimanjaro, Zanzibar, and the southern and western parks.'
  );
}

function applyAboutMeta() {
  setMeta(
    'About Golden Memories Safaris | Local Tanzanian Safari Experts Since 2023',
    'Golden Memories Safaris is a 100% locally owned tour company in Arusha, crafting personalized Tanzania safaris, Kilimanjaro treks, and Zanzibar holidays.'
  );
}

function applyJoinSafariMeta() {
  setMeta(
    'Join a Group Safari | 6 Days Wildebeest Calving | Golden Memories Safaris',
    'Join the 6 Days Great Wildebeest Calving Experience, 15–20 February 2027. Ndutu plains, Ngorongoro Crater, and Ang’ata Migration Camp — spaces limited.'
  );
}

function applyContactMeta() {
  setMeta(
    'Contact Golden Memories Safaris | Tanzania Safari Experts in Arusha',
    'Contact Golden Memories Safaris in Arusha. Call +255 786 383 273, email info@gmsafaris.co.tz, or send a message to plan your Tanzania safari.'
  );
}

function applyKilimanjaroMeta() {
  setMeta(
    'Kilimanjaro Climbing Packages | Golden Memories Safaris',
    'Climb Mount Kilimanjaro with Golden Memories Safaris. Marangu, Machame, Lemosho, Rongai, and Umbwe routes — guided treks from Arusha and Moshi.'
  );
}

function applyBlogMeta(slug = '') {
  if (slug && applyBlogArticleMeta(slug)) return;
  const topic = topicBySlug(slug);
  if (topic) {
    setMeta(`${topic.name} Articles | Golden Memories Safaris Blog`, topic.blurb);
    return;
  }
  setMeta(
    'Tanzania Travel Blog | Golden Memories Safaris',
    'Articles on Kilimanjaro climbs, Tanzania safaris, Zanzibar, visas, and wildlife — written by the Golden Memories Safaris team in Arusha.'
  );
}

/**
 * Website entry — header + page + footer.
 * Home at / ; destinations at /destinations/ ; parks at /destinations/:slug/ ;
 * about at /about/ ; join safari at /join-safari/ ; kilimanjaro at /kilimanjaro/ ;
 * blog at /blog/ ; contact at /contact/ ; safari listing at /tours/ ; packages at /tours/:slug/
 */
async function mount() {
  const app = document.querySelector('#app');
  if (!app) return;

  const slug = tourSlugFromPath();
  const destSlug = destinationSlugFromPath();
  const blogSlug = blogSlugFromPath();
  let page;
  let homeChrome = false;
  let contactChrome = false;
  let joinChrome = false;

  if (destSlug) {
    page = renderDestinationDetail(destSlug);
    applyDestinationMeta(destSlug);
  } else if (isDestinationsPage()) {
    page = renderDestinations();
    applyDestinationsMeta();
  } else if (isJoinSafariPage()) {
    page = renderJoinSafari();
    applyJoinSafariMeta();
    joinChrome = true;
  } else if (isKilimanjaroPage()) {
    page = renderKilimanjaro();
    applyKilimanjaroMeta();
  } else if (blogSlug) {
    page = topicBySlug(blogSlug) ? renderBlog(blogSlug) : renderBlogArticle(blogSlug);
    applyBlogMeta(blogSlug);
  } else if (isBlogPage()) {
    page = renderBlog();
    applyBlogMeta();
  } else if (isAboutPage()) {
    page = renderAbout();
    applyAboutMeta();
  } else if (isAccommodationsPage()) {
    page = renderAccommodations();
    setMeta(
      'Safari Lodges and Camps | Golden Memories Safaris',
      'Lodges and tented camps Golden Memories Safaris books across the Serengeti, Ngorongoro, and Zanzibar.'
    );
  } else if (isReviewsPage()) {
    page = renderReviews();
    setMeta(
      'Guest Reviews | Golden Memories Safaris',
      'Guest reviews of Golden Memories Safaris — Tanzania wildlife itineraries planned from Arusha.'
    );
  } else if (isContactPage()) {
    page = renderContact();
    applyContactMeta();
    contactChrome = true;
  } else if (slug) {
    let cmsSafari = null;
    let cmsRelated = [];
    try {
      cmsSafari = await fetchPublishedSafariBySlug(slug);
      if (cmsSafari) {
        const all = await fetchPublishedSafaris({ limit: 12, sort: 'display_order' });
        cmsRelated = all.filter((item) => item.slug !== slug).slice(0, 4);
      }
    } catch {
      cmsSafari = null;
    }
    page = renderTourDetail(slug, cmsSafari, cmsRelated);
    applyTourMeta(slug, cmsSafari);
  } else if (isToursListing()) {
    let cmsPackages = [];
    try {
      cmsPackages = await fetchPublishedSafaris({ limit: 200, sort: 'display_order' });
    } catch {
      cmsPackages = [];
    }
    page = renderTours(cmsPackages);
  } else {
    page = renderHome();
    homeChrome = true;
  }

  app.innerHTML = `${renderHeader()}${page}${renderFooter()}${renderFab()}`;
  initHeader();
  initHomeReveals();
  if (isToursListing()) initToursFilters();
  if (homeChrome) initWhyUsSlideshow();
  if (contactChrome) initContactForm();
  if (joinChrome) initJoinSafari();

  if (window.location.hash) {
    document.querySelector(window.location.hash)?.scrollIntoView();
  }
}

mount();
