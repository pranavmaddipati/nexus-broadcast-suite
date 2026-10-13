import type { Scene, SceneSource } from '../store/StoreTypes'
import { SourceRenderer } from './SourceRenderer'
import { TextureManager } from './TextureManager'

export class SceneRenderer {
  private static getSortedSources(scene: any) {
    if (!scene || !scene.sources) return [];
    return scene.sources.map((src: any, index: number) => ({ src, index }))
      .sort((a: any, b: any) => {
        const zA = a.src.zIndex || 0;
        const zB = b.src.zIndex || 0;
        if (zA !== zB) return zA - zB;
        return b.index - a.index; 
      })
      .map((item: any) => item.src);
  }
  private static renderStateCache: Record<string, { lastSceneId?: string, lastSources: Record<string, any>, fullRedraw: boolean }> = {}

  private static getSourceBoundingBox(src: SceneSource, canvasW: number, canvasH: number) {
    const cx = src.x + src.width/2
    const cy = src.y + src.height/2
    const rot = (src.settings?.rotation || 0) * Math.PI / 180
    const sx = Math.abs(src.settings?.scaleX ?? 1)
    const sy = Math.abs(src.settings?.scaleY ?? 1)
    const w2 = (src.width * sx) / 2
    const h2 = (src.height * sy) / 2
    const cos = Math.abs(Math.cos(rot))
    const sin = Math.abs(Math.sin(rot))
    const nw = w2 * cos + h2 * sin
    const nh = w2 * sin + h2 * cos
    const pad = 100 
    return {
      left: Math.max(0, cx - nw - pad),
      right: Math.min(canvasW, cx + nw + pad),
      top: Math.max(0, cy - nh - pad),
      bottom: Math.min(canvasH, cy + nh + pad)
    }
  }

  private static rectIntersect(r1: any, r2: any) {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)
  }

  private static unionRects(r1: any, r2: any) {
    if (!r1) return r2
    if (!r2) return r1
    return {
      left: Math.min(r1.left, r2.left),
      right: Math.max(r1.right, r2.right),
      top: Math.min(r1.top, r2.top),
      bottom: Math.max(r1.bottom, r2.bottom)
    }
  }

  public static renderScene(
    ctx: CanvasRenderingContext2D,
    scene: Scene,
    time: number,
    targetName: string,
    canvasW: number,
    canvasH: number,
    forceRedraw = false
  ) {
    if (!this.renderStateCache[targetName]) {
      this.renderStateCache[targetName] = { lastSources: {}, fullRedraw: true }
    }
    const cache = this.renderStateCache[targetName]

    if (forceRedraw || cache.lastSceneId !== scene.id) {
      cache.fullRedraw = true
      cache.lastSceneId = scene.id
      cache.lastSources = {}
    }

    const sortedSources = this.getSortedSources(scene)
    let dirtyRect: any = null
    const newSourceStates: Record<string, string> = {}

    for (let i = 0; i < (sortedSources?.length || 0); i++) {
      const src = sortedSources[i]
      if (!src.visible) continue
      
      let alwaysDirty = false
      const isVideoType = ['camera', 'media', 'video', 'display_capture', 'window_capture', 'game_capture', 'ndi', 'audio', 'browser'].includes(src.type)
      
      if (isVideoType) {
        // Only checking dirty bounds. The actual play logic is handled safely in TextureManager
        const video = TextureManager.getOrCreateVideo(src.id, src)
        if (video instanceof HTMLVideoElement && !video.paused) {
          alwaysDirty = true
        }
        if (src.type === 'browser') alwaysDirty = true
      }

      const stateHash = JSON.stringify({ x: src.x, y: src.y, w: src.width, h: src.height, op: src.opacity, s: src.settings, f: src.filters })
      newSourceStates[src.id] = stateHash

      const bb = this.getSourceBoundingBox(src, canvasW, canvasH)
      
      if (cache.lastSources[src.id] !== stateHash || alwaysDirty) {
        dirtyRect = this.unionRects(dirtyRect, bb)
      }
    }

    for (const id in cache.lastSources) {
      if (!newSourceStates[id]) {
        cache.fullRedraw = true
      }
    }

    cache.lastSources = newSourceStates

    if (cache.fullRedraw || (dirtyRect && (dirtyRect.right - dirtyRect.left) * (dirtyRect.bottom - dirtyRect.top) > canvasW * canvasH * 0.8)) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvasW, canvasH)
      for (let i = 0; i < sortedSources.length; i++) {
        SourceRenderer.renderSource(ctx, sortedSources[i], time)
      }
      cache.fullRedraw = false
      return
    }

    if (!dirtyRect) return

    ctx.save()
    ctx.beginPath()
    ctx.rect(dirtyRect.left, dirtyRect.top, dirtyRect.right - dirtyRect.left, dirtyRect.bottom - dirtyRect.top)
    ctx.clip()
    
    ctx.fillStyle = '#000000'
    ctx.fillRect(dirtyRect.left, dirtyRect.top, dirtyRect.right - dirtyRect.left, dirtyRect.bottom - dirtyRect.top)

    for (let i = 0; i < sortedSources.length; i++) {
      const src = sortedSources[i]
      if (!src.visible) continue
      const bb = this.getSourceBoundingBox(src, canvasW, canvasH)
      if (this.rectIntersect(dirtyRect, bb)) {
        SourceRenderer.renderSource(ctx, src, time)
      }
    }

    ctx.restore()
  }
}
