import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { emptySafariDocument } from '../packages/safari-ui/src/index.js';
import { SafariStatus } from '../packages/shared-types/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const storePath = path.join(root, 'apps/api/data/cms/store.json');

const { gmsTrips } = await import(
  pathToFileURL(path.join(root, 'apps/website-com/src/pages/tours/gms-trips.js')).href
);
const { photoForText } = await import(
  pathToFileURL(path.join(root, 'apps/website-com/src/media/gallery.js')).href
);

function durationDays(label) {
  const match = String(label || '').match(/(\d+)\s*days?/i);
  return match ? Number(match[1]) : null;
}

function isRemotePhoto(url) {
  return /gmsafaris\.com|gmsafaris\.co\.tz|unsplash\.com|images\.unsplash/i.test(String(url || ''));
}

function remapValue(value, hint, index) {
  if (typeof value === 'string' && isRemotePhoto(value)) {
    return photoForText(hint, index);
  }
  if (Array.isArray(value)) {
    return value.map((item, offset) => remapValue(item, hint, index + offset));
  }
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, nested] of Object.entries(value)) {
      const nestedHint = `${hint} ${nested?.alt || nested?.title || nested?.day || key}`;
      next[key] = remapValue(nested, nestedHint, index);
    }
    return next;
  }
  return value;
}

function toDraft(trip, index) {
  const description = `${trip.title} — private Tanzania itinerary${trip.places ? ` visiting ${trip.places}` : ''}.`;
  return emptySafariDocument({
    title: trip.title,
    slug: trip.slug,
    short_description: description,
    description,
    featured: Boolean(trip.featured),
    display_order: index + 30,
    duration: durationDays(trip.duration),
    duration_label: trip.duration || '',
    price_from: trip.price_from || null,
    currency: trip.currency || 'USD',
    destination: trip.places || '',
    difficulty: trip.activity || '',
    minimum_people: trip.minimum_people || 1,
    hero_image: { id: null, url: trip.image, alt: trip.title, caption: '' },
    highlights: trip.places ? trip.places.split(' · ').filter(Boolean) : [],
    inclusions: [
      'Park fees and conservation levies as per the itinerary',
      'Private 4x4 safari vehicle with pop-up roof and driver-guide',
      'Lodge or camp nights as confirmed',
      'Bottled water on game drives',
    ],
    exclusions: [
      'International flights and visa fees',
      'Tips for guides, cooks, and camp staff',
      'Travel insurance and personal expenses',
    ],
    accommodation: 'Lodge or camp as confirmed with your consultant.',
    transport_information: 'Private 4x4 safari vehicle with pop-up roof.',
    seo: {
      title: `${trip.title} | Golden Memories Safaris`,
      description: description.slice(0, 320),
      canonical: `https://www.gmsafaris.com/tours/${trip.slug}/`,
      og_title: trip.title,
      og_description: description.slice(0, 320),
      og_image: trip.image,
      robots: 'index,follow',
    },
  });
}

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
store.safaris = (store.safaris || []).map((record, index) =>
  remapValue(record, `${record.slug || ''} ${record.draft?.title || ''}`, index)
);

const existing = new Set((store.safaris || []).map((item) => item.slug));
const now = new Date().toISOString();
let added = 0;

for (const [index, trip] of gmsTrips.entries()) {
  if (existing.has(trip.slug)) continue;
  const draft = toDraft(trip, index);
  store.safaris.push({
    id: crypto.randomUUID(),
    slug: trip.slug,
    status: SafariStatus.PUBLISHED,
    draft,
    published: { ...draft },
    published_at: now,
    created_at: now,
    updated_at: now,
    created_by: 'seed',
    updated_by: 'seed',
  });
  existing.add(trip.slug);
  added += 1;
}

fs.writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`);
console.log(`CMS synced: ${store.safaris.length} safaris (${added} added), images remapped to local gallery.`);
