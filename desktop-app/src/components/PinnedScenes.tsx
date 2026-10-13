import React, { useState } from 'react'
import { Plus, Pin, PinOff, Trash2, Copy, MonitorPlay, MonitorUp, Edit3 } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { ContextMenu } from './ContextMenu'

export const PinnedScenes: React.FC = () => {
  const { scenes = [], setScenes, activeScene, liveScene, selectScene, takeLive, togglePinScene, deleteScene, duplicateScene, addScene, renameScene } = useBroadcast()
  
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, sceneId: string } | null>(null)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  const [category, setCategory] = useState('All')
  const [newSceneName, setNewSceneName] = useState('')
  const localScenes = scenes.filter(scene => !scene.isFolder && (!scene.id.endsWith('_live') || !scenes.some(base => `${base.id}_live` === scene.id))).filter(scene => {
    if (category === 'All') return true
    const types: Record<string, string[]> = { Studio: ['camera', 'graphics'], Field: ['ndi', 'camera'], Web: ['browser', 'media'], IP: ['ndi', 'srt'] }
    return scene.sources.some(source => types[category]?.includes(source.type)) || true
  }).map(scene => ({
    ...scene,
    activeStatus: scene.id === liveScene ? 'PROGRAM' : scene.id === activeScene ? 'PREVIEW' : 'NONE',
    thumbnail: scene.thumbnailUrl || scene.sources.find(s => s.settings?.posterUrl)?.settings?.posterUrl || scene.sources.find(s => s.settings?.url)?.settings?.url || scene.sources.find(s => s.type === 'image')?.settings?.url || '',
    duration: scene.duration || '00:24:37',
    sourceCount: scene.sources.length
  }))

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', idx.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === targetIdx) return
    const sourceId = localScenes[draggedIdx]?.id
    const targetId = localScenes[targetIdx]?.id
    if (!sourceId || !targetId) return
    setScenes(previous => {
      const reordered = [...previous]
      const sourceIndex = reordered.findIndex(scene => scene.id === sourceId)
      const targetIndex = reordered.findIndex(scene => scene.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return previous
      const [moved] = reordered.splice(sourceIndex, 1)
      reordered.splice(targetIndex, 0, moved)
      return reordered
    })
    setDraggedIdx(null)
  }

  const handleRightClick = (e: React.MouseEvent, sceneId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, sceneId })
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      background: 'transparent',
      border: 'none',
      padding: '6px 8px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div className="panel-header" style={{ marginBottom: '6px' }}>
        <div style={{ width: '6px', height: '6px', background: 'var(--accent-red)', borderRadius: '50%', boxShadow: '0 0 6px var(--accent-red)' }} />
        <span className="title" style={{ fontWeight: 800, letterSpacing: '0.04em' }}>LIVE SCENES</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', color: 'var(--accent-red)', fontWeight: 800, letterSpacing: '0.05em' }}>● ON AIR</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="concept-tab-bar" style={{ padding: '0 4px', marginBottom: '4px' }}>
        {['All', 'Studio', 'Field', 'Web', 'IP'].map(value => <button key={value} className={`concept-tab ${category === value ? 'active' : ''}`} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
      </div>

      {/* Add Scene Bar */}
      <form onSubmit={event => { event.preventDefault(); addScene(newSceneName); if (newSceneName.trim()) { setNewSceneName('') } }} style={{ display: 'flex', gap: 4, padding: '2px 0', marginBottom: '4px' }}>
        <input aria-label="New scene name" placeholder="Scene name" value={newSceneName} onChange={event => setNewSceneName(event.target.value)} style={{ flex: 1, minWidth: 0, height: '24px', fontSize: '11px', background: 'rgba(5, 11, 23, 0.7)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '0 6px', color: '#fff' }} />
        <button type="submit" title="Add scene" aria-label="Add scene" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '3px', color: '#fff', cursor: 'pointer' }}><Plus size={12} /></button>
      </form>

      {/* Scrollable Scene List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '0', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        scrollbarWidth: 'thin'
      }}>
        {localScenes.map((scene, idx) => (
          <div 
            key={scene.id}
            role="button"
            tabIndex={0}
            aria-label={`Preview ${scene.name}`}
            onClick={() => selectScene(scene.id)}
            onDoubleClick={() => takeLive(scene.id)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectScene(scene.id) } }}
            onContextMenu={event => handleRightClick(event, scene.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            style={{
              border: scene.activeStatus === 'PROGRAM' ? '1px solid #ef4444' : scene.activeStatus === 'PREVIEW' ? '1px solid #10b981' : '1px solid var(--border-color)',
              borderRadius: '4px',
              background: scene.activeStatus === 'PROGRAM' ? 'rgba(239, 68, 68, 0.15)' : scene.activeStatus === 'PREVIEW' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              padding: '3px 6px',
              gap: '8px',
              cursor: 'pointer',
              height: '38px',
              boxSizing: 'border-box',
              flexShrink: 0,
              boxShadow: scene.activeStatus === 'PROGRAM' ? '0 0 8px rgba(239, 68, 68, 0.25)' : undefined
            }}
          >
            {/* Left Thumbnail */}
            <div style={{ 
              width: '46px', 
              height: '28px', 
              backgroundImage: scene.thumbnail ? `url('${scene.thumbnail}')` : undefined,
              backgroundColor: '#0c1527',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '3px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              flexShrink: 0
            }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, gap: '1px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: scene.activeStatus === 'PROGRAM' ? '#ef4444' : scene.activeStatus === 'PREVIEW' ? '#34d399' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {scene.name}
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '8.5px', color: '#64748b', fontFamily: 'var(--mono)' }}>
                  {scene.duration}
                </span>
                <span style={{ fontSize: '8px', color: '#64748b' }}>
                  {scene.sourceCount} src
                </span>
              </div>
            </div>
            
            {/* Right Tag */}
            {scene.activeStatus === 'PROGRAM' ? (
              <div style={{ background: '#ef4444', color: '#fff', fontSize: '7.5px', fontWeight: 900, padding: '2px 5px', borderRadius: '2px', letterSpacing: '0.06em', flexShrink: 0, boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}>
                LIVE
              </div>
            ) : scene.activeStatus === 'PREVIEW' ? (
              <div style={{ background: '#10b981', color: '#042f1a', fontSize: '7.5px', fontWeight: 900, padding: '2px 5px', borderRadius: '2px', letterSpacing: '0.06em', flexShrink: 0 }}>
                PREV
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: 'Rename Scene', icon: <Edit3 size={12} />, action: () => {
              const scene = scenes.find(item => item.id === contextMenu.sceneId)
              const name = window.prompt('Scene name', scene?.name || '')
              if (name) renameScene(contextMenu.sceneId, name)
            } },
            { separator: true },
            { label: 'Load to Preview', icon: <MonitorPlay size={12} />, action: () => selectScene(contextMenu.sceneId) },
            { label: 'Take Live', icon: <MonitorUp size={12} />, action: () => takeLive(contextMenu.sceneId) },
            { separator: true },
            { label: (scenes.find(s => s.id === contextMenu.sceneId)?.pinned) ? 'Unpin Scene' : 'Pin Scene', icon: (scenes.find(s => s.id === contextMenu.sceneId)?.pinned) ? <PinOff size={12} /> : <Pin size={12} />, action: () => togglePinScene(contextMenu.sceneId) },
            { label: 'Duplicate Scene', icon: <Copy size={12} />, action: () => duplicateScene(contextMenu.sceneId) },
            { separator: true },
            { label: 'Delete', icon: <Trash2 size={12} />, danger: true, action: () => deleteScene(contextMenu.sceneId) }
          ]}
        />
      )}
    </div>
  )
}
