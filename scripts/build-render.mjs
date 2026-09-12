import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, extraEnv = {}) {
  const result = spawnSync(command, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npm run build:website');
run('npm run build:cms', { CMS_BASE: '/cms/' });

const websiteDist = path.join(root, 'apps/website-com/dist');
const cmsDist = path.join(root, 'apps/cms/dist');
const cmsTarget = path.join(websiteDist, 'cms');

if (!fs.existsSync(cmsDist)) {
  console.error('CMS build output missing:', cmsDist);
  process.exit(1);
}

fs.rmSync(cmsTarget, { recursive: true, force: true });
fs.cpSync(cmsDist, cmsTarget, { recursive: true });
fs.writeFileSync(path.join(websiteDist, '_redirects'), '/cms /cms/ 301\n');

console.log('Render build ready: website + CMS at /cms/');
