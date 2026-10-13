import React, { useState } from 'react'
import { Radio, Video, Mic, Network, Monitor, Share2, Settings2 } from 'lucide-react'
import { PanelHeader } from './PanelHeader'

export const StreamSettingsPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('live')

  const tabs = [
    { id: 'live', label: 'Live' },
    { id: 'recording', label: 'Recording' },
    { id: 'output', label: 'Output' },
    { id: 'virtual_camera', label: 'Virtual Camera' }
  ]

  return (
    <div className="live-settings-panel" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', background: 'transparent' }}>
      <style>{`
        .live-settings-panel input, .live-settings-panel select {
          height: 24px !important;
          box-sizing: border-box;
          border-radius: 3px !important;
        }
      `}</style>
      {/* HEADER */}
      <PanelHeader id="stream_settings" title="LIVE SETTINGS" />

      {/* HORIZONTAL TABS */}
      <div style={{ height: '32px', minHeight: '32px', maxHeight: '32px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--bg-panel)', background: 'transparent', padding: '0 8px', overflowX: 'auto', flexShrink: 0, gap: '8px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            style={{
              padding: '0 7px',
              background: activeCategory === tab.id ? 'var(--bg-panel)' : 'transparent',
              color: activeCategory === tab.id ? '#f8fafc' : '#94a3b8',
              border: 'none',
              borderBottom: activeCategory === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: 'var(--font-size)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              transition: 'all 0.1s ease',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'transparent', color: '#f8fafc' }}>
        
        {/* Content Area */}
        <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {activeCategory === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              
              {/* 2-Column Grid for dense settings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>RTMP URL</label>
                  <input type="text" placeholder="rtmp://a.rtmp.youtube.com/live2" className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Stream Key</label>
                    <span style={{ fontSize: '9px', color: '#3b82f6', cursor: 'pointer', fontWeight: 700 }}>Show</span>
                  </div>
                  <input type="password" placeholder="Stream key" className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Preset</label>
                  <select className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }}>
                    <option>Custom</option>
                    <option>YouTube</option>
                    <option>Twitch</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Bitrate (kbps)</label>
                  <input type="number" defaultValue={8000} className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Video Encoder</label>
                  <select className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }}>
                    <option>H.264 (x264)</option>
                    <option>NVENC</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Resolution</label>
                  <select className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }}>
                    <option>1920 x 1080 (16:9)</option>
                    <option>1280 x 720 (16:9)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Audio Encoder</label>
                  <select className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }}>
                    <option>AAC</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Frame Rate</label>
                  <select className="nexus-input" style={{ width: '100%', padding: '4px 6px', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px', color: '#f8fafc', fontSize: 'var(--font-size)' }}>
                    <option>60 fps</option>
                    <option>30 fps</option>
                  </select>
                </div>

              </div>
            </div>
          )}
          {activeCategory !== 'live' && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', fontSize: 'var(--font-size)' }}>
              {activeCategory.toUpperCase()} Settings Under Construction
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', borderTop: '1px solid var(--bg-panel)', background: 'transparent', flexShrink: 0 }}>
          <button className="nexus-btn hover-glow" style={{ flex: 1, height: '32px', boxSizing: 'border-box', padding: '0 8px', fontSize: '11px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '2px', background: '#16a34a', color: '#fff', border: 'none', transition: 'all 0.2s' }}>
            <Radio size={14} /> Start Stream
          </button>
          <button className="nexus-btn hover-glow" style={{ flex: 1, height: '32px', boxSizing: 'border-box', padding: '0 8px', fontSize: '11px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '2px', background: '#2563eb', color: '#fff', border: 'none', transition: 'all 0.2s' }}>
            <Monitor size={14} /> Start Virtual Camera
          </button>
          <button className="nexus-btn hover-glow" style={{ flex: 1, height: '32px', boxSizing: 'border-box', padding: '0 8px', fontSize: '11px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '2px', background: '#dc2626', color: '#fff', border: 'none', transition: 'all 0.2s' }}>
            <Video size={14} /> Start Recording
          </button>
        </div>
      </div>
    </div>
  )
}
