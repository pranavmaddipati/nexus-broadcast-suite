const fs = require('fs');

const vmixCardPath = 'src/components/VmixInputCard.tsx';
const newVmixCard = `import React, { useEffect, useRef } from 'react'
import { Settings } from 'lucide-react'
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
      ctx.fillStyle = '#020408'
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
      className={\`premium-asset-row \${isLive ? 'asset-row-live' : ''} \${isPreview ? 'asset-row-preview' : ''}\`}
      onClick={() => selectScene(scene?.id)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="asset-number-badge">{index + 1}</div>
      
      {/* 40% Thumbnail Column */}
      <div className="asset-thumbnail-col">
        <MiniPreview scene={scene} />
      </div>

      {/* 60% Control Column */}
      <div className="asset-control-col" onClick={e => e.stopPropagation()}>
        
        {/* Header: Title + Timer + Badge */}
        <div className="asset-col-header">
          <div className="asset-title-truncate">{scene?.name || 'Scene'}</div>
          {isLive && <div className="asset-tiny-badge badge-live">PROGRAM</div>}
          {isPreview && !isLive && <div className="asset-tiny-badge badge-preview">PREVIEW</div>}
          <div className="asset-timer">{scene?.duration || '00:00:00'}</div>
          <button className="asset-gear-btn" onClick={() => setSettingsSceneId(scene?.id)}>
            <Settings size={10} />
          </button>
        </div>

        {/* 3 Rows of Controls */}
        <div className="asset-controls-stack">
          {/* Row 1 */}
          <div className="asset-micro-row">
            <button className="asset-micro-chip" onClick={() => autoTransition(scene?.id)}>QUICK</button>
            <button className="asset-micro-chip" onClick={() => takeLive(scene?.id)}>CUT</button>
            <button className={\`asset-micro-chip \${isLooping ? 'chip-active-blue' : ''}\`} onClick={handleToggleLoop}>LOOP</button>
          </div>
          
          {/* Row 2: Overlays */}
          <div className="asset-micro-row">
            {[1, 2, 3, 4].map(slot => (
              <button key={slot} className={\`asset-micro-chip \${activeOverlays[slot] === scene?.id ? 'chip-active-green' : ''}\`} onClick={() => toggleOverlay(slot, scene?.id)}>
                {slot}
              </button>
            ))}
          </div>

          {/* Row 3: Audio/Routing */}
          <div className="asset-micro-row">
            <button className={\`asset-micro-chip \${isMuted ? 'chip-active-red' : ''}\`} onClick={handleToggleMute}>AUD</button>
            <button className={\`asset-micro-chip \${isPreview ? 'chip-active-green' : ''}\`} onClick={() => selectScene(scene?.id)}>PVW</button>
            <button className={\`asset-micro-chip \${isLive ? 'chip-active-red' : ''}\`} onClick={() => takeLive(scene?.id)}>PGM</button>
          </div>
        </div>

      </div>
    </div>
  )
})
`;
fs.writeFileSync(vmixCardPath, newVmixCard);
console.log('VmixInputCard completely rewritten.');

let cssContent = fs.readFileSync('src/App.css', 'utf8');
const step18CSS = `
/* ==========================================================================
   STEP 18: PINNED SCENES & COMPONENT PARITY (CONCEPT MATCH)
   ========================================================================== */

/* 1. PINNED SCENES (Horizontal Density) */
.premium-asset-row {
  display: flex !important;
  flex-direction: row !important;
  background: #0f131f !important;
  border: 1px solid #1e293b !important;
  border-top: 1px solid rgba(255,255,255,0.05) !important;
  border-radius: 4px !important;
  margin-bottom: 0 !important;
  overflow: hidden !important;
  cursor: pointer !important;
  height: 80px !important; /* Fixed compact height */
}
.asset-row-preview {
  border: 1px solid #10b981 !important;
  background: rgba(16, 185, 129, 0.05) !important;
}
.asset-row-live {
  border: 1px solid #ef4444 !important;
  background: rgba(239, 68, 68, 0.05) !important;
}
.asset-number-badge {
  width: 16px !important;
  background: #020408 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 10px !important;
  font-weight: 900 !important;
  color: #94a3b8 !important;
  border-right: 1px solid #1e293b !important;
}
.asset-thumbnail-col {
  width: 100px !important;
  min-width: 100px !important;
  height: 100% !important;
  background: #000 !important;
  border-right: 1px solid #1e293b !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.asset-control-col {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 4px !important;
  min-width: 0 !important;
}
.asset-col-header {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  margin-bottom: 4px !important;
}
.asset-title-truncate {
  font-size: 11px !important;
  font-weight: 800 !important;
  color: #fff !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  flex: 1 !important;
}
.asset-tiny-badge {
  font-size: 8px !important;
  font-weight: 900 !important;
  padding: 1px 4px !important;
  border-radius: 2px !important;
  color: #fff !important;
}
.asset-timer {
  font-family: 'Consolas', monospace !important;
  font-size: 9px !important;
  color: #94a3b8 !important;
  background: #020408 !important;
  padding: 1px 3px !important;
  border-radius: 2px !important;
}
.asset-gear-btn {
  background: transparent !important;
  border: none !important;
  color: #64748b !important;
  padding: 0 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
}
.asset-controls-stack {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  margin-top: auto !important;
}
.asset-micro-row {
  display: flex !important;
  gap: 2px !important;
}
.asset-micro-chip {
  flex: 1 !important;
  background: #1e293b !important;
  border: 1px solid #0f172a !important;
  color: #94a3b8 !important;
  font-size: 8px !important;
  font-weight: 800 !important;
  padding: 2px 0 !important;
  border-radius: 2px !important;
  cursor: pointer !important;
}
.asset-micro-chip:hover {
  background: #334155 !important;
  color: #fff !important;
}
.chip-active-blue { background: #3b82f6 !important; color: #fff !important; }
.chip-active-green { background: #10b981 !important; color: #fff !important; }
.chip-active-red { background: #ef4444 !important; color: #fff !important; }

/* 2. TRANSITION PANEL (Compact buttons) */
.transition-controls-panel {
  padding: 8px !important;
}
.transition-controls-panel .nexus-btn {
  padding: 6px !important;
  font-size: 10px !important;
}

/* 3. BOTTOM WORKSPACE TABS */
.workspace-tabs .workspace-tab {
  background: transparent !important;
  border: none !important;
  color: #64748b !important;
  padding: 8px 12px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
}
.workspace-tabs .workspace-tab.active {
  color: #fff !important;
  border-bottom: 2px solid #3b82f6 !important;
  background: rgba(255,255,255,0.05) !important;
}
`;
fs.writeFileSync('src/App.css', cssContent + '\n' + step18CSS);
console.log('App.css appended with Step 18');
