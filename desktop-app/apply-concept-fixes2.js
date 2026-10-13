const fs = require('fs');

// 1. SceneLibrary.tsx
let sceneLibrary = fs.readFileSync('src/components/SceneLibrary.tsx', 'utf8');
// Fix Pill Filter 'All' - remove underline, make solid blue pill
sceneLibrary = sceneLibrary.replace(
  /activeFilter === filter \? 'rgba\(0, 217, 255, 0\.1\)' : 'transparent'/g,
  "activeFilter === filter ? 'var(--accent-blue)' : 'transparent'"
);
sceneLibrary = sceneLibrary.replace(
  /color: activeFilter === filter \? 'var\(--accent-cyan\)' : 'var\(--text-secondary\)'/g,
  "color: activeFilter === filter ? '#fff' : 'var(--text-secondary)'"
);
// Fix Live Scene Badges - replace magenta pill with solid red
sceneLibrary = sceneLibrary.replace(
  /background: 'linear-gradient\(90deg, #FF00E5 0%, #B14CFF 100%\)'/g,
  "background: 'var(--accent-red)'"
);
sceneLibrary = sceneLibrary.replace(
  /<div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#fff', flexShrink: 0, animation: 'livePulse 1s infinite' }} \/>/g,
  ""
);
// Remove pink vertical bar on left edge of scene row
sceneLibrary = sceneLibrary.replace(
  /borderLeft: isLive \? '3px solid #FF00E5' : '3px solid transparent'/g,
  "borderLeft: 'none'"
);
sceneLibrary = sceneLibrary.replace(
  /background: isLive \? 'linear-gradient\(90deg, rgba\(255, 0, 229, 0\.15\) 0%, var\(--bg-main\) 100%\)' : 'var\(--bg-panel\)'/g,
  "background: isLive ? 'rgba(255, 42, 85, 0.15)' : 'var(--bg-panel)'"
);
sceneLibrary = sceneLibrary.replace(
  /border: isLive \? '1px solid rgba\(255, 0, 229, 0\.6\)' : '1px solid rgba\(0, 229, 255, 0\.15\)'/g,
  "border: isLive ? '1px solid rgba(255, 42, 85, 0.6)' : '1px solid rgba(0, 229, 255, 0.15)'"
);
sceneLibrary = sceneLibrary.replace(
  /boxShadow: isLive \? '0 0 12px rgba\(255, 0, 229, 0\.3\)' : 'inset 0 1px 1px rgba\(255,255,255,0\.05\)'/g,
  "boxShadow: isLive ? '0 0 12px rgba(255, 42, 85, 0.3)' : 'inset 0 1px 1px rgba(255,255,255,0.05)'"
);
sceneLibrary = sceneLibrary.replace(
  /border: isLive \? '1px solid var\(--accent-magenta\)' : '1px solid rgba\(0, 229, 255, 0\.3\)'/g,
  "border: isLive ? '1px solid var(--accent-red)' : '1px solid rgba(0, 229, 255, 0.3)'"
);
sceneLibrary = sceneLibrary.replace(
  /boxShadow: isLive \? '0 0 8px var\(--accent-magenta\)' : '0 0 4px rgba\(0, 229, 255, 0\.2\)'/g,
  "boxShadow: isLive ? '0 0 8px var(--accent-red)' : '0 0 4px rgba(0, 229, 255, 0.2)'"
);
sceneLibrary = sceneLibrary.replace(
  /background: isLive \? 'rgba\(255, 0, 229, 0\.1\)' : 'rgba\(0, 229, 255, 0\.05\)'/g,
  "background: isLive ? 'rgba(255, 42, 85, 0.1)' : 'rgba(0, 229, 255, 0.05)'"
);
sceneLibrary = sceneLibrary.replace(
  /textShadow: isLive \? '0 0 4px rgba\(255, 0, 229, 0\.8\)' : 'none'/g,
  "textShadow: isLive ? '0 0 4px rgba(255, 42, 85, 0.8)' : 'none'"
);
sceneLibrary = sceneLibrary.replace(
  /color: isLive \? 'var\(--accent-magenta\)' : 'var\(--accent-cyan\)'/g,
  "color: isLive ? 'var(--accent-red)' : 'var(--accent-cyan)'"
);

fs.writeFileSync('src/components/SceneLibrary.tsx', sceneLibrary);


