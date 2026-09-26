/**
 * One request for everything the public website needs on every page.
 *
 * The website used to make 10 separate API calls before first paint (settings,
 * menus, reviews, lodges, posts, destinations, departures, pages, FAQs,
 * safaris), downloading every blog article body each time. That was slow and
 * tripped the rate limiter. This endpoint returns a compact bundle, cached in
 * memory until the CMS content changes, with an ETag so repeat visits get a
 * 304 in milliseconds.
 */
import crypto from 'node:crypto';
import { Router } from 'express';
import { SafariStatus } from '@gm-safaris/shared-types';
import { readStore, storeRevision } from '../../cms-store/index.js';
import { publicRateLimiter } from '../../middleware/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';

let cached = null;
let forced = 0;

export function invalidateSiteBundle() {
  forced += 1;
  cached = null;
}

function published(list) {
  return (list || [])
    .filter((item) => item.status === SafariStatus.PUBLISHED && item.published)
    .map((item) => ({ id: item.id, type: item.type, slug: item.published.slug || item.slug, ...item.published }));
}

const POST_SUMMARY_FIELDS = [
  'id',
  'slug',
  'title',
  'kicker',
  'topic',
  'date',
  'excerpt',
  'image',
  'hero_image',
  'author',
  'featured',
  'read_time',
  'destination_slugs',
  'featured_tour_slugs',
  'featured_lodge_ids',
  'seo_title',
  'seo_description',
];

function postSummary(post) {
  const out = {};
  for (const key of POST_SUMMARY_FIELDS) if (post[key] !== undefined) out[key] = post[key];
  return out;
}

function toPublicSafari(record) {
  if (record.status !== SafariStatus.PUBLISHED || !record.published) return null;
  return { id: record.id, slug: record.published.slug || record.slug, ...record.published };
}

async function build() {
  const store = await readStore();
  const settings = store.settings || DEFAULT_SETTINGS;
  const safaris = (store.safaris || [])
    .map(toPublicSafari)
    .filter(Boolean)
    .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));
  const reviews = (store.reviews || [])
    .filter((row) => row.status === 'published')
    .slice(0, 24)
    .map((row) => ({
      id: row.id,
      source: row.source,
      author: row.author,
      country: row.country || '',
      rating: row.rating,
      title: row.title || '',
      text: row.text || '',
      date: row.date,
      url: row.url || '',
      authorPhoto: row.authorPhoto || '',
      featured: Boolean(row.featured),
    }));
  const data = {
    settings: {
      site: settings.site || DEFAULT_SETTINGS.site,
      seo: settings.seo || DEFAULT_SETTINGS.seo,
      websiteLive: settings.websiteLive !== false,
    },
    menus: published(store.menus),
    testimonials: published(store.testimonials),
    lodges: published(store.lodges),
    posts: published(store.posts).map(postSummary),
    destinations: published(store.destinations),
    departures: published(store.departures),
    pages: published(store.pages),
    faqs: published(store.faqs),
    safaris,
    reviews,
    reviewSummary: store.reviewSummary || {},
    reviewLinks: {
      google: settings.reviews?.google?.profileUrl || store.reviewSummary?.google?.url || '',
      tripadvisor: settings.reviews?.tripadvisor?.profileUrl || store.reviewSummary?.tripadvisor?.url || '',
      safaribookings: settings.reviews?.safaribookings?.profileUrl || '',
    },
  };
  const json = JSON.stringify({ success: true, data });
  const etag = `W/"${crypto.createHash('sha1').update(json).digest('base64url').slice(0, 20)}"`;
  return { json, etag };
}

export async function getSiteBundle() {
  const key = `${storeRevision()}:${forced}`;
  if (!cached || cached.key !== key) {
    cached = { key, ...(await build()) };
  }
  return cached;
}

export const publicSiteRoutes = Router();
publicSiteRoutes.use(publicRateLimiter);
publicSiteRoutes.get('/', async (req, res, next) => {
  try {
    const bundle = await getSiteBundle();
    res.setHeader('ETag', bundle.etag);
    // Always revalidate (so CMS edits appear immediately) but allow 304s.
    res.setHeader('Cache-Control', 'no-cache');
    if (req.get('if-none-match') === bundle.etag) {
      res.status(304).end();
      return;
    }
    res.type('application/json').send(bundle.json);
  } catch (err) {
    next(err);
  }
});
