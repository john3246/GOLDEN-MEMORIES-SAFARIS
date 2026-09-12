/**
 * Article card — same tour-card layout used across the site.
 * @param {{ slug: string, title: string, excerpt: string, image: string, date: string, topic: string }} article
 * @param {string} topicName
 */
export function articleCard(article, topicName) {
  const href = `/blog/${article.slug}/`;
  return `
    <article class="tour-card flex h-full flex-col border border-ink/10">
      <a href="${href}" class="relative block aspect-[16/11] overflow-hidden">
        <img
          src="${article.image}"
          alt=""
          loading="lazy"
          width="800"
          height="550"
        />
      </a>
      <div class="flex flex-1 flex-col p-5 sm:p-6">
        <div class="flex flex-wrap gap-x-3 gap-y-1 font-body text-xs font-semibold uppercase tracking-[0.12em] text-black/60">
          <span>${topicName}</span>
          <span aria-hidden="true">·</span>
          <span>${article.date}</span>
        </div>
        <h3 class="mt-3 font-display text-xl font-semibold leading-tight text-black sm:text-2xl">
          <a href="${href}" class="card-title-link">${article.title}</a>
        </h3>
        <p class="mt-3 text-sm leading-relaxed text-ink/65">${article.excerpt}</p>
        <a href="${href}" class="card-link mt-auto pt-5 font-body text-sm font-bold uppercase tracking-[0.1em] text-black">
          Read article <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `;
}
