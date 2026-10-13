export interface CachedMediaFrame {
  pts: number
  data: Uint8Array
}

export class MediaCache {
  private static shared = new Map<string, unknown>()
  private frames = new Map<number, Uint8Array>()
  private readonly capacity: number

  constructor(capacity = 120) { this.capacity = capacity }

  static get(id: string) { return this.shared.get(id) }
  static set(id: string, media: unknown) { this.shared.set(id, media) }
  static remove(id: string) { this.shared.delete(id) }
  static clear() { this.shared.clear() }

  addFrame(pts: number, data: Uint8Array) {
    this.frames.set(pts, data)
    while (this.frames.size > this.capacity) {
      const oldest = this.getOldestPts()
      if (oldest === undefined) break
      this.frames.delete(oldest)
    }
  }

  getFramesCount() { return this.frames.size }
  getOldestPts() { return this.sortedPts()[0] }
  getNewestPts() { const points = this.sortedPts(); return points[points.length - 1] }

  hasRange(start: number, end: number) {
    const oldest = this.getOldestPts()
    const newest = this.getNewestPts()
    return oldest !== undefined && newest !== undefined && oldest <= start && newest >= end
  }

  getFrameAt(time: number): CachedMediaFrame | null {
    const points = this.sortedPts()
    if (points.length === 0) return null
    let nearest = points[0]
    for (const point of points) {
      if (point > time) break
      nearest = point
    }
    return { pts: nearest, data: this.frames.get(nearest)! }
  }

  clear() { this.frames.clear() }
  private sortedPts() { return [...this.frames.keys()].sort((a, b) => a - b) }
}
