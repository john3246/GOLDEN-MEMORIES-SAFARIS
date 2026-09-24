import { lodgeCategoryLabel, normalizeLodgeCategory } from '@gm-safaris/safari-ui';
import { lodges, accommodationsHero } from './content.js';

const CATEGORY_ORDER = ['midrange', 'luxury', 'premium-luxury'];
const REGION_ORDER = [
  'Arusha',
  'Tarangire',
  'Lake Manyara',
  'Tarangire & Lake Manyara',
  'Serengeti',
  'Ngorongoro / Karatu',
  'Ngorongoro',
];

function photos(lodge) {
  const urls = [lodge.image, ...(lodge.gallery || [])].filter(Boolean);
  const unique = [];
  for (const url of urls) {
    if (!unique.includes(url)) unique.push(url);
  }
  return unique.slice(0, 3);
}

function groupedLodges() {
  const buckets = new Map(CATEGORY_ORDER.map((id) => [id, new Map()]));
  for (const lodge of lodges) {
    const category = normalizeLodgeCategory(lodge.category);
    const region = String(lodge.region || lodge.place || 'Other').trim() || 'Other';
    if (!buckets.has(category)) buckets.set(category, new Map());
    const regions = buckets.get(category);
    if (!regions.has(region)) regions.set(region, []);
    regions.get(region).push(lodge);
  }
  return CATEGORY_ORDER.map((id) => {
    const regions = buckets.get(id) || new Map();
    const ordered = [
      ...REGION_ORDER.filter((name) => regions.has(name)).map((name) => [name, regions.get(name)]),
      ...[...regions.entries()].filter(([name]) => !REGION_ORDER.includes(name)),
    ];
    return { id, label: lodgeCategoryLabel(id), regions: ordered };
  }).filter((group) => group.regions.length);
}

function lodgeCard(lodge) {
  const images = photos(lodge);
  const cover = images[0] || '/images/accommodations/hero.webp';
  const extras = images.slice(1);
  const gallery =
    extras.length > 0
      ? `
        <div class="lodge-gallery">
          <img src="${cover}" alt="${lodge.name}" loading="lazy" width="900" height="600" />
          ${extras
            .map(
              (src) =>
                `<img src="${src}" alt="" loading="lazy" width="600" height="400" />`
            )
            .join('')}
        </div>`
      : `
        <div class="relative aspect-[16/9] overflow-hidden bg-mist">
          <img class="absolute inset-0 h-full w-full object-cover" src="${cover}" alt="${lodge.name}" loading="lazy" width="800" height="450" />
        </div>`;

  return `
    <article class="tour-card flex min-w-0 flex-col border border-ink/10" data-lodge-category="${normalizeLodgeCategory(lodge.category)}">
      ${gallery}
      <div class="flex flex-1 flex-col p-4">
        <p class="font-body text-xs font-bold uppercase tracking-[0.12em] text-gold-deep">${lodgeCategoryLabel(lodge.category)}${lodge.place ? ` · ${lodge.place}` : ''}</p>
        <h3 class="mt-1 font-display text-lg font-semibold text-black">${lodge.name}</h3>
        <p class="mt-2 text-sm leading-relaxed text-ink/70">${lodge.blurb}</p>
        ${lodge.website ? `<a class="card-link mt-3 text-sm font-semibold text-ink" href="${lodge.website}" rel="noopener noreferrer" target="_blank">Property site <span aria-hidden="true">→</span></a>` : ''}
      </div>
    </article>
  `;
}

export function renderAccommodations() {
  const sections = groupedLodges()
    .map((group) => {
      const regions = group.regions
        .map(
          ([region, rows]) => `
            <section class="mt-8 first:mt-6" aria-labelledby="stay-${group.id}-${region.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}">
              <h3 id="stay-${group.id}-${region.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}" class="font-display text-xl font-semibold text-black">${region}</h3>
              <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                ${rows.map(lodgeCard).join('')}
              </div>
            </section>`
        )
        .join('');
      return `
        <section class="mt-12 first:mt-0" aria-labelledby="stay-${group.id}">
          <p class="section-kicker">${group.label}</p>
          <h2 id="stay-${group.id}" class="section-title">${group.label} lodges and camps</h2>
          ${regions}
        </section>`;
    })
    .join('');

  return `
    <main id="main">
      <section class="page-hero relative isolate overflow-hidden text-white" aria-labelledby="stay-hero-title">
        <img class="absolute inset-0 h-full w-full object-cover" src="${accommodationsHero.image}" alt="Safari lodge stay in Tanzania" width="2000" height="900" fetchpriority="high" />
        <div class="absolute inset-0 bg-black/55"></div>
        <div class="container-site relative flex min-h-[11rem] flex-col justify-end py-8 sm:min-h-[13rem] lg:min-h-[14rem]">
          <p class="font-body text-xs font-semibold uppercase tracking-[0.12em] text-white/80">Home <span aria-hidden="true">›</span> Accommodations</p>
          <h1 id="stay-hero-title" class="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Safari lodges and camps</h1>
          <p class="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">We match mid-range, luxury, and premium-luxury lodges to your circuit, season, and budget — confirmed to your dates from Arusha.</p>
        </div>
      </section>
      <section class="bg-mist py-8 sm:py-10">
        <div class="container-site">
          <p class="section-kicker">Where you stay</p>
          <h2 class="section-title">Properties we book on the circuit</h2>
          <p class="mt-3 max-w-2xl text-ink/70">A working list of camps and lodges used on Golden Memories itineraries. Final properties depend on availability and the pace you want.</p>
          ${sections}
          <div class="mt-10">
            <a class="btn-navy !rounded-none" href="/contact/">Ask for lodge options</a>
          </div>
        </div>
      </section>
    </main>
  `;
}
