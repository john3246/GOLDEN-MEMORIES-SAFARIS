import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'Assets 001', 'gms gallery');
const destDir = path.join(root, 'apps', 'website-com', 'public', 'images', 'gallery');
const storePath = path.join(root, 'apps', 'api', 'data', 'cms', 'store.json');
const galleryPath = path.join(root, 'apps', 'website-com', 'src', 'media', 'gallery.js');

const GROUPS = [
  { folder: 'serengeti', prefix: 'serengeti' },
  { folder: 'Ngorongoro', prefix: 'ngorongoro' },
  { folder: 'Tarangire', prefix: 'tarangire' },
  { folder: 'kilimanjaro', prefix: 'kilimanjaro' },
  { folder: 'zanzibar', prefix: 'zanzibar' },
  { folder: 'culture', prefix: 'culture' },
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

function replaceCount(source, prefix, count) {
  const pattern = new RegExp(`numbered\\('${prefix}',\\s*\\d+\\)`);
  if (!pattern.test(source)) {
    throw new Error(`gallery.js is missing numbered('${prefix}', n)`);
  }
  return source.replace(pattern, `numbered('${prefix}', ${count})`);
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
    const dest = path.join(destDir, destName);
    await sharp(src)
      .rotate()
      .resize({ width: 1920, height: 1280, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(dest);
    console.log(`${folder}/${path.basename(src)} -> ${destName}`);
  }
}

let removed = [];
for (const name of fs.readdirSync(destDir)) {
  if (name.endsWith('-card.webp')) continue;
  if (!keep.has(name)) {
    fs.unlinkSync(path.join(destDir, name));
    removed.push(name);
  }
}

let galleryJs = fs.readFileSync(galleryPath, 'utf8');
for (const { prefix } of GROUPS) {
  galleryJs = replaceCount(galleryJs, prefix, counts[prefix] || 0);
}
fs.writeFileSync(galleryPath, galleryJs);

const { photoForText } = await import(`${pathToFileURL(galleryPath).href}?t=${Date.now()}`);

function applyImage(target, hint, index, field = 'image') {
  if (!target || typeof target !== 'object') return;
  const next = photoForText(hint, index);
  if (typeof target[field] === 'string') target[field] = next;
  if (target[field] && typeof target[field] === 'object' && 'url' in target[field]) {
    target[field].url = next;
  }
}

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
for (const record of store.safaris || []) {
  const hint = `${record.slug || ''} ${record.draft?.title || ''} ${record.draft?.destination || ''}`;
  for (const doc of [record.draft, record.published]) {
    if (!doc) continue;
    applyImage(doc, hint, 0, 'hero_image');
    if (Array.isArray(doc.gallery)) {
      doc.gallery.forEach((shot, index) => applyImage(shot, hint, index + 1, 'url'));
    }
    if (Array.isArray(doc.itinerary)) {
      doc.itinerary.forEach((day, index) => {
        applyImage(day, `${hint} ${day.title || ''}`, index, 'image');
      });
    }
  }
}
for (const type of ['destinations', 'posts', 'lodges', 'departures']) {
  for (const record of store[type] || []) {
    const hint = `${record.slug || ''} ${record.draft?.title || ''} ${record.draft?.region || ''}`;
    for (const doc of [record.draft, record.published]) {
      applyImage(doc, hint, 0, 'image');
    }
  }
}
fs.writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`);

console.log(JSON.stringify({ counts, removed }, null, 2));
