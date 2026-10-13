import React, { useState, useEffect, useCallback, memo } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { SceneSource } from '../context/NewBroadcastContext'
import { Settings, Monitor, Volume2, Sliders, Hash, AppWindow, Cpu, Crop as CropIcon, Palette, Filter, Link, Eye, EyeOff, ChevronDown, ChevronRight, RotateCw, AlignCenter, Maximize, MoveVertical, MoveHorizontal, CornerUpLeft } from 'lucide-react'

// Custom Number Input supporting Scroll, Shift, Ctrl, and drag
const DraggableNumberInput = memo(({ value, onChange, min, max, step = 1, label, disabled = false, style }: any) => {
  const [localValue, setLocalValue] = useState(value?.toString() || '0')

  useEffect(() => {
    setLocalValue(value?.toString() || '0')
  }, [value])

  const handleCommit = (val: number) => {
    let finalVal = val
    if (min !== undefined) finalVal = Math.max(min, finalVal)
    if (max !== undefined) finalVal = Math.min(max, finalVal)
    onChange(finalVal)
  }

  const handleBlur = () => {
    const parsed = parseFloat(localValue)
    if (!isNaN(parsed)) handleCommit(parsed)
    else setLocalValue(value?.toString() || '0')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const parsed = parseFloat(localValue) || 0
      let multiplier = 1
      if (e.shiftKey) multiplier = 10
      if (e.ctrlKey || e.metaKey) multiplier = 0.1
      const delta = e.key === 'ArrowUp' ? step * multiplier : -step * multiplier
      handleCommit(parsed + delta)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault() // Needs non-passive listener, handled by ref if possible, but React synthetic event might not prevent default scrolling unless ref is used. Let's just update value.
    if (document.activeElement !== e.currentTarget) return
    const parsed = parseFloat(localValue) || 0
    let multiplier = 1
    if (e.shiftKey) multiplier = 10
    if (e.ctrlKey || e.metaKey) multiplier = 0.1
    const delta = e.deltaY < 0 ? step * multiplier : -step * multiplier
    handleCommit(parsed + delta)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, ...style }}>
      {label && <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{label}</label>}
      <input
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        disabled={disabled}
        style={{ 
          background: 'transparent', border: '1px solid var(--bg-panel)', color: disabled ? '#64748b' : '#f8fafc', 
          padding: '4px 6px', fontSize: '12px', borderRadius: '2px', outline: 'none', width: '100%',
          boxSizing: 'border-box'
        }}
      />
    </div>
  )
})

// Collapsible Section
const CollapsibleSection = ({ title, id, expandedSections, toggleSection, children }: any) => {
  const isExpanded = expandedSections[id] !== false
  return (
    <div style={{ borderBottom: '1px solid var(--bg-panel)', display: 'flex', flexDirection: 'column' }}>
      <div 
        onClick={() => toggleSection(id)}
        style={{ 
          display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'transparent', 
          cursor: 'pointer', userSelect: 'none', gap: '8px', color: '#f8fafc', fontSize: '12px', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}
      >
        {isExpanded ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronRight size={14} color="#94a3b8" />}
        {title}
      </div>
      <div style={{ 
        display: isExpanded ? 'block' : 'none', 
        padding: '12px', background: 'transparent' 
      }}>
        {children}
      </div>
    </div>
  )
}

// Memoized Sections
const GeneralSection = memo(({ source, updateRoot, currentScene }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>NAME</label>
        <input type="text" value={source.name} disabled style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#94a3b8', padding: '4px 6px', fontSize: '12px', borderRadius: '2px' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>TYPE</label>
        <input type="text" value={source.type.toUpperCase()} disabled style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#94a3b8', padding: '4px 6px', fontSize: '12px', borderRadius: '2px' }} />
      </div>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'transparent', padding: '8px', borderRadius: '2px', border: '1px solid var(--bg-panel)' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
        <input type="checkbox" checked={source.visible !== false} onChange={e => updateRoot({ visible: e.target.checked })} /> Visible
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
        <input type="checkbox" checked={source.locked} onChange={e => updateRoot({ locked: e.target.checked })} /> Locked
      </label>
      {source.type === 'audio' || source.type === 'video' || source.type === 'media' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.muted} onChange={e => updateRoot({ muted: e.target.checked })} /> Muted
        </label>
      ) : null}
    </div>
  </div>
))

