import type { SceneSource } from '../store/StoreTypes'

export type SourceLifecycleState = 'idle' | 'initializing' | 'loading' | 'ready' | 'playing' | 'paused' | 'error' | 'disconnected' | 'disposed'

export interface MediaSourceElement {
  id: string
  type: string
  ready: boolean
  status: SourceLifecycleState
  errorMessage?: string
  mediaStream?: MediaStream
  videoElement?: HTMLVideoElement
  audioElement?: HTMLAudioElement
  imageElement?: HTMLImageElement
  metadata?: any
  dispose: () => void
}

const getElectron = () => {
  if (typeof window !== 'undefined' && (window.nexusAPI || window.electronAPI)) {
    const api = (window.nexusAPI || window.electronAPI)!
    return {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => {
          if (channel === 'set-next-screen-id') api.setNextScreenId(args[0])
        }
      }
    }
  }
  return null
}

export class MediaManager {
  private static instance: MediaManager
  private sources: Map<string, MediaSourceElement> = new Map()
  
  // Device ID -> MediaStream caching to prevent duplicate access
  public streamCache: Map<string, MediaStream> = new Map()
  public streamPromiseCache: Map<string, Promise<MediaStream>> = new Map()

  public getGlobalCameraStream(deviceId: string, isAudio: boolean = false): Promise<MediaStream> {
    const cacheKey = isAudio ? `audio_${deviceId}` : `camera_${deviceId}`
    
    if (this.streamPromiseCache.has(cacheKey)) {
      return this.streamPromiseCache.get(cacheKey)!
    }
    
    const promise = new Promise<MediaStream>(async (resolve, reject) => {
      try {
        const currentStream = this.streamCache.get(cacheKey)
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop())
        }

        let constraints: any = isAudio ? {
          audio: deviceId !== 'default' ? { deviceId: { exact: deviceId } } : true
        } : {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: false
        }
        
        if (!isAudio && deviceId && deviceId !== 'default') {
          constraints.video.deviceId = { ideal: deviceId }
        }

        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (err: any) {
          console.warn(`MediaManager ${isAudio ? 'Audio' : 'Camera'} attempt failed: ${err.message || err.name}`)
          
          if (!isAudio && constraints.video.deviceId) {
            console.warn(`MediaManager retrying without deviceId...`)
            constraints.video = { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } }
            try {
              stream = await navigator.mediaDevices.getUserMedia(constraints)
            } catch (err2: any) {
               console.warn(`MediaManager Camera busy, falling back to default device...`)
               stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            }
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            console.warn(`MediaManager ${isAudio ? 'Audio' : 'Camera'} busy, falling back to default device...`)
            stream = await navigator.mediaDevices.getUserMedia(isAudio ? { audio: true } : { video: true, audio: false })
          } else {
            throw err
          }
        }
        
        this.streamCache.set(cacheKey, stream)
        resolve(stream)
      } catch (err) {
        this.streamPromiseCache.delete(cacheKey)
        reject(err)
      }
    })
    
    this.streamPromiseCache.set(cacheKey, promise)
    return promise
  }
  
  private listeners: Set<(sources: Record<string, MediaSourceElement>) => void> = new Set()

  public static getInstance(): MediaManager {
    if (!MediaManager.instance) {
      MediaManager.instance = new MediaManager()
    }
    return MediaManager.instance
  }

  public subscribe(listener: (sources: Record<string, MediaSourceElement>) => void) {
    this.listeners.add(listener)
    this.notify()
    return () => this.listeners.delete(listener)
  }

  private notify() {
    const record: Record<string, MediaSourceElement> = {}
    for (const [id, source] of this.sources.entries()) {
      record[id] = source
    }
    this.listeners.forEach(listener => listener(record))
  }

  public getOrCreateSource(srcId: string, src: SceneSource, activeScenes: any[]): MediaSourceElement {
    if (this.sources.has(srcId)) {
      const existing = this.sources.get(srcId)!
      // Check for config changes and update if needed
      // (Simplified: we assume it's good unless specific settings changed heavily)
      this.syncSourceSettings(existing, src)
      return existing
    }

    const newSource = this.createMediaElement(srcId, src, activeScenes)
    this.sources.set(srcId, newSource)
    this.notify()
    return newSource
  }

  private syncSourceSettings(element: MediaSourceElement, src: SceneSource) {
    if (element.videoElement) {
      const currentLoop = src.settings?.loop !== false
      if (element.videoElement.loop !== currentLoop) {
        element.videoElement.loop = currentLoop
      }
    }
  }

  private createMediaElement(srcId: string, src: SceneSource, activeScenes: any[]): MediaSourceElement {
    const el: MediaSourceElement = {
      id: srcId,
      type: src.type,
      ready: false,
      status: 'loading',
      dispose: () => {
        el.status = 'disposed'
        el.ready = false
        if (el.videoElement) {
          el.videoElement.pause()
          if (el.videoElement.src && el.videoElement.src.startsWith('blob:')) {
            URL.revokeObjectURL(el.videoElement.src)
          }
          el.videoElement.src = ''
          if (el.videoElement.srcObject instanceof MediaStream) {
            el.videoElement.srcObject.getTracks().forEach(track => track.stop())
          }
          el.videoElement.srcObject = null
          el.videoElement.remove()
        }
        if (el.imageElement) {
          if (el.imageElement.src && el.imageElement.src.startsWith('blob:')) {
            URL.revokeObjectURL(el.imageElement.src)
          }
          el.imageElement.src = ''
          el.imageElement.remove()
        }
        if (el.mediaStream) {
          el.mediaStream.getTracks().forEach(track => track.stop())
          el.mediaStream = undefined
        }
      }
    }

    const currentDeviceId = src.settings?.deviceId || 'default'
    const currentScreenId = src.settings?.screenId || ''
    const currentPath = src.settings?.filePath || src.settings?.blobUrl

    const safePlay = (vid: HTMLVideoElement) => {
      if (vid.paused && (vid.src || vid.srcObject)) {
        vid.play().catch(err => console.error('MediaManager Play Error:', err))
      }
    }

    if (['camera', 'display_capture', 'window_capture', 'audio', 'graphics', 'media', 'video', 'ndi'].includes(src.type)) {
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.loop = src.settings?.loop !== false
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
      el.videoElement = video

      const isLiveClone = srcId.endsWith('_live')
      const pvwId = srcId.replace('_live', '')
      const pvwVideo = isLiveClone ? this.sources.get(pvwId)?.videoElement : null

      if (isLiveClone && pvwVideo && pvwVideo.srcObject) {
        video.srcObject = pvwVideo.srcObject
        if (!src.settings?.paused) safePlay(video)
        el.ready = true
        el.status = 'playing'
      } else if (src.type === 'camera') {
        const cacheKey = `camera_${currentDeviceId}`
        if (this.streamCache.has(cacheKey)) {
          video.srcObject = this.streamCache.get(cacheKey)!
          if (!src.settings?.paused) safePlay(video)
          el.ready = true
          el.status = 'playing'
        } else {
          const attemptMediaManagerCamera = async () => {
            try {
              const devices = await navigator.mediaDevices.enumerateDevices()
              const videoDevices = devices.filter(d => d.kind === 'videoinput')
              let targetDeviceId = currentDeviceId;
              if (targetDeviceId !== 'default' && targetDeviceId) {
                 const found = videoDevices.find(d => d.deviceId === targetDeviceId);
                 if (!found && videoDevices.length > 0) {
                   targetDeviceId = videoDevices[0].deviceId;
                 }
              }

              const stream = await this.getGlobalCameraStream(targetDeviceId, false)
              
              video.srcObject = stream
              el.mediaStream = stream
              if (!src.settings?.paused) safePlay(video)
              el.ready = true
              el.status = 'playing'
              this.notify()
            } catch (err) {
              console.error('MediaManager Camera access failed:', err)
              el.status = 'error'
              this.notify()
            }
          }
          attemptMediaManagerCamera()
        }
      } else if (src.type === 'audio') {
        const cacheKey = `audio_${currentDeviceId}`
        if (this.streamCache.has(cacheKey)) {
          video.srcObject = this.streamCache.get(cacheKey)!
          if (!src.settings?.paused) safePlay(video)
          el.ready = true
          el.status = 'playing'
        } else {
          this.getGlobalCameraStream(currentDeviceId, true).then(stream => {
            video.srcObject = stream
            el.mediaStream = stream
            if (!src.settings?.paused) safePlay(video)
            el.ready = true
            el.status = 'playing'
            this.notify()
          }).catch(err => {
            console.error('MediaManager Audio access failed:', err)
            el.status = 'error'
            this.notify()
          })
        }
      } else if (src.type === 'display_capture' || src.type === 'window_capture') {
        const electron = getElectron()
        const currentCaptureCursor = src.settings?.captureCursor !== false
        if (electron && currentScreenId) {
          if (currentCaptureCursor) {
            electron.ipcRenderer.send('set-next-screen-id', currentScreenId)
            navigator.mediaDevices.getDisplayMedia({
              video: { cursor: 'always' } as any,
              audio: false
            }).then(stream => {
              video.srcObject = stream
              el.mediaStream = stream
              if (!src.settings?.paused) safePlay(video)
              el.ready = true
              el.status = 'playing'
              this.notify()
            }).catch(err => {
              console.error('MediaManager Display access failed:', err)
              el.status = 'error'
              this.notify()
            })
          }
        } else {
          navigator.mediaDevices.getDisplayMedia({
            video: { cursor: currentCaptureCursor ? 'always' : 'never' } as any,
            audio: false
          }).then(stream => {
            video.srcObject = stream
            el.mediaStream = stream
            if (!src.settings?.paused) safePlay(video)
            el.ready = true
            el.status = 'playing'
            this.notify()
          }).catch(err => {
            console.error('MediaManager Standard Display access failed:', err)
            el.status = 'error'
            this.notify()
          })
        }
      } else if (src.type === 'media' || src.type === 'video') {
        if (currentPath) {
          let resolvedPath = currentPath
          if (/^[a-zA-Z]:/.test(currentPath) || currentPath.startsWith('/') || currentPath.includes('\\') || currentPath.startsWith('file:')) {
            const cleanPath = currentPath.replace(/^file:\/+/i, '').replace(/\\/g, '/')
            resolvedPath = 'file:///' + cleanPath
          }
          video.src = resolvedPath
          video.load()
          video.oncanplay = () => {
            el.ready = true
            el.status = 'playing'
            if (!src.settings?.paused) safePlay(video)
            this.notify()
          }
          video.onerror = () => {
            el.status = 'error'
            this.notify()
          }
        }
      } else if (src.type === 'ndi') {
        const path = currentPath || 'https://www.w3schools.com/html/mov_bbb.mp4'
        video.src = path
        video.load()
        video.oncanplay = () => {
            el.ready = true
            el.status = 'playing'
            if (!src.settings?.paused) safePlay(video)
            this.notify()
        }
      } else if (src.type === 'graphics') {
        const pollCanvas = () => {
          const canvas = document.getElementById(`graphics-canvas-${srcId}`) as HTMLCanvasElement
          if (canvas) {
            const stream = (canvas as any).captureStream(30)
            video.srcObject = stream
            el.mediaStream = stream
            if (!src.settings?.paused) safePlay(video)
            el.ready = true
            el.status = 'playing'
            this.notify()
          } else {
            setTimeout(pollCanvas, 100)
          }
        }
        pollCanvas()
      }
    } else if (src.type === 'image' || src.type === 'gif') {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const imgUrl = src.settings?.filePath || src.settings?.blobUrl || src.settings?.url
      if (imgUrl) {
        let resolvedPath = imgUrl
        if (/^[a-zA-Z]:/.test(imgUrl) || imgUrl.startsWith('/') || imgUrl.includes('\\') || imgUrl.startsWith('file:')) {
          const cleanPath = imgUrl.replace(/^file:\/+/i, '').replace(/\\/g, '/')
          resolvedPath = 'file:///' + cleanPath
        }
        img.onload = () => {
          el.ready = true
          el.status = 'playing'
          this.notify()
        }
        img.onerror = () => {
          el.status = 'error'
          this.notify()
        }
        img.src = resolvedPath
        el.imageElement = img
      }
    }

    return el
  }

  public syncActiveSources(activeScenes: any[]) {
    const activeIds = new Set<string>()
    activeScenes.forEach(sc => {
      (sc.sources || []).forEach((src: SceneSource) => {
        if (!['color_source', 'text', 'group'].includes(src.type)) {
          activeIds.add(src.id)
          this.getOrCreateSource(src.id, src, activeScenes)
        }
      })
    })

    // Cleanup abandoned sources
    for (const [id, source] of this.sources.entries()) {
      if (!activeIds.has(id) && !id.endsWith('_live')) {
        // Also ensure the live clone isn't active
        const liveCloneId = `${id}_live`
        if (!activeIds.has(liveCloneId)) {
          source.dispose()
          this.sources.delete(id)
        }
      }
    }

    // Cleanup abandoned streams
    const activeStreamIds = new Set<string>()
    this.sources.forEach(src => {
      if (src.mediaStream && src.mediaStream.id) {
         activeStreamIds.add(src.mediaStream.id)
      }
    })
    
    for (const [key, stream] of this.streamCache.entries()) {
      if (!activeStreamIds.has(stream.id)) {
        stream.getTracks().forEach(track => track.stop())
        this.streamCache.delete(key)
        this.streamPromiseCache.delete(key)
      }
    }
  }

  public disposeSource(id: string) {
    const src = this.sources.get(id)
    if (src) {
      src.dispose()
      this.sources.delete(id)
      this.notify()
    }
  }
}
