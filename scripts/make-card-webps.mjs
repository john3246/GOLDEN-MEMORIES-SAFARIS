import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const galleryDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/website-com/public/images/gallery');
const files = fs.readdirSync(galleryDir).filter((name) => /\.webp$/i.test(name) && !name.includes('-card.'));

for (const name of files) {
  const src = path.join(galleryDir, name);
  const dest = path.join(galleryDir, name.replace(/\.webp$/i, '-card.webp'));
  await sharp(src)
    .resize({ width: 800, height: 560, fit: 'cover' })
    .webp({ quality: 68, effort: 4 })
    .toFile(dest);
  console.log(`${name} -> ${path.basename(dest)} (${Math.round(fs.statSync(dest).size / 1024)} KB)`);
}
