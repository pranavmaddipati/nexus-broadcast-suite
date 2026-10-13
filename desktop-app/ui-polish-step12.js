const fs = require('fs');

// 1. Rewrite VmixInputCard to match exact vMix/OBS dense industrial look
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
      style={{ width: '100%', aspectRatio: '16/9', display: 'block' }}
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
      {/* Header Bar */}
      <div className="vmix-card-header">
        <span className="vmix-card-number">{index + 1}</span>
        <span className="vmix-card-title" title={scene?.name}>{scene?.name || 'Input'}</span>
        <span className="vmix-card-timer">{scene?.duration || '00:00'}</span>
        <button className="vmix-btn-icon" onClick={(e) => { e.stopPropagation(); setSettingsSceneId(scene?.id); }}>
          <Settings size={10} />
        </button>
      </div>

      {/* Main Thumbnail Area (Dominate) */}
      <div className="vmix-card-thumbnail">
        <MiniPreview scene={scene} />
        
        {/* Status Overlay */}
        <div className="vmix-card-status">
          {isMuted && <VolumeX size={12} color="#ef4444" />}
          {isLooping && <RefreshCw size={12} color="#3b82f6" />}
        </div>
      </div>

      {/* Dense Control Bar */}
      <div className="vmix-card-footer" onClick={e => e.stopPropagation()}>
        <div className="vmix-btn-group">
          <button className="vmix-btn" onClick={() => autoTransition(scene?.id)}>QUICK</button>
          <button className="vmix-btn" onClick={() => takeLive(scene?.id)}>CUT</button>
          <button className={\`vmix-btn \${isLooping ? 'vmix-active-blue' : ''}\`} onClick={handleToggleLoop}>LOOP</button>
        </div>
        
        <div className="vmix-btn-group">
          {[1, 2, 3, 4].map(slot => (
            <button key={slot} className={\`vmix-btn vmix-btn-overlay \${activeOverlays[slot] === scene?.id ? 'vmix-active-green' : ''}\`} onClick={() => toggleOverlay(slot, scene?.id)}>
              {slot}
            </button>
          ))}
        </div>

        <div className="vmix-btn-group">
          <button className={\`vmix-btn \${isMuted ? 'vmix-active-red' : ''}\`} onClick={handleToggleMute}>AUD</button>
        </div>
      </div>
    </div>
  )
})
`;
fs.writeFileSync('src/components/VmixInputCard.tsx', vmixInputCardContent);

// 2. Remove floating cards and bad shadows from components
function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
}
replaceInFile('src/components/ProgramMonitor.tsx', /padding: '4px 12px'/g, "padding: '2px 6px'");
replaceInFile('src/components/ProgramMonitor.tsx', /boxShadow: 'var\(--shadow-raised\)'/g, "boxShadow: 'none'");
replaceInFile('src/components/ProgramMonitor.tsx', /bottom: '12px'/g, "bottom: '4px'");
replaceInFile('src/components/ProgramMonitor.tsx', /boxShadow: 'inset 0 0 40px rgba\(0,0,0,0\.9\), 0 0 20px rgba\(0,0,0,0\.5\)'/g, "boxShadow: 'none'");
replaceInFile('src/components/PreviewMonitor.tsx', /boxShadow: 'inset 0 0 40px rgba\(0,0,0,0\.9\), 0 0 20px rgba\(0,0,0,0\.5\)'/g, "boxShadow: 'none'");
replaceInFile('src/components/PinnedScenes.tsx', /gap: '24px'/g, "gap: '2px'"); // Tight spacing

// 3. Clean App.css from previous steps
let cssContent = fs.readFileSync('src/App.css', 'utf8');
const step9Index = cssContent.indexOf('/* ==========================================================================');
// We want to slice off from FINAL PREMIUM BROADCAST POLISH (STEP 9) onwards if it exists
if (step9Index !== -1 && cssContent.includes('FINAL PREMIUM BROADCAST POLISH')) {
  cssContent = cssContent.substring(0, step9Index);
}

