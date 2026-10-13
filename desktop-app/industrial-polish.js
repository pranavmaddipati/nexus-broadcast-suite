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

// 1. index.css
applyReplacements(path.join(srcDir, 'index.css'), [
  { search: /--bg-main: .*/g, replace: '--bg-main: #090D18;' },
  { search: /--bg-panel: .*/g, replace: '--bg-panel: #111827;' },
  { search: /--bg-card: .*/g, replace: '--bg-card: #172136;' },
  { search: /--border-color: .*/g, replace: '--border-color: #243247;' },
  { search: /--text-primary: .*/g, replace: '--text-primary: #FFFFFF;' },
  { search: /--text-secondary: .*/g, replace: '--text-secondary: #A8B2C9;' },
  { search: /--panel-radius: .*/g, replace: '--panel-radius: 6px;' },
  { search: /box-shadow: 0 8px 32px.*/g, replace: 'box-shadow: 0 2px 8px rgba(0,0,0,0.4);' },
  { search: /box-shadow: 0 4px 12px.*/g, replace: 'box-shadow: 0 2px 4px rgba(0,0,0,0.3);' },
  { search: /border: 1px solid rgba\(255, 255, 255, 0\.05\)/g, replace: 'border: 1px solid var(--border-color)' }
]);

// 2. QuickActionsPanel.tsx
let qapContent = fs.readFileSync(path.join(srcDir, 'components/QuickActionsPanel.tsx'), 'utf8');
// Remove all the crazy gradients and use the flat dark card background.
qapContent = qapContent.replace(/background: action\.bg,/g, "background: 'var(--bg-card)', border: '1px solid var(--border-color)',");
qapContent = qapContent.replace(/boxShadow: `0 4px 16px \$\{action\.shadow\}40, inset 0 1px 1px rgba\(255,255,255,0\.1\)`/g, "boxShadow: '0 2px 4px rgba(0,0,0,0.2)'");
qapContent = qapContent.replace(/borderRadius: '8px'/g, "borderRadius: '6px'");
// Reduce padding
qapContent = qapContent.replace(/padding: '16px'/g, "padding: '8px'");
qapContent = qapContent.replace(/padding: '12px'/g, "padding: '8px'");
// Fix status text color to A8B2C9
qapContent = qapContent.replace(/color: '#94a3b8'/g, "color: 'var(--text-secondary)'");
qapContent = qapContent.replace(/color: '#cbd5e1'/g, "color: 'var(--text-secondary)'");
fs.writeFileSync(path.join(srcDir, 'components/QuickActionsPanel.tsx'), qapContent);

// 3. App.tsx (Middle Toolbar + layout borders)
let appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf8');
// Remove background gradients from the middle toolbar, make them flat and dark.
appContent = appContent.replace(/background: btn\.color \? `linear-gradient\(135deg, \$\{btn\.color\}, \$\{btn\.color\}99\)` : 'transparent', boxShadow: btn\.color \? `0 2px 8px \$\{btn\.color\}60` : 'none',/g, "background: 'transparent', boxShadow: 'none',");
// Make middle buttons have 6px radius
appContent = appContent.replace(/borderRadius: '4px'/g, "borderRadius: '6px'");
appContent = appContent.replace(/padding: '0 12px'/g, "padding: '0 8px'");
fs.writeFileSync(path.join(srcDir, 'App.tsx'), appContent);

// 4. TopBar.tsx
let tbContent = fs.readFileSync(path.join(srcDir, 'components/TopBar.tsx'), 'utf8');
// Reduce padding and heights
tbContent = tbContent.replace(/height: '24px'/g, "height: '20px'");
tbContent = tbContent.replace(/padding: '0 8px'/g, "padding: '0 6px'");
tbContent = tbContent.replace(/borderRadius: '6px'/g, "borderRadius: '4px'"); // tiny badges
fs.writeFileSync(path.join(srcDir, 'components/TopBar.tsx'), tbContent);

