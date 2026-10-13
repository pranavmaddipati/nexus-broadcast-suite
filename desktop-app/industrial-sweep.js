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

// 1. Unify all panel headers to 24px and use 13px font
const headerFixes = [
  { search: /height: '36px'/g, replace: "height: '24px'" },
  { search: /height: '32px'/g, replace: "height: '24px'" },
  { search: /height: '30px'/g, replace: "height: '24px'" },
  { search: /height: '18px'/g, replace: "height: '24px'" }, // transition controls header was 18px
  { search: /fontSize: '12px',\s*fontWeight: 600,\s*color: '#e2e8f0'/g, replace: "fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)'" },
  { search: /fontSize: '12px',\s*fontWeight: 700,\s*color: '#f8fafc'/g, replace: "fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)'" },
  { search: /padding: '0 12px'/g, replace: "padding: '0 8px'" },
  { search: /padding: '8px 12px'/g, replace: "padding: '8px'" },
  { search: /padding: '12px'/g, replace: "padding: '8px'" },
  { search: /padding: '16px'/g, replace: "padding: '8px'" }
];

const filesToStandardize = [
  'PinnedScenes.tsx',
  'PreviewMonitor.tsx',
  'ProgramMonitor.tsx',
  'TransitionControls.tsx',
  'AudioMixer.tsx',
  'SceneLibrary.tsx',
  'SourcesPanel.tsx',
  'LiveSettingsPanel.tsx',
  'QuickActionsPanel.tsx'
];

filesToStandardize.forEach(file => {
  applyReplacements(path.join(srcDir, 'components', file), headerFixes);
});

// 2. Specific UI Component Fixes

// App.tsx (Middle Tabs)
let appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf8');
appContent = appContent.replace(/background: 'transparent', boxShadow: 'none',/g, "background: 'transparent', borderBottom: '2px solid transparent', boxShadow: 'none',");
// Make the active tabs look like DaVinci Inspector (border bottom)
// For left tabs
appContent = appContent.replace(
  /className="hover:bg-slate-800" style={{([\s\S]*?)color: '#94a3b8',/g,
  `className="hover:bg-slate-800" style={{$1color: 'var(--text-secondary)',`
);
appContent = appContent.replace(/height: '24px',\s*flexShrink: 0,/g, "height: '28px', flexShrink: 0, borderBottom: '1px solid var(--border-color)',");
fs.writeFileSync(path.join(srcDir, 'App.tsx'), appContent);


// QuickActionsPanel
let qapContent = fs.readFileSync(path.join(srcDir, 'components/QuickActionsPanel.tsx'), 'utf8');
// Fix buttons to be desktop height (34px)
qapContent = qapContent.replace(/height: '80px'/g, "height: '48px'"); 
qapContent = qapContent.replace(/height: '60px'/g, "height: '40px'"); 
fs.writeFileSync(path.join(srcDir, 'components/QuickActionsPanel.tsx'), qapContent);


// Monitors
const fixMonitors = (file) => {
  let content = fs.readFileSync(path.join(srcDir, 'components', file), 'utf8');
  content = content.replace(/height: '36px'/g, "height: '24px'"); 
  content = content.replace(/height: '28px'/g, "height: '24px'"); // footer controls
  content = content.replace(/fontSize: '11px'/g, "fontSize: '12px'");
  fs.writeFileSync(path.join(srcDir, 'components', file), content);
};
fixMonitors('PreviewMonitor.tsx');
fixMonitors('ProgramMonitor.tsx');

// AudioMixer
let amContent = fs.readFileSync(path.join(srcDir, 'components/AudioMixer.tsx'), 'utf8');
amContent = amContent.replace(/fontSize: '10px'/g, "fontSize: '11px'");
amContent = amContent.replace(/fontSize: '9px'/g, "fontSize: '10px'");
// Reduce gap
amContent = amContent.replace(/gap: '12px'/g, "gap: '8px'");
amContent = amContent.replace(/gap: '8px'/g, "gap: '4px'");
fs.writeFileSync(path.join(srcDir, 'components/AudioMixer.tsx'), amContent);

// TopBar
let tbContent = fs.readFileSync(path.join(srcDir, 'components/TopBar.tsx'), 'utf8');
tbContent = tbContent.replace(/fontSize: '12px'/g, "fontSize: '12px'");
tbContent = tbContent.replace(/fontSize: '10px'/g, "fontSize: '11px'");
fs.writeFileSync(path.join(srcDir, 'components/TopBar.tsx'), tbContent);


// SceneLibrary & PinnedScenes
let slContent = fs.readFileSync(path.join(srcDir, 'components/SceneLibrary.tsx'), 'utf8');
slContent = slContent.replace(/height: '56px'/g, "height: '48px'");
fs.writeFileSync(path.join(srcDir, 'components/SceneLibrary.tsx'), slContent);

let psContent = fs.readFileSync(path.join(srcDir, 'components/PinnedScenes.tsx'), 'utf8');
psContent = psContent.replace(/height: '56px'/g, "height: '48px'");
// Fix scene button at bottom
psContent = psContent.replace(/height: '32px'/g, "height: '28px'");
fs.writeFileSync(path.join(srcDir, 'components/PinnedScenes.tsx'), psContent);

// LiveSettingsPanel
let lsContent = fs.readFileSync(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), 'utf8');
// Fix forms
lsContent = lsContent.replace(/height: '32px'/g, "height: '24px'");
lsContent = lsContent.replace(/height: '36px'/g, "height: '28px'");
lsContent = lsContent.replace(/padding: '4px 8px'/g, "padding: '2px 6px'");
lsContent = lsContent.replace(/fontSize: '12px'/g, "fontSize: '13px'");
lsContent = lsContent.replace(/fontSize: '13px'/g, "fontSize: '13px', fontWeight: 500");
fs.writeFileSync(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), lsContent);

console.log('Final layout and typography unified.');
