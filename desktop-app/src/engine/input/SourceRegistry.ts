import type { SceneSource } from '../../store/StoreTypes'
import React from 'react'

export type SourceCategory = 'Video' | 'Capture' | 'Audio' | 'Graphics' | 'Network' | 'Utility'

export interface SourceDefinition {
  type: SceneSource['type']
  name: string
  description: string
  category: SourceCategory
  icon: string 
  defaultDimensions: { width: number, height: number }
  defaultSettings: Record<string, any>
}

export const SOURCE_REGISTRY: Record<string, SourceDefinition> = {
  camera: {
    type: 'camera',
    name: 'Video Capture Device',
    description: 'Capture from a webcam, capture card, or virtual camera.',
    category: 'Video',
    icon: 'Video',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { deviceId: 'default', resolution: '1920x1080', fps: 30 }
  },
  display_capture: {
    type: 'display_capture',
    name: 'Display Capture',
    description: 'Capture an entire monitor or display.',
    category: 'Capture',
    icon: 'Monitor',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { screenId: '', captureCursor: true, hdr: false }
  },
  window_capture: {
    type: 'window_capture',
    name: 'Window Capture',
    description: 'Capture a specific application window.',
    category: 'Capture',
    icon: 'AppWindow',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { windowId: '', matchPriority: 'title', captureMethod: 'automatic', captureCursor: true }
  },
  game_capture: {
    type: 'game_capture',
    name: 'Game Capture',
    description: 'Capture full-screen 3D games efficiently.',
    category: 'Capture',
    icon: 'MonitorPlay',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { mode: 'any_fullscreen', captureCursor: true, hookRate: 'normal' }
  },
  media: {
    type: 'media',
    name: 'Media Source',
    description: 'Play a local video or audio file (MP4, MP3, WAV, MKV, etc).',
    category: 'Video',
    icon: 'Film',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { filePath: '', loop: false, restartOnActivate: true, hardwareDecode: true }
  },
  image: {
    type: 'image',
    name: 'Image',
    description: 'Display a static image (PNG, JPG, BMP, GIF, WEBP).',
    category: 'Video',
    icon: 'Image',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { filePath: '' }
  },
  slideshow: {
    type: 'slideshow',
    name: 'Image Slideshow',
    description: 'Cycle through a folder of images automatically.',
    category: 'Video',
    icon: 'ImagePlus',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { slideUrls: [], slideIndex: 0, transition: 'fade', slideTimeMs: 5000 }
  },
  audio: {
    type: 'audio',
    name: 'Audio Input Capture',
    description: 'Capture audio from a microphone or line-in device.',
    category: 'Audio',
    icon: 'Mic',
    defaultDimensions: { width: 200, height: 60 },
    defaultSettings: { deviceId: 'default' }
  },
  browser: {
    type: 'browser',
    name: 'Browser Source',
    description: 'Render a webpage, local HTML file, or web overlay.',
    category: 'Video',
    icon: 'Globe',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { url: 'https://google.com', fps: 30, customCss: 'body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }' }
  },
  color_source: {
    type: 'color_source',
    name: 'Color Source',
    description: 'A solid color block.',
    category: 'Graphics',
    icon: 'Palette',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { backgroundColor: '#1e293b' }
  },
  text: {
    type: 'text',
    name: 'Text (GDI+)',
    description: 'Render text dynamically with custom fonts and styling.',
    category: 'Graphics',
    icon: 'Type',
    defaultDimensions: { width: 400, height: 100 },
    defaultSettings: { textContent: 'Text Source', textColor: '#ffffff', textSize: 48, font: 'Inter' }
  },
  ndi: {
    type: 'ndi',
    name: 'NDI Source',
    description: 'Receive Network Device Interface streams.',
    category: 'Network',
    icon: 'Radio',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { ndiName: '', bandwidth: 'highest', sync: 'internal' }
  },
  rtmp_source: {
    type: 'rtmp_source',
    name: 'RTMP Stream',
    description: 'Receive an incoming RTMP video stream.',
    category: 'Network',
    icon: 'Radio',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { url: 'rtmp://', bufferMs: 2000 }
  },
  vlc_source: {
    type: 'vlc_source',
    name: 'VLC Video Source',
    description: 'Play complex media formats or network streams using VLC.',
    category: 'Video',
    icon: 'PlaySquare',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { playlist: [], loop: true, hardwareDecode: true }
  },
  media_playlist: {
    type: 'media_playlist',
    name: 'Media Playlist',
    description: 'Queue and play multiple video files sequentially.',
    category: 'Video',
    icon: 'PlaySquare',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: { files: [], loop: true }
  },
  group: {
    type: 'group',
    name: 'Group',
    description: 'Group multiple sources together.',
    category: 'Utility',
    icon: 'Settings',
    defaultDimensions: { width: 1920, height: 1080 },
    defaultSettings: {}
  }
}

export class SourceRegistry {
  static getAll(): SourceDefinition[] {
    return Object.values(SOURCE_REGISTRY)
  }

  static get(type: SceneSource['type']): SourceDefinition | undefined {
    return SOURCE_REGISTRY[type]
  }

  static getByCategory(): Record<SourceCategory, SourceDefinition[]> {
    const res: Record<SourceCategory, SourceDefinition[]> = {
      Video: [], Capture: [], Audio: [], Graphics: [], Network: [], Utility: []
    }
    Object.values(SOURCE_REGISTRY).forEach(def => {
      res[def.category].push(def)
    })
    return res
  }
}
