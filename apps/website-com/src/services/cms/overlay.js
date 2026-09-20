import '../../pages/tours/gms-trips.js';
import '../../pages/join-safari/packages.js';
import { joiningSafaris, joinFaqs } from '../../pages/join-safari/content.js';
import '../../pages/kilimanjaro/packages.js';
import { navLinks, site, testimonials, utilityLinks, featuredTours } from '../../pages/home/content.js';
import { lodges } from '../../pages/accommodations/content.js';
import { blogArticles } from '../../pages/blog/content.js';
import { destinationPlaces } from '../../pages/destinations/catalog.js';
import { destinationRegions } from '../../pages/destinations/content.js';
import { reviewList } from '../../pages/reviews/content.js';
import { safariFaqs } from '../../pages/tours/content.js';
import { kiliFaqs } from '../../pages/kilimanjaro/content.js';
import { assignUniqueCovers, uniqueCoverFor } from '../../media/gallery.js';
import { fetchPublicSettings, fetchPublishedContent } from '../api/cms.js';

assignUniqueCovers(featuredTours);

let pagesBySlug = new Map();

function replace(list, next) {
  list.splice(0, list.length, ...next);
}

function lines(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMenuItems(text) {
  return lines(text).map((line) => {
    const [label, href] = line.split('|').map((part) => part.trim());
    return { label: label || 'Link', href: href || '/' };
  });
}

function timedFetch(ms = 800) {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => window.clearTimeout(timer) };
}

function mapTestimonial(item) {
  return {
    name: item.title || 'Guest',
    detail: item.detail || '',
    quote: item.quote || '',
    image: item.image || '',
  };
}

function mapLodge(item) {
  const gallery = galleryUrls(item.gallery);
  return {
    id: item.id,
    name: item.title,
    place: item.place || '',
    blurb: item.blurb || '',
    category: item.category === 'luxury' ? 'luxury' : 'midrange',
    image: item.image || gallery[0] || '',
    gallery,
  };
}

function mapPost(item) {
  const paragraphs = lines(item.paragraphs);
  const blocks = Array.isArray(item.blocks) && item.blocks.length
    ? item.blocks
    : paragraphs.map((text) => ({ type: 'paragraph', text }));
  return {
    slug: item.slug,
    topic: item.topic || 'safari',
    date: item.date || '',
    title: item.title,
    excerpt: item.excerpt || '',
    image: item.hero_image?.url || item.image || '',
    hero_image: item.hero_image || { url: item.image || '', alt: item.title || '' },
    kicker: item.kicker || '',
    author: item.author || 'Golden Memories Safaris',
    blocks,
    paragraphs: paragraphs.length ? paragraphs : blocks.filter((block) => block.type === 'paragraph').map((block) => block.text),
    gallery: item.gallery || [],
    sections: item.sections,
    cta_label: item.cta_label || 'Plan this trip',
    cta_href: item.cta_href || '/contact/',
    seo_title: item.seo_title || item.seo?.title,
    seo_description: item.seo_description || item.seo?.description,
  };
}

function galleryUrls(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split('\n');
  return list.map((item) => (typeof item === 'string' ? item : item?.url || '')).map((item) => item.trim()).filter(Boolean);
}

function mapDestination(item, existing = {}) {
  const highlights = lines(item.highlights).map((line) => {
    const [title, ...rest] = line.split(/[—:-]/);
    return { title: (title || line).trim(), body: rest.join(' ').trim() || line };
  });
  const gallery = galleryUrls(item.gallery);
  return {
    ...existing,
    slug: item.slug || existing.slug,
    name: item.title || existing.name,
    kicker: item.region || existing.kicker || 'Tanzania',
    tagline: item.blurb || existing.tagline || '',
    region: item.region || existing.region || '',
    cta: existing.cta || 'Plan this safari',
    image: item.image || existing.image || '',
    gallery: gallery.length ? gallery : existing.gallery || (item.image ? [item.image] : []),
    match: existing.match || [item.slug],
    paragraphs: lines(item.paragraphs).length ? lines(item.paragraphs) : existing.paragraphs || [],
    highlights: highlights.length ? highlights : existing.highlights || [],
    seasons: existing.seasons || [],
    wildlife: existing.wildlife || [],
    activities: existing.activities || [],
    attractions: existing.attractions || [],
    faqs: existing.faqs || [],
    facts: existing.facts || [],
    location: item.region || existing.location || '',
  };
}

function applyFaqs(items) {
  if (!items?.length) return;
  const grouped = { safaris: [], kilimanjaro: [], 'join-safari': [] };
  for (const item of items) {
    const group = item.group || 'safaris';
    const row = { q: item.title, a: item.answer };
    if (grouped[group]) grouped[group].push(row);
    else grouped.safaris.push(row);
  }
  if (grouped.safaris.length) replace(safariFaqs, grouped.safaris);
  if (grouped.kilimanjaro.length) replace(kiliFaqs, grouped.kilimanjaro);
  if (grouped['join-safari'].length) replace(joinFaqs, grouped['join-safari']);
}

function mapDeparture(item) {
  return {
    id: item.slug || item.id,
    title: item.title,
    datesLabel: item.dates || '',
    start: item.start || '',
    end: item.end || '',
    duration: item.duration || '',
    places: '',
    image: item.image || '',
    spaces: item.spaces || 'Spaces limited',
    deposit: 'Join group',
    tags: [],
    overview: item.overview || '',
    cta: 'Ask to join this departure',
    highlights: lines(item.highlights),
    days: [],
  };
}

