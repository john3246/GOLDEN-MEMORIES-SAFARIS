import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { createId, slugify } from '@gm-safaris/shared-utils';
import { SafariStatus } from '@gm-safaris/shared-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const destDir = path.join(root, 'apps', 'website-com', 'public', 'images', 'accommodations');
const contentPath = path.join(root, 'apps', 'website-com', 'src', 'pages', 'accommodations', 'content.js');
const storePath = path.join(root, 'apps', 'api', 'data', 'cms', 'store.json');

const FALLBACKS = {
  'Njiro Legacy Hotel':
    'A quieter Njiro stay with Meru views — used for arrival and last nights when you want space away from town traffic.',
  'Gold Crest Hotel': 'A practical Arusha hotel with a pool — used before and after northern-circuit days.',
  "Ang'ata Tarangire Camp":
    'Canvas rooms among baobabs on the Tarangire circuit — elephant country and a mess tent after the drive.',
  'Tarangire Tortilis Camp':
    'A tented camp among baobabs on the Tarangire circuit — elephant country and big-sky evenings.',
  'Kibo Palace Hotel':
    'A fuller Arusha hotel stay — rooms, dining, and a pool for arrival or last nights on a luxury circuit.',
  "Oliver's Camp / Kuro Treetops":
    'Asilia’s Tarangire camps — walking country, baobabs, and tented rooms placed for the park’s quieter southern circuits.',
  'Kubu Kubu Tented Lodge':
    'A Tanganyika Wilderness Camps tented lodge in the Serengeti — used for luxury canvas nights on the circuit.',
  'Ole Serai Luxury Camps (Turner Springs)':
    'A Wellworth Collection camp at Turner Springs — luxury tents for Serengeti game-drive days.',
  'Ngorongoro Oldeani Mountain Lodge':
    'A Wellworth Collection highland lodge near Oldeani — used for luxury crater nights with mountain views.',
  'Lake Manyara Kilimamoja Lodge':
    'A Wellworth Collection lodge above the Rift — premium nights between Tarangire and Lake Manyara.',
  'Meliá Serengeti Lodge': 'A hilltop Meliá lodge in the Serengeti — premium rooms and views for plains days.',
  'Serengeti Explorer':
    'An Elewana Collection camp in the Serengeti — premium tents placed for migration and resident-game months.',
  'Pioneer Camp': 'Elewana’s Pioneer Camp in the Serengeti — a premium tented stay for game-drive days on the plains.',
  'The Manor at Ngorongoro':
    'Elewana’s manor-house lodge in the Karatu highlands — a premium night before or after the crater.',
  'Ngorongoro Lodge Meliá Collection':
    'A Meliá Collection lodge on the crater highlands — premium rooms for crater-morning circuits.',
  "Ang'ata Serengeti Camp":
    'A mobile-feel tented camp placed for Serengeti game-drive days — canvas rooms and a mess tent in the bush.',
  "Ang'ata Ngorongoro Camp":
    'Tented highland nights near the crater rim — used when you want canvas before an early crater descent.',
  'Four Seasons Safari Lodge Serengeti':
    'A flagship Serengeti lodge — used when the circuit should stay at the top of the range.',
  'Sound of Silence Manyara':
    'Tented nights with escarpment and lake-circuit access — canvas rooms when you want a quieter Manyara stay.',
};

const WEBSITES = {
  'Sound of Silence Manyara': 'https://serengetisoundofsilence.com/',
  "Manyara's Secret": 'https://manyarassecret.com/',
  'Mawe Mawe Manyara Lodge': 'https://mawemawemanyaralodge.com/',
  'Mama Dunia Safari Lodge': 'https://mamaduniasafarilodge.co.tz/',
  'Sametu Camp': 'https://karibucamps.com/sametu-camp/',
  'Nakupenda Luxury Camp': 'https://nakupendacamps.com/',
  'Ngorongoro Lodge Meliá Collection':
    'https://www.melia.com/en/hotels/tanzania/ngorongoro-conservation-area/ngorongoro-lodge-melia-collection',
};

const { lodges, accommodationsHero } = await import(`${pathToFileURL(contentPath).href}?t=${Date.now()}`);

