import { getPool } from '../../database/index.js';
import { logger } from '../../logging/index.js';
import { normalizeBlogDocument } from '@gm-safaris/safari-ui';

function publishedOn(doc) {
  const raw = doc.date || '';
  const parsed = Date.parse(raw);
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  return null;
}

export async function syncBlogPost(record) {
  const pool = getPool();
  if (!pool || record?.type !== 'posts') return;
  const draft = normalizeBlogDocument(record.draft || {});
  const published = record.published ? normalizeBlogDocument(record.published) : null;
  const live = published || draft;
  try {
    await pool.query(
      `INSERT INTO blog_posts (
         id, topic_id, slug, title, excerpt, body, paragraphs, kicker, author,
         status, draft, published, published_on, published_at, updated_at
       )
       VALUES (
         $1::uuid,
         (SELECT id FROM blog_topics WHERE slug = $2 LIMIT 1),
         $3, $4, $5, $6, $7, $8, $9, $10::content_status,
         $11::jsonb, $12::jsonb, $13::date, $14::timestamptz, now()
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
         updated_at = now()`,
      [
        record.id,
        live.topic || 'safari',
        record.slug || live.slug,
        live.title,
        live.excerpt || '',
        (live.paragraphs || []).join('\n\n'),
        live.paragraphs || [],
        live.kicker || '',
        live.author || 'Golden Memories Safaris',
        record.status || 'DRAFT',
        JSON.stringify(draft),
        published ? JSON.stringify(published) : null,
        publishedOn(live),
        record.published_at || null,
      ]
    );
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
