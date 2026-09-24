import { cardUrl } from '../../media/gallery.js';
import { estimateReadTime, normalizeBlogDocument } from '@gm-safaris/safari-ui';

function attr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/**
 * Article card — same tour-card layout used across the site.
 * @param {Record<string, unknown>} article
 * @param {string} topicName
 */
export function articleCard(article, topicName) {
  const doc = normalizeBlogDocument(article || {});
  const href = `/blog/${doc.slug || article.slug}/`;
  const minutes = doc.read_time || estimateReadTime(doc);
  const search = `${doc.title} ${doc.excerpt} ${doc.author} ${topicName}`.toLowerCase();
  return `
    <article
      class="tour-card blog-index-card flex h-full min-w-0 flex-col border border-ink/10"
      data-blog-card
      data-topic="${attr(doc.topic || article.topic || '')}"
      data-search="${attr(search)}"
    >
      <a href="${href}" class="relative block aspect-[16/9] overflow-hidden bg-mist">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          src="${cardUrl(doc.image || article.image, doc.title, 0)}"
          alt="${attr(doc.hero_image?.alt || doc.title)}"
          loading="lazy"
          decoding="async"
          width="800"
          height="450"
        />
        ${topicName ? `<span class="blog-card-badge">${topicName}</span>` : ''}
      </a>
      <div class="flex flex-1 flex-col p-3.5 sm:p-4">
        <div class="flex flex-wrap gap-x-3 gap-y-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-black/60">
          <span>${minutes} min read</span>
          ${doc.date ? `<span aria-hidden="true">·</span><span>${doc.date}</span>` : ''}
        </div>
        <h3 class="mt-3 font-display text-xl font-semibold leading-tight text-black sm:text-2xl">
          <a href="${href}" class="card-title-link">${doc.title}</a>
        </h3>
        <p class="mt-3 text-sm leading-relaxed text-ink/65">${doc.excerpt}</p>
        <p class="mt-3 font-body text-xs font-semibold uppercase tracking-[0.1em] text-black/55">${doc.author}</p>
        <a href="${href}" class="card-link mt-auto pt-5 font-body text-sm font-bold uppercase tracking-[0.1em] text-black">
          Read article <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `;
}
