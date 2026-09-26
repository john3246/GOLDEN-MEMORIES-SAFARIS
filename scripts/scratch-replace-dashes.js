const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFiles() {
  const dirs = [
    'apps/website-com/src/pages',
    'apps/api/src/modules/content'
  ];

  dirs.forEach(dir => {
    walkDir(dir, (filePath) => {
      if (!filePath.endsWith('.js')) return;

      let content = fs.readFileSync(filePath, 'utf8');
      
      // We want to replace " - ", " — ", " – " (with surrounding spaces) 
      // with ", " in string literals and template literals.
      // To be safe and not break JS/HTML, we do a global replace but carefully check if it breaks logic.
      // Since it's mostly copy, " - " replacing with ", " is almost always safe in JS files 
      // containing React/HTML templates, as long as it's not part of an arithmetic operation like `a - b`.
      // Let's refine the regex: replace space-dash-space with comma-space ONLY if it's followed by a letter or number.
      // Also exclude HTML comments: <!--
      
      let newContent = content.split('\n').map(line => {
        // Skip lines that look like math or JS logic if they don't have quotes/text
        // Actually, replacing in copy:
        // A simple regex: \s+[-—–]\s+ replaced with ", "
        // Let's exclude lines containing HTML comments just in case
        if (line.includes('<!--') || line.includes('-->')) return line;
        
        // Exclude lines that are clearly math or array manipulations (e.g. `idx - 1`)
        if (line.match(/\b\w+\s+-\s+\d+\b/)) return line;
        if (line.match(/\b\d+\s+-\s+\d+\b/)) return line;

        // Replace em-dash, en-dash, hyphen surrounded by spaces
        return line.replace(/(\w|\b)\s+[-—–]\s+(?=[A-Za-z])/g, '$1, ');
      }).join('\n');

      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated dashes in ${filePath}`);
      }
    });
  });
}

processFiles();
