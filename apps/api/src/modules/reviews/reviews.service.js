/**
 * Guest reviews from Google, TripAdvisor and SafariBookings — in one place.
 *
 * Google        Places API (New): place details with rating, total count and the
 *               5 most relevant reviews. Needs a Google Cloud API key with
 *               "Places API (New)" enabled + your Google Place ID.
 * TripAdvisor   Content API: location details + the 5 most recent reviews.
 *               Needs a TripAdvisor Content API key + your location ID.
 * SafariBookings  Has no public API. Paste reviews into the CMS (one per line
 *               or copy/paste the table) and set the overall score shown on
 *               your SafariBookings profile.
 *
 * Imported reviews are stored in the CMS (and PostgreSQL), de-duplicated by
 * source + external id, and can be hidden or featured by staff. Syncing runs
 * every 12 hours and on demand from the CMS.
 */
import crypto from 'node:crypto';
import { createId } from '@gm-safaris/shared-utils';
import { readStore, updateStore } from '../../cms-store/index.js';
import { notFound, validationError } from '../../errors/index.js';
import { encryptSecret, decryptSecret, maskSecret } from '../../security/secrets.js';
import { recordAudit } from '../audit/audit.service.js';
import { logger } from '../../logging/index.js';

export const REVIEW_SOURCES = Object.freeze({
  google: 'Google',
  tripadvisor: 'TripAdvisor',
  safaribookings: 'SafariBookings',
  website: 'Website',
});

const DEFAULT_SETTINGS = {
  autoPublish: true,
  minRatingToPublish: 4,
  google: { enabled: false, placeId: '', apiKey: '', profileUrl: '' },
  tripadvisor: { enabled: false, locationId: '', apiKey: '', profileUrl: '' },
  safaribookings: { profileUrl: '', rating: '', count: '' },
};

const TIMEOUT_MS = 12_000;

function now() {
  return new Date().toISOString();
}

function clampRating(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.max(1, Math.min(5, Math.round(n * 10) / 10));
}

function cleanText(value, max = 5000) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+\n/g, '\n')
    .trim()
    .slice(0, max);
}

function isoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function settingsFrom(store) {
  const saved = store.settings?.reviews || {};
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    google: { ...DEFAULT_SETTINGS.google, ...(saved.google || {}) },
    tripadvisor: { ...DEFAULT_SETTINGS.tripadvisor, ...(saved.tripadvisor || {}) },
    safaribookings: { ...DEFAULT_SETTINGS.safaribookings, ...(saved.safaribookings || {}) },
  };
}

function maskedSettings(settings) {
  return {
    ...settings,
    google: { ...settings.google, apiKey: maskSecret(settings.google.apiKey) },
    tripadvisor: { ...settings.tripadvisor, apiKey: maskSecret(settings.tripadvisor.apiKey) },
  };
}

