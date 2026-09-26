const fs = require('fs');

const file = 'apps/cms/src/pages/editor.js';
let content = fs.readFileSync(file, 'utf8');

// 1. UPDATE itineraryEditor
const oldItinMatch = content.match(/function itineraryEditor\(days\) \{([\s\S]*?)\} \n\s*function renderFields/);
if (oldItinMatch) {
  const newItin = `function itineraryEditor(days, tourType = 'safari') {
  const isMountain = tourType === 'mountain';
  const blocks = (days || [])
    .map(
      (day, index) => \`
      <article class="cms-day" data-day-index="\${index}">
        <div class="cms-day-head">
          <strong>\${escapeValue(day.day || \\\`Day \${index + 1}\\\`)}</strong>
          <span class="cms-editor-actions">
            <button class="cms-btn" type="button" data-day-dup>Duplicate</button>
            <button class="cms-btn cms-btn-danger" type="button" data-day-del>Remove</button>
          </span>
        </div>
        <div class="cms-grid-2">
          \${field('Day label', \\\`day.\${index}.day\\\`, day.day)}
          \${field('Title', \\\`day.\${index}.title\\\`, day.title)}
        </div>
        \${isMountain 
          ? \\\`
            <div class="cms-grid-2">
              \${field('Elevation', \\\`day.\${index}.elevation\\\`, day.elevation, 'text', 'e.g., 1,640m to 2,743m')}
              \${field('Hiking time', \\\`day.\${index}.hiking_time\\\`, day.hiking_time, 'text', 'e.g., 4-5 hours')}
            </div>
            <div class="cms-grid-2">
              \${field('Vegetation zone', \\\`day.\${index}.vegetation_zone\\\`, day.vegetation_zone, 'text', 'e.g., Montane Rainforest')}
              \${field('Distance', \\\`day.\${index}.distance\\\`, day.distance, 'text', 'e.g., 10 km')}
            </div>
            \${field('Terrain / Highlights', \\\`day.\${index}.terrain\\\`, day.terrain)}
            \`
          : \\\`
            <div class="cms-grid-2">
              \${field('Game viewing', \\\`day.\${index}.viewing\\\`, day.viewing)}
              \${field('Transport', \\\`day.\${index}.transport\\\`, day.transport)}
            </div>
            \${field('Distance', \\\`day.\${index}.distance\\\`, day.distance, 'text', 'e.g., 140 km')}
            \`
        }
        <div class="cms-grid-2">
          \${field('Meals', \\\`day.\${index}.meals\\\`, day.meals)}
          \${field('Accommodation', \\\`day.\${index}.accommodation\\\`, day.accommodation)}
        </div>
        \${imageField('Accommodation Thumbnail', \\\`day.\${index}.image\\\`, day.image)}
        \${field('Activities (one per line)', \\\`day.\${index}.activities\\\`, (day.activities || []).join('\\\\n'), 'textarea')}
        \${field('Description', \\\`day.\${index}.description\\\`, day.description, 'textarea')}
      </article>\`
    )
    .join('');
  return \`<p class="cms-hint">Add one itinerary day for each duration day, and give every day a title.</p><button class="cms-btn cms-btn-navy" type="button" data-add-day>Add itinerary day</button>\${blocks}\`;
}

function renderFields`;
  content = content.replace(oldItinMatch[0], newItin);
} else {
  console.log("Could not find itineraryEditor");
}

// 2. UPDATE renderFields to include tour_type and pass it to itineraryEditor
content = content.replace(
  /\$\{field\('Duration \(days\)', 'duration', doc\.duration, 'number', 'Must match the number of itinerary days\.'\)\}/,
  `
          <div class="cms-field">
            <label class="cms-label" for="tour_type">Tour type</label>
            <select id="tour_type" name="tour_type" class="cms-input" style="background:#fff; border:1px solid #ccc; padding:0.4rem; width:100%; border-radius:4px;">
              <option value="safari" \${doc.tour_type !== 'mountain' ? 'selected' : ''}>Safari / Game Drive</option>
              <option value="mountain" \${doc.tour_type === 'mountain' ? 'selected' : ''}>Mountain Trekking</option>
            </select>
          </div>
          \${field('Duration (days)', 'duration', doc.duration, 'number', 'Must match the number of itinerary days.')}`
);

content = content.replace(
  /\$\{group\('Itinerary', itineraryEditor\(doc\.itinerary\), true\)\}/,
  `\${group('Itinerary', itineraryEditor(doc.itinerary, doc.tour_type), true)}`
);

// 3. UPDATE collect(form, current) to collect new itinerary fields and tour_type
const oldCollectMatch = content.match(/function collect\(form, current\) \{([\s\S]*?)const sectionRows/);
if (oldCollectMatch) {
  const newCollect = `function collect(form, current) {
  const days = [];
  (current.itinerary || []).forEach((_day, index) => {
    days.push({
      id: current.itinerary[index]?.id,
      day: form[\`day.\${index}.day\`]?.value,
      title: form[\`day.\${index}.title\`]?.value,
      description: form[\`day.\${index}.description\`]?.value,
      activities: readList(form, \`day.\${index}.activities\`),
      accommodation: form[\`day.\${index}.accommodation\`]?.value,
      meals: form[\`day.\${index}.meals\`]?.value,
      image: form[\`day.\${index}.image\`]?.value,
      transport: form[\`day.\${index}.transport\`]?.value,
      distance: form[\`day.\${index}.distance\`]?.value,
      viewing: form[\`day.\${index}.viewing\`]?.value,
      elevation: form[\`day.\${index}.elevation\`]?.value,
      hiking_time: form[\`day.\${index}.hiking_time\`]?.value,
      vegetation_zone: form[\`day.\${index}.vegetation_zone\`]?.value,
      terrain: form[\`day.\${index}.terrain\`]?.value,
    });
  });

  const sectionRows`;
  content = content.replace(oldCollectMatch[0], newCollect);
} else {
  console.log("Could not find collect()");
}

// Add tour_type to return object of collect
content = content.replace(
  /return \{\n\s+title: safariPackageTitle\(form\.title\?\.value\),/,
  `return {\n      title: safariPackageTitle(form.title?.value),\n      tour_type: form.tour_type?.value,`
);

fs.writeFileSync(file, content);
console.log('Successfully updated editor.js');
