import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setCmsDataDir, readStore } from '../src/cms-store/index.js';
import { upgradeCatalogCopy } from '../src/modules/content/catalog.upgrade.js';
import { syncAllSafaris } from '../src/modules/safaris/safari.maintenance.js';
import { getPool } from '../src/database/pg-pool.js';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(apiRoot);
const dataDir = path.join(apiRoot, 'data', 'cms');
setCmsDataDir(dataDir);

const files = await fs.readdir(dataDir);
for (const name of files) {
  if (name.startsWith('store.json.') && name.endsWith('.tmp')) {
    await fs.unlink(path.join(dataDir, name)).catch(() => {});
  }
}

await upgradeCatalogCopy();
await syncAllSafaris();

const store = await readStore();
const meru = (store.safaris || []).find((item) => String(item.slug || '').includes('meru'));
const menu = (store.menus || []).find((item) => item.draft?.location === 'primary' || item.published?.location === 'primary');
const serengeti = (store.destinations || []).find((item) => item.slug === 'serengeti');
console.log(
  JSON.stringify(
    {
      meruTitle: meru?.published?.title || meru?.draft?.title,
      menuItems: menu?.published?.items || menu?.draft?.items,
      serengetiBlocks: serengeti?.published?.blocks?.length || serengeti?.draft?.blocks?.length || 0,
      serengetiFacts: Boolean(serengeti?.published?.facts || serengeti?.draft?.facts),
    },
    null,
    2
  )
);
await getPool()?.end();
