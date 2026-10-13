import { FrameSynchronizer } from './FrameSynchronizer'
import { TextureCache } from './TextureCache'
import type { SceneSource } from '../../store/StoreTypes'

console.log('Stage 7: MediaEngine initialized');

export class MediaEngine {
  private static synchronizers = new Map<string, FrameSynchronizer>()

  public static getOrCreateSynchronizer(srcId: string, src: SceneSource, hookAudio?: (audio: HTMLAudioElement) => void): FrameSynchronizer {
    let sync = this.synchronizers.get(srcId)
    
    let filePath = src.settings?.filePath || src.settings?.blobUrl || ''
    if (filePath.startsWith('file:///')) {
      filePath = filePath.replace('file:///', '')
    }
    if (filePath.startsWith('file://')) {
      filePath = filePath.replace('file://', '')
    }
    const loop = src.settings?.loop !== false
    
    // For images, we create a static synchronizer (mock) or handle it entirely in TextureManager.
    // However, for videos:
    if (!sync) {
      sync = new FrameSynchronizer(srcId, filePath, 1920, 1080, 30, src.settings?.duration || 0)
      sync.loop = loop
      
      if (hookAudio) {
        hookAudio(sync.getAudioElement())
      }
      
      this.synchronizers.set(srcId, sync)
    } else {
      if (sync.filePath !== filePath) {
        sync.destroy()
        sync = new FrameSynchronizer(srcId, filePath, 1920, 1080, 30, src.settings?.duration || 0)
        sync.loop = loop
        
        if (hookAudio) {
          hookAudio(sync.getAudioElement())
        }
        
        this.synchronizers.set(srcId, sync)
      } else {
        sync.loop = loop
      }
    }

    return sync
  }

  public static getSynchronizer(srcId: string): FrameSynchronizer | undefined {
    return this.synchronizers.get(srcId)
  }

  public static destroySynchronizer(srcId: string) {
    const sync = this.synchronizers.get(srcId)
    if (sync) {
      sync.destroy()
      this.synchronizers.delete(srcId)
    }
  }

  public static destroyAll() {
    for (const [id, sync] of this.synchronizers.entries()) {
      sync.destroy()
    }
    this.synchronizers.clear()
  }
}

// Trigger HMR
