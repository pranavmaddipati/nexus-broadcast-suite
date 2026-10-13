const fs = require('fs');

const audioMixerContent = `import React, { useState, useEffect, useRef } from 'react'
import { useBroadcast } from '../context/BroadcastContext'
import type { SceneSource } from '../context/BroadcastContext'
import { Settings, Volume2, VolumeX, Sliders, X, Check, Eye, Headphones, CircleAlert } from 'lucide-react'

// Tabbed Channel Settings Modal Popup
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  channelName: string
  source: SceneSource | null
  onUpdate: (updates: Partial<SceneSource>) => void
}

const ChannelSettingsModal: React.FC<ModalProps> = ({ isOpen, onClose, channelName, source, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<string>('properties')
  
  const [volume, setVolume] = useState(source?.volume ?? 80)
  const [balance, setBalance] = useState(source?.balance ?? 0)
  const [gain, setGain] = useState(source?.audioGain ?? 0)
  const [delay, setDelay] = useState(source?.audioDelay ?? 0)
  const [monitor, setMonitor] = useState(source?.monitor ?? 'monitor_and_output')
  const [compressor, setCompressor] = useState(source?.compressorEnabled ?? false)
  const [limiter, setLimiter] = useState(source?.limiterEnabled ?? false)
  const [noiseGate, setNoiseGate] = useState(source?.noiseGateEnabled ?? false)
  
  const [autoGain, setAutoGain] = useState(source?.settings?.autoGain ?? true)
  const [noiseSuppression, setNoiseSuppression] = useState(source?.settings?.noiseSuppression ?? false)
  const [expander, setExpander] = useState(source?.settings?.expanderEnabled ?? false)
  const [eqPreset, setEqPreset] = useState(source?.settings?.eqPreset ?? 'flat')
  const [routingMask, setRoutingMask] = useState(source?.settings?.routingMask ?? '11')
  const [eqLowGain, setEqLowGain] = useState(source?.settings?.eqLowGain ?? 0)
  const [eqMidGain, setEqMidGain] = useState(source?.settings?.eqMidGain ?? 0)
  const [eqHighGain, setEqHighGain] = useState(source?.settings?.eqHighGain ?? 0)

  if (!isOpen) return null

  const handleEqPresetChange = (preset: string) => {
    setEqPreset(preset)
    if (preset === 'speech') { setEqLowGain(-6); setEqMidGain(3); setEqHighGain(4) }
    else if (preset === 'music') { setEqLowGain(5); setEqMidGain(-2); setEqHighGain(4) }
    else if (preset === 'bass') { setEqLowGain(8); setEqMidGain(0); setEqHighGain(-2) }
    else if (preset === 'flat') { setEqLowGain(0); setEqMidGain(0); setEqHighGain(0) }
  }

  const handleSave = () => {
    if (source) {
      onUpdate({
        volume, balance, audioGain: gain, audioDelay: delay, monitor,
        compressorEnabled: compressor, limiterEnabled: limiter, noiseGateEnabled: noiseGate,
        settings: {
          ...source?.settings,
          autoGain, noiseSuppression, expanderEnabled: expander, eqPreset, routingMask,
          eqLowGain, eqMidGain, eqHighGain
        }
      })
    }
    onClose()
  }

  const tabs = [
    { id: 'properties', label: 'Properties' },
    { id: 'filters', label: 'Filters' },
    { id: 'dynamics', label: 'Dynamics' },
    { id: 'eq', label: 'EQ' },
    { id: 'routing', label: 'Routing' }
  ]

  return (
    <div className="audio-settings-modal-overlay" onClick={onClose} style={{ zIndex: 1100, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="audio-settings-modal-box" onClick={e => e.stopPropagation()} style={{ background: '#0a0e17', width: '600px', height: '400px', border: '1px solid #1e293b', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <Sliders size={15} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 800 }}>AUDIO SETTINGS - {channelName.toUpperCase()}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={15} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '120px', borderRight: '1px solid #1e293b', padding: '8px 0', background: '#0f131f' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '11px', fontWeight: 700,
                  background: activeTab === tab.id ? '#1e293b' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#64748b',
                  border: 'none', borderLeft: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', color: '#cbd5e1', fontSize: '11px' }}>
            {/* Minimal UI for tab content since we're focusing on the strip */}
            <h4 style={{ color: '#fff', marginBottom: '16px' }}>{tabs.find(t => t.id === activeTab)?.label} Settings</h4>
            
            {activeTab === 'properties' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label>Balance (L/R): {balance.toFixed(1)}</label>
                  <input type="range" min="-1" max="1" step="0.1" value={balance} onChange={e => setBalance(parseFloat(e.target.value))} style={{ accentColor: '#3b82f6' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label>Audio Delay: {delay} ms</label>
                  <input type="range" min="0" max="500" step="10" value={delay} onChange={e => setDelay(parseInt(e.target.value))} style={{ accentColor: '#3b82f6' }} />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>Cancel</button>
          <button onClick={handleSave} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// Single Audio Strip Component
const AudioStrip: React.FC<{ source: SceneSource, onUpdate: (id: string, update: Partial<SceneSource>) => void, onToggleMute: (id: string) => void }> = ({ source, onUpdate, onToggleMute }) => {
  const [showSettings, setShowSettings] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fake VU Meter Animation
  useEffect(() => {
    let animationId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let currentL = 0
    let currentR = 0
    let peakL = 0
    let peakR = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Target based on volume (fake data if not muted)
      const targetL = source.muted ? 0 : Math.random() * (source.volume / 100) * 100
      const targetR = source.muted ? 0 : Math.random() * (source.volume / 100) * 100

      // Smooth decay/attack
      currentL += (targetL - currentL) * 0.3
      currentR += (targetR - currentR) * 0.3
      
      // Hold peaks
      if (currentL > peakL) peakL = currentL
      if (currentR > peakR) peakR = currentR
      peakL *= 0.98
      peakR *= 0.98

      const h = canvas.height
      const w = canvas.width / 2 - 1

      const drawBar = (x: number, level: number, peak: number) => {
        const fillHeight = (level / 100) * h
        const peakY = h - (peak / 100) * h

        // Background
        ctx.fillStyle = '#0f131f'
        ctx.fillRect(x, 0, w, h)

        // Gradient Fill
        const grad = ctx.createLinearGradient(0, h, 0, 0)
        grad.addColorStop(0, '#22c55e')
        grad.addColorStop(0.7, '#eab308')
        grad.addColorStop(0.9, '#ef4444')

        ctx.fillStyle = grad
        ctx.fillRect(x, h - fillHeight, w, fillHeight)

        // Peak line
        if (peak > 0) {
          ctx.fillStyle = '#fff'
          ctx.fillRect(x, peakY, w, 1)
        }
      }

      drawBar(0, currentL, peakL)
      drawBar(canvas.width / 2 + 1, currentR, peakR)

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [source.muted, source.volume])

  const toggleSolo = () => {
    onUpdate(source.id, { settings: { ...source.settings, solo: !source.settings?.solo } })
  }

  const toggleMonitor = () => {
    const nextMap: Record<string, string> = {
      'monitor_off': 'monitor_only',
      'monitor_only': 'monitor_and_output',
      'monitor_and_output': 'monitor_off'
    }
    onUpdate(source.id, { monitor: nextMap[source.monitor || 'monitor_and_output'] })
  }

  const isSolo = source.settings?.solo

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '85px', minWidth: '85px', background: '#0e1322', border: '1px solid #1e293b', borderRadius: '4px', overflow: 'hidden' }}>
      {/* Strip Header */}
      <div style={{ background: '#1e293b', padding: '4px', textAlign: 'center', borderBottom: '1px solid #334155' }}>
        <span style={{ fontSize: '9px', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
          {source.name.substring(0, 10).toUpperCase()}
        </span>
      </div>

      {/* DSP Indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontSize: '8px', fontWeight: 900, color: source.compressorEnabled ? '#3b82f6' : '#334155' }}>CMP</span>
        <span style={{ fontSize: '8px', fontWeight: 900, color: source.limiterEnabled ? '#ef4444' : '#334155' }}>LIM</span>
        <span style={{ fontSize: '8px', fontWeight: 900, color: source.settings?.eqPreset !== 'flat' ? '#22c55e' : '#334155' }}>EQ</span>
      </div>

      {/* Gain & Pan Knobs (Visual Only) */}
      <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #3b82f6', background: '#020408', position: 'relative' }}>
            <div style={{ position: 'absolute', width: '2px', height: '6px', background: '#3b82f6', top: '2px', left: '5px', transform: \`rotate(\${(source.audioGain || 0) * 10}deg)\` }} />
          </div>
          <span style={{ fontSize: '7px', color: '#64748b', marginTop: '2px' }}>GAIN</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #eab308', background: '#020408', position: 'relative' }}>
            <div style={{ position: 'absolute', width: '2px', height: '6px', background: '#eab308', top: '2px', left: '5px', transform: \`rotate(\${(source.balance || 0) * 45}deg)\` }} />
          </div>
          <span style={{ fontSize: '7px', color: '#64748b', marginTop: '2px' }}>PAN</span>
        </div>
      </div>

      {/* Main Fader & VU Area */}
      <div style={{ display: 'flex', flex: 1, padding: '8px 4px', gap: '6px', minHeight: '180px' }}>
        {/* VU Meter */}
        <canvas ref={canvasRef} width="16" height="180" style={{ background: '#020408', borderRadius: '2px' }} />

        {/* Fader Input */}
        <div style={{ display: 'flex', position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <input
            type="range"
            min="0"
            max="100"
            value={source.volume}
            onChange={e => onUpdate(source.id, { volume: parseInt(e.target.value) })}
            style={{ 
              appearance: 'slider-vertical',
              width: '24px', 
              height: '100%',
              margin: 0,
              accentColor: '#38bdf8'
            }}
          />
        </div>
      </div>

      {/* Readout */}
      <div style={{ textAlign: 'center', padding: '2px', background: '#020408', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>
          {source.muted ? '-inf' : \`\${(source.volume - 100).toFixed(1)} dB\`}
        </span>
      </div>

      {/* Controls Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', padding: '4px' }}>
        <button 
          onClick={() => onToggleMute(source.id)}
          style={{ background: source.muted ? '#ef4444' : '#1e293b', color: '#fff', border: 'none', borderRadius: '3px', padding: '4px', fontSize: '9px', fontWeight: 800, cursor: 'pointer' }}
        >
          {source.muted ? 'MUTED' : 'MUTE'}
        </button>
        <button 
          onClick={toggleSolo}
          style={{ background: isSolo ? '#eab308' : '#1e293b', color: isSolo ? '#000' : '#fff', border: 'none', borderRadius: '3px', padding: '4px', fontSize: '9px', fontWeight: 800, cursor: 'pointer' }}
        >
          SOLO
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', padding: '0 4px 4px' }}>
        <button 
          onClick={toggleMonitor}
          style={{ background: source.monitor === 'monitor_off' ? '#1e293b' : '#22c55e', color: '#fff', border: 'none', borderRadius: '3px', padding: '4px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
          title={source.monitor?.replace('_', ' ').toUpperCase()}
        >
          {source.monitor === 'monitor_off' ? <Headphones size={12} color="#64748b" /> : <Headphones size={12} color="#fff" />}
        </button>
        <button 
          onClick={() => setShowSettings(true)}
          style={{ background: '#1e293b', color: '#fff', border: 'none', borderRadius: '3px', padding: '4px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Settings size={12} />
        </button>
      </div>

      {showSettings && (
        <ChannelSettingsModal 
          isOpen={true} 
          onClose={() => setShowSettings(false)} 
          channelName={source.name} 
          source={source} 
          onUpdate={(updates) => onUpdate(source.id, updates)} 
        />
      )}
    </div>
  )
}

export const AudioMixer: React.FC = () => {
  const { scenes = [], activeScene, setChannelVolume = () => {}, toggleChannelMute = () => {}, updateSourceProperties = () => {} } = useBroadcast()
  
  // Aggregate all unique audio sources across all scenes
  const allSources: SceneSource[] = []
  scenes.forEach(scene => {
    scene.sources.forEach(src => {
      if (['camera', 'media', 'audio', 'video', 'ndi', 'browser'].includes(src.type)) {
        if (!allSources.find(s => s.id === src.id)) {
          allSources.push(src)
        }
      }
    })
  })

  return (
    <div className="audio-mixer-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0e17' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #1e293b' }}>
        <span className="panel-title" style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>AUDIO MIXER</span>
        <Sliders size={12} className="text-blue" />
      </div>
      
      <div className="mixer-channels-scroll" style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '8px', display: 'flex', gap: '8px' }}>
        {allSources.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', color: '#64748b', gap: '8px' }}>
            <CircleAlert size={24} />
            <span style={{ fontSize: '11px' }}>No audio sources available.</span>
          </div>
        ) : (
          allSources.map(src => (
            <AudioStrip 
              key={src.id} 
              source={src} 
              onToggleMute={toggleChannelMute} 
              onUpdate={(id, updates) => {
                // Find which scene this belongs to update it properly
                const scene = scenes.find(s => s.sources.some(ss => ss.id === id))
                if (scene) updateSourceProperties(scene.id, id, updates)
              }} 
            />
          ))
        )}

        {/* Master Fader */}
        <div style={{ width: '2px', background: '#1e293b', margin: '0 8px' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '85px', minWidth: '85px', background: '#0f131f', border: '1px solid #3b82f6', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ background: '#1d4ed8', padding: '4px', textAlign: 'center', borderBottom: '1px solid #1e3a8a' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>MASTER</span>
          </div>
          
          <div style={{ flex: 1, padding: '8px 4px', display: 'flex', gap: '6px', minHeight: '180px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              <div style={{ width: '8px', height: '100%', background: '#22c55e', opacity: 0.8 }} />
              <div style={{ width: '8px', height: '100%', background: '#22c55e', opacity: 0.8 }} />
            </div>
            <div style={{ display: 'flex', position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <input type="range" min="0" max="100" defaultValue="100" style={{ appearance: 'slider-vertical', width: '24px', height: '100%', margin: 0, accentColor: '#3b82f6' }} />
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '2px', background: '#020408', borderTop: '1px solid #1e293b' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#3b82f6' }}>0.0 dB</span>
          </div>
        </div>

      </div>
    </div>
  )
}
`

fs.writeFileSync('src/components/AudioMixer.tsx', audioMixerContent);

console.log('AudioMixer refactored');
