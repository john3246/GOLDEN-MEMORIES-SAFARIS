import { reviewsHero, reviewList } from './content.js';

export function renderReviews() {
  const cards = reviewList
    .map(
      (item) => `
        <blockquote class="quote-card bg-white p-5 sm:p-6">
          <p class="font-display text-base italic leading-relaxed text-ink/80">“${item.quote}”</p>
          <footer class="mt-4">
            <cite class="not-italic font-body text-sm font-bold uppercase tracking-[0.1em] text-black">${item.name}</cite>
            <p class="mt-1 text-sm text-ink/55">${item.detail}</p>
          </footer>
        </blockquote>
      `
    )
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="reviews-hero-title">
        <img class="absolute inset-0 h-full w-full object-cover" src="${reviewsHero.image}" alt="Guests on safari in Tanzania" width="2000" height="900" fetchpriority="high" />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col justify-end py-8 sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="font-body text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Home <span aria-hidden="true">›</span> Reviews</p>
          <h1 id="reviews-hero-title" class="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Guest reviews</h1>
          <p class="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">What travellers tell us after the game drives, crater days, and last transfer back to Arusha.</p>
        </div>
      </section>
      <section class="bg-mist py-8 sm:py-10">
        <div class="container-site">
          <p class="section-kicker">Testimonies</p>
          <h2 class="section-title">Stories from the trail</h2>
          <div class="mt-6 grid gap-4 md:grid-cols-2">${cards}</div>
          <p class="mt-8 max-w-xl text-sm text-ink/70">Find more guest feedback on TripAdvisor, or send us your dates and we will plan the next chapter.</p>
          <a class="btn-navy mt-5 !rounded-none" href="/contact/">Plan your safari</a>
        </div>
      </section>
    </main>
  `;
}
