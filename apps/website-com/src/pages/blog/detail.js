import { articleCard } from '../../components/cards/article-card.js';
import { articleBySlug, relatedArticles, topicLabel } from './content.js';

/**
 * Individual journal article.
 * @param {string} slug
 */
export function renderBlogArticle(slug) {
  const article = articleBySlug(slug);
  if (!article) {
    return `
      <main id="main" class="bg-mist py-24">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Blog</p>
          <h1 class="section-title">Article not found</h1>
          <p class="mt-4 text-ink/70">That story is no longer listed. Browse the journal instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/blog/">View all articles</a>
        </div>
      </main>
    `;
  }

  const topic = topicLabel(article.topic);
  const related = relatedArticles(article)
    .map((item) => articleCard(item, topicLabel(item.topic)))
    .join('');

  const body = article.paragraphs
    .map((p) => `<p>${p}</p>`)
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="article-title">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${article.image}"
          alt=""
          width="2000"
          height="900"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[22rem] flex-col items-center justify-center py-16 text-center sm:min-h-[28rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">
            ${topic}
          </p>
          <h1 id="article-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            ${article.title}
          </h1>
          <p class="mt-4 font-body text-sm text-white/80">${article.date}</p>
        </div>
      </section>

      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/blog/">Blog</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/blog/${article.topic}/">${topic}</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">${article.title}</span>
        </div>
      </nav>

      <article class="bg-white py-16 sm:py-20">
        <div class="container-site max-w-3xl">
          <p class="font-display text-xl leading-relaxed text-ink/80">${article.excerpt}</p>
          <div class="blog-article-body mt-8">
            ${body}
          </div>
          <a class="btn-navy mt-10 !rounded-none" href="/contact/">Plan this trip</a>
        </div>
      </article>

      <section class="bg-mist py-16 sm:py-20" aria-labelledby="related-articles-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Keep reading</p>
            <h2 id="related-articles-title" class="section-title">Related articles</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-3">
            ${related}
          </div>
        </div>
      </section>
    </main>
  `;
}

export function applyBlogArticleMeta(slug) {
  const article = articleBySlug(slug);
  if (!article) return false;
  document.title = `${article.title} | Golden Memories Safaris`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', article.excerpt);
  return true;
}
