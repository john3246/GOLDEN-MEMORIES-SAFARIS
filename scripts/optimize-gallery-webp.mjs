import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryDir = path.resolve(__dirname, '../apps/website-com/public/images/gallery');
const storePath = path.resolve(__dirname, '../apps/api/data/cms/store.json');
const tripsPath = path.resolve(__dirname, '../apps/website-com/src/pages/tours/gms-trips.js');

const files = fs.readdirSync(galleryDir).filter((name) => /\.(jpe?g|png)$/i.test(name));

for (const name of files) {
  const src = path.join(galleryDir, name);
  const dest = path.join(galleryDir, name.replace(/\.(jpe?g|png)$/i, '.webp'));
  await sharp(src)
    .rotate()
    .resize({ width: 1920, height: 1280, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toFile(dest);
  fs.unlinkSync(src);
  const before = fs.statSync(dest).size;
  console.log(`${name} -> ${path.basename(dest)} (${Math.round(before / 1024)} KB)`);
}

function rewriteGalleryJpg(text) {
  return text.replace(/\/images\/gallery\/([^"'?\s]+)\.(jpe?g|png)/gi, '/images/gallery/$1.webp');
}

fs.writeFileSync(storePath, rewriteGalleryJpg(fs.readFileSync(storePath, 'utf8')));
fs.writeFileSync(tripsPath, rewriteGalleryJpg(fs.readFileSync(tripsPath, 'utf8')));
console.log('Rewrote CMS store and trip image URLs to .webp');
