import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';

const EMPTY = () => ({
  users: [],
  safaris: [],
  media: [],
  apiClients: [],
  auditLogs: [],
  revisions: [],
  pages: [],
  destinations: [],
  posts: [],
  testimonials: [],
  faqs: [],
  lodges: [],
  departures: [],
  menus: [],
  inquiries: [],
  bookings: [],
  customers: [],
  settings: null,
  meta: { seededUsers: false, seededSafaris: false, seededSite: false },
});

let dataDir = config.cms.dataDir;
let cache = null;
let cacheMtime = 0;
let writeChain = Promise.resolve();

export function getCmsDataDir() {
  return dataDir;
}

export function setCmsDataDir(dir) {
  dataDir = dir;
  cache = null;
  cacheMtime = 0;
}

function filePath() {
  return path.join(dataDir, 'store.json');
}

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readUnlocked() {
  await ensureDir();
  try {
    const fp = filePath();
    const stat = await fs.stat(fp);
    if (cache && stat.mtimeMs === cacheMtime) return cache;
    const raw = await fs.readFile(fp, 'utf8');
    cache = { ...EMPTY(), ...JSON.parse(raw) };
    cacheMtime = stat.mtimeMs;
  } catch (err) {
    if (err && err.code !== 'ENOENT') throw err;
    cache = EMPTY();
    cacheMtime = 0;
  }
  return cache;
}

async function writeUnlocked(next) {
  await ensureDir();
  const tmp = `${filePath()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf8');
  await fs.rename(tmp, filePath());
  cache = next;
  try {
    cacheMtime = (await fs.stat(filePath())).mtimeMs;
  } catch {
    cacheMtime = Date.now();
  }
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
 * Mutate the in-memory store and persist.
 * @template T
 * @param {(store: ReturnType<typeof EMPTY>) => T | Promise<T>} mutator
 * @returns {Promise<T>}
 */
export async function updateStore(mutator) {
  return withLock(async () => {
    const store = await readUnlocked();
    const result = await mutator(store);
    await writeUnlocked(store);
    return result;
  });
}

export async function resetCmsStore(dir) {
  if (dir) setCmsDataDir(dir);
  cache = EMPTY();
  await ensureDir();
  await writeUnlocked(EMPTY());
}

export const COLLECTIONS = Object.freeze([
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
]);
