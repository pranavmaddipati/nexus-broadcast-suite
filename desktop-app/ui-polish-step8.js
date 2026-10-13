const fs = require('fs');

function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

// 1. Move bottom workspace upward by reducing top-workspace flex from 73 to 60 (13% reduction)
replaceInFile('src/App.tsx', /flex: '73'/, "flex: '60'");
replaceInFile('src/App.tsx', /flex: '27'/, "flex: '40'");

// 2. Reduce top header height slightly in both monitors
// In ProgramMonitor.tsx
replaceInFile('src/components/ProgramMonitor.tsx', 
  /height: '24px'/, 
  "height: '20px'");
// In PreviewMonitor.tsx
replaceInFile('src/components/PreviewMonitor.tsx', 
  /height: '24px'/, 
  "height: '20px'");

// 3. Reduce bottom control bar height in ProgramMonitor
replaceInFile('src/components/ProgramMonitor.tsx', 
  /padding: '2px 6px'/g, 
  "padding: '1px 4px'");
replaceInFile('src/components/ProgramMonitor.tsx', 
  /padding: '2px 4px'/, 
  "padding: '1px 3px'");
replaceInFile('src/components/ProgramMonitor.tsx', 
  /bottom: '4px'/, 
  "bottom: '2px'");

console.log('UI Polish Step 8 applied.');
