const fs = require('fs');

const file = 'apps/cms/src/pages/editor.js';
let content = fs.readFileSync(file, 'utf8');

// Put back day.image next to accommodation_image
content = content.replace(
  /\$\{imageField\('Accommodation Image', `day\.\$\{index\}\.accommodation_image`, day\.accommodation_image\)\}/g,
  `\${imageField('Day photo', \`day.\${index}.image\`, day.image)}
        \${imageField('Accommodation Image', \`day.\${index}.accommodation_image\`, day.accommodation_image)}`
);

// Collect both
content = content.replace(
  /accommodation_image: form\[`day\.\$\{index\}\.accommodation_image`\]\?\.value,/g,
  `image: form[\`day.\${index}.image\`]?.value,
      accommodation_image: form[\`day.\${index}.accommodation_image\`]?.value,`
);

fs.writeFileSync(file, content);
console.log('Restored day.image to editor.js');
