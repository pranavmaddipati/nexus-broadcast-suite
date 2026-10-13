type ChildProcess = any; // Typing to avoid requiring @types/node if absent

export type FrameCallback = (frameData: Uint8Array, width: number, height: number, pts: number) => void;

export class MediaDecoder {
  private process: ChildProcess | null = null;
  private width: number = 1920;
  private height: number = 1080;
  private fps: number = 30;
  private frameSizeBytes: number = 0;
  
  private buffer: Buffer | null = null;
  private onFrame: FrameCallback;
  private onEnded: () => void;
  private framesDecoded = 0;

  constructor(width: number, height: number, fps: number, onFrame: FrameCallback, onEnded: () => void) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.frameSizeBytes = width * height * 4; // RGBA
    this.onFrame = onFrame;
    this.onEnded = onEnded;
  }

  /**
   * Starts decoding from a specific time in seconds.
   */
  public start(filePath: string, startTime: number = 0) {
    this.stop();
    
    try {
      // We must use window.require since Vite bundles otherwise
      if (!(window as any).require) {
        console.warn("[MediaDecoder] Node integration is disabled in secure renderer; hardware subprocess decoder skipped.");
        return;
      }
      
      const cp = (window as any).require('child_process');
      const BufferStr = (window as any).require('buffer').Buffer;
      const ffmpegPath = 'C:\\Cffmpeg\\ffmpeg-git-essentials\\bin\\ffmpeg.exe';
      
      const args = [
        '-hide_banner',
        '-loglevel', 'error',
        '-hwaccel', 'auto',  // Enable NVDEC/DXVA2/D3D11VA
        '-ss', startTime.toFixed(3),
        '-i', filePath,
        '-an', '-sn', // Disable audio/subtitles in this pipe
        '-f', 'rawvideo',
        '-pix_fmt', 'rgba',
        '-s', `${this.width}x${this.height}`, // Force specific scale just in case
        '-r', this.fps.toString(), // Force uniform framerate output
        '-vsync', '1',
        '-'
      ];

      this.process = cp.spawn(ffmpegPath, args, { windowsHide: true });
      this.buffer = BufferStr.alloc(0);
      this.framesDecoded = 0;

      this.process.stdout.on('data', (chunk: any) => {
        try {
          if (!this.buffer) return;
          this.buffer = BufferStr.concat([this.buffer, chunk]);

          // Extract as many full frames as we have in the buffer
          while (this.buffer && this.buffer.length >= this.frameSizeBytes) {
            const frameData = this.buffer.slice(0, this.frameSizeBytes);
            this.buffer = this.buffer.slice(this.frameSizeBytes);
            
            // Calculate PTS based on uniform frame rate
            const pts = startTime + (this.framesDecoded / this.fps);
            this.framesDecoded++;
            
            this.onFrame(new Uint8Array(frameData.buffer, frameData.byteOffset, frameData.byteLength), this.width, this.height, pts);
          }
        } catch (e) {
          console.error('[MediaDecoder Error] Error processing frame chunk:', e);
        }
      });

    this.process.stderr.on('data', (data: any) => {
      // ffmpeg errors
      // console.warn('FFmpeg Decoder:', data.toString());
    });

    this.process.on('close', () => {
      this.onEnded();
    });
    
    } catch (err) {
      console.error('[MediaDecoder Error] Failed to start decoder:', err);
    }
  }

  public pause() {
    if (this.process && this.process.stdout) {
      this.process.stdout.pause();
    }
  }

  public resume() {
    if (this.process && this.process.stdout) {
      this.process.stdout.resume();
    }
  }

  public stop() {
    if (this.process) {
      try {
        this.process.stdout.destroy();
        this.process.kill('SIGKILL');
      } catch (e) {}
      this.process = null;
    }
    this.buffer = null;
  }
}
