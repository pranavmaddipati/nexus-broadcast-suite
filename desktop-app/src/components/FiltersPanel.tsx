import React, { useState } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { SourceFilter } from '../context/NewBroadcastContext'
import { Plus, Trash2, Eye, EyeOff, Settings2, Filter } from 'lucide-react'
import { PanelHeader } from './PanelHeader'

const VIDEO_FILTERS = [
  'color_correction', 'lut', 'crop', 'mask', 'blur', 'sharpen', 'glow', 'shadow', 'outline', 'opacity', 'perspective', 'chroma_key', 'luma_key', 'corner_pin'
]

const AUDIO_FILTERS = [
  'gain', 'compressor', 'limiter', 'noise_gate', 'eq', 'delay', 'noise_suppression'
]

const getFilterDisplayName = (type: string) => {
  if (type === 'shadow') return 'Drop Shadow'
  if (type === 'color_correction') return 'Background'
  if (type === 'corner_pin') return 'Corner Radius'
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    style={{
      width: '22px',
      height: '12px',
      background: checked ? 'var(--accent-blue)' : '#27272a',
      borderRadius: '2px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
    }}
  >
    <div style={{
      width: '8px',
      height: '8px',
      background: '#fff',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      left: checked ? '12px' : '2px',
      transition: 'left 0.2s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
    }} />
  </div>
)

