import { getPool } from '../../database/index.js';
import { logger } from '../../logging/index.js';
import { hasSafariPrice } from '@gm-safaris/safari-ui';

export function safariDbSyncEnabled() {
  if (process.env.VITEST === 'true') return false;
  if (process.env.NODE_ENV === 'test') return false;
  if (process.env.CMS_SYNC_POSTGRES === 'false') return false;
  return true;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function productType(doc = {}) {
  const hay = `${doc.title || ''} ${doc.slug || ''}`.toLowerCase();
  if (/kilimanjaro|machame|marangu|lemosho|rongai|umbwe|northern circuit/.test(hay)) return 'kilimanjaro';
  if (/\bmeru\b/.test(hay)) return 'meru';
  if (/zanzibar|beach/.test(hay)) return 'beach';
  if (/join safari|joining/.test(hay)) return 'join_safari';
  if (/day trip/.test(hay)) return 'day_trip';
  return 'private_safari';
}

function liveDoc(record) {
  return record?.published || record?.draft || {};
}

function publicStatus(record) {
  if (record.status === 'PUBLISHED' && !hasSafariPrice(record.published || record.draft)) return 'DRAFT';
  return record.status;
}

export async function syncSafari(record) {
  if (!safariDbSyncEnabled()) return;
  const pool = getPool();
  if (!pool || !record?.slug) return;
  const draft = record.draft || {};
  const published = hasSafariPrice(record.published) ? record.published : null;
  const live = liveDoc(record);
  const status = publicStatus(record);
  const id = isUuid(record.id) ? record.id : null;
  const publishedAt = status === 'PUBLISHED' ? record.published_at || null : null;

  try {
    await pool.query(
      `INSERT INTO cms_safaris (id, slug, status, draft, published, created_at, updated_at, published_at)
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
      live.short_description || '',
      live.description || '',
      Boolean(live.featured),
      live.display_order || 0,
      live.duration || null,
      live.duration_label || '',
      live.price ?? null,
      live.price_from ?? null,
      live.currency || 'USD',
      live.difficulty || '',
      live.best_season || '',
      live.minimum_people ?? 1,
      live.maximum_people ?? null,
      productType(live),
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
  } catch (err) {
    logger.error('Failed to sync safari to PostgreSQL', {
      slug: record.slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function removeSafari(record) {
  if (!safariDbSyncEnabled()) return;
  const pool = getPool();
  if (!pool || !record?.slug) return;
  try {
    await pool.query(`UPDATE tours SET status = 'ARCHIVED', published = NULL, published_at = NULL, updated_at = now() WHERE slug = $1`, [
      record.slug,
    ]);
    await pool.query(
      `UPDATE cms_safaris SET status = 'ARCHIVED', published = NULL, published_at = NULL, updated_at = now() WHERE slug = $1`,
      [record.slug]
    );
  } catch (err) {
    logger.error('Failed to archive safari in PostgreSQL', { slug: record.slug, message: err.message });
  }
}
