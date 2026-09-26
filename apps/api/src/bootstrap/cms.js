import { seedDefaultUsers, migrateStoreUsersToSql } from '../modules/users/index.js';
import { seedSafariPackages } from '../modules/safaris/index.js';
import { unpublishPricelessSafaris, syncAllSafaris, fillEmptyItineraries } from '../modules/safaris/safari.maintenance.js';
import { seedSiteContent, upgradeBlogDocuments, upgradeCatalogCopy } from '../modules/content/index.js';
import { seedWebsiteCatalog } from '../modules/content/site-catalog.seed.js';
import { upgradeSiteCopy } from '../modules/content/copy.upgrade.js';
import { syncAllGroupSafaris } from '../modules/content/departure.sync.js';
import { populatePostgresFromStore } from '../modules/content/catalog.sync.js';
import { backfillMediaBlobs } from '../modules/media/media.storage.js';
import { readStore, updateStore, storeBackend } from '../cms-store/index.js';
import { logger } from '../logging/index.js';

let bootstrapped = false;

/**
 * One-time data tasks.
 *
 * Older builds re-ran seeds and "upgrades" on EVERY start. That silently
 * overwrote editors' work: tour edits were replaced by the PDF packages,
 * lodge edits by the static catalog, deleted items came back, the admin
 * password was reset, and cleared fields were refilled. Each task now runs
 * once and is recorded in store.meta.bootTasks.
 */
async function runOnce(key, fn, { skipIf } = {}) {
  const store = await readStore();
  const done = store.meta?.bootTasks || {};
  if (done[key]) return false;
  let skipped = false;
  if (skipIf && (await skipIf(store))) {
    skipped = true;
  } else {
    await fn();
  }
  await updateStore((next) => {
    next.meta = { ...(next.meta || {}), bootTasks: { ...(next.meta?.bootTasks || {}), [key]: new Date().toISOString() } };
  });
  if (!skipped) logger.info('Ran one-time CMS task', { key });
  return !skipped;
}

function hasContent(store, keys) {
  return keys.every((key) => Array.isArray(store[key]) && store[key].length > 0);
}

export async function bootstrapCms() {
  if (bootstrapped) return;

  if (storeBackend().backend === 'postgres') {
    await migrateStoreUsersToSql();
  }
  await seedDefaultUsers();

  // First install only: seed the 12 published safari packages.
  await runOnce('seed-safari-packages-v1', () => seedSafariPackages(), {
    skipIf: (store) => (store.safaris || []).length > 0,
  });
  await runOnce('unpublish-priceless-safaris-v1', () => unpublishPricelessSafaris());
  await runOnce('fill-empty-itineraries-v1', () => fillEmptyItineraries());

  // Settings defaults are merged in (never overwritten); pages/menus only when empty.
  await seedSiteContent();
  await runOnce('seed-website-catalog-v1', () => seedWebsiteCatalog(), {
    skipIf: (store) => hasContent(store, ['destinations', 'posts', 'lodges']),
  });
  await runOnce('upgrade-blog-documents-v1', () => upgradeBlogDocuments());
  await runOnce('upgrade-catalog-copy-v1', () => upgradeCatalogCopy(), {
    skipIf: (store) => Boolean(store.meta?.seededSite) && hasContent(store, ['destinations']),
  });
  await runOnce('professional-copy-v1', () => upgradeSiteCopy());

  // PostgreSQL relational mirror (read models for the .co.tz API / reporting).
  await syncAllSafaris();
  await syncAllGroupSafaris();
  await populatePostgresFromStore();

  const store = await readStore();
  await backfillMediaBlobs(store.media || []);

  bootstrapped = true;
  logger.info('Safari CMS store ready', { backend: storeBackend().backend });
}

export function resetBootstrapFlag() {
  bootstrapped = false;
}
