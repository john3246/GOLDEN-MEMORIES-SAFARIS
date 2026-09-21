import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setCmsDataDir } from '../src/cms-store/index.js';
import { getPool } from '../src/database/pg-pool.js';
import { replacePdfSafariCatalog } from '../src/modules/safaris/safari.maintenance.js';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(apiRoot);
setCmsDataDir(path.join(apiRoot, 'data', 'cms'));

const result = await replacePdfSafariCatalog();
console.log(JSON.stringify(result, null, 2));
await getPool()?.end();
