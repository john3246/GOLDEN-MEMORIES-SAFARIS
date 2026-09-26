/**
 * PostgreSQL-backed CMS store.
 *
 * Same contract as file-store.js (readStore / updateStore) so every module —
 * tours, destinations, blog, lodges, pages, FAQs, menus, group safaris,
 * bookings, inquiries, customers, media, reviews, webhooks, audit log — is
 * persisted to the database without changing its business logic.
 *
 * How it works
 * - On first use every row of cms_documents / cms_kv is loaded into memory.
 * - updateStore() runs the mutator against that copy, then diffs it against
 *   the last saved snapshot and writes only the changed rows in ONE
 *   transaction. If the write fails the in-memory copy is thrown away and
 *   reloaded, so the API never serves data that is not in the database.
 * - Writes are serialised through a promise chain (single API process).
 */
import { createId } from '@gm-safaris/shared-utils';
import { logger } from '../logging/index.js';

export const STORE_COLLECTIONS = Object.freeze([
  'users',
  'safaris',
  'media',
  'apiClients',
  'auditLogs',
  'revisions',
  'pages',
  'destinations',
  'posts',
  'testimonials',
  'faqs',
  'lodges',
  'departures',
  'menus',
  'inquiries',
  'bookings',
  'customers',
  'reviews',
  'webhooks',
  'webhookDeliveries',
  'notifications',
]);

const KV_KEYS = Object.freeze(['settings', 'meta', 'reviewSummary']);

export const EMPTY = () => ({
  ...Object.fromEntries(STORE_COLLECTIONS.map((name) => [name, []])),
  settings: null,
  reviewSummary: null,
  meta: { seededUsers: false, seededSafaris: false, seededSite: false },
});

let pool = null;
let cache = null;
/** @type {Map<string, Map<string, string>>} collection -> id -> JSON */
let snapshot = new Map();
/** @type {Map<string, string>} collection -> JSON of id order */
let orderSnapshot = new Map();
/** @type {Map<string, string>} */
let kvSnapshot = new Map();
let writeChain = Promise.resolve();
let revision = 0;

export function configurePgStore(nextPool) {
  pool = nextPool;
  cache = null;
}

export function pgStoreRevision() {
  return revision;
}

function stamp(item) {
  return String(item?.updated_at || item?.updatedAt || item?.published_at || item?.created_at || item?.createdAt || '');
}

/**
 * Give every record an id and remove duplicate ids (older builds could store
 * the same record twice — e.g. a draft and a published copy). The most
 * recently updated copy wins.
 */
function normaliseList(list) {
  const byId = new Map();
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    if (!item.id) item.id = createId();
    const key = String(item.id);
    const existing = byId.get(key);
    if (!existing || stamp(item) > stamp(existing)) byId.set(key, item);
  }
  if (byId.size === list.filter((item) => item && typeof item === 'object').length) return list;
  const kept = new Set(byId.values());
  const seen = new Set();
  const next = [];
  for (const item of list) {
    if (!kept.has(item) || seen.has(item)) continue;
    seen.add(item);
    next.push(item);
  }
  logger.warn('Removed duplicate CMS records with the same id', { removed: list.length - next.length });
  return next;
}

async function loadAll() {
  if (!pool) throw new Error('PostgreSQL store is not configured');
  const [docs, orders, kv] = await Promise.all([
    pool.query('SELECT collection, id, data FROM cms_documents'),
    pool.query('SELECT collection, ids FROM cms_collection_order'),
    pool.query('SELECT key, value FROM cms_kv'),
  ]);
  const next = EMPTY();
  const byCollection = new Map();
  for (const row of docs.rows) {
    if (!byCollection.has(row.collection)) byCollection.set(row.collection, new Map());
    byCollection.get(row.collection).set(row.id, row.data);
  }
  const orderMap = new Map(orders.rows.map((row) => [row.collection, row.ids || []]));

  snapshot = new Map();
  orderSnapshot = new Map();
  for (const [collection, rows] of byCollection) {
    const ids = orderMap.get(collection) || [];
    const seen = new Set();
    const list = [];
    for (const id of ids) {
      if (rows.has(id) && !seen.has(id)) {
        list.push(rows.get(id));
        seen.add(id);
      }
    }
    for (const [id, data] of rows) {
      if (!seen.has(id)) list.push(data);
    }
    next[collection] = list;
    snapshot.set(collection, new Map(list.map((item) => [String(item.id), JSON.stringify(item)])));
    orderSnapshot.set(collection, JSON.stringify(list.map((item) => String(item.id))));
  }
  kvSnapshot = new Map();
  for (const row of kv.rows) {
    next[row.key] = row.value;
    kvSnapshot.set(row.key, JSON.stringify(row.value ?? null));
  }
  next.meta = next.meta || { seededUsers: false, seededSafaris: false, seededSite: false };
  cache = next;
  return cache;
}

