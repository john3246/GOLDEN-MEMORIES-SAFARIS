const fs = require('fs');
const file = 'apps/website-com/src/pages/destinations/detail.js';
let content = fs.readFileSync(file, 'utf8');

const newOverview = `      <section class="bg-gold py-3 sm:py-4" id="overview" aria-labelledby="dest-about-title">
        <div class="container-site">
          <div class="grid items-stretch overflow-hidden bg-white lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.85fr)]">
            <div class="flex h-full flex-col p-5 sm:p-7 lg:p-8 reveal">
              <p class="section-kicker">About this destination</p>
              <h2 id="dest-about-title" class="section-title">Overview &amp; Highlights</h2>
              \${
                place.blocks?.length
                  ? renderDestinationBlocks(place.blocks)
                  : (place.paragraphs || []).map((p) => \\\`<p class="mt-5 font-body text-base leading-relaxed text-ink/75">\${p}</p>\\\`).join('')
              }
            </div>
            <aside class="safari-aside border-t border-black/10 lg:border-l lg:border-t-0 dest-sticky-cta reveal">
              <p class="section-kicker">Plan a custom safari</p>
              <h2 class="font-display text-2xl font-semibold text-black">Ask the Arusha team</h2>
              <dl class="mt-6 space-y-3 font-body text-sm">\${facts}</dl>
              <p class="mt-6 text-sm text-ink/70"><span class="font-bold text-black">Location. </span>\${place.location}</p>
              <a class="btn-navy mt-8 w-full !rounded-none" href="/contact/">Plan a custom safari</a>
              <p class="mt-3 text-center text-xs text-ink/55">Nights, lodges, and park order, matched to your dates.</p>
            </aside>
          </div>
        </div>
      </section>`;

content = content.replace(/<section class="bg-gold py-8 sm:py-10" id="overview" aria-labelledby="dest-about-title">[\s\S]*?<\/section>/, newOverview);

fs.writeFileSync(file, content);
console.log('Updated destinations/detail.js overview layout');
