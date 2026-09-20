import { escapeHtml, escapeAttr } from './escape.js';
import { editAttr, wrapSection } from './edit.js';
import { enabledBlogSections } from './blog-model.js';

function topicLabel(topic) {
  const labels = {
    climbing: 'Climbing',
    safari: 'Safari',
    'about-us': 'About Us',
    'about-tanzania': 'About Tanzania',
    islands: 'Islands',
    wildlife: 'Wildlife',
  };
  return labels[topic] || topic || 'Journal';
}

function renderBlocks(blocks, editable) {
  return (blocks || [])
    .map((block, index) => {
      const edit = editAttr(editable, `block.${index}.text`);
      if (block.type === 'heading') {
        return `<h2${edit}>${escapeHtml(block.text)}</h2>`;
      }
      if (block.type === 'quote') {
        return `<blockquote${edit}><p>${escapeHtml(block.text)}</p></blockquote>`;
      }
      if (block.type === 'image' && block.url) {
        return `<figure class="blog-figure"><img src="${escapeAttr(block.url)}" alt="${escapeAttr(block.alt || '')}" width="1600" height="900" />${
          block.alt ? `<figcaption>${escapeHtml(block.alt)}</figcaption>` : ''
        }</figure>`;
      }
      if (block.type === 'paragraph') {
        return `<p${edit}>${escapeHtml(block.text)}</p>`;
      }
      return '';
    })
    .join('');
}

export function renderBlogPage(doc, options = {}) {
  const editable = Boolean(options.editable);
  const related = options.relatedHtml || '';
  const hero = doc.hero_image?.url || doc.image || '';
  const topic = topicLabel(doc.topic);
  const enabled = new Set(enabledBlogSections(doc).map((item) => item.type));

  const heroHtml = enabled.has('hero')
    ? wrapSection(
        'hero',
        `
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="article-title">
        ${hero ? `<img class="absolute inset-0 h-full w-full object-cover" src="${escapeAttr(hero)}" alt="${escapeAttr(doc.hero_image?.alt || '')}" width="2000" height="900" />` : ''}
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col items-center justify-center py-8 text-center sm:min-h-[13rem]">
          <p class="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.14em] text-black">${escapeHtml(doc.kicker || topic)}</p>
          <h1 id="article-title" class="mt-5 max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"${editAttr(editable, 'title')}>${escapeHtml(doc.title || 'Untitled article')}</h1>
          <p class="mt-4 font-body text-sm text-white/80">${escapeHtml(doc.date || '')}${doc.author ? ` · ${escapeHtml(doc.author)}` : ''}</p>
        </div>
      </section>`
      )
    : '';

  const introHtml = enabled.has('intro')
    ? wrapSection(
        'intro',
        `<p class="font-display text-xl leading-relaxed text-ink/80"${editAttr(editable, 'excerpt')}>${escapeHtml(doc.excerpt || '')}</p>`
      )
    : '';

  const bodyHtml = enabled.has('body')
    ? wrapSection('body', `<div class="blog-article-body mt-8">${renderBlocks(doc.blocks, editable)}</div>`)
    : '';

  const galleryHtml =
    enabled.has('gallery') && Array.isArray(doc.gallery) && doc.gallery.length
      ? wrapSection(
          'gallery',
          `<div class="mt-10 grid gap-4 sm:grid-cols-2">${doc.gallery
            .map((item) => {
              const url = typeof item === 'string' ? item : item?.url;
              if (!url) return '';
              return `<img class="h-56 w-full object-cover" src="${escapeAttr(url)}" alt="${escapeAttr(item?.alt || doc.title || '')}" />`;
            })
            .join('')}</div>`
        )
      : '';

  const ctaHtml = enabled.has('booking_cta')
    ? wrapSection(
        'booking_cta',
        `<a class="btn-navy mt-10 !rounded-none" href="${escapeAttr(doc.cta_href || '/contact/')}">${escapeHtml(doc.cta_label || 'Plan this trip')}</a>`
      )
    : '';

  const relatedHtml = enabled.has('related') && related
    ? wrapSection(
        'related',
        `<section class="bg-mist py-8 sm:py-10" aria-labelledby="related-articles-title">
          <div class="container-site">
            <p class="section-kicker">Keep reading</p>
            <h2 id="related-articles-title" class="section-title">Related articles</h2>
            <div class="mt-10 grid gap-6 md:grid-cols-3">${related}</div>
          </div>
        </section>`
      )
    : '';

  return `
    <main id="main">
      ${heroHtml}
      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/blog/">Blog</a>
          <span aria-hidden="true"> › </span>
          <span class="text-black">${escapeHtml(doc.title || 'Article')}</span>
        </div>
      </nav>
      <article class="bg-white py-8 sm:py-10">
        <div class="container-site max-w-3xl">
          ${introHtml}
          ${bodyHtml}
          ${galleryHtml}
          ${ctaHtml}
        </div>
      </article>
      ${relatedHtml}
    </main>
  `;
}
