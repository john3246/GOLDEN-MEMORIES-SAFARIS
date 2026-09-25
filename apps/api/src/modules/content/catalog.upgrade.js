import { safariPackageTitle, clampSeoTitle, DESTINATION_COORDINATES, normalizeGroupSafariDocument } from '@gm-safaris/safari-ui';
import { updateStore } from '../../cms-store/index.js';
import { emptyDraft } from './types.js';
import { logger } from '../../logging/index.js';

function groupNav(text) {
  return String(text || '').replace(/\bJoin Safari\b/g, 'Group Safari');
}

function rewriteSafariDoc(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  return {
    ...doc,
    title: safariPackageTitle(doc.title),
    short_description: safariPackageTitle(doc.short_description),
    description: safariPackageTitle(doc.description, { commas: false }),
    seo: doc.seo
      ? {
          ...doc.seo,
          title: clampSeoTitle(doc.seo.title, doc.title),
          description: safariPackageTitle(doc.seo.description, { commas: false }),
          og_title: clampSeoTitle(doc.seo.og_title, doc.seo.title || doc.title),
          og_description: safariPackageTitle(doc.seo.og_description, { commas: false }),
        }
      : doc.seo,
    hero_image: doc.hero_image
      ? { ...doc.hero_image, alt: safariPackageTitle(doc.hero_image.alt || doc.title) }
      : doc.hero_image,
  };
}

function pickFilled(current, catalog, key) {
  return String(current?.[key] || '').trim() ? current[key] : catalog[key];
}

function destinationDraftFromPlace(place) {
  const coords = DESTINATION_COORDINATES[place.slug] || {};
  return emptyDraft('destinations', {
    title: place.name,
    slug: place.slug,
    region: place.region || '',
    country: place.country || 'Tanzania',
    kicker: place.kicker || '',
    tagline: place.tagline || '',
    blurb: place.tagline || place.blurb || '',
    location: place.location || '',
    cta: place.cta || 'Plan this safari',
    image: place.image || '',
    image_alt: place.name || '',
    gallery: place.gallery || [],
    lat: place.lat ?? coords.lat ?? '',
    lng: place.lng ?? coords.lng ?? '',
    climate: place.climate || '',
    getting_there: place.gettingThere || place.getting_there || '',
    airstrips: place.airstrips || [],
    entry_fees: place.entryFees || place.entry_fees || '',
    match: place.match || [place.slug],
    paragraphs: place.paragraphs || [],
    highlights: place.highlights || [],
    facts: place.facts || [],
    seasons: place.seasons || [],
    wildlife: place.wildlife || [],
    activities: place.activities || [],
    attractions: place.attractions || [],
    faqs: place.faqs || [],
    seo_title: place.name,
    seo_description: place.tagline || '',
  });
}

function explicitValue(raw, key, notEqualTo) {
  const value = String(raw?.[key] || '').trim();
  if (!value) return '';
  if (notEqualTo && value === String(raw[notEqualTo] || '').trim()) return '';
  return value;
}

function enrichDestination(doc, catalogDraft) {
  const raw = doc || {};
  const current = emptyDraft('destinations', raw);
  if (!catalogDraft) return current;
  const hasBlocks = Array.isArray(current.blocks) && current.blocks.length;
  const explicitKicker = explicitValue(raw, 'kicker', 'region');
  const explicitTagline = explicitValue(raw, 'tagline') || explicitValue(raw, 'blurb');
  const explicitLocation = explicitValue(raw, 'location', 'region');
  return emptyDraft('destinations', {
    ...catalogDraft,
    ...current,
    kicker: explicitKicker || catalogDraft.kicker,
    tagline: explicitTagline || catalogDraft.tagline,
    blurb: explicitTagline || catalogDraft.blurb,
    location: explicitLocation || catalogDraft.location,
    cta: pickFilled(current, catalogDraft, 'cta'),
    image: current.image || catalogDraft.image,
    gallery: current.gallery?.length ? current.gallery : catalogDraft.gallery,
    highlights: pickFilled(current, catalogDraft, 'highlights'),
    facts: pickFilled(current, catalogDraft, 'facts'),
    seasons: pickFilled(current, catalogDraft, 'seasons'),
    wildlife: pickFilled(current, catalogDraft, 'wildlife'),
    activities: pickFilled(current, catalogDraft, 'activities'),
    attractions: pickFilled(current, catalogDraft, 'attractions'),
    faqs: pickFilled(current, catalogDraft, 'faqs'),
    climate: pickFilled(current, catalogDraft, 'climate'),
    getting_there: pickFilled(current, catalogDraft, 'getting_there'),
    airstrips: pickFilled(current, catalogDraft, 'airstrips'),
    entry_fees: pickFilled(current, catalogDraft, 'entry_fees'),
    lat: current.lat || catalogDraft.lat,
    lng: current.lng || catalogDraft.lng,
    country: pickFilled(current, catalogDraft, 'country'),
    image_alt: pickFilled(current, catalogDraft, 'image_alt'),
    blocks: hasBlocks ? current.blocks : catalogDraft.blocks,
    seo_title: pickFilled(current, catalogDraft, 'seo_title'),
    seo_description: pickFilled(current, catalogDraft, 'seo_description'),
    canonical_url: pickFilled(current, catalogDraft, 'canonical_url'),
    og_image: pickFilled(current, catalogDraft, 'og_image'),
  });
}