// 2. AiCopilotPanel.tsx
let aiCopilot = fs.readFileSync('src/components/AiCopilotPanel.tsx', 'utf8');
aiCopilot = `import React, { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

export const AiCopilotPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div 
      className="depth-layer-1" 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '12px',
        boxSizing: 'border-box',
        background: 'var(--bg-card)',
        border: '1px solid var(--accent-purple)',
        boxShadow: '0 0 15px rgba(123, 97, 255, 0.2), inset 0 0 20px rgba(123, 97, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(123, 97, 255, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '12px', height: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--accent-purple)', borderRadius: '50%', animation: 'orbPulse 2s infinite' }} />
                <div style={{ position: 'absolute', inset: '2px', background: 'var(--accent-purple)', borderRadius: '50%' }} />
             </div>
             AI COPILOT
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <X 
            size={12} 
            color="var(--text-secondary)" 
            style={{ cursor: 'pointer' }} 
            className="hover-brighten"
            onClick={() => setIsVisible(false)}
          />
        </div>
      </div>

      {/* Ripple Animation */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', position: 'relative', height: '40px' }}>
         <div style={{ position: 'absolute', width: '30px', height: '30px', border: '1px solid rgba(123, 97, 255, 0.5)', borderRadius: '50%', animation: 'orbPulse 1.5s infinite', top: '5px' }} />
         <div style={{ position: 'absolute', width: '40px', height: '40px', border: '1px dashed rgba(123, 97, 255, 0.3)', borderRadius: '50%', animation: 'orbPulse 2s infinite reverse', top: '0' }} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', position: 'relative', zIndex: 2 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
           <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-yellow)' }} />
           <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent-yellow)', textTransform: 'uppercase' }}>High priority</span>
        </div>

        <p style={{ fontSize: '11px', color: '#fff', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
          Lower third update detected in Camera 1. Apply to all live cameras?
        </p>

      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', position: 'relative', zIndex: 2 }}>
        <button style={{ 
          background: 'rgba(123, 97, 255, 0.1)',
          border: '1px solid rgba(123, 97, 255, 0.3)',
          borderRadius: '4px',
          padding: '6px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-primary)',
          fontSize: '10px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }} 
        className="hover-brighten"
        >
          <span>3 insights</span>
          <ChevronDown size={12} color="var(--accent-purple)" />
        </button>
      </div>
    </div>
  )
}
`;
fs.writeFileSync('src/components/AiCopilotPanel.tsx', aiCopilot);

