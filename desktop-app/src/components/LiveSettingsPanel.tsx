import React, { useState } from 'react'
import { Settings } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'

export const LiveSettingsPanel: React.FC = () => {
  const {
    destinations = [],
    isStreaming = false,
    isRecording = false,
    virtualCameraActive = false,
    ndiEnabled = true,
    ndiName = 'NEXUS-NEWS-STUDIO'
  } = useBroadcast()

  const [activeTab, setActiveTab] = useState<'NDI / VC / SRT' | 'Output' | 'Recording'>('NDI / VC / SRT')

  return (
    <div
      className="live-settings-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#070f1e',
        boxSizing: 'border-box',
        padding: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        className="panel-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '6px',
          borderBottom: 'none'
        }}
      >
        <Settings size={12} color="var(--text-secondary, #94a3b8)" />
        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
          LIVE SETTINGS
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexShrink: 0 }}>
        {(['NDI / VC / SRT', 'Output', 'Recording'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '2px 6px',
              fontSize: '8.5px',
              fontWeight: 700,
              borderRadius: '3px',
              border: activeTab === tab ? '1px solid #1f6fe0' : '1px solid transparent',
              background: activeTab === tab ? '#1f6fe0' : 'rgba(255,255,255,0.04)',
              color: activeTab === tab ? '#ffffff' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {activeTab === 'NDI / VC / SRT' && (
          <>
            {/* NDI Output Section */}
            <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '5px 7px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800, letterSpacing: '0.06em' }}>NDI OUTPUT</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '2px' }}>
                <span style={{ color: '#94a3b8' }}>Status</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px' }}>
                <span style={{ color: '#94a3b8' }}>Name</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{ndiName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px' }}>
                <span style={{ color: '#94a3b8' }}>Group</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Global-News</span>
              </div>
            </div>

            {/* Virtual Camera Section */}
            <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '5px 7px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800, letterSpacing: '0.06em' }}>VIRTUAL CAMERA</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '2px' }}>
                <span style={{ color: '#94a3b8' }}>Status</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px' }}>
                <span style={{ color: '#94a3b8' }}>Camera Name</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Nexus Virtual Cam</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px' }}>
                <span style={{ color: '#94a3b8' }}>Resolution</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>1080p60</span>
              </div>
            </div>

            {/* SRT Output Section */}
            <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '5px 7px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800, letterSpacing: '0.06em' }}>SRT OUTPUT</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '2px' }}>
                <span style={{ color: '#94a3b8' }}>Mode</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Listener</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px' }}>
                <span style={{ color: '#94a3b8' }}>Port</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>8890</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px' }}>
                <span style={{ color: '#94a3b8' }}>Latency</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>120 ms Connected</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Output' && (
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800 }}>STREAM DESTINATIONS</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '4px' }}>
              <span style={{ color: '#94a3b8' }}>YouTube Live</span>
              <span style={{ color: isStreaming ? '#22c55e' : '#64748b', fontWeight: 700 }}>{isStreaming ? 'Streaming' : 'Ready'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Twitch</span>
              <span style={{ color: isStreaming ? '#22c55e' : '#64748b', fontWeight: 700 }}>{isStreaming ? 'Streaming' : 'Ready'}</span>
            </div>
          </div>
        )}

        {activeTab === 'Recording' && (
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800 }}>LOCAL RECORDING</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Codec</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>ProRes 422 / H.264</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Bitrate</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>50 Mbps</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '4px' }}>
              <span style={{ color: '#94a3b8' }}>State</span>
              <span style={{ color: isRecording ? '#ef4444' : '#64748b', fontWeight: 700 }}>{isRecording ? 'Active' : 'Standby'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
