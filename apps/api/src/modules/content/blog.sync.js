import { getPool } from '../../database/index.js';
import { logger } from '../../logging/index.js';
import { blocksToParagraphs, normalizeBlogDocument } from '@gm-safaris/safari-ui';

function publishedOn(doc) {
  const raw = doc.date || '';
  const parsed = Date.parse(raw);
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  return null;
}

function extrasPayload(live) {
  return {
    featured: Boolean(live.featured),
    read_time: live.read_time || 1,
    seo_title: live.seo_title || '',
    seo_description: live.seo_description || '',
    keywords: live.seo_keywords || '',
    canonical_url: live.canonical_url || '',
    og_image: live.og_image || '',
    featured_tour_slugs: live.featured_tour_slugs || [],
    featured_lodge_ids: live.featured_lodge_ids || [],
    destination_slugs: live.destination_slugs || [],
  };
}

async function syncRelations(pool, postId, doc) {
  const slugs = doc.featured_tour_slugs || [];
  const keys = doc.featured_lodge_ids || [];
  if (slugs.length) {
    try {
      await pool.query(`DELETE FROM blog_post_tours WHERE post_id = $1`, [postId]);
      await pool.query(
        `INSERT INTO blog_post_tours (post_id, tour_id)
         SELECT $1::uuid, t.id
         FROM tours t
         WHERE t.slug = ANY($2::text[])
         ON CONFLICT DO NOTHING`,
        [postId, slugs]
      );
    } catch (err) {
      logger.warn('Blog tour relations skipped', { message: err instanceof Error ? err.message : String(err) });
    }
  }
  if (keys.length) {
    try {
      await pool.query(`DELETE FROM blog_post_lodges WHERE post_id = $1`, [postId]);
      await pool.query(
        `INSERT INTO blog_post_lodges (post_id, lodge_key)
         SELECT $1::uuid, key
         FROM unnest($2::text[]) AS key
         ON CONFLICT DO NOTHING`,
        [postId, keys]
      );
    } catch (err) {
      logger.warn('Blog lodge relations skipped', { message: err instanceof Error ? err.message : String(err) });
    }
  }
}

export async function syncBlogPost(record) {
  const pool = getPool();
  if (!pool || record?.type !== 'posts') return;
  const draft = normalizeBlogDocument(record.draft || {});
  const published = record.published ? normalizeBlogDocument(record.published) : null;
  const live = published || draft;
  const paragraphs = live.paragraphs?.length ? live.paragraphs : blocksToParagraphs(live.blocks);
  try {
    await pool.query(
      `INSERT INTO blog_posts (
         id, topic_id, slug, title, excerpt, body, paragraphs, kicker, author,
         status, draft, published, published_on, published_at, updated_at, extras
       )
       VALUES (
         $1::uuid,
         (SELECT id FROM blog_topics WHERE slug = $2 LIMIT 1),
         $3, $4, $5, $6, $7, $8, $9, $10::content_status,
         $11::jsonb, $12::jsonb, $13::date, $14::timestamptz, now(), $15::jsonb
       )
       ON CONFLICT (slug) DO UPDATE SET
         topic_id = EXCLUDED.topic_id,
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         body = EXCLUDED.body,
         paragraphs = EXCLUDED.paragraphs,
         kicker = EXCLUDED.kicker,
         author = EXCLUDED.author,
         status = EXCLUDED.status,
         draft = EXCLUDED.draft,
         published = EXCLUDED.published,
         published_on = EXCLUDED.published_on,
         published_at = EXCLUDED.published_at,
         extras = COALESCE(blog_posts.extras, '{}'::jsonb) || EXCLUDED.extras,
         updated_at = now()`,
      [
        record.id,
        live.topic || 'safari',
        record.slug || live.slug,
        live.title,
        live.excerpt || '',
        paragraphs.join('\n\n'),
        paragraphs,
        live.kicker || '',
        live.author || 'Golden Memories Safaris',
        record.status || 'DRAFT',
        JSON.stringify(draft),
        published ? JSON.stringify(published) : null,
        publishedOn(live),
        record.published_at || null,
        JSON.stringify(extrasPayload(live)),
      ]
    );
    await syncRelations(pool, record.id, live);
  } catch (err) {
    logger.error('Failed to sync blog post to PostgreSQL', {
      slug: record.slug,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function removeBlogPost(record) {
  const pool = getPool();
  if (!pool || !record?.slug) return;
  try {
    await pool.query(`UPDATE blog_posts SET status = 'ARCHIVED', updated_at = now() WHERE slug = $1`, [record.slug]);
  } catch (err) {
    logger.error('Failed to archive blog post in PostgreSQL', { slug: record.slug, message: err.message });
  }
}
