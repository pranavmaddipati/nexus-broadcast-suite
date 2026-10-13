import type { SceneSource } from '../store/StoreTypes'
import { MediaManager } from './MediaManager'

export function resolveMediaPath(rawPath: string): string {
  if (!rawPath) return ''
  if (
    rawPath.startsWith('http://') ||
    rawPath.startsWith('https://') ||
    rawPath.startsWith('blob:') ||
    rawPath.startsWith('data:') ||
    rawPath.startsWith('nexus-media:')
  ) {
    return rawPath
  }
  const cleanPath = rawPath.replace(/^file:\/+/i, '').replace(/\\/g, '/')
  const isElectron = typeof window !== 'undefined' && !!(window as any).nexusAPI
  if (isElectron) {
    return `nexus-media://local-file/${cleanPath}`
  }
  return `file:///${cleanPath}`
}

export class TextureManager {
  private static videoCache = new Map<string, HTMLVideoElement>()
  private static imageCache = new Map<string, HTMLImageElement>()
  private static offscreenCanvas: HTMLCanvasElement | null = null

  public static getOffscreenCanvas(): HTMLCanvasElement {
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas')
    }
    return this.offscreenCanvas
  }

  public static getOrCreateVideo(srcId: string, src: SceneSource, hookAudio?: (vid: HTMLVideoElement | HTMLAudioElement) => void): HTMLVideoElement | HTMLCanvasElement | null {
    let video = this.videoCache.get(srcId)
    const currentPath = src.settings?.filePath || src.settings?.blobUrl || ''
    const currentDeviceId = src.settings?.deviceId || 'default'
    const currentScreenId = src.settings?.screenId || ''
    const currentLoop = src.settings?.loop !== false

    const safePlay = (vid: HTMLVideoElement) => {
      if (vid.paused && (vid.src || vid.srcObject)) {
        if (vid.getAttribute('data-play-pending')) return
        if (vid.getAttribute('data-play-failed') && vid.readyState < 2) return

        vid.setAttribute('data-play-pending', 'true')
        vid.play()
          .then(() => {
            vid.removeAttribute('data-play-pending')
            vid.removeAttribute('data-play-failed')
          })
          .catch((err) => {
            vid.removeAttribute('data-play-pending')
            if (err.name !== 'AbortError') {
              vid.setAttribute('data-play-failed', 'true')
            }
          })
      }
    }

    let needsSourceUpdate = false

    if (!video) {
      video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.loop = currentLoop
      video.crossOrigin = 'anonymous'
      video.preload = 'auto'

      let hiddenContainer = document.getElementById('hidden-media-container')
      if (!hiddenContainer) {
        hiddenContainer = document.createElement('div')
        hiddenContainer.id = 'hidden-media-container'
        hiddenContainer.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 1px; height: 1px; opacity: 0.001; overflow: hidden; pointer-events: none; z-index: -9999;')
        document.body.appendChild(hiddenContainer)
      }
      hiddenContainer.appendChild(video)

      if (hookAudio) hookAudio(video)

      needsSourceUpdate = true
      this.videoCache.set(srcId, video)
    } else {
      const activePath = video.getAttribute('data-active-path') || ''
      const activeDeviceId = video.getAttribute('data-active-device-id') || ''
      const activeScreenId = video.getAttribute('data-active-screen-id') || ''
      const currentCaptureCursor = src.settings?.captureCursor !== false
      const activeCaptureCursor = video.getAttribute('data-active-capture-cursor') !== 'false'

      if (video.loop !== currentLoop) video.loop = currentLoop

      if (
        (['media', 'video'].includes(src.type) && activePath !== currentPath) ||
        (src.type === 'camera' && activeDeviceId !== currentDeviceId) ||
        (src.type === 'display_capture' && activeScreenId !== currentScreenId) ||
        (src.type === 'window_capture' && activeScreenId !== currentScreenId) ||
        ((src.type === 'display_capture' || src.type === 'window_capture') && activeCaptureCursor !== currentCaptureCursor)
      ) {
        needsSourceUpdate = true
      }
    }

    if (needsSourceUpdate) {
      video.setAttribute('data-active-path', currentPath)
      video.setAttribute('data-active-device-id', currentDeviceId)
      video.setAttribute('data-active-screen-id', currentScreenId)
      video.setAttribute('data-active-capture-cursor', (src.settings?.captureCursor !== false).toString())

      video.removeAttribute('data-play-failed')

      if (src.type === 'camera' && currentDeviceId) {
        const markCameraError = (vid: HTMLVideoElement, err: any) => {
          const message = err?.message || err?.name || String(err || 'Camera unavailable')
          vid.setAttribute('data-camera-error', message)
          vid.setAttribute('data-camera-error-message', message)
        }

        const clearCameraError = (vid: HTMLVideoElement) => {
          vid.removeAttribute('data-camera-error')
          vid.removeAttribute('data-camera-error-message')
        }

        const attemptCamera = async () => {
          try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoDevices = devices.filter(d => d.kind === 'videoinput')
            
            let targetDeviceId = currentDeviceId
            if (targetDeviceId !== 'default' && targetDeviceId) {
               const found = videoDevices.find(d => d.deviceId === targetDeviceId)
               if (!found && videoDevices.length > 0) {
                 targetDeviceId = videoDevices[0].deviceId
               }
            }

            const mm = MediaManager.getInstance()
            const stream = await mm.getGlobalCameraStream(targetDeviceId, false)
            
            if (video) {
              clearCameraError(video)
              video.srcObject = stream
              safePlay(video)
            }
          } catch (err: any) {
            console.error(`[Camera Pipeline] getUserMedia() FAIL: ${err?.message || err}`, err)
            if (currentDeviceId && currentDeviceId !== 'default' && (err.name === 'NotReadableError' || err.name === 'TrackStartError')) {
               try {
                 const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true })
                 if (video) {
                   clearCameraError(video)
                   video.srcObject = fallbackStream
                   safePlay(video)
                 }
                 return
               } catch (fallbackErr: any) {
                 if (video) markCameraError(video, fallbackErr)
               }
            } else {
               if (video) markCameraError(video, err)
            }
          }
        }

        attemptCamera()
      } else if (src.type === 'media' || src.type === 'video') {
        if (currentPath) {
          const resolvedPath = resolveMediaPath(currentPath)
          video.src = resolvedPath
          video.loop = currentLoop
          video.volume = typeof src.settings?.volume === 'number' ? Math.max(0, Math.min(1, src.settings.volume)) : 1.0
          video.muted = !!src.settings?.muted

          video.oncanplay = () => {
            video.removeAttribute('data-media-error')
            video.removeAttribute('data-media-error-message')
            if (!src.settings?.paused) safePlay(video)
          }
          video.onerror = () => {
            video.setAttribute('data-media-error', 'true')
            video.setAttribute('data-media-error-message', 'Media file cannot be loaded or format unsupported')
          }
          video.load()
        } else {
          video.setAttribute('data-media-error', 'true')
          video.setAttribute('data-media-error-message', 'No media file selected')
        }
      } else if (src.type === 'display_capture' || src.type === 'window_capture') {
        const markDisplayError = (vid: HTMLVideoElement, err: any) => {
          const msg = err?.message || err?.name || 'Screen capture unavailable'
          vid.setAttribute('data-display-error', msg)
          vid.setAttribute('data-display-error-message', msg)
        }

        const startScreenCapture = async () => {
          try {
            let stream: MediaStream | null = null
            if (currentScreenId) {
              stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: currentScreenId,
                    minWidth: 1280,
                    maxWidth: 3840,
                    minHeight: 720,
                    maxHeight: 2160
                  }
                } as any
              })
            } else if (navigator.mediaDevices.getDisplayMedia) {
              stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: src.settings?.captureCursor !== false ? 'always' : 'never' } as any,
                audio: false
              })
            }

            if (stream && video) {
              video.removeAttribute('data-display-error')
              video.removeAttribute('data-display-error-message')
              video.srcObject = stream
              safePlay(video)
              stream.getVideoTracks().forEach(t => {
                t.onended = () => {
                  if (video) markDisplayError(video, new Error('Screen capture ended'))
                }
              })
            }
          } catch (err: any) {
            console.warn('[TextureManager] Desktop capture error:', err)
            if (video) markDisplayError(video, err)
          }
        }

        startScreenCapture()
      }
    } else {
      if (src.type === 'media' || src.type === 'video') {
        if (src.settings?.paused) {
          video.pause()
        } else {
          safePlay(video)
        }
      } else {
        safePlay(video)
      }
    }

    return video
  }

  public static getOrCreateImage(srcId: string, url: string): HTMLImageElement {
    const resolvedUrl = resolveMediaPath(url)

    if (!this.imageCache.has(srcId)) {
      const img = typeof Image !== 'undefined' ? new Image() : (document.createElement('img') as HTMLImageElement)
      img.crossOrigin = 'anonymous'
      img.onload = () => img.removeAttribute('data-error')
      img.onerror = () => {
        if (img.src.includes('/src/assets/broadcast/')) {
          img.src = img.src.replace('/src/assets/broadcast/', '/assets/broadcast/')
        } else if (img.src.includes('/assets/broadcast/') && !img.src.includes('/src/assets/broadcast/')) {
          img.src = img.src.replace('/assets/broadcast/', '/src/assets/broadcast/')
        } else {
          img.setAttribute('data-error', 'true')
        }
      }
      img.src = resolvedUrl
      this.imageCache.set(srcId, img)
      return img
    }
    const img = this.imageCache.get(srcId)!
    if (img.src !== resolvedUrl && !img.src.endsWith(resolvedUrl)) {
      if (img.src && img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src)
      }
      img.removeAttribute('data-error')
      img.src = resolvedUrl
    }
    return img
  }

  public static disposeSource(srcId: string) {
    const video = this.videoCache.get(srcId)
    if (video) {
      try {
        video.pause()
        if (video.srcObject instanceof MediaStream) {
          video.srcObject.getTracks().forEach(track => track.stop())
        }
        video.srcObject = null
        if (video.src && video.src.startsWith('blob:')) {
          URL.revokeObjectURL(video.src)
        }
        video.src = ''
        video.load()
        video.remove()
      } catch (err) {
        console.warn(`[TextureManager] Error disposing video for source ${srcId}:`, err)
      }
      this.videoCache.delete(srcId)
    }

    const img = this.imageCache.get(srcId)
    if (img) {
      if (img.src && img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src)
      }
      img.src = ''
      img.remove()
      this.imageCache.delete(srcId)
    }

    const posterImg = this.imageCache.get(`${srcId}_poster`)
    if (posterImg) {
      if (posterImg.src && posterImg.src.startsWith('blob:')) {
        URL.revokeObjectURL(posterImg.src)
      }
      posterImg.src = ''
      posterImg.remove()
      this.imageCache.delete(`${srcId}_poster`)
    }
  }

  public static disposeAll() {
    for (const id of Array.from(this.videoCache.keys())) {
      this.disposeSource(id)
    }
    for (const id of Array.from(this.imageCache.keys())) {
      this.disposeSource(id)
    }
  }
}
