import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'Assets 001', 'gms gallery');
const destDir = path.join(root, 'apps', 'website-com', 'public', 'images', 'gallery');
const storePath = path.join(root, 'apps', 'api', 'data', 'cms', 'store.json');
const tripsPath = path.join(root, 'apps', 'website-com', 'src', 'pages', 'tours', 'gms-trips.js');
const galleryPath = path.join(root, 'apps', 'website-com', 'src', 'media', 'gallery.js');

const GROUPS = [
  { folder: 'serengeti', prefix: 'serengeti' },
  { folder: 'Ngorongoro', prefix: 'ngorongoro' },
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

fs.mkdirSync(destDir, { recursive: true });

const keep = new Set();
const counts = {};

for (const { folder, prefix } of GROUPS) {
  const files = sourceFiles(folder);
  counts[prefix] = files.length;
  files.forEach((src, index) => {
    const destName = `${prefix}-${pad(index + 1)}${path.extname(src).toLowerCase()}`;
    keep.add(destName);
    fs.copyFileSync(src, path.join(destDir, destName));
  });
}

let removed = [];
for (const name of fs.readdirSync(destDir)) {
  if (!keep.has(name)) {
    fs.unlinkSync(path.join(destDir, name));
    removed.push(name);
  }
}

const allowed = new Set([...keep].map((name) => `/images/gallery/${name}`));

let galleryJs = fs.readFileSync(galleryPath, 'utf8');
galleryJs = galleryJs
  .replace(/numbered\('serengeti',\s*\d+\)/, `numbered('serengeti', ${counts.serengeti})`)
  .replace(/numbered\('ngorongoro',\s*\d+\)/, `numbered('ngorongoro', ${counts.ngorongoro})`)
  .replace(/numbered\('culture',\s*\d+\)/, `numbered('culture', ${counts.culture})`);
fs.writeFileSync(galleryPath, galleryJs);

const { photoForText } = await import(`${pathToFileURL(galleryPath).href}?t=${Date.now()}`);

function isImageUrl(value) {
  if (typeof value !== 'string' || !value) return false;
  if (/\/images\/gallery\//.test(value)) return true;
  if (/wp-content\/uploads/i.test(value)) return true;
  if (/unsplash\.com/i.test(value)) return true;
  return /^https?:\/\//i.test(value) && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(value);
}

function remap(value, hint, index) {
  if (typeof value === 'string' && isImageUrl(value) && !allowed.has(value.split('?')[0])) {
    return photoForText(hint, index);
  }
  if (Array.isArray(value)) {
    return value.map((item, offset) => remap(item, hint, index + offset));
  }
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, nested] of Object.entries(value)) {
      const nestedHint = `${hint} ${nested?.alt || nested?.title || nested?.day || nested?.slug || key}`;
      next[key] = remap(nested, nestedHint, index);
    }
    return next;
  }
  return value;
}

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const remapped = remap(store, 'tanzania safari', 0);
fs.writeFileSync(storePath, `${JSON.stringify(remapped, null, 2)}\n`);

let trips = fs.readFileSync(tripsPath, 'utf8');
trips = trips.replace(
  /"image":\s*"https:\/\/[^"]+"/g,
  (match, offset, source) => {
    const before = source.slice(Math.max(0, offset - 400), offset);
    const title = (before.match(/"title":\s*"([^"]+)"/) || [])[1] || 'tanzania safari';
    return `"image": "${photoForText(title, 0)}"`;
  }
);
fs.writeFileSync(tripsPath, trips);

console.log(
  JSON.stringify(
    {
      counts,
      kept: [...keep].sort(),
      removed,
    },
    null,
    2
  )
);
