import { articleCard } from '../../components/cards/article-card.js';
import { articleBySlug, relatedArticles, topicLabel } from './content.js';
import { destinationEmbedHtml, destinationBadgesHtml, featuredDestinationsHtml, featuredLodgesHtml, featuredToursHtml, lodgeEmbedHtml, tourEmbedHtml } from './embeds.js';
import { site } from '../home/content.js';
import { initBlogArticle, normalizeBlogDocument, renderBlogPage } from '@gm-safaris/safari-ui';

/**
 * Individual journal article.
 * @param {string} slug
 */
export function renderBlogArticle(slug) {
  const article = articleBySlug(slug);
  if (!article) {
    return `
      <main id="main" class="bg-mist py-12">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Blog</p>
          <h1 class="section-title">Article not found</h1>
          <p class="mt-4 text-ink/70">That story is no longer listed. Browse the journal instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/blog/">View all articles</a>
        </div>
      </main>
    `;
  }

  const doc = normalizeBlogDocument({
    ...article,
    kicker: article.kicker || topicLabel(article.topic),
  });
  const related = relatedArticles(article)
    .map((item) => articleCard(item, topicLabel(item.topic)))
    .join('');

  return renderBlogPage(doc, {
    relatedHtml: related,
    site,
    embedTour: tourEmbedHtml,
    embedLodge: lodgeEmbedHtml,
    embedDestination: destinationEmbedHtml,
    featuredToursHtml: featuredToursHtml(doc.featured_tour_slugs),
    featuredLodgesHtml: featuredLodgesHtml(doc.featured_lodge_ids),
    featuredDestinationsHtml: featuredDestinationsHtml(doc.destination_slugs),
    destinationBadgesHtml: destinationBadgesHtml(doc.destination_slugs),
  });
}

function upsertMeta(selector, attr, value) {
  if (!value) return;
  let node = document.querySelector(selector);
  if (!node) {
    node = document.createElement(selector.startsWith('meta') ? 'meta' : 'link');
    const match = selector.match(/\[([^=]+)="([^"]+)"\]/);
    if (match) node.setAttribute(match[1], match[2]);
    document.head.appendChild(node);
  }
  node.setAttribute(attr, value);
}

export function applyBlogArticleMeta(slug) {
  const article = articleBySlug(slug);
  if (!article) return false;
  const doc = normalizeBlogDocument(article);
  const title = `${doc.seo_title || doc.title} | Golden Memories Safaris`;
  const description = doc.seo_description || doc.excerpt || '';
  const url = doc.canonical_url || `https://www.gmsafaris.com/blog/${doc.slug}/`;
  const image = doc.og_image || doc.image || '';
  document.title = title;
  upsertMeta('meta[name="description"]', 'content', description);
  upsertMeta('meta[name="keywords"]', 'content', doc.seo_keywords);
  upsertMeta('link[rel="canonical"]', 'href', url);
  upsertMeta('meta[property="og:title"]', 'content', doc.seo.title || doc.title);
  upsertMeta('meta[property="og:description"]', 'content', description);
  upsertMeta('meta[property="og:type"]', 'content', 'article');
  upsertMeta('meta[property="og:url"]', 'content', url);
  upsertMeta('meta[property="og:image"]', 'content', image.startsWith('http') ? image : `https://www.gmsafaris.com${image}`);
  upsertMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  upsertMeta('meta[name="twitter:title"]', 'content', doc.seo.title || doc.title);
  upsertMeta('meta[name="twitter:description"]', 'content', description);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: doc.title,
    description,
    image: image ? [image.startsWith('http') ? image : `https://www.gmsafaris.com${image}`] : undefined,
    datePublished: doc.date || undefined,
    author: {
      '@type': 'Organization',
      name: doc.author || 'Golden Memories Safaris',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Golden Memories Safaris',
      url: 'https://www.gmsafaris.com/',
    },
    mainEntityOfPage: url,
    keywords: doc.seo_keywords || undefined,
    articleSection: topicLabel(doc.topic),
    wordCount: (doc.paragraphs || []).join(' ').split(/\s+/).filter(Boolean).length || undefined,
    timeRequired: `PT${doc.read_time || 1}M`,
  };
  let script = document.querySelector('#blog-json-ld');
  if (!script) {
    script = document.createElement('script');
    script.id = 'blog-json-ld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
  return true;
}

export { initBlogArticle };