export function seoForPath(pathname) {
  const slug =
    pathname === '/' || pathname === ''
      ? 'home'
      : pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
  return pagesBySlug.get(slug) || null;
}

/**
 * Overlay published CMS records onto the static site content.
 * Local copy remains the fallback if the API is down or empty.
 */
export async function hydrateFromCms() {
  const wait = timedFetch(900);
  try {
    const [settings, menus, reviews, cmsLodges, posts, destinations, departures, pages, faqs] =
      await Promise.all([
        fetchPublicSettings(wait.signal).catch(() => null),
        fetchPublishedContent('menus', wait.signal).catch(() => []),
        fetchPublishedContent('testimonials', wait.signal).catch(() => []),
        fetchPublishedContent('lodges', wait.signal).catch(() => []),
        fetchPublishedContent('posts', wait.signal).catch(() => []),
        fetchPublishedContent('destinations', wait.signal).catch(() => []),
        fetchPublishedContent('departures', wait.signal).catch(() => []),
        fetchPublishedContent('pages', wait.signal).catch(() => []),
        fetchPublishedContent('faqs', wait.signal).catch(() => []),
      ]);

    if (settings?.site) {
      Object.assign(site, settings.site);
      if (Array.isArray(settings.site.socials) && settings.site.socials.length) {
        replace(site.socials, settings.site.socials);
      }
    }

    pagesBySlug = new Map((pages || []).map((page) => [page.slug, page]));

    const primary = (menus || []).find((item) => item.location === 'primary');
    const utility = (menus || []).find((item) => item.location === 'utility');
    if (primary?.items) replace(navLinks, parseMenuItems(primary.items));
    if (utility?.items) {
      replace(
        utilityLinks,
        parseMenuItems(utility.items).map((item, index) => ({
          ...item,
          icon: utilityLinks[index]?.icon || 'doc',
        }))
      );
    }

    if (reviews?.length) {
      const mapped = reviews.map(mapTestimonial);
      for (const item of mapped) {
        const index = testimonials.findIndex((entry) => entry.name === item.name && entry.quote === item.quote);
        const byName = testimonials.findIndex((entry) => entry.name === item.name);
        const target = index >= 0 ? index : byName;
        if (target >= 0) testimonials.splice(target, 1, item);
        else testimonials.push(item);
      }
      replace(reviewList, testimonials.slice());
    }

    applyFaqs(faqs);

    if (cmsLodges?.length) replace(lodges, cmsLodges.map(mapLodge));

    if (posts?.length) {
      for (const post of posts) {
        const mapped = mapPost(post);
        const index = blogArticles.findIndex((item) => item.slug === mapped.slug);
        if (index >= 0) blogArticles.splice(index, 1, mapped);
        else blogArticles.unshift(mapped);
      }
    }

    const cmsDestinationImages = new Map();
    if (destinations?.length) {
      for (const item of destinations) {
        if (item.image) cmsDestinationImages.set(item.slug, item.image);
        const existingIndex = destinationPlaces.findIndex((place) => place.slug === item.slug);
        const mapped = mapDestination(item, existingIndex >= 0 ? destinationPlaces[existingIndex] : {});
        if (existingIndex >= 0) destinationPlaces.splice(existingIndex, 1, mapped);
        else destinationPlaces.push(mapped);

        for (const region of destinationRegions) {
          const park = region.parks?.find((entry) => entry.slug === item.slug);
          if (park) {
            park.name = item.title || park.name;
            park.blurb = item.blurb || park.blurb;
            park.image = item.image || park.image;
          }
        }
      }
    }

    const cmsDepartureImages = new Map();
    if (departures?.length) {
      for (const item of departures) {
        const mapped = mapDeparture(item);
        if (mapped.image) cmsDepartureImages.set(mapped.id, mapped.image);
        const index = joiningSafaris.findIndex(
          (trip) => trip.id === mapped.id || trip.title === mapped.title
        );
        if (index >= 0) {
          Object.assign(joiningSafaris[index], {
            title: mapped.title || joiningSafaris[index].title,
            datesLabel: mapped.datesLabel || joiningSafaris[index].datesLabel,
            start: mapped.start || joiningSafaris[index].start,
            end: mapped.end || joiningSafaris[index].end,
            duration: mapped.duration || joiningSafaris[index].duration,
            spaces: mapped.spaces || joiningSafaris[index].spaces,
            overview: mapped.overview || joiningSafaris[index].overview,
            image: mapped.image || joiningSafaris[index].image,
            highlights: mapped.highlights.length ? mapped.highlights : joiningSafaris[index].highlights,
          });
          if (mapped.image) cmsDepartureImages.set(joiningSafaris[index].id, mapped.image);
        } else {
          joiningSafaris.push({ ...mapped, days: mapped.days || [] });
        }
      }
    }

    for (const trip of joiningSafaris) {
      if (cmsDepartureImages.has(trip.id)) {
        trip.image = cmsDepartureImages.get(trip.id);
        continue;
      }
      trip.image = uniqueCoverFor(trip);
    }
    for (const place of destinationPlaces) {
      if (cmsDestinationImages.has(place.slug)) {
        place.image = cmsDestinationImages.get(place.slug);
        continue;
      }
      place.image = uniqueCoverFor(place);
    }
    for (const region of destinationRegions) {
      for (const park of region.parks || []) {
        if (cmsDestinationImages.has(park.slug)) {
          park.image = cmsDestinationImages.get(park.slug);
          continue;
        }
        park.image = uniqueCoverFor(park);
      }
    }
  } catch {
    /* keep local fallback */
  } finally {
    wait.done();
  }
}