const TransformSection = memo(({ source, updateRoot, updateSettings }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DraggableNumberInput label="X" value={Math.round(source.x)} onChange={(val: number) => updateRoot({ x: val })} />
        <DraggableNumberInput label="Y" value={Math.round(source.y)} onChange={(val: number) => updateRoot({ y: val })} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DraggableNumberInput label="W" value={Math.round(source.width)} onChange={(val: number) => updateRoot({ width: val })} />
        <DraggableNumberInput label="H" value={Math.round(source.height)} onChange={(val: number) => updateRoot({ height: val })} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DraggableNumberInput label="ROT (deg)" value={Math.round(source.rotation ?? source.settings?.rotation ?? 0)} onChange={(val: number) => updateRoot({ rotation: val })} />
        <DraggableNumberInput label="OPACITY" value={source.opacity ?? 1} step={0.05} min={0} max={1} onChange={(val: number) => updateRoot({ opacity: val })} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>ALIGNMENT</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => updateRoot({ x: 1920/2 - source.width/2, y: 1080/2 - source.height/2 })} style={{ flex: 1, padding: '6px', background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Center">
            <AlignCenter size={14} />
          </button>
          <button onClick={() => updateRoot({ x: 0, y: 0, width: 1920, height: 1080 })} style={{ flex: 1, padding: '6px', background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Fit to Screen">
            <Maximize size={14} />
          </button>
          <button onClick={() => updateSettings({ flipHorizontal: !source.settings?.flipHorizontal })} style={{ flex: 1, padding: '6px', background: source.settings?.flipHorizontal ? '#3b82f6' : 'var(--bg-panel)', color: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Flip Horizontal">
            <MoveHorizontal size={14} />
          </button>
          <button onClick={() => updateSettings({ flipVertical: !source.settings?.flipVertical })} style={{ flex: 1, padding: '6px', background: source.settings?.flipVertical ? '#3b82f6' : 'var(--bg-panel)', color: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Flip Vertical">
            <MoveVertical size={14} />
          </button>
          <button onClick={() => updateRoot({ x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 1, settings: { ...source.settings, flipHorizontal: false, flipVertical: false }})} style={{ flex: 1, padding: '6px', background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Reset Transform">
            <CornerUpLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  )
})

const CropSection = memo(({ source, updateSettings }: any) => {
  const crop = source.crop || { left: 0, right: 0, top: 0, bottom: 0 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DraggableNumberInput label="LEFT" value={crop.left} onChange={(val: number) => updateSettings({ crop: { ...crop, left: val } })} />
        <DraggableNumberInput label="RIGHT" value={crop.right} onChange={(val: number) => updateSettings({ crop: { ...crop, right: val } })} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DraggableNumberInput label="TOP" value={crop.top} onChange={(val: number) => updateSettings({ crop: { ...crop, top: val } })} />
        <DraggableNumberInput label="BOTTOM" value={crop.bottom} onChange={(val: number) => updateSettings({ crop: { ...crop, bottom: val } })} />
      </div>
      <button onClick={() => updateSettings({ crop: { left: 0, right: 0, top: 0, bottom: 0 } })} style={{ padding: '6px', background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '2px', fontSize: '12px' }}>
        Reset Crop
      </button>
    </div>
  )
})

const AppearanceSection = memo(({ source, updateSettings }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DraggableNumberInput label="BORDER WIDTH" value={source.settings?.borderWidth || 0} min={0} onChange={(val: number) => updateSettings({ borderWidth: val })} />
        <DraggableNumberInput label="RADIUS" value={source.settings?.borderRadius || 0} min={0} onChange={(val: number) => updateSettings({ borderRadius: val })} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>BLEND MODE</label>
        <select value={source.settings?.blendMode || 'normal'} onChange={e => updateSettings({ blendMode: e.target.value })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', borderRadius: '2px', fontSize: '12px' }}>
          <option value="normal">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
          <option value="darken">Darken</option>
          <option value="lighten">Lighten</option>
          <option value="color-dodge">Color Dodge</option>
          <option value="color-burn">Color Burn</option>
          <option value="hard-light">Hard Light</option>
          <option value="soft-light">Soft Light</option>
          <option value="difference">Difference</option>
          <option value="exclusion">Exclusion</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, width: '80px' }}>TINT</label>
        <input type="color" value={source.settings?.colorTint || '#ffffff'} onChange={e => updateSettings({ colorTint: e.target.value })} style={{ flex: 1, height: '24px', padding: 0, border: 'none', background: 'transparent' }} />
      </div>
    </div>
  )
})

const AudioSection = memo(({ source, updateRoot }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
          <span>VOLUME</span>
          <span>{Math.round(source.volume || 100)}%</span>
        </label>
        <input type="range" min="0" max="100" value={source.volume || 100} onChange={e => updateRoot({ volume: parseFloat(e.target.value) })} style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <DraggableNumberInput label="BALANCE (PAN)" value={source.balance || 0} step={0.1} min={-1} max={1} onChange={(val: number) => updateRoot({ balance: val })} />
        <DraggableNumberInput label="DELAY (MS)" value={source.audioDelay || 0} step={10} min={0} onChange={(val: number) => updateRoot({ audioDelay: val })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'transparent', padding: '8px', borderRadius: '2px', border: '1px solid var(--bg-panel)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.compressorEnabled} onChange={e => updateRoot({ compressorEnabled: e.target.checked })} /> Compressor
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.limiterEnabled} onChange={e => updateRoot({ limiterEnabled: e.target.checked })} /> Limiter
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.noiseGateEnabled} onChange={e => updateRoot({ noiseGateEnabled: e.target.checked })} /> Noise Gate
        </label>
      </div>
    </div>
  )
})

const FiltersSection = memo(({ source, updateRoot, activeScene, reorderFilter, duplicateFilterFromSource, deleteFilterFromSource, addFilterToSource }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ color: '#64748b', marginBottom: '8px', fontSize: '11px' }}>Use the + icon to add new filters.</div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'transparent', border: '1px solid var(--bg-panel)', borderRadius: '2px' }}>
        {(source.filters || []).map((filter: any, i: number) => (
          <div key={filter.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--bg-panel)', background: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => {
                  const newFilters = [...source.filters]
                  newFilters[i] = { ...newFilters[i], enabled: !newFilters[i].enabled }
                  updateRoot({ filters: newFilters })
                }}
                style={{ background: 'transparent', border: 'none', color: filter.enabled ? '#3b82f6' : '#64748b', cursor: 'pointer', padding: 0 }}
              >
                {filter.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>{filter.type}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={() => reorderFilter(activeScene, source.id, filter.id, 'up')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>UP</button>
              <button onClick={() => reorderFilter(activeScene, source.id, filter.id, 'down')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>DN</button>
              <button 
                onClick={() => duplicateFilterFromSource(activeScene, source.id, filter.id)} 
                style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '0 4px', fontSize: '10px' }}
              >DUP</button>
              <button 
                onClick={() => deleteFilterFromSource(activeScene, source.id, filter.id)} 
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 4px' }}
              >X</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <select 
          id="filter-add-select"
          style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', padding: '6px', borderRadius: '2px', fontSize: '12px' }}
        >
          <option value="">+ Add Filter...</option>
          <option value="color_correction">Color Correction</option>
          <option value="chroma_key">Chroma Key</option>
          <option value="blur">Blur</option>
          <option value="glow">Glow</option>
          <option value="shadow">Drop Shadow</option>
        </select>
        <button 
          onClick={() => {
            const el = document.getElementById('filter-add-select') as HTMLSelectElement
            if (el && el.value) {
              addFilterToSource(activeScene, source.id, el.value as any)
              el.value = ''
            }
          }}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px' }}
        >
          Add
        </button>
      </div>
    </div>
  )
})

const PropertiesSection = memo(({ source, updateSettings }: any) => {
  const settings = source.settings || {}
  switch (source.type) {
    case 'camera':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>RESOLUTION</label>
              <select value={settings.resolution || '1920x1080'} onChange={e => updateSettings({ resolution: e.target.value })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', fontSize: '12px', borderRadius: '2px' }}>
                <option value="1920x1080">1920x1080</option>
                <option value="1280x720">1280x720</option>
                <option value="3840x2160">3840x2160</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>FPS</label>
              <select value={settings.fps || '60'} onChange={e => updateSettings({ fps: e.target.value })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', fontSize: '12px', borderRadius: '2px' }}>
                <option value="60">60</option>
                <option value="30">30</option>
                <option value="24">24</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <DraggableNumberInput label="EXPOSURE" value={settings.exposure || 0} step={1} min={-10} max={10} onChange={(val: number) => updateSettings({ exposure: val })} />
            <DraggableNumberInput label="WHITE BALANCE" value={settings.whiteBalance || 5600} step={100} min={2000} max={10000} onChange={(val: number) => updateSettings({ whiteBalance: val })} />
          </div>
        </div>
      )
    case 'browser':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>URL</label>
            <input type="text" value={settings.url || ''} onChange={e => updateSettings({ url: e.target.value })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', fontSize: '12px', borderRadius: '2px' }} />
          </div>
          <button 
            onClick={() => {
              const btn = document.getElementById('browser-refresh-btn-prop')
              if(btn) { btn.innerText = 'Refreshed!'; setTimeout(() => btn.innerText = 'Refresh Cache', 1500) }
            }}
            id="browser-refresh-btn-prop"
            style={{ background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px' }}
          >
            Refresh Cache
          </button>
        </div>
      )
    case 'video':
    case 'media':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', padding: '8px', borderRadius: '2px', border: '1px solid var(--bg-panel)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.loop ?? false} onChange={e => updateSettings({ loop: e.target.checked })} /> Loop
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.hardwareDecode ?? true} onChange={e => updateSettings({ hardwareDecode: e.target.checked })} /> HW Decode
            </label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>SPEED</label>
            <select value={settings.playbackSpeed || 1} onChange={e => updateSettings({ playbackSpeed: parseFloat(e.target.value) })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', fontSize: '12px', borderRadius: '2px' }}>
              <option value={0.5}>50%</option>
              <option value={1}>100%</option>
              <option value={2}>200%</option>
            </select>
          </div>
        </div>
      )
    case 'image':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" checked={settings.lockAspectRatio ?? false} onChange={e => updateSettings({ lockAspectRatio: e.target.checked })} />
            <label style={{ fontSize: '12px' }}>Maintain Aspect</label>
          </div>
        </div>
      )
    case 'audio':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>SAMPLE RATE</label>
            <select value={settings.sampleRate || 48000} onChange={e => updateSettings({ sampleRate: parseInt(e.target.value) })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', fontSize: '12px', borderRadius: '2px' }}>
              <option value={44100}>44.1 kHz</option>
              <option value={48000}>48 kHz</option>
              <option value={96000}>96 kHz</option>
            </select>
          </div>
        </div>
      )
    default:
      return <div style={{ fontSize: '12px', color: '#64748b' }}>No special properties for this source type.</div>
  }
})

const AdvancedSection = memo(({ source, updateSettings }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>INTERPOLATION</label>
        <select value={source.settings?.interpolation || 'linear'} onChange={e => updateSettings({ interpolation: e.target.value })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', borderRadius: '2px', fontSize: '12px' }}>
          <option value="nearest">Nearest Neighbor</option>
          <option value="linear">Linear</option>
          <option value="cubic">Bicubic</option>
          <option value="lanczos">Lanczos</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>RENDERING QUALITY</label>
        <select value={source.settings?.renderQuality || 'high'} onChange={e => updateSettings({ renderQuality: e.target.value })} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', borderRadius: '2px', fontSize: '12px' }}>
          <option value="low">Low (Fastest)</option>
          <option value="medium">Medium</option>
          <option value="high">High (Quality)</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'transparent', padding: '8px', borderRadius: '2px', border: '1px solid var(--bg-panel)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.settings?.caching ?? false} onChange={e => updateSettings({ caching: e.target.checked })} /> Caching
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.settings?.hardwareDecode ?? true} onChange={e => updateSettings({ hardwareDecode: e.target.checked })} /> HW Decode
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.settings?.gpuUpload ?? true} onChange={e => updateSettings({ gpuUpload: e.target.checked })} /> GPU Upload
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
          <input type="checkbox" checked={source.settings?.asyncLoading ?? false} onChange={e => updateSettings({ asyncLoading: e.target.checked })} /> Async Load
        </label>
      </div>
      <div style={{ padding: '8px', background: 'transparent', borderRadius: '2px', fontSize: '11px', color: '#cbd5e1' }}>
        Z-Index Map: {source.zIndex}
      </div>
    </div>
  )
})

