import dns from 'node:dns';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { createId, slugify } from '@gm-safaris/shared-utils';
import { SafariStatus, normalizeLodgeCategory } from '@gm-safaris/shared-types';

dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);
dns.setDefaultResultOrder('ipv4first');

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const destDir = path.join(root, 'apps', 'website-com', 'public', 'images', 'accommodations');
const contentPath = path.join(root, 'apps', 'website-com', 'src', 'pages', 'accommodations', 'content.js');
const storePath = path.join(root, 'apps', 'api', 'data', 'cms', 'store.json');
const reportPath = path.join(root, 'scripts', 'accommodation-scrape-report.json');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const LODGES = [
  {
    name: 'Njiro Legacy Hotel',
    place: 'Arusha · Njiro',
    region: 'Arusha',
    category: 'midrange',
    slug: 'njiro-legacy-hotel',
    urls: ['https://www.njirolegacy.com/', 'https://www.njirolegacy.com/gallery', 'https://njirolegacy.co.tz/', 'https://www.njirolegacy.co.tz/'],
    fallback:
      'A quieter Njiro stay with Meru views — used for arrival and last nights when you want space away from town traffic.',
    local: ['njiro-legacy-hotel.webp'],
  },
  {
    name: 'Gold Crest Hotel',
    place: 'Arusha',
    region: 'Arusha',
    category: 'midrange',
    urls: ['https://goldcresthotel.com/', 'https://www.goldcresthotel.com/'],
    fallback: 'A practical Arusha hotel with a pool — used before and after northern-circuit days.',
    local: ['gold-crest-hotel.webp', 'gold-crest-hotel-2.webp'],
  },
  {
    name: 'Venus Premier Hotel',
    place: 'Arusha',
    region: 'Arusha',
    category: 'midrange',
    urls: ['https://venuspremierhotel.com/', 'https://www.venuspremierhotel.com/'],
    fallback: 'A comfortable city hotel on the Arusha road network for the night before safari.',
    local: ['venus-premier-hotel.webp', 'venus-premier-hotel-2.webp', 'venus-premier-hotel-3.webp'],
  },
  {
    name: "Ang'ata Tarangire Camp",
    slug: 'angata-tarangire-camp',
    place: 'Tarangire',
    region: 'Tarangire',
    category: 'midrange',
    urls: [
      'https://www.angatacamps.com/angata-tarangire-camp/',
      'https://angatacamps.com/angata-tarangire-camp/',
      'https://www.angatacamps.com/',
    ],
    fallback: 'Canvas rooms among baobabs on the Tarangire circuit — elephant country and a mess tent after the drive.',
    local: ['angata-camps.webp', 'angata-camps-2.webp'],
  },
  {
    name: 'Tarangire Tortilis Camp',
    place: 'Tarangire',
    region: 'Tarangire',
    category: 'midrange',
    urls: ['https://tortiliscamps.com/tarangire-tortilis-camp', 'https://www.tortiliscamps.com/tarangire-tortilis-camp'],
    fallback: 'A tented camp among baobabs on the Tarangire circuit — elephant country and big-sky evenings.',
    local: ['tarangire-tortilis-camp.webp', 'tarangire-tortilis-camp-2.webp'],
  },
  {
    name: 'Tarangire Safari Lodge',
    place: 'Tarangire',
    region: 'Tarangire',
    category: 'midrange',
    urls: ['https://tarangiresafarilodge.com/', 'https://www.tarangiresafarilodge.com/'],
    fallback: 'A classic Tarangire rim lodge with tented rooms looking over the river — used for first-park nights.',
  },
  {
    name: 'Suricata Boma Lodge',
    place: 'Lake Manyara',
    region: 'Lake Manyara',
    category: 'midrange',
    urls: ['https://suricatabomalodge.com/', 'https://www.suricatabomalodge.com/'],
    fallback: 'A boma-style lodge near Lake Manyara — a practical night between Arusha and the crater highlands.',
  },
  {
    name: 'Sound of Silence Manyara',
    place: 'Lake Manyara',
    region: 'Lake Manyara',
    category: 'midrange',
    urls: ['https://serengetisoundofsilence.com/', 'https://soundofsilence.co.tz/', 'https://www.soundofsilence.co.tz/'],
    fallback: 'Tented Manyara nights with escarpment views — used when you want canvas close to the lake circuit.',
  },
  {
    name: 'Safari Haven Serengeti Camp',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'midrange',
    urls: ['https://safarihavencamp.com/', 'https://www.safarihavencamp.com/'],
    fallback: 'A tented Serengeti camp for game-drive days on the plains, with canvas rooms close to the wildlife circuits.',
    local: ['serengeti-safari-haven.webp', 'serengeti-safari-haven-2.webp', 'serengeti-safari-haven-3.webp'],
    aliases: ['serengeti-safari-haven'],
  },
  {
    name: "Ang'ata Serengeti Camp",
    slug: 'angata-serengeti-camp',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'midrange',
    urls: [
      'https://www.angatacamps.com/angata-serengeti-camp/',
      'https://angatacamps.com/angata-serengeti-camp/',
      'https://www.angatacamps.com/',
    ],
    fallback: 'A mobile-feel tented camp placed for Serengeti game-drive days — canvas rooms and a mess tent in the bush.',
    local: ['angata-camps.webp', 'angata-camps-2.webp'],
  },
  {
    name: 'Tukaone Serengeti Camp',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'midrange',
    urls: ['https://tukaonecamps.com/', 'https://www.tukaonecamps.com/', 'https://tukaonecamps.com/serengeti/'],
    fallback: 'Canvas decks on the Serengeti circuit — sunset drinks, then an early start onto the plains.',
    local: ['tukaone-camp.webp', 'tukaone-camp-2.webp', 'tukaone-camp-3.webp'],
    aliases: ['tukaone-camp'],
  },
  {
    name: 'Marera Valley Lodge',
    place: 'Karatu · Ngorongoro highlands',
    region: 'Ngorongoro / Karatu',
    category: 'midrange',
    urls: ['https://marreravalleylodge.com/', 'https://www.marreravalleylodge.com/'],
    fallback: 'Cottages and lawns in Karatu — a quiet highland base for Ngorongoro Crater mornings.',
    local: ['marera-valley-lodge.webp', 'marera-valley-lodge-2.webp', 'marera-valley-lodge-3.webp'],
  },
  {
    name: 'Farm of Dreams Lodge',
    place: 'Karatu · Ngorongoro highlands',
    region: 'Ngorongoro / Karatu',
    category: 'midrange',
    urls: ['https://farmofdreamslodge.com/', 'https://www.farmofdreamslodge.com/'],
    fallback: 'A garden lodge on the Karatu coffee slopes — pool, cottages, and an easy night before crater or Manyara days.',
    local: ['farm-of-dreams-lodge.webp', 'farm-of-dreams-lodge-2.webp'],
  },
  {
    name: "Ang'ata Ngorongoro Camp",
    slug: 'angata-ngorongoro-camp',
    place: 'Ngorongoro',
    region: 'Ngorongoro / Karatu',
    category: 'midrange',
    urls: [
      'https://www.angatacamps.com/angata-ngorongoro-camp/',
      'https://angatacamps.com/angata-ngorongoro-camp/',
      'https://www.angatacamps.com/',
    ],
    fallback: 'Tented highland nights near the crater rim — used when you want canvas before an early crater descent.',
    local: ['angata-camps.webp', 'angata-camps-2.webp'],
  },
  {
    name: 'Mama Dunia Safari Lodge',
    place: 'Karatu · Ngorongoro highlands',
    region: 'Ngorongoro / Karatu',
    category: 'midrange',
    urls: ['https://mamaduniasafarilodge.co.tz/', 'https://www.mamaduniasafarilodge.co.tz/', 'https://mamadunia.com/', 'https://www.mamadunia.com/'],
    fallback: 'A Karatu lodge for crater mornings — cottages, gardens, and a practical highland base.',
  },
  {
    name: 'Kibo Palace Hotel',
    place: 'Arusha',
    region: 'Arusha',
    category: 'luxury',
    urls: ['https://kibopalacehotel.com/', 'https://www.kibopalacehotel.com/'],
    fallback: 'A fuller Arusha hotel stay — rooms, dining, and a pool for arrival or last nights on a luxury circuit.',
  },
  {
    name: 'Mount Meru Hotel',
    place: 'Arusha',
    region: 'Arusha',
    category: 'luxury',
    urls: ['https://mountmeruhotel.co.tz/', 'https://www.mountmeruhotel.co.tz/'],
    fallback: 'A landmark Arusha hotel with gardens and a pool — used when you want a proper city night before safari.',
  },
  {
    name: "Manyara's Secret",
    place: 'Tarangire & Lake Manyara',
    region: 'Tarangire & Lake Manyara',
    category: 'luxury',
    urls: ['https://manyarassecret.com/', 'https://manyarassecret.com/the-lodge/', 'https://manyarassecret.com/villas/', 'https://manyarasecret.com/'],
    fallback:
      'A private escarpment lodge between Tarangire and Lake Manyara — used when you want a quieter luxury night off the main road.',
  },
  {
    name: "Oliver's Camp / Kuro Treetops",
    place: 'Tarangire',
    region: 'Tarangire',
    category: 'luxury',
    urls: [
      'https://www.asiliaafrica.com/camps/olivers-camp/',
      'https://www.asiliaafrica.com/camps/kuro-treetops/',
      'https://asiliaafrica.com/camps/olivers-camp/',
    ],
    fallback:
      'Asilia’s Tarangire camps — walking country, baobabs, and tented rooms placed for the park’s quieter southern circuits.',
  },
  {
    name: 'Mawe Mawe Manyara Lodge',
    place: 'Lake Manyara',
    region: 'Lake Manyara',
    category: 'luxury',
    urls: ['https://mawemawemanyaralodge.com/', 'https://mawemawemanyaralodge.com/accomodation/', 'https://mawemawemanyaralodge.co.tz/', 'https://mawemawe.com/'],
    fallback: 'A cliff-edge Manyara lodge with escarpment views — used for a luxury night above the lake.',
  },
  {
    name: 'Sametu Camp',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'luxury',
    urls: ['https://karibucamps.com/sametu-camp/', 'https://www.media-karibucamps.com/serengeti_sametu_camp/', 'https://sametucamp.com/', 'https://www.sametucamp.com/'],
    fallback: 'A luxury tented Serengeti camp for game-drive days — canvas rooms placed for resident game and migration months.',
  },
  {
    name: 'Serengeti Serena Safari Lodge',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'luxury',
    urls: ['https://www.serenahotels.com/serengeti', 'https://serenahotels.com/serengeti'],
    fallback: 'A hilltop Serena lodge in Central Serengeti — stone-and-thatch rooms for classic plains days.',
  },
  {
    name: 'Kubu Kubu Tented Lodge',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'luxury',
    urls: [
      'https://twctanzania.com/lodges/',
      'https://www.twctanzania.com/lodges/',
      'https://twctanzania.com/kubu-kubu-tented-lodge/',
    ],
    fallback: 'A Tanganyika Wilderness Camps tented lodge in the Serengeti — used for luxury canvas nights on the circuit.',
  },
  {
    name: 'Ole Serai Luxury Camps (Turner Springs)',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'luxury',
    urls: [
      'https://wellworthcollection.co.tz/ole-serai-luxury-camp-turner-springs/',
      'https://www.wellworthcollection.co.tz/ole-serai-luxury-camp-turner-springs/',
      'https://wellworthcollection.co.tz/',
    ],
    fallback: 'A Wellworth Collection camp at Turner Springs — luxury tents for Serengeti game-drive days.',
  },
  {
    name: 'Moyo Tented Camp',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'luxury',
    urls: ['https://moyotentedcamp.com/', 'https://www.moyotentedcamp.com/'],
    fallback: 'Luxury canvas in the Serengeti — used when you want a quieter tented camp after long plains days.',
  },
  {
    name: 'Nakupenda Luxury Camp',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'luxury',
    urls: ['https://nakupendacamps.com/', 'https://nakupendacamp.com/', 'https://www.nakupendacamp.com/'],
    fallback: 'A small luxury Serengeti camp — tented rooms and a mess tent placed for wildlife circuits.',
  },
  {
    name: "Lion's Paw Camp",
    place: 'Ngorongoro',
    region: 'Ngorongoro',
    category: 'luxury',
    urls: ['https://karibucamps.com/lions-paw-camp', 'https://www.karibucamps.com/lions-paw-camp'],
    fallback: 'A Karibu Camps tented stay on the crater rim — used for luxury nights before an early crater descent.',
  },
  {
    name: 'Ngorongoro Serena Safari Lodge',
    place: 'Ngorongoro',
    region: 'Ngorongoro',
    category: 'luxury',
    urls: ['https://www.serenahotels.com/ngorongoro', 'https://serenahotels.com/ngorongoro'],
    fallback: 'A Serena lodge built into the crater rim — rooms looking into Ngorongoro for crater-morning circuits.',
  },
  {
    name: 'Ngorongoro Oldeani Mountain Lodge',
    place: 'Ngorongoro',
    region: 'Ngorongoro',
    category: 'luxury',
    urls: [
      'https://wellworthcollection.co.tz/ngorongoro-oldeani-mountain-lodge/',
      'https://www.wellworthcollection.co.tz/ngorongoro-oldeani-mountain-lodge/',
      'https://wellworthcollection.co.tz/',
    ],
    fallback: 'A Wellworth Collection highland lodge near Oldeani — used for luxury crater nights with mountain views.',
  },
  {
    name: 'Gran Meliá Arusha',
    place: 'Arusha',
    region: 'Arusha',
    category: 'premium-luxury',
    urls: [
      'https://www.melia.com/en/hotels/tanzania/arusha/gran-melia-arusha',
      'https://melia.com/en/hotels/tanzania/arusha/gran-melia-arusha',
    ],
    fallback: 'Arusha’s flagship Meliá stay — used when the safari should start and finish at a premium city hotel.',
  },
  {
    name: 'Lake Manyara Kilimamoja Lodge',
    place: 'Tarangire & Lake Manyara',
    region: 'Tarangire & Lake Manyara',
    category: 'premium-luxury',
    urls: [
      'https://wellworthcollection.co.tz/lake-manyara-kilimamoja-lodge/',
      'https://www.wellworthcollection.co.tz/lake-manyara-kilimamoja-lodge/',
      'https://wellworthcollection.co.tz/',
    ],
    fallback: 'A Wellworth Collection lodge above the Rift — premium nights between Tarangire and Lake Manyara.',
  },
  {
    name: 'Meliá Serengeti Lodge',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'premium-luxury',
    urls: [
      'https://www.melia.com/en/hotels/tanzania/serengeti-national-park/melia-serengeti-lodge',
      'https://melia.com/en/hotels/tanzania/serengeti-national-park/melia-serengeti-lodge',
    ],
    fallback: 'A hilltop Meliá lodge in the Serengeti — premium rooms and views for plains days.',
  },
  {
    name: 'Serengeti Explorer',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'premium-luxury',
    urls: [
      'https://www.elewanacollection.com/serengeti-explorer-camp/the-camp',
      'https://www.elewanacollection.com/serengeti-explorer-camp',
      'https://elewanacollection.com/serengeti-explorer-camp',
    ],
    fallback: 'An Elewana Collection camp in the Serengeti — premium tents placed for migration and resident-game months.',
  },
  {
    name: 'Pioneer Camp',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'premium-luxury',
    urls: [
      'https://www.elewanacollection.com/serengeti-pioneer-camp',
      'https://elewanacollection.com/serengeti-pioneer-camp',
    ],
    fallback: 'Elewana’s Pioneer Camp in the Serengeti — a premium tented stay for game-drive days on the plains.',
  },
  {
    name: 'Four Seasons Safari Lodge Serengeti',
    place: 'Serengeti',
    region: 'Serengeti',
    category: 'premium-luxury',
    urls: ['https://www.fourseasons.com/serengeti/', 'https://fourseasons.com/serengeti/'],
    fallback: 'A flagship Serengeti lodge — used when the circuit should stay at the top of the range.',
  },
  {
    name: 'Ngorongoro Lodge Meliá Collection',
    place: 'Ngorongoro',
    region: 'Ngorongoro',
    category: 'premium-luxury',
    urls: [
      'https://www.melia.com/en/hotels/tanzania/ngorongoro-conservation-area/ngorongoro-lodge-melia-collection',
      'https://www.melia.com/en/hotels/tanzania/ngorongoro-conservation-area/ngorongoro-lodge-melia-collection/rooms',
      'https://www.melia.com/en/hotels/tanzania/ngorongoro/ngorongoro-lodge-melia-collection',
    ],
    fallback: 'A Meliá Collection lodge on the crater highlands — premium rooms for crater-morning circuits.',
  },
  {
    name: 'The Manor at Ngorongoro',
    place: 'Ngorongoro',
    region: 'Ngorongoro',
    category: 'premium-luxury',
    urls: [
      'https://www.elewanacollection.com/the-manor-at-ngorongoro/the-manor',
      'https://www.elewanacollection.com/the-manor-at-ngorongoro',
      'https://elewanacollection.com/the-manor-at-ngorongoro',
    ],
    fallback: 'Elewana’s manor-house lodge in the Karatu highlands — a premium night before or after the crater.',
  },
];