function decode(value) {
  return String(value || '')
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#32;/g, ' ')
    .replace(/&#46;/g, '.')
    .replace(/&#58;/g, ':')
    .replace(/&#47;/g, '/')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isJunk(blurb) {
  const text = decode(blurb);
  return (
    !text ||
    text.length < 60 ||
    /reference#|edgesuite|could not be found|raha tower|kibo palace hotels \| apartments/i.test(text) ||
    /elewana collection of 16|book now https|\[&hellip;\]|one-page njiro/i.test(text) ||
    /best hotels in tanzania located in mwanza/i.test(text)
  );
}

async function optimize(src, dest) {
  await sharp(src, { failOn: 'none' })
    .rotate()
    .resize({ width: 1920, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(dest);
}

const sosRaws = ['sos-raw-1.jpg', 'sos-raw-2.jpg', 'sos-raw-3.jpg']
  .map((name) => path.join(destDir, name))
  .filter((file) => fs.existsSync(file));

for (const [index, src] of sosRaws.entries()) {
  const destName = index === 0 ? 'sound-of-silence-manyara.webp' : `sound-of-silence-manyara-${index + 1}.webp`;
  await optimize(src, path.join(destDir, destName));
}

const next = lodges.map((lodge) => {
  const image =
    lodge.name === 'Sound of Silence Manyara' && sosRaws.length
      ? '/images/accommodations/sound-of-silence-manyara.webp'
      : lodge.image;
  const gallery =
    lodge.name === 'Sound of Silence Manyara' && sosRaws.length > 1
      ? sosRaws.slice(1).map((_, index) => `/images/accommodations/sound-of-silence-manyara-${index + 2}.webp`)
      : lodge.gallery || [];
  const fromImage = String(image || '')
    .replace(/^\/images\/accommodations\//, '')
    .replace(/\.webp$/, '')
    .replace(/-\d+$/, '');
  const slug = !fromImage || fromImage === 'hero' ? slugify(lodge.name.replace(/['’áéíóúÁÉÍÓÚ]/g, '')) : fromImage;
  return {
    name: lodge.name,
    place: lodge.place,
    region: lodge.region,
    category: lodge.category,
    blurb: FALLBACKS[lodge.name] || decode(lodge.blurb) || lodge.blurb,
    website: WEBSITES[lodge.name] || lodge.website,
    image,
    gallery,
    slug,
  };
});

function renderContent(rows, hero) {
  const body = rows
    .map(
      (lodge) => `  {
    name: ${JSON.stringify(lodge.name)},
    place: ${JSON.stringify(lodge.place)},
    region: ${JSON.stringify(lodge.region)},
    category: ${JSON.stringify(lodge.category)},
    blurb: ${JSON.stringify(lodge.blurb)},
    website: ${JSON.stringify(lodge.website)},
    image: ${JSON.stringify(lodge.image)},
    gallery: ${JSON.stringify(lodge.gallery)},
  }`
    )
    .join(',\n');
  return `export const accommodationsHero = {
  image: ${JSON.stringify(hero)},
};

export const lodges = [
${body}
];
`;
}

fs.writeFileSync(contentPath, renderContent(next, accommodationsHero.image));

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const at = new Date().toISOString();
if (!store.settings?.site) store.settings = { ...(store.settings || {}), site: {} };
store.settings.site.tagline = 'Every Safari With A sparkle of Golden Memories.';

const existing = store.lodges || [];
const keep = new Set(next.map((item) => item.slug));
store.lodges = next.map((lodge) => {
  const prev =
    existing.find((item) => item.slug === lodge.slug) ||
    existing.find((item) => String(item.draft?.title || item.published?.title || '') === lodge.name);
  const draft = {
    title: lodge.name,
    slug: lodge.slug,
    place: lodge.place,
    region: lodge.region,
    category: lodge.category,
    blurb: lodge.blurb,
    website: lodge.website,
    image: lodge.image,
    gallery: [lodge.image, ...(lodge.gallery || [])].filter(Boolean),
  };
  return {
    id: prev?.id || createId(),
    type: 'lodges',
    slug: lodge.slug,
    status: SafariStatus.PUBLISHED,
    draft,
    published: { ...draft },
    created_by: prev?.created_by || 'seed',
    updated_by: 'accommodation-patch',
    created_at: prev?.created_at || at,
    updated_at: at,
    published_at: at,
  };
});

for (const lodge of existing) {
  if (keep.has(lodge.slug)) continue;
  store.lodges.push({
    ...lodge,
    status: SafariStatus.DRAFT,
    published: null,
    published_at: null,
    updated_by: 'accommodation-patch',
    updated_at: at,
  });
}

const tmp = `${storePath}.${process.pid}.tmp`;
fs.writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`);
try {
  fs.renameSync(tmp, storePath);
} catch {
  fs.copyFileSync(tmp, storePath);
  fs.unlinkSync(tmp);
}

for (const name of ['sos-raw-1.jpg', 'sos-raw-2.jpg', 'sos-raw-3.jpg', 'sos-raw-4.jpg', 'sos-media.json', 'melia-ngor.html']) {
  const file = path.join(destDir, name);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

console.log(
  JSON.stringify(
    {
      lodges: next.length,
      with3: next.filter((item) => [item.image, ...(item.gallery || [])].filter(Boolean).length >= 3).length,
      with2: next.filter((item) => [item.image, ...(item.gallery || [])].filter(Boolean).length === 2).length,
      with1: next.filter((item) => [item.image, ...(item.gallery || [])].filter(Boolean).length === 1).length,
      heroFallbacks: next.filter((item) => item.image.includes('hero.webp')).map((item) => item.name),
    },
    null,
    2
  )
);
