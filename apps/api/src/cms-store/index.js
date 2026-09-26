/**
 * CMS store facade.
 *
 * Backends
 * - "postgres" (default whenever DATABASE_* is configured and reachable):
 *   every CMS collection is saved in PostgreSQL (cms_documents).
 * - "file": data/cms/store.json — only used by the automated tests or when
 *   CMS_STORE=file is set explicitly, or as an emergency fallback when the
 *   database cannot be reached at boot.
 *
 * Call initCmsStore() once at startup (server.js does this) before serving
 * traffic. Until then the file backend is active, which is what tests use.
 */
import * as fileStore from './file-store.js';
import * as pgStore from './pg-store.js';
import { logger } from '../logging/index.js';

let backend = 'file';
let backendReason = 'default (not initialised)';

export function storeBackend() {
  return { backend, reason: backendReason };
}

export function storeRevision() {
  return backend === 'postgres' ? `pg:${pgStore.pgStoreRevision()}` : `file:${fileStore.fileStoreRevision()}`;
}

export async function readStore() {
  return backend === 'postgres' ? pgStore.readStore() : fileStore.readStore();
}

/**
 * @template T
 * @param {(store: any) => T | Promise<T>} mutator
 * @returns {Promise<T>}
 */
export async function updateStore(mutator) {
  return backend === 'postgres' ? pgStore.updateStore(mutator) : fileStore.updateStore(mutator);
}

/**
 * Pick and prepare the storage backend.
 * @param {{ pool: import('pg').Pool | null, mode?: string }} options
 */
export async function initCmsStore({ pool, mode = process.env.CMS_STORE || 'auto' }) {
  await fileStore.cleanStaleTempFiles();
  const wanted = String(mode || 'auto').toLowerCase();
  if (wanted === 'file' || !pool) {
    backend = 'file';
    backendReason = wanted === 'file' ? 'CMS_STORE=file' : 'PostgreSQL is not configured';
    if (wanted !== 'file') {
      logger.warn('CMS is saving to data/cms/store.json because PostgreSQL is not configured (set DATABASE_PASSWORD in .env).');
    }
    return storeBackend();
  }

  try {
    pgStore.configurePgStore(pool);
    if (await pgStore.isPgStoreEmpty()) {
      const legacy = await fileStore.readStoreFile();
      if (legacy) {
        await pgStore.importStore(legacy);
        const counts = Object.fromEntries(
          Object.entries(legacy)
            .filter(([, value]) => Array.isArray(value))
            .map(([key, value]) => [key, value.length])
        );
        logger.info('Imported existing CMS content from store.json into PostgreSQL', counts);
      }
    }
    await pgStore.readStore();
    backend = 'postgres';
    backendReason = 'PostgreSQL connected';
    logger.info('CMS store: PostgreSQL');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (wanted === 'postgres') throw err;
    backend = 'file';
    backendReason = `PostgreSQL unavailable (${message})`;
    logger.error('CMS store falling back to store.json — PostgreSQL unavailable', { message });
  }
  return storeBackend();
}

/** Test helpers — always the file backend. */
export async function resetCmsStore(dir) {
  backend = 'file';
  backendReason = 'tests';
  return fileStore.resetCmsStore(dir);
}

export function setCmsDataDir(dir) {
  return fileStore.setCmsDataDir(dir);
}

export function getCmsDataDir() {
  return fileStore.getCmsDataDir();
}

export const COLLECTIONS = fileStore.COLLECTIONS;
