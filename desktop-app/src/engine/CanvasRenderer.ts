import type { Scene, SourceFilter as Filter } from '../store/StoreTypes'
import { SceneRenderer } from './SceneRenderer'

export interface CanvasRenderOptions {
  time: number
  canvasW: number
  canvasH: number
  activeScene?: Scene
  liveScene?: Scene
  transitionFromScene?: Scene
  isTransitioning: boolean
  transitionProgress: number
  transitionType: string
  programFilters: Filter[]
}

export class CanvasRenderer {
  private static transitionCanvas: HTMLCanvasElement | null = null
  private static incomingCanvas: HTMLCanvasElement | null = null

  public static render(
    prCtx: CanvasRenderingContext2D | null | undefined, 
    pCtx: CanvasRenderingContext2D | null | undefined, 
    vCtx: CanvasRenderingContext2D | null | undefined,
    opts: CanvasRenderOptions,
    scenes: Scene[],
    virtualCameraSettings: any,
    activeOverlays: Record<number, string>
  ) {
    const { 
      time, 
      canvasW, 
      canvasH, 
      activeScene, 
      liveScene, 
      transitionFromScene, 
      isTransitioning, 
      transitionProgress, 
      transitionType,
      programFilters
    } = opts

    // 1. Draw active scene to Preview monitor
    if (prCtx && activeScene) {
      SceneRenderer.renderScene(prCtx, activeScene, time, 'preview', canvasW, canvasH)
    } else if (prCtx) {
      prCtx.clearRect(0, 0, canvasW, canvasH)
    }

    // 2. Draw live scene to Program monitor
    if (pCtx && liveScene) {
      pCtx.save()

      let pgmFilterStr = ''
      programFilters.forEach(f => {
        if (f.enabled) {
          if (f.type === 'color_correction') {
            const s = f.settings || {}
            pgmFilterStr += `brightness(${s.brightness ?? 1.0}) contrast(${s.contrast ?? 1.0}) saturate(${s.saturation ?? 1.0}) hue-rotate(${s.hueRotate ?? 0}deg) `
          } else if (f.type === 'blur') {
            pgmFilterStr += `blur(${f.settings?.blur ?? 0}px) `
          }
        }
      })
      if (pgmFilterStr.trim()) {
        pCtx.filter = pgmFilterStr.trim()
      }

      if (isTransitioning && transitionFromScene) {
        if (!this.transitionCanvas) {
          this.transitionCanvas = document.createElement('canvas')
        }
        const bufferCanvas = this.transitionCanvas
        if (bufferCanvas.width !== canvasW) bufferCanvas.width = canvasW
        if (bufferCanvas.height !== canvasH) bufferCanvas.height = canvasH
        const bCtx = bufferCanvas.getContext('2d')!
        if (!this.incomingCanvas) this.incomingCanvas = document.createElement('canvas')
        const incomingCanvas = this.incomingCanvas
        if (incomingCanvas.width !== canvasW) incomingCanvas.width = canvasW
        if (incomingCanvas.height !== canvasH) incomingCanvas.height = canvasH
        SceneRenderer.renderScene(incomingCanvas.getContext('2d')!, liveScene, time, 'incomingBuffer', canvasW, canvasH, true)
        
        SceneRenderer.renderScene(bCtx, transitionFromScene, time, 'transitionBuffer', canvasW, canvasH, true)

        pCtx.clearRect(0, 0, canvasW, canvasH)

        if (transitionType === 'fade' || transitionType === 'mix') {
          pCtx.save()
          pCtx.globalAlpha = 1.0
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.restore()

          pCtx.save()
          pCtx.globalAlpha = transitionProgress
          pCtx.drawImage(incomingCanvas, 0, 0)
          pCtx.restore()
        } else if (transitionType === 'dip') {
          pCtx.fillStyle = '#000000'
          pCtx.fillRect(0, 0, canvasW, canvasH)
          pCtx.save()
          pCtx.globalAlpha = Math.abs(2 * transitionProgress - 1)
          pCtx.drawImage(transitionProgress < 0.5 ? bufferCanvas : incomingCanvas, 0, 0)
          pCtx.restore()
        } else if (transitionType === 'zoom') {
          pCtx.save()
          pCtx.globalAlpha = 1.0 - transitionProgress
          pCtx.translate(canvasW / 2, canvasH / 2)
          pCtx.scale(1.0 + transitionProgress * 0.5, 1.0 + transitionProgress * 0.5)
          pCtx.translate(-canvasW / 2, -canvasH / 2)
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.restore()

          pCtx.save()
          pCtx.globalAlpha = transitionProgress
          pCtx.translate(canvasW / 2, canvasH / 2)
          pCtx.scale(0.5 + transitionProgress * 0.5, 0.5 + transitionProgress * 0.5)
          pCtx.translate(-canvasW / 2, -canvasH / 2)
          pCtx.drawImage(incomingCanvas, 0, 0)
          pCtx.restore()
        } else if (transitionType === 'merge') {
          pCtx.save()
          pCtx.globalAlpha = 1.0 - transitionProgress
          pCtx.translate(0, -canvasH * 0.1 * transitionProgress)
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.restore()

          pCtx.save()
          pCtx.globalAlpha = transitionProgress
          pCtx.translate(0, canvasH * 0.1 * (1.0 - transitionProgress))
          pCtx.drawImage(incomingCanvas, 0, 0)
          pCtx.restore()
        } else if (transitionType === 'slide') {
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.save()
          pCtx.translate(canvasW * (1.0 - transitionProgress), 0)
          pCtx.drawImage(incomingCanvas, 0, 0)
          pCtx.restore()
        } else if (transitionType === 'push') {
          pCtx.save()
          pCtx.translate(-canvasW * transitionProgress, 0)
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.restore()

          pCtx.save()
          pCtx.translate(canvasW * (1.0 - transitionProgress), 0)
          pCtx.drawImage(incomingCanvas, 0, 0)
          pCtx.restore()
        } else if (transitionType === 'cube') {
          const offset = canvasW * transitionProgress;
          pCtx.save();
          pCtx.globalAlpha = Math.min(1.0, (1.0 - transitionProgress) * 1.5);
          pCtx.translate(-offset, 0);
          pCtx.scale(1.0 - transitionProgress * 0.2, 1.0 - transitionProgress * 0.2);
          pCtx.drawImage(bufferCanvas, 0, 0);
          pCtx.restore();

          pCtx.save();
          pCtx.globalAlpha = Math.min(1.0, transitionProgress * 1.5);
          pCtx.translate(canvasW - offset, 0);
          pCtx.scale(0.8 + transitionProgress * 0.2, 0.8 + transitionProgress * 0.2);
          pCtx.drawImage(incomingCanvas, 0, 0);
          pCtx.restore();
        } else if (transitionType === 'stinger') {
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.drawImage(incomingCanvas, 0, 0)
          
          pCtx.save()
          pCtx.fillStyle = '#000000'
          const wipeW = canvasW * 1.2
          const wipeX = (canvasW + wipeW) * transitionProgress - wipeW
          pCtx.translate(wipeX, 0)
          pCtx.transform(1, 0, -0.3, 1, 0, 0)
          pCtx.fillRect(0, -100, wipeW, canvasH + 200)
          pCtx.restore()
        } else if (transitionType === 'wipe') {
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.save()
          pCtx.beginPath()
          pCtx.rect(0, 0, canvasW * transitionProgress, canvasH)
          pCtx.clip()
          pCtx.drawImage(incomingCanvas, 0, 0)
          pCtx.restore()
        } else if (transitionType === 'luma') {
          pCtx.drawImage(bufferCanvas, 0, 0)
          pCtx.save()
          pCtx.globalCompositeOperation = 'source-over'
          pCtx.globalAlpha = transitionProgress
          pCtx.drawImage(incomingCanvas, 0, 0)
          pCtx.restore()
        } else {
          pCtx.drawImage(incomingCanvas, 0, 0)
        }
      } else {
        SceneRenderer.renderScene(pCtx, liveScene, time, 'program', canvasW, canvasH, true)
      }

      pCtx.restore()

      // Render active overlays (1 to 4) on top of PGM output
      const overlaySlots = [1, 2, 3, 4]
      overlaySlots.forEach(slot => {
        const overlaySceneId = activeOverlays[slot]
        if (overlaySceneId) {
          const overlaySc = scenes.find(s => s.id === overlaySceneId)
          if (overlaySc) {
            pCtx.save()
            
            if (slot === 1) {
              // Fullscreen overlay
            } else if (slot === 2) {
              // Bottom-right PiP (1/4 size)
              pCtx.translate(canvasW * 0.729, canvasH * 0.712)
              pCtx.scale(0.25, 0.25)
            } else if (slot === 3) {
              // Lower-third overlay
              pCtx.translate(0, canvasH * 0.666)
              pCtx.scale(1.0, 0.333)
            } else if (slot === 4) {
              // Top-left PiP (1/4 size)
              pCtx.translate(40, 40)
              pCtx.scale(0.25, 0.25)
            }

            SceneRenderer.renderScene(pCtx, overlaySc, time, `overlay-${slot}`, canvasW, canvasH, true)
            pCtx.restore()
          }
        }
      })
    } else if (pCtx) {
      pCtx.clearRect(0, 0, canvasW, canvasH)
    }

    // 3. Draw custom scene to dedicated vcam canvas if virtual camera is routing custom scene
    if (vCtx && virtualCameraSettings.source === 'custom' && virtualCameraSettings.customSceneId) {
      const customSc = scenes.find(s => s.id === virtualCameraSettings.customSceneId)
      if (customSc) {
        SceneRenderer.renderScene(vCtx, customSc, time, 'custom_vcam', canvasW, canvasH)
      }
    }
  }
}
