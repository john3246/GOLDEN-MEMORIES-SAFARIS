import { reviewData } from '../../services/cms/overlay.js';
import { testimonials } from '../../pages/home/content.js';

const SOURCE_LABELS = { google: 'Google review', tripadvisor: 'Tripadvisor review', safaribookings: 'SafariBookings review' };

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Guest quotes for a page: real imported reviews first (optionally matching a
 * keyword such as "Kilimanjaro"), then published CMS testimonials.
 * Returns '' when there is nothing genuine to show.
 */
export function reviewQuotes({ limit = 4, match = null } = {}) {
  const real = (reviewData.reviews || []).filter((row) => row.text && (row.rating || 5) >= 4);
  const matched = match ? real.filter((row) => match.test(`${row.title} ${row.text}`)) : [];
  const pool = [...matched, ...real.filter((row) => !matched.includes(row))]
    .slice(0, limit)
    .map((row) => ({
      quote: row.text.length > 300 ? `${row.text.slice(0, 297).trim()}…` : row.text,
      name: row.author,
      detail: [row.country, SOURCE_LABELS[row.source]].filter(Boolean).join(' · '),
    }));
  const items = pool.length ? pool : testimonials.slice(0, limit);
  return items
    .map(
      (t) => `
      <blockquote class="quote-card bg-white p-5 sm:p-6">
        <p class="font-display text-base italic leading-relaxed text-ink/80">“${esc(t.quote)}”</p>
        <footer class="mt-4">
          <cite class="not-italic font-body text-sm font-bold uppercase tracking-[0.1em] text-black">${esc(t.name)}</cite>
          <p class="mt-1 text-sm text-ink/55">${esc(t.detail)}</p>
        </footer>
      </blockquote>`
    )
    .join('');
}
