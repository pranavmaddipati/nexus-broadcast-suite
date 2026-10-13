import React, { useState, useEffect } from 'react'

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ height: '24px', background: 'transparent', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
      
      {/* Brand & Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--live-green)', boxShadow: '0 0 6px var(--live-green)' }} />
        <span className="text-label" style={{ fontWeight: 600, color: '#fff' }}>NEXUS <span style={{ color: 'var(--live-green)' }}>ONLINE</span></span>
      </div>

      {/* Analytics Panel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', flex: 1 }}>
        {[
          { label: 'CPU', value: '14%' },
          { label: 'GPU', value: '23%' },
          { label: 'RAM', value: '12GB' },
          { label: 'FPS', value: '60' },
          { label: 'BITRATE', value: '8.5 Mbps' },
          { label: 'DROPPED', value: '0' },
          { label: 'NET', value: '12 ms' },
          { label: 'REC', value: '00:15:32', highlight: 'var(--record-red)' },
          { label: 'LIVE', value: '01:04:15', highlight: 'var(--live-green)' }
        ].map(m => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 600 }}>{m.label}</span>
            <span style={{ color: m.highlight || 'var(--text-primary)', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--mono)' }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Time */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '150px', justifyContent: 'flex-end' }}>
        <span style={{ color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--mono)' }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}
