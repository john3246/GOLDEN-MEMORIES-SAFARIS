import { articleCard } from '../../components/cards/article-card.js';
import { cardUrl } from '../../media/gallery.js';
import { allDestinations } from '../destinations/catalog.js';
import {
  articlesForTopic,
  blogIntro,
  blogTopics,
  featuredArticle,
  sortedArticles,
  topicBySlug,
  topicLabel,
} from './content.js';

function topicCard(topic, count) {
  const noun = count === 1 ? 'Article' : 'Articles';
  return `
    <a
      class="destination-card block aspect-[16/11] sm:aspect-[4/3]"
      href="/blog/${topic.slug}/"
      aria-label="${topic.name} — ${count} ${noun.toLowerCase()}"
    >
      <img
        src="${topic.image}"
        alt="${topic.name}"
        loading="lazy"
        width="600"
        height="800"
      />
      <div class="absolute inset-0 destination-overlay bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"></div>
      <div class="destination-copy absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p class="font-body text-xs font-bold uppercase tracking-[0.14em] text-gold">${count} ${noun}</p>
        <h3 class="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">${topic.name}</h3>
        <p class="mt-2 max-w-xs text-sm text-white/85">${topic.blurb}</p>
        <p class="mt-4 font-body text-xs font-bold uppercase tracking-[0.12em] text-gold">Explore</p>
      </div>
    </a>
  `;
}

function otherTopics(activeSlug) {
  return blogTopics
    .filter((topic) => topic.slug !== activeSlug)
    .map((topic) => topicCard(topic, articlesForTopic(topic.slug).length))
    .join('');
}

function featuredHero(article) {
  if (!article) return '';
  const href = `/blog/${article.slug}/`;
  const topic = topicLabel(article.topic);
  return `
    <section class="blog-featured" aria-labelledby="blog-featured-title">
      <div class="container-site">
        <article class="blog-featured-card">
          <a class="blog-featured-media" href="${href}">
            <img src="${cardUrl(article.image, article.title, 0)}" alt="${article.title}" width="1200" height="800" decoding="async" />
          </a>
          <div class="blog-featured-copy">
            <p class="section-kicker">Featured tour article</p>
            <p class="blog-featured-topic">${topic}</p>
            <h2 id="blog-featured-title" class="section-title">
              <a href="${href}">${article.title}</a>
            </h2>
            <p>${article.excerpt}</p>
            <a class="btn-gold mt-6 !rounded-none" href="${href}">Read the story</a>
          </div>
        </article>
      </div>
    </section>`;
}

function filterBar(active = '') {
  const tabs = [
    { slug: '', name: 'All' },
    ...blogTopics.map((topic) => ({ slug: topic.slug, name: topic.name })),
  ];
  const dests = allDestinations()
    .slice(0, 12)
    .map((place) => ({ slug: place.slug, name: place.name.replace(/ National Park| Conservation Area/g, '') }));
  return `
    <div class="blog-toolbar">
      <div class="blog-tabs" role="tablist" aria-label="Article categories">
        ${tabs
          .map(
            (tab) =>
              `<button class="blog-tab${tab.slug === active ? ' is-active' : ''}" type="button" data-blog-topic="${tab.slug}">${tab.name}</button>`
          )
          .join('')}
      </div>
      <div class="blog-tabs blog-tabs-dest" role="tablist" aria-label="Filter by destination">
        <button class="blog-tab is-active" type="button" data-blog-dest="">All parks</button>
        ${dests.map((place) => `<button class="blog-tab" type="button" data-blog-dest="${place.slug}">${place.name}</button>`).join('')}
      </div>
      <label class="blog-search">
        <span class="sr-only">Search articles</span>
        <input type="search" data-blog-search placeholder="Search safari stories…" />
      </label>
    </div>`;
}

export function initBlogIndex() {
  const search = document.querySelector('[data-blog-search]');
  const tabs = [...document.querySelectorAll('[data-blog-topic]')];
  const destTabs = [...document.querySelectorAll('[data-blog-dest]')];
  const cards = [...document.querySelectorAll('[data-blog-card]')];
  const empty = document.querySelector('[data-blog-empty]');
  if (!tabs.length || !cards.length) return;
  let topic = '';
  let dest = '';

  function apply() {
    const q = String(search?.value || '')
      .trim()
      .toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchTopic = !topic || card.dataset.topic === topic;
      const matchDest = !dest || (card.dataset.destinations || '').split(/\s+/).includes(dest) || (card.dataset.search || '').includes(dest.replace(/-/g, ' '));
      const matchSearch = !q || (card.dataset.search || '').includes(q);
      const show = matchTopic && matchDest && matchSearch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.blogTopic === topic));
    destTabs.forEach((tab) => tab.classList.toggle('is-active', (tab.dataset.blogDest || '') === dest));
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      topic = tab.dataset.blogTopic || '';
      apply();
    });
  });
  destTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      dest = tab.dataset.blogDest || '';
      apply();
    });
  });
  search?.addEventListener('input', apply);
}

