import { articleCard } from '../../components/cards/article-card.js';
import {
  articlesForTopic,
  blogArticles,
  blogIntro,
  blogTopics,
  topicBySlug,
  topicLabel,
} from './content.js';

const MONTHS = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

function articleStamp(article) {
  const match = article.date.match(/^(\d+) (\w+) (\d+)$/);
  if (!match) return 0;
  return Date.UTC(Number(match[3]), MONTHS[match[2]] ?? 0, Number(match[1]));
}

function topicCard(topic, count) {
  const noun = count === 1 ? 'Article' : 'Articles';
  return `
    <a
      class="destination-card block aspect-[4/5] sm:aspect-[3/4]"
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

/**
 * Blog hub (Altezza /articles format) and topic listing.
 * @param {string} [topicSlug]
 */
export function renderBlog(topicSlug = '') {
  const topic = topicSlug ? topicBySlug(topicSlug) : null;

  if (topicSlug && !topic) {
    return `
      <main id="main" class="bg-mist py-24">
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

        <section class="bg-mist py-16 sm:py-20" aria-labelledby="blog-topic-list-title">
          <div class="container-site">
            <h2 id="blog-topic-list-title" class="sr-only">Articles in ${topic.name}</h2>
            <div class="reveal grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              ${articles}
            </div>
          </div>
        </section>

        <section class="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="blog-other-title">
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

  const latest = [...blogArticles]
    .slice()
    .sort((a, b) => articleStamp(b) - articleStamp(a))
    .slice(0, 6)
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

      <section class="bg-white pb-16 sm:pb-20 lg:pb-24" aria-labelledby="blog-topics-title">
        <div class="container-site">
          <div class="reveal mx-auto max-w-2xl text-center">
            <h2 id="blog-topics-title" class="section-title">Select Topic</h2>
            <div class="mx-auto mt-3 h-0.5 w-12 bg-gold" aria-hidden="true"></div>
          </div>
          <div class="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            ${topicGrid}
          </div>
        </div>
      </section>

      <section class="bg-mist py-16 sm:py-20 lg:py-24" aria-labelledby="blog-latest-title">
        <div class="container-site">
          <div class="reveal max-w-2xl">
            <p class="section-kicker">Latest reads</p>
            <h2 id="blog-latest-title" class="section-title">From the journal</h2>
          </div>
          <div class="reveal mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            ${latest}
          </div>
        </div>
      </section>
    </main>
  `;
}
