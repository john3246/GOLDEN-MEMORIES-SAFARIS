import { lodges, accommodationsHero } from './content.js';

export function renderAccommodations() {
  const cards = lodges
    .map(
      (lodge) => `
        <article class="tour-card flex min-w-0 flex-col border border-ink/10">
          <div class="relative aspect-[16/9] overflow-hidden bg-mist">
            <img class="absolute inset-0 h-full w-full object-cover" src="${lodge.image}" alt="${lodge.name}" loading="lazy" width="800" height="450" />
          </div>
          <div class="flex flex-1 flex-col p-4">
            <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${lodge.place}</p>
            <h3 class="mt-1 font-display text-lg font-semibold text-black">${lodge.name}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink/70">${lodge.blurb}</p>
          </div>
        </article>
      `
    )
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="stay-hero-title">
        <img class="absolute inset-0 h-full w-full object-cover" src="${accommodationsHero.image}" alt="Safari lodge stay in Tanzania" width="2000" height="900" fetchpriority="high" />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col justify-end py-8 sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="font-body text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Home <span aria-hidden="true">›</span> Accommodations</p>
          <h1 id="stay-hero-title" class="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Safari lodges and camps</h1>
          <p class="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">We match lodges and tented camps to your circuit, season, and budget — confirmed to your dates from Arusha.</p>
        </div>
      </section>
      <section class="bg-mist py-8 sm:py-10">
        <div class="container-site">
          <p class="section-kicker">Where you stay</p>
          <h2 class="section-title">Properties we book on the circuit</h2>
          <p class="mt-3 max-w-2xl text-ink/70">A sample of camps and lodges used on Golden Memories itineraries. Final properties depend on availability and the pace you want.</p>
          <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">${cards}</div>
          <div class="mt-8">
            <a class="btn-navy !rounded-none" href="/contact/">Ask for lodge options</a>
          </div>
        </div>
      </section>
    </main>
  `;
}