/**
 * Blog hub and topic listing.
 * @param {string} [topicSlug]
 */
export function renderBlog(topicSlug = '') {
  const topic = topicSlug ? topicBySlug(topicSlug) : null;

  if (topicSlug && !topic) {
    return `
      <main id="main" class="bg-mist py-12">
        <div class="container-site max-w-2xl text-center">
          <p class="section-kicker">Blog</p>
          <h1 class="section-title">Topic not found</h1>
          <p class="mt-4 text-ink/70">That section is not on the journal. Browse current articles instead.</p>
          <a class="btn-navy mt-8 !rounded-none" href="/blog/">View all articles</a>
        </div>
      </main>
    `;
  }

  if (topic) {
    const articles = articlesForTopic(topic.slug)
      .map((article) => articleCard(article, topic.name))
      .join('');

    return `
      <main id="main">
        <nav class="bg-white py-4" aria-label="Breadcrumb">
          <div class="container-site font-body text-sm text-black/60">
            <a class="hover:text-gold-deep" href="/">Home</a>
            <span aria-hidden="true"> › </span>
            <a class="hover:text-gold-deep" href="/blog/">Blog</a>
            <span aria-hidden="true"> › </span>
            <span class="text-black">${topic.name}</span>
          </div>
        </nav>

        <section class="bg-white pb-8 pt-10 sm:pb-12 sm:pt-14" aria-labelledby="blog-topic-title">
          <div class="container-site max-w-3xl text-center">
            <p class="section-kicker">Select topic</p>
            <h1 id="blog-topic-title" class="section-title">${topic.name}</h1>
            <p class="mt-6 font-body text-base leading-relaxed text-ink/75 sm:text-lg">${topic.blurb}</p>
          </div>
        </section>

        <section class="bg-mist py-8 sm:py-10" aria-labelledby="blog-topic-list-title">
          <div class="container-site">
            <h2 id="blog-topic-list-title" class="sr-only">Articles in ${topic.name}</h2>
            <div class="reveal grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              ${articles}
            </div>
          </div>
        </section>

        <section class="bg-white py-8 sm:py-10" aria-labelledby="blog-other-title">
          <div class="container-site">
            <div class="reveal mx-auto max-w-2xl text-center">
              <h2 id="blog-other-title" class="section-title">Other categories</h2>
            </div>
            <div class="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              ${otherTopics(topic.slug)}
            </div>
          </div>
        </section>
      </main>
    `;
  }

  const topicGrid = blogTopics
    .map((item) => topicCard(item, articlesForTopic(item.slug).length))
    .join('');
  const featured = featuredArticle();
  const cards = sortedArticles()
    .filter((article) => article.slug !== featured?.slug)
    .map((article) => articleCard(article, topicLabel(article.topic)))
    .join('');

  return `
    <main id="main">
      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">Blog</span>
        </div>
      </nav>

      <section class="bg-white pb-6 pt-10 sm:pb-8 sm:pt-16" aria-labelledby="blog-title">
        <div class="container-site max-w-3xl text-center">
          <h1 id="blog-title" class="font-display text-4xl font-semibold tracking-tight text-black sm:text-5xl lg:text-6xl">
            ${blogIntro.title}
          </h1>
          <p class="mt-6 font-body text-base leading-relaxed text-ink/75 sm:text-lg">${blogIntro.body}</p>
        </div>
      </section>

      ${featuredHero(featured)}

      <section class="bg-mist py-8 sm:py-10" aria-labelledby="blog-latest-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Journal</p>
            <h2 id="blog-latest-title" class="section-title">Safari stories</h2>
          </div>
          ${filterBar()}
          ${featured ? `<div class="reveal mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            ${cards}
          </div>
          <p class="blog-empty" data-blog-empty hidden>No articles match that search.</p>` : '<p class="blog-empty mt-10">New safari stories are coming soon. Please check back shortly.</p>'}
        </div>
      </section>

      <section class="bg-white pb-16 pt-8 sm:pb-20 lg:pb-24" aria-labelledby="blog-topics-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <h2 id="blog-topics-title" class="section-title">Browse by topic</h2>
            <div class="mx-auto mt-3 h-0.5 w-12 bg-gold" aria-hidden="true"></div>
          </div>
          <div class="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            ${topicGrid}
          </div>
        </div>
      </section>
    </main>
  `;
}
