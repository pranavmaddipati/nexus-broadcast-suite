import { MediaDecoder } from './MediaDecoder'
import { MediaCache } from './MediaCache'
import { TextureCache } from './TextureCache'
import { MediaTexture } from './MediaTexture'

export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'buffering' | 'ended'

export class FrameSynchronizer {
  public id: string
  public filePath: string
  private decoder: MediaDecoder | null = null
  private cache: MediaCache

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
  private lastRenderedTexture: MediaTexture | null = null

  private lastTimeUpdate: number = 0
  private animationFrameId: number = 0

  constructor(id: string, filePath: string, width: number, height: number, fps: number = 30, duration: number = 0) {
    this.id = id
    this.filePath = filePath
    this.width = width
    this.height = height
    this.fps = fps
    this.duration = duration
    
    this.cache = new MediaCache(120)

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
    
    if (!this.cache.hasRange(this.currentTime - 0.5, this.currentTime + 0.5)) {
      this.cache.clear()
      this.decoder?.start(this.filePath, this.currentTime)
      if (this.state === 'playing') this.state = 'buffering'
    } else {
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

  private loopTick() {
    if (this.state !== 'playing') return
    const now = performance.now()
    if (this.lastTimeUpdate > 0) {
      const elapsed = ((now - this.lastTimeUpdate) / 1000) * this.playbackSpeed
      this.currentTime += this.isReverse ? -elapsed : elapsed
      if (this.duration > 0 && (this.currentTime >= this.duration || this.currentTime < 0)) {
        if (this.loop) this.currentTime = this.isReverse ? this.duration : 0
        else {
          this.stop()
          this.state = 'ended'
          return
        }
      }
    }
    this.lastTimeUpdate = now
    this.renderCurrentFrame()
    this.animationFrameId = requestAnimationFrame(() => this.loopTick())
  }

  private renderCurrentFrame() {
    if (!this.lastRenderedTexture) {
      this.lastRenderedTexture = new MediaTexture(this.id)
    }
    const frame = this.cache.getFrameAt(this.currentTime)
    if (frame) this.lastRenderedTexture.update(frame.data, this.width, this.height)
  }

  public getCurrentTexture() { return this.lastRenderedTexture }
  public getAudioElement() { return this.audioElement }

  public destroy() {
    cancelAnimationFrame(this.animationFrameId)
    this.decoder?.stop()
    this.decoder = null
    this.audioElement.pause()
    this.audioElement.removeAttribute('src')
    this.audioElement.load()
    this.cache.clear()
    this.lastRenderedTexture?.destroy()
    this.lastRenderedTexture = null
    this.state = 'stopped'
  }
}