export const FiltersPanelDock: React.FC = React.memo(() => {
  const { scenes = [], activeScene, selectedSourceIds = [], updateFilterSettings = () => {}, addFilterToSource = () => {}, deleteFilterFromSource = () => {}, updateSourceProperties = () => {} } = useBroadcast()
  
  const currentScene = scenes.find(s => s.id === activeScene)
  const source = currentScene?.sources.find(s => selectedSourceIds.includes(s.id))
  
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [draggedFilterIdx, setDraggedFilterIdx] = useState<number | null>(null)
  
  if (!source) {
    return (
      <div className="filters-panel-obs" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', background: 'transparent' }}>
        <PanelHeader id="filters_panel" title="FILTERS" />
        {/* Top Toolbar for Baseline Alignment */}
        <div style={{ height: 'var(--toolbar-height)', minHeight: 'var(--toolbar-height)', maxHeight: 'var(--toolbar-height)', padding: '0 var(--panel-padding)', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'transparent', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 'var(--font-size)' }}>
          Select a source to view filters
        </div>
      </div>
    )
  }

  const filters = source?.filters ?? []
  
  if (selectedFilterId === null && filters.length > 0) {
    setSelectedFilterId(filters[0].id)
  } else if (filters.length === 0 && selectedFilterId !== null) {
    setSelectedFilterId(null)
  }

  const handleUpdateSetting = (filterId: string, key: string, val: any) => {
    updateFilterSettings(activeScene, source.id, filterId, { [key]: val })
  }

  const handleToggleEnable = (filterId: string, currentlyEnabled: boolean) => {
    const updatedFilters = filters.map(f => f.id === filterId ? { ...f, enabled: !currentlyEnabled } : f)
    updateSourceProperties(activeScene, source.id, { filters: updatedFilters })
  }

  const activeFilter = selectedFilterId ? filters.find(f => f.id === selectedFilterId) : null

  const videoFiltersApplied = filters.filter(f => VIDEO_FILTERS.includes(f.type))
  const audioFiltersApplied = filters.filter(f => AUDIO_FILTERS.includes(f.type))

  const handleAddFilter = (type: SourceFilter['type']) => {
    addFilterToSource(activeScene, source.id, type)
    setShowAddMenu(false)
  }

  const PropRow = ({ label, value, children }: { label: string; value?: string | number; children: React.ReactNode }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', gap: '6px', alignItems: 'center', minHeight: '22px', marginBottom: '4px' }}>
      <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {children}
      </div>
      {value !== undefined ? (
        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', background: 'transparent', padding: '1px 4px', borderRadius: '2px', border: '1px solid var(--bg-panel)', textAlign: 'center', minWidth: '32px' }}>{value}</span>
      ) : <div />}
    </div>
  )

  const renderFilterSettings = (filter: SourceFilter) => {
    switch (filter.type) {
      case 'color_correction':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <PropRow label="Brightness" value={filter.settings?.brightness ?? 1.0}>
              <input type="range" min="0" max="2" step="0.1" value={filter.settings?.brightness ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'brightness', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Contrast" value={filter.settings?.contrast ?? 1.0}>
              <input type="range" min="0" max="2" step="0.1" value={filter.settings?.contrast ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'contrast', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Saturation" value={filter.settings?.saturation ?? 1.0}>
              <input type="range" min="0" max="2" step="0.1" value={filter.settings?.saturation ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'saturation', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Gamma" value={filter.settings?.gamma ?? 1.0}>
              <input type="range" min="0" max="3" step="0.1" value={filter.settings?.gamma ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'gamma', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Hue Shift" value={`${filter.settings?.hueRotate ?? 0} deg`}>
              <input type="range" min="-180" max="180" step="1" value={filter.settings?.hueRotate ?? 0} onChange={e => handleUpdateSetting(filter.id, 'hueRotate', parseInt(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'lut':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>LUT File Path</span>
              <input type="text" placeholder="Path to .cube or .png LUT" value={filter.settings?.lutPath ?? ''} onChange={e => handleUpdateSetting(filter.id, 'lutPath', e.target.value)} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px 6px', height: '24px', minHeight: '24px', maxHeight: '24px', boxSizing: 'border-box', fontSize: '10px', borderRadius: '3px' }} />
            </div>
            <PropRow label="Intensity" value={filter.settings?.lutIntensity ?? 1.0}>
              <input type="range" min="0" max="1" step="0.01" value={filter.settings?.lutIntensity ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'lutIntensity', parseFloat(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'crop':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {['cropLeft', 'cropRight', 'cropTop', 'cropBottom'].map(edge => (
              <PropRow key={edge} label={edge.replace('crop', '')} value={`${filter.settings?.[edge] ?? 0}px`}>
                <input type="range" min="0" max="1000" step="1" value={filter.settings?.[edge] ?? 0} onChange={e => handleUpdateSetting(filter.id, edge, parseInt(e.target.value))} />
              </PropRow>
            ))}
          </div>
        )
      case 'mask':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Mask Type</span>
              <select value={filter.settings?.maskType ?? 'image'} onChange={e => handleUpdateSetting(filter.id, 'maskType', e.target.value)} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px 4px', height: '24px', minHeight: '24px', maxHeight: '24px', boxSizing: 'border-box', fontSize: '10px', borderRadius: '3px' }}>
                <option value="image">Image Mask (Alpha)</option>
                <option value="color">Color Key</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Image Path</span>
              <input type="text" placeholder="Path to mask image" value={filter.settings?.maskPath ?? ''} onChange={e => handleUpdateSetting(filter.id, 'maskPath', e.target.value)} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px 6px', height: '24px', minHeight: '24px', maxHeight: '24px', boxSizing: 'border-box', fontSize: '10px', borderRadius: '3px' }} />
            </div>
          </div>
        )
      case 'blur':
        return (
          <PropRow label="Blur Amount" value={filter.settings?.blurAmount ?? 0}>
            <input type="range" min="0" max="100" step="1" value={filter.settings?.blurAmount ?? 0} onChange={e => handleUpdateSetting(filter.id, 'blurAmount', parseInt(e.target.value))} />
          </PropRow>
        )
      case 'sharpen':
        return (
          <PropRow label="Sharpen Amount" value={filter.settings?.sharpenAmount ?? 0}>
            <input type="range" min="0" max="100" step="1" value={filter.settings?.sharpenAmount ?? 0} onChange={e => handleUpdateSetting(filter.id, 'sharpenAmount', parseInt(e.target.value))} />
          </PropRow>
        )
      case 'glow':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Glow Color</span>
              <input type="color" value={filter.settings?.glowColor ?? '#ffffff'} onChange={e => handleUpdateSetting(filter.id, 'glowColor', e.target.value)} style={{ width: '100%', height: '24px', padding: 0, border: '1px solid var(--bg-panel)', background: 'transparent' }} />
            </div>
            <PropRow label="Intensity" value={filter.settings?.glowIntensity ?? 0}>
              <input type="range" min="0" max="100" step="1" value={filter.settings?.glowIntensity ?? 0} onChange={e => handleUpdateSetting(filter.id, 'glowIntensity', parseInt(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'shadow':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Shadow Color</span>
              <input type="color" value={filter.settings?.shadowColor ?? 'var(--bg-main)'} onChange={e => handleUpdateSetting(filter.id, 'shadowColor', e.target.value)} style={{ width: '100%', height: '22px', padding: 0, border: '1px solid var(--bg-panel)', background: 'transparent' }} />
            </div>
            <PropRow label="Distance" value={filter.settings?.shadowDistance ?? 5}>
              <input type="range" min="0" max="100" step="1" value={filter.settings?.shadowDistance ?? 5} onChange={e => handleUpdateSetting(filter.id, 'shadowDistance', parseInt(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'outline':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Outline Color</span>
              <input type="color" value={filter.settings?.outlineColor ?? '#ffffff'} onChange={e => handleUpdateSetting(filter.id, 'outlineColor', e.target.value)} style={{ width: '100%', height: '22px', padding: 0, border: '1px solid var(--bg-panel)', background: 'transparent' }} />
            </div>
            <PropRow label="Size" value={filter.settings?.outlineSize ?? 2}>
              <input type="range" min="0" max="50" step="1" value={filter.settings?.outlineSize ?? 2} onChange={e => handleUpdateSetting(filter.id, 'outlineSize', parseInt(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'opacity':
        return (
          <PropRow label="Opacity" value={filter.settings?.opacity ?? 1.0}>
            <input type="range" min="0" max="1" step="0.01" value={filter.settings?.opacity ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'opacity', parseFloat(e.target.value))} />
          </PropRow>
        )
      case 'gain':
        return (
          <PropRow label="Gain (dB)" value={filter.settings?.gainDb ?? 0}>
            <input type="range" min="-30" max="30" step="0.1" value={filter.settings?.gainDb ?? 0} onChange={e => handleUpdateSetting(filter.id, 'gainDb', parseFloat(e.target.value))} />
          </PropRow>
        )
      case 'compressor':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <PropRow label="Ratio" value={`${filter.settings?.ratio ?? 4}:1`}>
              <input type="range" min="1" max="32" step="0.5" value={filter.settings?.ratio ?? 4} onChange={e => handleUpdateSetting(filter.id, 'ratio', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Threshold (dB)" value={filter.settings?.threshold ?? -18}>
              <input type="range" min="-60" max="0" step="0.5" value={filter.settings?.threshold ?? -18} onChange={e => handleUpdateSetting(filter.id, 'threshold', parseFloat(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'limiter':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <PropRow label="Threshold (dB)" value={filter.settings?.limiterThreshold ?? -6}>
              <input type="range" min="-60" max="0" step="0.5" value={filter.settings?.limiterThreshold ?? -6} onChange={e => handleUpdateSetting(filter.id, 'limiterThreshold', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Release (ms)" value={filter.settings?.limiterRelease ?? 60}>
              <input type="range" min="1" max="1000" step="1" value={filter.settings?.limiterRelease ?? 60} onChange={e => handleUpdateSetting(filter.id, 'limiterRelease', parseFloat(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'noise_gate':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <PropRow label="Close Thresh (dB)" value={filter.settings?.closeThreshold ?? -32}>
              <input type="range" min="-60" max="0" step="1" value={filter.settings?.closeThreshold ?? -32} onChange={e => handleUpdateSetting(filter.id, 'closeThreshold', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Open Thresh (dB)" value={filter.settings?.openThreshold ?? -26}>
              <input type="range" min="-60" max="0" step="1" value={filter.settings?.openThreshold ?? -26} onChange={e => handleUpdateSetting(filter.id, 'openThreshold', parseFloat(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'eq':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {['low', 'mid', 'high'].map(band => (
              <PropRow key={band} label={`${band} Gain (dB)`} value={filter.settings?.[`${band}Gain`] ?? 0}>
                <input type="range" min="-20" max="20" step="0.5" value={filter.settings?.[`${band}Gain`] ?? 0} onChange={e => handleUpdateSetting(filter.id, `${band}Gain`, parseFloat(e.target.value))} />
              </PropRow>
            ))}
          </div>
        )
      case 'delay':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Delay (ms)</span>
            <input type="number" min="0" max="5000" step="10" value={filter.settings?.delayMs ?? 0} onChange={e => handleUpdateSetting(filter.id, 'delayMs', parseInt(e.target.value))} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '4px', fontSize: '10px', borderRadius: '3px' }} />
            <div />
          </div>
        )
      case 'noise_suppression':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Method</span>
              <select value={filter.settings?.method ?? 'speex'} onChange={e => handleUpdateSetting(filter.id, 'method', e.target.value)} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '4px', fontSize: '10px', borderRadius: '3px' }}>
                <option value="speex">Speex (Low CPU)</option>
                <option value="rnnoise">RNNoise (Good quality)</option>
              </select>
            </div>
            {filter.settings?.method === 'speex' && (
              <PropRow label="Suppression (dB)" value={filter.settings?.suppressionLevel ?? -30}>
                <input type="range" min="-60" max="0" step="1" value={filter.settings?.suppressionLevel ?? -30} onChange={e => handleUpdateSetting(filter.id, 'suppressionLevel', parseInt(e.target.value))} />
              </PropRow>
            )}
          </div>
        )
      case 'perspective':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map(corner => (
              <div key={corner} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: '4px', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1', textTransform: 'capitalize' }}>{corner.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input type="number" value={filter.settings?.[`${corner}X`] ?? 0} onChange={e => handleUpdateSetting(filter.id, `${corner}X`, parseInt(e.target.value))} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px 4px', fontSize: '10px', borderRadius: '2px' }} placeholder="X" />
                <input type="number" value={filter.settings?.[`${corner}Y`] ?? 0} onChange={e => handleUpdateSetting(filter.id, `${corner}Y`, parseInt(e.target.value))} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px 4px', fontSize: '10px', borderRadius: '2px' }} placeholder="Y" />
              </div>
            ))}
          </div>
        )
      case 'chroma_key':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Key Color Type</span>
              <select value={filter.settings?.keyColorType ?? 'green'} onChange={e => handleUpdateSetting(filter.id, 'keyColorType', e.target.value)} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '4px', fontSize: '10px', borderRadius: '3px' }}>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="magenta">Magenta</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {filter.settings?.keyColorType === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#cbd5e1' }}>Custom Color</span>
                <input type="color" value={filter.settings?.customColor ?? '#00ff00'} onChange={e => handleUpdateSetting(filter.id, 'customColor', e.target.value)} style={{ width: '100%', height: '22px', padding: 0, border: '1px solid var(--bg-panel)', background: 'transparent' }} />
              </div>
            )}
            <PropRow label="Similarity" value={filter.settings?.similarity ?? 400}>
              <input type="range" min="1" max="1000" step="1" value={filter.settings?.similarity ?? 400} onChange={e => handleUpdateSetting(filter.id, 'similarity', parseInt(e.target.value))} />
            </PropRow>
            <PropRow label="Smoothness" value={filter.settings?.smoothness ?? 80}>
              <input type="range" min="1" max="1000" step="1" value={filter.settings?.smoothness ?? 80} onChange={e => handleUpdateSetting(filter.id, 'smoothness', parseInt(e.target.value))} />
            </PropRow>
            <PropRow label="Spill Reduction" value={filter.settings?.spillReduction ?? 100}>
              <input type="range" min="1" max="1000" step="1" value={filter.settings?.spillReduction ?? 100} onChange={e => handleUpdateSetting(filter.id, 'spillReduction', parseInt(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'luma_key':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <PropRow label="Luma Max" value={filter.settings?.lumaMax ?? 1}>
              <input type="range" min="0" max="1" step="0.01" value={filter.settings?.lumaMax ?? 1} onChange={e => handleUpdateSetting(filter.id, 'lumaMax', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Luma Max Smooth" value={filter.settings?.lumaMaxSmooth ?? 0}>
              <input type="range" min="0" max="1" step="0.01" value={filter.settings?.lumaMaxSmooth ?? 0} onChange={e => handleUpdateSetting(filter.id, 'lumaMaxSmooth', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Luma Min" value={filter.settings?.lumaMin ?? 0}>
              <input type="range" min="0" max="1" step="0.01" value={filter.settings?.lumaMin ?? 0} onChange={e => handleUpdateSetting(filter.id, 'lumaMin', parseFloat(e.target.value))} />
            </PropRow>
            <PropRow label="Luma Min Smooth" value={filter.settings?.lumaMinSmooth ?? 0}>
              <input type="range" min="0" max="1" step="0.01" value={filter.settings?.lumaMinSmooth ?? 0} onChange={e => handleUpdateSetting(filter.id, 'lumaMinSmooth', parseFloat(e.target.value))} />
            </PropRow>
          </div>
        )
      case 'corner_pin':
        return (
          <PropRow label="Radius" value={`${filter.settings?.radius ?? 0}px`}>
            <input type="range" min="0" max="100" step="1" value={filter.settings?.radius ?? 0} onChange={e => handleUpdateSetting(filter.id, 'radius', parseInt(e.target.value))} />
          </PropRow>
        )
      default:
        return <div style={{ fontStyle: 'italic', color: '#64748b' }}>No properties available.</div>
    }
  }

  const renderFilterItem = (f: SourceFilter, index: number) => (
    <div 
      key={f.id}
      draggable
      onDragStart={e => {
        setDraggedFilterIdx(index)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault()
        if (draggedFilterIdx !== null && draggedFilterIdx !== index) {
          const updatedFilters = [...filters]
          const [removed] = updatedFilters.splice(draggedFilterIdx, 1)
          updatedFilters.splice(index, 0, removed)
          updateSourceProperties(activeScene, source.id, { filters: updatedFilters })
        }
        setDraggedFilterIdx(null)
      }}
      onClick={() => setSelectedFilterId(f.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        margin: '1px 4px',
        height: '24px',
        minHeight: '24px',
        maxHeight: '24px',
        boxSizing: 'border-box',
        background: selectedFilterId === f.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
        border: selectedFilterId === f.id ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: draggedFilterIdx === index ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxShadow: selectedFilterId === f.id ? '0 0 0 1px var(--accent-blue)' : 'none'
      }}
    >
      <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
        <ToggleSwitch checked={f.enabled !== false} onChange={() => handleToggleEnable(f.id, f.enabled !== false)} />
      </div>
      <span style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: '#e2e8f0', opacity: f.enabled !== false ? 1 : 0.5 }}>
        {getFilterDisplayName(f.type)}
      </span>
      <div 
        onClick={(e) => { e.stopPropagation(); deleteFilterFromSource(activeScene, source.id, f.id) }}
        style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.7, transition: 'opacity 0.15s ease' }}
        className="hover:opacity-100"
      >
        <Trash2 size={12} />
      </div>
    </div>
  )

  return (
    <div className="premium-panel" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', borderRadius: '2px' }}>
      <PanelHeader id="filters_panel" title="FILTERS" />

      <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--accent-blue)', borderBottom: '1px solid var(--border-color)' }}>
        Lower Third - Lyrics
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: 'transparent', padding: '8px 0' }}>
        {[
          { id: '1', name: 'Opacity', selected: false, enabled: true },
          { id: '2', name: 'Drop Shadow', selected: false, enabled: true },
          { id: '3', name: 'Background', selected: false, enabled: true },
          { id: '4', name: 'Corner Radius', selected: false, enabled: true }
        ].map((item, idx) => (
          <div 
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              background: item.selected ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderBottom: '1px solid var(--border-color)',
              cursor: 'pointer',
              height: '28px',
              minHeight: '28px',
              boxSizing: 'border-box',
              transition: 'background 100ms ease-out'
            }}
            className={item.selected ? "" : "hover:bg-slate-800/50"}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', height: '100%', color: item.selected ? '#fff' : '#cbd5e1', fontSize: '11px', fontWeight: item.selected ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--sans)' }}>
              <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                 <Eye size={12} color="#94a3b8" />
              </span> 
              {item.name}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{ width: '22px', height: '22px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }} className="hover:bg-slate-700/50">
                <Eye size={14} color="#94a3b8" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', padding: '6px 12px', borderTop: '1px solid var(--border-color)', gap: '8px' }}>
        <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} className="hover:text-white"><Plus size={14} /></button>
        <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} className="hover:text-white"><Trash2 size={14} /></button>
        <div style={{ flex: 1 }} />
        <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} className="hover:text-white"><Settings2 size={14} /></button>
      </div>
    </div>
  )
})
