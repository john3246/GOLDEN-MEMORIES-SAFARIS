const fs = require('fs');

const file = 'apps/cms/src/pages/editor.js';
let content = fs.readFileSync(file, 'utf8');

// Update imageField for Accommodation image
content = content.replace(
  /\$\{imageField\('Accommodation Thumbnail', `day\.\$\{index\}\.image`, day\.image\)\}/g,
  `\${imageField('Accommodation Image', \`day.\${index}.accommodation_image\`, day.accommodation_image)}`
);

// Update collect function to capture accommodation_image instead of image
content = content.replace(
  /image: form\[`day\.\$\{index\}\.image`\]\?\.value,/g,
  `accommodation_image: form[\`day.\${index}.accommodation_image\`]?.value,`
);

fs.writeFileSync(file, content);
console.log('Updated editor.js for accommodation_image');
