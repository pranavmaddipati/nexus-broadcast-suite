/**
 * TextureUploader
 * Converts raw Uint8Array (RGBA) frames decoded by FFmpeg into renderable Canvases.
 */

export class TextureUploader {
  private static canvasPool: HTMLCanvasElement[] = []
  private static MAX_POOL_SIZE = 10

  /**
   * Acquires a canvas from the pool or creates a new one.
   */
  private static acquireCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = this.canvasPool.pop()
    if (!canvas) {
      canvas = document.createElement('canvas')
    }
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    return canvas
  }

  /**
   * Returns a canvas to the pool for reuse.
   */
  public static releaseCanvas(canvas: HTMLCanvasElement) {
    if (this.canvasPool.length < this.MAX_POOL_SIZE) {
      this.canvasPool.push(canvas)
    }
  }

  /**
   * Uploads raw RGBA bytes into an ImageData object and draws it to a Canvas.
   */
  public static uploadFrame(rawData: Uint8Array, width: number, height: number): HTMLCanvasElement {
    const canvas = this.acquireCanvas(width, height)
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false })
    if (!ctx) return canvas

    // The Uint8ClampedArray must share the same buffer or be copied.
    const clamped = new Uint8ClampedArray(rawData.buffer, rawData.byteOffset, rawData.byteLength)
    
    // Create ImageData (this is zero-copy in some browsers if passed correctly, or a fast copy)
    let imageData: ImageData
    try {
      imageData = new ImageData(clamped, width, height)
    } catch (e) {
      // Fallback if environment requires copy
      imageData = ctx.createImageData(width, height)
      imageData.data.set(clamped)
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
  }
}
