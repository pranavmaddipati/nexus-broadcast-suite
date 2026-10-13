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
      console.log(`Updated styles in ${path.basename(filepath)}`);
    }
  } catch (e) {
    console.error(`Failed on ${filepath}:`, e.message);
  }
};

const srcDir = path.join(__dirname, 'src');

// 1. index.css
applyReplacements(path.join(srcDir, 'index.css'), [
  { search: /--bg-main: .*/g, replace: '--bg-main: #070B16;' },
  { search: /--bg-panel: .*/g, replace: '--bg-panel: #0D1324;' },
  { search: /--bg-card: .*/g, replace: '--bg-card: #131C31;' },
  { search: /--border-color: .*/g, replace: '--border-color: #24304A;' },
  { search: /--text-primary: .*/g, replace: '--text-primary: #FFFFFF;' },
  { search: /--text-secondary: .*/g, replace: '--text-secondary: #AEB9D5;' },
  { search: /--accent-green: .*/g, replace: '--accent-green: #21D07A;' },
  { search: /--accent-red: .*/g, replace: '--accent-red: #FF4D5A;' },
  { search: /--accent-blue: .*/g, replace: '--accent-blue: #2D7DFF;' },
  { search: /--accent-purple: .*/g, replace: '--accent-purple: #8E44FF;' },
  { search: /box-shadow: 0 4px 12px rgba\(0,0,0,0.5\)/g, replace: 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)' }
]);