// 4. Inject Step 12: True Industrial Broadcast CSS
const step12CSS = `
/* ==========================================================================
   STEP 12: INDUSTRIAL BROADCAST CONSOLE (vMix/OBS Style)
   ========================================================================== */

:root {
  --app-bg: #1e1e1e;
  --panel-bg: #252526;
  --header-bg: #333333;
  --border-color: #3e3e42;
  
  --brand-red: #cc292b;
  --brand-green: #22944b;
  --brand-blue: #007acc;
  --brand-dark: #3a3a3a;
  --brand-hover: #4d4d4d;
  
  --radius-sm: 2px;
  --radius-md: 4px;
}

/* Base Flattening */
html, body, #root, .app {
  background-color: var(--app-bg) !important;
  color: #cccccc !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; /* Standard desktop system font */
}

/* Remove gaps, floating spaces, rounded corners */
#top-workspace, #bottom-workspace {
  background-color: var(--app-bg) !important;
  gap: 1px !important; /* Hairline separator */
  padding: 1px !important;
}

#top-workspace > div, #bottom-workspace > div, .monitor-container, .panel-content-area, .dock-grid-cell {
  background: var(--panel-bg) !important;
  border: none !important;
  border-right: 1px solid var(--border-color) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
}
#top-workspace > div:last-child {
  border-right: none !important;
}

/* Flat Headers */
.panel-header, .monitor-header {
  background: var(--header-bg) !important;
  border-bottom: 1px solid var(--border-color) !important;
  height: 22px !important;
  padding: 0 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.text-panel-title, .panel-header > span {
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #eeeeee !important;
  letter-spacing: 0 !important;
  text-transform: uppercase !important;
  text-shadow: none !important;
}

/* VMIX/OBS STYLE PINNED SCENES */
.sequence-item {
  height: auto !important;
}
.vmix-card {
  display: flex !important;
  flex-direction: column !important;
  background: #111 !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-sm) !important;
  margin-bottom: 2px !important;
  box-sizing: border-box !important;
  box-shadow: none !important;
}
.vmix-card.vmix-live { border: 2px solid var(--brand-red) !important; }
.vmix-card.vmix-preview { border: 2px solid var(--brand-green) !important; }

.vmix-card-header {
  display: flex !important;
  align-items: center !important;
  background: var(--header-bg) !important;
  padding: 2px 4px !important;
  height: 18px !important;
  border-bottom: 1px solid #000 !important;
}
.vmix-card-number {
  background: #000 !important;
  color: #ccc !important;
  padding: 0 4px !important;
  font-size: 10px !important;
  margin-right: 4px !important;
  border-radius: 2px !important;
}
.vmix-card-title {
  flex: 1 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #fff !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.vmix-card-timer {
  font-size: 10px !important;
  color: #aaa !important;
  font-family: monospace !important;
  margin-right: 4px !important;
}

.vmix-card-thumbnail {
  position: relative !important;
  background: #000 !important;
  width: 100% !important;
}

.vmix-card-status {
  position: absolute !important;
  top: 4px !important;
  right: 4px !important;
  display: flex !important;
  gap: 2px !important;
}

.vmix-card-footer {
  display: flex !important;
  background: #2d2d2d !important;
  padding: 2px !important;
  justify-content: space-between !important;
  border-top: 1px solid #111 !important;
}

.vmix-btn-group {
  display: flex !important;
  gap: 1px !important;
}

.vmix-btn {
  background: #444 !important;
  border: 1px solid #222 !important;
  color: #ccc !important;
  font-size: 9px !important;
  font-weight: bold !important;
  padding: 2px 4px !important;
  border-radius: 2px !important;
  cursor: pointer !important;
  box-shadow: none !important;
}
.vmix-btn:hover { background: #555 !important; color: #fff !important; }
.vmix-active-blue { background: var(--brand-blue) !important; color: #fff !important; border-color: #000 !important; }
.vmix-active-red { background: var(--brand-red) !important; color: #fff !important; border-color: #000 !important; }
.vmix-active-green { background: var(--brand-green) !important; color: #fff !important; border-color: #000 !important; }

.vmix-btn-icon {
  background: transparent !important;
  border: none !important;
  color: #aaa !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 2px !important;
}
.vmix-btn-icon:hover { color: #fff !important; }

/* INDUSTRIAL BUTTONS (Transition / Global) */
.btn-broadcast-red, .btn-broadcast-blue, .btn-broadcast-dark, button, .premium-add-btn {
  border-radius: var(--radius-sm) !important;
  font-family: 'Segoe UI', sans-serif !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  box-shadow: none !important;
  transition: none !important; /* Hardware buttons don't animate softly */
  padding: 4px !important;
}

.btn-broadcast-red {
  background: var(--brand-red) !important;
  border: 1px solid #7a181a !important;
  color: #fff !important;
  padding: 6px !important;
}
.btn-broadcast-red:hover { background: #e03134 !important; }
.btn-broadcast-red:active { background: #a82224 !important; border-top: 2px solid #5a1213 !important; }

.btn-broadcast-blue {
  background: var(--brand-blue) !important;
  border: 1px solid #005a9e !important;
  color: #fff !important;
  padding: 6px !important;
}
.btn-broadcast-blue.active { background: var(--brand-blue) !important; border: 2px inset #000 !important; }
.btn-broadcast-blue:hover { background: #008be6 !important; }

.btn-broadcast-dark, .premium-add-btn {
  background: var(--brand-dark) !important;
  border: 1px solid #222 !important;
  color: #ccc !important;
  padding: 4px !important;
}
.btn-broadcast-dark:hover, .premium-add-btn:hover { background: var(--brand-hover) !important; color: #fff !important; }

/* HARDWARE AUDIO MIXER */
.mixer-scene-item {
  background: #1e1e1e !important;
  border: 1px solid #333 !important;
  border-radius: 0 !important;
  padding: 4px !important;
  box-shadow: none !important;
  display: flex !important;
  flex-direction: column !important;
}
.mixer-scene-item input[type="range"] {
  height: 4px !important;
  background: #111 !important;
  border: 1px solid #444 !important;
  border-radius: 0 !important;
}
.mixer-scene-item input[type="range"]::-webkit-slider-thumb {
  width: 20px !important;
  height: 10px !important;
  background: #777 !important;
  border: 1px solid #222 !important;
  border-radius: 2px !important;
  box-shadow: none !important;
}

/* TOOLBAR & BOTTOM TABS */
.top-bar-container {
  height: 36px !important;
  background: var(--header-bg) !important;
  border-bottom: 1px solid var(--border-color) !important;
  box-shadow: none !important;
  padding: 0 12px !important;
}
.workspace-tabs {
  background: var(--header-bg) !important;
  border-bottom: 1px solid var(--border-color) !important;
  padding: 0 !important;
}
.workspace-tab {
  padding: 6px 12px !important;
  font-size: 12px !important;
  font-weight: normal !important;
  color: #aaa !important;
  border: 1px solid transparent !important;
  border-radius: 2px 2px 0 0 !important;
}
.workspace-tab.active {
  background: var(--panel-bg) !important;
  color: #fff !important;
  border: 1px solid var(--border-color) !important;
  border-bottom: 1px solid var(--panel-bg) !important;
  margin-bottom: -1px !important;
}
.workspace-tab:hover:not(.active) {
  background: #3a3a3a !important;
  color: #ddd !important;
}

/* MONITORS */
.monitor-screen {
  border-radius: 0 !important;
  border: 1px solid #111 !important;
  margin: 4px !important;
  width: calc(100% - 8px) !important;
}
`;

fs.writeFileSync('src/App.css', cssContent + '\n' + step12CSS);
console.log('App.css wiped of previous premium styles and injected with Step 12 Industrial styles.');
