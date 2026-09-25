import { getPool } from '../../database/index.js';
import { logger } from '../../logging/index.js';
import { hasSafariPrice, normalizeGroupSafariDocument } from '@gm-safaris/safari-ui';
import { safariDbSyncEnabled } from '../safaris/safari.sync.js';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function asDate(value) {
  const text = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function liveDoc(record) {
  return normalizeGroupSafariDocument(record?.published || record?.draft || {});
}

function publicStatus(record) {
  if (record.status === 'PUBLISHED' && !hasSafariPrice(record.published || record.draft)) return 'DRAFT';
  return record.status;
}

export async function syncGroupSafari(record) {
  if (!safariDbSyncEnabled()) return;
  const pool = getPool();
  if (!pool || !record?.slug) return;
  const draft = normalizeGroupSafariDocument(record.draft || {});
  const published = hasSafariPrice(record.published) ? normalizeGroupSafariDocument(record.published) : null;
  const live = liveDoc(record);
  const status = publicStatus(record);
  const id = isUuid(record.id) ? record.id : null;
  const publishedAt = status === 'PUBLISHED' ? record.published_at || null : null;

  try {
    await pool.query(
      `INSERT INTO cms_departures (id, slug, status, draft, published, created_at, updated_at, published_at)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4::jsonb, $5::jsonb, $6::timestamptz, $7::timestamptz, $8::timestamptz)
       ON CONFLICT (slug) DO UPDATE SET
         status = EXCLUDED.status,
         draft = EXCLUDED.draft,
         published = EXCLUDED.published,
         updated_at = EXCLUDED.updated_at,
         published_at = EXCLUDED.published_at`,
      [
        id,
        record.slug,
        status,
        JSON.stringify(draft),
        published ? JSON.stringify(published) : null,
        record.created_at || new Date().toISOString(),
        record.updated_at || new Date().toISOString(),
        publishedAt,
      ]
    );

    const tourValues = [
      record.slug,
      status,
      live.title || record.slug,
      live.short_description || live.overview || '',
      live.description || live.overview || '',
      Boolean(live.featured),
      live.display_order || 0,
      live.duration || null,
      live.duration_label || '',
      live.price ?? live.price_from ?? null,
      live.price_from ?? live.price ?? null,
      live.currency || 'USD',
      live.difficulty || '',
      live.best_season || '',
      live.minimum_people ?? 1,
      live.maximum_people ?? null,
      'join_safari',
      JSON.stringify(draft),
      published ? JSON.stringify(published) : null,
      publishedAt,
    ];

    if (id) {
      await pool.query(
        `INSERT INTO tours (
           id, slug, status, title, short_description, description, featured, display_order,
           duration_days, duration_label, price, price_from, currency, difficulty, best_season,
           minimum_people, maximum_people, product_type, draft, published, published_at, updated_at
         )
         VALUES (
           $1::uuid, $2, $3::content_status, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
           $16, $17, $18::product_type, $19::jsonb, $20::jsonb, $21::timestamptz, now()
         )
         ON CONFLICT (slug) DO UPDATE SET
           status = EXCLUDED.status,
           title = EXCLUDED.title,
           short_description = EXCLUDED.short_description,
           description = EXCLUDED.description,
           featured = EXCLUDED.featured,
           display_order = EXCLUDED.display_order,
           duration_days = EXCLUDED.duration_days,
           duration_label = EXCLUDED.duration_label,
           price = EXCLUDED.price,
           price_from = EXCLUDED.price_from,
           currency = EXCLUDED.currency,
           difficulty = EXCLUDED.difficulty,
           best_season = EXCLUDED.best_season,
           minimum_people = EXCLUDED.minimum_people,
           maximum_people = EXCLUDED.maximum_people,
           product_type = EXCLUDED.product_type,
           draft = EXCLUDED.draft,
           published = EXCLUDED.published,
           published_at = EXCLUDED.published_at,
           updated_at = now()`,
        [id, ...tourValues]
      );
    } else {
      await pool.query(
        `INSERT INTO tours (
           slug, status, title, short_description, description, featured, display_order,
           duration_days, duration_label, price, price_from, currency, difficulty, best_season,
           minimum_people, maximum_people, product_type, draft, published, published_at, updated_at
         )
         VALUES (
           $1, $2::content_status, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
           $16, $17, $18::product_type, $19::jsonb, $20::jsonb, $21::timestamptz, now()
         )
         ON CONFLICT (slug) DO UPDATE SET
           status = EXCLUDED.status,
           title = EXCLUDED.title,
           short_description = EXCLUDED.short_description,
           description = EXCLUDED.description,
           featured = EXCLUDED.featured,
           display_order = EXCLUDED.display_order,
           duration_days = EXCLUDED.duration_days,
           duration_label = EXCLUDED.duration_label,
           price = EXCLUDED.price,
           price_from = EXCLUDED.price_from,
           currency = EXCLUDED.currency,
           difficulty = EXCLUDED.difficulty,
           best_season = EXCLUDED.best_season,
           minimum_people = EXCLUDED.minimum_people,
           maximum_people = EXCLUDED.maximum_people,
           product_type = EXCLUDED.product_type,
           draft = EXCLUDED.draft,
           published = EXCLUDED.published,
           published_at = EXCLUDED.published_at,
           updated_at = now()`,
        tourValues
      );
    }

    const tour = await pool.query(`SELECT id FROM tours WHERE slug = $1`, [record.slug]);
    const tourId = tour.rows[0]?.id;
    if (!tourId) return;

    const depValues = [
      tourId,
      record.slug,
      id,
      live.title || record.slug,
      live.dates || live.dates_label || '',
      asDate(live.start),
      asDate(live.end),
      live.spaces || '',
      live.deposit || '',
      status,
      live.duration || null,
      live.duration_label || '',
      live.price_from ?? live.price ?? null,
      live.currency || 'USD',
      live.overview || live.short_description || '',
      live.destination || '',
      JSON.stringify(live.highlights || []),
      JSON.stringify(live.itinerary || []),
      JSON.stringify(live.inclusions || []),
      JSON.stringify(live.exclusions || []),
      JSON.stringify(live.gallery || []),
      JSON.stringify(live.lodge_ids || []),
      JSON.stringify(live.faq || []),
      JSON.stringify(live.seo || {}),
      live.hero_image ? JSON.stringify(live.hero_image) : null,
      live.map ? JSON.stringify(live.map) : null,
      JSON.stringify(draft),
      published ? JSON.stringify(published) : null,
      publishedAt,
    ];

    const existing = await pool.query(
      `SELECT id FROM tour_departures WHERE slug = $1 OR ($2::uuid IS NOT NULL AND cms_id = $2::uuid) LIMIT 1`,
      [record.slug, id]
    );

    if (existing.rows[0]) {
      await pool.query(
        `UPDATE tour_departures SET
           tour_id = $1,
           slug = $2,
           cms_id = COALESCE($3::uuid, cms_id),
           title = $4,
           dates_label = $5,
           start_date = $6::date,
           end_date = $7::date,
           spaces_label = $8,
           deposit_label = $9,
           status = $10::content_status,
           duration_days = $11,
           duration_label = $12,
           price_from = $13,
           currency = $14,
           overview = $15,
           destination = $16,
           highlights = $17::jsonb,
           itinerary = $18::jsonb,
           inclusions = $19::jsonb,
           exclusions = $20::jsonb,
           gallery = $21::jsonb,
           lodge_ids = $22::jsonb,
           faq = $23::jsonb,
           seo = $24::jsonb,
           hero_image = $25::jsonb,
           map = $26::jsonb,
           draft = $27::jsonb,
           published = $28::jsonb,
           published_at = $29::timestamptz,
           updated_at = now()
         WHERE id = $30`,
        [...depValues, existing.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO tour_departures (
           tour_id, slug, cms_id, title, dates_label, start_date, end_date, spaces_label, deposit_label, status,
           duration_days, duration_label, price_from, currency, overview, destination,
           highlights, itinerary, inclusions, exclusions, gallery, lodge_ids, faq, seo,
           hero_image, map, draft, published, published_at
         )
         VALUES (
           $1::uuid, $2, $3::uuid, $4, $5, $6::date, $7::date, $8, $9, $10::content_status,
           $11, $12, $13, $14, $15, $16,
           $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21::jsonb, $22::jsonb, $23::jsonb, $24::jsonb,
           $25::jsonb, $26::jsonb, $27::jsonb, $28::jsonb, $29::timestamptz
         )`,
        depValues
      );
    }
  } catch (err) {
    logger.error('Failed to sync group safari to PostgreSQL', {
      slug: record.slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function removeGroupSafari(record) {
  if (!safariDbSyncEnabled()) return;
  const pool = getPool();
  if (!pool || !record?.slug) return;
  try {
    await pool.query(
      `UPDATE tour_departures SET status = 'ARCHIVED', published = NULL, published_at = NULL, updated_at = now() WHERE slug = $1 OR cms_id = $2::uuid`,
      [record.slug, isUuid(record.id) ? record.id : null]
    );
    await pool.query(
      `UPDATE tours SET status = 'ARCHIVED', published = NULL, published_at = NULL, updated_at = now() WHERE slug = $1 AND product_type = 'join_safari'`,
      [record.slug]
    );
    await pool.query(
      `UPDATE cms_departures SET status = 'ARCHIVED', published = NULL, published_at = NULL, updated_at = now() WHERE slug = $1`,
      [record.slug]
    );
  } catch (err) {
    logger.error('Failed to archive group safari in PostgreSQL', {
      slug: record.slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function deleteGroupSafariFromDb(record) {
  if (!safariDbSyncEnabled()) return;
  const pool = getPool();
  if (!pool || !record?.slug) return;
  try {
    await pool.query(`DELETE FROM tour_departures WHERE slug = $1 OR cms_id = $2::uuid`, [
      record.slug,
      isUuid(record.id) ? record.id : null,
    ]);
    await pool.query(`DELETE FROM tours WHERE slug = $1 AND product_type = 'join_safari'`, [record.slug]);
    await pool.query(`DELETE FROM cms_departures WHERE slug = $1`, [record.slug]);
  } catch (err) {
    logger.error('Failed to delete group safari from PostgreSQL', {
      slug: record.slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncAllGroupSafaris() {
  if (!safariDbSyncEnabled()) return;
  const pool = getPool();
  if (!pool) return;
  try {
    const found = await pool.query(
      `SELECT to_regclass('public.tours') AS tours, to_regclass('public.cms_departures') AS cms, to_regclass('public.tour_departures') AS deps`
    );
    if (!found.rows[0]?.tours && !found.rows[0]?.cms && !found.rows[0]?.deps) {
      logger.warn('Skipping group safari PostgreSQL sync; run database migrations first');
      return;
    }
  } catch (err) {
    logger.warn('Skipping group safari PostgreSQL sync; database is not ready', {
      message: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  const { readStore } = await import('../../cms-store/index.js');
  const store = await readStore();
  for (const record of store.departures || []) {
    await syncGroupSafari(record);
  }
}
