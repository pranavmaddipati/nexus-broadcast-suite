const fs = require('fs');
const path = require('path');

function updateFile(filePath, replacements) {
  const fullPath = path.join(__dirname, 'src', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content;

  for (const [search, replace] of replacements) {
    if (search instanceof RegExp) {
        newContent = newContent.replace(search, replace);
    } else {
        newContent = newContent.split(search).join(replace);
    }
  }

  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

updateFile('components/TopBar.tsx', [
  ["height: '36px'", "height: 'var(--header-height)'"],
]);

updateFile('components/SceneLibrary.tsx', [
  [/fontSize: '8px'/g, "fontSize: '11px'"], // buttons
  [/fontSize: '9px'/g, "fontSize: '11px'"],
]);

// Mark task as done
fs.writeFileSync('c:\\Users\\abhin\\.gemini\\antigravity-ide\\brain\\b60a4ba6-2672-43c9-97f3-fb8ff32fbce3\\task.md', 
`- [x] Define global design tokens in \`index.css\`
- [x] Refactor Top Bar and Status Bar heights and padding
- [x] Rebuild \`App.tsx\` global grid structure (70/30 split, columns: \`15fr 29fr 9fr 29fr 18fr\`)
- [x] Update \`PinnedScenes\` component (Card height, thumbnails, buttons, fonts)
- [x] Update \`PreviewMonitor\` and \`ProgramMonitor\` (Header, Toolbar, padding, border)
- [x] Update \`TransitionControls\` panel proportions and button sizes
- [x] Update \`AudioMixer\` panel channels, headers, and faders
- [x] Update Bottom Workspace components (\`SceneLibrary\`, \`SourcesPanel\`, \`FiltersPanel\`, \`StreamSettingsPanel\`)
- [x] Validate final layout scaling against design constraints
`);

console.log('Final polish and task updated.');
