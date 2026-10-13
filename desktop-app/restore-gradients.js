const fs = require('fs')
const path = require('path')

const fixFile = (filepath, replacements) => {
  let content = fs.readFileSync(filepath, 'utf8')
  replacements.forEach(({ search, replace }) => {
    content = content.replace(search, replace)
  })
  fs.writeFileSync(filepath, content)
}

// 1. TransitionControls.tsx
fixFile(path.join(__dirname, 'src/components/TransitionControls.tsx'), [
  {
    search: /bg: '#2563eb'/g,
    replace: "bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'"
  },
  {
    search: /bg: '#9333ea'/g,
    replace: "bg: 'linear-gradient(135deg, #a855f7, #7e22ce)'"
  },
  {
    search: /bg: '#ea580c'/g,
    replace: "bg: 'linear-gradient(135deg, #f97316, #c2410c)'"
  },
  {
    search: /bg: '#0284c7'/g,
    replace: "bg: 'linear-gradient(135deg, #0ea5e9, #0369a1)'"
  },
  {
    search: /bg: '#334155'/g,
    replace: "bg: 'linear-gradient(135deg, #475569, #1e293b)'"
  },
  {
    search: /bg: '#dc2626'/g,
    replace: "bg: 'linear-gradient(135deg, #ef4444, #b91c1c)'"
  },
  {
    search: /background: num === 1 \? '#2563eb' : 'var\(--bg-card\)'/g,
    replace: "background: num === 1 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'var(--bg-card)'"
  }
])

// 2. PinnedScenes.tsx
fixFile(path.join(__dirname, 'src/components/PinnedScenes.tsx'), [
  {
    search: /const numColors = \[\n    '#dc2626', \/\/ Red\n    '#10b981', \/\/ Green\n    '#9333ea', \/\/ Purple\n    '#2563eb', \/\/ Blue\n    '#ea580c', \/\/ Orange\n    '#0284c7', \/\/ Cyan\n    '#db2777', \/\/ Pink\n    '#475569', \/\/ Grey\n  \]/,
    replace: `const numColors = [
    'linear-gradient(135deg, #ef4444, #b91c1c)', // Red
    'linear-gradient(135deg, #10b981, #047857)', // Green
    'linear-gradient(135deg, #a855f7, #7e22ce)', // Purple
    'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
    'linear-gradient(135deg, #f97316, #c2410c)', // Orange
    'linear-gradient(135deg, #0ea5e9, #0369a1)', // Cyan
    'linear-gradient(135deg, #ec4899, #be185d)', // Pink
    'linear-gradient(135deg, #64748b, #334155)', // Grey
  ]`
  }
])

// 3. QuickActionsPanel.tsx
fixFile(path.join(__dirname, 'src/components/QuickActionsPanel.tsx'), [
  { search: /bg: '#9333ea'/g, replace: "bg: 'linear-gradient(135deg, #a855f7, #7e22ce)'" },
  { search: /bg: '#db2777'/g, replace: "bg: 'linear-gradient(135deg, #ec4899, #be185d)'" },
  { search: /bg: '#ea580c'/g, replace: "bg: 'linear-gradient(135deg, #f97316, #c2410c)'" },
  { search: /bg: '#2563eb'/g, replace: "bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'" },
  { search: /bg: '#0d9488'/g, replace: "bg: 'linear-gradient(135deg, #14b8a6, #0f766e)'" },
  { search: /bg: '#10b981'/g, replace: "bg: 'linear-gradient(135deg, #10b981, #047857)'" }
])

// 4. LiveSettingsPanel.tsx
fixFile(path.join(__dirname, 'src/components/LiveSettingsPanel.tsx'), [
  { search: /background: '#10b981'/g, replace: "background: 'linear-gradient(135deg, #10b981, #047857)'" },
  { search: /background: '#2563eb'/g, replace: "background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'" },
  { search: /background: '#dc2626'/g, replace: "background: 'linear-gradient(135deg, #ef4444, #b91c1c)'" }
])

// 5. SourcesPanel.tsx
fixFile(path.join(__dirname, 'src/components/SourcesPanel.tsx'), [
  { search: /bg: '#2563eb'/g, replace: "bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'" },
  { search: /bg: '#9333ea'/g, replace: "bg: 'linear-gradient(135deg, #a855f7, #7e22ce)'" },
  { search: /bg: '#ea580c'/g, replace: "bg: 'linear-gradient(135deg, #f97316, #c2410c)'" },
  { search: /bg: '#10b981'/g, replace: "bg: 'linear-gradient(135deg, #10b981, #047857)'" },
  { search: /bg: '#65a30d'/g, replace: "bg: 'linear-gradient(135deg, #84cc16, #4d7c0f)'" }
])

