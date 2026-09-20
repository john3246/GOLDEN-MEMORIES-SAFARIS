import { enabledSections } from './model.js';
import { wrapSection } from './edit.js';
import { escapeHtml } from './escape.js';
import { renderHero, renderOverview } from './sections/hero-overview.js';
import { renderHighlights, renderGallery, renderFacts } from './sections/highlights-gallery.js';
import { renderItinerary, renderAccommodation, renderLodges } from './sections/itinerary.js';
import {
  renderIncluded,
  renderExcluded,
  renderDestination,
  renderMap,
  renderFaq,
  renderBookingCta,
  renderRelated,
} from './sections/lists.js';

const SECTION_RENDERERS = {
  hero: renderHero,
  overview: renderOverview,
  highlights: renderHighlights,
  gallery: renderGallery,
  facts: renderFacts,
  itinerary: renderItinerary,
  accommodation: renderAccommodation,
  lodges: renderLodges,
  included: renderIncluded,
  excluded: renderExcluded,
  destination: renderDestination,
  map: renderMap,
  faq: renderFaq,
  booking_cta: renderBookingCta,
};

/**
 * Render a Safari package page. Used by the public website and CMS preview.
 *
 * @param {Record<string, unknown>} safari
 * @param {{ editable?: boolean, relatedHtml?: string, breadcrumb?: boolean }} [options]
 */
export function renderSafariPage(safari, options = {}) {
  if (!safari) {
    return `
      <main id="main" class="bg-mist py-12">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Safaris</p>
          <h1 class="section-title">Package not found</h1>
          <p class="mt-4 text-ink/70">That itinerary is no longer listed. Browse current Tanzania safari packages instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/tours/">View all safaris</a>
        </div>
      </main>
    `;
  }

  const editable = Boolean(options.editable);
  const sections = enabledSections(safari);
  const enabled = new Set(sections.map((item) => item.type));
  const skip = new Set();
  const body = [];

  if (enabled.has('overview')) {
    skip.add('highlights');
    skip.add('facts');
    skip.add('destination');
  }

  for (const section of sections) {
    if (skip.has(section.type)) continue;
    if (isEmptySection(section.type, safari, options)) continue;

    if (section.type === 'related') {
      body.push(wrapSection('related', renderRelated(options.relatedHtml || ''), options));
      continue;
    }

    if (section.type === 'included' || section.type === 'excluded') {
      const hasIncluded = !isEmptySection('included', safari, options);
      const hasExcluded = !isEmptySection('excluded', safari, options);
      if (hasIncluded && hasExcluded && !skip.has('included') && !skip.has('excluded')) {
        const included = renderIncluded(safari, options);
        const excluded = renderExcluded(safari, options);
        const pair = `
          <section class="bg-mist py-8 sm:py-10" aria-labelledby="included-title">
            <div class="container-site grid gap-6 md:grid-cols-2">
              ${included}
              ${excluded}
            </div>
          </section>
        `;
        body.push(wrapSection('included', pair, options));
        skip.add('included');
        skip.add('excluded');
        continue;
      }
    }

    const renderer = SECTION_RENDERERS[section.type];
    if (!renderer) continue;
    body.push(wrapSection(section.type, renderer(safari, options), options));
  }

  const crumb = options.breadcrumb === false ? '' : renderBreadcrumb(safari);

  return `
    <main id="main" class="${editable ? 'safari-preview-root' : ''}">
      ${insertBreadcrumb(body.join('\n'), crumb)}
    </main>
  `;
}

function isEmptySection(type, safari, options = {}) {
  if (type === 'gallery') return !(safari.gallery || []).some((item) => item?.url);
  if (type === 'map') return !safari.map?.embed_url;
  if (type === 'faq') return !(safari.faq || []).some((item) => item?.q);
  if (type === 'related') return !options.relatedHtml;
  if (type === 'highlights') return !(safari.highlights || []).filter(Boolean).length;
  if (type === 'accommodation') return !String(safari.accommodation || '').trim();
  if (type === 'included') return !(safari.inclusions || safari.included || []).filter(Boolean).length;
  if (type === 'excluded') return !(safari.exclusions || safari.excluded || []).filter(Boolean).length;
  if (type === 'itinerary') return !(safari.itinerary || []).length;
  if (type === 'lodges') return !(safari.lodges || []).length;
  return false;
}

function insertBreadcrumb(html, crumb) {
  if (!crumb) return html;
  const marker = '</section>';
  const idx = html.indexOf(marker);
  if (idx === -1) return `${crumb}${html}`;
  return `${html.slice(0, idx + marker.length)}${crumb}${html.slice(idx + marker.length)}`;
}

function renderBreadcrumb(safari) {
  return `
    <nav class="bg-white py-4" aria-label="Breadcrumb">
      <div class="container-site font-body text-sm text-black/60">
        <a class="hover:text-gold-deep" href="/">Home</a>
        <span aria-hidden="true"> › </span>
        <a class="hover:text-gold-deep" href="/tours/">Safaris</a>
        <span aria-hidden="true"> › </span>
        <span class="text-black">${escapeHtml(safari.title || 'Safari')}</span>
      </div>
    </nav>
  `;
}

/**
 * Apply SEO tags when a document is available (browser only).
 * @param {Record<string, unknown>} safari
 */
export function applySafariMeta(safari) {
  if (typeof document === 'undefined' || !safari) return;
  const seo = safari.seo || {};
  document.title = seo.title || `${safari.title} | Golden Memories Safaris`;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', seo.description || safari.short_description || safari.description || '');
  }
  setMeta('link[rel="canonical"]', 'href', seo.canonical);
  setMeta('meta[property="og:title"]', 'content', seo.og_title || seo.title || safari.title);
  setMeta('meta[property="og:description"]', 'content', seo.og_description || seo.description || safari.short_description);
  setMeta('meta[property="og:image"]', 'content', seo.og_image || safari.hero_image?.url);
  setMeta('meta[name="robots"]', 'content', seo.robots || 'index,follow');
}

function setMeta(selector, attr, value) {
  if (!value || typeof document === 'undefined') return;
  let el = document.querySelector(selector);
  if (!el && selector.startsWith('meta')) {
    el = document.createElement('meta');
    const match = selector.match(/\[([a-z:]+)="([^"]+)"\]/i);
    if (match) el.setAttribute(match[1], match[2]);
    document.head.appendChild(el);
  }
  if (el) el.setAttribute(attr, value);
}
