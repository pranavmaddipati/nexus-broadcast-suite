import React, { useState } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { StreamDestination } from '../context/NewBroadcastContext'
import { X, Save, Radio, Wifi, Video, Shield, Settings, Server, Plus, Trash2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const LiveSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { destinations = [], updateDestination = () => {}, virtualCameraActive = false, toggleVirtualCamera = () => {} } = useBroadcast()
  const [activeTab, setActiveTab] = useState<string>('profiles')
  const [activeStreamId, setActiveStreamId] = useState<string>('yt')

  // Profiles mock state
  const [profiles, setProfiles] = useState([
    { id: 'prof_default', name: 'Default Production Profile', active: true },
    { id: 'prof_church', name: 'Sunday Service Stream (1080p)', active: false },
    { id: 'prof_mobile', name: 'Mobile Stream Target (720p)', active: false }
  ])
  const [newProfileName, setNewProfileName] = useState('')

  // Streaming specific details
  const [streamProtocol, setStreamProtocol] = useState<'rtmp' | 'srt' | 'rist' | 'ndi'>('rtmp')
  const [srtAddress, setSrtAddress] = useState('srt.example.com')
  const [srtPort, setSrtPort] = useState('9000')
  const [srtMode, setSrtMode] = useState('caller')
  const [srtLatency, setSrtLatency] = useState(120)
  const [srtPassphrase, setSrtPassphrase] = useState('')
  const [srtStreamId, setSrtStreamId] = useState('')

  const [ristAddress, setRistAddress] = useState('rist.example.com')
  const [ristPort, setRistPort] = useState('1900')
  const [ristProfile, setRistProfile] = useState('main')

  const [ndiEnabled, setNdiEnabled] = useState(false)
  const [ndiName, setNdiName] = useState('NexusBroadcast_NDI_Out')

  // Recording sub-states
  const [recQuality, setRecQuality] = useState('high')
  const [recFormat, setRecFormat] = useState('mp4')
  const [recEncoder, setRecEncoder] = useState('nvenc')
  const [recPath, setRecPath] = useState('C:/NexusBroadcast/Recordings')

  // Virtual Camera sub-states
  const [vcamMode, setVcamMode] = useState('program')
  const [vcamFps, setVcamFps] = useState(60)

  // Advanced sub-states
  const [bindIp, setBindIp] = useState('default')
  const [reconnectDelay, setReconnectDelay] = useState(10)
  const [streamDelaySec, setStreamDelaySec] = useState(0)
  const [lowLatency, setLowLatency] = useState(true)

  if (!isOpen) return null

  const activeDest = (destinations || []).find(d => d.id === activeStreamId) || destinations[0]

  const handleUpdateDest = (key: keyof StreamDestination, val: any) => {
    updateDestination(activeStreamId, { [key]: val })
  }

  const handleProfileSelect = (id: string) => {
    setProfiles(prev => (prev || []).map(p => ({ ...p, active: p.id === id })))
  }

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return
    const newP = {
      id: `prof_${Date.now()}`,
      name: newProfileName,
      active: false
    }
    setProfiles(prev => [...prev, newP])
    setNewProfileName('')
  }

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const target = (profiles || []).find(p => p.id === id)
    if (target?.active) return // Don't delete active profile
    setProfiles(prev => (prev || []).filter(p => p.id !== id))
  }

  const tabs = [
    { id: 'profiles', label: 'PROFILES' },
    { id: 'streaming', label: 'STREAMING' },
    { id: 'recording', label: 'RECORDING' },
    { id: 'vcamera', label: 'VIRTUAL CAM' },
    { id: 'advanced', label: 'ADVANCED' }
  ]

  return (
    <div className="output-settings-modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="output-settings-modal-box" style={{ width: '920px', height: '580px' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="title-row">
            <Radio size={16} className="text-blue" />
            <h3>LIVE STREAMING & BROADCAST CONFIGURATION</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal body tabs split */}
        <div className="modal-body-split">
          
          {/* Left vertical tabs list */}
          <div className="modal-tabs-sidebar" style={{ width: '180px' }}>
            {(tabs || []).map(tab => (
              <button
                key={tab.id}
                className={`tab-btn-vertical ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right tab content pane */}
          <div className="modal-tab-content" style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            
            {/* PROFILES TAB */}
            {activeTab === 'profiles' && (
              <div className="settings-section">
                <h4>System Configurations & Profiles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  <div className="field-group">
                    <label>Active Production Profile</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {(profiles || []).map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleProfileSelect(p.id)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: p.active ? 'rgba(59, 130, 246, 0.15)' : '#090d16',
                            border: p.active ? '1px solid #3b82f6' : '1px solid #162238',
                            borderRadius: '2px',
                            padding: '8px 12px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: p.active ? '#3b82f6' : '#475569'
                            }} />
                            <span style={{ fontSize: '11px', color: '#fff', fontWeight: p.active ? 'bold' : 'normal' }}>{p.name}</span>
                          </div>
                          {!p.active && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteProfile(p.id, e)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="field-group" style={{ borderTop: '1px solid #162238', paddingTop: '10px', marginTop: '10px' }}>
                    <label>Create New Profile</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="text"
                        value={newProfileName}
                        placeholder="e.g. Esports Live Stream (60fps)"
                        onChange={e => setNewProfileName(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleAddProfile}
                        style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '0 16px', fontSize: '10px', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        ADD PROFILE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STREAMING TAB */}
            {activeTab === 'streaming' && (
              <div className="settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>Live Streaming Out</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>PROTOCOL:</span>
                    <select
                      value={streamProtocol}
                      onChange={e => setStreamProtocol(e.target.value as any)}
                      style={{ fontSize: '9px', padding: '2px 4px' }}
                    >
                      <option value="rtmp">RTMP Multi-Stream</option>
                      <option value="srt">SRT Secure Reliable Transport</option>
                      <option value="rist">RIST Interoperable Stream</option>
                      <option value="ndi">NDI Master Output</option>
                    </select>
                  </div>
                </div>

                {/* RTMP STREAMS */}
                {streamProtocol === 'rtmp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div className="field-group">
                      <label>Multi-Stream Destination Target</label>
                      <select value={activeStreamId} onChange={e => setActiveStreamId(e.target.value)}>
                        {(destinations || []).map((d, i) => (
                          <option key={d.id} value={d.id}>Target {i + 1} - {d.name.toUpperCase()} {d.enabled ? '(Enabled)' : '(Disabled)'}</option>
                        ))}
                      </select>
                    </div>

                    <div className="settings-fields-grid-live">
                      <div className="field-group">
                        <label>RTMP Server Ingest Endpoint</label>
                        <input
                          type="text"
                          value={activeDest.rtmpUrl}
                          placeholder="rtmp://..."
                          onChange={e => handleUpdateDest('rtmpUrl', e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label>Ingest Stream Key</label>
                        <input
                          type="password"
                          value={activeDest.streamKey}
                          placeholder="xxxx-xxxx-xxxx"
                          onChange={e => handleUpdateDest('streamKey', e.target.value)}
                        />
                      </div>
                      <div className="field-group-row">
                        <div className="field-group flex-1">
                          <label>Resolution Target</label>
                          <select value={activeDest.resolution} onChange={e => handleUpdateDest('resolution', e.target.value)}>
                            <option value="1920x1080">1920x1080 (1080p FHD)</option>
                            <option value="1280x720">1280x720 (720p HD)</option>
                            <option value="854x480">854x480 (480p SD)</option>
                          </select>
                        </div>
                        <div className="field-group flex-1">
                          <label>Framerate Limit</label>
                          <select value={activeDest.fps} onChange={e => handleUpdateDest('fps', parseInt(e.target.value))}>
                            <option value="60">60 FPS</option>
                            <option value="30">30 FPS</option>
                          </select>
                        </div>
                      </div>
                      <div className="field-group-row">
                        <div className="field-group flex-1">
                          <label>Target Video Bitrate (Kbps)</label>
                          <input
                            type="number"
                            value={activeDest.bitrate}
                            onChange={e => handleUpdateDest('bitrate', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="field-group flex-1">
                          <label>Encoder Engine</label>
                          <select value={activeDest.encoder} onChange={e => handleUpdateDest('encoder', e.target.value)}>
                            <option value="nvenc">NVIDIA NVENC H.264 (Hardware)</option>
                            <option value="x264">x264 (Software CPU)</option>
                            <option value="qsv">Intel QuickSync (Hardware)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SRT STREAMS */}
                {streamProtocol === 'srt' && (
                  <div className="settings-fields-grid-live" style={{ marginTop: '10px' }}>
                    <div className="field-group-row">
                      <div className="field-group flex-2">
                        <label>SRT Destination Address</label>
                        <input type="text" value={srtAddress} onChange={e => setSrtAddress(e.target.value)} />
                      </div>
                      <div className="field-group flex-1">
                        <label>Port</label>
                        <input type="number" value={srtPort} onChange={e => setSrtPort(e.target.value)} />
                      </div>
                    </div>
                    <div className="field-group-row">
                      <div className="field-group flex-1">
                        <label>Mode</label>
                        <select value={srtMode} onChange={e => setSrtMode(e.target.value)}>
                          <option value="caller">Caller (Connect to remote listener)</option>
                          <option value="listener">Listener (Wait for remote caller)</option>
                        </select>
                      </div>
                      <div className="field-group flex-1">
                        <label>SRT Latency (ms)</label>
                        <input type="number" value={srtLatency} onChange={e => setSrtLatency(parseInt(e.target.value) || 120)} />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>Encryption Passphrase (Optional)</label>
                      <input type="password" value={srtPassphrase} onChange={e => setSrtPassphrase(e.target.value)} placeholder="Minimum 10 chars" />
                    </div>
                    <div className="field-group">
                      <label>Stream ID (Optional)</label>
                      <input type="text" value={srtStreamId} onChange={e => setSrtStreamId(e.target.value)} />
                    </div>
                  </div>
                )}

                {/* RIST STREAMS */}
                {streamProtocol === 'rist' && (
                  <div className="settings-fields-grid-live" style={{ marginTop: '10px' }}>
                    <div className="field-group-row">
                      <div className="field-group flex-2">
                        <label>RIST Target Address</label>
                        <input type="text" value={ristAddress} onChange={e => setRistAddress(e.target.value)} />
                      </div>
                      <div className="field-group flex-1">
                        <label>Port</label>
                        <input type="number" value={ristPort} onChange={e => setRistPort(e.target.value)} />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>RIST Profile</label>
                      <select value={ristProfile} onChange={e => setRistProfile(e.target.value)}>
                        <option value="main">Main Profile</option>
                        <option value="simple">Simple Profile</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* NDI STREAM */}
                {streamProtocol === 'ndi' && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="field-group">
                      <label className="checkbox-row-custom">
                        <input
                          type="checkbox"
                          checked={ndiEnabled}
                          onChange={e => setNdiEnabled(e.target.checked)}
                        />
                        <span>Enable NDI Master Output (LAN Broadcast)</span>
                      </label>
                    </div>
                    <div className="field-group">
                      <label>NDI Output Stream Name</label>
                      <input
                        type="text"
                        value={ndiName}
                        onChange={e => setNdiName(e.target.value)}
                      />
                    </div>
                    <div className="ndi-status-box-mock" style={{ marginTop: '8px' }}>
                      <Wifi size={14} className={ndiEnabled ? 'text-green' : 'text-gray'} />
                      <span>STATUS: {ndiEnabled ? 'BROADCASTING NDI LIVE' : 'NDI OUT INACTIVE'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RECORDING TAB */}
            {activeTab === 'recording' && (
              <div className="settings-section">
                <h4>Recording Properties</h4>
                <div className="settings-fields-grid-live" style={{ marginTop: '10px' }}>
                  <div className="field-group">
                    <label>Recording Quality Profile</label>
                    <select value={recQuality} onChange={e => setRecQuality(e.target.value)}>
                      <option value="same">Same as stream output</option>
                      <option value="high">High Quality (Medium file size)</option>
                      <option value="indistinguishable">Indistinguishable Quality (Large file size)</option>
                      <option value="lossless">Lossless Quality (Extremely large file size)</option>
                    </select>
                  </div>
                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Recording File Format</label>
                      <select value={recFormat} onChange={e => setRecFormat(e.target.value)}>
                        <option value="mp4">MP4 (.mp4)</option>
                        <option value="mkv">MKV (.mkv)</option>
                        <option value="flv">FLV (.flv)</option>
                        <option value="mov">MOV (.mov)</option>
                      </select>
                    </div>
                    <div className="field-group flex-1">
                      <label>Encoder Engine</label>
                      <select value={recEncoder} onChange={e => setRecEncoder(e.target.value)}>
                        <option value="nvenc">NVIDIA NVENC H.264 (Hardware)</option>
                        <option value="x264">x264 (CPU)</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Recording Save Directory</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={recPath}
                        onChange={e => setRecPath(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '0 12px', fontSize: '9px', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        BROWSE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIRTUAL CAMERA TAB */}
            {activeTab === 'vcamera' && (
              <div className="settings-section">
                <h4>DirectShow Virtual Camera (Zoom, Discord, Teams)</h4>
                <div className="settings-fields-grid-live" style={{ marginTop: '10px' }}>
                  <div className="field-group">
                    <label>Output Feed Source</label>
                    <select value={vcamMode} onChange={e => setVcamMode(e.target.value)}>
                      <option value="program">Master Program Output</option>
                      <option value="preview">Preview Output</option>
                      <option value="sceneA">Scene A Feed</option>
                      <option value="sceneB">Scene B Feed</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Output Framerate</label>
                    <select value={vcamFps} onChange={e => setVcamFps(parseInt(e.target.value))}>
                      <option value="60">60 FPS (Progressive)</option>
                      <option value="30">30 FPS (Progressive)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', background: '#090d16', padding: '12px', borderRadius: '2px', border: '1px solid #162238' }}>
                    <button
                      type="button"
                      onClick={toggleVirtualCamera}
                      style={{
                        background: virtualCameraActive ? '#ef4444' : '#10b981',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        padding: '6px 14px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {virtualCameraActive ? 'STOP VIRTUAL CAMERA' : 'START VIRTUAL CAMERA'}
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: virtualCameraActive ? '#10b981' : '#64748b' }}>
                        STATUS: {virtualCameraActive ? 'ACTIVE (BROADCASTING DEVICE: Nexus Broadcast Virtual Camera)' : 'INACTIVE'}
                      </span>
                      <span style={{ fontSize: '8px', color: '#64748b' }}>
                        Register friendly name and output filter are loaded.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="settings-section">
                <h4>Advanced Ingest & Network Options</h4>
                <div className="settings-fields-grid-live" style={{ marginTop: '10px' }}>
                  <div className="field-group">
                    <label>Bind to Network Interface IP</label>
                    <select value={bindIp} onChange={e => setBindIp(e.target.value)}>
                      <option value="default">Default Interface (All IPs)</option>
                      <option value="ethernet">Ethernet 1 (192.168.1.55)</option>
                      <option value="wifi">Wireless LAN (192.168.1.120)</option>
                    </select>
                  </div>
                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Reconnect Retry Delay (seconds)</label>
                      <input type="number" value={reconnectDelay} onChange={e => setReconnectDelay(parseInt(e.target.value) || 10)} />
                    </div>
                    <div className="field-group flex-1">
                      <label>Stream Sniping Delay (seconds)</label>
                      <input type="number" value={streamDelaySec} onChange={e => setStreamDelaySec(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="checkbox-row-custom">
                      <input
                        type="checkbox"
                        checked={lowLatency}
                        onChange={e => setLowLatency(e.target.checked)}
                      />
                      <span>Enable Ultra Low Latency Mode (Optimize for RTMP/SRT sub-second feed)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px', background: '#090d16', borderTop: '1px solid #162238' }}>
          <button type="button" className="save-btn" onClick={onClose} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            <span>SAVE & CLOSE</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default LiveSettingsModal
