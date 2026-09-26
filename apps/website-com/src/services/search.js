/**
 * Site-wide search index and results renderer.
 * Searches tours, destinations, blog articles, Kilimanjaro treks, group safaris, and accommodations.
 */
import { allTours } from '../pages/tours/catalog.js';
import { tourHref } from '../pages/tours/paths.js';
import { destinationPlaces } from '../pages/destinations/catalog.js';
import { destinationHref } from '../pages/destinations/paths.js';
import { sortedArticles } from '../pages/blog/content.js';
import { openJoiningPackages } from '../pages/join-safari/packages.js';
import { joinHref } from '../pages/join-safari/paths.js';
import { kilimanjaroTreks } from '../pages/kilimanjaro/packages.js';
import { lodges } from '../pages/accommodations/content.js';
import { navLinks } from '../pages/home/content.js';

/** Build a flat searchable index from all content sources */
function buildIndex() {
  const entries = [];

  // Tours / safari packages
  for (const tour of allTours()) {
    entries.push({
      type: 'Safari',
      label: tour.title,
      sub: [tour.duration, tour.places].filter(Boolean).join(' · '),
      href: tourHref(tour),
      keywords: [
        tour.title,
        tour.places,
        tour.duration,
        tour.activity,
        tour.style,
        tour.overview,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  }

  // Destinations / parks
  for (const dest of destinationPlaces) {
    entries.push({
      type: 'Destination',
      label: dest.name,
      sub: dest.region,
      href: destinationHref(dest),
      keywords: [
        dest.name,
        dest.region,
        dest.kicker,
        dest.tagline,
        ...(dest.match || []),
        ...(dest.attractions || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  }

  // Blog articles
  for (const article of (sortedArticles() || [])) {
    entries.push({
      type: 'Blog',
      label: article.title,
      sub: article.topic ? `${article.topic[0].toUpperCase()}${article.topic.slice(1)}` : 'Blog',
      href: `/blog/${article.slug}/`,
      keywords: [article.title, article.topic, article.blurb, article.intro]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  }

  // Group safaris
  for (const pkg of (openJoiningPackages || [])) {
    entries.push({
      type: 'Group Safari',
      label: pkg.title,
      sub: [pkg.duration, pkg.datesLabel].filter(Boolean).join(' · '),
      href: joinHref(pkg),
      keywords: [pkg.title, pkg.duration, pkg.overview, pkg.destination]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  }

  // Kilimanjaro treks
  for (const trek of (kilimanjaroTreks || [])) {
    entries.push({
      type: 'Kilimanjaro',
      label: trek.title,
      sub: trek.duration,
      href: tourHref(trek),
      keywords: [trek.title, trek.duration, trek.route, trek.overview]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  }

  // Accommodations
  for (const lodge of (lodges || [])) {
    entries.push({
      type: 'Lodge',
      label: lodge.name,
      sub: lodge.place || lodge.region,
      href: '/accommodations/',
      keywords: [lodge.name, lodge.place, lodge.region, lodge.blurb]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  }

  // Pages (nav links)
  const PAGE_EXTRA = {
    '/': 'home golden memories safaris tanzania safari',
    '/about/': 'about us team arusha guides story',
    '/contact/': 'contact enquiry plan trip email phone',
    '/booking/': 'book booking reservation',
    '/reviews/': 'reviews testimonials tripadvisor google',
  };
  for (const link of (navLinks || [])) {
    entries.push({
      type: 'Page',
      label: link.label,
      sub: link.href,
      href: link.href,
      keywords: [link.label, PAGE_EXTRA[link.href] || ''].join(' ').toLowerCase(),
    });
  }

  return entries;
}

let _index = null;
function getIndex() {
  if (!_index) _index = buildIndex();
  return _index;
}

const TYPE_BADGE = {
  Safari: 'Safari',
  Destination: 'Park',
  Blog: 'Blog',
  'Group Safari': 'Group',
  Kilimanjaro: 'Kili',
  Lodge: 'Lodge',
  Page: 'Page',
};

/**
 * Search the site index for a query string.
 * Returns up to `limit` entries sorted by relevance.
 */
export function searchSite(rawQuery, { limit = 8 } = {}) {
  const query = String(rawQuery || '').trim().toLowerCase();
  if (!query) return [];

  const terms = query.split(/\s+/).filter(Boolean);
  const index = getIndex();

  const scored = [];
  for (const entry of index) {
    let score = 0;
    for (const term of terms) {
      if (entry.label.toLowerCase().includes(term)) score += 3;
      else if (entry.keywords.includes(term)) score += 1;
    }
    if (score > 0) scored.push({ ...entry, score });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Render a dropdown list of search results as an HTML string.
 */
export function renderSearchResults(results, query) {
  if (!results.length) {
    return `
      <div class="search-results-empty">
        <p>No results for <strong>"${escHtml(query)}"</strong></p>
        <a href="/tours/" class="search-results-all">Browse all safaris →</a>
      </div>`;
  }

  const items = results
    .map(
      (r) => `
      <a class="search-result-item" href="${r.href}">
        <span class="search-result-badge">${TYPE_BADGE[r.type] || r.type}</span>
        <span class="search-result-body">
          <span class="search-result-label">${highlightMatch(escHtml(r.label), query)}</span>
          <span class="search-result-meta">${r.sub ? escHtml(r.sub) : ''}</span>
        </span>
      </a>`
    )
    .join('');

  return `
    <div class="search-results-list" role="listbox" aria-label="Search results">
      ${items}
    </div>
    <div class="search-results-footer">
      <a href="/tours/?q=${encodeURIComponent(query)}" class="search-results-all">
        See all results for "${escHtml(query)}" →
      </a>
    </div>`;
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightMatch(text, query) {
  // Bold the first matched term in the label
  const term = query.split(/\s+/)[0];
  if (!term) return text;
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}
