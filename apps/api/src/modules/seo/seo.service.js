/**
 * Server-side SEO for the public website.
 *
 * The website renders in the browser, so crawlers and link previews (Google,
 * Bing, Facebook, WhatsApp, LinkedIn, X) used to see the same generic title
 * on every page. When the API serves the built site it now injects, per URL:
 *   <title>, meta description + keywords, canonical, robots,
 *   Open Graph + Twitter cards, JSON-LD structured data
 *   (TravelAgency, TouristTrip + Offer, BlogPosting, TouristDestination,
 *   BreadcrumbList, FAQPage), and a crawlable text summary inside #app.
 * It also builds /sitemap.xml and /robots.txt from published CMS content.
 */
import { SafariStatus } from '@gm-safaris/shared-types';
import { SEO_ROUTES, SITE_NAME, DEFAULT_KEYWORDS, seoRouteKey, clampText, keywordsText, brandTitle } from '@gm-safaris/safari-ui';
import { readStore } from '../../cms-store/index.js';
import { config } from '../../config/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';

let catalogCache = null;

async function websiteCatalog() {
  if (catalogCache) return catalogCache;
  const safe = async (loader) => {
    try {
      return await loader();
    } catch {
      return null;
    }
  };
  const [tours, destinations, join] = await Promise.all([
    safe(() => import('../../../../website-com/src/pages/tours/catalog.js')),
    safe(() => import('../../../../website-com/src/pages/destinations/catalog.js')),
    safe(() => import('../../../../website-com/src/pages/join-safari/catalog.js')),
  ]);
  catalogCache = {
    tours: tours?.allTours?.() || [],
    destinations: destinations?.destinationPlaces || [],
    joinSlugs: join?.allJoinSlugs?.() || [],
    joinPackages: join?.allJoinPackages?.() || [],
  };
  return catalogCache;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLdSafe(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function siteOrigin(settings) {
  return String(settings?.site?.websiteUrl || config.sites.com || 'https://www.gmsafaris.com').replace(/\/+$/, '');
}

function absolute(origin, url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

function publishedDoc(item) {
  if (!item || item.status !== SafariStatus.PUBLISHED || !item.published) return null;
  return { id: item.id, slug: item.published.slug || item.slug, ...item.published };
}

function bySlug(list, slug) {
  return (list || []).map(publishedDoc).find((doc) => doc && doc.slug === slug) || null;
}

const withBrand = brandTitle;

function imageUrl(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.url || '';
}

function organization(settings, origin) {
  const site = settings.site || DEFAULT_SETTINGS.site;
  return {
    '@type': ['TravelAgency', 'LocalBusiness'],
    '@id': `${origin}/#organization`,
    name: site.name || SITE_NAME,
    url: `${origin}/`,
    logo: `${origin}/images/logo.webp`,
    image: `${origin}/images/gallery/serengeti-01.webp`,
    telephone: site.phone || undefined,
    email: site.email || undefined,
    priceRange: '$$-$$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Njiro',
      addressLocality: 'Arusha',
      addressCountry: 'TZ',
    },
    areaServed: { '@type': 'Country', name: 'Tanzania' },
    sameAs: (site.socials || [])
      .map((row) => row.href)
      .filter((href) => href && !/^https?:\/\/(www\.)?(facebook|x|tiktok|instagram)\.com\/?$/i.test(href)),
  };
}

function breadcrumb(origin, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(origin, item.path),
    })),
  };
}

function faqPage(faqs) {
  const rows = (faqs || []).filter((row) => row.q && row.a).slice(0, 12);
  if (!rows.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: rows.map((row) => ({
      '@type': 'Question',
      name: row.q,
      acceptedAnswer: { '@type': 'Answer', text: row.a },
    })),
  };
}

function textList(items) {
  const list = Array.isArray(items)
    ? items
    : String(items || '')
        .split('\n')
        .map((line) => line.trim());
  return list
    .map((item) => (typeof item === 'string' ? item.split(/\s[—|-]\s/)[0] : item?.title || item?.body || ''))
    .map((item) => String(item).trim())
    .filter(Boolean);
}

/**
 * Resolve SEO for one URL path.
 * @returns {Promise<null | { status: number, title: string, description: string, keywords: string, canonical: string,
 *   image: string, type: string, robots: string, jsonLd: object[], heading: string, summary: string, links: {href:string,label:string}[] }>}
 */
