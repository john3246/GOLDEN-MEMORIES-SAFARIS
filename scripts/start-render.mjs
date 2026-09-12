/**
 * Render start: API + public website + CMS at /cms/.
 * Builds the site if this Web Service did not run build:render.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cmsIndex = path.join(root, 'apps/website-com/dist/cms/index.html');

process.env.SERVE_PUBLIC = process.env.SERVE_PUBLIC || 'true';

if (!fs.existsSync(cmsIndex)) {
  console.log('Website/CMS dist missing — running npm run build:render');
  const result = spawnSync('npm run build:render', {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

await import('../apps/api/src/server.js');
