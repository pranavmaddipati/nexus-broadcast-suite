const fs = require('fs');
const path = require('path');

function processFile(filePath, replacements) {
  const fullPath = path.join(__dirname, 'src', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content;
  
  replacements.forEach(([regex, replacement]) => {
    newContent = newContent.replace(regex, replacement);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Ensure .panel-header is very compact globally
processFile('App.css', [
  [/\.panel-header {[\s\S]*?\}/g, ".panel-header {\n  height: 18px;\n  padding: 0 4px;\n  font-size: 9px;\n}"],
  [/\.nexus-btn {[\s\S]*?\}/g, ".nexus-btn {\n  padding: 2px 6px;\n  font-size: 9px;\n}"],
  [/height: 20px;/g, "height: 16px;"],
]);

// Final global overrides
processFile('index.css', [
  [/font: 11px\/130%/g, 'font: 10px/120%'],
]);

console.log('Pass 3 of scaling applied.');
