import { getPool } from '../../database/index.js';
import { logger } from '../../logging/index.js';
import { normalizeLodgeCategory } from '@gm-safaris/shared-types';
import { safariDbSyncEnabled } from '../safaris/safari.sync.js';
import { readStore } from '../../cms-store/index.js';
import { DEFAULT_SETTINGS } from './content.seed.js';
import { syncBlogPost } from './blog.sync.js';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function liveDoc(record) {
  return record?.published || record?.draft || {};
}

function asTextArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asJson(value, fallback = []) {
  if (value == null || value === '') return fallback;
  return value;
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function upsertByCmsId(pool, table, cmsId, insertSql, params) {
  const found = await pool.query(`SELECT id FROM ${table} WHERE extras->>'cms_id' = $1 LIMIT 1`, [cmsId]);
  if (found.rows[0]?.id) {
    return found.rows[0].id;
  }
  const inserted = await pool.query(insertSql, params);
  return inserted.rows[0]?.id;
}

export async function syncDestination(record) {
  const pool = getPool();
  if (!pool || !record) return;
  const live = liveDoc(record);
  const slug = record.slug || live.slug;
  if (!slug) return;
  const id = isUuid(record.id) ? record.id : null;
  const status = record.status || 'DRAFT';
  try {
    await pool.query(
      `INSERT INTO destinations (
         id, region_id, slug, name, kicker, tagline, cta, location_label, blurb,
         paragraphs, highlights, seasons, wildlife, activities, attractions, facts, faqs,
         match_terms, status, display_order, extras, published_at, country, latitude, longitude,
         climate, getting_there, airstrips, entry_fees, canonical_url, og_image
       )
       VALUES (
         COALESCE($1::uuid, gen_random_uuid()),
         (SELECT id FROM regions WHERE slug = $2 OR lower(name) = lower($2) LIMIT 1),
         $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13, $14::jsonb, $15, $16::jsonb, $17::jsonb,
         $18, $19::content_status, $20, $21::jsonb, $22::timestamptz, $23, $24, $25, $26::jsonb, $27, $28, $29, $30, $31
       )
       ON CONFLICT (slug) DO UPDATE SET
         region_id = COALESCE(EXCLUDED.region_id, destinations.region_id),
         name = EXCLUDED.name,
         kicker = EXCLUDED.kicker,
         tagline = EXCLUDED.tagline,
         cta = EXCLUDED.cta,
         location_label = EXCLUDED.location_label,
         blurb = EXCLUDED.blurb,
         paragraphs = EXCLUDED.paragraphs,
         highlights = EXCLUDED.highlights,
         seasons = EXCLUDED.seasons,
         wildlife = EXCLUDED.wildlife,
         activities = EXCLUDED.activities,
         attractions = EXCLUDED.attractions,
         facts = EXCLUDED.facts,
         faqs = EXCLUDED.faqs,
         match_terms = EXCLUDED.match_terms,
         status = EXCLUDED.status,
         extras = destinations.extras || EXCLUDED.extras,
         published_at = EXCLUDED.published_at,
         country = EXCLUDED.country,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         climate = EXCLUDED.climate,
         getting_there = EXCLUDED.getting_there,
         airstrips = EXCLUDED.airstrips,
         entry_fees = EXCLUDED.entry_fees,
         canonical_url = EXCLUDED.canonical_url,
         og_image = EXCLUDED.og_image,
         updated_at = now()`,
      [
        id,
        live.region || '',
        slug,
        live.title || live.name || slug,
        live.kicker || '',
        live.tagline || '',
        live.cta || '',
        live.location || live.location_label || '',
        live.blurb || live.tagline || '',
        asTextArray(live.paragraphs),
        JSON.stringify(asJson(live.highlights)),
        JSON.stringify(asJson(live.seasons)),
        asTextArray(live.wildlife),
        JSON.stringify(asJson(live.activities)),
        asTextArray(live.attractions),
        JSON.stringify(asJson(live.facts)),
        JSON.stringify(asJson(live.faqs)),
        asTextArray(live.match || live.match_terms || [slug]),
        status,
        live.display_order || 0,
        JSON.stringify({
          cms_id: record.id,
          image: live.image || '',
          gallery: live.gallery || [],
          seo_title: live.seo_title || '',
          seo_description: live.seo_description || '',
          seo_keywords: live.seo_keywords || '',
        }),
        record.published_at || null,
        live.country || 'Tanzania',
        asNumber(live.lat ?? live.latitude),
        asNumber(live.lng ?? live.longitude),
        JSON.stringify(asJson(live.climate, [])),
        live.getting_there || live.gettingThere || '',
        asTextArray(live.airstrips),
        live.entry_fees || live.entryFees || '',
        live.canonical_url || '',
        live.og_image || live.image || '',
      ]
    );
  } catch (err) {
    logger.error('Failed to sync destination to PostgreSQL', {
      slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncLodge(record) {
  const pool = getPool();
  if (!pool || !record) return;
  const live = liveDoc(record);
  const slug = record.slug || live.slug;
  if (!slug) return;
  const id = isUuid(record.id) ? record.id : null;
  const tented = /tent|camp/i.test(`${live.title || ''} ${live.place || ''}`);
  try {
    await pool.query(
      `INSERT INTO accommodations (
         id, slug, name, kind, place_label, blurb, description, website_url, status,
         category, gallery, extras, published_at
       )
       VALUES (
         COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4::accommodation_kind, $5, $6, $7, $8,
         $9::content_status, $10, $11::jsonb, $12::jsonb, $13::timestamptz
       )
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         kind = EXCLUDED.kind,
         place_label = EXCLUDED.place_label,
         blurb = EXCLUDED.blurb,
         description = EXCLUDED.description,
         website_url = EXCLUDED.website_url,
         status = EXCLUDED.status,
         category = EXCLUDED.category,
         gallery = EXCLUDED.gallery,
         extras = accommodations.extras || EXCLUDED.extras,
         published_at = EXCLUDED.published_at,
         updated_at = now()`,
      [
        id,
        slug,
        live.title || live.name || slug,
        tented ? 'tented_camp' : 'lodge',
        live.place || '',
        live.blurb || '',
        live.description || live.blurb || '',
        live.website || '',
        record.status || 'DRAFT',
        normalizeLodgeCategory(live.category),
        JSON.stringify(asJson(live.gallery)),
        JSON.stringify({ cms_id: record.id, image: live.image || '', region: live.region || '' }),
        record.published_at || null,
      ]
    );
  } catch (err) {
    logger.error('Failed to sync lodge to PostgreSQL', {
      slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncPage(record) {
  const pool = getPool();
  if (!pool || !record) return;
  const live = liveDoc(record);
  const slug = record.slug || live.slug;
  if (!slug) return;
  const id = isUuid(record.id) ? record.id : null;
  try {
    await pool.query(
      `INSERT INTO pages (id, slug, title, kicker, excerpt, body, status, extras, published_at)
       VALUES (
         COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7::content_status, $8::jsonb, $9::timestamptz
       )
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         kicker = EXCLUDED.kicker,
         excerpt = EXCLUDED.excerpt,
         body = EXCLUDED.body,
         status = EXCLUDED.status,
         extras = pages.extras || EXCLUDED.extras,
         published_at = EXCLUDED.published_at,
         updated_at = now()`,
      [
        id,
        slug,
        live.title || slug,
        live.kicker || '',
        live.excerpt || live.seo_description || '',
        live.body || '',
        record.status || 'DRAFT',
        JSON.stringify({
          cms_id: record.id,
          seo_title: live.seo_title || '',
          seo_description: live.seo_description || '',
          seo_keywords: live.seo_keywords || '',
        }),
        record.published_at || null,
      ]
    );
  } catch (err) {
    logger.error('Failed to sync page to PostgreSQL', {
      slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncFaq(record) {
  const pool = getPool();
  if (!pool || !record?.id) return;
  const live = liveDoc(record);
  const question = live.title || live.question;
  if (!question) return;
  try {
    await upsertByCmsId(
      pool,
      'faqs',
      record.id,
      `INSERT INTO faqs (group_id, question, answer, status, extras)
       VALUES (
         (SELECT id FROM faq_groups WHERE slug = $1 LIMIT 1),
         $2, $3, $4::content_status, $5::jsonb
       )
       RETURNING id`,
      [
        live.group || 'safaris',
        question,
        live.answer || live.a || '',
        record.status || 'PUBLISHED',
        JSON.stringify({ cms_id: record.id }),
      ]
    );
    await pool.query(
      `UPDATE faqs SET
         question = $2,
         answer = $3,
         status = $4::content_status,
         group_id = COALESCE((SELECT id FROM faq_groups WHERE slug = $5 LIMIT 1), group_id),
         extras = COALESCE(extras, '{}'::jsonb) || $6::jsonb,
         updated_at = now()
       WHERE extras->>'cms_id' = $1`,
      [
        record.id,
        question,
        live.answer || live.a || '',
        record.status || 'PUBLISHED',
        live.group || 'safaris',
        JSON.stringify({ cms_id: record.id }),
      ]
    );
  } catch (err) {
    logger.error('Failed to sync FAQ to PostgreSQL', { message: err instanceof Error ? err.message : String(err) });
  }
}

export async function syncTestimonial(record) {
  const pool = getPool();
  if (!pool || !record?.id) return;
  const live = liveDoc(record);
  const name = live.title || live.guest_name || live.name;
  if (!name) return;
  try {
    await upsertByCmsId(
      pool,
      'testimonials',
      record.id,
      `INSERT INTO testimonials (guest_name, trip_detail, quote, status, extras, published_at)
       VALUES ($1, $2, $3, $4::content_status, $5::jsonb, $6::timestamptz)
       RETURNING id`,
      [
        name,
        live.detail || '',
        live.quote || '',
        record.status || 'DRAFT',
        JSON.stringify({ cms_id: record.id }),
        record.published_at || null,
      ]
    );
    await pool.query(
      `UPDATE testimonials SET
         guest_name = $2, trip_detail = $3, quote = $4, status = $5::content_status,
         extras = COALESCE(extras, '{}'::jsonb) || $6::jsonb,
         published_at = $7::timestamptz, updated_at = now()
       WHERE extras->>'cms_id' = $1`,
      [
        record.id,
        name,
        live.detail || '',
        live.quote || '',
        record.status || 'DRAFT',
        JSON.stringify({ cms_id: record.id }),
        record.published_at || null,
      ]
    );
  } catch (err) {
    logger.error('Failed to sync testimonial to PostgreSQL', {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncMenu(record) {
  const pool = getPool();
  if (!pool || !record) return;
  const live = liveDoc(record);
  const location = live.location;
  if (!location) return;
  const lines = String(live.items || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, href] = line.split('|').map((part) => part.trim());
      return { label: label || 'Link', href: href || '/', sort_order: (index + 1) * 10 };
    });
  try {
    const menu = await pool.query(
      `INSERT INTO menus (title, location, status)
       VALUES ($1, $2::menu_location, $3::content_status)
       ON CONFLICT (location) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, updated_at = now()
       RETURNING id`,
      [live.title || location, location, record.status || 'PUBLISHED']
    );
    const menuId = menu.rows[0]?.id;
    if (!menuId) return;
    await pool.query(`DELETE FROM menu_items WHERE menu_id = $1 AND parent_id IS NULL`, [menuId]);
    for (const item of lines) {
      await pool.query(
        `INSERT INTO menu_items (menu_id, label, href, sort_order) VALUES ($1, $2, $3, $4)`,
        [menuId, item.label, item.href, item.sort_order]
      );
    }
  } catch (err) {
    logger.error('Failed to sync menu to PostgreSQL', {
      location,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncSettingsToPostgres(settings = DEFAULT_SETTINGS) {
  const pool = getPool();
  if (!pool) return 0;
  const next = {
    ...DEFAULT_SETTINGS,
    ...settings,
    site: { ...DEFAULT_SETTINGS.site, ...(settings.site || {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(settings.seo || {}) },
    email: { ...DEFAULT_SETTINGS.email, ...(settings.email || {}) },
    security: { ...DEFAULT_SETTINGS.security, ...(settings.security || {}) },
    emailTemplates: { ...DEFAULT_SETTINGS.emailTemplates, ...(settings.emailTemplates || {}) },
  };
  delete next.email.smtpPass;
  const rows = [
    ['site', next.site],
    ['seo', next.seo],
    ['email', next.email],
    ['security', next.security],
    ['emailTemplates', next.emailTemplates],
    ['websiteLive', next.websiteLive !== false],
    ['domains', next.site],
  ];
  let count = 0;
  for (const [key, value] of rows) {
    try {
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [key, JSON.stringify(value)]
      );
      count += 1;
    } catch (err) {
      logger.error('Failed to sync site setting', { key, message: err instanceof Error ? err.message : String(err) });
    }
  }
  return count;
}

export async function populatePostgresFromStore() {
  if (!safariDbSyncEnabled()) return { skipped: true };
  const pool = getPool();
  if (!pool) return { skipped: true, reason: 'postgres-not-configured' };
  const store = await readStore();
  let destinations = 0;
  let lodges = 0;
  let pages = 0;
  let faqs = 0;
  let testimonials = 0;
  let menus = 0;
  let posts = 0;
  for (const record of store.destinations || []) {
    await syncDestination(record);
    destinations += 1;
  }
  for (const record of store.lodges || []) {
    await syncLodge(record);
    lodges += 1;
  }
  for (const record of store.pages || []) {
    await syncPage(record);
    pages += 1;
  }
  for (const record of store.faqs || []) {
    await syncFaq(record);
    faqs += 1;
  }
  for (const record of store.testimonials || []) {
    await syncTestimonial(record);
    testimonials += 1;
  }
  for (const record of store.menus || []) {
    await syncMenu(record);
    menus += 1;
  }
  for (const record of store.posts || []) {
    await syncBlogPost(record);
    posts += 1;
  }
  const settings = await syncSettingsToPostgres(store.settings || DEFAULT_SETTINGS);
  const summary = {
    destinations,
    lodges,
    pages,
    faqs,
    testimonials,
    menus,
    posts,
    settings,
    safaris: (store.safaris || []).length,
    departures: (store.departures || []).length,
  };
  logger.info('Populated PostgreSQL from CMS store', summary);
  return summary;
}