// 2. QuickActionsPanel.tsx
applyReplacements(path.join(srcDir, 'components/QuickActionsPanel.tsx'), [
  { search: /'linear-gradient\(135deg, #a855f7, #7e22ce\)'/g, replace: "'linear-gradient(135deg, #A855F7, #7E22CE)'" }, // Studio Mode
  { search: /'linear-gradient\(135deg, #ec4899, #be185d\)'/g, replace: "'linear-gradient(135deg, #EC4899, #BE185D)'" }, // Settings
  { search: /'linear-gradient\(135deg, #f97316, #c2410c\)'/g, replace: "'linear-gradient(135deg, #FF7A00, #C2410C)'" }, // Hotkeys
  { search: /'linear-gradient\(135deg, #3b82f6, #1d4ed8\)'/g, replace: "'linear-gradient(135deg, #2D7DFF, #1D4ED8)'" }, // NDI Settings
  { search: /'linear-gradient\(135deg, #14b8a6, #0f766e\)'/g, replace: "'linear-gradient(135deg, #00C897, #0F766E)'" }, // Output Settings
  { search: /'linear-gradient\(135deg, #10b981, #047857\)'/g, replace: "'linear-gradient(135deg, #21D07A, #047857)'" }, // Scripts
  { search: /boxShadow: `0 2px 8px \${action.shadow}40`/g, replace: "boxShadow: `0 4px 16px ${action.shadow}40, inset 0 1px 1px rgba(255,255,255,0.1)`" },
  { search: /#10b981/g, replace: "#21D07A" } // Status color
]);

// 3. TopBar.tsx
applyReplacements(path.join(srcDir, 'components/TopBar.tsx'), [
  { search: /#10b981/g, replace: "#21D07A" }, // LIVE and numbers
  { search: /#ef4444/g, replace: "#FF4D5A" }, // REC
  { search: /#1e293b/g, replace: "#131C31" }, // Hardware cards bg
  { search: /color: '#4ade80'/g, replace: "color: '#21D07A'" } // Hardware value
]);

// 4. App.tsx (Middle Toolbar)
applyReplacements(path.join(srcDir, 'App.tsx'), [
  { search: /#8b5cf6/g, replace: "#8E44FF" },
  { search: /#ec4899/g, replace: "#EC4899" },
  { search: /#ef4444/g, replace: "#FF4D5A" },
  { search: /#10b981/g, replace: "#21D07A" },
  { search: /#0ea5e9/g, replace: "#00C8FF" },
  { search: /#3b82f6/g, replace: "#2D7DFF" },
  { search: /#6366f1/g, replace: "#8E44FF" },
  { search: /rgba\(\${btn.color === '#ef4444' \? '239,68,68'.*\), 0.15\)/g, replace: "btn.color" }, // Wait, button backgrounds were using rgba
]);

// Let's manually replace the App.tsx button mapping for exact gradients
const appTsxContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf8');
const newAppTsxContent = appTsxContent.replace(
  /background: btn\.color \? `rgba\(.*?` : 'transparent',/g, 
  "background: btn.color ? `linear-gradient(135deg, ${btn.color}, ${btn.color}99)` : 'transparent', boxShadow: btn.color ? `0 2px 8px ${btn.color}60` : 'none',"
);
fs.writeFileSync(path.join(srcDir, 'App.tsx'), newAppTsxContent);

// 5. Monitors
const monitorColors = [
  { search: /#10b981/g, replace: "#21D07A" },
  { search: /#ef4444/g, replace: "#FF4D5A" },
  { search: /boxShadow: `0 4px 12px \${'#10b981'}40`/g, replace: "boxShadow: `0 4px 12px ${'#21D07A'}60, inset 0 1px 1px rgba(255,255,255,0.2)`" },
  { search: /boxShadow: `0 4px 12px \${'#ef4444'}40`/g, replace: "boxShadow: `0 4px 12px ${'#FF4D5A'}60, inset 0 1px 1px rgba(255,255,255,0.2)`" }
];
applyReplacements(path.join(srcDir, 'components/PreviewMonitor.tsx'), monitorColors);
applyReplacements(path.join(srcDir, 'components/ProgramMonitor.tsx'), monitorColors);

// 6. TransitionControls.tsx
applyReplacements(path.join(srcDir, 'components/TransitionControls.tsx'), [
  { search: /#3b82f6/g, replace: "#2D7DFF" }, // CUT / WIPE
  { search: /#a855f7/g, replace: "#8E44FF" }, // FADE
  { search: /#f97316/g, replace: "#FF7A00" }, // SLIDE
  { search: /#0ea5e9/g, replace: "#00C8FF" }, // PUSH
  { search: /#ef4444/g, replace: "#FF4D5A" }, // ZOOM / STINGER
  { search: /#1d4ed8/g, replace: "#1D4ED8" },
  { search: /#7e22ce/g, replace: "#7E22CE" },
  { search: /#c2410c/g, replace: "#C2410C" },
  { search: /#0369a1/g, replace: "#0369A1" },
  { search: /#b91c1c/g, replace: "#B91C1C" },
  { search: /boxShadow: '0 2px 4px rgba\(0,0,0,0.2\)'/g, replace: "boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'" }
]);

// 7. LiveSettingsPanel.tsx
applyReplacements(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), [
  { search: /#0f172a/g, replace: "#131C31" },
  { search: /#334155/g, replace: "#24304A" },
  { search: /#10b981/g, replace: "#21D07A" },
  { search: /#3b82f6/g, replace: "#2D7DFF" },
  { search: /#ef4444/g, replace: "#FF4D5A" }
]);

// 8. SourcesPanel.tsx
applyReplacements(path.join(srcDir, 'components/SourcesPanel.tsx'), [
  { search: /#3b82f6/g, replace: "#2D7DFF" },
  { search: /#a855f7/g, replace: "#8E44FF" },
  { search: /#f97316/g, replace: "#FF7A00" },
  { search: /#10b981/g, replace: "#21D07A" },
  { search: /#84cc16/g, replace: "#00C897" },
  { search: /#fbbf24/g, replace: "#FF7A00" },
  { search: /#34d399/g, replace: "#21D07A" },
  { search: /boxShadow: src\.active \? '0 4px 12px rgba\(59, 130, 246, 0.3\)' : 'none'/g, replace: "boxShadow: src.active ? '0 4px 16px rgba(45, 125, 255, 0.4)' : 'none'" }
]);

// 9. PinnedScenes.tsx & SceneLibrary.tsx
applyReplacements(path.join(srcDir, 'components/PinnedScenes.tsx'), [
  { search: /#10b981/g, replace: "#21D07A" },
  { search: /#ef4444/g, replace: "#FF4D5A" },
  { search: /border: isLive \? '1px solid #ef4444' : isPreview \? '1px solid #10b981' : '1px solid transparent'/g, replace: "border: isLive ? '1px solid #FF4D5A' : isPreview ? '1px solid #21D07A' : '1px solid transparent', boxShadow: isLive ? '0 0 12px rgba(255, 77, 90, 0.3)' : isPreview ? '0 0 12px rgba(33, 208, 122, 0.3)' : 'none'" }
]);
applyReplacements(path.join(srcDir, 'components/SceneLibrary.tsx'), [
  { search: /#10b981/g, replace: "#21D07A" },
  { search: /#ef4444/g, replace: "#FF4D5A" },
  { search: /border: isLive \? '1px solid #ef4444' : isPreview \? '1px solid #10b981' : '1px solid transparent'/g, replace: "border: isLive ? '1px solid #FF4D5A' : isPreview ? '1px solid #21D07A' : '1px solid transparent', boxShadow: isLive ? '0 0 12px rgba(255, 77, 90, 0.3)' : isPreview ? '0 0 12px rgba(33, 208, 122, 0.3)' : 'none'" }
]);

// 10. AudioMixer.tsx (The LED meters)
applyReplacements(path.join(srcDir, 'components/AudioMixer.tsx'), [
  { 
    search: /background: i < 18 \? '#10b981' : i < 22 \? '#f59e0b' : '#ef4444'/g, 
    replace: "background: i < 16 ? '#21D07A' : i < 20 ? '#FFD600' : i < 22 ? '#FF7A00' : '#FF4D5A', boxShadow: i < (ch.level * 24) ? (i < 16 ? '0 0 6px #21D07A' : i < 20 ? '0 0 6px #FFD600' : i < 22 ? '0 0 6px #FF7A00' : '0 0 6px #FF4D5A') : 'none'" 
  }
]);

console.log('Visual style sweeping complete.');
