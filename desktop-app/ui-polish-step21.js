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

// Global tokens and aggressive scaling
processFile('index.css', [
  [/--panel-padding: 8px;/g, '--panel-padding: 4px;'],
  [/--panel-spacing: 6px;/g, '--panel-spacing: 2px;'],
  [/--internal-spacing: 4px;/g, '--internal-spacing: 2px;'],
  [/--global-radius: 4px;/g, '--global-radius: 2px;'],
]);

processFile('components/PinnedScenes.tsx', [
  [/height: '90px'/g, "height: '60px'"],
  [/height: '64px'/g, "height: '40px'"], // thumbnails
  [/minHeight: '60px'/g, "minHeight: '40px'"], // thumbnails
  [/fontSize: '10px'/g, "fontSize: '9px'"],
  [/fontSize: '9px'/g, "fontSize: '8px'"],
]);

// SceneLibrary specific fixes for padding, gaps, etc.
processFile('components/SceneLibrary.tsx', [
  [/padding: '9px'/g, "padding: '4px'"],
  [/padding: '19px'/g, "padding: '8px'"],
  [/minmax\(220px, 1fr\)/g, "minmax(140px, 1fr)"], // make cards smaller so they fit
  [/height: '24px'/g, "height: '18px'"],
  [/height: '68px'/g, "height: '40px'"], // folder row height
]);

processFile('components/SourcesPanel.tsx', [
  [/padding: '9px'/g, "padding: '4px'"],
  [/padding: '19px'/g, "padding: '8px'"],
  [/height: '24px'/g, "height: '18px'"],
]);

processFile('components/FiltersPanel.tsx', [
  [/padding: '9px'/g, "padding: '4px'"],
  [/padding: '19px'/g, "padding: '8px'"],
  [/height: '24px'/g, "height: '18px'"],
]);

processFile('components/WorkspaceContainer.tsx', [
  [/padding: '2px 4px 0'/g, "padding: '0 2px 0'"],
  [/padding: '2px 6px 1px 6px'/g, "padding: '1px 4px'"],
]);

processFile('App.tsx', [
  // Top Workspace layout: '17fr 30fr 9fr 30fr 14fr' -> transition narrower, extra space to monitors
  [/gridTemplateColumns: '17fr 30fr 9fr 30fr 14fr'/g, "gridTemplateColumns: '16fr 32fr 8fr 32fr 12fr'"],
]);

console.log('Pass 2 of scaling applied.');
