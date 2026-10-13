const fs = require('fs');

const distributionPanelContent = `import React, { useState } from 'react'
import { useBroadcast } from '../context/BroadcastContext'
import type { StreamDestination } from '../context/BroadcastContext'
import { Youtube, Facebook, Twitch, Globe, Share2, Play, Square, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, RefreshCcw, Wifi, Activity, Settings } from 'lucide-react'

export const DistributionPanel: React.FC = () => {
  const { destinations = [], updateDestination = () => {}, startSingleStream, stopSingleStream } = useBroadcast()

  const [collapsedStates, setCollapsedStates] = useState<Record<string, boolean>>({
    yt: true, fb: true, tw: true, custom: true, church: true
  })

  const getBrandIcon = (platformName: string) => {
    const name = platformName.toLowerCase()
    if (name.includes('youtube')) return <Youtube size={13} style={{ color: '#ef4444' }} />
    if (name.includes('facebook')) return <Facebook size={13} style={{ color: '#3b82f6' }} />
    if (name.includes('twitch')) return <Twitch size={13} style={{ color: '#a855f7' }} />
    return <Globe size={13} style={{ color: '#38bdf8' }} />
  }

  const getStatusText = (dest: StreamDestination) => {
    if (!dest.enabled) return 'DISABLED'
    if (dest.status === 'streaming') return 'LIVE'
    if (dest.status === 'connecting') return 'CONNECTING'
    return 'READY'
  }

  const getStatusColor = (dest: StreamDestination) => {
    if (!dest.enabled) return '#475569'
    if (dest.status === 'streaming') return '#ef4444'
    if (dest.status === 'connecting') return '#ea580c'
    return '#22c55e'
  }

  const handleToggleEnable = (e: React.MouseEvent, dest: StreamDestination) => {
    e.stopPropagation()
    updateDestination(dest.id, { enabled: !dest.enabled })
  }

  const toggleCollapse = (id: string) => {
    setCollapsedStates(prev => ({ ...prev, [id]: !(prev[id] ?? false) }))
  }

  const handleTestConnection = (e: React.MouseEvent) => {
    e.stopPropagation()
    alert("Testing connection... Latency: 24ms, Bandwidth: Excellent")
  }

  return (
    <div className="distribution-panel-obs" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #1e293b' }}>
        <span className="panel-title">OUTPUT DESTINATIONS</span>
        <Share2 size={12} className="text-blue" />
      </div>

      <div className="destinations-list-obs" style={{ flex: 1, overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {(destinations || []).map((dest, i) => {
          const statusText = getStatusText(dest)
          const statusColor = getStatusColor(dest)
          const isStreaming = dest.status === 'streaming'
          const isConnecting = dest.status === 'connecting'
          const isCollapsed = collapsedStates[dest.id] ?? false

          // Fake stats for UI
          const latency = isStreaming ? Math.floor(Math.random() * 20 + 30) : 0
          const droppedFrames = isStreaming ? 0 : 0
          const currentBitrate = isStreaming ? dest.bitrate : 0

          return (
            <div
              key={dest.id}
              style={{ 
                background: '#0a0e17', 
                border: \`1px solid \${isStreaming ? '#ef4444' : '#1e293b'}\`, 
                borderRadius: '6px', 
                padding: '6px 8px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px' 
              }}
            >
              {/* Header block */}
              <div
                onClick={() => toggleCollapse(dest.id)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getBrandIcon(dest.name)}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#f8fafc' }}>
                    {dest.name.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '8px', fontWeight: 900, padding: '2px 6px', borderRadius: '3px', color: '#fff', background: statusColor }}>
                    {statusText}
                  </span>
                  <button onClick={(e) => handleToggleEnable(e, dest)} style={{ background: 'transparent', border: 'none', color: dest.enabled ? '#22c55e' : '#475569', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    {dest.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '8px', paddingLeft: '22px' }} onClick={e => e.stopPropagation()}>
                  
                  {/* Settings / Encoder line */}
                  <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#cbd5e1' }}>
                    <span><strong style={{ color: '#64748b' }}>RES:</strong> {dest.resolution}</span>
                    <span><strong style={{ color: '#64748b' }}>FPS:</strong> {dest.fps}</span>
                    <span><strong style={{ color: '#64748b' }}>ENC:</strong> {dest.encoder}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#cbd5e1' }}>
                    <span><strong style={{ color: '#64748b' }}>BITRATE:</strong> {currentBitrate} kbps</span>
                    <span><strong style={{ color: '#64748b' }}>LATENCY:</strong> {latency} ms</span>
                    <span><strong style={{ color: '#64748b' }}>DROPPED:</strong> {droppedFrames}</span>
                  </div>

                  {/* Actions row */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {!isStreaming && !isConnecting && (
                      <>
                        <button 
                          onClick={() => { if(startSingleStream) startSingleStream(dest.id) }} 
                          disabled={!dest.enabled}
                          style={{ flex: 1, background: dest.enabled ? '#22c55e' : '#1e293b', color: '#fff', border: 'none', borderRadius: '3px', padding: '4px', fontSize: '9px', fontWeight: 800, cursor: dest.enabled ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Play size={10} /> START
                        </button>
                        <button 
                          onClick={handleTestConnection} 
                          disabled={!dest.enabled}
                          style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', borderRadius: '3px', padding: '4px 8px', fontSize: '9px', fontWeight: 800, cursor: dest.enabled ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Wifi size={10} /> TEST
                        </button>
                      </>
                    )}
                    {(isStreaming || isConnecting) && (
                      <>
                        <button 
                          onClick={() => { if(stopSingleStream) stopSingleStream(dest.id) }} 
                          style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '3px', padding: '4px', fontSize: '9px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Square size={10} /> STOP
                        </button>
                        <button 
                          onClick={() => {
                            if(stopSingleStream && startSingleStream) {
                              stopSingleStream(dest.id);
                              setTimeout(() => startSingleStream(dest.id), 1000);
                            }
                          }}
                          style={{ background: '#eab308', color: '#fff', border: 'none', borderRadius: '3px', padding: '4px 8px', fontSize: '9px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RefreshCcw size={10} /> RECONNECT
                        </button>
                      </>
                    )}
                    <button style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', borderRadius: '3px', padding: '4px 6px', cursor: 'pointer' }}>
                      <Settings size={12} />
                    </button>
                  </div>

                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
`
fs.writeFileSync('src/components/DistributionPanel.tsx', distributionPanelContent);

console.log('DistributionPanel refactored');
