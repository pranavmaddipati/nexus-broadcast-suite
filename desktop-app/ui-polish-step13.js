const fs = require('fs');

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
      ctx.fillStyle = '#111'
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
            ctx.strokeStyle = '#333'
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
      style={{ width: '100%', aspectRatio: '16/9', display: 'block', borderBottom: '1px solid #111' }}
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
      className={\`vmix-card \${isLive ? 'vmix-live' : ''} \${isPreview ? 'vmix-preview' : ''}\`}
      onClick={() => selectScene(scene?.id)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* VMIX Header Bar */}
      <div className="vmix-card-header">
        <div className="vmix-card-number">{index + 1}</div>
        <div className="vmix-card-title">{scene?.name || 'Input'}</div>
        <button className="vmix-btn-settings" onClick={(e) => { e.stopPropagation(); setSettingsSceneId(scene?.id); }}>
          <Settings size={12} />
        </button>
      </div>

      {/* Main Thumbnail Area */}
      <div className="vmix-card-thumbnail">
        <MiniPreview scene={scene} />
        
        {/* VMIX Timer */}
        <div className="vmix-card-timer">{scene?.duration || '00:00:00'}</div>
        
        {/* Floating Program Badge */}
        {isLive && <div className="vmix-badge vmix-badge-live">PROGRAM</div>}
        {isPreview && !isLive && <div className="vmix-badge vmix-badge-preview">PREVIEW</div>}

        {/* Status Overlay */}
        <div className="vmix-card-status">
          {isMuted && <VolumeX size={14} color="#ef4444" />}
          {isLooping && <RefreshCw size={14} color="#3b82f6" />}
        </div>
      </div>

      {/* VMIX Control Bar - 3 Rows */}
      <div className="vmix-card-footer" onClick={e => e.stopPropagation()}>
        {/* Row 1: Quick Cut Loop */}
        <div className="vmix-footer-row">
          <button className="vmix-action-btn" onClick={() => autoTransition(scene?.id)}>QUICK</button>
          <button className="vmix-action-btn" onClick={() => takeLive(scene?.id)}>CUT</button>
          <button className={\`vmix-action-btn \${isLooping ? 'vmix-btn-active-blue' : ''}\`} onClick={handleToggleLoop}>LOOP</button>
        </div>
        
        {/* Row 2: Shortcut Row (Overlays) */}
        <div className="vmix-footer-row">
          {[1, 2, 3, 4].map(slot => (
            <button key={slot} className={\`vmix-overlay-btn \${activeOverlays[slot] === scene?.id ? 'vmix-btn-active-green' : ''}\`} onClick={() => toggleOverlay(slot, scene?.id)}>
              {slot}
            </button>
          ))}
        </div>

        {/* Row 3: AUD PVW PGM */}
        <div className="vmix-footer-row">
          <button className={\`vmix-action-btn \${isMuted ? 'vmix-btn-active-red' : ''}\`} onClick={handleToggleMute}>AUD</button>
          <button className={\`vmix-action-btn \${isPreview ? 'vmix-btn-active-green' : ''}\`} onClick={() => selectScene(scene?.id)}>PVW</button>
          <button className={\`vmix-action-btn \${isLive ? 'vmix-btn-active-red' : ''}\`} onClick={() => takeLive(scene?.id)}>PGM</button>
        </div>
      </div>
    </div>
  )
})
`;
fs.writeFileSync('src/components/VmixInputCard.tsx', vmixInputCardContent);

let cssContent = fs.readFileSync('src/App.css', 'utf8');
const step12Index = cssContent.indexOf('/* ==========================================================================');
// Wipe from the previous block onwards
if (step12Index !== -1) {
  cssContent = cssContent.substring(0, step12Index);
}

const step13CSS = `
/* ==========================================================================
   STEP 13: 1:1 VMIX / OBS BROADCAST REPLICA
   ========================================================================== */

:root {
  --v-bg-dark: #1b1b1c;
  --v-panel-bg: #2b2b2b;
  --v-header-bg: #3f3f40;
  --v-border: #454545;
  --v-border-dark: #111;
  
  --v-red: #d32f2f;
  --v-red-hover: #f44336;
  --v-green: #388e3c;
  --v-green-hover: #4caf50;
  --v-blue: #1976d2;
  --v-blue-hover: #2196f3;
  --v-text: #e0e0e0;
  --v-text-muted: #9e9e9e;
}

/* Base Flattening & Resets */
html, body, #root, .app {
  background-color: var(--v-bg-dark) !important;
  color: var(--v-text) !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

/* True Workspace Integration - No Gaps, Strict Borders */
#top-workspace, #bottom-workspace {
  background-color: var(--v-bg-dark) !important;
  gap: 2px !important;
  padding: 4px !important;
}

#top-workspace > div, #bottom-workspace > div, .monitor-container, .panel-content-area, .dock-grid-cell {
  background: var(--v-panel-bg) !important;
  border: 1px solid var(--v-border-dark) !important;
  border-radius: 2px !important;
  box-shadow: none !important;
  margin: 0 !important;
}

/* 1:1 VMIX Panel Headers */
.panel-header, .monitor-header {
  background: linear-gradient(180deg, #4d4d4d 0%, #3f3f40 100%) !important;
  border-bottom: 1px solid var(--v-border-dark) !important;
  height: 24px !important;
  padding: 0 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.text-panel-title, .panel-header > span {
  font-size: 12px !important;
  font-weight: bold !important;
  color: #fff !important;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5) !important;
  text-transform: none !important;
}

/* 1:1 VMIX INPUT CARD */
.sequence-item {
  height: auto !important;
}
.vmix-card {
  display: flex !important;
  flex-direction: column !important;
  background: #333 !important;
  border: 1px solid var(--v-border-dark) !important;
  border-radius: 3px !important;
  margin-bottom: 6px !important;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.5) !important;
  overflow: hidden !important;
}
.vmix-card.vmix-live { border: 2px solid var(--v-red) !important; }
.vmix-card.vmix-preview { border: 2px solid var(--v-green) !important; }

.vmix-card-header {
  display: flex !important;
  align-items: center !important;
  background: linear-gradient(180deg, #555 0%, #444 100%) !important;
  height: 22px !important;
  padding: 0 4px !important;
  border-bottom: 1px solid #111 !important;
}
.vmix-card-number {
  background: #222 !important;
  color: #fff !important;
  padding: 0 5px !important;
  font-size: 11px !important;
  font-weight: bold !important;
  border-radius: 2px !important;
  margin-right: 6px !important;
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.8) !important;
}
.vmix-card-title {
  flex: 1 !important;
  font-size: 12px !important;
  font-weight: bold !important;
  color: #fff !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.8) !important;
}
.vmix-btn-settings {
  background: transparent !important;
  border: none !important;
  color: #ccc !important;
  cursor: pointer !important;
}
.vmix-btn-settings:hover { color: #fff !important; }

/* Large Thumbnail */
.vmix-card-thumbnail {
  position: relative !important;
  background: #000 !important;
  width: 100% !important;
}
.vmix-card-timer {
  position: absolute !important;
  bottom: 4px !important;
  right: 4px !important;
  background: rgba(0,0,0,0.7) !important;
  color: #fff !important;
  font-family: 'Consolas', monospace !important;
  font-size: 11px !important;
  padding: 2px 4px !important;
  border-radius: 2px !important;
}
.vmix-badge {
  position: absolute !important;
  top: 4px !important;
  left: 4px !important;
  font-size: 10px !important;
  font-weight: bold !important;
  color: #fff !important;
  padding: 2px 6px !important;
  border-radius: 2px !important;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
}
.vmix-badge-live { background: var(--v-red) !important; }
.vmix-badge-preview { background: var(--v-green) !important; }

.vmix-card-status {
  position: absolute !important;
  top: 4px !important;
  right: 4px !important;
  display: flex !important;
  gap: 4px !important;
}

/* 3 Rows of Controls */
.vmix-card-footer {
  display: flex !important;
  flex-direction: column !important;
  background: #333 !important;
  padding: 4px !important;
  gap: 2px !important;
}
.vmix-footer-row {
  display: flex !important;
  gap: 2px !important;
}
.vmix-action-btn, .vmix-overlay-btn {
  flex: 1 !important;
  background: linear-gradient(180deg, #666 0%, #444 100%) !important;
  border: 1px solid #111 !important;
  border-top: 1px solid #777 !important;
  color: #fff !important;
  font-size: 10px !important;
  font-weight: bold !important;
  padding: 3px 0 !important;
  border-radius: 2px !important;
  cursor: pointer !important;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.8) !important;
}
.vmix-action-btn:active, .vmix-overlay-btn:active {
  background: #333 !important;
  border-top: 1px solid #111 !important;
}
.vmix-btn-active-blue { background: linear-gradient(180deg, var(--v-blue-hover) 0%, var(--v-blue) 100%) !important; border-top: 1px solid #64b5f6 !important; }
.vmix-btn-active-red { background: linear-gradient(180deg, var(--v-red-hover) 0%, var(--v-red) 100%) !important; border-top: 1px solid #ef5350 !important; }
.vmix-btn-active-green { background: linear-gradient(180deg, var(--v-green-hover) 0%, var(--v-green) 100%) !important; border-top: 1px solid #81c784 !important; }

/* 1:1 TRANSITION PANEL */
.btn-broadcast-red {
  background: linear-gradient(180deg, var(--v-red-hover) 0%, var(--v-red) 100%) !important;
  border: 1px solid #111 !important;
  border-top: 1px solid #ef5350 !important;
  border-radius: 3px !important;
  color: #fff !important;
  font-weight: bold !important;
  font-size: 14px !important;
  padding: 8px !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}
.btn-broadcast-red:active { background: var(--v-red) !important; border-top: 1px solid #111 !important; box-shadow: none !important; }

.btn-broadcast-blue {
  background: linear-gradient(180deg, var(--v-blue-hover) 0%, var(--v-blue) 100%) !important;
  border: 1px solid #111 !important;
  border-top: 1px solid #64b5f6 !important;
  border-radius: 3px !important;
  color: #fff !important;
  font-weight: bold !important;
  padding: 6px !important;
}
.btn-broadcast-blue.active { background: var(--v-blue) !important; border-top: 1px solid #111 !important; }

.btn-broadcast-dark {
  background: linear-gradient(180deg, #555 0%, #333 100%) !important;
  border: 1px solid #111 !important;
  border-top: 1px solid #777 !important;
  border-radius: 3px !important;
  color: #fff !important;
  font-weight: bold !important;
  padding: 4px !important;
}
.btn-broadcast-dark:active { background: #333 !important; border-top: 1px solid #111 !important; }

/* MONITORS */
.monitor-screen {
  border-radius: 2px !important;
  border: 1px solid #111 !important;
  margin: 4px !important;
  width: calc(100% - 8px) !important;
  box-shadow: 1px 1px 5px rgba(0,0,0,0.8) !important; /* Authentic monitor frame shadow */
}

/* BOTTOM PANELS & TABS */
.workspace-tabs {
  background: #3f3f40 !important;
  border-bottom: 1px solid #111 !important;
  padding: 4px 4px 0 4px !important;
}
.workspace-tab {
  background: #333 !important;
  border: 1px solid #111 !important;
  border-bottom: none !important;
  border-radius: 4px 4px 0 0 !important;
  padding: 6px 16px !important;
  color: #bbb !important;
  font-size: 12px !important;
  font-weight: bold !important;
  margin-right: 2px !important;
}
.workspace-tab.active {
  background: var(--v-panel-bg) !important;
  color: #fff !important;
  padding-bottom: 7px !important;
  margin-bottom: -1px !important;
}

/* AUDIO MIXER */
.mixer-scene-item {
  background: #333 !important;
  border: 1px solid #111 !important;
  border-radius: 3px !important;
  padding: 6px !important;
}
.mixer-scene-item input[type="range"] {
  height: 4px !important;
  background: #000 !important;
  border: 1px solid #555 !important;
}
.mixer-scene-item input[type="range"]::-webkit-slider-thumb {
  width: 24px !important;
  height: 12px !important;
  background: linear-gradient(180deg, #999 0%, #666 100%) !important;
  border: 1px solid #111 !important;
  border-radius: 2px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.8) !important;
}

/* TOOLBAR */
.top-bar-container {
  height: 40px !important;
  background: linear-gradient(180deg, #4d4d4d 0%, #3f3f40 100%) !important;
  border-bottom: 1px solid #111 !important;
}
`;

fs.writeFileSync('src/App.css', cssContent + '\n' + step13CSS);
console.log('App.css wiped and injected with 1:1 Concept Replica (Step 13).');
