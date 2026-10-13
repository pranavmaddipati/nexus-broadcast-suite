import React from 'react'
import { Terminal } from 'lucide-react'

export const CommandCenterPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      <div className="panel-header">
        <Terminal />
        <span className="title">Command Center</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '12px' }}>
        <Terminal size={32} color="var(--text-meta)" />
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>COMMAND CENTER</span>
        <span style={{ fontSize: '11px', color: 'var(--text-meta)' }}>Future Macro & Automation Extension</span>
      </div>
    </div>
  )
}
