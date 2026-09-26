import { gmsTrips } from '../../pages/tours/gms-trips.js';
import { openJoiningPackages } from '../../pages/join-safari/packages.js';
import { joiningSafaris, joinFaqs } from '../../pages/join-safari/content.js';
import { kilimanjaroTreks } from '../../pages/kilimanjaro/packages.js';
import { navLinks, site, testimonials, utilityLinks, featuredTours, dayTrips, zanzibar } from '../../pages/home/content.js';
import { safariPackages } from '../../pages/tours/content.js';
import { lodges } from '../../pages/accommodations/content.js';
import { blogArticles } from '../../pages/blog/content.js';
import { destinationPlaces, destinationSlugsFromCopy } from '../../pages/destinations/catalog.js';
import { destinationRegions } from '../../pages/destinations/content.js';
import { reviewList } from '../../pages/reviews/content.js';
import { safariFaqs } from '../../pages/tours/content.js';
import { kiliFaqs } from '../../pages/kilimanjaro/content.js';
import { assignUniqueCovers, uniqueCoverFor } from '../../media/gallery.js';
import { destinationForWebsite, safariPackageTitle, normalizeLodgeCategory, normalizeBlogDocument, blogDocumentHasBody, normalizeGroupSafariDocument, publicMediaUrl } from '@gm-safaris/safari-ui';
import { fetchSiteBundle, fetchPublishedContentBySlug } from '../api/cms.js';

assignUniqueCovers(featuredTours);

let pagesBySlug = new Map();

/** Guest reviews + ratings from Google / TripAdvisor / SafariBookings (filled by hydrateFromCms). */
export const reviewData = { reviews: [], summary: {}, links: {} };

/** Published CMS tours from the site bundle (used by tour detail pages). */
export const cmsSafaris = [];

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
    return { label: (label || 'Link').replace(/\bJoin Safari\b/g, 'Group Safari'), href: href || '/' };
  });
}