// 6. AudioMixer.tsx
const audioMixerContent = `import React from 'react'

export const AudioMixer: React.FC = () => {
  const channels = [
    { name: 'MASTER', level: 0.85, value: '-2.4 dB', sActive: false, mActive: false },
    { name: 'CAM 1', level: 0.65, value: '-4.8 dB', sActive: false, mActive: false },
    { name: 'MIC 1', level: 0.90, value: '-1.6 dB', sActive: false, mActive: false },
    { name: 'MUSIC', level: 0.40, value: '-8.3 dB', sActive: false, mActive: false },
    { name: 'PC AUDIO', level: 0.55, value: '-7.2 dB', sActive: false, mActive: false },
  ]

  const renderMeter = (level: number) => {
    const segments = 24
    const activeSegments = Math.floor(level * segments)
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '2px', height: '100%', width: '10px' }}>
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments
          
          let bg = 'linear-gradient(90deg, #10b981, #059669)'
          let shadow = 'rgba(16, 185, 129, 0.5)'
          if (i >= segments * 0.6) {
            bg = 'linear-gradient(90deg, #f59e0b, #d97706)'
            shadow = 'rgba(245, 158, 11, 0.5)'
          }
          if (i >= segments * 0.85) {
            bg = 'linear-gradient(90deg, #ef4444, #dc2626)'
            shadow = 'rgba(239, 68, 68, 0.5)'
          }
          
          return (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                width: '100%', 
                background: isActive ? bg : '#161c2d',
                borderRadius: '1px',
                boxShadow: isActive ? \`0 0 4px \${shadow}\` : 'none'
              }} 
            />
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '0 12px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '32px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.05em' }}>AUDIO MIXER</span>
      </div>
      
      <div style={{ flex: 1, padding: '12px 0 0 0', display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 64px)', fontSize: '9px', color: '#64748b', marginTop: '52px', paddingBottom: '12px', paddingRight: '4px', textAlign: 'right', fontWeight: 600 }}>
          <span>10</span>
          <span>0</span>
          <span>-10</span>
          <span>-20</span>
          <span>-30</span>
          <span>-40</span>
          <span>-50</span>
          <span>-60</span>
        </div>

        {channels.map((ch, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '40px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', height: '32px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>{ch.name}</span>
              <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 600 }}>EQ COMP</span>
            </div>

            <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
              <button style={{ width: '16px', height: '16px', background: ch.sActive ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#1e293b', border: '1px solid #334155', color: ch.sActive ? '#fff' : '#94a3b8', fontSize: '9px', fontWeight: 700, borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-slate-700">S</button>
              <button style={{ width: '16px', height: '16px', background: ch.mActive ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : '#1e293b', border: '1px solid #334155', color: ch.mActive ? '#fff' : '#94a3b8', fontSize: '9px', fontWeight: 700, borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-slate-700">M</button>
            </div>

            <div style={{ flex: 1, display: 'flex', position: 'relative', width: '100%', marginBottom: '12px', justifyContent: 'center' }}>

              <div style={{ display: 'flex', gap: '2px', height: '100%', marginRight: '14px' }}>
                {renderMeter(ch.level)}
                {renderMeter(ch.level - 0.05)}
              </div>

              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '14px', display: 'flex', justifyContent: 'center', padding: '0' }}>
                <div style={{ width: '4px', height: '100%', background: '#020617', borderRadius: '2px', border: '1px solid #1e293b', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.8)' }}></div>
                <div style={{ 
                  position: 'absolute', 
                  bottom: \`\${ch.level * 100}%\`, 
                  width: '24px', 
                  height: '14px', 
                  background: 'linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%)', 
                  borderRadius: '2px',
                  border: '1px solid #64748b',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateX(5px)'
                }}>
                  <div style={{ width: '100%', height: '2px', background: '#0f172a', borderBottom: '1px solid #ffffff' }}></div>
                </div>
              </div>
            </div>

            <span style={{ fontSize: '9px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px', fontFamily: 'monospace' }}>{ch.value}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <button style={{ width: '100%', height: '28px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }} className="hover:text-white">
          AUDIO SETTINGS
        </button>
      </div>
    </div>
  )
}
`

fs.writeFileSync(path.join(__dirname, 'src/components/AudioMixer.tsx'), audioMixerContent)
console.log('Restored gradients.')
