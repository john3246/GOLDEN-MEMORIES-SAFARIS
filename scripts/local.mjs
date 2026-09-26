/**
 * Production-like local run: build the website + CMS once, then serve
 * everything from the API on ONE address, exactly like the live server:
 *
 *   Website  http://localhost:3000
 *   CMS      http://localhost:3000/cms/
 *   API      http://localhost:3000/api/v1
 *   SEO      http://localhost:3000/sitemap.xml  ·  /robots.txt
 *
 * Usage: npm run local            (builds, then starts)
 *        npm run local -- --skip-build
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--skip-build')) {
  const result = spawnSync('npm run build:render', { cwd: root, stdio: 'inherit', shell: true, env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
process.env.SERVE_PUBLIC = 'true';
console.log('\n  Website  http://localhost:3000\n  CMS      http://localhost:3000/cms/\n');
await import('../apps/api/src/server.js');
