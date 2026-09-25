import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'Assets 001', 'gms gallery');
const destDir = path.join(root, 'apps', 'website-com', 'public', 'images', 'gallery');
const storePath = path.join(root, 'apps', 'api', 'data', 'cms', 'store.json');
const countsPath = path.join(root, 'packages', 'safari-ui', 'src', 'gallery-kind.js');

const GROUPS = [
  { folder: 'serengeti', prefix: 'serengeti' },
  { folder: 'Ngorongoro', prefix: 'ngorongoro' },
  { folder: 'Tarangire', prefix: 'tarangire' },
  { folder: 'kilimanjaro', prefix: 'kilimanjaro' },
  { folder: 'zanzibar', prefix: 'zanzibar' },
  { folder: 'culture', prefix: 'culture' },
  { folder: 'Arusha national park', prefix: 'arusha' },
  { folder: 'lake eyasi', prefix: 'eyasi' },
  { folder: 'kilimanjaro maps for routes', prefix: 'maps' },
  { folder: 'mikumi', prefix: 'mikumi' },
  { folder: 'ruaha', prefix: 'ruaha' },
  { folder: 'selous', prefix: 'selous' },
];

function sourceFiles(folder) {
  const dir = path.join(sourceRoot, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((name) => path.join(dir, name));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function writeCounts(counts) {
  let source = fs.readFileSync(countsPath, 'utf8');
  source = source.replace(/export const GALLERY_COUNTS = \{[\s\S]*?\};/, () => {
    const body = Object.entries(counts)
      .map(([key, value]) => `  ${key}: ${value},`)
      .join('\n');
    return `export const GALLERY_COUNTS = {\n${body}\n};`;
  });
  fs.writeFileSync(countsPath, source);
}

function rewriteStoreUrls(store, removedUrls) {
  if (!removedUrls.size) return store;
  const text = JSON.stringify(store);
  let next = text;
  for (const url of removedUrls) {
    next = next.split(url).join('');
  }
  try {
    return JSON.parse(next);
  } catch {
    return store;
  }
}

fs.mkdirSync(destDir, { recursive: true });

const keep = new Set();
const counts = {};

for (const { folder, prefix } of GROUPS) {
  const files = sourceFiles(folder);
  counts[prefix] = files.length;
  for (const [index, src] of files.entries()) {
    const destName = `${prefix}-${pad(index + 1)}.webp`;
    keep.add(destName);
    keep.add(destName.replace(/\.webp$/i, '-card.webp'));
    const dest = path.join(destDir, destName);
    await sharp(src)
      .rotate()
      .resize({ width: 1920, height: 1280, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(dest);
    console.log(`${folder}/${path.basename(src)} -> ${destName}`);
  }
}

const removed = [];
const removedUrls = new Set();
for (const name of fs.readdirSync(destDir)) {
  if (!keep.has(name)) {
    fs.unlinkSync(path.join(destDir, name));
    removed.push(name);
    if (!name.includes('-card.')) removedUrls.add(`/images/gallery/${name}`);
  }
}

writeCounts(counts);

if (fs.existsSync(storePath) && removedUrls.size) {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const next = rewriteStoreUrls(store, removedUrls);
  fs.writeFileSync(storePath, `${JSON.stringify(next, null, 2)}\n`);
}

console.log(JSON.stringify({ counts, removed }, null, 2));
