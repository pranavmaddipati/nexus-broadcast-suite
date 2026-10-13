import type { SceneSource } from '../store/StoreTypes'
import { TextureManager } from './TextureManager'
import { MediaRenderer } from './media/MediaRenderer'

export class SourceRenderer {
  public static drawPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, time: number, label: string) {
    ctx.fillStyle = '#0b0f19'
    ctx.fillRect(x, y, w, h)

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, Math.max(0.1, w * 0.1 + Math.sin(time / 300) * 15), 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y + h / 2)
    ctx.lineTo(x + w, y + h / 2)
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x + w / 2, y + h)
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.font = 'bold 36px "Outfit", sans-serif'
    ctx.fillText(label.toUpperCase(), x + w / 2, y + h / 2)
  }

  public static renderSource(ctx: CanvasRenderingContext2D, src: SceneSource, time: number) {
    
      
      if (!src.visible) return

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

    let filterStr = ''
    src.filters?.filter(f => f.enabled).forEach(f => {
      if (f.type === 'color_correction') {
        const s = f.settings || {}
        filterStr += `brightness(${s.brightness ?? 1.0}) contrast(${s.contrast ?? 1.0}) saturate(${s.saturation ?? 1.0}) hue-rotate(${s.hueRotate ?? 0}deg) `
      } else if (f.type === 'blur') {
        filterStr += `blur(${f.settings?.blurAmount ?? f.settings?.blur ?? 0}px) `
      } else if (f.type === 'opacity') {
        filterStr += `opacity(${f.settings?.opacity ?? 1.0}) `
      } else if (f.type === 'shadow') {
        const dist = f.settings?.shadowDistance ?? 5
        filterStr += `drop-shadow(${dist}px ${dist}px ${dist}px ${f.settings?.shadowColor ?? 'var(--bg-main)'}) `
      } else if (f.type === 'glow') {
        filterStr += `drop-shadow(0px 0px ${f.settings?.glowIntensity ?? 10}px ${f.settings?.glowColor ?? '#ffffff'}) `
      } else if (f.type === 'lut' && f.settings?.lutId) {
        filterStr += `url(#lut-${f.settings.lutId}) `
      }
    })

    const appSettings = src.settings || {}
    if (appSettings.brightness !== undefined || appSettings.contrast !== undefined || appSettings.saturation !== undefined || appSettings.hue !== undefined) {
      filterStr += `brightness(${appSettings.brightness ?? 1.0}) contrast(${appSettings.contrast ?? 1.0}) saturate(${appSettings.saturation ?? 1.0}) hue-rotate(${appSettings.hue ?? 0}deg) `
    }

    if (filterStr.trim()) {
      ctx.filter = filterStr.trim()
    }

    const chromaFilter = (src.filters || []).find(f => f.type === 'chroma_key' && f.enabled)
    const lumaFilter = (src.filters || []).find(f => f.type === 'luma_key' && f.enabled)

    const isVideoSource = ['media', 'video', 'camera', 'display_capture', 'window_capture', 'game_capture', 'ndi'].includes(src.type)

    if (isVideoSource) {
      const poster = src.settings?.posterUrl || src.settings?.filePath
      if (poster && (poster.endsWith('.jpg') || poster.endsWith('.png') || poster.endsWith('.jpeg') || poster.startsWith('data:'))) {
        const img = TextureManager.getOrCreateImage(src.id + '_poster', poster)
        if (img.complete && img.naturalWidth > 0 && (src.settings?.paused || !src.settings?.filePath?.endsWith('.mp4'))) {
          ctx.drawImage(img, src.x, src.y, src.width, src.height)
          ctx.restore()
          return
        }
      }
      const video = TextureManager.getOrCreateVideo(src.id, src)
      
      let isReady = false
      let vidWidth = 0
      let vidHeight = 0
      if (video instanceof HTMLCanvasElement) {
        isReady = true
        vidWidth = video.width
        vidHeight = video.height
      } else if (video && (video.readyState >= 2 || (video.readyState >= 1 && video.videoWidth > 0))) {
        isReady = true
        vidWidth = video.videoWidth
        vidHeight = video.videoHeight
      }

      if (video && isReady) {
        if (chromaFilter || lumaFilter) {
          const tempCanvas = TextureManager.getOffscreenCanvas()
          const tempCtx = tempCanvas.getContext('2d')!
          tempCanvas.width = src.width
          tempCanvas.height = src.height
          
          tempCtx.drawImage(video, 0, 0, src.width, src.height)
          const imgData = tempCtx.getImageData(0, 0, src.width, src.height)
          
          if (chromaFilter) {
            const d = imgData.data
            const color = chromaFilter.settings?.chromaKeyColor || '#00ff00'
            const sim = chromaFilter.settings?.chromaSimilarity || 120
            const smooth = chromaFilter.settings?.chromaSmoothness || 30
            
            const rKey = parseInt(color.slice(1, 3), 16)
            const gKey = parseInt(color.slice(3, 5), 16)
            const bKey = parseInt(color.slice(5, 7), 16)

            for (let i = 0; i < d.length; i += 4) {
              const dist = Math.sqrt((d[i] - rKey)**2 + (d[i+1] - gKey)**2 + (d[i+2] - bKey)**2)
              if (dist < sim) {
                d[i+3] = 0
              } else if (dist < sim + smooth) {
                d[i+3] = Math.floor(((dist - sim) / smooth) * 255)
              }
            }
          }

          if (lumaFilter) {
            const d = imgData.data
            const threshold = lumaFilter.settings?.lumaThreshold || 80
            for (let i = 0; i < d.length; i += 4) {
              const luma = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]
              if (luma < threshold) {
                d[i+3] = 0
              }
            }
          }

          tempCtx.putImageData(imgData, 0, 0)
          ctx.drawImage(tempCanvas, src.x, src.y, src.width, src.height)
        } else {
          const cropFilter = (src.filters || []).find(f => f.type === 'crop' && f.enabled)
          if (cropFilter) {
            const s = cropFilter.settings
            const left = s.cropLeft || 0
            const right = s.cropRight || 0
            const top = s.cropTop || 0
            const bottom = s.cropBottom || 0

            const sw = vidWidth - left - right
            const sh = vidHeight - top - bottom

            if (src.type === 'camera') {
              if (!(video as any).dataset.drawLogged) {
                console.log(`[Camera Pipeline] 10. texture upload: PASS (handled by WebGL/Canvas 2D via drawImage)`);
                console.log(`[Camera Pipeline] 11. renderer draw: PASS`);
                (video as any).dataset.drawLogged = 'true';
              }
            }
            ctx.drawImage(video, left, top, sw > 0 ? sw : 1, sh > 0 ? sh : 1, src.x, src.y, src.width, src.height)
          } else {
            if (src.type === 'camera') {
              if (!(video as any).dataset.drawLogged) {
                console.log(`[Camera Pipeline] 10. texture upload: PASS (handled by WebGL/Canvas 2D via drawImage)`);
                console.log(`[Camera Pipeline] 11. renderer draw: PASS`);
                (video as any).dataset.drawLogged = 'true';
              }
            }
            ctx.drawImage(video, src.x, src.y, src.width, src.height)
          }
        }
      } else {
        const errorLabel = src.type === 'camera'
          ? (video instanceof HTMLVideoElement ? (video.getAttribute('data-camera-error-message') || 'No Camera Available') : 'No Camera Available')
          : src.type === 'display_capture' || src.type === 'window_capture'
          ? (video instanceof HTMLVideoElement ? (video.getAttribute('data-display-error-message') || 'Screen Capture Unavailable') : 'Screen Capture Unavailable')
          : ['media', 'video'].includes(src.type)
          ? (video instanceof HTMLVideoElement ? (video.getAttribute('data-media-error-message') || 'Media File Unavailable') : 'No Media Selected')
          : src.name || 'Source unavailable'
        this.drawPattern(ctx, src.x, src.y, src.width, src.height, time, errorLabel)
      }
    } else if (src.type === 'image') {
      const imageSrc = src.settings?.blobUrl || src.settings?.filePath
      if (imageSrc) {
        const img = TextureManager.getOrCreateImage(src.id, imageSrc)
        if (img.complete && img.naturalWidth > 0) {
          if (src.settings?.preserveAspect && img.naturalHeight > 0) {
            const aspect = img.naturalWidth / img.naturalHeight
            let drawW = src.width
            let drawH = src.width / aspect
            if (drawH > src.height) {
              drawH = src.height
              drawW = src.height * aspect
            }
            const drawX = src.x + (src.width - drawW) / 2
            const drawY = src.y + (src.height - drawH) / 2
            ctx.drawImage(img, drawX, drawY, drawW, drawH)
          } else {
            ctx.drawImage(img, src.x, src.y, src.width, src.height)
          }
        } else if (img.getAttribute('data-error') === 'true') {
          this.drawPattern(ctx, src.x, src.y, src.width, src.height, time, 'Image Error')
        }
      } else {
        this.drawPattern(ctx, src.x, src.y, src.width, src.height, time, 'No Image Source')
      }
    } else if (src.type === 'slides') {
      const slideUrls = src.settings?.slideUrls || []
      const slideIndex = src.settings?.slideIndex || 0
      const currentSlideUrl = slideUrls[slideIndex]
      if (currentSlideUrl) {
        const img = TextureManager.getOrCreateImage(src.id, currentSlideUrl)
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, src.x, src.y, src.width, src.height)
        }
      } else {
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(src.x, src.y, src.width, src.height)
        ctx.fillStyle = '#38bdf8'
        ctx.font = 'bold 36px "Outfit", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`Presentation Slide ${slideIndex + 1}`, src.x + src.width / 2, src.y + src.height / 2 - 20)
      }
    } else if (src.type === 'color_source') {
      const bgColor = src.settings?.backgroundColor
      ctx.fillStyle = (bgColor && !bgColor.startsWith('var(')) ? bgColor : '#1e293b'
      ctx.fillRect(src.x, src.y, src.width, src.height)
    } else if (src.type === 'graphics') {
      if (src.settings?.posterUrl) {
        const img = TextureManager.getOrCreateImage(src.id + '_poster', src.settings.posterUrl)
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, src.x, src.y, src.width, src.height)
          ctx.restore()
          return
        }
      }
      const headline = src.settings?.headline || 'MAJOR EARTHQUAKE HITS DOWNTOWN AREA'
      const subheadline = src.settings?.subheadline || '7.2 MAGNITUDE RECORDED · EMERGENCY SERVICES DEPLOYED'
      const barY = src.y + src.height - 180
      const barH = 110
      // Lower third container
      ctx.fillStyle = 'rgba(6, 14, 28, 0.94)'
      ctx.fillRect(src.x + 80, barY, src.width - 160, barH)
      ctx.strokeStyle = '#dc2626'
      ctx.lineWidth = 3
      ctx.strokeRect(src.x + 80, barY, src.width - 160, barH)
      // Red Breaking News tab
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(src.x + 80, barY - 38, 240, 38)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px "Inter", sans-serif'
      ctx.fillText('BREAKING NEWS', src.x + 96, barY - 12)
      // Headline text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px "Inter", sans-serif'
      ctx.fillText(headline, src.x + 105, barY + 48)
      // Subheadline text
      if (subheadline) {
        ctx.fillStyle = '#94a3b8'
        ctx.font = '700 18px "Inter", sans-serif'
        ctx.fillText(subheadline, src.x + 105, barY + 86)
      }
    } else if (src.type === 'text') {
      ctx.fillStyle = src.settings?.textColor || '#ffffff'
      ctx.font = `bold ${src.settings?.textSize || 48}px "Inter", sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(src.settings?.textContent || '', src.x, src.y)
    } else if (src.type === 'browser' || src.type === 'html_overlay') {
      const url = src.settings?.url || 'https://google.com'
      const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`
      const img = TextureManager.getOrCreateImage(src.id, screenshotUrl)
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, src.x, src.y, src.width, src.height)
      } else {
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(src.x, src.y, src.width, src.height)
        ctx.fillStyle = '#38bdf8'
        ctx.font = '18px monospace'
        ctx.fillText(`${src.type === 'html_overlay' ? 'HTML Overlay' : 'Browser Source'}: Loading ${url}...`, src.x + 20, src.y + 40)
      }
    } else if (src.type === 'clock') {
      const timeStr = new Date().toLocaleTimeString()
      ctx.fillStyle = src.settings?.textColor || '#ffffff'
      ctx.font = `bold ${src.settings?.textSize || 64}px "Outfit", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(timeStr, src.x + src.width / 2, src.y + src.height / 2 + (src.settings?.textSize || 64)/3)
    } else if (src.type === 'countdown_timer') {
      ctx.fillStyle = src.settings?.textColor || '#ffffff'
      ctx.font = `bold ${src.settings?.textSize || 64}px "Outfit", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('00:15:00', src.x + src.width / 2, src.y + src.height / 2 + (src.settings?.textSize || 64)/3)
    } else if (src.type === 'shape') {
      const shapeType = src.settings?.shapeType || 'rectangle'
      ctx.fillStyle = src.settings?.fillColor || '#38bdf8'
      ctx.strokeStyle = src.settings?.strokeColor || '#ffffff'
      ctx.lineWidth = src.settings?.strokeWidth || 0
      ctx.beginPath()
      if (shapeType === 'ellipse' || shapeType === 'circle') {
        ctx.ellipse(src.x + src.width / 2, src.y + src.height / 2, src.width / 2, src.height / 2, 0, 0, Math.PI * 2)
      } else {
        ctx.rect(src.x, src.y, src.width, src.height)
      }
      ctx.fill()
      if (ctx.lineWidth > 0) ctx.stroke()
    } else if (src.type === 'gif') {
      const imageSrc = src.settings?.blobUrl || src.settings?.filePath || src.settings?.url
      if (imageSrc) {
        let resolvedPath = imageSrc
        if (/^[a-zA-Z]:/.test(imageSrc) || imageSrc.startsWith('/') || imageSrc.includes('\\') || imageSrc.startsWith('file:')) {
          const cleanPath = imageSrc.replace(/^file:\/+/i, '').replace(/\\/g, '/')
          resolvedPath = 'file:///' + cleanPath
        }
        const img = TextureManager.getOrCreateImage(src.id, resolvedPath)
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, src.x, src.y, src.width, src.height)
        }
      } else {
        this.drawPattern(ctx, src.x, src.y, src.width, src.height, time, 'GIF Media')
      }
    } else if (src.type === 'pdf') {
      this.drawPattern(ctx, src.x, src.y, src.width, src.height, time, src.name || 'PDF Document')
    } else if (src.type === 'audio') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
      ctx.fillRect(src.x, src.y, src.width, src.height)
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2
      ctx.strokeRect(src.x, src.y, src.width, src.height)
      ctx.fillStyle = '#38bdf8'
      ctx.font = 'bold 48px "Inter", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🎵', src.x + src.width / 2, src.y + src.height / 2)
      ctx.font = '16px "Inter", sans-serif'
      ctx.fillText(src.name || 'Audio Source', src.x + src.width / 2, src.y + src.height / 2 + 40)
    } else {
      this.drawPattern(ctx, src.x, src.y, src.width, src.height, time, src.name || 'UNKNOWN SOURCE')
    }
    
    ctx.restore()
  }
}
