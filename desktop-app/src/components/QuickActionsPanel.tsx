import React from 'react'
import { Radio } from 'lucide-react'

export const QuickActionsPanel: React.FC = () => {
  
  const statuses = [
    { id: 'streaming', label: 'Streaming Active', active: true },
    { id: 'recording', label: 'Recording Active', active: true },
    { id: 'vcam', label: 'Virtual Camera Active', active: true },
    { id: 'ndi', label: 'NDI Disabled', active: false },
    { id: 'srt', label: 'SRT Output Disabled', active: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      
      {/* Header */}
      <div className="panel-header">
        <Radio />
        <span className="title">Broadcast Status</span>
      </div>

      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        
        {/* Status List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {statuses.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: s.active ? 'var(--accent-red)' : 'transparent',
                border: s.active ? 'none' : '2px solid var(--text-secondary)',
                boxShadow: s.active ? '0 0 8px var(--accent-red)' : 'none'
              }} />
              <span style={{ fontSize: '12px', fontWeight: s.active ? 700 : 500, color: s.active ? '#fff' : 'var(--text-secondary)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}
