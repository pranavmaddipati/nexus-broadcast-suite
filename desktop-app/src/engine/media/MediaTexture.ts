export class MediaTexture {
  readonly canvas = document.createElement('canvas')
  readonly drawable: HTMLCanvasElement = this.canvas
  width = 0
  height = 0
  private context: CanvasRenderingContext2D | null
  public id: string

  constructor(id: string) {
    this.id = id
    this.context = this.canvas.getContext('2d')
  }

  update(frame?: Uint8Array, width = this.width, height = this.height) {
    if (!frame || width <= 0 || height <= 0 || !this.context) return
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
      this.width = width
      this.height = height
    }
    const pixels = new Uint8ClampedArray(frame.buffer, frame.byteOffset, frame.byteLength)
    this.context.putImageData(new ImageData(pixels, width, height), 0, 0)
  }

  destroy() {
    this.canvas.width = 0
    this.canvas.height = 0
    this.width = 0
    this.height = 0
    this.context = null
  }
}
