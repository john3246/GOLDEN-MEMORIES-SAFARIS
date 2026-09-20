import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createId, slugify } from '@gm-safaris/shared-utils';
import { SafariStatus } from '@gm-safaris/shared-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'Assets 001', 'accomodations');
const destDir = path.join(root, 'apps', 'website-com', 'public', 'images', 'accommodations');
const contentPath = path.join(root, 'apps', 'website-com', 'src', 'pages', 'accommodations', 'content.js');
const storePath = path.join(root, 'apps', 'api', 'data', 'cms', 'store.json');

const PROPERTIES = [
  {
    name: 'Farm of Dreams Lodge',
    place: 'Karatu · Ngorongoro highlands',
    blurb:
      'A garden lodge on the Karatu coffee slopes — pool, cottages, and an easy night before crater or Manyara days.',
    files: [
      'mid range/Farm-of-Dream-Lodge-Karatu1-1280x1000.jpg',
      'mid range/Farm-of-Dream-Lodge-Swimming-Pool3.jpg',
    ],
  },
  {
    name: 'Gold Crest Hotel',
    place: 'Arusha',
    blurb: 'A practical Arusha hotel with a pool — used for arrival and last nights before or after the circuit.',
    files: ['mid range/gold crest.jpg', 'mid range/gold crest 3.jpg'],
  },
  {
    name: 'Venus Premier Hotel',
    place: 'Arusha',
    blurb: 'A comfortable city stay for the night before safari, with rooms close to the Arusha road network.',
    files: [
      'mid range/lg_venus-premier-hotel_17222013077.jpg',
      'mid range/lg_venus-premier-hotel_17222013078.jpg',
      'mid range/lg_venus-premier-hotel_17222013079.jpg',
    ],
  },
  {
    name: 'Marera Valley Lodge',
    place: 'Karatu · Ngorongoro highlands',
    blurb: 'Cottages and lawns in Karatu — a quiet highland base for Ngorongoro Crater mornings.',
    files: [
      'mid range/Marera-4132-705x470.jpg',
      'mid range/Marera-4170-705x470.jpg',
      'mid range/DJI_0143-705x396.png',
    ],
  },
  {
    name: 'Njiro Legacy Hotel',
    place: 'Arusha · Njiro',
    blurb: 'A Njiro hotel with Meru views — used when you want a calmer Arusha night than the town centre.',
    files: ['mid range/njiro-legacy-hotel-aerial.jpeg'],
  },
  {
    name: 'Serengeti Safari Haven',
    place: 'Serengeti',
    blurb: 'A tented Serengeti camp for game-drive days on the plains, with canvas rooms close to the wildlife circuits.',
    files: [
      'mid range/serengeti-safari-haven-8-1024x576.webp',
      'mid range/serengeti-safari-haven-20-550x825.webp',
      'mid range/serengeti-safari-haven-39-550x825.webp',
    ],
  },
  {
    name: 'Suricata Camp',
    place: 'Serengeti',
    blurb: 'A small Serengeti camp for migration and resident-game months, booked to your dates and season.',
    files: ['mid range/suricata.webp', 'mid range/suricata 3.webp'],
  },
  {
    name: 'Tarangire Tortilis Camp',
    place: 'Tarangire',
    blurb: 'A tented camp among baobabs on the Tarangire circuit — elephant country and big-sky evenings.',
    files: [
      'mid range/tarangire-tortilis-camp-baobab-tree.jpg',
      'mid range/tarangire-tortilis-camps-signage-1.jpg',
    ],
  },
  {
    name: 'Tukaone Camp',
    place: 'Karatu · Lake Manyara',
    blurb: 'Canvas decks looking over the bush — sunset drinks, then an early start toward Manyara or the crater.',
    files: [
      'mid range/tukaone-camp.jpg',
      '956A6489_1-2-1536x1024.jpg',
      '956A6605-1024x683.jpg',
      '956A6669-1024x683.jpg',
      '956A6674-1024x683.jpg',
    ],
  },
  {
    name: "Ang'ata Camps",
    slug: 'angata-camps',
    place: 'Northern Circuit',
    blurb: 'Tented camps placed for Tarangire, Serengeti, and Ngorongoro nights — canvas rooms and a mess tent in the bush.',
    files: ['mid range/angata-camps-locations-1.jpg', 'mid range/angata-camps-locations-1 (1).jpg'],
  },
  {
    name: 'Hembe Camp',
    place: 'Serengeti',
    blurb: 'A Serengeti tented camp for fire-pit evenings after the game drive — booked when the season and beds line up.',
    files: [
      'mid range/wrere-to-stay-in-serengeti5-Hembe-r03fa3932ibx41bm485fmr4zafv9s1uih1wvkej8ls.jpg',
    ],
  },
];

const ZANZIBAR = [
  {
    name: 'Nungwi Dreams by Mantis',
    place: 'Zanzibar · Nungwi',
    blurb: 'Beach days after the safari dust — swimming, spice-town visits, and rest.',
    imageExpr: 'GM.zanzibarBeach',
    fallbackImage: '/images/gallery/zanzibar-03.webp',
  },
  {
    name: 'Melia Zanzibar',
    place: 'Zanzibar east coast',
    blurb: 'A fuller resort finish when you want more time on the Indian Ocean.',
    imageExpr: 'GM.spice',
    fallbackImage: '/images/gallery/zanzibar-02.webp',
  },
];