async function fetchJson(url, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body?.error?.message || body?.message || body?.Message || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return body;
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('The review service did not respond in time');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Source adapters
// ---------------------------------------------------------------------------

async function fetchGoogle(config) {
  const apiKey = await decryptSecret(config.apiKey);
  if (!config.placeId || !apiKey) throw new Error('Add your Google Place ID and API key first');
  const body = await fetchJson(`https://places.googleapis.com/v1/places/${encodeURIComponent(config.placeId)}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'displayName,rating,userRatingCount,googleMapsUri,reviews',
      'Accept-Language': 'en',
    },
  });
  const reviews = (body.reviews || []).map((row) => ({
    source: 'google',
    externalId: row.name || crypto.createHash('sha1').update(JSON.stringify(row)).digest('hex'),
    author: cleanText(row.authorAttribution?.displayName || 'Google user', 120),
    authorUrl: row.authorAttribution?.uri || '',
    authorPhoto: row.authorAttribution?.photoUri || '',
    country: '',
    rating: clampRating(row.rating),
    title: '',
    text: cleanText(row.originalText?.text || row.text?.text || ''),
    language: row.originalText?.languageCode || row.text?.languageCode || '',
    date: isoDate(row.publishTime),
    url: row.googleMapsUri || body.googleMapsUri || '',
  }));
  return {
    summary: {
      rating: clampRating(body.rating),
      count: Number(body.userRatingCount || 0),
      url: config.profileUrl || body.googleMapsUri || '',
      name: body.displayName?.text || '',
    },
    reviews,
  };
}

async function fetchTripAdvisor(config) {
  const apiKey = await decryptSecret(config.apiKey);
  if (!config.locationId || !apiKey) throw new Error('Add your TripAdvisor location ID and API key first');
  const base = `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(config.locationId)}`;
  const headers = { Accept: 'application/json', Referer: 'https://www.gmsafaris.com' };
  const [details, list] = await Promise.all([
    fetchJson(`${base}/details?language=en&currency=USD&key=${encodeURIComponent(apiKey)}`, { headers }),
    fetchJson(`${base}/reviews?language=en&key=${encodeURIComponent(apiKey)}`, { headers }),
  ]);
  const reviews = (list.data || []).map((row) => ({
    source: 'tripadvisor',
    externalId: String(row.id),
    author: cleanText(row.user?.username || 'TripAdvisor traveller', 120),
    authorUrl: '',
    authorPhoto: row.user?.avatar?.small || row.user?.avatar?.thumbnail || '',
    country: cleanText(row.user?.user_location?.name || '', 120),
    rating: clampRating(row.rating),
    title: cleanText(row.title || '', 200),
    text: cleanText(row.text || ''),
    language: row.lang || 'en',
    date: isoDate(row.published_date || row.travel_date),
    url: row.url || details.web_url || '',
  }));
  return {
    summary: {
      rating: clampRating(details.rating),
      count: Number(details.num_reviews || 0),
      url: config.profileUrl || details.web_url || '',
      name: details.name || '',
    },
    reviews,
  };
}

// ---------------------------------------------------------------------------

function upsertReviews(store, incoming, settings) {
  if (!Array.isArray(store.reviews)) store.reviews = [];
  let added = 0;
  let updated = 0;
  for (const review of incoming) {
    if (!review.text && !review.title) continue;
    const existing = store.reviews.find((row) => row.source === review.source && row.externalId === review.externalId);
    if (existing) {
      Object.assign(existing, { ...review, status: existing.status, featured: existing.featured, updated_at: now() });
      updated += 1;
      continue;
    }
    const publish = settings.autoPublish && (review.rating || 0) >= Number(settings.minRatingToPublish || 0);
    store.reviews.unshift({
      id: createId(),
      ...review,
      status: publish ? 'published' : 'hidden',
      featured: false,
      imported_at: now(),
      updated_at: now(),
    });
    added += 1;
  }
  return { added, updated };
}

let syncing = null;

export async function syncSource(source) {
  const store = await readStore();
  const settings = await settingsFrom(store);
  let result;
  if (source === 'google') result = await fetchGoogle(settings.google);
  else if (source === 'tripadvisor') result = await fetchTripAdvisor(settings.tripadvisor);
  else throw validationError('That source cannot be synced automatically');

  const counts = await updateStore((next) => {
    const out = upsertReviews(next, result.reviews, settings);
    next.reviewSummary = {
      ...(next.reviewSummary || {}),
      [source]: { ...result.summary, fetched_at: now(), error: null },
    };
    return out;
  });
  if (counts.added) {
    const { emitEvent } = await import('../webhooks/webhooks.service.js');
    emitEvent('review.imported', { source, added: counts.added }).catch(() => undefined);
  }
  return { source, ...counts, summary: result.summary };
}

export async function syncAllSources({ reason = 'manual' } = {}) {
  if (syncing) return syncing;
  syncing = (async () => {
    const store = await readStore();
    const settings = await settingsFrom(store);
    const results = [];
    for (const source of ['google', 'tripadvisor']) {
      if (!settings[source]?.enabled) continue;
      try {
        results.push(await syncSource(source));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ source, error: message });
        logger.warn('Review import failed', { source, reason, message });
        await updateStore((next) => {
          next.reviewSummary = {
            ...(next.reviewSummary || {}),
            [source]: { ...(next.reviewSummary?.[source] || {}), error: message, failed_at: now() },
          };
        });
      }
    }
    return results;
  })();
  try {
    return await syncing;
  } finally {
    syncing = null;
  }
}

/** Parse pasted reviews: one per line, "Name | Country | Rating | Date | Title | Review" (tabs also work). */
export function parsePastedReviews(text, source = 'safaribookings') {
  const rows = [];
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^name\s*[|\t]/i.test(line)) continue;
    const parts = line.includes('\t') ? line.split('\t') : line.split('|');
    const [author, country, rating, date, title, ...rest] = parts.map((part) => part.trim());
    const body = rest.join(' | ').trim();
    if (!author || (!body && !title)) continue;
    rows.push({
      source,
      externalId: crypto.createHash('sha1').update(`${source}|${author}|${date}|${title}|${body.slice(0, 80)}`).digest('hex'),
      author: cleanText(author, 120),
      authorUrl: '',
      authorPhoto: '',
      country: cleanText(country, 120),
      rating: clampRating(rating) || 5,
      title: cleanText(title, 200),
      text: cleanText(body),
      language: 'en',
      date: isoDate(date),
      url: '',
    });
  }
  return rows;
}

function publicReview(row) {
  return {
    id: row.id,
    source: row.source,
    sourceLabel: REVIEW_SOURCES[row.source] || row.source,
    author: row.author,
    authorPhoto: row.authorPhoto || '',
    authorUrl: row.authorUrl || '',
    country: row.country || '',
    rating: row.rating,
    title: row.title || '',
    text: row.text || '',
    date: row.date,
    url: row.url || '',
    featured: Boolean(row.featured),
  };
}

function summarise(store, settings) {
  const summary = store.reviewSummary || {};
  const published = (store.reviews || []).filter((row) => row.status === 'published');
  const sources = {};
  for (const key of ['google', 'tripadvisor', 'safaribookings']) {
    const saved = summary[key] || {};
    const local = published.filter((row) => row.source === key);
    let rating = saved.rating || null;
    let count = saved.count || 0;
    if (key === 'safaribookings') {
      rating = clampRating(settings.safaribookings.rating) || rating;
      count = Number(settings.safaribookings.count || 0) || count;
    }
    if (!rating && local.length) rating = clampRating(local.reduce((sum, row) => sum + (row.rating || 0), 0) / local.length);
    if (!count) count = local.length;
    const url = saved.url || settings[key]?.profileUrl || '';
    if (rating || count || url) sources[key] = { label: REVIEW_SOURCES[key], rating, count, url, fetched_at: saved.fetched_at || null };
  }
  const weighted = Object.values(sources).filter((row) => row.rating && row.count);
  const totalCount = weighted.reduce((sum, row) => sum + row.count, 0);
  const overall = totalCount
    ? Math.round((weighted.reduce((sum, row) => sum + row.rating * row.count, 0) / totalCount) * 10) / 10
    : null;
  return { overall, totalCount, sources };
}

function actorMeta(actor) {
  return { actorId: actor?.userId, actorEmail: actor?.email };
}

export const reviewsService = {
  async publicList({ source, limit = 60 } = {}) {
    const store = await readStore();
    const settings = await settingsFrom(store);
    const testimonials = (store.testimonials || [])
      .filter((row) => row.status === 'PUBLISHED' && row.published)
      .map((row) => ({
        id: row.id,
        source: 'website',
        sourceLabel: 'Guest story',
        author: row.published.title,
        authorPhoto: row.published.image || '',
        country: row.published.detail || '',
        rating: 5,
        title: '',
        text: row.published.quote || '',
        date: row.published_at || row.created_at,
        url: '',
        featured: true,
      }));
    let reviews = (store.reviews || []).filter((row) => row.status === 'published').map(publicReview);
    reviews.sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.date || '').localeCompare(String(a.date || '')));
    reviews = [...reviews, ...testimonials];
    if (source) reviews = reviews.filter((row) => row.source === source);
    return { summary: summarise(store, settings), reviews: reviews.slice(0, Math.min(Number(limit) || 60, 200)) };
  },

  async adminList() {
    const store = await readStore();
    const settings = await settingsFrom(store);
    return {
      reviews: (store.reviews || []).map((row) => ({ ...publicReview(row), status: row.status, imported_at: row.imported_at })),
      summary: summarise(store, settings),
      sourceStatus: store.reviewSummary || {},
      settings: maskedSettings(settings),
    };
  },

  async saveSettings(body, actor) {
    const store = await readStore();
    const current = await settingsFrom(store);
    const next = {
      autoPublish: body?.autoPublish !== undefined ? Boolean(body.autoPublish) : current.autoPublish,
      minRatingToPublish:
        body?.minRatingToPublish !== undefined ? clampRating(body.minRatingToPublish) || 1 : current.minRatingToPublish,
      google: { ...current.google },
      tripadvisor: { ...current.tripadvisor },
      safaribookings: { ...current.safaribookings },
    };
    for (const source of ['google', 'tripadvisor']) {
      const incoming = body?.[source];
      if (!incoming) continue;
      if (incoming.enabled !== undefined) next[source].enabled = Boolean(incoming.enabled);
      if (incoming.profileUrl !== undefined) next[source].profileUrl = String(incoming.profileUrl).trim().slice(0, 500);
      if (source === 'google' && incoming.placeId !== undefined) next.google.placeId = String(incoming.placeId).trim().slice(0, 200);
      if (source === 'tripadvisor' && incoming.locationId !== undefined) {
        next.tripadvisor.locationId = String(incoming.locationId).replace(/\D/g, '').slice(0, 20);
      }
      if (incoming.apiKey !== undefined && incoming.apiKey !== maskSecret('x')) {
        next[source].apiKey = incoming.apiKey ? await encryptSecret(String(incoming.apiKey).trim()) : '';
      }
    }
    if (body?.safaribookings) {
      const sb = body.safaribookings;
      if (sb.profileUrl !== undefined) next.safaribookings.profileUrl = String(sb.profileUrl).trim().slice(0, 500);
      if (sb.rating !== undefined) next.safaribookings.rating = sb.rating === '' ? '' : clampRating(sb.rating) || '';
      if (sb.count !== undefined) next.safaribookings.count = sb.count === '' ? '' : Math.max(0, parseInt(sb.count, 10) || 0);
    }
    await updateStore((draft) => {
      draft.settings = { ...(draft.settings || {}), reviews: next };
    });
    await recordAudit({ ...actorMeta(actor), action: 'reviews.settings', resource: 'reviews' });
    return maskedSettings(next);
  },

  async create(body, actor) {
    const source = REVIEW_SOURCES[body?.source] ? body.source : 'website';
    const author = cleanText(body?.author, 120);
    const text = cleanText(body?.text);
    if (!author) throw validationError('Enter the guest name', { field: 'author' });
    if (!text) throw validationError('Enter the review text', { field: 'text' });
    const row = {
      id: createId(),
      source,
      externalId: `manual-${createId()}`,
      author,
      authorUrl: '',
      authorPhoto: String(body?.authorPhoto || ''),
      country: cleanText(body?.country, 120),
      rating: clampRating(body?.rating) || 5,
      title: cleanText(body?.title, 200),
      text,
      language: 'en',
      date: isoDate(body?.date) || now(),
      url: String(body?.url || '').trim().slice(0, 500),
      status: body?.status === 'hidden' ? 'hidden' : 'published',
      featured: Boolean(body?.featured),
      imported_at: now(),
      updated_at: now(),
    };
    await updateStore((store) => {
      if (!Array.isArray(store.reviews)) store.reviews = [];
      store.reviews.unshift(row);
    });
    await recordAudit({ ...actorMeta(actor), action: 'reviews.create', resource: 'reviews', resourceId: row.id });
    return publicReview(row);
  },

  async importPasted(body, actor) {
    const source = REVIEW_SOURCES[body?.source] ? body.source : 'safaribookings';
    const rows = parsePastedReviews(body?.text, source);
    if (!rows.length) {
      throw validationError('No reviews found. Put one review per line: Name | Country | Rating | Date | Title | Review');
    }
    const store = await readStore();
    const settings = await settingsFrom(store);
    const counts = await updateStore((next) => upsertReviews(next, rows, { ...settings, autoPublish: true, minRatingToPublish: 0 }));
    await recordAudit({ ...actorMeta(actor), action: 'reviews.import', resource: 'reviews', metadata: { source, ...counts } });
    return counts;
  },

  async update(id, body, actor) {
    const row = await updateStore((store) => {
      const item = (store.reviews || []).find((review) => review.id === id);
      if (!item) return null;
      if (body?.status !== undefined) item.status = body.status === 'hidden' ? 'hidden' : 'published';
      if (body?.featured !== undefined) item.featured = Boolean(body.featured);
      if (body?.text !== undefined && item.externalId?.startsWith('manual-')) item.text = cleanText(body.text);
      item.updated_at = now();
      return item;
    });
    if (!row) throw notFound('Review not found');
    await recordAudit({ ...actorMeta(actor), action: 'reviews.update', resource: 'reviews', resourceId: id });
    return publicReview(row);
  },

  async remove(id, actor) {
    const removed = await updateStore((store) => {
      const index = (store.reviews || []).findIndex((review) => review.id === id);
      return index === -1 ? null : store.reviews.splice(index, 1)[0];
    });
    if (!removed) throw notFound('Review not found');
    await recordAudit({ ...actorMeta(actor), action: 'reviews.delete', resource: 'reviews', resourceId: id });
    return { id };
  },
};
