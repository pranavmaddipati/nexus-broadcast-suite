export class RenderScheduler {
  private static animId: number = 0
  private static lastTime: number = 0
  private static targetFps: number = 60
  private static isRunning: boolean = false

  public static start(tick: (time: number) => void) {
    this.stop()
    this.isRunning = true
    this.lastTime = performance.now()

    const loop = (time: number) => {
      if (!this.isRunning) return

      const elapsed = time - this.lastTime
      const interval = 1000 / this.targetFps

      if (elapsed >= interval) {
        this.lastTime = time - (elapsed % interval)
        tick(time)
      }

      this.animId = requestAnimationFrame(loop)
    }

    this.animId = requestAnimationFrame(loop)
  }

  public static stop() {
    this.isRunning = false
    if (this.animId) {
      cancelAnimationFrame(this.animId)
      this.animId = 0
    }
  }

  public static setFps(fps: number) {
    if (!Number.isFinite(fps) || fps <= 0) throw new RangeError('FPS must be positive and finite')
    this.targetFps = fps
  }
}
