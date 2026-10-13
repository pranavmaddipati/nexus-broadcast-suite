import type { SceneSource } from '../../store/StoreTypes'
import { MediaEngine } from './MediaEngine'

export class MediaRenderer {
  public static renderSource(ctx: CanvasRenderingContext2D, src: SceneSource, time: number) {
    if (!src.visible) return

    const sync = MediaEngine.getOrCreateSynchronizer(src.id, src)
    if (!sync) return

    const texture = sync.getCurrentTexture()
    if (!texture || !texture.drawable) return

    console.log(`[MediaPipeline] 6. Renderer draws texture inside Preview & 7. Program receives texture: src ${src.id} at time ${time}`);

    ctx.save()
    ctx.globalAlpha = src.opacity
    
    if (src.settings?.blendMode) {
      ctx.globalCompositeOperation = src.settings.blendMode as any
    }

    const cx = src.x + src.width / 2
    const cy = src.y + src.height / 2
    const rot = src.settings?.rotation || 0
    const scaleX = (src.settings?.scaleX ?? 1) * (src.settings?.flipHorizontal ? -1 : 1)
    const scaleY = (src.settings?.scaleY ?? 1) * (src.settings?.flipVertical ? -1 : 1)

    if (rot !== 0 || scaleX !== 1 || scaleY !== 1) {
      ctx.translate(cx, cy)
      ctx.rotate(rot * Math.PI / 180)
      ctx.scale(scaleX, scaleY)
      ctx.translate(-cx, -cy)
    }

    // Basic filters for media
    let filterStr = ''
    src.filters?.filter(f => f.enabled).forEach(f => {
      if (f.type === 'color_correction') {
        const s = f.settings || {}
        filterStr += `brightness(${s.brightness ?? 1.0}) contrast(${s.contrast ?? 1.0}) saturate(${s.saturation ?? 1.0}) hue-rotate(${s.hueRotate ?? 0}deg) `
      } else if (f.type === 'blur') {
        filterStr += `blur(${f.settings?.blurAmount ?? f.settings?.blur ?? 0}px) `
      } else if (f.type === 'opacity') {
        filterStr += `opacity(${f.settings?.opacity ?? 1.0}) `
      }
    })

    if (filterStr.trim()) {
      ctx.filter = filterStr.trim()
    }

    const cropFilter = (src.filters || []).find(f => f.type === 'crop' && f.enabled)
    if (cropFilter) {
      const s = cropFilter.settings
      const left = s.cropLeft || 0
      const right = s.cropRight || 0
      const top = s.cropTop || 0
      const bottom = s.cropBottom || 0

      const sw = texture.width - left - right
      const sh = texture.height - top - bottom

      ctx.drawImage(texture.drawable, left, top, sw > 0 ? sw : 1, sh > 0 ? sh : 1, src.x, src.y, src.width, src.height)
    } else {
      ctx.drawImage(texture.drawable, src.x, src.y, src.width, src.height)
    }

    ctx.restore()
  }
}
