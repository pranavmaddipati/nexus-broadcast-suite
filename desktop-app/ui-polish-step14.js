const fs = require('fs');

// 1. Rewrite VmixInputCard to match Blue-Black Broadcast Concept
const vmixInputCardContent = `import React, { useEffect, useRef } from 'react'
import { Settings, VolumeX, RefreshCw } from 'lucide-react'
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
      ctx.fillStyle = '#020617'
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
            ctx.strokeStyle = 'rgba(255,255,255,0.05)'
            ctx.strokeRect(x, y, w, h)
          }
        } else if (src.type === 'image') {
          const img = imageElements[src.id]
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, w, h)
          }
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
      style={{ width: '100%', aspectRatio: '16/9', display: 'block', borderBottom: '1px solid var(--border-color)' }}
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
  updateSourceProperties,
  toggleChannelMute,
  activeOverlays,
  toggleOverlay,
  setSettingsSceneId,
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
      className={\`concept-card \${isLive ? 'concept-live' : ''} \${isPreview ? 'concept-preview' : ''}\`}
      onClick={() => selectScene(scene?.id)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="concept-card-thumbnail">
        <MiniPreview scene={scene} />
        
        {isLive && <div className="concept-badge concept-badge-live">PROGRAM</div>}
        {isPreview && !isLive && <div className="concept-badge concept-badge-preview">PREVIEW</div>}

        <div className="concept-card-timer">{scene?.duration || '00:00:00'}</div>
      </div>

      <div className="concept-card-content" onClick={e => e.stopPropagation()}>
        
        <div className="concept-card-header">
          <div className="concept-card-title">{scene?.name || 'Scene'}</div>
          <button className="concept-btn-icon" onClick={() => setSettingsSceneId(scene?.id)}>
            <Settings size={12} />
          </button>
        </div>

        <div className="concept-card-controls">
          <div className="concept-footer-row">
            <button className="concept-action-btn" onClick={() => autoTransition(scene?.id)}>QUICK</button>
            <button className="concept-action-btn" onClick={() => takeLive(scene?.id)}>CUT</button>
            <button className={\`concept-action-btn \${isLooping ? 'concept-btn-active-blue' : ''}\`} onClick={handleToggleLoop}>LOOP</button>
          </div>
          
          <div className="concept-footer-row">
            {[1, 2, 3, 4].map(slot => (
              <button key={slot} className={\`concept-overlay-btn \${activeOverlays[slot] === scene?.id ? 'concept-btn-active-green' : ''}\`} onClick={() => toggleOverlay(slot, scene?.id)}>
                {slot}
              </button>
            ))}
          </div>

          <div className="concept-footer-row">
            <button className={\`concept-action-btn \${isMuted ? 'concept-btn-active-red' : ''}\`} onClick={handleToggleMute}>AUD</button>
            <button className={\`concept-action-btn \${isPreview ? 'concept-btn-active-green' : ''}\`} onClick={() => selectScene(scene?.id)}>PVW</button>
            <button className={\`concept-action-btn \${isLive ? 'concept-btn-active-red' : ''}\`} onClick={() => takeLive(scene?.id)}>PGM</button>
          </div>
        </div>

      </div>
    </div>
  )
})
`;
fs.writeFileSync('src/components/VmixInputCard.tsx', vmixInputCardContent);

// 2. Clean App.css from previous gray steps
let cssContent = fs.readFileSync('src/App.css', 'utf8');
const step12Index = cssContent.indexOf('/* ==========================================================================');
// Wipe from the previous block onwards
if (step12Index !== -1) {
  cssContent = cssContent.substring(0, step12Index);
}