export const InspectorPanelDock: React.FC = () => {
  const { 
    scenes = [], activeScene,
    updateSourceProperties = () => {}, selectedSourceIds = [],
    addFilterToSource = () => {}, deleteFilterFromSource = () => {}, duplicateFilterFromSource = () => {}, reorderFilter = () => {}, updateFilterSettings = () => {}
  } = useBroadcast()
  
  const currentScene = (scenes || []).find(s => s.id === activeScene)
  const sourceId = selectedSourceIds[0]
  const source = currentScene?.sources.find(s => s.id === sourceId)
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    transform: true,
    crop: true,
    appearance: false,
    audio: false,
    filters: false,
    properties: false,
    advanced: false
  })

  const toggleSection = useCallback((id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: prev[id] === false ? true : false }))
  }, [])
  
  const updateRoot = useCallback((updates: Partial<SceneSource>) => {
    if (!source) return;
    updateSourceProperties(activeScene, source.id, updates)
  }, [activeScene, source?.id, updateSourceProperties])

  const updateSettings = useCallback((settingUpdates: any) => {
    if (!source) return;
    updateSourceProperties(activeScene, source.id, { settings: { ...(source.settings || {}), ...settingUpdates } })
  }, [activeScene, source?.id, source?.settings, updateSourceProperties])

  if (!source) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '12px', textAlign: 'center', gap: '8px', background: 'transparent', padding: '16px' }}>
        <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>No source selected</div>
        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px', lineHeight: '1.2' }}>Select a source from the Scene Tree<br/>or click an object inside the Preview monitor.</div>
        <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Available editors:</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', opacity: 0.6, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
          <li>Transform</li>
          <li>Crop</li>
          <li>Appearance</li>
          <li>Audio</li>
          <li>Filters</li>
          <li>Properties</li>
        </ul>
      </div>
    )
  }

  const isAudio = source.type === 'audio' || source.type === 'video' || source.type === 'media'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent', color: '#f8fafc', overflowY: 'auto' }}>
      
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'transparent', borderBottom: '1px solid var(--bg-panel)', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={16} color="#38bdf8" />
        <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {source.name}
        </span>
      </div>

      <div style={{ flex: 1, paddingBottom: '32px' }}>
        <CollapsibleSection title="General" id="general" expandedSections={expandedSections} toggleSection={toggleSection}>
          <GeneralSection source={source} updateRoot={updateRoot} currentScene={currentScene} />
        </CollapsibleSection>

        <CollapsibleSection title="Transform" id="transform" expandedSections={expandedSections} toggleSection={toggleSection}>
          <TransformSection source={source} updateRoot={updateRoot} updateSettings={updateSettings} />
        </CollapsibleSection>

        <CollapsibleSection title="Crop" id="crop" expandedSections={expandedSections} toggleSection={toggleSection}>
          <CropSection source={source} updateSettings={updateSettings} />
        </CollapsibleSection>

        <CollapsibleSection title="Appearance" id="appearance" expandedSections={expandedSections} toggleSection={toggleSection}>
          <AppearanceSection source={source} updateSettings={updateSettings} />
        </CollapsibleSection>

        {isAudio && (
          <CollapsibleSection title="Audio" id="audio" expandedSections={expandedSections} toggleSection={toggleSection}>
            <AudioSection source={source} updateRoot={updateRoot} />
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Filters" id="filters" expandedSections={expandedSections} toggleSection={toggleSection}>
          <FiltersSection source={source} updateRoot={updateRoot} activeScene={activeScene} reorderFilter={reorderFilter} duplicateFilterFromSource={duplicateFilterFromSource} deleteFilterFromSource={deleteFilterFromSource} addFilterToSource={addFilterToSource} />
        </CollapsibleSection>

        <CollapsibleSection title="Properties" id="properties" expandedSections={expandedSections} toggleSection={toggleSection}>
          <PropertiesSection source={source} updateSettings={updateSettings} />
        </CollapsibleSection>

        <CollapsibleSection title="Advanced" id="advanced" expandedSections={expandedSections} toggleSection={toggleSection}>
          <AdvancedSection source={source} updateSettings={updateSettings} />
        </CollapsibleSection>
      </div>

    </div>
  )
}

export default memo(InspectorPanelDock)
