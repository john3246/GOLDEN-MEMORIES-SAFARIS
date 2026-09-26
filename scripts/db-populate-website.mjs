/**
 * Load current website catalogs into PostgreSQL.
 * Usage: node scripts/db-populate-website.mjs
 */
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { destinationPlaces } from '../apps/website-com/src/pages/destinations/catalog.js';
import { allTours } from '../apps/website-com/src/pages/tours/catalog.js';
import { safariFaqs } from '../apps/website-com/src/pages/tours/content.js';
import { mostBookedSlugs } from '../apps/website-com/src/pages/tours/gms-trips.js';
import { kilimanjaroTreks } from '../apps/website-com/src/pages/kilimanjaro/packages.js';
import { kiliFaqs } from '../apps/website-com/src/pages/kilimanjaro/content.js';
import { joiningSafaris, openJoiningPackages, joinFaqs } from '../apps/website-com/src/pages/join-safari/content.js';
import { lodges } from '../apps/website-com/src/pages/accommodations/content.js';
import { blogArticles, blogTopics } from '../apps/website-com/src/pages/blog/content.js';
import { reviewList } from '../apps/website-com/src/pages/reviews/content.js';
import { aboutTeam, aboutCredentials } from '../apps/website-com/src/pages/about/content.js';

const _root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function dollar(value) {
  const text = String(value);
  const tag = text.includes('$gms$') ? 'gmsx' : 'gms';
  return `$${tag}$${text}$${tag}$`;
}

