const fs = require('fs');

const sceneMatrixContent = `import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useBroadcast } from '../context/BroadcastContext'
import type { Scene } from '../context/BroadcastContext'
import { Plus } from 'lucide-react'
import { VmixInputCard } from './VmixInputCard'
import { SceneSettingsModal } from './SceneSettingsModal'
import { ContextMenu } from './ContextMenu'

export const SceneMatrix: React.FC = () => {
  const { 
    scenes = [], 
    activeScene, 
    liveScene, 
    selectScene, 
    takeLive, 
    autoTransition, 
    duplicateScene, 
    deleteScene, 
    togglePinScene = () => {}, 
    addScene, 
    setScenes = () => {} 
  } = useBroadcast()

  const [settingsSceneId, setSettingsSceneId] = useState<string | null>(null)
  const [contextMenuSceneId, setContextMenuSceneId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState<string>('ALL')

  const tabs = ['ALL', 'CAMERAS', 'VIDEO', 'AUDIO', 'GRAPHICS', 'PLAYBACK', 'NDI', 'STREAM', 'CUSTOM']

  const baseScenes = useMemo(() => {
    return (scenes || []).filter(s => !s.id.endsWith('_live'))
  }, [scenes])

  // Wheel horizontal scrolling & Virtualization
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerHeight, setContainerHeight] = useState(300)

  useEffect(() => {
    if (!scrollContainerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setContainerHeight(entry.contentRect.height)
        }
      }
    })
    observer.observe(scrollContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      if (e.deltaY !== 0) {
        e.preventDefault()
        scrollContainerRef.current.scrollLeft += e.deltaY
      }
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  // Responsive Virtualization
  const cardWidth = 138
  const cardHeight = 110
  
  // Two rows constraint as requested
  const rowsCount = 2 

  const startCol = Math.max(0, Math.floor(scrollLeft / cardWidth) - 2) // 2 cols buffer
  const visibleCols = 15 // render 15 columns max
  const endCol = startCol + visibleCols

  const visibleScenes = useMemo(() => {
    return baseScenes.slice(startCol * rowsCount, endCol * rowsCount)
  }, [baseScenes, startCol, endCol, rowsCount])

  const totalWidth = Math.ceil(baseScenes.length / rowsCount) * cardWidth

  // Drag and Drop reordering for scenes in matrix
  const handleSceneDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('scene_matrix_drag_index', index.toString())
  }

  const handleSceneDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSceneDrop = (e: React.DragEvent, hoverIndex: number) => {
    const dragIndexStr = e.dataTransfer.getData('scene_matrix_drag_index')
    if (!dragIndexStr) return 
    
    e.preventDefault()
    e.stopPropagation()

    const dragIndex = parseInt(dragIndexStr, 10)
    if (isNaN(dragIndex) || dragIndex === hoverIndex) return

    const updated = [...scenes]
    const [removed] = updated.splice(dragIndex, 1)
    updated.splice(hoverIndex, 0, removed)
    setScenes(updated)
  }

  // Context Menu handlers
  const handleContextMenu = (e: React.MouseEvent, sceneId: string) => {
    e.preventDefault()
    setContextMenuSceneId(sceneId)
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const closeMenu = () => setContextMenuSceneId(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [])

  return (
    <div className="scene-matrix" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0e17' }}>
      <div className="matrix-tabs" style={{ display: 'flex', borderBottom: '1px solid #1e293b', padding: '4px 8px 0', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 12px',
              background: activeTab === tab ? '#1e293b' : 'transparent',
              color: activeTab === tab ? '#fff' : '#94a3b8',
              border: 'none',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div 
        ref={scrollContainerRef}
        className="matrix-grid-container"
        onWheel={handleWheel}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          position: 'relative'
        }}
      >
        <div style={{ width: \`\${totalWidth}px\`, height: '100%', position: 'relative' }}>
          {visibleScenes.map((scene, i) => {
            const index = startCol * rowsCount + i
            if (index >= baseScenes.length) return null

            const col = Math.floor(index / rowsCount)
            const row = index % rowsCount

            return (
              <div 
                key={scene.id}
                draggable
                onDragStart={(e) => handleSceneDragStart(e, index)}
                onDragOver={handleSceneDragOver}
                onDrop={(e) => handleSceneDrop(e, index)}
                onContextMenu={(e) => handleContextMenu(e, scene.id)}
                style={{
                  position: 'absolute',
                  left: \`\${col * cardWidth}px\`,
                  top: \`\${row * cardHeight + 8}px\`, // +8px padding top
                  width: \`\${cardWidth - 8}px\`, // -8px for gap
                  height: \`\${cardHeight - 8}px\`,
                }}
              >
                <VmixInputCard 
                  scene={scene} 
                  inputNumber={index + 1}
                  isLive={liveScene === scene.id}
                  isPreview={activeScene === scene.id}
                  onClick={() => selectScene(scene.id)}
                  onDoubleClick={() => takeLive(scene.id)}
                />
              </div>
            )
          })}

          {/* Add Scene Button as last card */}
          <div 
            style={{
              position: 'absolute',
              left: \`\${Math.floor(baseScenes.length / rowsCount) * cardWidth}px\`,
              top: \`\${(baseScenes.length % rowsCount) * cardHeight + 8}px\`,
              width: \`\${cardWidth - 8}px\`,
              height: \`\${cardHeight - 8}px\`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed #334155',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={addScene}
          >
            <Plus size={24} color="#64748b" />
          </div>
        </div>
      </div>

      {settingsSceneId && (
        <SceneSettingsModal 
          sceneId={settingsSceneId} 
          onClose={() => setSettingsSceneId(null)} 
        />
      )}

      {contextMenuSceneId && (
        <ContextMenu 
          x={menuPos.x} 
          y={menuPos.y} 
          onClose={() => setContextMenuSceneId(null)}
          items={[
            { label: 'Quick Play', onClick: () => takeLive(contextMenuSceneId) },
            { label: 'Properties', onClick: () => setSettingsSceneId(contextMenuSceneId) },
            { label: 'Rename', onClick: () => {
              const newName = prompt('Enter new scene name:')
              if (newName) {
                setScenes(prev => (prev || []).map(s => s.id === contextMenuSceneId ? { ...s, name: newName } : s))
              }
            } },
            { type: 'separator' },
            { label: 'Duplicate', onClick: () => duplicateScene(contextMenuSceneId) },
            { label: 'Pin to Left', onClick: () => togglePinScene(contextMenuSceneId) },
            { type: 'separator' },
            { label: 'Delete', onClick: () => deleteScene(contextMenuSceneId), danger: true }
          ]}
        />
      )}
    </div>
  )
}
`

fs.writeFileSync('src/components/SceneMatrix.tsx', sceneMatrixContent);

console.log('SceneMatrix refactored for 2-row infinite scroll virtualization');