function timedFetch(ms = 2500) {
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

function applyCmsImage(item, url) {
  const src = publicMediaUrl(url);
  if (!src || !item) return;
  item.image = src;
  if (item.hero_image && typeof item.hero_image === 'object') {
    item.hero_image = { ...item.hero_image, url: src };
  }
}

function overlaySafaris(safaris) {
  for (const safari of safaris || []) {
    const src = publicMediaUrl(safari.hero_image?.url || safari.image);
    const inclusions = safari.inclusions?.length ? safari.inclusions : (safari.included || []);
    const exclusions = safari.exclusions?.length ? safari.exclusions : (safari.excluded || []);
    const overview = safari.description || safari.short_description || safari.overview || '';
    const destination = safari.destination || safari.places || '';
    const priceFrom = safari.price_from ?? safari.price;

    for (const list of [featuredTours, gmsTrips, kilimanjaroTreks, safariPackages, dayTrips, zanzibar]) {
      const found = (list || []).find((trip) => trip.slug === safari.slug || trip.id === safari.slug);
      if (found) {
        if (src) applyCmsImage(found, src);
        if (safari.title) found.title = safariPackageTitle(safari.title);
        if (overview) {
          found.overview = overview;
          found.description = overview;
          found.body = overview;
        }
        if (destination) {
          found.destination = destination;
          found.places = destination;
        }
        if (priceFrom) {
          found.price_from = priceFrom;
          found.price = priceFrom;
        }
        if (safari.duration_label || safari.duration) {
          found.duration = safari.duration_label || (safari.duration ? `${safari.duration} Days` : found.duration);
        }
        if (safari.highlights?.length) found.highlights = safari.highlights;
        if (inclusions.length) {
          found.inclusions = inclusions;
          found.included = inclusions;
        }
        if (exclusions.length) {
          found.exclusions = exclusions;
          found.excluded = exclusions;
        }
        if (safari.itinerary?.length) {
          found.itinerary = safari.itinerary;
          found.days = safari.itinerary;
        }
        if (safari.tour_type) {
          found.tour_type = safari.tour_type;
          found.style = safari.tour_type;
        }
        if (safari.difficulty) found.difficulty = safari.difficulty;
      }
    }

    const inGms = gmsTrips.find((trip) => trip.slug === safari.slug || trip.id === safari.slug);
    if (!inGms) {
      gmsTrips.push({
        slug: safari.slug,
        title: safariPackageTitle(safari.title),
        duration: safari.duration_label || (safari.duration ? `${safari.duration} Days` : ''),
        activity: safari.tour_type === 'mountain' ? 'Mountain Trek' : 'Wildlife Safari',
        places: destination,
        destination,
        overview,
        description: overview,
        image: src || uniqueCoverFor(safari),
        style: safari.tour_type || 'wildlife',
        tour_type: safari.tour_type || 'safari',
        price_from: priceFrom,
        highlights: safari.highlights || [],
        included: inclusions,
        inclusions,
        excluded: exclusions,
        exclusions,
        itinerary: safari.itinerary || [],
      });
    }
  }
}

function mapLodge(item) {
  const gallery = galleryUrls(item.gallery);
  return {
    id: item.id,
    name: item.title,
    place: item.place || '',
    blurb: item.blurb || '',
    category: normalizeLodgeCategory(item.category),
    region: item.region || '',
    website: item.website || '',
    image: publicMediaUrl(item.image || gallery[0] || ''),
    gallery,
  };
}

function mapPost(item) {
  const mapped = normalizeBlogDocument({
    ...item,
    image: publicMediaUrl(item.hero_image?.url || item.image || ''),
    hero_image: {
      ...(item.hero_image && typeof item.hero_image === 'object' ? item.hero_image : {}),
      url: publicMediaUrl(item.hero_image?.url || item.image || ''),
      alt: item.hero_image?.alt || item.title || '',
    },
    seo_title: item.seo_title || item.seo?.title,
    seo_description: item.seo_description || item.seo?.description,
  });
  mapped.destination_slugs = destinationSlugsFromCopy(
    `${mapped.title} ${mapped.excerpt} ${mapped.slug}`,
    mapped.destination_slugs
  );
  return mapped;
}

function postHasBody(item) {
  return blogDocumentHasBody(item);
}

function upsertPost(post) {
  const mapped = mapPost(post);
  if (!mapped.slug) return mapped;
  const index = blogArticles.findIndex((item) => item.slug === mapped.slug);
  if (index >= 0) {
    const existing = blogArticles[index];
    if (!postHasBody(mapped) && postHasBody(existing)) {
      blogArticles.splice(index, 1, {
        ...existing,
        ...mapped,
        paragraphs: existing.paragraphs,
        blocks: existing.blocks?.length ? existing.blocks : mapped.blocks,
      });
    } else {
      blogArticles.splice(index, 1, mapped);
    }
  } else if (postHasBody(mapped) || mapped.title) {
    blogArticles.unshift(mapped);
  }
  return mapped;
}

function galleryUrls(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split('\n');
  return list.map((item) => (typeof item === 'string' ? item : item?.url || '')).map((item) => publicMediaUrl(item.trim())).filter(Boolean);
}

function mapDestination(item, existing = {}) {
  return destinationForWebsite(item, existing);
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

function mapJoinDay(day) {
  return {
    day: day.day,
    title: day.title,
    body: day.description || day.body || '',
    stay: day.accommodation || day.stay || '',
    meals: day.meals || '',
    viewing: day.viewing || '',
    transport: day.transport || '',
    image: typeof day.image === 'string' ? publicMediaUrl(day.image) : publicMediaUrl(day.image?.url || ''),
  };
}

function mapDeparture(item) {
  const doc = normalizeGroupSafariDocument(item);
  const days = (doc.itinerary || []).map(mapJoinDay);
  return {
    id: doc.slug || item.slug || item.id,
    slug: doc.slug || item.slug || item.id,
    title: safariPackageTitle(doc.title),
    datesLabel: doc.dates || '',
    start: doc.start || '',
    end: doc.end || '',
    duration: doc.duration_label || (doc.duration ? `${doc.duration} Days` : ''),
    places: doc.destination || '',
    image: publicMediaUrl(doc.hero_image?.url || doc.image || ''),
    spaces: doc.spaces || 'Spaces limited',
    deposit: doc.deposit || 'Join group',
    tags: [],
    overview: doc.overview || doc.short_description || '',
    cta: 'Ask to join this departure',
    highlights: doc.highlights || [],
    included: doc.inclusions || [],
    excluded: doc.exclusions || [],
    days,
    itinerary: days,
    price_from: doc.price_from,
    currency: doc.currency || 'USD',
    activity: doc.difficulty || 'Group Safari',
    featured: Boolean(doc.featured),
  };
}

function upsertJoinList(list, mapped) {
  const index = list.findIndex(
    (trip) => trip.id === mapped.id || trip.slug === mapped.slug || trip.title === mapped.title
  );
  if (index >= 0) {
    const existing = list[index];
    list.splice(index, 1, {
      ...existing,
      ...mapped,
      // Keep the public URL stable: the website slug wins, the CMS slug becomes an alias.
      slug: existing.slug || mapped.slug,
      cmsSlug: mapped.slug,
      days: mapped.days?.length ? mapped.days : existing.days,
      itinerary: mapped.itinerary?.length ? mapped.itinerary : existing.itinerary,
      included: mapped.included?.length ? mapped.included : existing.included,
      excluded: mapped.excluded?.length ? mapped.excluded : existing.excluded,
      highlights: mapped.highlights?.length ? mapped.highlights : existing.highlights,
      image: mapped.image || existing.image,
    });
    return list[index];
  }
  list.push({ ...mapped, days: mapped.days || [] });
  return list[list.length - 1];
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
  const wait = timedFetch(6000);
  try {
    const bundle = await fetchSiteBundle(wait.signal);
    const {
      settings,
      menus,
      testimonials: reviews,
      lodges: cmsLodges,
      posts,
      destinations,
      departures,
      pages,
      faqs,
      safaris,
    } = bundle || {};
    reviewData.reviews = bundle?.reviews || [];
    reviewData.summary = bundle?.reviewSummary || {};
    reviewData.links = bundle?.reviewLinks || {};
    replace(cmsSafaris, safaris || []);

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
      for (const post of posts) upsertPost(post);
    }

    const cmsDestinationImages = new Map();
    if (destinations?.length) {
      for (const item of destinations) {
        if (item.image) cmsDestinationImages.set(item.slug, publicMediaUrl(item.image));
        const existingIndex = destinationPlaces.findIndex((place) => place.slug === item.slug);
        let mapped;
        try {
          mapped = mapDestination(item, existingIndex >= 0 ? destinationPlaces[existingIndex] : {});
        } catch {
          continue;
        }
        if (existingIndex >= 0) destinationPlaces.splice(existingIndex, 1, mapped);
        else destinationPlaces.push(mapped);

        for (const region of destinationRegions) {
          const park = region.parks?.find((entry) => entry.slug === item.slug);
          if (park) {
            park.name = item.title || park.name;
            park.blurb = item.blurb || item.tagline || park.blurb;
            park.image = publicMediaUrl(item.image) || park.image;
          }
        }
      }
    }

    const cmsDepartureImages = new Map();
    if (departures?.length) {
      for (const item of departures) {
        const mapped = mapDeparture(item);
        if (mapped.image) cmsDepartureImages.set(mapped.id, mapped.image);
        const merged = upsertJoinList(joiningSafaris, mapped);
        upsertJoinList(openJoiningPackages, mapped);
        if (merged.image) cmsDepartureImages.set(merged.id, merged.image);
        if (mapped.slug) cmsDepartureImages.set(mapped.slug, mapped.image);
      }
    }

    overlaySafaris(safaris);

    for (const trip of joiningSafaris) {
      if (cmsDepartureImages.has(trip.id) || cmsDepartureImages.has(trip.slug)) {
        trip.image = cmsDepartureImages.get(trip.id) || cmsDepartureImages.get(trip.slug);
        continue;
      }
      trip.image = uniqueCoverFor(trip);
    }
    for (const trip of openJoiningPackages) {
      if (cmsDepartureImages.has(trip.id) || cmsDepartureImages.has(trip.slug)) {
        trip.image = cmsDepartureImages.get(trip.id) || cmsDepartureImages.get(trip.slug);
      }
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

/** Fetch one published destination by slug so a hard refresh shows the CMS version immediately. */
export async function hydratePublishedDestination(slug) {
  if (!slug) return null;
  const item = await fetchPublishedContentBySlug('destinations', slug);
  if (!item) return null;
  const existingIndex = destinationPlaces.findIndex((place) => place.slug === item.slug || place.slug === slug);
  let mapped;
  try {
    mapped = mapDestination(item, existingIndex >= 0 ? destinationPlaces[existingIndex] : {});
  } catch {
    return null;
  }
  if (existingIndex >= 0) destinationPlaces.splice(existingIndex, 1, mapped);
  else destinationPlaces.push(mapped);
  if (item.image) mapped.image = publicMediaUrl(item.image) || mapped.image;
  return mapped;
}

/** Fetch one published journal article by slug so a hard refresh shows the CMS version immediately. */
export async function hydratePublishedPost(slug) {
  if (!slug) return null;
  const post = await fetchPublishedContentBySlug('posts', slug);
  if (!post) return null;
  return upsertPost(post);
}
