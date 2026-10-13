import React, { useState } from 'react'
import { ArrowDown, ArrowUp, Camera, Eye, EyeOff, Globe, Image as ImageIcon, Lock, Monitor, Music, Plus, Trash2, Unlock, Video } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { SourceRegistry } from '../engine/input/SourceRegistry'

const AUDIO_TYPES = new Set(['audio', 'camera', 'media', 'video', 'ndi'])

const SourceIcon = ({ type }: { type: string }) => {
  const props = { size: 10, color: '#fff' }
  if (type === 'camera') return <Camera {...props} />
  if (type === 'video' || type === 'media') return <Video {...props} />
  if (type === 'graphics' || type === 'image') return <ImageIcon {...props} />
  if (type === 'audio') return <Music {...props} />
  if (type === 'browser') return <Globe {...props} />
  return <Monitor {...props} />
}

export const SourcesPanel: React.FC = () => {
  const {
    scenes = [], activeScene, liveScene, selectedSourceIds = [], audioMeterLevels = {},
    toggleSourceSelection, updateSourceProperties, addSourceToScene, deleteSourceFromScene, reorderSource, addToast
  } = useBroadcast()
  const [addType, setAddType] = useState('camera')
  const scene = scenes.find((item: any) => item.id === activeScene)
  const sources = scene?.sources || []
  const isProgramScene = activeScene === liveScene
  const selectedSourceId = selectedSourceIds.length === 1 ? selectedSourceIds[0] : null
  const addSource = () => {
    const definition = SourceRegistry.get(addType as any)
    if (!definition) return
    if (!activeScene) {
      addToast('warning', 'Please select a scene before adding a source.')
      return
    }
    addSourceToScene(activeScene, definition.type, definition.name, { ...definition.defaultSettings })
  }

  return (
    <div className="source-library" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div className="panel-header" style={{ padding: '4px 8px' }}>
        <div className="panel-status-dot" style={{ background: '#38bdf8' }} />
        <span className="title" style={{ fontWeight: 800, letterSpacing: '0.04em' }}>SOURCES</span>
        <span className="panel-context-label" style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>{scene?.name || 'No scene selected'}</span>
        <div className="source-toolbar" style={{ marginLeft: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}>
          <select aria-label="Source type" value={addType} onChange={event => setAddType(event.target.value)} style={{ height: '22px', fontSize: '10px' }}>
            {SourceRegistry.getAll().map(definition => <option key={definition.type} value={definition.type}>{definition.name}</option>)}
          </select>
          <button type="button" title="Add source" aria-label="Add source" disabled={!activeScene} onClick={addSource} style={{ width: '22px', height: '22px' }}><Plus size={11} /></button>
          <button type="button" title="Move source up" aria-label="Move source up" disabled={!selectedSourceId} onClick={() => selectedSourceId && reorderSource(activeScene, selectedSourceId, 'up')} style={{ width: '22px', height: '22px' }}><ArrowUp size={11} /></button>
          <button type="button" title="Move source down" aria-label="Move source down" disabled={!selectedSourceId} onClick={() => selectedSourceId && reorderSource(activeScene, selectedSourceId, 'down')} style={{ width: '22px', height: '22px' }}><ArrowDown size={11} /></button>
          <button type="button" title="Delete selected source" aria-label="Delete selected source" disabled={!selectedSourceId} onClick={() => selectedSourceId && deleteSourceFromScene(activeScene, selectedSourceId)} style={{ width: '22px', height: '22px' }}><Trash2 size={11} /></button>
        </div>
      </div>
      {sources.length === 0 ? <div className="panel-empty-state">This scene has no sources.</div> : (
        <div className="source-card-grid" style={{ flex: 1, overflowY: 'auto', padding: '4px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '6px' }}>
          {sources.map((source: any, index: number) => {
            const selected = selectedSourceIds.includes(source.id)
            const meter = audioMeterLevels[source.id]
            const isBlack = source.name.toLowerCase().includes('black')
            const thumbnail = isBlack ? null : (source.settings?.posterUrl || source.settings?.thumbnailUrl || source.settings?.url || scene?.thumbnailUrl)
            
            return (
              <button
                type="button"
                key={source.id}
                className={`source-card${selected ? ' selected' : ''}${isProgramScene && source.visible ? ' live' : ''}`}
                style={{
                  border: selected ? '1.5px solid #8b5cf6' : (isProgramScene && source.visible ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)'),
                  boxShadow: selected ? '0 0 10px rgba(139, 92, 246, 0.4)' : (isProgramScene && source.visible ? '0 0 8px rgba(239, 68, 68, 0.3)' : 'none'),
                  borderRadius: '4px',
                  background: '#070f1e',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={(event) => toggleSourceSelection(source.id, event.ctrlKey || event.metaKey || event.shiftKey)}
              >
                <div
                  className="source-card-preview"
                  style={{
                    height: '52px',
                    width: '100%',
                    position: 'relative',
                    backgroundImage: thumbnail ? `url("${thumbnail}")` : undefined,
                    backgroundColor: isBlack ? '#000000' : '#0c1527',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                  }}
                >
                  <span className="source-index" style={{ position: 'absolute', top: '3px', left: '3px', background: 'rgba(0,0,0,0.75)', borderRadius: '2px', padding: '1px 3px', fontSize: '8px', display: 'flex', alignItems: 'center', gap: '2px', color: '#fff' }}>
                    <SourceIcon type={source.type} />
                    <span>{index + 1}</span>
                  </span>
                  
                  {isProgramScene && source.visible && (
                    <span className="source-tally" style={{ position: 'absolute', top: '3px', right: '3px', background: '#ef4444', color: '#fff', fontSize: '7.5px', fontWeight: 900, padding: '1px 4px', borderRadius: '2px', letterSpacing: '0.05em' }}>
                      LIVE
                    </span>
                  )}
                  
                  <div className="source-card-actions" style={{ position: 'absolute', bottom: '3px', right: '3px', display: 'flex', gap: '3px' }}>
                    <span
                      role="button"
                      tabIndex={0}
                      title={source.visible ? 'Hide source' : 'Show source'}
                      style={{ background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '2px', display: 'flex', color: source.visible ? '#fff' : '#64748b' }}
                      onClick={(event) => { event.stopPropagation(); updateSourceProperties(activeScene, source.id, { visible: !source.visible }) }}
                    >
                      {source.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      title={source.locked ? 'Unlock source' : 'Lock source'}
                      style={{ background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '2px', display: 'flex', color: source.locked ? '#f59e0b' : '#64748b' }}
                      onClick={(event) => { event.stopPropagation(); updateSourceProperties(activeScene, source.id, { locked: !source.locked }) }}>
                      {source.locked ? <Lock size={10} /> : <Unlock size={10} />}
                    </span>
                  </div>
                </div>

                <div className="source-card-meta" style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5, 11, 23, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div className="source-card-name" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
                    <strong style={{ fontSize: '9px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{source.name}</strong>
                    <span style={{ fontSize: '7.5px', color: '#64748b', textTransform: 'capitalize' }}>{source.type}</span>
                  </div>
                  {AUDIO_TYPES.has(source.type) && (
                    <div className="source-mini-meter" title={meter ? `${Math.round(meter.vu * 100)}% signal` : 'Live audio input'} style={{ width: '4px', height: '14px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '1px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                      <span style={{ width: '100%', height: `${Math.max(10, Math.min(100, ((meter?.vu || 0.6) * 100)))}%`, background: 'linear-gradient(to top, #10b981, #eab308)' }} />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
