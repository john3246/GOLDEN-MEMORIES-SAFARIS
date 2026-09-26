const fs = require('fs');
let file = 'apps/api/src/modules/safaris/safaris.validation.js';
let content = fs.readFileSync(file, 'utf8');

// Add tour_type to WRITABLE_FIELDS
content = content.replace(/'title',\s+'slug',/, "'title',\n  'tour_type',\n  'slug',");

// Add tour_type to validateSafariPayload
content = content.replace(/(if \(!partial \|\| input\.title !== undefined\) \{[\s\S]*?\})/, `$1\n  if (input.tour_type !== undefined) {\n    next.tour_type = fail(validateOptionalString(input.tour_type, 'tour_type', 40)) || 'safari';\n  }`);

fs.writeFileSync(file, content);
console.log('Validation updated.');
