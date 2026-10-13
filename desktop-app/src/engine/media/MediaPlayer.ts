import { MediaDecoder } from './MediaDecoder'
import { MediaCache } from './MediaCache'
import { TextureUploader } from './TextureUploader'

export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'buffering' | 'ended'

export class MediaPlayer {
  private decoder: MediaDecoder | null = null
  private cache: MediaCache
  public filePath: string

  public state: PlaybackState = 'stopped'
  public currentTime: number = 0
  public duration: number = 0
  public playbackSpeed: number = 1.0
  public loop: boolean = false
  public isReverse: boolean = false

  public width: number = 1920
  public height: number = 1080
  public fps: number = 30

  private audioElement: HTMLAudioElement
  private lastRenderedCanvas: HTMLCanvasElement | null = null

  // Used for keeping time accurately outside of FFmpeg's stream
  private lastTimeUpdate: number = 0
  private animationFrameId: number = 0

  constructor(filePath: string, width: number, height: number, fps: number = 30, duration: number = 0) {
    this.filePath = filePath
    this.width = width
    this.height = height
    this.fps = fps
    this.duration = duration
    
    // We cache a minimum of 120 frames (4 seconds at 30fps) to allow immediate reverse scrubbing
    this.cache = new MediaCache(120)

    // Audio element synced for Web Audio API routing
    this.audioElement = document.createElement('audio')
    this.audioElement.src = filePath
    this.audioElement.preload = 'auto'
    this.audioElement.crossOrigin = 'anonymous'

    this.initDecoder()
  }

  private initDecoder() {
    this.decoder = new MediaDecoder(this.width, this.height, this.fps, 
      (frameData, w, h, pts) => {
        this.cache.addFrame(pts, frameData)
        
        // Backpressure logic: if cache is full, pause decoding until we consume frames
        if (this.cache.getFramesCount() >= 120) {
          this.decoder?.pause()
        }

        if (this.state === 'buffering') {
          this.state = 'playing'
          this.lastTimeUpdate = performance.now()
          if (!this.isReverse) {
            this.audioElement.play().catch(() => {})
          }
          this.loopTick()
        }
      }, 
      () => {
        // FFmpeg ended
        if (this.state === 'playing') {
          this.state = 'ended'
        }
      }
    )
  }

  public play() {
    if (this.state === 'playing') return
    this.state = 'buffering'
    this.lastTimeUpdate = performance.now()
    
    // Resume audio if not reversed
    if (!this.isReverse) {
      this.audioElement.currentTime = this.currentTime
      this.audioElement.playbackRate = this.playbackSpeed
    } else {
      this.audioElement.pause()
    }

    if (!this.cache.hasRange(this.currentTime, this.currentTime + 1)) {
      this.decoder?.start(this.filePath, this.currentTime)
    } else {
      this.state = 'playing'
      if (!this.isReverse) this.audioElement.play().catch(() => {})
      this.loopTick()
    }
  }

  public pause() {
    this.state = 'paused'
    this.audioElement.pause()
    cancelAnimationFrame(this.animationFrameId)
    this.decoder?.pause()
  }

  public stop() {
    this.state = 'stopped'
    this.audioElement.pause()
    this.audioElement.currentTime = 0
    this.currentTime = 0
    cancelAnimationFrame(this.animationFrameId)
    this.decoder?.stop()
    this.cache.clear()
    this.initDecoder()
  }

  public seek(time: number) {
    this.currentTime = Math.max(0, Math.min(time, this.duration))
    this.audioElement.currentTime = this.currentTime
    
    // If the requested time is not in cache, we MUST spawn a new FFmpeg seek
    if (!this.cache.hasRange(this.currentTime - 0.5, this.currentTime + 0.5)) {
      this.cache.clear()
      this.decoder?.start(this.filePath, this.currentTime)
      if (this.state === 'playing') this.state = 'buffering'
    } else {
      // Force an immediate render
      this.renderCurrentFrame()
    }
  }

  public stepForward() {
    this.pause()
    this.seek(this.currentTime + (1 / this.fps))
  }

  public stepBackward() {
    this.pause()
    this.seek(this.currentTime - (1 / this.fps))
  }

  public toggleReverse() {
    this.isReverse = !this.isReverse
    if (this.isReverse) {
      this.audioElement.pause()
    } else if (this.state === 'playing') {
      this.audioElement.play().catch(() => {})
    }
  }

  public setSpeed(speed: number) {
    this.playbackSpeed = speed
    this.audioElement.playbackRate = speed
  }

  private loopTick = () => {
    if (this.state !== 'playing') return

    const now = performance.now()
    const dt = (now - this.lastTimeUpdate) / 1000.0
    this.lastTimeUpdate = now

    if (this.isReverse) {
      this.currentTime -= dt * this.playbackSpeed
      if (this.currentTime <= 0) {
        if (this.loop) {
          this.seek(this.duration)
        } else {
          this.pause()
          this.currentTime = 0
        }
      }
    } else {
      this.currentTime += dt * this.playbackSpeed
      if (this.currentTime >= this.duration) {
        if (this.loop) {
          this.seek(0)
        } else {
          this.pause()
          this.currentTime = this.duration
        }
      }
    }

    // Sync audio if it drifted significantly (e.g., more than 100ms out of sync)
    if (!this.isReverse && Math.abs(this.audioElement.currentTime - this.currentTime) > 0.1) {
      this.audioElement.currentTime = this.currentTime
    }

    this.renderCurrentFrame()

    // Resume decoder if cache is running low
    if (!this.isReverse && this.cache.getNewestPts() < this.currentTime + 1) {
      this.decoder?.resume()
    } else if (this.isReverse && this.cache.getOldestPts() > this.currentTime - 1) {
      // Need to seek backwards to fill cache for reverse playback
      if (this.currentTime - 2 > 0) {
        this.decoder?.start(this.filePath, Math.max(0, this.currentTime - 2))
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loopTick)
  }

  private renderCurrentFrame() {
    const rawData = this.cache.getFrameAt(this.currentTime)
    if (rawData) {
      // Recycle the old canvas if possible
      if (this.lastRenderedCanvas) {
        TextureUploader.releaseCanvas(this.lastRenderedCanvas)
      }
      this.lastRenderedCanvas = TextureUploader.uploadFrame(rawData, this.width, this.height)
    }
  }

  public getCurrentCanvas(): HTMLCanvasElement | null {
    return this.lastRenderedCanvas
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audioElement
  }

  public destroy() {
    this.stop()
    this.audioElement.src = ''
    if (this.lastRenderedCanvas) {
      TextureUploader.releaseCanvas(this.lastRenderedCanvas)
      this.lastRenderedCanvas = null
    }
  }
}
