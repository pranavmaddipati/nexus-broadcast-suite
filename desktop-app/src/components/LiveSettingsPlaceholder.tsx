import React from 'react'
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
        
        {/* Top Row: Label + Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>OUTPUT</span>
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '2px' }}>
            <button style={{ padding: '4px 8px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '2px', fontSize: '9px', fontWeight: 700, cursor: 'pointer' }}>NDI / VC / SRT</button>
            <button style={{ padding: '4px 8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '2px', fontSize: '9px', fontWeight: 600, cursor: 'pointer' }}>Recording</button>
          </div>
        </div>

        {/* NDI Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)' }}>NDI OUTPUT</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Active</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)' }}>VIRTUAL CAMERA</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status</span>
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Active</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)' }}>SRT OUTPUT</span>
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