// 3. SourcesPanel.tsx
let sourcesPanel = fs.readFileSync('src/components/SourcesPanel.tsx', 'utf8');
// Remove number tags
sourcesPanel = sourcesPanel.replace(
  /<div style={{ position: 'absolute', top: '4px', left: '4px', background: 'var\(--bg-main\)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, color: '#fff', border: '1px solid rgba\(255,255,255,0\.2\)', boxShadow: '0 2px 4px rgba\(0,0,0,0\.5\)' }}>[\s\S]*?<\/div>/,
  ""
);
// Restore audio levels
sourcesPanel = sourcesPanel.replace(
  /\{\/\* Vertical Signal Bars \*\/\}.*?<\/div>/s,
  `{/* Vertical Signal Bars */}
                {src.hasAudio && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px', flexShrink: 0, background: 'rgba(0,0,0,0.5)', padding: '2px', borderRadius: '2px', border: '1px solid var(--border-color)' }}>
                    {[0.3, 0.6, 0.8, 1.0].map((h, i) => (
                      <div key={i} style={{ width: '4px', height: \`\${h * 100}%\`, background: i === 3 ? 'var(--accent-red)' : i === 2 ? '#FFB800' : 'var(--accent-green)', borderRadius: '1px', opacity: src.isLive ? (Math.random() * 0.4 + 0.6) : 0.4, boxShadow: src.isLive ? \`0 0 4px \${i === 3 ? 'var(--accent-red)' : i === 2 ? '#FFB800' : 'var(--accent-green)'}\` : 'none' }} />
                    ))}
                  </div>
                )}`
);

// Actually, wait, replacing the whole map block is easier
sourcesPanel = sourcesPanel.replace(
  /\{parseInt\(src\.id\)\}/g,
  ""
);
sourcesPanel = sourcesPanel.replace(
  /<div style={{ position: 'absolute', top: '4px', left: '4px'.*?<\/div>/g,
  ""
);
// Make the glowing purple outline on CAM 1
sourcesPanel = sourcesPanel.replace(
  /borderColor = 'var\(--accent-cyan\)';\s*glowEffect = '0 0 15px rgba\(0, 229, 255, 0\.2\), inset 0 0 20px rgba\(0, 229, 255, 0\.1\)';\s*bgGradient = 'linear-gradient\(180deg, rgba\(0, 229, 255, 0\.1\) 0%, var\(--bg-main\) 100%\)';/g,
  `borderColor = 'var(--accent-purple)';
              glowEffect = '0 0 15px rgba(123, 97, 255, 0.4), inset 0 0 20px rgba(123, 97, 255, 0.2)';
              bgGradient = 'linear-gradient(180deg, rgba(123, 97, 255, 0.1) 0%, var(--bg-main) 100%)';`
);

fs.writeFileSync('src/components/SourcesPanel.tsx', sourcesPanel);

// 4. PreviewMonitor / ProgramMonitor
let previewMonitor = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf8');
previewMonitor = previewMonitor.replace(
  /<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>\s*<div style={{ background: 'var\(--accent-green\)', color: '#000', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '2px', letterSpacing: '0\.05em' }}>PVW<\/div>\s*<Grid size={12} color="var\(--text-secondary\)" style={{ cursor: 'pointer' }} className="hover-brighten" \/>\s*<Camera size={12} color="var\(--text-secondary\)" style={{ cursor: 'pointer' }} className="hover-brighten" \/>\s*<Maximize2 size={12} color="var\(--text-secondary\)" style={{ cursor: 'pointer' }} className="hover-brighten" \/>\s*<\/div>/g,
  ""
);
fs.writeFileSync('src/components/PreviewMonitor.tsx', previewMonitor);

let programMonitor = fs.readFileSync('src/components/ProgramMonitor.tsx', 'utf8');
programMonitor = programMonitor.replace(
  /<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>\s*<div style={{ background: 'var\(--accent-red\)', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '2px', letterSpacing: '0\.05em' }}>PGM \/ LIVE<\/div>\s*<Grid size={12} color="var\(--text-secondary\)" style={{ cursor: 'pointer' }} className="hover-brighten" \/>\s*<Camera size={12} color="var\(--text-secondary\)" style={{ cursor: 'pointer' }} className="hover-brighten" \/>\s*<Maximize2 size={12} color="var\(--text-secondary\)" style={{ cursor: 'pointer' }} className="hover-brighten" \/>\s*<\/div>/g,
  ""
);
programMonitor = programMonitor.replace(
  /<span style={{ fontSize: '11px', fontWeight: 600, color: 'var\(--text-secondary\)', letterSpacing: '0\.02em' }}>PROGRAM<\/span>/,
  `<span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>PROGRAM (ON AIR)</span>`
);
fs.writeFileSync('src/components/ProgramMonitor.tsx', programMonitor);

// 5. MultitrackTimeline
let timeline = fs.readFileSync('src/components/MultitrackTimeline.tsx', 'utf8');
timeline = timeline.replace(
  /<Mic size={14} color="var\(--text-secondary\)" \/>/g,
  ""
);
fs.writeFileSync('src/components/MultitrackTimeline.tsx', timeline);

// 6. TransitionControlsExtended
let transition = fs.readFileSync('src/components/TransitionControlsExtended.tsx', 'utf8');
transition = transition.replace(
  /gridTemplateColumns: 'repeat\(5, 1fr\)'/g,
  "gridTemplateColumns: 'repeat(4, 1fr)'"
);
fs.writeFileSync('src/components/TransitionControlsExtended.tsx', transition);

// 7. LiveSettingsPlaceholder.tsx
let settingsPanel = fs.readFileSync('src/components/LiveSettingsPlaceholder.tsx', 'utf8');
settingsPanel = settingsPanel.replace(
  /<div style={{ display: 'flex', paddingBottom: '4px' }}>[\s\S]*?<\/div>\s*<\/div>/,
  ""
);
fs.writeFileSync('src/components/LiveSettingsPlaceholder.tsx', settingsPanel);

// 8. AudioMixer.tsx
let mixer = fs.readFileSync('src/components/AudioMixer.tsx', 'utf8');
mixer = mixer.replace(
  /<div style={{ position: 'absolute', left: '2px', top: '0', bottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '5px', color: 'rgba\(255,255,255,0\.3\)', fontWeight: 600 }}>[\s\S]*?<\/div>/,
  ""
);
mixer = mixer.replace(
  /<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', padding: '4px 0 2px 0', borderTop: '1px solid var\(--border-color\)' }}>[\s\S]*?<\/div>/,
  ""
);
mixer = mixer.replace(
  /border-radius: 4px; border: 1px solid/g,
  "borderRadius: 0; border: 1px solid"
);
mixer = mixer.replace(
  /borderRadius: '3px'/g,
  "borderRadius: '0px'"
);
// Change Mute/Solo button shapes to square
mixer = mixer.replace(
  /borderRadius: '18px'/g,
  "borderRadius: '2px'"
);
mixer = mixer.replace(
  /width: '18px'/g,
  "width: '100%'"
);
fs.writeFileSync('src/components/AudioMixer.tsx', mixer);

console.log("Fixes applied successfully");
