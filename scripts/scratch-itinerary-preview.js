const fs = require('fs');

const file = 'packages/safari-ui/src/sections/itinerary.js';
let content = fs.readFileSync(file, 'utf8');

// I will extract everything between `function renderDay(item, safari, index, total) {` and `function dayFacts` and rewrite it.
const renderDayRegex = /function renderDay\(item, safari, index, total\) \{[\s\S]*?function dayFacts/m;

const newRenderDay = `function renderDay(item, safari, index, total) {
  const isMountain = safari.tour_type === 'mountain';
  const facts = dayFacts(item, safari, index, total)
    .map(
      ([label, value]) => \`
        <div>
          <dt>\${escapeHtml(label)}</dt>
          <dd>\${escapeHtml(value)}</dd>
        </div>
      \`
    )
    .join('');
  
  // Note: resolveDayImage resolves the main side-by-side day illustration/image, not the accommodation image.
  const image = resolveDayImage(item, safari, index);
  const activities = Array.isArray(item.activities) ? item.activities.filter(Boolean) : [];
  const last = index === total - 1;

  // Modern Accommodation Preview Card (replaces the old accBadge)
  const accName = item.accommodation || item.stay || (last ? '' : 'Lodge or camp as confirmed');
  // Bind to accommodation_image from CMS
  const accImage = item.accommodation_image || null;
  const accType = isMountain ? 'Mountain Campsite' : 'Safari Lodge / Camp';
  
  let accBadge = '';
  if (accName) {
    if (accImage) {
      accBadge = \`
        <div class="mt-6 w-full h-44 md:h-52 rounded-xl overflow-hidden border border-white/10 relative group">
          <img src="\${escapeHtml(accImage)}" alt="\${escapeHtml(accName)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
            <p class="font-display font-semibold text-white text-lg">\${escapeHtml(accName)}</p>
            <p class="font-body text-xs text-gold uppercase tracking-wide">\${accType}</p>
          </div>
        </div>
      \`;
    } else {
      // Fallback styled banner
      const fallbackIcon = isMountain ? '/images/icons/camp-tent.svg' : '/images/icons/lodge-bed.svg';
      accBadge = \`
        <div class="mt-6 w-full rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4">
          <div class="h-12 w-12 shrink-0 flex items-center justify-center rounded-full border border-white/20 bg-black/50 p-2">
            <img src="\${escapeHtml(fallbackIcon)}" alt="" class="h-8 w-8 object-contain opacity-70" />
          </div>
          <div>
            <p class="font-display font-semibold text-white text-lg">\${escapeHtml(accName)}</p>
            <p class="font-body text-xs text-white/50 uppercase tracking-wide">\${accType}</p>
          </div>
        </div>
      \`;
    }
  }

  return \`
    <article class="safari-day">
      \${
        image
          ? \`<div class="safari-day-media"><img src="\${escapeHtml(image)}" alt="\${escapeHtml(item.title || '')}" loading="lazy" width="900" height="680" /></div>\`
          : ''
      }
      <div class="safari-day-copy">
        <p class="safari-day-label">\${escapeHtml(item.day || \`Day \${index + 1}\`)}</p>
        <h3 class="safari-day-title">\${escapeHtml(item.title || '')}</h3>
        <p class="safari-day-body">\${escapeHtml(item.description || item.body || '')}</p>
        \${
          activities.length
            ? \`<ul class="mt-4 list-disc space-y-1 pl-5 text-sm text-white/80">\${activities
                .map((activity) => \`<li>\${escapeHtml(activity)}</li>\`)
                .join('')}</ul>\`
            : ''
        }
        \${facts ? \`<dl class="safari-day-facts">\${facts}</dl>\` : ''}
        \${accBadge}
      </div>
    </article>
  \`;
}

function dayFacts`;

content = content.replace(renderDayRegex, newRenderDay);
fs.writeFileSync(file, content);
console.log('Updated renderDay in safari-ui/sections/itinerary.js');
