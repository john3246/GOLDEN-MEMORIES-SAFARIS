const fs = require('fs');
const file = 'apps/website-com/src/pages/join-safari/detail.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the <section class="bg-gold ...> up to </section> for overview with the standardized layout
const newOverview = `      <section class="bg-gold py-3 sm:py-4" aria-labelledby="join-overview-title">
        <div class="container-site">
          <div class="grid items-stretch overflow-hidden bg-white lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.85fr)]">
            <div class="flex h-full flex-col p-5 sm:p-7 lg:p-8 reveal">
              <p class="section-kicker">Overview</p>
              <h2 id="join-overview-title" class="section-title">About this itinerary</h2>
              <p class="mt-4 font-body text-base leading-relaxed text-ink/75">\${pkg.overview}</p>
            </div>
            <aside class="safari-aside border-t border-black/10 lg:border-l lg:border-t-0 reveal">
              <p class="section-kicker">At a glance</p>
              <h2 class="font-display text-2xl font-semibold text-black">Join this group</h2>
              <dl class="mt-5 space-y-3 font-body text-sm">
                <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                  <dt class="text-ink/55">Duration</dt>
                  <dd class="text-right font-bold text-black">\${pkg.duration}</dd>
                </div>
                \${
                  pkg.places
                    ? \\\`
                  <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                    <dt class="text-ink/55">Places</dt>
                    <dd class="text-right font-bold text-black">\${pkg.places}</dd>
                  </div>
                \\\`
                    : ''
                }
                <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                  <dt class="text-ink/55">Spaces</dt>
                  <dd class="text-right font-bold text-black">\${pkg.spaces || 'Shared vehicle / Lodge nights'}</dd>
                </div>
                \${
                  price
                    ? \\\`
                  <div class="flex justify-between gap-4 border-b border-black/10 pb-3">
                    <dt class="text-ink/55">Price per person</dt>
                    <dd class="text-right font-bold text-black">\${price.perPerson}</dd>
                  </div>
                \\\`
                    : ''
                }
              </dl>
              <div class="mt-auto pt-5">
                <a class="btn-navy w-full !rounded-none" href="\${book}">Book this safari</a>
              </div>
            </aside>
          </div>
        </div>
      </section>`;

content = content.replace(/<section class="bg-gold py-8 sm:py-10" aria-labelledby="join-overview-title">[\s\S]*?<\/section>/, newOverview);

fs.writeFileSync(file, content);
console.log('Updated join-safari/detail.js overview layout');
