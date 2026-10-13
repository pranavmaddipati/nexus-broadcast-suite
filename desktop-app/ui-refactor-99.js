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

// 1. App.tsx and index.css
applyReplacements(path.join(srcDir, 'index.css'), [
  { search: /--panel-padding: 8px;/g, replace: '--panel-padding: 4px;' },
  { search: /--panel-gap: 8px;/g, replace: '--panel-gap: 4px;' },
  { search: /--section-gap: 8px;/g, replace: '--section-gap: 4px;' }
]);

applyReplacements(path.join(srcDir, 'App.tsx'), [
  { search: /gap: '8px'/g, replace: "gap: '4px'" },
  { search: /padding: '8px'/g, replace: "padding: '4px'" },
  { search: /padding: '0 12px'/g, replace: "padding: '0 4px'" },
  { search: /margin: '0 4px'/g, replace: "margin: '0 2px'" },
  { search: /height: '36px'/g, replace: "height: '28px'" }, // Header / Middle toolbar height
  { search: /height: '28px'/g, replace: "height: '24px'" } // buttons in middle toolbar
]);

applyReplacements(path.join(srcDir, 'components/WorkspaceContainer.tsx'), [
  { search: /gap: '8px'/g, replace: "gap: '4px'" }
]);

// 2. Preview and Program Monitors
const monitorReplacements = [
  { search: /width: '60px'/g, replace: "flex: 1" },
  { search: /width: '40px'/g, replace: "width: '28px'" }, // settings icon width
  { search: /height: '24px'/g, replace: "height: '22px'" },
  { search: /padding: '8px'/g, replace: "padding: '4px'" }
];
applyReplacements(path.join(srcDir, 'components/PreviewMonitor.tsx'), monitorReplacements);
applyReplacements(path.join(srcDir, 'components/ProgramMonitor.tsx'), monitorReplacements);

// 3. QuickActionsPanel.tsx - Convert to 3x2 grid
const quickActionsContent = `import React from 'react'
import { Settings, Activity, Zap, Code, Monitor } from 'lucide-react'

export const QuickActionsPanel: React.FC = () => {
  const actions = [
    { name: 'Studio Mode', icon: <Monitor size={14} />, bg: 'linear-gradient(135deg, #a855f7, #7e22ce)', shadow: '#a855f7' },
    { name: 'Settings', icon: <Settings size={14} />, bg: 'linear-gradient(135deg, #ec4899, #be185d)', shadow: '#ec4899' },
    { name: 'Hotkeys', icon: <Activity size={14} />, bg: 'linear-gradient(135deg, #f97316, #c2410c)', shadow: '#f97316' },
    { name: 'NDI Settings', icon: <Zap size={14} />, bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadow: '#3b82f6' },
    { name: 'Output Settings', icon: <Monitor size={14} />, bg: 'linear-gradient(135deg, #14b8a6, #0f766e)', shadow: '#14b8a6' },
    { name: 'Scripts', icon: <Code size={14} />, bg: 'linear-gradient(135deg, #10b981, #047857)', shadow: '#10b981' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '28px', padding: '0 8px', flexShrink: 0, borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.05em' }}>QUICK ACTIONS</span>
      </div>
      <div style={{ flex: 1, padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', flex: 1 }}>
          {actions.map(action => (
            <div key={action.name} style={{ background: action.bg, borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', boxShadow: \`0 2px 8px \${action.shadow}40\` }} className="hover:brightness-110">
              {action.icon}
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: '1.1' }}>{action.name.replace(' Settings', '\\nSettings')}</span>
            </div>
          ))}
        </div>
        <div style={{ height: '24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981' }} />
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#10b981' }}>Everything is running smoothly.</span>
        </div>
      </div>
    </div>
  )
}
`;
fs.writeFileSync(path.join(srcDir, 'components/QuickActionsPanel.tsx'), quickActionsContent);

// 4. PinnedScenes.tsx
applyReplacements(path.join(srcDir, 'components/PinnedScenes.tsx'), [
  { search: /height: '56px'/g, replace: "height: '48px'" },
  { search: /width: '90px'/g, replace: "width: '64px'" }, // thumbnail
  { search: /height: '100%'/g, replace: "height: '36px'" }, // thumbnail
  { search: /gap: '8px'/g, replace: "gap: '4px'" },
  { search: /padding: '8px'/g, replace: "padding: '4px'" },
  { search: /height: '32px'/g, replace: "height: '24px'" }, // Add scene button
  { search: /width: '18px'/g, replace: "width: '16px'" }, // quick cut buttons
  { search: /height: '18px'/g, replace: "height: '16px'" } // quick cut buttons
]);

// 5. AudioMixer.tsx
applyReplacements(path.join(srcDir, 'components/AudioMixer.tsx'), [
  { search: /width: '24px', \n *height: '14px'/g, replace: "width: '16px', \n                  height: '8px'" },
  { search: /width: '4px'/g, replace: "width: '2px'" }, // fader track
  { search: /gap: '2px'/g, replace: "gap: '1px'" },
  { search: /height: '32px'/g, replace: "height: '24px'" },
  { search: /height: '26px'/g, replace: "height: '24px'" }
]);

// 6. TransitionControls.tsx
applyReplacements(path.join(srcDir, 'components/TransitionControls.tsx'), [
  { search: /gap: '6px'/g, replace: "gap: '4px'" },
  { search: /padding: '8px'/g, replace: "padding: '4px'" },
  { search: /height: '26px'/g, replace: "height: '22px'" },
  { search: /height: '22px'/g, replace: "height: '18px'" }
]);

// 7. LiveSettingsPanel.tsx
applyReplacements(path.join(srcDir, 'components/LiveSettingsPanel.tsx'), [
  { search: /height: '32px'/g, replace: "height: '24px'" },
  { search: /padding: '12px'/g, replace: "padding: '6px'" },
  { search: /gap: '12px'/g, replace: "gap: '6px'" },
  { search: /gap: '8px'/g, replace: "gap: '4px'" }
]);

// 8. SourcesPanel.tsx
applyReplacements(path.join(srcDir, 'components/SourcesPanel.tsx'), [
  { search: /height: '64px'/g, replace: "height: '52px'" },
  { search: /padding: '4px'/g, replace: "padding: '4px'" },
  { search: /gap: '8px'/g, replace: "gap: '4px'" },
  { search: /width: '32px'/g, replace: "width: '24px'" }, // icon box
  { search: /height: '32px'/g, replace: "height: '24px'" }
]);

console.log('UI refactoring script complete.');