function absUrl(base, href) {
  try {
    return new URL(href, base).href;
  } catch {
    return '';
  }
}

function stripTags(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function decode(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function metaContent(html, names) {
  for (const name of names) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decode(match[1]);
    }
  }
  return '';
}

function isJunkImage(url) {
  const lower = url.toLowerCase();
  return /logo|icon|sprite|pixel|favicon|avatar|gravatar|spinner|placeholder|badge|payment|flag|facebook|twitter|linkedin|instagram|whatsapp|tracking|1x1|blank\.|spacer|svg(\?|$)|data:image/.test(
    lower
  );
}

function scoreImage(url, { og = false } = {}) {
  const lower = url.toLowerCase();
  let score = og ? 40 : 0;
  if (/wp-content\/uploads|\/media\/|\/gallery\/|\/images\//.test(lower)) score += 20;
  if (/room|suite|tent|camp|lodge|hotel|pool|view|wildlife|safari|crater|plains|villa/.test(lower)) score += 18;
  if (/\.jpe?g($|\?)|\.webp($|\?)|\.png($|\?)/.test(lower)) score += 8;
  if (/thumb|small|150x|200x|300x|widget/.test(lower)) score -= 25;
  if (isJunkImage(url)) score -= 80;
  return score;
}

function collectSrcset(value, base) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean)
    .map((href) => absUrl(base, href));
}

