import { escapeAttr, escapeHtml } from './escape.js';
import { blogTocItems, renderBlogBlocks } from './blog-blocks.js';
import { enabledBlogSections, normalizeBlogDocument } from './blog-model.js';

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function shareUrl(path) {
  const slug = String(path || '').replace(/^\/+|\/+$/g, '');
  return `https://www.gmsafaris.com/${slug}/`;
}

function renderShare(doc) {
  const url = encodeURIComponent(shareUrl(`blog/${doc.slug}`));
  const text = encodeURIComponent(doc.title || 'Golden Memories Safaris');
  return `
    <div class="blog-share">
      <p class="blog-aside-kicker">Share this story</p>
      <div class="blog-share-row">
        <a href="https://wa.me/?text=${text}%20${url}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://twitter.com/intent/tweet?url=${url}&text=${text}" target="_blank" rel="noopener noreferrer">X</a>
        <a href="mailto:?subject=${text}&body=${url}">Email</a>
        <button type="button" data-copy-link="${escapeAttr(`https://www.gmsafaris.com/blog/${doc.slug}/`)}">Copy link</button>
      </div>
    </div>`;
}

function renderAuthor(doc) {
  if (!doc.author && !doc.author_bio) return '';
  return `
    <aside class="blog-author">
      ${
        doc.author_image
          ? `<img src="${escapeAttr(doc.author_image)}" alt="${escapeAttr(doc.author)}" width="88" height="88" loading="lazy" decoding="async" />`
          : ''
      }
      <div>
        <p class="blog-aside-kicker">Written by</p>
        <p class="blog-author-name">${escapeHtml(doc.author || 'Golden Memories Safaris')}</p>
        ${doc.author_role ? `<p class="blog-author-role">${escapeHtml(doc.author_role)}</p>` : ''}
        ${doc.author_bio ? `<p class="blog-author-bio">${escapeHtml(doc.author_bio)}</p>` : ''}
      </div>
    </aside>`;
}

function renderToc(items) {
  if (!items.length) return '';
  return `
    <nav class="blog-toc" aria-label="On this page">
      <p class="blog-aside-kicker">On this page</p>
      <ol>
        ${items
          .map(
            (item) =>
              `<li class="${item.level === 3 ? 'is-h3' : ''}"><a href="#${escapeAttr(item.id)}">${escapeHtml(item.text)}</a></li>`
          )
          .join('')}
      </ol>
    </nav>`;
}

function renderInquiry(doc, site = {}) {
  const phone = site.phone || '+255 786 383 273';
  const email = site.email || 'info@gmsafaris.co.tz';
  const wa = digits(phone);
  const label = doc.cta_label || 'Book a safari';
  return `
    <aside class="blog-inquiry">
      <p class="blog-aside-kicker">Plan with us</p>
      <h2>Book a safari</h2>
      <p>Tell the Arusha team your dates and we will match parks, lodges, and pace.</p>
      <a class="btn-gold !rounded-none" href="${escapeAttr(doc.cta_href || '/contact/')}">${escapeHtml(label)}</a>
      <p class="blog-inquiry-links">
        <a href="https://wa.me/${escapeAttr(wa)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href="tel:${escapeAttr(phone)}">${escapeHtml(phone)}</a>
        <a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a>
      </p>
    </aside>`;
}

/**
 * Public / preview blog article layout.
 * @param {Record<string, unknown>} raw
 * @param {{ relatedHtml?: string, featuredToursHtml?: string, featuredLodgesHtml?: string, embedTour?: Function, embedLodge?: Function, site?: Record<string, string>, editable?: boolean }} [options]
 */
export function renderBlogPage(raw, options = {}) {
  const doc = normalizeBlogDocument(raw || {});
  const sections = new Set(enabledBlogSections(doc).map((item) => item.type));
  const toc = blogTocItems(doc.blocks);
  const body = renderBlogBlocks(doc.blocks, {
    embedTour: options.embedTour,
    embedLodge: options.embedLodge,
    embedDestination: options.embedDestination,
  });
  const cover = doc.hero_image?.url || doc.image || '';
  const related = options.relatedHtml && sections.has('related') ? options.relatedHtml : '';
  const featuredTours = options.featuredToursHtml || '';
  const featuredLodges = options.featuredLodgesHtml || '';

  return `
    <main id="main" class="blog-article-page">
      <nav class="bg-white py-4" aria-label="Breadcrumb">
        <div class="container-site font-body text-sm text-black/60">
          <a class="hover:text-gold-deep" href="/">Home</a>
          <span aria-hidden="true"> › </span>
          <a class="hover:text-gold-deep" href="/blog/">Blog</a>
          ${doc.topic ? `<span aria-hidden="true"> › </span><a class="hover:text-gold-deep" href="/blog/${escapeAttr(doc.topic)}/">${escapeHtml(doc.kicker || doc.topic)}</a>` : ''}
        </div>
      </nav>

      <header class="blog-article-hero">
        <div class="container-site">
          <p class="section-kicker">${escapeHtml(doc.kicker || doc.topic || 'Journal')}</p>
          ${options.destinationBadgesHtml ? `<p class="blog-article-dests">${options.destinationBadgesHtml}</p>` : ''}
          <h1 class="section-title">${escapeHtml(doc.title || 'Untitled article')}</h1>
          <p class="blog-article-meta">
            <span>${escapeHtml(doc.author || 'Golden Memories Safaris')}</span>
            ${doc.date ? `<span aria-hidden="true">·</span><time datetime="${escapeAttr(doc.date)}">${escapeHtml(doc.date)}</time>` : ''}
            <span aria-hidden="true">·</span>
            <span>${doc.read_time || 1} min read</span>
          </p>
          ${doc.excerpt && sections.has('intro') ? `<p class="blog-article-excerpt">${escapeHtml(doc.excerpt)}</p>` : ''}
        </div>
        ${
          cover && sections.has('hero')
            ? `<figure class="blog-article-cover">
                <img src="${escapeAttr(cover)}" alt="${escapeAttr(doc.hero_image?.alt || doc.title)}" width="1600" height="900" decoding="async" />
              </figure>`
            : ''
        }
      </header>

      <div class="container-site blog-article-layout">
        <article class="blog-article-body">
          ${body || '<p>This article does not have body copy yet.</p>'}
          ${
            sections.has('gallery') && doc.gallery?.length
              ? `<div class="blog-gallery blog-gallery--grid">${doc.gallery
                  .map(
                    (image) =>
                      `<button class="blog-gallery-item" type="button" data-blog-lightbox="${escapeAttr(image.url)}" data-blog-alt="${escapeAttr(image.alt || '')}">
                        <img src="${escapeAttr(image.url)}" alt="${escapeAttr(image.alt || '')}" loading="lazy" decoding="async" width="800" height="600" />
                      </button>`
                  )
                  .join('')}</div>`
              : ''
          }
          ${renderAuthor(doc)}
          ${renderShare(doc)}
        </article>
        <aside class="blog-article-aside">
          ${renderToc(toc)}
          ${sections.has('booking_cta') ? renderInquiry(doc, options.site) : ''}
          ${
            featuredTours
              ? `<div class="blog-aside-block"><p class="blog-aside-kicker">Featured tours</p><div class="blog-aside-cards">${featuredTours}</div></div>`
              : ''
          }
          ${
            featuredLodges
              ? `<div class="blog-aside-block"><p class="blog-aside-kicker">Stay here</p><div class="blog-aside-cards">${featuredLodges}</div></div>`
              : ''
          }
          ${
            options.featuredDestinationsHtml
              ? `<div class="blog-aside-block"><p class="blog-aside-kicker">Destinations</p><div class="blog-aside-cards">${options.featuredDestinationsHtml}</div></div>`
              : ''
          }
        </aside>
      </div>

      ${
        related
          ? `<section class="blog-related" aria-labelledby="blog-related-title">
              <div class="container-site">
                <p class="section-kicker">Keep reading</p>
                <h2 id="blog-related-title" class="section-title">Related articles</h2>
                <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">${related}</div>
              </div>
            </section>`
          : ''
      }
      <div class="blog-lightbox" hidden data-blog-lightbox-root>
        <button type="button" class="blog-lightbox-close" data-blog-lightbox-close aria-label="Close image">×</button>
        <img alt="" />
      </div>
    </main>
  `;
}

export function initBlogArticle(root = document) {
  const page = root.querySelector?.('.blog-article-page') || (root.body ? root.querySelector('.blog-article-page') : null);
  if (!page) return;

  const lightbox = page.querySelector('[data-blog-lightbox-root]');
  const lightboxImg = lightbox?.querySelector('img');
  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lightboxImg) lightboxImg.src = '';
  }
  page.querySelectorAll('[data-blog-lightbox]').forEach((node) => {
    node.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox(node.getAttribute('data-blog-lightbox'), node.getAttribute('data-blog-alt'));
    });
  });
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.hasAttribute('data-blog-lightbox-close')) closeLightbox();
  });

  page.querySelectorAll('[data-copy-link]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy-link') || window.location.href;
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = 'Copied';
        window.setTimeout(() => {
          btn.textContent = 'Copy link';
        }, 1600);
      } catch {
        btn.textContent = 'Copy failed';
      }
    });
  });

  const links = [...page.querySelectorAll('.blog-toc a')];
  const headings = links
    .map((link) => page.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (links.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = `#${visible.target.id}`;
        links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === id));
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 1] }
    );
    headings.forEach((heading) => observer.observe(heading));
  }
}
