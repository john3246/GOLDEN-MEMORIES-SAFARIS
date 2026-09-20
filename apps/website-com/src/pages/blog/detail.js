import { articleCard } from '../../components/cards/article-card.js';
import { articleBySlug, relatedArticles, topicLabel } from './content.js';
import { renderBlogPage } from '@gm-safaris/safari-ui';

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

  const related = relatedArticles(article)
    .map((item) => articleCard(item, topicLabel(item.topic)))
    .join('');

  return renderBlogPage(article, { relatedHtml: related });
}

export function applyBlogArticleMeta(slug) {
  const article = articleBySlug(slug);
  if (!article) return false;
  document.title = `${article.seo_title || article.title} | Golden Memories Safaris`;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', article.seo_description || article.excerpt || '');
  }
  return true;
}