function extractImages(html, base) {
  const found = new Map();
  const add = (href, extra = 0) => {
    const url = absUrl(base, href).split('#')[0];
    if (!url || !/^https?:/i.test(url) || isJunkImage(url)) return;
    const prev = found.get(url) || 0;
    found.set(url, Math.max(prev, extra));
  };

  const og = metaContent(html, ['og:image', 'og:image:url', 'twitter:image', 'twitter:image:src']);
  if (og) add(og, 50);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = tag.match(/\ssrc=["']([^"']+)["']/i)?.[1];
    const data = tag.match(/\s(?:data-src|data-lazy-src|data-original)=["']([^"']+)["']/i)?.[1];
    const srcset = tag.match(/\ssrcset=["']([^"']+)["']/i)?.[1];
    if (src) add(src, scoreImage(src));
    if (data) add(data, scoreImage(data));
    for (const item of collectSrcset(srcset, base)) add(item, scoreImage(item) + 6);
  }

  for (const match of html.matchAll(/url\((['"]?)(https?:[^'")]+)\1\)/gi)) {
    add(match[2], scoreImage(match[2]));
  }

  return [...found.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([url]) => url);
}

function extractBlurb(html) {
  const meta = metaContent(html, ['og:description', 'description', 'twitter:description']);
  if (meta.length >= 70) return stripTags(meta);
  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((text) => text.length >= 70 && !/cookie|subscribe|newsletter|password/i.test(text));
  return paragraphs[0] || meta;
}

function cleanBlurb(scraped, fallback) {
  const text = String(scraped || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length >= 70 && text.length <= 420 && !/lorem ipsum|cookie|subscribe/i.test(text)) return text;
  return fallback;
}

async function fetchText(url) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 18000);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return { url: res.url, body: await res.text() };
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
  }
  try {
    const { stdout } = await execFileAsync(
      'curl.exe',
      ['-L', '-sS', '--max-time', '25', '-A', UA, '--doh-url', 'https://1.1.1.1/dns-query', url],
      { encoding: 'utf8', maxBuffer: 12_000_000 }
    );
    if (stdout && stdout.length > 200) return { url, body: stdout };
  } catch (err) {
    lastErr = err;
  }
  throw lastErr || new Error('fetch failed');
}