export async function metaForPath(pathname) {
  const store = await readStore();
  const settings = store.settings || DEFAULT_SETTINGS;
  const origin = siteOrigin(settings);
  const clean = `/${String(pathname || '/').replace(/^\/+|\/+$/g, '')}`;
  const canonicalPath = clean === '/' ? '/' : `${clean}/`;
  const defaults = settings.seo || DEFAULT_SETTINGS.seo;
  const org = organization(settings, origin);
  const indexable = settings.websiteLive !== false && settings.security?.indexPublicPages !== false;
  const robots = indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
  const faqsByGroup = (group) =>
    (store.faqs || [])
      .map(publishedDoc)
      .filter((doc) => doc && (doc.group || 'safaris') === group)
      .map((doc) => ({ q: doc.title, a: doc.answer }));

  const base = {
    status: 200,
    canonical: `${origin}${canonicalPath}`,
    type: 'website',
    robots,
    links: [
      { href: '/tours/', label: 'Tanzania safari packages' },
      { href: '/kilimanjaro/', label: 'Kilimanjaro climbs' },
      { href: '/destinations/', label: 'Destinations' },
      { href: '/join-safari/', label: 'Group safaris' },
      { href: '/contact/', label: 'Contact us' },
    ],
  };

  // Static routes (home, tours list, about, …) with CMS page overrides.
  const routeKey = seoRouteKey(clean);
  if (routeKey) {
    const route = SEO_ROUTES[routeKey];
    const page = bySlug(store.pages, routeKey);
    const title = page?.seo_title || route.title;
    const description = page?.seo_description || route.description || defaults.defaultDescription;
    const keywords = keywordsText(page?.seo_keywords) || keywordsText(route.keywords) || keywordsText(defaults.defaultKeywords);
    const image = imageUrl(page?.og_image) || imageUrl(page?.hero_image) || route.image || defaults.defaultImage;
    const jsonLd = [org, { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: SITE_NAME, publisher: { '@id': `${origin}/#organization` } }];
    if (routeKey !== 'home') {
      jsonLd.push(breadcrumb(origin, [{ name: 'Home', path: '/' }, { name: page?.title || route.title.split('|')[0].trim(), path: route.path }]));
    }
    const faq = routeKey === 'tours' ? faqPage(faqsByGroup('safaris')) : routeKey === 'kilimanjaro' ? faqPage(faqsByGroup('kilimanjaro')) : routeKey === 'join-safari' ? faqPage(faqsByGroup('join-safari')) : null;
    if (faq) jsonLd.push(faq);
    return {
      ...base,
      title: clampText(title, 70),
      description: clampText(description, 165),
      keywords,
      image,
      jsonLd,
      heading: page?.title && routeKey !== 'home' ? page.title : title.split('|')[0].trim(),
      summary: page?.excerpt || description,
    };
  }

  const parts = clean.split('/').filter(Boolean);
  const [section, slug] = parts;
  if (parts.length !== 2) return null;
  const catalog = await websiteCatalog();

  if (section === 'tours') {
    const tour = bySlug(store.safaris, slug) || catalog.tours.find((row) => row.slug === slug);
    if (!tour) return null;
    const seo = tour.seo || {};
    const title = seo.title || withBrand(tour.title);
    const description =
      seo.description || tour.short_description || tour.overview || tour.description || `${tour.title} — a ${tour.duration || ''} Tanzania safari.`;
    const image = seo.og_image || imageUrl(tour.hero_image) || tour.image || '';
    const days = (tour.itinerary || tour.days || []).map((day, index) => ({
      '@type': 'TouristAttraction',
      name: day.title || `Day ${index + 1}`,
      description: clampText(day.description || day.body || '', 300) || undefined,
    }));
    const price = Number(tour.price_from ?? tour.price ?? 0);
    const trip = {
      '@type': 'TouristTrip',
      name: tour.title,
      description: clampText(description, 300),
      image: image ? absolute(origin, image) : undefined,
      touristType: tour.difficulty || tour.activity || 'Safari',
      provider: { '@id': `${origin}/#organization` },
      itinerary: days.length ? { '@type': 'ItemList', itemListElement: days.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })) } : undefined,
      offers: price > 0
        ? {
            '@type': 'Offer',
            price: price.toFixed(0),
            priceCurrency: tour.currency || 'USD',
            availability: 'https://schema.org/InStock',
            url: `${origin}${canonicalPath}`,
            seller: { '@id': `${origin}/#organization` },
          }
        : undefined,
    };
    return {
      ...base,
      title: clampText(title, 70),
      description: clampText(description, 165),
      keywords: keywordsText(seo.keywords || [tour.title, tour.destination, ...DEFAULT_KEYWORDS.slice(0, 4)]),
      image,
      canonical: seo.canonical && /^https?:/.test(seo.canonical) ? seo.canonical : base.canonical,
      robots: seo.robots && indexable ? seo.robots : robots,
      type: 'product',
      jsonLd: [org, trip, breadcrumb(origin, [{ name: 'Home', path: '/' }, { name: 'Safaris', path: '/tours/' }, { name: tour.title, path: canonicalPath }])],
      heading: tour.title,
      summary: description,
      extra: textList(tour.highlights).slice(0, 6),
    };
  }

  if (section === 'destinations') {
    const place = bySlug(store.destinations, slug) || catalog.destinations.find((row) => row.slug === slug);
    if (!place) return null;
    const name = place.title || place.name;
    const title = place.seo_title && place.seo_title !== name ? place.seo_title : withBrand(`${name.replace(/ National Park| Conservation Area/, '')} Safari Guide & Best Time to Visit`);
    const description = place.seo_description || place.tagline || place.blurb || `Plan a safari in ${name}, Tanzania.`;
    const image = imageUrl(place.og_image) || imageUrl(place.image);
    return {
      ...base,
      title: clampText(title, 70),
      description: clampText(description, 165),
      keywords: keywordsText(place.seo_keywords) || keywordsText([`${name} safari`, `${name} National Park`, `${name} tours`, 'Tanzania safari', 'best time to visit']),
      image,
      jsonLd: [
        org,
        {
          '@type': 'TouristDestination',
          name,
          description: clampText(description, 300),
          image: image ? absolute(origin, image) : undefined,
          geo: place.lat && place.lng ? { '@type': 'GeoCoordinates', latitude: Number(place.lat), longitude: Number(place.lng) } : undefined,
          containedInPlace: { '@type': 'Country', name: place.country || 'Tanzania' },
        },
        breadcrumb(origin, [{ name: 'Home', path: '/' }, { name: 'Destinations', path: '/destinations/' }, { name, path: canonicalPath }]),
      ],
      heading: name,
      summary: description,
      extra: textList(place.highlights).slice(0, 6),
    };
  }

  if (section === 'blog') {
    // Only CMS-published posts — drafts and unpublished posts stay hidden.
    const post = bySlug(store.posts, slug);
    if (!post) return null;
    const title = post.seo_title && post.seo_title !== post.title ? post.seo_title : withBrand(post.title);
    const description = post.seo_description || post.excerpt || '';
    const image = imageUrl(post.og_image) || imageUrl(post.hero_image) || imageUrl(post.image);
    const published = post.date || post.published_at || null;
    return {
      ...base,
      title: clampText(title, 70),
      description: clampText(description, 165),
      keywords: keywordsText(post.seo_keywords) || keywordsText([post.topic, 'Tanzania travel', 'Tanzania safari tips']),
      image,
      type: 'article',
      canonical: post.canonical_url && /^https?:/.test(post.canonical_url) ? post.canonical_url : base.canonical,
      published,
      jsonLd: [
        org,
        {
          '@type': 'BlogPosting',
          headline: clampText(post.title, 110),
          description: clampText(description, 300),
          image: image ? absolute(origin, image) : undefined,
          datePublished: published || undefined,
          dateModified: post.updated_at || published || undefined,
          author: { '@type': 'Organization', name: post.author || SITE_NAME },
          publisher: { '@id': `${origin}/#organization` },
          mainEntityOfPage: base.canonical,
        },
        breadcrumb(origin, [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog/' }, { name: post.title, path: canonicalPath }]),
      ],
      heading: post.title,
      summary: description,
    };
  }

  if (section === 'join-safari') {
    const pkg = catalog.joinPackages.find((row) => row.slug === slug || row.id === slug) || null;
    const trip = bySlug(store.departures, slug) || (pkg ? bySlug(store.departures, pkg.id) : null);
    if (!trip && !pkg && !catalog.joinSlugs.includes(slug)) return null;
    const name = String(trip?.title || pkg?.title || slug.replace(/-/g, ' ')).replace(/\s*\(joining safari\)/i, '');
    const description = trip?.short_description || trip?.overview || pkg?.overview || `Join our small-group departure: ${name}.`;
    const image = imageUrl(trip?.hero_image) || trip?.image || pkg?.image || '';
    return {
      ...base,
      title: clampText(withBrand(`${name} | Group Safari`), 70),
      description: clampText(description, 165),
      keywords: keywordsText(['group safari Tanzania', 'join a safari', name]),
      image,
      jsonLd: [org, breadcrumb(origin, [{ name: 'Home', path: '/' }, { name: 'Group Safari', path: '/join-safari/' }, { name, path: canonicalPath }])],
      heading: name,
      summary: description,
    };
  }

  return null;
}

/** Inject SEO tags + crawlable summary into a built HTML page. */
export function injectSeo(html, meta, settings) {
  if (!meta) return html;
  const origin = siteOrigin(settings);
  const image = meta.image ? absolute(origin, meta.image) : `${origin}/images/gallery/serengeti-01.webp`;
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    meta.keywords ? `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />` : '',
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:type" content="${escapeHtml(meta.type === 'product' ? 'website' : meta.type)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.heading || meta.title)}" />`,
    meta.published ? `<meta property="article:published_time" content="${escapeHtml(meta.published)}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<script type="application/ld+json">${jsonLdSafe({ '@context': 'https://schema.org', '@graph': meta.jsonLd.filter(Boolean) })}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');

  let out = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="(description|keywords|robots)"[\s\S]*?\/?>\s*/gi, '')
    .replace(/<meta\s+property="(og|article):[^"]+"[\s\S]*?\/?>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?\/?>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/?>\s*/gi, '');
  out = out.replace(/<meta\s+name="viewport"[^>]*>/i, (match) => `${match}\n    ${head}`);

  const summary = `
      <main id="main" class="seo-prerender">
        <h1>${escapeHtml(meta.heading || meta.title)}</h1>
        <p>${escapeHtml(meta.summary || meta.description)}</p>
        ${meta.extra?.length ? `<ul>${meta.extra.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        <nav aria-label="Explore">${meta.links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join(' · ')}</nav>
      </main>`;
  out = out.replace(/<div id="app"><\/div>/i, `<div id="app">${summary}\n    </div>`);
  return out;
}

export async function buildSitemap() {
  const store = await readStore();
  const settings = store.settings || DEFAULT_SETTINGS;
  const origin = siteOrigin(settings);
  const catalog = await websiteCatalog();
  const urls = new Map();
  const add = (path, { lastmod, priority = 0.6, changefreq = 'monthly', image } = {}) => {
    const loc = `${origin}${path}`;
    if (!urls.has(loc)) urls.set(loc, { loc, lastmod, priority, changefreq, image });
  };
  for (const route of Object.values(SEO_ROUTES)) {
    add(route.path, { priority: route.priority, changefreq: route.changefreq, image: route.image });
  }
  for (const record of store.safaris || []) {
    const doc = publishedDoc(record);
    if (doc && doc.seo?.robots !== 'noindex,nofollow') {
      add(`/tours/${doc.slug}/`, { lastmod: record.updated_at, priority: 0.8, changefreq: 'weekly', image: imageUrl(doc.hero_image) });
    }
  }
  for (const tour of catalog.tours) if (tour.slug) add(`/tours/${tour.slug}/`, { priority: 0.7, image: tour.image });
  for (const record of store.destinations || []) {
    const doc = publishedDoc(record);
    if (doc) add(`/destinations/${doc.slug}/`, { lastmod: record.updated_at, priority: 0.7, image: imageUrl(doc.image) });
  }
  for (const record of store.posts || []) {
    const doc = publishedDoc(record);
    if (doc) add(`/blog/${doc.slug}/`, { lastmod: record.updated_at, priority: 0.6, image: imageUrl(doc.hero_image) || imageUrl(doc.image) });
  }
  for (const record of store.departures || []) {
    const doc = publishedDoc(record);
    if (doc) add(`/join-safari/${doc.slug}/`, { lastmod: record.updated_at, priority: 0.7 });
  }
  const iso = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  };
  const body = [...urls.values()]
    .map((row) => {
      const image = row.image ? `\n    <image:image><image:loc>${escapeHtml(absolute(origin, row.image))}</image:loc></image:image>` : '';
      return `  <url>\n    <loc>${escapeHtml(row.loc)}</loc>${row.lastmod && iso(row.lastmod) ? `\n    <lastmod>${iso(row.lastmod)}</lastmod>` : ''}\n    <changefreq>${row.changefreq}</changefreq>\n    <priority>${Number(row.priority).toFixed(1)}</priority>${image}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

export async function buildRobots() {
  const store = await readStore();
  const settings = store.settings || DEFAULT_SETTINGS;
  const origin = siteOrigin(settings);
  const indexable = settings.websiteLive !== false && settings.security?.indexPublicPages !== false;
  if (!indexable) return 'User-agent: *\nDisallow: /\n';
  const disallow = String(settings.security?.disallowPaths || '/cms/,/api/')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return ['User-agent: *', 'Allow: /', ...disallow.map((path) => `Disallow: ${path}`), '', `Sitemap: ${origin}/sitemap.xml`, ''].join('\n');
}