export { destinationDraftFromPlace };

export async function upgradeCatalogCopy() {
  let catalogPlaces = [];
  try {
    const mod = await import('../../../../website-com/src/pages/destinations/catalog.js');
    catalogPlaces = mod.destinationPlaces || [];
  } catch (err) {
    logger.warn('Destination catalog enrich skipped', { message: err instanceof Error ? err.message : String(err) });
  }
  const bySlug = new Map(catalogPlaces.map((place) => [place.slug, place]));

  let joinTrips = [];
  try {
    const pkgs = await import('../../../../website-com/src/pages/join-safari/packages.js');
    const content = await import('../../../../website-com/src/pages/join-safari/content.js');
    joinTrips = [...(pkgs.openJoiningPackages || []), ...(content.joiningSafaris || [])];
  } catch (err) {
    logger.warn('Group safari catalog enrich skipped', { message: err instanceof Error ? err.message : String(err) });
  }
  const joinByKey = new Map();
  for (const trip of joinTrips) {
    if (trip.id) joinByKey.set(trip.id, trip);
    if (trip.slug) joinByKey.set(trip.slug, trip);
    if (trip.title) joinByKey.set(String(trip.title).toLowerCase(), trip);
  }

  function enrichDeparture(doc) {
    const trip =
      joinByKey.get(doc?.slug) ||
      joinByKey.get(doc?.id) ||
      joinByKey.get(String(doc?.title || '').toLowerCase());
    return normalizeGroupSafariDocument({
      ...doc,
      days: doc?.itinerary?.length ? doc.itinerary : doc?.days?.length ? doc.days : trip?.days,
      included: doc?.inclusions?.length ? doc.inclusions : doc?.included || trip?.included,
      excluded: doc?.exclusions?.length ? doc.exclusions : doc?.excluded || trip?.excluded,
      price_from: doc?.price_from || trip?.price_from,
      destination: doc?.destination || trip?.places,
      currency: doc?.currency || trip?.currency || 'USD',
      dates: doc?.dates || trip?.datesLabel,
      spaces: doc?.spaces || trip?.spaces,
      overview: doc?.overview || trip?.overview,
      image: doc?.image || doc?.hero_image?.url || trip?.image,
      duration: doc?.duration_label || doc?.duration || trip?.duration,
    });
  }

  await updateStore((store) => {
    for (const record of store.safaris || []) {
      if (record.draft) record.draft = rewriteSafariDoc(record.draft);
      if (record.published) record.published = rewriteSafariDoc(record.published);
    }
    for (const record of store.departures || []) {
      if (record.draft) record.draft = enrichDeparture(record.draft);
      if (record.published) record.published = enrichDeparture(record.published);
    }
    for (const record of store.pages || []) {
      if (record.draft?.title) record.draft.title = groupNav(record.draft.title);
      if (record.published?.title) record.published.title = groupNav(record.published.title);
    }
    for (const record of store.menus || []) {
      if (record.draft?.items) record.draft.items = groupNav(record.draft.items);
      if (record.published?.items) record.published.items = groupNav(record.published.items);
    }
    store.destinations = (store.destinations || []).filter(
      (record) => !['gombe', 'mahale'].includes(record.slug)
    );
    store.posts = (store.posts || []).filter((record) => record.slug !== 'western-tanzania-chimps');
    for (const record of store.destinations || []) {
      const place = bySlug.get(record.slug);
      const catalogDraft = place ? destinationDraftFromPlace(place) : null;
      record.draft = enrichDestination(record.draft, catalogDraft);
      if (record.published) record.published = enrichDestination(record.published, catalogDraft);
    }
  });

  logger.info('Catalog copy upgraded', {
    dayTitles: true,
    groupSafariNav: true,
    destinations: catalogPlaces.length,
  });
}
