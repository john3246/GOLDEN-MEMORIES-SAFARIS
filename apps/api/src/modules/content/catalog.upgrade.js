import { safariPackageTitle } from '@gm-safaris/safari-ui';
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
    description: safariPackageTitle(doc.description),
    seo: doc.seo
      ? {
          ...doc.seo,
          title: safariPackageTitle(doc.seo.title),
          description: safariPackageTitle(doc.seo.description),
          og_title: safariPackageTitle(doc.seo.og_title),
          og_description: safariPackageTitle(doc.seo.og_description),
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
  return emptyDraft('destinations', {
    title: place.name,
    slug: place.slug,
    region: place.region || '',
    kicker: place.kicker || '',
    tagline: place.tagline || '',
    blurb: place.tagline || place.blurb || '',
    location: place.location || '',
    cta: place.cta || 'Plan this safari',
    image: place.image || '',
    gallery: place.gallery || [],
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
    blocks: hasBlocks ? current.blocks : catalogDraft.blocks,
    seo_title: pickFilled(current, catalogDraft, 'seo_title'),
    seo_description: pickFilled(current, catalogDraft, 'seo_description'),
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

  await updateStore((store) => {
    for (const type of ['safaris', 'departures']) {
      for (const record of store[type] || []) {
        if (record.draft) record.draft = rewriteSafariDoc(record.draft);
        if (record.published) record.published = rewriteSafariDoc(record.published);
      }
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
