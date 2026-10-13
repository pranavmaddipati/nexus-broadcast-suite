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

// 1. index.css
updateFile('index.css', [
  [/:root \{[\s\S]*?--bg: #fff;/m, `:root {
  --header-height: 38px;
  --toolbar-height: 36px;
  --button-height: 34px;
  --small-button-height: 28px;
  --card-height: 96px;
  --icon-size: 16px;
  --font-size: 13px;
  --panel-padding: 10px;
  --panel-gap: 10px;
  --border-radius: 6px;
  --outer-margin: 10px;
  
  --text: #6b6375;
  --text-h: #f8fafc;
  --bg: #0F1623;`],
  [/font: 10px\/120% var\(--sans\);/g, "font: var(--font-size) 'Inter', var(--sans);\n  font-weight: 500;"],
]);

// 2. App.css
updateFile('App.css', [
  [/\.panel-header \{[\s\S]*?\}/m, `.panel-header {
  height: var(--header-height);
  padding: 0 var(--panel-padding);
  font-size: 15px;
  font-weight: 600;
}`],
  [/\.monitor-container \{[\s\S]*?\}/m, `.monitor-container {
  padding: var(--panel-padding);
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}`],
  [/\.monitor-header \{[\s\S]*?\}/m, `.monitor-header {
  padding: 0;
  height: var(--header-height);
}`],
  [/\.nexus-btn \{[\s\S]*?\}/m, `.nexus-btn {
  padding: 0 12px;
  height: var(--small-button-height);
  font-size: var(--font-size);
  font-weight: 600;
  border-radius: 5px;
}`],
]);

// 3. App.tsx (Main Layout)
updateFile('App.tsx', [
  // Outer margin / bg
  ["width: '100vw', height: '100vh', overflow: 'hidden'", "width: '100vw', height: '100vh', overflow: 'hidden', padding: 'var(--outer-margin)', background: 'var(--bg)', gap: 'var(--panel-gap)'"],
  // Top Workspace layout: '15fr 29fr 9fr 29fr 18fr'
  [/gridTemplateColumns: '[^']+'/g, "gridTemplateColumns: '15fr 29fr 9fr 29fr 18fr'"],
  // Top Workspace gap & padding
  ["gap: '1px'", "gap: 'var(--panel-gap)'"],
  ["padding: '2px'", "padding: '0'"],
  ["border: '1px solid #1e293b', borderRadius: '8px'", "border: '1px solid #1e293b', borderRadius: 'var(--border-radius)'"],
  ["border: '1px solid #1e293b', borderRadius: '8px'", "border: '1px solid #1e293b', borderRadius: 'var(--border-radius)'"], // Need to replace all instances
]);
updateFile('App.tsx', [
  [/border: '1px solid #1e293b', borderRadius: '8px'/g, "border: '1px solid #1e293b', borderRadius: 'var(--border-radius)'"],
]);

// 4. PinnedScenes.tsx
updateFile('components/PinnedScenes.tsx', [
  // Card height
  ["height: '60px'", "height: 'var(--card-height)'"],
  ["height: '40px'", "height: '54px'"], // thumbnails 96x54
  ["minHeight: '40px'", "height: '54px'"],
  ["aspectRatio: '16/9'", "width: '96px', height: '54px'"],
  ["padding: '4px'", "padding: 'var(--panel-padding)'"],
  ["padding: '2px'", "padding: 'var(--panel-padding)'"],
  ["gap: '4px'", "gap: 'var(--panel-gap)'"],
  ["gap: '2px'", "gap: '8px'"], // card gap 8px
  // Buttons
  ["fontSize: '9px'", "fontSize: '11px'"],
  ["fontSize: '8px'", "fontSize: '11px'"],
  ["height: '18px'", "height: '26px'"],
  ["width: '18px'", "width: '24px'"], // scene number
  ["size={10}", "size={16}"],
  ["size={12}", "size={16}"],
  // Add Scene
  ["height: '24px'", "height: 'var(--button-height)'"],
]);

// 5. PreviewMonitor.tsx & ProgramMonitor.tsx
updateFile('components/PreviewMonitor.tsx', [
  ["size={12}", "size={16}"],
]);
updateFile('components/ProgramMonitor.tsx', [
  ["size={12}", "size={16}"],
]);

// 6. TransitionControls.tsx
updateFile('components/TransitionControls.tsx', [
  ["height: '28px'", "height: 'var(--button-height)'"],
  ["height: '24px'", "height: '36px'"], // cut/auto
  ["height: '50px'", "height: '48px'"], // big transition
  ["gap: '4px'", "gap: '6px'"],
  ["size={14}", "size={16}"],
  ["size={12}", "size={16}"],
]);

// 7. AudioMixer.tsx
updateFile('components/AudioMixer.tsx', [
  ["width: '45px'", "width: '48px'"], // channel width
  ["width: '50px'", "width: '48px'"],
  ["fontSize: '9px'", "fontSize: '11px'"],
  ["height: '140px'", "height: '200px'"],
  ["height: '100px'", "height: '150px'"],
]);

// 8. Bottom Workspace Shared (SceneLibrary, SourcesPanel, FiltersPanel, StreamSettingsPanel)
const bottomWorkspaceReplacements = [
  [/height: '18px'/g, "height: 'var(--button-height)'"],
  [/height: '20px'/g, "height: 'var(--button-height)'"],
  [/height: '22px'/g, "height: 'var(--button-height)'"],
  [/height: '24px'/g, "height: 'var(--button-height)'"],
  [/height: '26px'/g, "height: 'var(--button-height)'"],
  [/padding: '4px'/g, "padding: 'var(--panel-padding)'"],
  [/padding: '2px'/g, "padding: '8px'"], // some inner padding
  [/gap: '4px'/g, "gap: 'var(--panel-gap)'"],
  [/gap: '2px'/g, "gap: '8px'"],
  [/fontSize: '10px'/g, "fontSize: 'var(--font-size)'"],
  [/size=\{12\}/g, "size={16}"],
  // Scene library thumbnail
  [/minHeight: '40px'/g, "height: '54px'"],
  [/height: '48px'/g, "height: '54px'"],
  [/height: '36px'/g, "height: 'var(--toolbar-height)'"], 
];
updateFile('components/SceneLibrary.tsx', bottomWorkspaceReplacements);
updateFile('components/SourcesPanel.tsx', bottomWorkspaceReplacements);
updateFile('components/FiltersPanel.tsx', bottomWorkspaceReplacements);
updateFile('components/StreamSettingsPanel.tsx', bottomWorkspaceReplacements);
updateFile('components/StreamSettingsPanel.tsx', [
  // Primary buttons
  [/height: 'var\(--button-height\)'/g, "height: '40px'"],
]);

// 9. WorkspaceContainer.tsx (Tabs)
updateFile('components/WorkspaceContainer.tsx', [
  ["padding: '0 2px 0'", "padding: '0 var(--panel-padding) 0'"],
  ["padding: '1px 4px'", "padding: '0 8px'"],
  ["fontSize: '10px'", "fontSize: 'var(--font-size)'"],
  ["size={12}", "size={16}"]
]);

// 10. TopBar & StatusBar
updateFile('components/TopBar.tsx', [
  ["padding: '0 12px'", "padding: '0 16px'"],
  ["gap: '16px'", "gap: '24px'"],
]);
updateFile('components/StatusBar.tsx', [
  ["height: '32px'", "height: '40px'"],
  ["gap: '16px'", "gap: '22px'"],
  ["size={12}", "size={14}"],
]);
updateFile('components/ProductionStatusBar.tsx', [
  ["height: '32px'", "height: '40px'"],
  ["gap: '16px'", "gap: '22px'"],
  ["size={12}", "size={14}"],
]);

console.log('UI rebuilt using concept tokens!');
