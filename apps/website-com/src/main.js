import './styles/main.css';
import { renderHeader, initHeader } from './components/navigation/header.js';
import { renderFooter } from './components/layout/footer.js';
import { renderHome, initHomeReveals } from './pages/home/home.js';
import { renderTours } from './pages/tours/tours.js';
import { renderTourDetail, applyTourMeta } from './pages/tours/detail.js';
import { renderDestinations } from './pages/destinations/destinations.js';
import { renderDestinationDetail, applyDestinationMeta } from './pages/destinations/detail.js';
import { renderAbout } from './pages/about/about.js';
import { renderContact, initContactForm } from './pages/contact/contact.js';
import { initWhyUsSlideshow } from './components/gallery/why-slideshow.js';
import { pagePath, tourSlugFromPath } from './pages/tours/paths.js';
import { destinationSlugFromPath } from './pages/destinations/paths.js';

function isToursListing() {
  return pagePath() === '/tours';
}

function isDestinationsPage() {
  return pagePath() === '/destinations';
}

function isAboutPage() {
  return pagePath() === '/about';
}

function isContactPage() {
  return pagePath() === '/contact';
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

function applyContactMeta() {
  setMeta(
    'Contact Golden Memories Safaris | Tanzania Safari Experts in Arusha',
    'Contact Golden Memories Safaris in Arusha. Call +255 786 383 273, email info@gmsafaris.co.tz, or send a message to plan your Tanzania safari.'
  );
}

/**
 * Website entry — header + page + footer.
 * Home at / ; destinations at /destinations/ ; parks at /destinations/:slug/ ;
 * about at /about/ ; contact at /contact/ ; safari listing at /tours/ ; packages at /tours/:slug/
 */
function mount() {
  const app = document.querySelector('#app');
  if (!app) return;

  const slug = tourSlugFromPath();
  const destSlug = destinationSlugFromPath();
  let page;
  let homeChrome = false;
  let contactChrome = false;

  if (destSlug) {
    page = renderDestinationDetail(destSlug);
    applyDestinationMeta(destSlug);
  } else if (isDestinationsPage()) {
    page = renderDestinations();
    applyDestinationsMeta();
  } else if (isAboutPage()) {
    page = renderAbout();
    applyAboutMeta();
  } else if (isContactPage()) {
    page = renderContact();
    applyContactMeta();
    contactChrome = true;
  } else if (slug) {
    page = renderTourDetail(slug);
    applyTourMeta(slug);
  } else if (isToursListing()) {
    page = renderTours();
  } else {
    page = renderHome();
    homeChrome = true;
  }

  app.innerHTML = `${renderHeader()}${page}${renderFooter()}`;
  initHeader();
  initHomeReveals();
  if (homeChrome) initWhyUsSlideshow();
  if (contactChrome) initContactForm();

  if (window.location.hash) {
    document.querySelector(window.location.hash)?.scrollIntoView();
  }
}

mount();