function lit(value) {
  if (value == null) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return `ARRAY[${value.map((item) => dollar(item)).join(', ')}]::text[]`;
  }
  if (typeof value === 'object') return `${dollar(JSON.stringify(value))}::jsonb`;
  return dollar(value);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function durationDays(tour) {
  if (Number.isFinite(Number(tour.duration)) && Number(tour.duration) > 0) {
    return Number(tour.duration);
  }
  const match = String(tour.duration || tour.duration_label || '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function productType(tour) {
  const blob = `${tour.slug || ''} ${tour.title || ''} ${tour.activity || ''} ${tour.style || ''} ${tour.route || ''}`;
  if (tour.start || tour.datesLabel || /join|group safari/i.test(blob)) return 'join_safari';
  if (/kilimanjaro/i.test(blob)) return 'kilimanjaro';
  if (/\bmeru\b/i.test(blob)) return 'meru';
  if (/zanzibar|beach/i.test(blob) || tour.style === 'zanzibar') return 'beach';
  if (tour.style === 'cultural' || /cultural/i.test(blob)) return 'cultural';
  const days = durationDays(tour);
  if (days === 1 || /day trip/i.test(blob)) return 'day_trip';
  return 'private_safari';
}

function factsJson(facts) {
  if (!Array.isArray(facts)) return [];
  return facts.map((item) => {
    if (Array.isArray(item)) return { label: item[0] || '', value: item[1] || '' };
    return item;
  });
}

function mediaInsert(url, alt = '') {
  if (!url) return '';
  return `
INSERT INTO media (external_url, alt, visibility, mime_type)
SELECT ${lit(url)}, ${lit(alt)}, 'public', 'image/webp'
WHERE NOT EXISTS (SELECT 1 FROM media WHERE external_url = ${lit(url)});
`;
}

function mediaId(url) {
  if (!url) return 'NULL';
  return `(SELECT id FROM media WHERE external_url = ${lit(url)} LIMIT 1)`;
}

function mergeTours() {
  const seen = new Set();
  const list = [];
  for (const tour of [...allTours(), ...kilimanjaroTreks, ...joiningSafaris, ...openJoiningPackages]) {
    const slug = tour.slug || slugify(tour.title);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    list.push({ ...tour, slug });
  }
  return list;
}

const sql = [];
sql.push('BEGIN;');

for (const topic of blogTopics) {
  sql.push(mediaInsert(topic.image, topic.name));
  sql.push(`
UPDATE blog_topics
SET name = ${lit(topic.name)},
    blurb = ${lit(topic.blurb || '')},
    image_id = ${mediaId(topic.image)}
WHERE slug = ${lit(topic.slug)};
`);
}

for (const place of destinationPlaces) {
  sql.push(mediaInsert(place.image, place.name));
  sql.push(`
INSERT INTO destinations (
  region_id, slug, name, kicker, tagline, cta, location_label, blurb, image_id,
  paragraphs, highlights, seasons, wildlife, activities, attractions, facts, faqs,
  match_terms, status, published_at
) VALUES (
  (SELECT id FROM regions WHERE slug = ${lit(place.regionSlug)}),
  ${lit(place.slug)},
  ${lit(place.name)},
  ${lit(place.kicker || '')},
  ${lit(place.tagline || '')},
  ${lit(place.cta || '')},
  ${lit(place.location || '')},
  ${lit(place.tagline || place.blurb || '')},
  ${mediaId(place.image)},
  ${lit(place.paragraphs || [])},
  ${lit(place.highlights || [])},
  ${lit(place.seasons || [])},
  ${lit(place.wildlife || [])},
  ${lit(place.activities || [])},
  ${lit(place.attractions || [])},
  ${lit(factsJson(place.facts))},
  ${lit(place.faqs || [])},
  ${lit(place.match || [])},
  'PUBLISHED',
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  kicker = EXCLUDED.kicker,
  tagline = EXCLUDED.tagline,
  paragraphs = EXCLUDED.paragraphs,
  highlights = EXCLUDED.highlights,
  seasons = EXCLUDED.seasons,
  wildlife = EXCLUDED.wildlife,
  activities = EXCLUDED.activities,
  facts = EXCLUDED.facts,
  faqs = EXCLUDED.faqs,
  match_terms = EXCLUDED.match_terms,
  status = 'PUBLISHED',
  updated_at = now();
`);
}

for (const lodge of lodges) {
  const slug = slugify(lodge.name);
  sql.push(mediaInsert(lodge.image, lodge.name));
  sql.push(`
INSERT INTO accommodations (slug, name, kind, place_label, blurb, image_id, status, published_at)
VALUES (
  ${lit(slug)},
  ${lit(lodge.name)},
  CASE
    WHEN ${lit(lodge.name)} ILIKE '%camp%' THEN 'tented_camp'::accommodation_kind
    WHEN ${lit(lodge.name)} ILIKE '%hut%' THEN 'hut'::accommodation_kind
    ELSE 'lodge'::accommodation_kind
  END,
  ${lit(lodge.place || '')},
  ${lit(lodge.blurb || '')},
  ${mediaId(lodge.image)},
  'PUBLISHED',
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  blurb = EXCLUDED.blurb,
  place_label = EXCLUDED.place_label,
  image_id = EXCLUDED.image_id,
  status = 'PUBLISHED';
`);
}

const booked = new Set(mostBookedSlugs);
const tours = mergeTours();

for (const tour of tours) {
  const type = productType(tour);
  const days = durationDays(tour);
  const price = Number(tour.price_from ?? tour.price);
  sql.push(mediaInsert(tour.image, tour.title));
  sql.push(`
INSERT INTO tours (
  slug, product_type, status, title, short_description, description, activity_label,
  places_label, featured, most_booked, duration_days, duration_label, price, price_from,
  currency, difficulty, minimum_people, climb_route_id, hero_image_id, cta, draft, extras,
  published_at
) VALUES (
  ${lit(tour.slug)},
  ${lit(type)}::product_type,
  'PUBLISHED',
  ${lit(tour.title)},
  ${lit(tour.overview || tour.excerpt || '')},
  ${lit(tour.overview || '')},
  ${lit(tour.activity || '')},
  ${lit(tour.places || '')},
  ${lit(Boolean(tour.featured))},
  ${lit(booked.has(tour.slug))},
  ${lit(days)},
  ${lit(tour.duration || tour.duration_label || '')},
  ${Number.isFinite(price) && price > 0 ? price : 'NULL'},
  ${Number.isFinite(price) && price > 0 ? price : 'NULL'},
  ${lit((tour.currency || 'USD').slice(0, 3))},
  ${lit(tour.difficulty || tour.activity || '')},
  ${lit(tour.minimum_people || 1)},
  (SELECT id FROM climb_routes WHERE lower(name) = lower(${lit(tour.route || '')}) LIMIT 1),
  ${mediaId(tour.image)},
  ${lit(tour.cta || '')},
  ${lit(tour)},
  ${lit({ sourceSlug: tour.sourceSlug || tour.slug, style: tour.style || null, tags: tour.tags || [] })},
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  product_type = EXCLUDED.product_type,
  price_from = EXCLUDED.price_from,
  duration_label = EXCLUDED.duration_label,
  featured = EXCLUDED.featured,
  most_booked = EXCLUDED.most_booked,
  status = 'PUBLISHED',
  updated_at = now();
`);

  if (tour.style) {
    sql.push(`
INSERT INTO tour_category_links (tour_id, category_id)
SELECT t.id, c.id FROM tours t, tour_categories c
WHERE t.slug = ${lit(tour.slug)} AND c.slug = ${lit(tour.style)}
ON CONFLICT DO NOTHING;
`);
  }

  sql.push(`
INSERT INTO tour_destinations (tour_id, destination_id, sort_order)
SELECT t.id, d.id, 0
FROM tours t
JOIN destinations d ON (
  ${lit(`${tour.slug} ${tour.title} ${tour.places || ''}`.toLowerCase())} ILIKE '%' || d.slug || '%'
  OR EXISTS (
    SELECT 1 FROM unnest(d.match_terms) AS term
    WHERE ${lit(`${tour.slug} ${tour.title} ${tour.places || ''}`.toLowerCase())} ILIKE '%' || term || '%'
  )
)
WHERE t.slug = ${lit(tour.slug)}
ON CONFLICT DO NOTHING;
`);

  const included = tour.included || tour.inclusions || [];
  const excluded = tour.excluded || tour.exclusions || [];
  sql.push(`DELETE FROM tour_inclusions WHERE tour_id = (SELECT id FROM tours WHERE slug = ${lit(tour.slug)});`);
  included.forEach((body, index) => {
    sql.push(`
INSERT INTO tour_inclusions (tour_id, body, included, sort_order)
SELECT id, ${lit(body)}, TRUE, ${index} FROM tours WHERE slug = ${lit(tour.slug)};
`);
  });
  excluded.forEach((body, index) => {
    sql.push(`
INSERT INTO tour_inclusions (tour_id, body, included, sort_order)
SELECT id, ${lit(body)}, FALSE, ${index} FROM tours WHERE slug = ${lit(tour.slug)};
`);
  });

  const itinerary = tour.itinerary || tour.days || [];
  sql.push(`DELETE FROM tour_itinerary_days WHERE tour_id = (SELECT id FROM tours WHERE slug = ${lit(tour.slug)});`);
  itinerary.forEach((day, index) => {
    sql.push(mediaInsert(day.image, day.title || tour.title));
    sql.push(`
INSERT INTO tour_itinerary_days (
  tour_id, day_label, day_number, title, description, accommodation_text,
  meals, transport, distance, viewing, walk, iso_date, date_label, image_id, sort_order
)
SELECT
  id,
  ${lit(day.day || `Day ${index + 1}`)},
  ${lit(index + 1)},
  ${lit(day.title || '')},
  ${lit(day.body || day.description || '')},
  ${lit(day.stay || day.accommodation || '')},
  ${lit(day.meals || '')},
  ${lit(day.transport || '')},
  ${lit(day.distance || '')},
  ${lit(day.viewing || '')},
  ${lit(day.walk || '')},
  ${day.iso ? lit(day.iso) + '::date' : 'NULL'},
  ${lit(day.dateLabel || '')},
  ${mediaId(day.image)},
  ${index}
FROM tours WHERE slug = ${lit(tour.slug)};
`);
  });

  if (type === 'join_safari') {
    sql.push(`
INSERT INTO tour_departures (
  tour_id, title, dates_label, start_date, end_date, spaces_label, deposit_label, status
)
SELECT id, ${lit(tour.title)}, ${lit(tour.datesLabel || '')},
  ${tour.start ? `${lit(tour.start)}::date` : 'NULL'},
  ${tour.end ? `${lit(tour.end)}::date` : 'NULL'},
  ${lit(tour.spaces || '')},
  ${lit(tour.deposit || '')},
  'PUBLISHED'
FROM tours WHERE slug = ${lit(tour.slug)}
AND NOT EXISTS (
  SELECT 1 FROM tour_departures d WHERE d.tour_id = tours.id AND d.dates_label = ${lit(tour.datesLabel || '')}
);
`);
  }
}

for (const post of blogArticles) {
  sql.push(mediaInsert(post.image, post.title));
  sql.push(`
INSERT INTO blog_posts (topic_id, slug, title, excerpt, body, paragraphs, image_id, published_on, status, published_at)
VALUES (
  (SELECT id FROM blog_topics WHERE slug = ${lit(post.topic || 'safari')}),
  ${lit(post.slug)},
  ${lit(post.title)},
  ${lit(post.excerpt || '')},
  ${lit((post.paragraphs || []).join('\n\n'))},
  ${lit(post.paragraphs || [])},
  ${mediaId(post.image)},
  ${post.date ? `'${new Date(post.date).toISOString().slice(0, 10)}'::date` : 'NULL'},
  'PUBLISHED',
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  paragraphs = EXCLUDED.paragraphs,
  status = 'PUBLISHED';
`);
}

const faqRows = [
  ...(safariFaqs || []).map((item) => ({ ...item, group: 'safaris' })),
  ...(kiliFaqs || []).map((item) => ({ ...item, group: 'kilimanjaro' })),
  ...(joinFaqs || []).map((item) => ({ ...item, group: 'join-safari' })),
];
sql.push(`DELETE FROM faqs WHERE destination_id IS NULL AND tour_id IS NULL;`);
faqRows.forEach((item, index) => {
  sql.push(`
INSERT INTO faqs (group_id, question, answer, status, sort_order)
VALUES (
  (SELECT id FROM faq_groups WHERE slug = ${lit(item.group)}),
  ${lit(item.q)},
  ${lit(item.a || '')},
  'PUBLISHED',
  ${index}
);
`);
});

reviewList.forEach((item, index) => {
  sql.push(`
INSERT INTO testimonials (guest_name, trip_detail, quote, rating, status, display_order, published_at)
SELECT ${lit(item.name)}, ${lit(item.detail || '')}, ${lit(item.quote)}, 5, 'PUBLISHED', ${index}, now()
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE guest_name = ${lit(item.name)} AND quote = ${lit(item.quote)}
);
`);
});

aboutTeam.forEach((member, index) => {
  sql.push(mediaInsert(member.image, member.imageAlt || member.name));
  sql.push(`
INSERT INTO team_members (name, role_title, body, tags, image_id, image_alt, display_order, status)
SELECT ${lit(member.name)}, ${lit(member.role || '')}, ${lit(member.body || '')},
  ${lit(member.tags || [])}, ${mediaId(member.image)}, ${lit(member.imageAlt || '')}, ${index}, 'PUBLISHED'
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = ${lit(member.name)});
`);
});

aboutCredentials.forEach((item, index) => {
  sql.push(`
INSERT INTO credentials (title, body, display_order, status)
SELECT ${lit(item.title)}, ${lit(item.body || '')}, ${index}, 'PUBLISHED'
WHERE NOT EXISTS (SELECT 1 FROM credentials WHERE title = ${lit(item.title)});
`);
});

const pages = [
  ['home', 'Home', 'Golden Memories Safaris', 'Karibu Tanzania.'],
  ['about', 'About Us', 'Our story', 'Local Tanzanian safari experts since 2023.'],
  ['contact', 'Contact', 'Plan your trip', 'Call, email, or send a message from Arusha.'],
  ['accommodations', 'Accommodations', 'Where you stay', 'Lodges and camps we book across Tanzania.'],
  ['reviews', 'Reviews', 'Guest stories', 'Rated 5/5 by served clients.'],
  ['kilimanjaro', 'Kilimanjaro', 'Mountain climbing', 'Guided routes from Arusha and Moshi.'],
  ['join-safari', 'Join Safari', 'Open departures', 'Small-group dates you can join.'],
  ['destinations', 'Destinations', 'Tanzania parks', 'Northern Circuit, coast, south, and west.'],
  ['blog', 'Blog', 'Travel notes', 'Practical Tanzania travel articles.'],
];
for (const [slug, title, kicker, excerpt] of pages) {
  sql.push(`
INSERT INTO pages (slug, title, kicker, excerpt, status, published_at)
VALUES (${lit(slug)}, ${lit(title)}, ${lit(kicker)}, ${lit(excerpt)}, 'PUBLISHED', now())
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'PUBLISHED';
`);
}

sql.push('COMMIT;');

const sqlPath = path.join(tmpdir(), 'gm-safaris-website-catalog.sql');
const body = sql.join('\n');
await writeFile(sqlPath, body, 'utf8');
console.log(`Wrote ${sqlPath} (${Math.round(body.length / 1024)} KB)`);

const db = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || '5432',
  name: process.env.DATABASE_NAME || 'gm_safaris',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DATABASE_PASSWORD,
};

if (!db.password) {
  throw new Error('Set PGPASSWORD or DATABASE_PASSWORD');
}

await new Promise((resolve, reject) => {
  const child = spawn(
    'psql',
    ['-v', 'ON_ERROR_STOP=1', '-h', db.host, '-p', String(db.port), '-U', db.user, '-d', db.name, '-f', sqlPath],
    {
      env: {
        ...process.env,
        PGPASSWORD: db.password,
        Path: `C:\\Program Files\\PostgreSQL\\18\\bin;${process.env.Path || process.env.PATH}`,
      },
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  );
  child.on('error', reject);
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`psql exited ${code}`))));
});

console.log('Website catalog loaded into', db.name);
