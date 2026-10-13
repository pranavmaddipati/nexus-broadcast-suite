const fs = require('fs');

// 1. Rewrite VmixInputCard to be a Media Card
const vmixInputCardContent = `import React, { useEffect, useRef, useState } from 'react'
import { GripVertical, Volume2, VolumeX, Settings, X, RefreshCw, Play, Scissors, Layers } from 'lucide-react'
import type { Scene } from '../context/BroadcastContext'
import { useBroadcast } from '../context/BroadcastContext'

interface MiniPreviewProps {
  scene: Scene
}

const MiniPreview: React.FC<MiniPreviewProps> = React.memo(({ scene }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { videoElements = [], imageElements = [] } = useBroadcast()

  useEffect(() => {
    let animId = 0
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const render = () => {
      ctx.fillStyle = '#0f131f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = scene?.sources?.length - 1; i >= 0; i--) {
        const src = scene?.sources[i]
        if (!src.visible) continue
        ctx.save()
        ctx.globalAlpha = src.opacity

        const scale = 0.1
        const x = src.x * scale
        const y = src.y * scale
        const w = src.width * scale
        const h = src.height * scale

        if (src.type === 'color_source') {
          ctx.fillStyle = src.settings?.backgroundColor || '#1e3a8a'
          ctx.fillRect(x, y, w, h)
        } else if (src.type === 'text') {
          ctx.fillStyle = '#ffffff'
          ctx.font = '7px sans-serif'
          ctx.fillText(src.settings?.textContent?.substring(0, 10) || '', x + 2, y + 8)
        } else if (['camera', 'media', 'video', 'display_capture', 'window_capture', 'ndi', 'audio'].includes(src.type)) {
          const video = videoElements[src.id]
          if (video && (video.readyState >= 2 || (video.readyState >= 1 && video.videoWidth > 0))) {
            ctx.drawImage(video, x, y, w, h)
          } else {
            ctx.fillStyle = '#1e1b4b'
            ctx.fillRect(x, y, w, h)
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)'
            ctx.strokeRect(x, y, w, h)
          }
        } else if (src.type === 'image') {
          const img = imageElements[src.id]
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, w, h)
          } else {
            ctx.fillStyle = '#1e293b'
            ctx.fillRect(x, y, w, h)
          }
        } else if (src.type === 'slides') {
          const slideUrls = src.settings?.slideUrls || []
          const slideIndex = src.settings?.slideIndex || 0
          const currentSlideUrl = slideUrls[slideIndex]
          if (currentSlideUrl) {
            const img = imageElements[src.id]
            if (img && img.complete && img.naturalWidth > 0) {
              ctx.drawImage(img, x, y, w, h)
            } else {
              ctx.fillStyle = '#1e293b'
              ctx.fillRect(x, y, w, h)
            }
          } else {
            ctx.fillStyle = '#0f172a'
            ctx.fillRect(x, y, w, h)
            ctx.fillStyle = '#38bdf8'
            ctx.font = '6px sans-serif'
            ctx.fillText(\`Slide \${slideIndex + 1}\`, x + 4, y + 8)
          }
        } else {
          ctx.fillStyle = '#1e293b'
          ctx.fillRect(x, y, w, h)
        }
        ctx.restore()
      }

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [scene, videoElements, imageElements])

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={144}
      style={{ width: '100%', aspectRatio: '16/9', display: 'block', objectFit: 'cover' }}
    />
  )
})

interface VmixInputCardProps {
  scene: Scene
  index: number
  activeScene: string
  liveScene: string
  selectScene: (id: string) => void
  takeLive: (id?: string) => void
  autoTransition: (id?: string) => void
  togglePinScene: (id: string) => void
  updateSourceProperties: (sceneId: string, sourceId: string, updates: any) => void
  toggleChannelMute: (id: string) => void
  activeOverlays: Record<number, string | null>
  toggleOverlay: (slot: number, sceneId: string) => void
  setSettingsSceneId: (id: string | null) => void
  onDelete?: () => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

export const VmixInputCard: React.FC<VmixInputCardProps> = React.memo(({
  scene,
  index,
  activeScene,
  liveScene,
  selectScene,
  takeLive,
  autoTransition,
  togglePinScene,
  updateSourceProperties,
  toggleChannelMute,
  activeOverlays,
  toggleOverlay,
  setSettingsSceneId,
  onDelete,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const isPreview = scene?.id === activeScene
  const isLive = scene?.id === liveScene || (liveScene && liveScene.endsWith('_live') && scene?.id === liveScene.replace('_live', ''))

  const isLooping = (scene?.sources || []).some(src => ['media', 'video'].includes(src.type) && src.settings?.loop !== false)
  const isMuted = (scene?.sources || []).some(src => ['camera', 'media', 'video', 'audio', 'ndi'].includes(src.type) && src.muted)

  const handleToggleLoop = (e: React.MouseEvent) => {
    e.stopPropagation()
    scene?.sources?.forEach(src => {
      if (['media', 'video'].includes(src.type)) {
        const currentLoop = src.settings?.loop !== false
        updateSourceProperties(scene?.id, src.id, {
          settings: { ...src.settings, loop: !currentLoop }
        })
      }
    })
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    scene?.sources?.forEach(src => {
      if (['camera', 'media', 'video', 'audio', 'ndi'].includes(src.type)) {
        toggleChannelMute(src.id)
      }
    })
  }

  return (
    <div
      className={\`media-card \${isLive ? 'is-live' : ''} \${isPreview ? 'is-preview' : ''}\`}
      onClick={() => selectScene(scene?.id)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* THUMBNAIL AREA */}
      <div className="media-card-thumbnail-container">
        <MiniPreview scene={scene} />
        
        {/* NUMBER BADGE */}
        <div className="media-card-number-badge">
          {index + 1}
        </div>
        
        {/* PROGRAM/PREVIEW FLOATING BADGES */}
        {isLive && (
          <div className="media-card-floating-badge badge-live">PGM</div>
        )}
        {!isLive && isPreview && (
          <div className="media-card-floating-badge badge-preview">PVW</div>
        )}
        
        {/* STATUS ICONS (Overlay) */}
        <div className="media-card-status-overlay">
          {isMuted && <VolumeX size={10} color="#ef4444" />}
          {isLooping && <RefreshCw size={10} color="#38bdf8" />}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="media-card-content">
        
        {/* Title & Metadata */}
        <div className="media-card-header">
          <span className="media-card-title">{scene?.name || 'Untitled Scene'}</span>
          <span className="media-card-timer">{scene?.duration || '00:00:00'}</span>
        </div>

        {/* Compact Action Chips */}
        <div className="media-card-actions" onClick={e => e.stopPropagation()}>
          <div className="chip-row">
            <button className="chip-btn" onClick={() => autoTransition(scene?.id)}>QUICK</button>
            <button className="chip-btn chip-cut" onClick={() => takeLive(scene?.id)}>CUT</button>
            <button className={\`chip-btn \${isLooping ? 'chip-active-blue' : ''}\`} onClick={handleToggleLoop}>LOOP</button>
          </div>
          
          <div className="chip-row">
            {[1, 2, 3, 4].map(slot => (
              <button key={slot} className={\`chip-btn chip-square \${activeOverlays[slot] === scene?.id ? 'chip-active-blue' : ''}\`} onClick={() => toggleOverlay(slot, scene?.id)}>
                {slot}
              </button>
            ))}
          </div>

          <div className="chip-row">
            <button className={\`chip-btn \${isMuted ? 'chip-active-red' : ''}\`} onClick={handleToggleMute}>AUD</button>
            <button className="chip-btn chip-icon-btn" onClick={() => setSettingsSceneId(scene?.id)}>
              <Settings size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.scene === nextProps.scene &&
    prevProps.index === nextProps.index &&
    prevProps.activeScene === nextProps.activeScene &&
    prevProps.liveScene === nextProps.liveScene &&
    prevProps.activeOverlays === nextProps.activeOverlays &&
    prevProps.draggable === nextProps.draggable;
})
`;

