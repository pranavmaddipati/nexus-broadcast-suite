const fs = require('fs');

// 1. TopBar.tsx
let topBar = fs.readFileSync('src/components/TopBar.tsx', 'utf8');
topBar = topBar.replace(/stroke="var\(--accent-red\)"/g, 'stroke="var(--accent-green)"');
topBar = topBar.replace(/<span style={{ fontSize: '9px', color: 'var\(--accent-red\)', fontWeight: 700, fontFamily: 'var\(--mono\)', whiteSpace: 'nowrap' }}>1\.2 Gbps<\/span>/g, `<span style={{ fontSize: '9px', color: 'var(--accent-green)', fontWeight: 700, fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>1.2 Gbps</span>`);
fs.writeFileSync('src/components/TopBar.tsx', topBar);

// 2. AiCopilotPanel.tsx
let copilot = fs.readFileSync('src/components/AiCopilotPanel.tsx', 'utf8');
copilot = copilot.replace(
  /background: 'var\(--bg-card\)',\s*border: '1px solid var\(--accent-purple\)',/g,
  `background: 'rgba(123, 97, 255, 0.05)',
        border: '1px solid rgba(123, 97, 255, 0.5)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',`
);
copilot = copilot.replace(
  /<div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', position: 'relative', height: '40px' }}>[\s\S]*?<\/div>/,
  `<div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0', position: 'relative', height: '60px', alignItems: 'center' }}>
         <div style={{ position: 'absolute', width: '20px', height: '20px', background: 'var(--accent-purple)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent-purple)' }} />
         <div style={{ position: 'absolute', width: '40px', height: '40px', border: '2px solid var(--accent-purple)', borderRadius: '50%', animation: 'orbPulse 1.5s infinite', opacity: 0.8 }} />
         <div style={{ position: 'absolute', width: '60px', height: '60px', border: '1px solid var(--accent-purple)', borderRadius: '50%', animation: 'orbPulse 2s infinite', opacity: 0.4 }} />
      </div>`
);
copilot = copilot.replace(
  /<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>\s*<div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var\(--accent-yellow\)' }} \/>\s*<span style={{ fontSize: '9px', fontWeight: 800, color: 'var\(--accent-yellow\)', textTransform: 'uppercase' }}>High priority<\/span>\s*<\/div>/,
  `<div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '4px' }}>
          <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', color: 'var(--accent-yellow)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}>High priority</span>
        </div>`
);
copilot = copilot.replace(
  /<button style={{[\s\S]*?className="hover-brighten"\s*>/,
  `<button style={{ 
          background: 'linear-gradient(180deg, rgba(123, 97, 255, 0.2) 0%, rgba(123, 97, 255, 0.05) 100%)',
          border: '1px solid rgba(123, 97, 255, 0.5)',
          borderRadius: '16px',
          padding: '6px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(123, 97, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }} className="hover-brighten">`
);
fs.writeFileSync('src/components/AiCopilotPanel.tsx', copilot);

// 3. PreviewMonitor.tsx
let pvw = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf8');
pvw = pvw.replace(
  /<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>\s*<span style={{ fontSize: '11px', fontWeight: 600, color: 'var\(--text-secondary\)', letterSpacing: '0\.02em' }}>PREVIEW<\/span>\s*<\/div>\s*<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>[\s\S]*?<\/div>/,
  `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>PREVIEW</span>
        </div>`
);
fs.writeFileSync('src/components/PreviewMonitor.tsx', pvw);

// 4. ProgramMonitor.tsx
let pgm = fs.readFileSync('src/components/ProgramMonitor.tsx', 'utf8');
pgm = pgm.replace(
  /<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>\s*<span style={{ fontSize: '11px', fontWeight: 600, color: 'var\(--text-secondary\)', letterSpacing: '0\.02em' }}>PROGRAM \(ON AIR\)<\/span>\s*<\/div>\s*<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>[\s\S]*?<\/div>/,
  `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>PROGRAM (ON AIR)</span>
        </div>`
);
fs.writeFileSync('src/components/ProgramMonitor.tsx', pgm);

// 5. AudioMixer.tsx
let audio = fs.readFileSync('src/components/AudioMixer.tsx', 'utf8');
audio = audio.replace(
  /<div style={{ position: 'absolute', bottom: ch\.faderPosition, left: '-9px', width: '22px', height: '14px'[\s\S]*?<\/div>\s*<\/div>/,
  `<div style={{ position: 'absolute', bottom: ch.faderPosition, left: '-12px', width: '28px', height: '8px', background: 'linear-gradient(90deg, #1e3a8a 0%, #06b6d4 50%, #1e3a8a 100%)', borderRadius: '2px', cursor: 'ns-resize', border: '1px solid rgba(255,255,255,0.4)', zIndex: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.3)' }}>
                    </div>`
);
fs.writeFileSync('src/components/AudioMixer.tsx', audio);

// 6. LiveSettingsPlaceholder.tsx
const liveSettingsContent = `import React from 'react'
import { Settings } from 'lucide-react'

export const LiveSettingsPlaceholder: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div className="panel-header" style={{ padding: '8px 12px', borderBottom: 'none' }}>
        <Settings size={14} color="var(--text-secondary)" />
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>LIVE SETTINGS</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 12px 12px 12px', gap: '12px', overflowY: 'auto' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '4px' }}>
          <button style={{ flex: 1, padding: '4px 0', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>OUTPUT</button>
          <button style={{ flex: 1, padding: '4px 0', background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '2px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}>Recording</button>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button style={{ flex: 1, background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '2px', padding: '4px', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}>NDI / VC / SRT</button>
        </div>

        {/* NDI Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>NDI OUTPUT</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Name</span>
            <span style={{ color: '#fff' }}>NEXUS-NEWS-STUDIO</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Group</span>
            <span style={{ color: '#fff' }}>Global-News</span>
          </div>
        </div>

        {/* VIRTUAL CAMERA Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>VIRTUAL CAMERA</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Camera Name</span>
            <span style={{ color: '#fff' }}>Nexus Virtual Cam</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Resolution</span>
            <span style={{ color: '#fff' }}>1080p60</span>
          </div>
        </div>

        {/* SRT OUTPUT Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>SRT OUTPUT</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>SRT Mode</span>
            <span style={{ color: '#fff' }}>Listener</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Port</span>
            <span style={{ color: '#fff' }}>8890</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Latency</span>
            <span style={{ color: '#fff' }}>120 ms</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '9px', marginTop: '4px' }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>Connected</span>
          </div>
        </div>

      </div>

    </div>
  )
}
`;
fs.writeFileSync('src/components/LiveSettingsPlaceholder.tsx', liveSettingsContent);

// 7. TransitionControls.tsx
const transitionContent = `import React, { useState } from 'react'
import { ArrowLeftRight, Mic } from 'lucide-react'

const transitions = [
  { id: 'none', label: 'None' },
  { id: 'mix', label: 'Mix' },
  { id: 'dip', label: 'Dip' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'push', label: 'Push' },
  { id: 'slide', label: 'Slide' },
  { id: 'barn', label: 'Barn Door' },
  { id: 'clock', label: 'Clock' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'fade', label: 'Fade' }
];

export const TransitionControls: React.FC = () => {
  const [activeTr, setActiveTr] = useState('mix')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div className="panel-header" style={{ padding: '8px 12px', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>TRANSITION CONTROLS</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 12px 12px 12px', gap: '12px' }}>
        
        {/* Properties row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>Duration</span>
            <select className="premium-inset" style={{ width: '100%', height: '24px', fontSize: '11px', color: '#fff' }}>
              <option>1.0 sec</option>
              <option>0.5 sec</option>
              <option>2.0 sec</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>Direction</span>
            <select className="premium-inset" style={{ width: '100%', height: '24px', fontSize: '11px', color: '#fff' }}>
              <option>Left to Right</option>
              <option>Right to Left</option>
              <option>Top to Bottom</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>Border</span>
            <select className="premium-inset" style={{ width: '100%', height: '24px', fontSize: '11px', color: '#fff' }}>
              <option>0 px</option>
              <option>2 px</option>
              <option>4 px</option>
            </select>
          </div>
        </div>

        {/* 2x5 Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '6px',
          marginTop: '8px'
        }}>
          {transitions.map((t) => {
            const isActive = t.id === activeTr;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTr(t.id)}
                className={\`hardware-button \${isActive ? 'pressed' : 'hover-brighten'}\`}
                style={{
                  height: '42px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  background: isActive ? 'rgba(123, 97, 255, 0.2)' : 'var(--bg-panel)',
                  border: isActive ? '1px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 10px rgba(123, 97, 255, 0.3)' : 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '16px', height: '12px', border: '1px solid', borderColor: isActive ? '#fff' : 'var(--text-secondary)', borderRadius: '2px', opacity: 0.8 }} />
                <span style={{ fontSize: '8px', fontWeight: 600, color: isActive ? '#fff' : 'var(--text-secondary)' }}>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Auto Transition</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>Voice Command</span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-cyan)' }}>Ready</span>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(123, 97, 255, 0.1)', border: '1px solid var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(123, 97, 255, 0.3)' }}>
              <Mic size={14} color="#fff" />
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
`;
fs.writeFileSync('src/components/TransitionControls.tsx', transitionContent);

// 8. MultitrackTimeline.tsx
const multitrackContent = `import React from 'react'

const tracks = [
  { name: 'CAM 1 - Anchor', color: 'var(--accent-blue)', data: '...wave1...' },
  { name: 'CAM 2 - Guest', color: 'var(--accent-blue)', data: '...wave2...' },
  { name: 'CAM 3 - Desk Wide', color: 'var(--accent-purple)', data: '...wave3...' },
  { name: 'CAM 4 - Field Reporter', color: 'var(--accent-green)', data: '...wave4...' },
  { name: 'Program Mix', color: 'var(--accent-green)', data: '...wave5...' },
  { name: 'Studio Audio Mix', color: 'var(--accent-yellow)', data: '...wave6...' },
]

export const MultitrackTimeline: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div className="panel-header" style={{ padding: '8px 12px', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>MULTITRACK RECORDING</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 12px 12px 12px' }}>
        
        {/* Timecode Header */}
        <div style={{ display: 'flex', position: 'relative', height: '20px', alignItems: 'flex-end', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginLeft: '120px' }}>
          {['01:32:00', '01:32:10', '01:32:20', '01:32:30', '01:32:40'].map((time, i) => (
            <div key={i} style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '4px', fontSize: '9px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
              {time}
            </div>
          ))}
          {/* Playhead Marker */}
          <div style={{ position: 'absolute', left: '35%', top: 0, bottom: 0, width: '1px', background: 'var(--accent-red)', zIndex: 10 }}>
            <div style={{ position: 'absolute', top: 0, left: '-4px', width: '9px', height: '9px', background: 'var(--accent-red)', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Tracks Area */}
        <div style={{ flex: 1, position: 'relative', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Playhead Line */}
          <div style={{ position: 'absolute', left: 'calc(120px + 35%)', top: '-8px', bottom: 0, width: '1px', background: 'var(--accent-red)', zIndex: 10, boxShadow: '0 0 4px var(--accent-red)' }} />
          
          {tracks.map((t, idx) => (
            <div key={idx} style={{ display: 'flex', height: '22px', alignItems: 'center' }}>
              {/* Track Name */}
              <div style={{ width: '120px', flexShrink: 0, fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600, paddingRight: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#fff', fontSize: '10px' }}>{idx + 1}</span> {t.name}
              </div>
              
              {/* Waveform Area */}
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '2px', position: 'relative', height: '100%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Synthetic Waveform visually generated */}
                <div style={{ position: 'absolute', inset: '4px 0', display: 'flex', alignItems: 'center', gap: '1px', opacity: 0.8 }}>
                  {Array.from({ length: 150 }).map((_, i) => (
                    <div key={i} style={{ width: '2px', height: \`\${Math.random() * 80 + 20}%\`, background: t.color, borderRadius: '1px' }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '8px solid var(--text-secondary)', cursor: 'pointer' }} />
              <div style={{ width: '0', height: '0', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid var(--accent-cyan)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', gap: '2px', cursor: 'pointer' }}>
                <div style={{ width: '4px', height: '12px', background: 'var(--text-secondary)' }} />
                <div style={{ width: '4px', height: '12px', background: 'var(--text-secondary)' }} />
              </div>
              <div style={{ width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid var(--text-secondary)', cursor: 'pointer' }} />
            </div>
            <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 42, 85, 0.1)', border: '1px solid rgba(255, 42, 85, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              <div style={{ width: '6px', height: '6px', background: 'var(--accent-red)', borderRadius: '50%' }} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent-red)' }}>REC</span>
            </div>
          </div>

          <div style={{ fontSize: '10px', color: '#fff', fontFamily: 'var(--mono)', fontWeight: 600 }}>
            01:32:14 / 02:00:00
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}>Add Track</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Settings</span>
          </div>
        </div>

      </div>

    </div>
  )
}
`;
fs.writeFileSync('src/components/MultitrackTimeline.tsx', multitrackContent);

console.log("Applied ALL Image 2 Fixes!");
