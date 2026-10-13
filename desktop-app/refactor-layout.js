const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const shrinkMap = {
  // Gaps
  "gap: '12px'": "gap: '6px'",
  "gap: '8px'": "gap: '4px'",
  "gap: '6px'": "gap: '2px'",
  'gap: "12px"': 'gap: "6px"',
  'gap: "8px"': 'gap: "4px"',
  'gap: "6px"': 'gap: "2px"',
  
  // Padding
  "padding: '16px'": "padding: '8px'",
  "padding: '12px'": "padding: '4px'",
  "padding: '8px'": "padding: '4px'",
  "padding: '6px'": "padding: '2px'",
  "padding: '8px 12px'": "padding: '4px 6px'",
  "padding: '12px 16px'": "padding: '6px 8px'",
  "padding: '6px 10px'": "padding: '2px 4px'",
  "padding: '8px 16px 6px 16px'": "padding: '4px 8px 2px 8px'",
  
  // Heights
  "height: '40px'": "height: '24px'",
  "height: '32px'": "height: '24px'",
  "height: '24px'": "height: '20px'",
  
  // Fonts (Target requested values)
  "fontSize: '11px'": "fontSize: '11px'",
  "fontSize: '10px'": "fontSize: '10px'",
  "fontSize: '14px'": "fontSize: '12px'",
  "fontSize: '16px'": "fontSize: '12px'",
  
  // Icons
  "size={14}": "size={14}",
  "size={16}": "size={14}",
  "size={12}": "size={14}", // Boosted slightly to match the 14/16 request
  "width: '24px'": "width: '16px'",
  "height: '24px'": "height: '16px'",
};

let modifiedFiles = 0;

walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Apply direct string replacements
  for (const [key, value] of Object.entries(shrinkMap)) {
    content = content.split(key).join(value);
  }
  
  // Apply regex for any other raw sizes
  // e.g. padding: '20px' -> 10px
  content = content.replace(/padding:\s*['"](\d+)px['"]/g, (match, p1) => {
    let val = parseInt(p1);
    if (val > 4) val = Math.max(4, Math.floor(val * 0.6));
    return `padding: '${val}px'`;
  });
  
  content = content.replace(/gap:\s*['"](\d+)px['"]/g, (match, p1) => {
    let val = parseInt(p1);
    if (val > 2) val = Math.max(2, Math.floor(val * 0.5));
    return `gap: '${val}px'`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    modifiedFiles++;
    console.log(`Updated layout values in: ${path.basename(filePath)}`);
  }
});

console.log(`Global scale-down complete. Modified ${modifiedFiles} files.`);
