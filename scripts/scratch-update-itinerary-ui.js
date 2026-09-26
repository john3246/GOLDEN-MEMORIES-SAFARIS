const fs = require('fs');

const file = 'packages/safari-ui/src/sections/itinerary.js';
let content = fs.readFileSync(file, 'utf8');

const newRenderItinerary = `export function renderItinerary(safari, options = {}) {
  const days = Array.isArray(safari.itinerary) ? safari.itinerary : [];
  if (!days.length && !options.editable) return '';
  const duration = safari.duration_label || (safari.duration ? \`\${safari.duration} Days\` : 'Itinerary');
  const articles = days.map((item, index) => renderDay(item, safari, index, days.length)).join('');
  const isMountain = safari.tour_type === 'mountain';

  const subtitle = isMountain 
    ? 'Daily trekking overview with altitudes, walking durations, and vegetation zones.'
    : 'Each day is paced for game drives, transfers, and a proper night in camp or lodge.';

  return \`
    <section class="bg-black py-5 text-white sm:py-6" aria-labelledby="itinerary-title"\${editAttr(options.editable, 'itinerary')}>
      <div class="container-site">
        <div class="reveal max-w-3xl">
          <p class="section-kicker !text-gold">Itinerary</p>
          <h2 id="itinerary-title" class="section-title !text-white">\${escapeHtml(duration)} - day to day</h2>
          <p class="mt-3 text-white/75">\${subtitle}</p>
        </div>
        <div class="safari-itinerary reveal mt-6">
          \${articles || '<p class="text-white/70">Add itinerary days in the editor.</p>'}
        </div>
      </div>
    </section>
  \`;
}

function renderDay(item, safari, index, total) {
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
  
  const image = resolveDayImage(item, safari, index);
  const activities = Array.isArray(item.activities) ? item.activities.filter(Boolean) : [];
  const last = index === total - 1;

  // Modern Accommodation Preview Card
  const accName = item.accommodation || item.stay || (last ? '' : 'Lodge or camp as confirmed');
  const accImage = item.image || (isMountain ? '/images/icons/camp-tent.svg' : '/images/icons/lodge-bed.svg');
  const accType = isMountain ? 'High-altitude camping or hut' : 'Safari Lodge / Camp';
  
  const accBadge = accName ? \`
    <div class="mt-5 flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4">
      <div class="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/20 bg-black/50">
        <img src="\${escapeHtml(accImage)}" alt="\${escapeHtml(accName)}" class="h-full w-full object-cover" onerror="this.style.display='none'" />
      </div>
      <div>
        <p class="font-display font-semibold text-white">\${escapeHtml(accName)}</p>
        <p class="font-body text-xs text-white/60 uppercase tracking-wide">\${accType}</p>
      </div>
    </div>
  \` : '';

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

function dayFacts(item, safari, index, total) {
  const isMountain = safari.tour_type === 'mountain';
  const last = index === total - 1;
  const mealsDef = last ? 'Breakfast' : 'Breakfast, lunch & dinner';

  if (isMountain) {
    return [
      item.elevation ? ['Elevation', item.elevation] : null,
      item.hiking_time ? ['Walking Time', item.hiking_time] : null,
      item.distance ? ['Distance', item.distance] : null,
      item.vegetation_zone ? ['Vegetation Zone', item.vegetation_zone] : null,
      ['Meals included', item.meals || mealsDef],
    ].filter((row) => row && row[1]);
  }

  // Safari default
  return [
    item.distance ? ['Distance', item.distance] : null,
    item.viewing ? ['Game viewing', item.viewing] : null,
    ['Transport', item.transport || safari.transport_information || '4x4 safari vehicle'],
    ['Meals included', item.meals || mealsDef],
  ].filter((row) => row && row[1]);
}
`;

content = content.replace(/export function renderItinerary[\s\S]*?function dayFacts[\s\S]*?\}\n/, newRenderItinerary);
fs.writeFileSync(file, content);
console.log('Successfully updated itinerary.js');