// 5. TransitionControls.tsx
let tcContent = fs.readFileSync(path.join(srcDir, 'components/TransitionControls.tsx'), 'utf8');
// Make ALL quick transition buttons dark EXCEPT stinger which can stay red
tcContent = tcContent.replace(/background: action\.name === 'STINGER' \? `linear-gradient\(135deg, \$\{action\.color\}, #b91c1c\)` : action\.color/g, "background: action.name === 'STINGER' ? '#FF4D5A' : 'var(--bg-card)'");
// Use borders instead of colors
tcContent = tcContent.replace(/border: 'none'/g, "border: action.name === 'STINGER' ? 'none' : '1px solid var(--border-color)'");
// Remove crazy shadows
tcContent = tcContent.replace(/boxShadow: '0 2px 8px rgba\(0,0,0,0\.4\), inset 0 1px 1px rgba\(255,255,255,0\.1\)'/g, "boxShadow: 'none'");
// Reduce padding
tcContent = tcContent.replace(/padding: '0 10px'/g, "padding: '0 8px'");
tcContent = tcContent.replace(/borderRadius: '4px'/g, "borderRadius: '4px'"); // small buttons are ok at 4
fs.writeFileSync(path.join(srcDir, 'components/TransitionControls.tsx'), tcContent);

// 6. AudioMixer.tsx
let amContent = fs.readFileSync(path.join(srcDir, 'components/AudioMixer.tsx'), 'utf8');
// Keep the LED colors, but thin the faders and meters
amContent = amContent.replace(/width: '12px'/g, "width: '6px'"); // thinner meters
amContent = amContent.replace(/width: '4px'/g, "width: '2px'"); // thinner fader tracks
amContent = amContent.replace(/width: '16px'/g, "width: '12px'"); // thinner fader handles
amContent = amContent.replace(/height: '8px'/g, "height: '4px'"); // thinner fader handles
// Remove empty padding
amContent = amContent.replace(/padding: '12px 16px'/g, "padding: '8px'");
fs.writeFileSync(path.join(srcDir, 'components/AudioMixer.tsx'), amContent);

// 7. PinnedScenes.tsx
let psContent = fs.readFileSync(path.join(srcDir, 'components/PinnedScenes.tsx'), 'utf8');
// Reduce height of scene cards
psContent = psContent.replace(/height: '72px'/g, "height: '56px'"); // smaller thumbnails
psContent = psContent.replace(/padding: '8px'/g, "padding: '4px'"); // less padding inside card
psContent = psContent.replace(/borderRadius: '6px'/g, "borderRadius: '4px'"); // thumbnail radius
psContent = psContent.replace(/borderRadius: '8px'/g, "borderRadius: '6px'"); // card radius
psContent = psContent.replace(/gap: '4px'/g, "gap: '2px'"); // tighter list
fs.writeFileSync(path.join(srcDir, 'components/PinnedScenes.tsx'), psContent);

// 8. SceneLibrary.tsx
let slContent = fs.readFileSync(path.join(srcDir, 'components/SceneLibrary.tsx'), 'utf8');
// Reduce padding by 40% (16px to 8px)
slContent = slContent.replace(/padding: '12px 16px'/g, "padding: '8px 12px'");
slContent = slContent.replace(/padding: '12px'/g, "padding: '8px'");
slContent = slContent.replace(/borderRadius: '8px'/g, "borderRadius: '6px'");
// Reduce height and thumbnail sizes
slContent = slContent.replace(/height: '72px'/g, "height: '56px'"); // smaller thumbnails
fs.writeFileSync(path.join(srcDir, 'components/SceneLibrary.tsx'), slContent);

// 9. SourcesPanel.tsx
let spContent = fs.readFileSync(path.join(srcDir, 'components/SourcesPanel.tsx'), 'utf8');
// Reduce height
spContent = spContent.replace(/height: '64px'/g, "height: '48px'"); // very thin source cards
spContent = spContent.replace(/padding: '8px'/g, "padding: '4px 8px'");
spContent = spContent.replace(/borderRadius: '8px'/g, "borderRadius: '6px'");
// Remove solid icon backgrounds, use transparent or dark
spContent = spContent.replace(/background: `\$\{src.color\}20`/g, "background: 'transparent'");
fs.writeFileSync(path.join(srcDir, 'components/SourcesPanel.tsx'), spContent);

// 10. LiveSettingsPanel.tsx
let lsContent = fs.readFileSync(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), 'utf8');
// Compact inputs
lsContent = lsContent.replace(/padding: '8px 12px'/g, "padding: '4px 8px'");
lsContent = lsContent.replace(/height: '32px'/g, "height: '24px'");
lsContent = lsContent.replace(/borderRadius: '6px'/g, "borderRadius: '4px'");
lsContent = lsContent.replace(/gap: '12px'/g, "gap: '8px'");
fs.writeFileSync(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), lsContent);

console.log('Industrial polish applied.');
