import React, { useState } from 'react'
import { Minus, Pause, Play, Plus, Square, Settings, Disc } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

// Waveform path generator for broadcast multitrack lanes
const renderWaveform = (seed: number, color: string, width = 600, height = 28) => {
  const bars = Math.floor(width / 4)
  const elements = []
  for (let i = 0; i < bars; i++) {
    // Generate organic voice-like amplitude envelopes
    const envelope = Math.sin((i / bars) * Math.PI * (1 + (seed % 3)))
    const noise = Math.abs(Math.sin((i + seed * 13) * 0.4) * Math.cos((i * 0.2) + seed))
    const amp = Math.max(2, Math.min(height - 4, envelope * noise * (height - 6)))
    const x = i * 4 + 2
    const y = (height - amp) / 2
    elements.push(
      <rect
        key={i}
        x={x}
        y={y}
        width={2}
        height={amp}
        rx={1}
        fill={color}
        opacity={0.85}
      />
    )
  }
  return elements
}

export const MultitrackTimeline: React.FC = () => {
  const {
    isRecording = false,
    isRecordingPaused = false,
    recordingDuration = 5534, // Default to broadcast session time 01:32:14
    startRecording,
    stopRecording,
    pauseRecording,
    scenes = [],
    liveScene
  } = useBroadcast()

  const [zoom, setZoom] = useState(50)
  const [isPlaying, setIsPlaying] = useState(false)

  // Standard broadcast tracks
  const defaultTracks = [
    { id: 'trk_cam1', name: 'CAM 1 - Anchor', color: '#38bdf8', seed: 1 },
    { id: 'trk_cam2', name: 'CAM 2 - Guest', color: '#00e5ff', seed: 4 },
    { id: 'trk_cam3', name: 'CAM 3 - Desk Wide', color: '#a855f7', seed: 7 },
    { id: 'trk_cam4', name: 'CAM 4 - Field Reporter', color: '#22c55e', seed: 9 },
    { id: 'trk_pgm', name: 'Program Mix', color: '#eab308', seed: 3 },
    { id: 'trk_studio', name: 'Studio Audio Mix', color: '#f97316', seed: 6 }
  ]

  const activeScene = scenes.find((s: any) => s.id === liveScene)
  const sceneSources = activeScene?.sources?.filter((src: any) => src.type === 'camera' || src.type === 'audio' || src.type === 'media') || []

  const tracks = sceneSources.length >= 4 
    ? sceneSources.map((s: any, idx: number) => ({
        id: s.id,
        name: s.name,
        color: ['#38bdf8', '#00e5ff', '#a855f7', '#22c55e', '#eab308', '#f97316'][idx % 6],
        seed: idx + 2
      }))
    : defaultTracks

  const displayTime = isRecording ? formatTime(recordingDuration) : '01:32:14'
  const maxTime = '02:00:00'

  return (
    <div
      className="multitrack-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#070f1e',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Panel Header */}
      <div
        className="panel-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          height: '24px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isRecording ? '#ef4444' : '#38bdf8',
              boxShadow: isRecording ? '0 0 6px #ef4444' : '0 0 4px #38bdf8'
            }}
          />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
            MULTITRACK RECORDING
          </span>
        </div>

        <span
          style={{
            fontSize: '9px',
            fontFamily: 'var(--mono, monospace)',
            fontWeight: 700,
            color: isRecording ? '#ef4444' : '#64748b'
          }}
        >
          {isRecordingPaused ? 'Paused' : isRecording ? 'Recording' : 'Stopped'}
        </span>
      </div>

      {/* Time Ruler */}
      <div
        style={{
          display: 'flex',
          height: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#040914',
          alignItems: 'center',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        {/* Track Label Spacer */}
        <div style={{ width: '130px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Ruler Timestamps */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 16px',
            fontSize: '8px',
            color: '#64748b',
            fontFamily: 'var(--mono, monospace)',
            fontWeight: 600
          }}
        >
          <span>01:32:00</span>
          <span>01:32:10</span>
          <span style={{ color: '#ef4444', fontWeight: 800 }}>01:32:14</span>
          <span>01:32:20</span>
          <span>01:32:30</span>
          <span>01:32:40</span>
        </div>
      </div>

      {/* Tracks Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '2px 0'
        }}
      >
        {/* Red Vertical Playhead */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(130px + 38%)',
            top: 0,
            bottom: 0,
            width: '1px',
            background: '#ef4444',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          {/* Top Marker Badge */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-18px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '7px',
              fontFamily: 'var(--mono, monospace)',
              fontWeight: 800,
              padding: '1px 3px',
              borderRadius: '2px'
            }}
          >
            01:32:14
          </div>
        </div>

        {/* Individual Tracks */}
        {tracks.map((track) => (
          <div
            key={track.id}
            style={{
              display: 'flex',
              height: '28px',
              minHeight: '28px',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              position: 'relative'
            }}
          >
            {/* Left Track Label */}
            <div
              style={{
                width: '130px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontSize: '9px',
                fontWeight: 700,
                color: '#e2e8f0',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                gap: '6px'
              }}
            >
              <div style={{ width: '4px', height: '14px', borderRadius: '1px', background: track.color }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</span>
            </div>

            {/* Waveform Lane */}
            <div
              style={{
                flex: 1,
                height: '100%',
                position: 'relative',
                background: 'rgba(2, 6, 23, 0.6)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="100%" height="24" style={{ display: 'block' }}>
                {renderWaveform(track.seed, track.color)}
              </svg>

              {/* Marker labels */}
              {track.id === 'trk_cam3' && (
                <div style={{ position: 'absolute', left: '38%', top: '4px', fontSize: '7px', fontWeight: 800, color: '#ef4444', background: 'rgba(0,0,0,0.6)', padding: '0 3px', borderRadius: '2px' }}>
                  SS
                </div>
              )}
              {track.id === 'trk_cam1' && (
                <div style={{ position: 'absolute', left: '42%', top: '4px', fontSize: '7px', fontWeight: 800, color: '#38bdf8', background: 'rgba(0,0,0,0.6)', padding: '0 3px', borderRadius: '2px' }}>
                  G3
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Controls Footer */}
      <div
        style={{
          height: '32px',
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          background: '#040914'
        }}
      >
        {/* Transport controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            title="Stop"
            onClick={() => { setIsPlaying(false); if (isRecording) stopRecording() }}
            style={{
              width: '22px',
              height: '22px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <Square size={9} />
          </button>

          <button
            type="button"
            title={isPlaying ? "Pause" : "Play"}
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '22px',
              height: '22px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
          </button>

          {/* Record button */}
          <button
            type="button"
            title={isRecording ? "Stop Recording" : "Start Recording"}
            onClick={() => isRecording ? stopRecording() : startRecording()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              height: '22px',
              background: isRecording ? '#dc2626' : 'rgba(220, 38, 38, 0.15)',
              border: '1px solid #dc2626',
              borderRadius: '3px',
              color: '#fff',
              fontSize: '8.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: isRecording ? '0 0 8px rgba(220,38,38,0.6)' : 'none'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
            REC
          </button>
        </div>

        {/* Timecode display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800, fontFamily: 'var(--mono, monospace)' }}>
            {displayTime}
          </span>
          <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'var(--mono, monospace)' }}>
            / {maxTime}
          </span>
        </div>

        {/* Right tools: Zoom, Add Track, Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Minus size={10} color="#64748b" />
            <input
              aria-label="Timeline zoom"
              type="range"
              min="10"
              max="100"
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              style={{ width: '50px', height: '3px', accentColor: '#38bdf8' }}
            />
            <Plus size={10} color="#64748b" />
          </div>

          <button
            type="button"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '3px',
              color: '#94a3b8',
              fontSize: '8px',
              fontWeight: 700,
              padding: '2px 6px',
              height: '20px',
              cursor: 'pointer'
            }}
          >
            Add Track
          </button>

          <button
            type="button"
            title="Timeline Settings"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Settings size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
