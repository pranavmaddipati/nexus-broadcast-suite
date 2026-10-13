import React from 'react'
import { MonitorPlay, Settings, Keyboard, Radio, Upload, Code } from 'lucide-react'

export const SmartToolsPanel: React.FC = () => {
  const actions = [
    { id: 'studio', label: 'Studio Mode', icon: <MonitorPlay size={24} />, color: 'var(--accent-blue)', bg: 'rgba(33, 150, 243, 0.15)', border: 'var(--accent-blue)' },
    { id: 'settings', label: 'Settings', icon: <Settings size={24} />, color: '#fff', bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.3)' },
    { id: 'hotkeys', label: 'Hotkeys', icon: <Keyboard size={24} />, color: 'var(--border-color)', bg: 'rgba(142, 68, 255, 0.15)', border: 'var(--border-color)' },
    { id: 'ndi', label: 'NDI Settings', icon: <Radio size={24} />, color: 'var(--accent-cyan)', bg: 'rgba(0, 200, 255, 0.15)', border: 'var(--accent-cyan)' },
    { id: 'output', label: 'Output Settings', icon: <Upload size={24} />, color: 'var(--accent-orange)', bg: 'rgba(255, 152, 0, 0.15)', border: 'var(--accent-orange)' },
    { id: 'scripts', label: 'Scripts', icon: <Code size={24} />, color: 'var(--accent-green)', bg: 'rgba(0, 200, 83, 0.15)', border: 'var(--accent-green)' }
  ]

  return (
    <div className="premium-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', border: 'none', borderRadius: '2px' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
          QUICK ACTIONS
        </span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', alignContent: 'start' }}>
        {actions.map(action => (
          <div
            key={action.id}
            className="premium-card hover-glow"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'transparent',
              border: `1px solid var(--border-color)`,
              aspectRatio: '1 / 1',
              borderRadius: '2px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = action.border
              e.currentTarget.style.background = action.bg
              e.currentTarget.style.color = action.color
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.background = 'var(--bg-card)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <div>
              {action.icon}
            </div>
            <span style={{ fontSize: '9px', fontWeight: 800, textAlign: 'center', letterSpacing: '0.05em', color: 'inherit' }}>{action.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default React.memo(SmartToolsPanel)
