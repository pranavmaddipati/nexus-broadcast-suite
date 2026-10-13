const fs = require('fs');
const path = require('path');

function replaceAll(str, mapObj) {
  const re = new RegExp(Object.keys(mapObj).join('|'), 'gi');
  return str.replace(re, function (matched) {
    return mapObj[matched.toLowerCase()] || mapObj[matched];
  });
}

function updateFile(filePath, replacements) {
  const fullPath = path.join(__dirname, 'src', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content;

  for (const [search, replace] of replacements) {
    newContent = newContent.split(search).join(replace);
  }

  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function patchRegex(filePath, regex, replacement) {
  const fullPath = path.join(__dirname, 'src', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content.replace(regex, replacement);

  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Patched regex in: ${filePath}`);
  }
}

// 1. App.tsx - Adjust layout grid and widths
updateFile('App.tsx', [
  // Top Workspace layout: '16fr 28fr 11fr 28fr 17fr' -> transition narrower, extra space to monitors
  ["gridTemplateColumns: '16fr 28fr 11fr 28fr 17fr'", "gridTemplateColumns: '17fr 30fr 9fr 30fr 14fr'"],
  // Pinned scenes / Panel containers padding/gap reduction
  ["gap: '2px'", "gap: '1px'"],
  ["padding: '4px 6px'", "padding: '2px'"],
  ["border: '1px solid #1e293b'", "border: '1px solid #1e293b'"], // Keep border, but we reduce padding inside
  // Scene Mixer
  ["fontSize: '11px'", "fontSize: '10px'"],
  ["padding: '2px 4px'", "padding: '1px 2px'"],
  ["margin: 16px 0", "margin: 8px 0"],
  ["margin: 0 0 8px", "margin: 0 0 4px"],
]);

// 2. index.css - Global tokens
updateFile('index.css', [
  ["--panel-padding: 16px;", "--panel-padding: 8px;"],
  ["--panel-spacing: 12px;", "--panel-spacing: 6px;"],
  ["--internal-spacing: 8px;", "--internal-spacing: 4px;"],
  ["font: 12px/145%", "font: 11px/130%"],
]);

// 3. PinnedScenes.tsx - Reduce card height, thumbnail height, etc.
updateFile('components/PinnedScenes.tsx', [
  ["height: '140px'", "height: '90px'"],
  ["height: '110px'", "height: '64px'"], // thumbnails
  ["padding: '8px'", "padding: '4px'"],
  ["padding: '6px'", "padding: '2px'"],
  ["gap: '8px'", "gap: '4px'"],
  ["gap: '6px'", "gap: '2px'"],
  ["gap: '4px'", "gap: '2px'"],
  ["marginBottom: '8px'", "marginBottom: '4px'"],
  ["fontSize: '11px'", "fontSize: '10px'"],
  ["fontSize: '10px'", "fontSize: '9px'"],
  ["padding: '4px 8px'", "padding: '2px 4px'"],
  ["height: '24px'", "height: '18px'"],
  ["width: '24px'", "width: '18px'"],
  ["size={14}", "size={12}"],
  ["size={12}", "size={10}"],
]);

// 4. PreviewMonitor.tsx / ProgramMonitor.tsx / App.css monitor styles
updateFile('App.css', [
  [".monitor-container {", ".monitor-container {\n  padding: 0px;\n  margin: 0px;\n"],
  [".monitor-header {", ".monitor-header {\n  padding: 2px 4px;\n  height: 20px;\n"],
  [".monitor-screen {", ".monitor-screen {\n  border-width: 1px;\n  margin: 0;\n  padding: 0;\n"],
  // Toolbar heights everywhere
  [".panel-header {", ".panel-header {\n  height: 22px;\n  padding: 0 4px;\n  font-size: 10px;\n"],
]);

// 5. TransitionControls.tsx - reduce button height, spacing
updateFile('components/TransitionControls.tsx', [
  ["gap: '8px'", "gap: '4px'"],
  ["padding: '8px'", "padding: '4px'"],
  ["padding: '12px'", "padding: '6px'"],
  ["padding: '16px'", "padding: '8px'"],
  ["height: '40px'", "height: '28px'"],
  ["height: '32px'", "height: '24px'"],
  ["height: '80px'", "height: '50px'"], // big transition button
  ["fontSize: '14px'", "fontSize: '11px'"],
  ["fontSize: '13px'", "fontSize: '11px'"],
  ["fontSize: '12px'", "fontSize: '10px'"],
  ["fontSize: '11px'", "fontSize: '10px'"],
  ["size={16}", "size={14}"],
  ["size={14}", "size={12}"],
]);

// 6. AudioMixer.tsx - reduce channel width, header, spacing
updateFile('components/AudioMixer.tsx', [
  ["width: '60px'", "width: '45px'"], // channel width
  ["width: '70px'", "width: '50px'"],
  ["gap: '8px'", "gap: '2px'"],
  ["gap: '4px'", "gap: '2px'"],
  ["padding: '8px'", "padding: '4px'"],
  ["padding: '4px'", "padding: '2px'"],
  ["height: '200px'", "height: '140px'"], // fader height
  ["height: '150px'", "height: '100px'"],
  ["fontSize: '11px'", "fontSize: '9px'"],
  ["fontSize: '10px'", "fontSize: '9px'"],
]);

// 7. Bottom Workspace: SceneLibrary, SourcesPanel, FiltersPanel, StreamSettingsPanel
const bottomWorkspaceReplacements = [
  ["height: '32px'", "height: '22px'"],
  ["height: '28px'", "height: '20px'"],
  ["padding: '8px'", "padding: '4px'"],
  ["padding: '6px'", "padding: '2px'"],
  ["padding: '4px'", "padding: '2px'"],
  ["gap: '8px'", "gap: '4px'"],
  ["gap: '6px'", "gap: '2px'"],
  ["gap: '4px'", "gap: '2px'"],
  ["fontSize: '12px'", "fontSize: '10px'"],
  ["fontSize: '11px'", "fontSize: '10px'"],
  ["size={16}", "size={12}"],
  ["size={14}", "size={12}"],
  ["height: '36px'", "height: '24px'"],
  ["height: '40px'", "height: '26px'"],
  // Specific for Scene Library thumbnails / rows
  ["minHeight: '80px'", "minHeight: '40px'"],
  ["height: '90px'", "height: '48px'"],
  ["height: '60px'", "height: '36px'"], 
];

updateFile('components/SceneLibrary.tsx', bottomWorkspaceReplacements);
updateFile('components/SourcesPanel.tsx', bottomWorkspaceReplacements);
updateFile('components/FiltersPanel.tsx', bottomWorkspaceReplacements);
updateFile('components/StreamSettingsPanel.tsx', bottomWorkspaceReplacements);
updateFile('components/WorkspaceContainer.tsx', [
  ["padding: '4px 8px 0'", "padding: '2px 4px 0'"],
  ["padding: '4px 8px 2px 8px'", "padding: '2px 6px 1px 6px'"],
  ["fontSize: '11px'", "fontSize: '10px'"],
  ["size={14}", "size={12}"]
]);

// 8. PanelHeader.tsx - Reduce header height globally
updateFile('components/PanelHeader.tsx', [
  ["padding: '6px 12px'", "padding: '2px 8px'"],
  ["padding: '4px 8px'", "padding: '2px 8px'"],
  ["height: '28px'", "height: '20px'"],
  ["fontSize: '12px'", "fontSize: '10px'"],
  ["fontSize: '11px'", "fontSize: '10px'"],
]);

// 9. App.tsx (further cleanup)
patchRegex('App.tsx', /gridTemplateColumns: '[^']+'/, "gridTemplateColumns: '17fr 30fr 9fr 30fr 14fr'");

console.log('UI Proportions update applied.');
