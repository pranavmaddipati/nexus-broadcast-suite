export interface MediaMetadata {
  blobUrl: string
  width?: number
  height?: number
  duration?: number
  fps?: number
  type: 'image' | 'video' | 'audio'
}

export class MediaLoader {
  /**
   * Spawns a hidden file input to let the user select a file.
   */
  static async selectFile(accept: string = '*/*'): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = accept
      input.style.display = 'none'
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        resolve(file || null)
        document.body.removeChild(input)
      }
      
      input.oncancel = () => {
        resolve(null)
        document.body.removeChild(input)
      }

      document.body.appendChild(input)
      input.click()
    })
  }

  /**
   * Loads a media file into a Blob URL and parses its intrinsic dimensions and duration
   */
  static async loadMetadata(file: File): Promise<MediaMetadata> {
    const hasPath = (file as any).path
    const blobUrl = hasPath ? `file:///${hasPath.replace(/\\/g, '/')}` : URL.createObjectURL(file)
    const type = file.type.startsWith('image/') ? 'image' 
               : file.type.startsWith('video/') ? 'video' 
               : 'audio'

    if (type === 'image') {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve({ blobUrl, width: img.naturalWidth, height: img.naturalHeight, type })
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = blobUrl
      })
    } 
    
    if (type === 'video') {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.onloadedmetadata = () => {
          resolve({ 
            blobUrl, 
            width: video.videoWidth, 
            height: video.videoHeight, 
            duration: video.duration,
            type 
          })
        }
        video.onerror = () => reject(new Error('Failed to load video metadata'))
        video.src = blobUrl
      })
    }

    if (type === 'audio') {
      return new Promise((resolve, reject) => {
        const audio = document.createElement('audio')
        audio.onloadedmetadata = () => {
          resolve({ blobUrl, duration: audio.duration, type })
        }
        audio.onerror = () => reject(new Error('Failed to load audio metadata'))
        audio.src = blobUrl
      })
    }

    throw new Error('Unsupported media type')
  }
}
