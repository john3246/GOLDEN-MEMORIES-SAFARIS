import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dirs = [
  path.join(root, 'apps', 'website-com', 'public', 'images'),
  path.join(root, 'apps', 'api', 'uploads'),
];
const storePath = path.join(root, 'apps', 'api', 'data', 'cms', 'store.json');
const tripsPath = path.join(root, 'apps', 'website-com', 'src', 'pages', 'tours', 'gms-trips.js');

function walk(dir, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else if (/\.(jpe?g|png)$/i.test(entry.name) && !/-card\./i.test(entry.name)) found.push(full);
  }
  return found;
}

const files = dirs.flatMap((dir) => walk(dir));
const rewritten = [];

for (const src of files) {
  const dest = src.replace(/\.(jpe?g|png)$/i, '.webp');
  await sharp(src)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(dest);
  fs.unlinkSync(src);
  rewritten.push({ from: src.replace(/\\/g, '/'), to: dest.replace(/\\/g, '/'), kb: Math.round(fs.statSync(dest).size / 1024) });
  console.log(`${path.relative(root, src)} -> ${path.basename(dest)} (${rewritten.at(-1).kb} KB)`);
}

function rewriteUrls(text) {
  let next = text;
  for (const item of rewritten) {
    const fromName = path.basename(item.from);
    const toName = path.basename(item.to);
    if (fromName !== toName) next = next.split(fromName).join(toName);
  }
  return next.replace(/\/images\/([^"'?\s]+)\.(jpe?g|png)/gi, '/images/$1.webp');
}

if (rewritten.length) {
  if (fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, rewriteUrls(fs.readFileSync(storePath, 'utf8')));
  }
  if (fs.existsSync(tripsPath)) {
    fs.writeFileSync(tripsPath, rewriteUrls(fs.readFileSync(tripsPath, 'utf8')));
  }
}

console.log(JSON.stringify({ converted: rewritten.length }, null, 2));