async function fetchBuffer(url, referer) {
  let lastErr;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: referer || url,
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const type = res.headers.get('content-type') || '';
    if (type && !type.startsWith('image/') && !type.includes('octet-stream')) throw new Error(type);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    lastErr = err;
  } finally {
    clearTimeout(timer);
  }
  const tmp = path.join(destDir, `.dl-${process.pid}-${Date.now()}`);
  try {
    await execFileAsync(
      'curl.exe',
      ['-L', '-sS', '--max-time', '30', '-A', UA, '-e', referer || url, '--doh-url', 'https://1.1.1.1/dns-query', '-o', tmp, url],
      { maxBuffer: 20_000_000 }
    );
    const buffer = fs.readFileSync(tmp);
    fs.unlinkSync(tmp);
    if (buffer.length > 8000) return buffer;
  } catch (err) {
    lastErr = err;
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
  throw lastErr || new Error('image fetch failed');
}

async function wpMedia(origin) {
  try {
    const { body } = await fetchText(`${origin.replace(/\/$/, '')}/wp-json/wp/v2/media?per_page=30`);
    const json = JSON.parse(body);
    if (!Array.isArray(json)) return [];
    return json
      .map((item) => item?.source_url || item?.guid?.rendered || item?.media_details?.sizes?.full?.source_url)
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function optimize(buffer, destFile) {
  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const meta = await image.metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  if (width && height && (width < 560 || height < 300)) {
    throw new Error(`too small ${width}x${height}`);
  }
  await image
    .resize({ width: 1920, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(destFile);
  return { width, height };
}

function localPath(name) {
  return path.join(destDir, name);
}

function copyLocalFallbacks(lodge, needed) {
  const urls = [];
  for (const file of lodge.local || []) {
    if (urls.length >= needed) break;
    const src = localPath(file);
    if (!fs.existsSync(src)) continue;
    urls.push(`/images/accommodations/${file}`);
  }
  return urls;
}

function jsQuote(value) {
  return JSON.stringify(String(value || ''));
}

function renderContent(lodges, hero) {
  const rows = lodges
    .map(
      (lodge) => `  {
    name: ${jsQuote(lodge.name)},
    place: ${jsQuote(lodge.place)},
    region: ${jsQuote(lodge.region)},
    category: ${jsQuote(lodge.category)},
    blurb: ${jsQuote(lodge.blurb)},
    website: ${jsQuote(lodge.website)},
    image: ${jsQuote(lodge.image)},
    gallery: ${JSON.stringify(lodge.gallery)},
  }`
    )
    .join(',\n');
  return `export const accommodationsHero = {
  image: ${jsQuote(hero)},
};

export const lodges = [
${rows}
];
`;
}

function findExisting(list, lodge, slug) {
  const aliases = new Set([slug, ...(lodge.aliases || [])].map((item) => String(item).toLowerCase()));
  const title = lodge.name.toLowerCase();
  return (
    list.find((item) => aliases.has(String(item.slug || '').toLowerCase())) ||
    list.find((item) => String(item.draft?.title || item.published?.title || '').toLowerCase() === title)
  );
}

async function writeStore(store) {
  const tmp = `${storePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      fs.renameSync(tmp, storePath);
      return;
    } catch (err) {
      const retry = err && ['EPERM', 'EEXIST', 'EACCES', 'EBUSY', 'UNKNOWN'].includes(err.code);
      if (!retry) {
        fs.unlinkSync(tmp);
        throw err;
      }
      try {
        fs.copyFileSync(tmp, storePath);
        fs.unlinkSync(tmp);
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
  }
  fs.copyFileSync(tmp, storePath);
  fs.unlinkSync(tmp);
}

async function scrapeLodge(lodge) {
  const slug = lodge.slug || slugify(lodge.name);
  const images = [];
  const seen = new Set();
  let blurb = '';
  let website = lodge.urls[0];
  const notes = [];

  for (const page of lodge.urls) {
    try {
      const { url, body } = await fetchText(page);
      website = url || website;
      if (!blurb) blurb = extractBlurb(body);
      for (const href of extractImages(body, url)) {
        if (!seen.has(href)) {
          seen.add(href);
          images.push(href);
        }
      }
      try {
        for (const href of await wpMedia(new URL(url).origin)) {
          if (!seen.has(href) && !isJunkImage(href)) {
            seen.add(href);
            images.unshift(href);
          }
        }
      } catch {
        /* ignore */
      }
      if (images.length >= 8 && blurb) break;
    } catch (err) {
      notes.push(`${page}: ${err.cause?.code || err.message || err}`);
    }
  }

  const saved = [];
  fs.mkdirSync(destDir, { recursive: true });
  for (const href of images) {
    if (saved.length >= 3) break;
    try {
      const destName = saved.length === 0 ? `${slug}.webp` : `${slug}-${saved.length + 1}.webp`;
      const destFile = localPath(destName);
      const buffer = await fetchBuffer(href, website);
      await optimize(buffer, destFile);
      saved.push(`/images/accommodations/${destName}`);
    } catch (err) {
      notes.push(`img ${href}: ${err.message || err}`);
    }
  }

  if (saved.length < 3) {
    for (const file of lodge.local || []) {
      if (saved.length >= 3) break;
      const src = localPath(file);
      if (!fs.existsSync(src)) continue;
      const destName = saved.length === 0 ? `${slug}.webp` : `${slug}-${saved.length + 1}.webp`;
      const destFile = localPath(destName);
      if (path.resolve(src) !== path.resolve(destFile)) fs.copyFileSync(src, destFile);
      const url = `/images/accommodations/${destName}`;
      if (!saved.includes(url)) saved.push(url);
    }
  }

  return {
    slug,
    name: lodge.name,
    place: lodge.place,
    region: lodge.region,
    category: normalizeLodgeCategory(lodge.category),
    website,
    blurb: cleanBlurb(blurb, lodge.fallback),
    image: saved[0] || '/images/accommodations/hero.webp',
    gallery: saved.slice(1, 3),
    photoCount: saved.length,
    scrapedImages: images.slice(0, 8),
    notes,
  };
}

const only = process.argv.slice(2).map((item) => item.toLowerCase());
const queue = only.length
  ? LODGES.filter((lodge) => {
      const hay = `${lodge.name} ${lodge.slug || slugify(lodge.name)}`.toLowerCase().replace(/['’]/g, '');
      return only.some((query) => hay.includes(query.replace(/['’]/g, '')) || slugify(lodge.name).includes(query));
    })
  : LODGES;

const imported = [];
const report = [];
for (const lodge of queue) {
  process.stdout.write(`scraping ${lodge.name}...\n`);
  const row = await scrapeLodge(lodge);
  imported.push(row);
  report.push({
    name: row.name,
    photos: row.photoCount,
    website: row.website,
    notes: row.notes.slice(0, 6),
  });
}

const hero = fs.existsSync(localPath('hero.webp'))
  ? '/images/accommodations/hero.webp'
  : imported[0]?.image || '/images/gallery/serengeti-01.webp';

let catalog = imported;
if (only.length) {
  const existingMod = await import(`${pathToFileURL(contentPath).href}?t=${Date.now()}`);
  const merged = (existingMod.lodges || []).map((item) => ({ ...item }));
  for (const row of imported) {
    const index = merged.findIndex((item) => item.name === row.name);
    const nextRow = {
      name: row.name,
      place: row.place,
      region: row.region,
      category: row.category,
      blurb: row.blurb,
      website: row.website,
      image: row.image,
      gallery: row.gallery,
    };
    if (index >= 0) merged[index] = nextRow;
    else merged.push(nextRow);
  }
  catalog = merged;
}

fs.writeFileSync(contentPath, renderContent(catalog, hero));
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const at = new Date().toISOString();
if (!store.settings) store.settings = {};
if (!store.settings.site) store.settings.site = {};
store.settings.site.tagline = 'Your Path to Golden Memories begins here';

const keep = new Set((only.length ? catalog : imported).map((item) => item.slug || slugify(item.name)));
const existing = store.lodges || [];
const publishedSource = only.length ? catalog : imported;
const next = publishedSource.map((lodge) => {
  const spec = LODGES.find((item) => item.name === lodge.name) || lodge;
  const slug = lodge.slug || spec.slug || slugify(lodge.name);
  const prev = findExisting(existing, spec, slug);
  const draft = {
    title: lodge.name,
    slug,
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
    slug,
    status: SafariStatus.PUBLISHED,
    draft,
    published: { ...draft },
    created_by: prev?.created_by || 'seed',
    updated_by: 'accommodation-scrape',
    created_at: prev?.created_at || at,
    updated_at: at,
    published_at: at,
  };
});

if (!only.length) {
  for (const lodge of existing) {
    const slug = String(lodge.slug || '').toLowerCase();
    const title = String(lodge.draft?.title || lodge.published?.title || '').toLowerCase();
    if (keep.has(slug) || catalog.some((item) => item.name.toLowerCase() === title)) continue;
    next.push({
      ...lodge,
      status: SafariStatus.DRAFT,
      published: null,
      published_at: null,
      updated_by: 'accommodation-scrape',
      updated_at: at,
    });
  }
}

store.lodges = next;
await writeStore(store);

console.log(
  JSON.stringify(
    {
      lodges: imported.length,
      with3: imported.filter((item) => item.photoCount >= 3).length,
      with2: imported.filter((item) => item.photoCount === 2).length,
      with1: imported.filter((item) => item.photoCount === 1).length,
      none: imported.filter((item) => item.photoCount === 0).length,
      report: path.relative(root, reportPath),
    },
    null,
    2
  )
);
