import React, { useState, useMemo } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'

interface ConsoleChannel {
  id: string
  name: string
  type: string
  db: number
  fader: number // 0 - 100
  muted: boolean
  solo: boolean
  peak: number // 0 - 1
  vu: number
}

export const AudioMixer: React.FC = () => {
  const {
    scenes = [],
    liveScene,
    activeScene,
    audioMeterLevels = {},
    setChannelVolume,
    toggleChannelMute,
    toggleChannelSolo,
    masterVolume = 90,
    setMasterVolume,
    masterMuted = false,
    toggleMasterMute
  } = useBroadcast()

  const [activeTab, setActiveTab] = useState<'Main' | 'Backup' | 'Field' | 'Web' | 'Guest'>('Main')

  // Derive audio-capable sources from current live or active scene
  const channels = useMemo<ConsoleChannel[]>(() => {
    const currentScene =
      (scenes || []).find(s => s.id === liveScene) ||
      (scenes || []).find(s => s.id === activeScene) ||
      scenes[0]

    let sceneSources = (currentScene?.sources || []).filter(src =>
      ['audio', 'media', 'video', 'camera', 'ndi'].includes(src.type)
    )

    // Fallback: if current scene has no audio sources, gather audio sources across all scenes
    if (sceneSources.length === 0) {
      const allAudioSources = (scenes || []).flatMap(s => s.sources || []).filter(src =>
        ['audio', 'media', 'video', 'camera', 'ndi'].includes(src.type)
      )
      const seen = new Set<string>()
      sceneSources = allAudioSources.filter(src => {
        if (seen.has(src.id)) return false
        seen.add(src.id)
        return true
      })
    }

    // Filter by selected tab category
    let filteredSources = sceneSources
    if (activeTab === 'Field') {
      const matched = sceneSources.filter(s => s.type === 'camera' || s.type === 'audio')
      if (matched.length > 0) filteredSources = matched
    } else if (activeTab === 'Web') {
      const matched = sceneSources.filter(s => s.type === 'ndi' || s.type === 'media' || s.type === 'video')
      if (matched.length > 0) filteredSources = matched
    } else if (activeTab === 'Backup') {
      const matched = sceneSources.filter(s => s.name.toLowerCase().includes('backup'))
      if (matched.length > 0) filteredSources = matched
    } else if (activeTab === 'Guest') {
      const matched = sceneSources.filter(s => s.name.toLowerCase().includes('guest') || s.type === 'audio')
      if (matched.length > 0) filteredSources = matched
    }

    // Map sources to channels
    const sourceChannels: ConsoleChannel[] = filteredSources.map(src => {
      const meter = audioMeterLevels[src.id] || { vu: 0, peak: 0, db: -60 }
      return {
        id: src.id,
        name: src.name.toUpperCase(),
        type: src.type,
        db: meter.db,
        fader: src.volume ?? 80,
        muted: src.muted ?? false,
        solo: src.solo ?? false,
        peak: meter.peak,
        vu: meter.vu
      }
    })

    // Add Master Channel
    const masterMeter = audioMeterLevels['master'] || { vu: 0, peak: 0, db: -60 }
    const masterChannel: ConsoleChannel = {
      id: 'master',
      name: 'MASTER',
      type: 'master',
      db: masterMeter.db,
      fader: masterVolume,
      muted: masterMuted,
      solo: false,
      peak: masterMeter.peak,
      vu: masterMeter.vu
    }

    return [...sourceChannels, masterChannel]
  }, [scenes, liveScene, activeScene, activeTab, audioMeterLevels, masterVolume, masterMuted])

  const toggleMute = (id: string) => {
    if (id === 'master') {
      toggleMasterMute?.()
    } else {
      toggleChannelMute?.(id)
    }
  }

  const toggleSolo = (id: string) => {
    if (id === 'master') return
    toggleChannelSolo?.(id)
  }

  const handleFaderChange = (id: string, val: number) => {
    if (id === 'master') {
      setMasterVolume?.(val)
    } else {
      setChannelVolume?.(id, val)
    }
  }

  return (
    <div
      className="audio-mixer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#070f1e',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '8px'
      }}
    >
      {/* Header */}
      <div
        className="panel-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
          borderBottom: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 6px #00E5FF' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
            AUDIO MIXER
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '10px',
          flexShrink: 0
        }}
      >
        {(['Main', 'Backup', 'Field', 'Web', 'Guest'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '3px 8px',
              fontSize: '9.5px',
              fontWeight: 700,
              borderRadius: '4px',
              border: activeTab === tab ? '1px solid #38bdf8' : '1px solid transparent',
              background: activeTab === tab ? '#1f6fe0' : 'rgba(255,255,255,0.04)',
              color: activeTab === tab ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Faders Row */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          gap: '6px',
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '2px'
        }}
      >
        {channels.map(channel => {
          const isMaster = channel.id === 'master'
          const isMuted = channel.muted
          const isSolo = channel.solo
          const peakHeight = isMuted ? 0 : Math.min(100, Math.round(channel.peak * 100))

          return (
            <div
              key={channel.id}
              style={{
                flex: 1,
                minWidth: '38px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                background: isMaster ? 'rgba(14, 116, 144, 0.15)' : 'rgba(2, 6, 23, 0.4)',
                border: isMaster ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
                borderRadius: '4px',
                padding: '4px 2px',
                boxSizing: 'border-box'
              }}
            >
              {/* Channel Label */}
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  color: isMaster ? '#38bdf8' : '#e2e8f0',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                {channel.name}
              </span>

              {/* dB readout */}
              <span
                style={{
                  fontSize: '8px',
                  fontFamily: 'var(--mono, monospace)',
                  color: isMuted ? '#ef4444' : '#64748b',
                  fontWeight: 700,
                  margin: '1px 0 4px 0'
                }}
              >
                {isMuted ? 'MUTE' : channel.peak <= 0.001 ? '-INF dB' : `${channel.db > 0 ? '+' : ''}${channel.db} dB`}
              </span>

              {/* Meter and Fader Stack */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  width: '100%',
                  position: 'relative'
                }}
              >
                {/* Vertical LED VU Meter */}
                <div
                  style={{
                    width: '6px',
                    height: '100%',
                    background: '#020617',
                    borderRadius: '2px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column-reverse'
                  }}
                >
                  {/* Segmented meter fill */}
                  <div
                    style={{
                      width: '100%',
                      height: `${peakHeight}%`,
                      background: isMaster
                        ? 'linear-gradient(to top, #0284c7 0%, #38bdf8 65%, #f59e0b 85%, #ef4444 100%)'
                        : 'linear-gradient(to top, #22c55e 0%, #22c55e 65%, #eab308 80%, #ef4444 100%)',
                      boxShadow: peakHeight > 85 ? '0 0 6px #ef4444' : 'none',
                      transition: 'height 0.08s ease-out'
                    }}
                  />
                </div>

                {/* Vertical Fader Track */}
                <div
                  style={{
                    width: '16px',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Center slot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      bottom: '6px',
                      width: '3px',
                      background: '#020617',
                      borderRadius: '1.5px',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  />

                  {/* Range Slider for Fader */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    aria-label={`${channel.name} volume fader`}
                    value={channel.fader}
                    onChange={e => handleFaderChange(channel.id, Number(e.target.value))}
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      width: '16px',
                      height: 'calc(100% - 10px)',
                      margin: 0,
                      cursor: 'pointer',
                      zIndex: 2,
                      opacity: 0.9,
                      accentColor: isMaster ? '#38bdf8' : '#22c55e'
                    }}
                  />
                </div>
              </div>

              {/* Mute and Solo Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  marginTop: '4px',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <button
                  type="button"
                  title={`Mute ${channel.name}`}
                  onClick={() => toggleMute(channel.id)}
                  style={{
                    width: '15px',
                    height: '15px',
                    fontSize: '7.5px',
                    fontWeight: 800,
                    borderRadius: '2px',
                    border: isMuted ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.04)',
                    color: isMuted ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  M
                </button>

                {!isMaster && (
                  <button
                    type="button"
                    title={`Solo ${channel.name}`}
                    onClick={() => toggleSolo(channel.id)}
                    style={{
                      width: '15px',
                      height: '15px',
                      fontSize: '7.5px',
                      fontWeight: 800,
                      borderRadius: '2px',
                      border: isSolo ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      background: isSolo ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                      color: isSolo ? '#000000' : '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    S
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
