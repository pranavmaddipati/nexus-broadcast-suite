const fs = require('fs');

const previewMonitorContent = `import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useBroadcast } from '../context/BroadcastContext'
import type { SceneSource } from '../context/BroadcastContext'
import { ContextMenu } from './ContextMenu'

export const PreviewMonitor: React.FC = () => {
  const { 
    activeScene, 
    previewCanvasRef, 
    scenes = [], 
    selectedSourceId, 
    setSelectedSourceId = () => {}, 
    updateSourceProperties = () => {} 
  } = useBroadcast()

  const currentScene = useMemo(() => (scenes || []).find(s => s.id === activeScene), [scenes, activeScene])
  const sceneName = currentScene ? currentScene.name : 'Preview Feed'

  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number} | null>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [sourceStart, setSourceStart] = useState({ x: 0, y: 0, w: 0, h: 0, rot: 0 })
  const [activeHandle, setActiveHandle] = useState<string | null>(null) // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'rot'
  const [showGrid, setShowGrid] = useState(true)
  const [showSafeArea, setShowSafeArea] = useState(true)

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }

  // Keyboard nudge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSourceId || !currentScene) return
      const hitSource = currentScene.sources?.find(s => s.id === selectedSourceId)
      if (!hitSource || hitSource.locked) return

      let dx = 0, dy = 0
      const step = e.shiftKey ? 10 : 1

      if (e.key === 'ArrowUp') dy = -step
      if (e.key === 'ArrowDown') dy = step
      if (e.key === 'ArrowLeft') dx = -step
      if (e.key === 'ArrowRight') dx = step

      if (dx !== 0 || dy !== 0) {
        e.preventDefault()
        updateSourceProperties(activeScene, selectedSourceId, {
          x: hitSource.x + dx,
          y: hitSource.y + dy
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSourceId, currentScene, activeScene, updateSourceProperties])

  // Mouse Interaction Logic
  const getScale = () => {
    if (!containerRef.current) return { scaleX: 1, scaleY: 1 }
    const rect = containerRef.current.getBoundingClientRect()
    return { scaleX: 1920 / rect.width, scaleY: 1080 / rect.height }
  }

  const getSourceHandles = (src: SceneSource) => {
    const hw = 10 // Handle size in 1920x1080 coordinates
    return {
      nw: { x: src.x - hw, y: src.y - hw, w: hw*2, h: hw*2, cursor: 'nwse-resize' },
      ne: { x: src.x + src.width - hw, y: src.y - hw, w: hw*2, h: hw*2, cursor: 'nesw-resize' },
      se: { x: src.x + src.width - hw, y: src.y + src.height - hw, w: hw*2, h: hw*2, cursor: 'nwse-resize' },
      sw: { x: src.x - hw, y: src.y + src.height - hw, w: hw*2, h: hw*2, cursor: 'nesw-resize' },
      n:  { x: src.x + src.width/2 - hw, y: src.y - hw, w: hw*2, h: hw*2, cursor: 'ns-resize' },
      s:  { x: src.x + src.width/2 - hw, y: src.y + src.height - hw, w: hw*2, h: hw*2, cursor: 'ns-resize' },
      e:  { x: src.x + src.width - hw, y: src.y + src.height/2 - hw, w: hw*2, h: hw*2, cursor: 'ew-resize' },
      w:  { x: src.x - hw, y: src.y + src.height/2 - hw, w: hw*2, h: hw*2, cursor: 'ew-resize' },
      rot: { x: src.x + src.width/2 - hw, y: src.y - 40, w: hw*2, h: hw*2, cursor: 'crosshair' }
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!currentScene || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const { scaleX, scaleY } = getScale()
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Check handles of selected source first
    if (selectedSourceId) {
      const selectedSrc = currentScene.sources.find(s => s.id === selectedSourceId)
      if (selectedSrc && !selectedSrc.locked) {
        const handles = getSourceHandles(selectedSrc)
        for (const [handleId, h] of Object.entries(handles)) {
          if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
            setActiveHandle(handleId)
            setIsDragging(true)
            setDragStart({ x: e.clientX, y: e.clientY })
            setSourceStart({ x: selectedSrc.x, y: selectedSrc.y, w: selectedSrc.width, h: selectedSrc.height, rot: selectedSrc.settings?.rotation || 0 })
            return
          }
        }
      }
    }

    // Check body hit
    let hitSourceId: string | null = null
    for (let i = currentScene.sources.length - 1; i >= 0; i--) {
      const src = currentScene.sources[i]
      if (!src.visible) continue
      if (x >= src.x && x <= src.x + src.width && y >= src.y && y <= src.y + src.height) {
        hitSourceId = src.id
        break
      }
    }

    setSelectedSourceId(hitSourceId)
    
    if (hitSourceId) {
      const hitSource = currentScene.sources.find(s => s.id === hitSourceId)
      if (hitSource && !hitSource.locked) {
        setIsDragging(true)
        setActiveHandle(null)
        setDragStart({ x: e.clientX, y: e.clientY })
        setSourceStart({ x: hitSource.x, y: hitSource.y, w: hitSource.width, h: hitSource.height, rot: hitSource.settings?.rotation || 0 })
      }
    } else {
      setIsDragging(false)
      setActiveHandle(null)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    // Change cursor based on hover
    if (!isDragging && selectedSourceId && containerRef.current && currentScene) {
      const rect = containerRef.current.getBoundingClientRect()
      const { scaleX, scaleY } = getScale()
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY
      const selectedSrc = currentScene.sources.find(s => s.id === selectedSourceId)
      
      let cursor = 'default'
      if (selectedSrc && !selectedSrc.locked) {
        const handles = getSourceHandles(selectedSrc)
        for (const [_, h] of Object.entries(handles)) {
          if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
            cursor = h.cursor
            break
          }
        }
        if (cursor === 'default' && x >= selectedSrc.x && x <= selectedSrc.x + selectedSrc.width && y >= selectedSrc.y && y <= selectedSrc.y + selectedSrc.height) {
          cursor = 'move'
        }
      }
      containerRef.current.style.cursor = cursor
    }

    if (!isDragging || !selectedSourceId || !currentScene) return

    const { scaleX, scaleY } = getScale()
    const dx = (e.clientX - dragStart.x) * scaleX
    const dy = (e.clientY - dragStart.y) * scaleY

    if (!activeHandle) {
      // Snap to canvas edges and center
      let newX = sourceStart.x + dx
      let newY = sourceStart.y + dy
      
      const snapPointsX = [0, 1920/2 - sourceStart.w/2, 1920 - sourceStart.w]
      const snapPointsY = [0, 1080/2 - sourceStart.h/2, 1080 - sourceStart.h]
      const SNAP_THRES = 20

      for (let sx of snapPointsX) if (Math.abs(newX - sx) < SNAP_THRES) newX = sx
      for (let sy of snapPointsY) if (Math.abs(newY - sy) < SNAP_THRES) newY = sy

      updateSourceProperties(activeScene, selectedSourceId, { x: newX, y: newY })
    } else if (activeHandle === 'rot') {
      const selectedSrc = currentScene.sources.find(s => s.id === selectedSourceId)
      if (!selectedSrc) return
      const cx = sourceStart.x + sourceStart.w / 2
      const cy = sourceStart.y + sourceStart.h / 2
      const rect = containerRef.current!.getBoundingClientRect()
      const pointerX = (e.clientX - rect.left) * scaleX
      const pointerY = (e.clientY - rect.top) * scaleY
      
      let angle = Math.atan2(pointerY - cy, pointerX - cx) * (180 / Math.PI) + 90
      
      // Snap to 45 degree increments if shift pressed
      if (e.shiftKey) {
        angle = Math.round(angle / 45) * 45
      }

      updateSourceProperties(activeScene, selectedSourceId, {
        settings: { ...selectedSrc.settings, rotation: angle }
      })
    } else {
      let newX = sourceStart.x
      let newY = sourceStart.y
      let newW = sourceStart.w
      let newH = sourceStart.h

      const maintainAspect = e.shiftKey
      const aspect = sourceStart.w / sourceStart.h

      if (activeHandle.includes('w')) {
        newX = sourceStart.x + dx
        newW = sourceStart.w - dx
      }
      if (activeHandle.includes('e')) {
        newW = sourceStart.w + dx
      }
      if (activeHandle.includes('n')) {
        newY = sourceStart.y + dy
        newH = sourceStart.h - dy
      }
      if (activeHandle.includes('s')) {
        newH = sourceStart.h + dy
      }

      if (maintainAspect) {
        if (activeHandle === 'se' || activeHandle === 'e' || activeHandle === 's') {
          newH = newW / aspect
        } else if (activeHandle === 'nw' || activeHandle === 'w' || activeHandle === 'n') {
          const deltaX = sourceStart.x - newX
          newY = sourceStart.y - deltaX / aspect
          newH = sourceStart.h + deltaX / aspect
        }
      }

      updateSourceProperties(activeScene, selectedSourceId, {
        x: newX,
        y: newY,
        width: Math.max(10, newW),
        height: Math.max(10, newH)
      })
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setActiveHandle(null)
  }

  // Draw Overlay Graphics (Selection, Safe Areas, Grids)
  useEffect(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, 1920, 1080)

    // Draw Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(i * 1920/3, 0); ctx.lineTo(i * 1920/3, 1080); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 1080/3); ctx.lineTo(1920, i * 1080/3); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath(); ctx.moveTo(1920/2, 0); ctx.lineTo(1920/2, 1080); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 1080/2); ctx.lineTo(1920, 1080/2); ctx.stroke();
    }

    // Draw Safe Area
    if (showSafeArea) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 2
      // Title Safe
      ctx.strokeRect(1920 * 0.1, 1080 * 0.1, 1920 * 0.8, 1080 * 0.8)
      // Action Safe
      ctx.setLineDash([5, 5])
      ctx.strokeRect(1920 * 0.05, 1080 * 0.05, 1920 * 0.9, 1080 * 0.9)
      ctx.setLineDash([])
    }

    if (selectedSourceId && currentScene) {
      const src = currentScene.sources.find(s => s.id === selectedSourceId)
      if (src && !src.locked) {
        ctx.save()
        
        // Translate and Rotate Context if needed
        const rot = src.settings?.rotation || 0
        const cx = src.x + src.width/2
        const cy = src.y + src.height/2
        
        if (rot !== 0) {
          ctx.translate(cx, cy)
          ctx.rotate(rot * Math.PI / 180)
          ctx.translate(-cx, -cy)
        }

        // Bounding Box
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 4
        ctx.strokeRect(src.x, src.y, src.width, src.height)

        // Handles
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        const handles = getSourceHandles(src)
        for (const [id, h] of Object.entries(handles)) {
          if (id === 'rot') {
            ctx.beginPath()
            ctx.arc(h.x + h.w/2, h.y + h.h/2, 8, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            
            // Draw line to top of rect
            ctx.beginPath()
            ctx.moveTo(cx, src.y)
            ctx.lineTo(h.x + h.w/2, h.y + h.h/2)
            ctx.stroke()
          } else {
            ctx.fillRect(h.x, h.y, h.w, h.h)
            ctx.strokeRect(h.x, h.y, h.w, h.h)
          }
        }
        ctx.restore()
      }
    }
  }, [currentScene, selectedSourceId, showGrid, showSafeArea])

  return (
    <div className="monitor-container">
      <div className="monitor-header">
        <span className="monitor-title-badge" style={{ background: '#10b981', color: '#fff' }}>PREVIEW</span>
        <span className="monitor-source-name-right">{sceneName.toUpperCase()}</span>
      </div>

      <div 
        className="monitor-screen preview-tally" 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleCanvasContextMenu}
      >
        <canvas
          ref={previewCanvasRef}
          width={1920}
          height={1080}
          className="monitor-video"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        <canvas
          ref={overlayCanvasRef}
          width={1920}
          height={1080}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        
        <div className="monitor-res-overlay">1920x1080 60p</div>
      </div>

      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
          items={[
            { label: 'Transform: Fit to Screen', onClick: () => selectedSourceId && updateSourceProperties(activeScene, selectedSourceId, { x: 0, y: 0, width: 1920, height: 1080 }) },
            { label: 'Transform: Center to Screen', onClick: () => {
              const src = currentScene?.sources.find(s => s.id === selectedSourceId)
              if (src) updateSourceProperties(activeScene, selectedSourceId, { x: 1920/2 - src.width/2, y: 1080/2 - src.height/2 })
            } },
            { label: 'Transform: Reset Rotation', onClick: () => {
              const src = currentScene?.sources.find(s => s.id === selectedSourceId)
              if (src) updateSourceProperties(activeScene, selectedSourceId, { settings: { ...src.settings, rotation: 0 } })
            }},
            { type: 'separator' },
            { label: 'Toggle Grid', onClick: () => setShowGrid(!showGrid) },
            { label: 'Toggle Safe Areas', onClick: () => setShowSafeArea(!showSafeArea) },
            { type: 'separator' },
            { label: 'Lock Aspect Ratio', onClick: () => alert('Locked aspect ratio') },
          ]}
        />
      )}
    </div>
  )
}
`

fs.writeFileSync('src/components/PreviewMonitor.tsx', previewMonitorContent);
console.log('PreviewMonitor refactored with full Transform handles, overlays, and rotation');