fs.writeFileSync('src/components/VmixInputCard.tsx', vmixInputCardContent);
console.log('Updated VmixInputCard.tsx');


// 2. Remove bright borders from Preview and Program Monitors
function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/ProgramMonitor.tsx', 
  /boxShadow: 'inset 0 0 30px rgba\(239,68,68,0\.3\), 0 0 20px rgba\(239,68,68,0\.2\)'/, 
  "boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)'");
  
replaceInFile('src/components/PreviewMonitor.tsx',
  /boxShadow: 'inset 0 0 30px rgba\(0,0,0,0\.8\), 0 0 20px rgba\(0,0,0,0\.5\)'/,
  "boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)'");

// 3. Inject step 10 CSS
const step10CSS = `

/* ==========================================================================
   STEP 10: PROFESSIONAL BROADCAST DESIGN SYSTEM
   ========================================================================== */

/* SURFACE COLORS (4 LEVELS) */
:root {
  --surface-bg: #030509; /* App background */
  --surface-workspace: #080c14; /* Workspace background */
  --surface-card: #121826; /* Regular panels and cards */
  --surface-raised: #1e2638; /* Raised interactive elements */
  
  --border-dim: rgba(255, 255, 255, 0.04);
  --border-card: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(255, 255, 255, 0.15);
  
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.6);
  --shadow-raised: 0 8px 24px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.8);
  
  --text-h1: 14px;
  --text-h2: 12px;
  --text-body: 11px;
  --text-meta: 9px;
  
  --radius-panel: 8px;
  --radius-card: 6px;
  --radius-chip: 4px;
}

/* OVERRIDES FOR SURFACES */
.app, .nexus-workspace-grid-container {
  background-color: var(--surface-bg) !important;
}

#top-workspace, #bottom-workspace {
  background-color: var(--surface-workspace) !important;
}

.monitor-container, .dock-grid-cell, .panel-content-area, .workspace-dock-container > div {
  background-color: var(--surface-card) !important;
  border: 1px solid var(--border-card) !important;
  border-radius: var(--radius-panel) !important;
  box-shadow: var(--shadow-card) !important;
}

/* PANEL HEADERS - Complete Redesign */
.panel-header, .monitor-header {
  background: linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-card) 100%) !important;
  border-bottom: 1px solid var(--border-dim) !important;
  height: 28px !important;
  padding: 0 12px !important;
  display: flex !important;
  align-items: center !important;
}

.panel-header > span, .text-panel-title {
  font-family: 'Inter', sans-serif !important;
  font-size: var(--text-h2) !important;
  font-weight: 700 !important;
  letter-spacing: 0.03em !important;
  color: #f1f5f9 !important;
  text-transform: capitalize !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
}

/* MEDIA CARDS (Pinned Scenes Overhaul) */
.media-card {
  display: flex !important;
  flex-direction: column !important;
  height: 220px !important; /* Taller for large thumbnail */
  background: var(--surface-card) !important;
  border: 1px solid var(--border-card) !important;
  border-radius: var(--radius-panel) !important;
  padding: 0 !important;
  overflow: hidden !important;
  box-shadow: var(--shadow-card) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
}

.media-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: var(--shadow-raised) !important;
  border-color: var(--border-focus) !important;
}

.media-card.is-live {
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.media-card.is-preview {
  border-color: rgba(34, 197, 94, 0.3) !important;
}

.media-card-thumbnail-container {
  position: relative !important;
  width: 100% !important;
  height: 120px !important;
  background: #000 !important;
  border-bottom: 1px solid var(--border-dim) !important;
}

.media-card-number-badge {
  position: absolute !important;
  top: 6px !important;
  left: 6px !important;
  background: rgba(0,0,0,0.6) !important;
  backdrop-filter: blur(4px) !important;
  color: #cbd5e1 !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}

.media-card-floating-badge {
  position: absolute !important;
  top: 6px !important;
  right: 6px !important;
  font-size: 9px !important;
  font-weight: 800 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}

.badge-live {
  background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%) !important;
  color: #fff !important;
  border: 1px solid #7f1d1d !important;
}

.badge-preview {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%) !important;
  color: #fff !important;
  border: 1px solid #14532d !important;
}

.media-card-status-overlay {
  position: absolute !important;
  bottom: 6px !important;
  right: 6px !important;
  display: flex !important;
  gap: 4px !important;
}

.media-card-content {
  padding: 8px 12px !important;
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  justify-content: space-between !important;
}

.media-card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 8px !important;
}

.media-card-title {
  font-size: var(--text-h2) !important;
  font-weight: 700 !important;
  color: #f8fafc !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.media-card-timer {
  font-family: 'JetBrains Mono', 'Courier New', monospace !important;
  font-size: var(--text-meta) !important;
  color: #64748b !important;
}

/* COMPACT ACTION CHIPS */
.media-card-actions {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.chip-row {
  display: flex !important;
  gap: 4px !important;
}

.chip-btn {
  flex: 1 !important;
  background: var(--surface-raised) !important;
  border: 1px solid var(--border-dim) !important;
  border-radius: var(--radius-chip) !important;
  color: #94a3b8 !important;
  font-size: var(--text-meta) !important;
  font-weight: 700 !important;
  padding: 4px 0 !important;
  cursor: pointer !important;
  transition: all 0.15s ease-out !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.chip-btn:hover {
  background: #334155 !important;
  color: #fff !important;
}

.chip-active-blue {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%) !important;
  color: #fff !important;
  border-color: #1d4ed8 !important;
}

.chip-active-red {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%) !important;
  color: #fff !important;
  border-color: #b91c1c !important;
}

.chip-cut {
  color: #ef4444 !important;
}
.chip-cut:hover {
  background: #ef4444 !important;
  color: #fff !important;
}

/* GLOBAL ANIMATIONS & TRANSITIONS */
* {
  transition: border-color 0.15s ease-out, box-shadow 0.15s ease-out !important;
}

/* FIXING PINNED SCENES PANEL TO ACCOMMODATE LARGER CARDS */
.sequence-item {
  height: auto !important; /* Override previous hardcoded height */
}

/* Remove bright borders from main UI */
#top-workspace > div {
  border-right: 1px solid var(--border-dim) !important;
}
`;

let cssContent = fs.readFileSync('src/App.css', 'utf8');
if (!cssContent.includes('STEP 10: PROFESSIONAL BROADCAST DESIGN SYSTEM')) {
  fs.appendFileSync('src/App.css', step10CSS);
  console.log('App.css appended with Step 10 styles.');
}
