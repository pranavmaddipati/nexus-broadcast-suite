const fs = require('fs');
const path = require('path');

const applyReplacements = (filepath, replacements) => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });
    if (content !== original) {
      fs.writeFileSync(filepath, content);
      console.log(`Updated ${path.basename(filepath)}`);
    }
  } catch (e) {
    console.error(`Failed on ${filepath}:`, e.message);
  }
};

const srcDir = path.join(__dirname, 'src');

// 1. index.css - Desktop Colors
applyReplacements(path.join(srcDir, 'index.css'), [
  { search: /--bg-main: .*/g, replace: '--bg-main: #090C14;' },
  { search: /--bg-panel: .*/g, replace: '--bg-panel: #111827;' },
  { search: /--bg-card: .*/g, replace: '--bg-card: #1A2435;' },
  { search: /--border-color: .*/g, replace: '--border-color: rgba(255, 255, 255, 0.06);' },
  { search: /--text-secondary: .*/g, replace: '--text-secondary: #A8B2C9;' }
]);

// 2. QuickActionsPanel.tsx - Destroy web tiles, use native desktop buttons
let qaContent = fs.readFileSync(path.join(srcDir, 'components/QuickActionsPanel.tsx'), 'utf8');
// Change grid from 3 columns to 1 column list of 34px buttons or 2 columns
qaContent = qaContent.replace(/gridTemplateColumns: 'repeat\(3, 1fr\)'/g, "gridTemplateColumns: 'repeat(2, 1fr)'");
qaContent = qaContent.replace(/gridTemplateColumns: '1fr 1fr 1fr'/g, "gridTemplateColumns: '1fr 1fr'");
// Button styles
qaContent = qaContent.replace(/flexDirection: 'column'/g, "flexDirection: 'row'");
qaContent = qaContent.replace(/height: '48px'/g, "height: '34px'");
qaContent = qaContent.replace(/height: '40px'/g, "height: '34px'");
qaContent = qaContent.replace(/gap: '8px'/g, "gap: '6px'"); // tighter gap between icon and text
qaContent = qaContent.replace(/justifyContent: 'center'/g, "justifyContent: 'flex-start'");
qaContent = qaContent.replace(/padding: '8px'/g, "padding: '0 12px'"); // side padding for row layout
// Remove color from Quick Actions, make them all bg-card
qaContent = qaContent.replace(/background: action\.bg,/g, "background: 'var(--bg-card)',");
qaContent = qaContent.replace(/color: '#fff'/g, "color: 'var(--text-primary)'");
fs.writeFileSync(path.join(srcDir, 'components/QuickActionsPanel.tsx'), qaContent);

// 3. TransitionControls.tsx - 34px hardware buttons
let tcContent = fs.readFileSync(path.join(srcDir, 'components/TransitionControls.tsx'), 'utf8');
tcContent = tcContent.replace(/height: '18px'/g, "height: '24px'"); // Buttons slightly taller to match desktop
// Strip colors
tcContent = tcContent.replace(/background: action\.name === 'STINGER' \? '#FF4D5A' : 'var\(--bg-card\)'/g, "background: 'var(--bg-card)'");
tcContent = tcContent.replace(/color: '#fff'/g, "color: 'var(--text-primary)'");
// Use #2E4D7A for active transition
tcContent = tcContent.replace(/border: isActive \? '2px solid #fff' : '2px solid transparent'/g, "border: '1px solid var(--border-color)', background: isActive ? '#2E4D7A' : 'var(--bg-card)'");
fs.writeFileSync(path.join(srcDir, 'components/TransitionControls.tsx'), tcContent);

// 4. Monitors - Shrink footer, make AUD/PVW/PGM dark
const fixMonitor = (file) => {
  let content = fs.readFileSync(path.join(srcDir, 'components', file), 'utf8');
  content = content.replace(/height: '24px',\s*display: 'flex'/g, "height: '34px', display: 'flex'"); // bottom toolbar 34px
  // Remove solid green/red from AUD PVW PGM buttons
  content = content.replace(/background: 'var\(--bg-card\)'/g, "background: '#1A2435'");
  content = content.replace(/background: '#21D07A'/g, "background: '#1A2435', color: '#21D07A'");
  content = content.replace(/background: '#FF4D5A'/g, "background: '#1A2435', color: '#FF4D5A'");
  content = content.replace(/color: '#fff'/g, "color: 'var(--text-secondary)'"); // if not active
  fs.writeFileSync(path.join(srcDir, 'components', file), content);
};
fixMonitor('PreviewMonitor.tsx');
fixMonitor('ProgramMonitor.tsx');

// 5. SceneLibrary.tsx & PinnedScenes.tsx - Dense desktop lists
const fixScenes = (file) => {
  let content = fs.readFileSync(path.join(srcDir, 'components', file), 'utf8');
  content = content.replace(/height: '48px'/g, "height: '40px'"); // Even smaller!
  content = content.replace(/width: '100px'/g, "width: '72px'"); // 72x40 thumbnails
  content = content.replace(/gap: '8px'/g, "gap: '6px'");
  content = content.replace(/padding: '4px'/g, "padding: '2px 4px'");
  content = content.replace(/background: 'var\(--bg-card\)'/g, "background: 'transparent'"); // Flat list feel
  content = content.replace(/border: 1px solid var\(--border-color\)/g, "borderBottom: '1px solid var(--border-color)'"); // separator lines instead of cards
  // Selected state
  content = content.replace(/border: isLive \? '1px solid #FF4D5A' : isPreview \? '1px solid #21D07A' : '1px solid transparent'/g, "background: isLive ? '#2E4D7A' : isPreview ? '#1A2435' : 'transparent', borderBottom: '1px solid var(--border-color)'");
  fs.writeFileSync(path.join(srcDir, 'components', file), content);
};
fixScenes('PinnedScenes.tsx');
fixScenes('SceneLibrary.tsx');

// 6. SourcesPanel.tsx - Remove card padding
let spContent = fs.readFileSync(path.join(srcDir, 'components/SourcesPanel.tsx'), 'utf8');
spContent = spContent.replace(/height: '48px'/g, "height: '34px'"); // Extremely dense list
spContent = spContent.replace(/background: 'var\(--bg-card\)'/g, "background: 'transparent', borderBottom: '1px solid var(--border-color)'");
spContent = spContent.replace(/flexDirection: 'column'/g, "flexDirection: 'row'"); // Make icon on left
spContent = spContent.replace(/justifyContent: 'center'/g, "justifyContent: 'flex-start'");
spContent = spContent.replace(/padding: '4px 8px'/g, "padding: '0 8px'");
spContent = spContent.replace(/gap: '4px'/g, "gap: '8px'");
fs.writeFileSync(path.join(srcDir, 'components/SourcesPanel.tsx'), spContent);

// 7. LiveSettingsPanel.tsx - 34px inputs
let lsContent = fs.readFileSync(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), 'utf8');
lsContent = lsContent.replace(/height: '24px'/g, "height: '34px'"); // Inputs exactly 34px
lsContent = lsContent.replace(/background: '#131C31'/g, "background: '#1A2435'"); // Dark inputs
fs.writeFileSync(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), lsContent);

console.log('Native Desktop Component Refactor Completed.');