// 3. Inject Step 14: True Blue-Black Concept Style
const step14CSS = `
/* ==========================================================================
   STEP 14: TRUE CONCEPT REPLICA (BLUE-BLACK BROADCAST)
   ========================================================================== */

:root {
  /* Concept Palette: Very dark blue-black */
  --bg-primary: #020617; /* Slate 950 */
  --bg-panel: #0f172a; /* Dark slate blue (Slate 900) */
  --bg-header: #1e293b; /* Slightly brighter than panel (Slate 800) */
  --bg-hover: #334155; /* Slate 700 */
  
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-focus: rgba(255, 255, 255, 0.12);
  
  --brand-red: #ef4444;
  --brand-red-dark: #b91c1c;
  --brand-green: #10b981;
  --brand-green-dark: #047857;
  --brand-blue: #3b82f6;
  --brand-blue-dark: #1d4ed8;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}

/* Base App */
html, body, #root, .app {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased !important;
}

/* Workspace Layout - Compact, elegant spacing */
#top-workspace, #bottom-workspace {
  background-color: var(--bg-primary) !important;
  gap: 8px !important;
  padding: 8px !important;
}

#top-workspace > div, #bottom-workspace > div, .monitor-container, .panel-content-area, .dock-grid-cell {
  background: var(--bg-panel) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important; /* Subtle elevation, NOT excessive */
  margin: 0 !important;
}

/* Navy Headers */
.panel-header, .monitor-header {
  background: var(--bg-header) !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  height: 28px !important;
  padding: 0 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.text-panel-title, .panel-header > span {
  font-size: 11px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}

/* CONCEPT-ACCURATE MEDIA CARDS (Pinned Scenes) */
.sequence-item {
  height: auto !important;
}
.concept-card {
  display: flex !important;
  flex-direction: column !important;
  background: var(--bg-panel) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  margin-bottom: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out !important;
}
.concept-card:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5) !important;
  border-color: var(--border-focus) !important;
}
.concept-card.concept-live { border: 1px solid var(--brand-red) !important; }
.concept-card.concept-preview { border: 1px solid var(--brand-green) !important; }

/* Thumbnail DOMINATES */
.concept-card-thumbnail {
  position: relative !important;
  background: #000 !important;
  width: 100% !important;
}
.concept-badge {
  position: absolute !important;
  top: 6px !important;
  left: 6px !important;
  font-size: 9px !important;
  font-weight: 800 !important;
  color: #fff !important;
  padding: 2px 6px !important;
  border-radius: 3px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}
.concept-badge-live { background: var(--brand-red) !important; }
.concept-badge-preview { background: var(--brand-green) !important; }

.concept-card-timer {
  position: absolute !important;
  bottom: 4px !important;
  right: 4px !important;
  background: rgba(15, 23, 42, 0.8) !important;
  color: var(--text-secondary) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 10px !important;
  padding: 2px 4px !important;
  border-radius: 2px !important;
  border: 1px solid var(--border-subtle) !important;
}

/* Card Content / Controls */
.concept-card-content {
  display: flex !important;
  flex-direction: column !important;
  padding: 6px !important;
}
.concept-card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 6px !important;
}
.concept-card-title {
  font-size: 12px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.concept-btn-icon {
  background: transparent !important;
  border: none !important;
  color: var(--text-secondary) !important;
  cursor: pointer !important;
}
.concept-btn-icon:hover { color: var(--text-primary) !important; }

.concept-card-controls {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}
.concept-footer-row {
  display: flex !important;
  gap: 4px !important;
}
.concept-action-btn, .concept-overlay-btn {
  flex: 1 !important;
  background: var(--bg-header) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text-secondary) !important;
  font-size: 9px !important;
  font-weight: 700 !important;
  padding: 4px 0 !important;
  border-radius: 3px !important;
  cursor: pointer !important;
  transition: all 0.1s ease-out !important;
}
.concept-action-btn:hover, .concept-overlay-btn:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
.concept-btn-active-blue { background: var(--brand-blue) !important; color: #fff !important; border-color: var(--brand-blue-dark) !important; }
.concept-btn-active-red { background: var(--brand-red) !important; color: #fff !important; border-color: var(--brand-red-dark) !important; }
.concept-btn-active-green { background: var(--brand-green) !important; color: #fff !important; border-color: var(--brand-green-dark) !important; }

/* TRANSITION & GLOBAL BUTTONS - Blue/Black Theme */
.btn-broadcast-red, .btn-broadcast-blue, .btn-broadcast-dark, button {
  border-radius: var(--radius-sm) !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
  transition: all 0.1s ease-out !important;
  padding: 6px 12px !important;
}

.btn-broadcast-red {
  background: var(--brand-red) !important;
  border: 1px solid var(--brand-red-dark) !important;
  color: #fff !important;
}
.btn-broadcast-red:hover { background: #f87171 !important; }
.btn-broadcast-red:active { background: var(--brand-red-dark) !important; transform: translateY(1px) !important; }

.btn-broadcast-blue {
  background: var(--brand-blue) !important;
  border: 1px solid var(--brand-blue-dark) !important;
  color: #fff !important;
}
.btn-broadcast-blue.active { background: var(--brand-blue-dark) !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important; }
.btn-broadcast-blue:hover { background: #60a5fa !important; }

.btn-broadcast-dark, .premium-add-btn {
  background: var(--bg-header) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text-secondary) !important;
}
.btn-broadcast-dark:hover, .premium-add-btn:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }

/* AUDIO MIXER */
.mixer-scene-item {
  background: var(--bg-panel) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  padding: 8px !important;
  margin-bottom: 4px !important;
}
.mixer-scene-item input[type="range"] {
  height: 4px !important;
  background: var(--bg-primary) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 2px !important;
}
.mixer-scene-item input[type="range"]::-webkit-slider-thumb {
  width: 16px !important;
  height: 24px !important;
  background: var(--text-secondary) !important;
  border: 1px solid var(--bg-primary) !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}

/* BOTTOM PANELS & TABS */
.workspace-tabs {
  background: transparent !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 0 12px !important;
}
.workspace-tab {
  padding: 8px 16px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  color: var(--text-secondary) !important;
  border-bottom: 2px solid transparent !important;
  background: transparent !important;
  border-radius: 0 !important;
  text-transform: uppercase !important;
}
.workspace-tab.active {
  color: var(--brand-blue) !important;
  border-bottom: 2px solid var(--brand-blue) !important;
}
.workspace-tab:hover:not(.active) {
  color: var(--text-primary) !important;
}

/* MONITORS */
.monitor-screen {
  border-radius: var(--radius-md) !important;
  border: 1px solid var(--bg-primary) !important;
  margin: 8px !important;
  width: calc(100% - 16px) !important;
  box-shadow: inset 0 0 40px rgba(0,0,0,0.7) !important; /* Subtle inner shadow, not excessive */
}

/* TOOLBAR */
.top-bar-container {
  height: 48px !important;
  background: var(--bg-panel) !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 0 16px !important;
}
`;

fs.writeFileSync('src/App.css', cssContent + '\n' + step14CSS);
console.log('App.css wiped and injected with True Blue-Black Concept Replica (Step 14).');