async function readUnlocked() {
  if (cache) return cache;
  return loadAll();
}

function collectionsOf(store) {
  const names = new Set(STORE_COLLECTIONS);
  for (const key of Object.keys(store)) {
    if (Array.isArray(store[key]) && !KV_KEYS.includes(key)) names.add(key);
  }
  for (const key of snapshot.keys()) names.add(key);
  return [...names];
}

async function persist(store) {
  const upserts = [];
  const deletes = [];
  const orders = [];
  const kvWrites = [];
  const nextSnapshot = new Map();
  const nextOrder = new Map();

  for (const collection of collectionsOf(store)) {
    if (Array.isArray(store[collection])) store[collection] = normaliseList(store[collection]);
    const list = Array.isArray(store[collection]) ? store[collection] : [];
    const before = snapshot.get(collection) || new Map();
    const after = new Map();
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const id = String(item.id);
      const json = JSON.stringify(item);
      after.set(id, json);
      if (before.get(id) !== json) upserts.push([collection, id, json]);
    }
    for (const id of before.keys()) {
      if (!after.has(id)) deletes.push([collection, id]);
    }
    const orderJson = JSON.stringify([...after.keys()]);
    if ((orderSnapshot.get(collection) || '[]') !== orderJson) orders.push([collection, [...after.keys()]]);
    nextSnapshot.set(collection, after);
    nextOrder.set(collection, orderJson);
  }

  const nextKv = new Map();
  for (const key of new Set([...KV_KEYS, ...kvSnapshot.keys()])) {
    const json = JSON.stringify(store[key] ?? null);
    nextKv.set(key, json);
    if (kvSnapshot.get(key) !== json) kvWrites.push([key, json]);
  }

  if (!upserts.length && !deletes.length && !orders.length && !kvWrites.length) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Batch upserts to keep round trips low on big imports.
    const CHUNK = 200;
    for (let i = 0; i < upserts.length; i += CHUNK) {
      const slice = upserts.slice(i, i + CHUNK);
      const values = [];
      const params = [];
      slice.forEach(([collection, id, json], index) => {
        const base = index * 3;
        values.push(`($${base + 1}, $${base + 2}, $${base + 3}::jsonb)`);
        params.push(collection, id, json);
      });
      await client.query(
        `INSERT INTO cms_documents (collection, id, data)
         VALUES ${values.join(', ')}
         ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        params
      );
    }
    for (const [collection, id] of deletes) {
      await client.query('DELETE FROM cms_documents WHERE collection = $1 AND id = $2', [collection, id]);
    }
    for (const [collection, ids] of orders) {
      await client.query(
        `INSERT INTO cms_collection_order (collection, ids) VALUES ($1, $2)
         ON CONFLICT (collection) DO UPDATE SET ids = EXCLUDED.ids, updated_at = now()`,
        [collection, ids]
      );
    }
    for (const [key, json] of kvWrites) {
      await client.query(
        `INSERT INTO cms_kv (key, value) VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [key, json]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  snapshot = nextSnapshot;
  orderSnapshot = nextOrder;
  kvSnapshot = nextKv;
  revision += 1;
}

function withLock(fn) {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function readStore() {
  return withLock(() => readUnlocked());
}

/**
 * @template T
 * @param {(store: ReturnType<typeof EMPTY>) => T | Promise<T>} mutator
 * @returns {Promise<T>}
 */
export async function updateStore(mutator) {
  return withLock(async () => {
    const store = await readUnlocked();
    try {
      const result = await mutator(store);
      await persist(store);
      return result;
    } catch (err) {
      // Never keep unsaved changes in memory.
      cache = null;
      logger.error('CMS database write failed', { message: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  });
}

/** Import a whole store object (used for the one-time store.json → PostgreSQL move). */
export async function importStore(data) {
  return updateStore((store) => {
    for (const key of Object.keys(EMPTY())) {
      if (data[key] !== undefined) store[key] = data[key];
    }
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key]) && store[key] === undefined) store[key] = data[key];
    }
  });
}

export async function isPgStoreEmpty() {
  const result = await pool.query('SELECT (SELECT count(*) FROM cms_documents) AS docs, (SELECT count(*) FROM cms_kv) AS kv');
  return Number(result.rows[0].docs) === 0 && Number(result.rows[0].kv) === 0;
}

export function invalidatePgStore() {
  cache = null;
}
