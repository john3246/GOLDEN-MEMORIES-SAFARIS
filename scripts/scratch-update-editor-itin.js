const fs = require('fs');

const file = 'apps/cms/src/pages/editor.js';
let content = fs.readFileSync(file, 'utf8');

const oldCodeStart = content.indexOf('function itineraryEditor(days) {');
const oldCodeEnd = content.indexOf('function renderFields');

if (oldCodeStart !== -1 && oldCodeEnd !== -1) {
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

`;
  
  content = content.substring(0, oldCodeStart) + newItin + content.substring(oldCodeEnd);
  fs.writeFileSync(file, content);
  console.log('Successfully updated itineraryEditor');
} else {
  console.log("Could not find start/end", oldCodeStart, oldCodeEnd);
}