function publicUrl(fileName) {
  return `/images/accommodations/${fileName}`;
}

async function convert(src, destName) {
  const dest = path.join(destDir, destName);
  await sharp(src)
    .rotate()
    .resize({ width: 1920, height: 1280, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(dest);
  console.log(`${path.relative(sourceRoot, src)} -> ${destName}`);
  return publicUrl(destName);
}

function jsString(value) {
  return JSON.stringify(value);
}

function renderContentJs(lodges, heroUrl) {
  const named = lodges
    .map(
      (lodge) => `  {
    name: ${jsString(lodge.name)},
    place: ${jsString(lodge.place)},
    blurb: ${jsString(lodge.blurb)},
    image: ${jsString(lodge.image)},
  }`
    )
    .join(',\n');
  const beach = ZANZIBAR.map(
    (lodge) => `  {
    name: ${jsString(lodge.name)},
    place: ${jsString(lodge.place)},
    blurb: ${jsString(lodge.blurb)},
    image: ${lodge.imageExpr},
  }`
  ).join(',\n');
  return `import { media as GM } from '../home/content.js';

export const accommodationsHero = {
  image: ${jsString(heroUrl)},
};

export const lodges = [
${named},
${beach},
];
`;
}

function findLodge(list, slug, title) {
  const needle = String(title || '').toLowerCase();
  return (
    list.find((item) => item.slug === slug) ||
    list.find((item) => String(item.draft?.title || item.published?.title || '').toLowerCase() === needle)
  );
}

function publishedLodge(draft, at, existing) {
  const slug = slugify(draft.slug || draft.title);
  const doc = {
    title: draft.title,
    place: draft.place || '',
    blurb: draft.blurb || '',
    image: draft.image || '',
    slug,
  };
  return {
    id: existing?.id || createId(),
    type: 'lodges',
    slug,
    status: SafariStatus.PUBLISHED,
    draft: doc,
    published: { ...doc },
    created_by: existing?.created_by || 'seed',
    updated_by: 'accommodation-photos',
    created_at: existing?.created_at || at,
    updated_at: at,
    published_at: at,
  };
}

fs.mkdirSync(destDir, { recursive: true });

const heroUrl = await convert(path.join(sourceRoot, 'DJI_0036-1536x864.jpg'), 'hero.webp');

const imported = [];
for (const property of PROPERTIES) {
  const slug = property.slug || slugify(property.name);
  let cover = '';
  for (const [index, relative] of property.files.entries()) {
    const src = path.join(sourceRoot, relative);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing photo: ${relative}`);
    }
    const destName = index === 0 ? `${slug}.webp` : `${slug}-${index + 1}.webp`;
    const url = await convert(src, destName);
    if (!cover) cover = url;
  }
  imported.push({
    name: property.name,
    place: property.place,
    blurb: property.blurb,
    image: cover,
    slug,
  });
}

fs.writeFileSync(contentPath, renderContentJs(imported, heroUrl));
console.log(`wrote ${path.relative(root, contentPath)}`);

const raw = fs.readFileSync(storePath, 'utf8');
const store = JSON.parse(raw);
const at = new Date().toISOString();
const keepSlugs = new Set([...imported.map((item) => item.slug), ...ZANZIBAR.map((item) => slugify(item.name))]);
const existingLodges = store.lodges || [];

const nextLodges = [];
for (const lodge of imported) {
  nextLodges.push(
    publishedLodge(
      {
        title: lodge.name,
        place: lodge.place,
        blurb: lodge.blurb,
        image: lodge.image,
        slug: lodge.slug,
      },
      at,
      findLodge(existingLodges, lodge.slug, lodge.name)
    )
  );
}

for (const lodge of existingLodges) {
  if (keepSlugs.has(lodge.slug) || keepSlugs.has(slugify(lodge.draft?.title || lodge.published?.title || ''))) {
    continue;
  }
  nextLodges.push({
    ...lodge,
    status: SafariStatus.DRAFT,
    published: null,
    published_at: null,
    updated_by: 'accommodation-photos',
    updated_at: at,
  });
}

for (const lodge of ZANZIBAR) {
  const slug = slugify(lodge.name);
  const existing = findLodge(existingLodges, slug, lodge.name);
  const image = existing?.draft?.image || existing?.published?.image || lodge.fallbackImage;
  nextLodges.push(
    publishedLodge(
      {
        title: lodge.name,
        place: lodge.place,
        blurb: lodge.blurb,
        image,
        slug,
      },
      at,
      existing
    )
  );
}

store.lodges = nextLodges;
const tmp = `${storePath}.${process.pid}.tmp`;
fs.writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`);
fs.renameSync(tmp, storePath);

console.log(
  JSON.stringify(
    {
      imported: imported.map((item) => item.name),
      published: nextLodges.filter((item) => item.status === SafariStatus.PUBLISHED).map((item) => item.slug),
      drafted: nextLodges.filter((item) => item.status === SafariStatus.DRAFT).map((item) => item.slug),
    },
    null,
    2
  )
);
