import path from 'node:path';
import { setCmsDataDir, readStore } from '../src/cms-store/index.js';
import { getPool } from '../src/database/pg-pool.js';

setCmsDataDir(path.resolve('data/cms'));
const store = await readStore();
const safaris = store.safaris || [];
const drafts = safaris.filter((item) => item.status === 'DRAFT');
const published = safaris.filter((item) => item.status === 'PUBLISHED');
console.log('store safaris', safaris.length, 'drafts', drafts.length, 'published', published.length);
for (const item of published) {
  console.log(
    ' -',
    item.status,
    item.slug,
    item.published?.price_from || item.draft?.price_from,
    'days',
    item.published?.itinerary?.length
  );
}

const pool = getPool();
if (!pool) {
  console.log('no postgres pool');
  process.exit(0);
}

const tours = await pool.query('SELECT status::text AS status, count(*)::int AS count FROM tours GROUP BY status ORDER BY 1');
const cms = await pool.query('SELECT status, count(*)::int AS count FROM cms_safaris GROUP BY status ORDER BY 1');
const live = await pool.query(
  "SELECT slug, status::text AS status, title, price_from FROM tours WHERE status::text <> 'ARCHIVED' ORDER BY title"
);
console.log('tours by status', tours.rows);
console.log('cms_safaris by status', cms.rows);
console.log('live tours');
for (const row of live.rows) console.log(' -', row.status, row.slug, row.price_from);
await pool.end();
