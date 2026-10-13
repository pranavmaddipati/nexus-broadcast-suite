import * as React from 'react'
import { CanvasRenderer } from '../engine/CanvasRenderer'
import type { CanvasRenderOptions } from '../engine/CanvasRenderer'
import { RenderScheduler } from '../engine/RenderScheduler'
import type { 
  TransitionType, SourceFilter, SceneSource, Scene, SceneCollection, 
  StreamDestination, StreamStatus, RecordingStatus, Macro, MacroAction, MacroTrigger, AudioSettings 
} from '../store/StoreTypes'

declare global {
  interface Window {
    require?: any
  }
}

export type SceneId = string

// Types imported from StoreTypes.ts

export interface DockConfig {
  id: string
  title: string
  visible: boolean
  floating: boolean
  x: number
  y: number
  width: number
  height: number
  dockZone?: 'left' | 'right' | 'top' | 'bottom' | 'center'
  tabGroup?: string // ID of the tab group if tabbed
  order?: number // Order within the zone/tab group
}

export interface LogEvent {
  id: string
  timestamp: number
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
}

export interface ToastNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  autoDismissMs?: number
}

export interface ShortcutConfig {
  id: string
  keys: string[]
  actionId: string
}

export interface DesktopSource {
  id: string
  name: string
}

interface BroadcastContextType {
  [key: string]: any;
  // Sources & Scenes
  desktopSources: DesktopSource[]
  loadDesktopSources: () => Promise<void>
  activeScene: SceneId
  liveScene: SceneId
  
  sceneCollections: SceneCollection[]
  activeCollectionId: string | null
  
  scenes: Scene[]
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>
  pinnedScenes: Scene[]
  
  // Actions
  selectScene: (id: SceneId, multi?: boolean) => void
  takeLive: (targetSceneId?: SceneId) => void
  cutTransition: () => void
  autoTransition: (targetSceneId?: SceneId) => void
  addScene: (name: string) => void
  deleteScene: (id: string) => void
  duplicateScene: (id: string) => void
  togglePinScene: (id: string) => void
  updateSceneOrder: (newScenes: Scene[]) => void
  
  // Scene Sources Actions
  addSourceToScene: (sceneId: SceneId, type: SceneSource['type'], name: string, initialSettings?: any) => string
  deleteSourceFromScene: (sceneId: SceneId, sourceId: string) => void
  reorderSource: (sceneId: SceneId, sourceId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void
  updateSourceProperties: (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => void
  addFilterToSource: (sceneId: SceneId, sourceId: string, filterType: SourceFilter['type']) => void
  deleteFilterFromSource: (sceneId: SceneId, sourceId: string, filterId: string) => void
  duplicateFilterFromSource: (sceneId: SceneId, sourceId: string, filterId: string) => void
  reorderFilter: (sceneId: SceneId, sourceId: string, filterId: string, direction: 'up' | 'down') => void
  updateFilterSettings: (sceneId: SceneId, sourceId: string, filterId: string, settings: any) => void
  
  // Selection
  selectedSourceIds: string[]
  setSelectedSourceIds: (ids: string[]) => void
  toggleSourceSelection: (id: string, multi: boolean) => void
  
  // History
  undo: () => void
  redo: () => void
  pushToUndoStack: (currentScenes: Scene[]) => void
  saveStateForUndo: () => void

  // Clipboard
  clipboardSource: SceneSource | null
  setClipboardSource: (source: SceneSource | null) => void
  clipboardSourceTransform: any | null
  setClipboardSourceTransform: (transform: any | null) => void
  clipboardFilters: SourceFilter[] | null
  setClipboardFilters: (filters: SourceFilter[] | null) => void

  // Streaming & Recording
  isStreaming: boolean
  isRecording: boolean
  virtualCameraActive: boolean
  streamingDuration: number
  recordingDuration: number
  destinations: StreamDestination[]
  updateDestination: (id: string, updates: Partial<StreamDestination>) => void
  startStreaming: () => Promise<void>
  stopStreaming: () => Promise<void>
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  startSingleStream: (id: string) => Promise<void>
  stopSingleStream: (id: string) => Promise<void>
  startAllStreams: () => Promise<void>
  stopAllStreams: () => Promise<void>
  toggleVirtualCamera: () => Promise<void>

  // Audio Mixer parameters
  setChannelVolume: (sourceId: string, vol: number) => void
  toggleChannelMute: (sourceId: string) => void
  updateChannelGain: (sourceId: string, db: number) => void
  updateChannelBalance: (sourceId: string, bal: number) => void
  audioMeterLevels: Record<string, { vu: number; peak: number }>

  // System statistics
  cpuUsage: number
  gpuUsage: number
  ramUsage: number
  gpuMemory: number
  diskUsage: number
  bitrate: number
  droppedFrames: number
  networkSpeed: number

  // Phase 4 additions
  workspacePreset: string
  setWorkspacePreset: (preset: string) => void
  shortcuts: Record<string, ShortcutConfig>
  updateShortcut: (id: string, config: Partial<ShortcutConfig>) => void
  logs: LogEvent[]
  logEvent: (type: LogEvent['type'], message: string) => void
  toasts: ToastNotification[]
  addToast: (type: ToastNotification['type'], message: string, autoDismissMs?: number) => void
  removeToast: (id: string) => void

  // Macros & Automation
  macros: Macro[]
  createMacro: (macro: Omit<Macro, 'id'>) => void
  updateMacro: (id: string, updates: Partial<Macro>) => void
  deleteMacro: (id: string) => void
  executeMacro: (id: string) => void

  // Dock layouts
  docks: DockConfig[]
  setDocks: React.Dispatch<React.SetStateAction<DockConfig[]>>

  // Transition parameters
  transitionType: TransitionType
  setTransitionType: (type: TransitionType) => void
  transitionDuration: number
  setTransitionDuration: (duration: number) => void
  isTransitioning: boolean
  transitionProgress: number
  setTransitionProgress: (prog: number) => void
  prepareManualTransition: () => void
  completeManualTransition: () => void
  cancelManualTransition: () => void

  // Canvas Refs
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>
  programCanvasRef: React.RefObject<HTMLCanvasElement | null>

  // Elements for real-time mini rendering
  videoElements: Record<string, HTMLVideoElement>
  imageElements: Record<string, HTMLImageElement>

  // Settings
  outputSettings: any
  updateOutputSettings: (settings: any) => void
  autoTake: boolean
  setAutoTake: (auto: boolean) => void
  virtualCameraSettings: any
  updateVirtualCameraSettings: (settings: any) => void

  // Overlays, Program Filters and OBS settings
  activeOverlays: Record<number, SceneId | null>
  toggleOverlay: (slot: number, sceneId: SceneId) => void
  duplicateSceneSetting: boolean
  setDuplicateSceneSetting: (val: boolean) => void
  duplicateSourcesSetting: boolean
  setDuplicateSourcesSetting: (val: boolean) => void
  swapScenesAfterTransition: boolean
  setSwapScenesAfterTransition: (val: boolean) => void
  programFilters: SourceFilter[]
  addProgramFilter: (type: SourceFilter['type']) => void
  deleteProgramFilter: (id: string) => void
  updateProgramFilterSettings: (id: string, settings: any) => void
  programResolution: string
  setProgramResolution: (res: string) => void
  ndiEnabled: boolean
  setNdiEnabled: (val: boolean) => void
  ndiName: string
  setNdiName: (name: string) => void
  renderTime: number
  scanDirectoryRecursive: (dirPath: string) => string[]
  mediaPlaylist: string[]
}

const BroadcastContext = React.createContext<BroadcastContextType | undefined>(undefined)

const CANVAS_WIDTH = 1920
const CANVAS_HEIGHT = 1080

export const BroadcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[App Startup] BroadcastProvider initializing');
  const initAudioEngine = () => {};
  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem('nexus_broadcast_state_v4')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed[key] !== undefined) {
          let val = parsed[key]
          if (key === 'scenes' && Array.isArray(val)) {
            val = (val || []).filter((s: any) => s.id && !s.id.endsWith('_live')).map((s: any) => ({
              ...s,
              sources: (s.sources || []).map((src: any) => {
                if (src.settings && src.settings?.filePath) {
                  let path = src.settings?.filePath
                  if (path.includes('commondatastorage.googleapis.com')) {
                    if (path.includes('BigBuckBunny')) {
                      path = 'https://www.w3schools.com/html/mov_bbb.mp4'
                    } else if (path.includes('ForBiggerEscapes') || path.includes('movie')) {
                      path = 'https://www.w3schools.com/html/movie.mp4'
                    } else {
                      path = 'https://www.w3schools.com/html/mov_bbb.mp4'
                    }
                  }
                  return { ...src, settings: { ...src.settings, filePath: path } }
                }
                return src
              })
            }))
          }
          return val
        }
      }
    } catch (e) {
      console.warn(`Failed to read initial state for ${key}:`, e)
    }
    return defaultValue
  }

  const [desktopSources, setDesktopSources] = React.useState<DesktopSource[]>([])
  
  const [scenes, setScenes] = React.useState<Scene[]>(() => {
    let initialScenes = null;
    try {
      if (typeof window.require !== 'undefined') {
        const fs = window.require('fs')
        const path = window.require('path')
        const filePath = path.join(process.cwd(), 'project.json')
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8')
          initialScenes = JSON.parse(fileContent).scenes
        }
      }
    } catch (err) {
      console.warn("Failed to load scenes from project.json", err)
    }

    return initialScenes || getInitialState('scenes', [
        {
          id: 'scene_worship', name: 'Worship', duration: '00:00:00', transitionType: 'fade', pinned: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80',
          sources: [
            { id: 'src_worship_bg', name: 'Worship Background', type: 'media', visible: true, locked: true, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: { filePath: 'background.mp4' }, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false },
            { id: 'src_worship_lyric', name: 'Lower Third - Scripture', type: 'graphics', visible: true, locked: false, x: 100, y: 800, width: 1720, height: 200, opacity: 1.0, settings: {}, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false }
          ]
        },
        {
          id: 'scene_sermon', name: 'Sermon', duration: '00:00:00', transitionType: 'fade', pinned: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1543616991-75a2c125ff5b?auto=format&fit=crop&q=80',
          sources: [
            { id: 'src_sermon_cam1', name: 'Camera 1', type: 'camera', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: { deviceId: 'cam1' }, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false },
            { id: 'src_sermon_lower', name: 'Lower Third - Scripture', type: 'graphics', visible: true, locked: false, x: 100, y: 800, width: 1720, height: 200, opacity: 1.0, settings: {}, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false },
            { id: 'src_sermon_lights', name: 'Stage Lights', type: 'media', visible: false, locked: true, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: {}, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false },
            { id: 'src_sermon_mic', name: 'Audio Input (MIC/Line)', type: 'audio', visible: true, locked: false, x: 0, y: 0, width: 0, height: 0, opacity: 1.0, settings: {}, filters: [], volume: 80, muted: false, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false }
          ]
        },
        {
          id: 'scene_welcome', name: 'Welcome', duration: '00:05:30', transitionType: 'fade', pinned: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&q=80',
          sources: [ { id: 'src_welcome_cam', name: 'Camera 2', type: 'camera', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: {}, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false } ]
        },
        {
          id: 'scene_announcement', name: 'Announcement', duration: '00:03:12', transitionType: 'fade', pinned: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80',
          sources: [ { id: 'src_ann', name: 'Announcements Video', type: 'media', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: {}, filters: [], volume: 80, muted: false, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false } ]
        },
        {
          id: 'scene_offering', name: 'Offering', duration: '00:00:00', transitionType: 'fade', pinned: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80',
          sources: [ { id: 'src_off', name: 'Offering Graphic', type: 'graphics', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: {}, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false } ]
        },
        {
          id: 'scene_closing', name: 'Closing', duration: '00:00:00', transitionType: 'fade', pinned: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&q=80',
          sources: [ { id: 'src_close', name: 'Closing Graphic', type: 'graphics', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: {}, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false } ]
        },
        {
          id: 'scene_social', name: 'Social Media', duration: '00:00:00', transitionType: 'fade', pinned: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80',
          sources: [ { id: 'src_social', name: 'Social Lower Third', type: 'graphics', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, settings: {}, filters: [], volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false } ]
        }
    ])
  })

  React.useEffect(() => {
    try {
      if (typeof window.require !== 'undefined') {
        const fs = window.require('fs')
        const path = window.require('path')
        const filePath = path.join(process.cwd(), 'project.json')
        // Simple debounce could be added here, but direct write is fine for now
        fs.writeFileSync(filePath, JSON.stringify({ scenes }, null, 2), 'utf-8')
      } else {
        localStorage.setItem('nexus_broadcast_state_v4', JSON.stringify({ ...JSON.parse(localStorage.getItem('nexus_broadcast_state_v4') || '{}'), scenes }))
      }
    } catch (err) {
      console.warn("Failed to save scenes to project.json", err)
    }
  }, [scenes])

  const [activeScene, setActiveScene] = React.useState<SceneId>(() => getInitialState('activeScene', 'scene_sermon'))
  const [liveScene, setLiveScene] = React.useState<SceneId>(() => getInitialState('liveScene', 'scene_sermon'))
  const [activeMediaFiles, setActiveMediaFiles] = React.useState<Record<string, string>>({})


  const [clipboardSource, setClipboardSource] = React.useState<SceneSource | null>(null)
  const [clipboardSourceTransform, setClipboardSourceTransform] = React.useState<any | null>(null)
  const [clipboardFilters, setClipboardFilters] = React.useState<SourceFilter[] | null>(null)
  
  const [selectedSourceIds, setSelectedSourceIds] = React.useState<string[]>([])
  const [mediaPlaylist, setMediaPlaylist] = React.useState<string[]>([])

  const toggleSourceSelection = (id: string, multi: boolean) => {
    setSelectedSourceIds(prev => {
      if (multi) {
        if (prev.includes(id)) return prev.filter(x => x !== id)
        return [...prev, id]
      }
      return [id]
    })
  }

  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = React.useState<Scene[][]>([])
  const [redoStack, setRedoStack] = React.useState<Scene[][]>([])

  const saveStateForUndo = () => {
    pushToUndoStack(scenes)
  }

  const pushToUndoStack = (currentScenes: Scene[]) => {
    setUndoStack(prev => {
      const newStack = [...prev, JSON.parse(JSON.stringify(currentScenes))]
      if (newStack.length > 30) newStack.shift() // Limit to 30 states
      return newStack
    })
    setRedoStack([])
  }

  const undo = () => {
    if (undoStack.length === 0) return
    const lastState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(scenes))])
    setScenes(lastState)
    setUndoStack(prev => prev.slice(0, -1))
  }

  const redo = () => {
    if (redoStack.length === 0) return
    const nextState = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(scenes))])
    setScenes(nextState)
    setRedoStack(prev => prev.slice(0, -1))
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Undo/Redo listener
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoStack, redoStack, scenes])
  
  // Streaming & Recording states
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [virtualCameraActive, setVirtualCameraActive] = React.useState(false)
  const [streamingDuration, setStreamingDuration] = React.useState(0)
  const [recordingDuration, setRecordingDuration] = React.useState(0)

  // Settings states
  const [outputSettings, setOutputSettings] = React.useState<any>(() => getInitialState('outputSettings', {
    general: { language: 'en', theme: 'dark', systemTray: true },
    stream: { platform: 'YouTube', server: 'default', streamKey: '' },
    output: { mode: 'simple', videoBitrate: 6000, encoder: 'x264', audioBitrate: 128, recordingPath: '', recordingFormat: 'mp4' },
    audio: { sampleRate: '48khz', channels: 'stereo' },
    video: { baseResolution: '1920x1080', outputResolution: '1920x1080', downscaleFilter: 'bicubic', commonFps: '60' },
    accessibility: { screenReader: false, highContrast: false },
    advanced: { processPriority: 'normal', renderer: 'direct3d11', colorFormat: 'nv12', colorSpace: '709', colorRange: 'partial' }
  }))

  const [virtualCameraSettings, setVirtualCameraSettings] = React.useState<any>(() => getInitialState('virtualCameraSettings', {
    resolution: '1920x1080',
    fps: 60,
    bitrate: 12000,
    source: 'program',
    customSceneId: ''
  }))

  const updateOutputSettings = (settings: any) => {
    setOutputSettings((prev: any) => ({ ...prev, ...settings }))
  }

  const updateVirtualCameraSettings = (settings: any) => {
    setVirtualCameraSettings((prev: any) => ({ ...prev, ...settings }))
  }

  // Overlays, Program Filters and OBS settings states
  const [activeOverlays, setActiveOverlays] = React.useState<Record<number, SceneId | null>>(() => getInitialState('activeOverlays', {
    1: null,
    2: null,
    3: null,
    4: null
  }))
  const [duplicateSceneSetting, setDuplicateSceneSetting] = React.useState<boolean>(() => getInitialState('duplicateSceneSetting', true))
  const [duplicateSourcesSetting, setDuplicateSourcesSetting] = React.useState<boolean>(() => getInitialState('duplicateSourcesSetting', true))
  const [swapScenesAfterTransition, setSwapScenesAfterTransition] = React.useState<boolean>(() => getInitialState('swapScenesAfterTransition', true))
  const [programFilters, setProgramFilters] = React.useState<SourceFilter[]>(() => getInitialState('programFilters', []))
  const [programResolution, setProgramResolution] = React.useState<string>(() => getInitialState('programResolution', '1920x1080'))

  // NDI Out settings
  const [ndiEnabled, setNdiEnabled] = React.useState<boolean>(() => getInitialState('ndiEnabled', false))
  const [ndiName, setNdiName] = React.useState<string>(() => getInitialState('ndiName', 'NexusBroadcast_NDI_Out'))

  // Real-time render performance metrics
  const [renderTime, setRenderTime] = React.useState<number>(1.5)

  // Recorders map for single stream isolation
  const singleStreamRecordersRef = React.useRef<Record<string, MediaRecorder>>({})

  // Virtual Camera dedicated offscreen canvas to avoid chroma-key conflict
  const vcamCanvasRef = React.useRef<HTMLCanvasElement | null>(null)

  const toggleOverlay = (slot: number, sceneId: SceneId) => {
    setActiveOverlays(prev => ({
      ...prev,
      [slot]: prev[slot] === sceneId ? null : sceneId
    }))
  }

  const addProgramFilter = (type: SourceFilter['type']) => {
    const newFilter: SourceFilter = {
      id: `filter_${Date.now()}`,
      type,
      enabled: true,
      settings: {}
    }
    setProgramFilters(prev => [...prev, newFilter])
  }

  const deleteProgramFilter = (id: string) => {
    setProgramFilters(prev => (prev || []).filter(f => f.id !== id))
  }

  const updateProgramFilterSettings = (id: string, settings: any) => {
    setProgramFilters(prev => (prev || []).map(f => f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f))
  }

  const lastChunkRef = React.useRef<ArrayBuffer | null>(null)

  // Destinations configuration (5 channels)
  const [destinations, setDestinations] = React.useState<StreamDestination[]>([
    { id: 'yt', name: 'YouTube', enabled: true, rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2', streamKey: '', platform: 'YouTube', resolution: '1080p60', fps: 60, bitrate: 6000, encoder: 'x264', audioBitrate: 128, reconnectEnabled: true, status: 'disconnected' },
    { id: 'fb', name: 'Facebook', enabled: false, rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/', streamKey: '', platform: 'Facebook Live', resolution: '720p30', fps: 30, bitrate: 3500, encoder: 'x264', audioBitrate: 96, reconnectEnabled: true, status: 'disconnected' },
    { id: 'tw', name: 'Twitch', enabled: false, rtmpUrl: 'rtmp://live.twitch.tv/app/', streamKey: '', platform: 'Twitch', resolution: '1080p60', fps: 60, bitrate: 6000, encoder: 'x264', audioBitrate: 128, reconnectEnabled: true, status: 'disconnected' },
    { id: 'custom', name: 'Custom RTMP', enabled: false, rtmpUrl: '', streamKey: '', platform: 'Custom RTMP', resolution: '1080p60', fps: 60, bitrate: 8000, encoder: 'x264', audioBitrate: 160, reconnectEnabled: true, status: 'disconnected' },
    { id: 'srt_out', name: 'SRT Caller', enabled: false, rtmpUrl: 'srt://127.0.0.1:9000', streamKey: '', platform: 'SRT', resolution: '1080p60', fps: 60, bitrate: 5000, encoder: 'x264', audioBitrate: 128, reconnectEnabled: true, status: 'disconnected' },
    { id: 'ndi_out', name: 'NDI Output', enabled: false, rtmpUrl: 'NDI_Output', streamKey: '', platform: 'NDI', resolution: '1080p60', fps: 60, bitrate: 0, encoder: 'ndi', audioBitrate: 0, reconnectEnabled: true, status: 'disconnected' },
    { id: 'rec', name: 'Recording', enabled: true, rtmpUrl: 'C:/Videos/Recordings', streamKey: '', platform: 'Local File', resolution: '1080p60', fps: 60, bitrate: 15000, encoder: 'nvenc', audioBitrate: 320, reconnectEnabled: false, status: 'disconnected' },
    { id: 'iso', name: 'ISO Recording', enabled: false, rtmpUrl: 'C:/Videos/ISO', streamKey: '', platform: 'ISO Files', resolution: '1080p60', fps: 60, bitrate: 15000, encoder: 'nvenc', audioBitrate: 320, reconnectEnabled: false, status: 'disconnected' },
    { id: 'replay', name: 'Instant Replay', enabled: false, rtmpUrl: 'Memory/Buffer', streamKey: '', platform: 'Replay Buffer', resolution: '1080p60', fps: 60, bitrate: 15000, encoder: 'nvenc', audioBitrate: 320, reconnectEnabled: false, status: 'disconnected' },
    { id: 'cloud', name: 'Cloud Backup', enabled: false, rtmpUrl: 's3://nexus-backup-bucket/', streamKey: '', platform: 'Cloud Storage', resolution: '1080p30', fps: 30, bitrate: 2000, encoder: 'x264', audioBitrate: 128, reconnectEnabled: true, status: 'disconnected' }
  ])

  // Transitions
  const [transitionType, setTransitionType] = React.useState<TransitionType>('fade')
  const [transitionDuration, setTransitionDuration] = React.useState(500)
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [transitionProgress, setTransitionProgress] = React.useState(0)
  const [transitionFromScene, setTransitionFromScene] = React.useState<string | null>(null)
  const [autoTake, setAutoTake] = React.useState<boolean>(false)
  const [videoElements, setVideoElements] = React.useState<Record<string, HTMLVideoElement>>({})
  const [imageElements, setImageElements] = React.useState<Record<string, HTMLImageElement>>({})

  // Real System Stats (linked to IPC)
  const [cpuUsage, setCpuUsage] = React.useState(0)
  const [gpuUsage, setGpuUsage] = React.useState(0)
  const [bitrate, setBitrate] = React.useState(0)
  const [droppedFrames, setDroppedFrames] = React.useState(0)
  const [networkSpeed, setNetworkSpeed] = React.useState(0)

  // Docks Layout Config
  const [docks, setDocks] = React.useState<DockConfig[]>(() => getInitialState('docks', [
    { id: 'production_sequences', title: 'PRODUCTION SEQUENCES', visible: true, floating: false, x: 20, y: 80, width: 220, height: 600, dockZone: 'left', order: 0 },
    { id: 'scene_library', title: 'SCENE LIBRARY', visible: true, floating: false, x: 20, y: 500, width: 250, height: 350, dockZone: 'bottom', order: 0 },
    { id: 'sources_panel', title: 'SOURCES', visible: true, floating: false, x: 290, y: 500, width: 250, height: 350, dockZone: 'bottom', order: 1 },
    { id: 'filters_panel', title: 'FILTERS', visible: true, floating: false, x: 830, y: 500, width: 250, height: 350, dockZone: 'bottom', order: 3 },
    { id: 'properties_panel', title: 'INSPECTOR', visible: true, floating: false, x: 1100, y: 500, width: 250, height: 350, dockZone: 'bottom', order: 4 },
    { id: 'shortcuts', title: 'SHORTCUTS', visible: true, floating: false, x: 1680, y: 400, width: 250, height: 150, dockZone: 'bottom', order: 5 },
    { id: 'smart_tools', title: 'SMART TOOLS', visible: true, floating: false, x: 1680, y: 570, width: 250, height: 150, dockZone: 'bottom', order: 6 },
    { id: 'audio_mixer', title: 'AUDIO MIXER', visible: true, floating: false, x: 1680, y: 80, width: 250, height: 300, dockZone: 'right', order: 0 },
    { id: 'distribution', title: 'DISTRIBUTION', visible: true, floating: false, x: 1680, y: 740, width: 250, height: 150, dockZone: 'right', order: 1 },
    { id: 'activity_log', title: 'ACTIVITY LOG', visible: true, floating: false, x: 1680, y: 800, width: 250, height: 200, dockZone: 'right', order: 2 },
    { id: 'media_library', title: 'MEDIA LIBRARY', visible: false, floating: false, x: 290, y: 500, width: 250, height: 350 },
    { id: 'audio_playlist', title: 'AUDIO PLAYLIST', visible: false, floating: false, x: 560, y: 500, width: 250, height: 350 },
    { id: 'notes', title: 'NOTES', visible: false, floating: false, x: 830, y: 500, width: 250, height: 350 },
    { id: 'live_settings_panel', title: 'LIVE SETTINGS', visible: false, floating: false, x: 1050, y: 500, width: 250, height: 350 },
    { id: 'output_settings_panel', title: 'OUTPUT SETTINGS', visible: false, floating: false, x: 1320, y: 500, width: 250, height: 350 }
  ]))

  // Phase 4 Additions
  const [workspacePreset, _setWorkspacePreset] = React.useState<string>(() => getInitialState('workspacePreset', 'Broadcast'))
  
  const setWorkspacePreset = React.useCallback((preset: string) => {
    _setWorkspacePreset(preset)
    
    // Preset configurations
    let newDocks: DockConfig[] = []
    
    const baseDocks = [
      { id: 'production_sequences', title: 'PRODUCTION SEQUENCES', visible: false, floating: false, x: 20, y: 80, width: 220, height: 600, dockZone: 'left' as const, order: 0 },
      { id: 'scene_library', title: 'SCENE LIBRARY', visible: false, floating: false, x: 20, y: 500, width: 250, height: 350, dockZone: 'bottom' as const, order: 0 },
      { id: 'sources_panel', title: 'SOURCES', visible: false, floating: false, x: 290, y: 500, width: 250, height: 350, dockZone: 'bottom' as const, order: 1 },
      { id: 'filters_panel', title: 'FILTERS', visible: false, floating: false, x: 830, y: 500, width: 250, height: 350, dockZone: 'bottom' as const, order: 3 },
      { id: 'properties_panel', title: 'INSPECTOR', visible: false, floating: false, x: 1100, y: 500, width: 250, height: 350, dockZone: 'bottom' as const, order: 4 },
      { id: 'shortcuts', title: 'SHORTCUTS', visible: false, floating: false, x: 1680, y: 400, width: 250, height: 150, dockZone: 'bottom' as const, order: 5 },
      { id: 'smart_tools', title: 'SMART TOOLS', visible: false, floating: false, x: 1680, y: 570, width: 250, height: 150, dockZone: 'bottom' as const, order: 6 },
      { id: 'audio_mixer', title: 'AUDIO MIXER', visible: false, floating: false, x: 1680, y: 80, width: 250, height: 300, dockZone: 'right' as const, order: 0 },
      { id: 'distribution', title: 'DISTRIBUTION', visible: false, floating: false, x: 1680, y: 740, width: 250, height: 150, dockZone: 'right' as const, order: 1 },
      { id: 'activity_log', title: 'ACTIVITY LOG', visible: false, floating: false, x: 1680, y: 800, width: 250, height: 200, dockZone: 'right' as const, order: 2 },
      { id: 'media_library', title: 'MEDIA LIBRARY', visible: false, floating: false, x: 290, y: 500, width: 250, height: 350, dockZone: 'bottom' as const, order: 7 },
      { id: 'audio_playlist', title: 'AUDIO PLAYLIST', visible: false, floating: false, x: 560, y: 500, width: 250, height: 350, dockZone: 'bottom' as const, order: 8 },
      { id: 'notes', title: 'NOTES', visible: false, floating: false, x: 830, y: 500, width: 250, height: 350, dockZone: 'right' as const, order: 3 },
      { id: 'live_settings_panel', title: 'LIVE SETTINGS', visible: false, floating: false, x: 1050, y: 500, width: 250, height: 350, dockZone: 'right' as const, order: 4 },
      { id: 'output_settings_panel', title: 'OUTPUT SETTINGS', visible: false, floating: false, x: 1320, y: 500, width: 250, height: 350, dockZone: 'right' as const, order: 5 }
    ]

    const setVisible = (ids: string[]) => {
      newDocks = baseDocks.map(d => ({ ...d, visible: ids.includes(d.id) }))
    }

    if (preset === 'Broadcast') {
      setVisible([
        'production_sequences', 'scene_library', 'sources_panel',
        'filters_panel', 'properties_panel', 'smart_tools', 'shortcuts', 
        'audio_mixer', 'distribution', 'activity_log'
      ])
    }
  }, [])

  React.useEffect(() => {
    // Force load the initial preset on startup to overwrite corrupted localStorage docks missing dockZone
    setWorkspacePreset(workspacePreset)
  }, [setWorkspacePreset, workspacePreset])

  const [shortcuts, setShortcuts] = React.useState<Record<string, ShortcutConfig>>(() => getInitialState('shortcuts', {}))
  const [logs, setLogs] = React.useState<LogEvent[]>([])
  const [toasts, setToasts] = React.useState<ToastNotification[]>([])
  
  const [ramUsage, setRamUsage] = React.useState(0)
  const [gpuMemory, setGpuMemory] = React.useState(0)
  const [diskUsage, setDiskUsage] = React.useState(0)

  const updateShortcut = (id: string, config: Partial<ShortcutConfig>) => {
    setShortcuts(prev => ({ ...prev, [id]: { ...prev[id], ...config } }))
  }

  const logEvent = React.useCallback((type: LogEvent['type'], message: string) => {
    setLogs(prev => {
      const newLogs = [...prev, { id: Math.random().toString(), timestamp: Date.now(), type, message }]
      if (newLogs.length > 500) return newLogs.slice(newLogs.length - 500)
      return newLogs
    })
  }, [])

  const addToast = React.useCallback((type: ToastNotification['type'], message: string, autoDismissMs = 3000) => {
    const id = Math.random().toString()
    setToasts(prev => [...prev, { id, type, message, autoDismissMs }])
    if (autoDismissMs > 0) {
      setTimeout(() => removeToast(id), autoDismissMs)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Canvas Refs
  const previewCanvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const programCanvasRef = React.useRef<HTMLCanvasElement | null>(null)
  
  // Media Recorder references
  const streamRecorderRef = React.useRef<MediaRecorder | null>(null)
  const recordingRecorderRef = React.useRef<MediaRecorder | null>(null)
  const vcamRecorderRef = React.useRef<MediaRecorder | null>(null)

  // Background Element registries
  const videoElementsRef = React.useRef<Record<string, HTMLVideoElement>>({})
  // Web Audio Context & Nodes refs
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const programAudioDestRef = React.useRef<MediaStreamAudioDestinationNode | null>(null)
  const sourceAudioNodesRef = React.useRef<Record<string, {
    source: AudioNode
    gainNode: GainNode
    panNode: StereoPannerNode
    analyserNode: AnalyserNode
    delayNode?: DelayNode
    compressorNode?: DynamicsCompressorNode
    compressorNode?: DynamicsCompressorNode
    limiterNode?: DynamicsCompressorNode
    eqLow?: BiquadFilterNode
    eqMid?: BiquadFilterNode
    eqHigh?: BiquadFilterNode
  }>>({})
  const [audioMeterLevels, setAudioMeterLevels] = React.useState<Record<string, { vu: number; peak: number }>>({})

  // Auto-save state to localStorage on modification
  React.useEffect(() => {
    if (scenes.length === 0) return

    const stateToSave = {
      scenes: (scenes || []).filter(s => !s.id.endsWith('_live')).map(s => ({
        ...s,
        sources: (s.sources || []).map(src => ({
          ...src,
          settings: {
            ...src.settings,
            blobUrl: '' // clear temporary blob url
          }
        }))
      })),
      activeScene,
      liveScene,
      activeOverlays,
      duplicateSceneSetting,
      duplicateSourcesSetting,
      swapScenesAfterTransition,
      programFilters,
      programResolution,
      outputSettings,
      virtualCameraSettings,
      docks
    }

    try {
      localStorage.setItem('nexus_broadcast_state_v4', JSON.stringify(stateToSave))
    } catch (e) {
      console.error('Failed to save state to localStorage:', e)
    }
  }, [
    scenes,
    activeScene,
    liveScene,
    activeOverlays,
    duplicateSceneSetting,
    duplicateSourcesSetting,
    swapScenesAfterTransition,
    programFilters,
    programResolution,
    outputSettings,
    virtualCameraSettings,
    ndiEnabled,
    ndiName,
    docks
  ]
)

  // Fetch Electron if available
  const getElectron = () => {
    if (typeof window !== 'undefined' && window.require) {
      return window.require('electron')
    }
    return null
  }

  // Load screen/window list for Display Capture
  const loadDesktopSources = async () => {
    const electron = getElectron()
    if (!electron) return
    try {
      const sourcesList = await electron.ipcRenderer.invoke('get-sources')
      setDesktopSources(sourcesList)
    } catch (e) {
      console.error('Failed to load screen capture list:', e)
    }
  }

  React.useEffect(() => {
    loadDesktopSources()
  }, [])

  // Listen to main process stats updates
  React.useEffect(() => {
    const electron = getElectron()
    if (!electron) return

    const handleStats = (_event: any, stats: any) => {
      setCpuUsage(stats.cpu)
      setGpuUsage(stats.gpu)
      setBitrate(stats.bitrate)
      setDroppedFrames(stats.droppedFrames)
      setNetworkSpeed(stats.networkSpeed)
    }

    electron.ipcRenderer.on('system-stats-update', handleStats)
    return () => {
      electron.ipcRenderer.removeListener('system-stats-update', handleStats)
    }
  }, [])

  // Timers for durations
  React.useEffect(() => {
    let interval: any = null
    if (isStreaming) {
      interval = setInterval(() => setStreamingDuration(d => d + 1), 1000)
    } else {
      setStreamingDuration(0)
    }
    return () => clearInterval(interval)
  }, [isStreaming])

  React.useEffect(() => {
    let interval: any = null
    if (isRecording) {
      interval = setInterval(() => setRecordingDuration(d => d + 1), 1000)
    } else {
      setRecordingDuration(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  React.useEffect(() => {
    const handleGesture = () => {
      initAudioEngine()
    }
    window.addEventListener('click', handleGesture, { once: true })
    window.addEventListener('keydown', handleGesture, { once: true })
    return () => {
      window.removeEventListener('click', handleGesture)
      window.removeEventListener('keydown', handleGesture)
    }
  }, [scenes])

  const hookAudioNodeForVideo = (video: HTMLVideoElement, src: SceneSource) => {
    const ctx = audioContextRef.current
    if (!ctx) return
    if (sourceAudioNodesRef.current[src.id]) return

    try {
      // Unmute so Chrome routes audio properly to Web Audio context
      video.muted = false
      video.volume = 1.0

      const mediaSource = ctx.createMediaElementSource(video)
      const gainNode = ctx.createGain()
      const panNode = ctx.createStereoPanner()
      
      const delayNode = ctx.createDelay(5.0)
      
      const eqLow = ctx.createBiquadFilter()
      eqLow.type = 'lowshelf'
      eqLow.frequency.value = 250
      
      const eqMid = ctx.createBiquadFilter()
      eqMid.type = 'peaking'
      eqMid.frequency.value = 1000
      eqMid.Q.value = 1.0
      
      const eqHigh = ctx.createBiquadFilter()
      eqHigh.type = 'highshelf'
      eqHigh.frequency.value = 4000
      
      const compressorNode = ctx.createDynamicsCompressor()
      
      const limiterNode = ctx.createDynamicsCompressor()
      limiterNode.threshold.value = -1.0
      limiterNode.ratio.value = 20.0
      limiterNode.attack.value = 0.001
      limiterNode.release.value = 0.1

      mediaSource.connect(delayNode)
      delayNode.connect(eqLow)
      eqLow.connect(eqMid)
      eqMid.connect(eqHigh)
      eqHigh.connect(compressorNode)
      compressorNode.connect(limiterNode)
      limiterNode.connect(gainNode)
      gainNode.connect(panNode)
      
      panNode.connect(ctx.destination)
      if (programAudioDestRef.current) {
        panNode.connect(programAudioDestRef.current)
      }

      const analyser = ctx.createAnalyser()
      panNode.connect(analyser)

      sourceAudioNodesRef.current[src.id] = {
        source: mediaSource,
        gainNode,
        panNode,
        analyserNode: analyser,
        delayNode,
        compressorNode
      }
    } catch (err) {
      console.error('Audio node error', err)
    }
  }

  const updateDestination = (id: string, updates: any) => {
    setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, ...updates } : d))
  }

  // Scene CRUD
  const selectScene = (id: SceneId) => {
    initAudioEngine()
    setActiveScene(id)
    if (autoTake) {
      autoTransition(id)
    }
  }

  const addScene = (name: string) => {
    const newId = `scene_${Date.now()}`
    setScenes(prev => [...prev, {
      id: newId,
      name,
      duration: '00:00:00',
      transitionType: 'fade',
      pinned: false,
      sources: []
    }])
  }

  const deleteScene = (id: string) => {
    setScenes(prev => (prev || []).filter(s => s.id !== id && s.id !== `${id}_live`))
    if (activeScene === id) {
      const remainingBaseScenes = (scenes || []).filter(s => s.id !== id && !s.id.endsWith('_live'))
      setActiveScene(remainingBaseScenes[0]?.id || '')
    }
    if (liveScene === id || liveScene === `${id}_live`) {
      const remainingBaseScenes = (scenes || []).filter(s => s.id !== id && !s.id.endsWith('_live'))
      setLiveScene(remainingBaseScenes[0]?.id || '')
    }
  }

  const duplicateScene = (id: string) => {
    const target = (scenes || []).find(s => s.id === id)
    if (!target) return
    const newId = `scene_${Date.now()}`
    setScenes(prev => [...prev, {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      sources: (target.sources || []).map(src => ({ ...src, id: `src_${Date.now()}_${Math.random().toString(36).substr(2, 4)}` }))
    }])
  }

  const togglePinScene = (id: string) => {
    setScenes(prev => (prev || []).map(s => s.id === id ? { ...s, pinned: !s.pinned } : s))
  }

  const updateSceneOrder = (newScenes: Scene[]) => {
    setScenes(newScenes)
  }

  const pinnedScenes = (scenes || []).filter(s => !s.id.endsWith('_live') && s.pinned)

  // Source CRUD inside Scenes
  const addSourceToScene = (sceneId: SceneId, type: SceneSource['type'], name: string, initialSettings?: any): string => {
    const newSource: SceneSource = {
      id: `src_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      type,
      visible: true,
      locked: false,
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      settings: initialSettings || {}
    }
    setScenes(prev => (prev || []).map(s => {
      if (s.id === sceneId || s.id === `${sceneId}_live`) {
        return { ...s, sources: [...(s.sources || []), newSource] }
      }
      return s
    }))
    return newSource.id
  }

  const deleteSourceFromScene = (sceneId: string, sourceId: string) => {
    setScenes(prev => (prev || []).map(s => {
      if (s.id === sceneId || s.id === `${sceneId}_live`) {
        return { ...s, sources: (s.sources || []).filter(src => src.id !== sourceId) }
      }
      return s
    }))
  }

  const reorderSource = (sceneId: string, sourceId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setScenes(prev => (prev || []).map(s => {
      if (s.id === sceneId || s.id === `${sceneId}_live`) {
        const newSources = [...(s.sources || [])]
        const index = newSources.findIndex(src => src.id === sourceId)
        if (index !== -1) {
          const [src] = newSources.splice(index, 1)
          if (direction === 'up') newSources.splice(Math.max(0, index - 1), 0, src)
          else if (direction === 'down') newSources.splice(Math.min(newSources.length, index + 1), 0, src)
          else if (direction === 'top') newSources.unshift(src)
          else if (direction === 'bottom') newSources.push(src)
        }
        return { ...s, sources: newSources }
      }
      return s
    }))
  }

  const updateSourceProperties = (sceneId: string, sourceId: string, updates: Partial<SceneSource>) => {
    setScenes(prev => (prev || []).map(s => {
      if (s.id === sceneId || s.id === `${sceneId}_live`) {
        return { ...s, sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, ...updates } : src) }
      }
      return s
    }))
  }

  const takeLive = (targetSceneId?: string) => {
    if (targetSceneId) setLiveScene(targetSceneId)
    else setLiveScene(activeScene)
  }

  const cutTransition = () => {
    takeLive()
  }

  const autoTransition = (targetSceneId?: string) => {
    takeLive(targetSceneId)
  }

  const addFilterToSource = (sceneId: string, sourceId: string, filterType: string) => {}
  const deleteFilterFromSource = (sceneId: string, sourceId: string, filterId: string) => {}

  const stopStreaming = async () => {
    setIsStreaming(false)
    setDestinations(prev => (prev || []).map(d => ({ ...d, status: 'disconnected' })))
    const electron = getElectron()
    if (electron) {
      await electron.ipcRenderer.invoke('stop-stream')
    }
  }


  const startSingleStream = async (id: string) => {
    const electron = getElectron()
    const dest = (destinations || []).find(d => d.id === id)
    if (!dest) return

    try {
      const canvas = programCanvasRef.current
      if (!canvas) throw new Error('Program output monitor is not ready.')

      // Create a separate stream and recorder for this destination
      const stream = canvas.captureStream(60)
      const mixedStream = new MediaStream()
      mixedStream.addTrack(stream.getVideoTracks()[0])
      
      if (programAudioDestRef.current) {
        const audioTracks = programAudioDestRef.current.stream.getAudioTracks()
        if (audioTracks.length > 0) {
          mixedStream.addTrack(audioTracks[0])
        }
      }

      const recorder = new MediaRecorder(mixedStream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: (dest.bitrate || 6000) * 1000
      })

      let resolveFirstChunk: ((c: ArrayBuffer) => void) | null = null
      const firstChunkPromise = new Promise<ArrayBuffer>(resolve => {
        resolveFirstChunk = resolve
      })

      recorder.ondataavailable = async (e) => {
        if (e.data.size === 0) return
        const buffer = await e.data.arrayBuffer()

        if (resolveFirstChunk) {
          resolveFirstChunk(buffer)
          resolveFirstChunk = null
          return
        }

        if (electron) {
          electron.ipcRenderer.send('stream-chunk-single', { id, chunk: buffer })
        }
      }

      recorder.start(250)
      const firstChunk = await firstChunkPromise
      singleStreamRecordersRef.current[id] = recorder

      // Toggle overall isStreaming to true
      setIsStreaming(true)

      if (electron) {
        setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'connecting' } : d))

        const res = await electron.ipcRenderer.invoke('start-stream-single', {
          id: dest.id,
          rtmpUrl: dest.rtmpUrl,
          streamKey: dest.streamKey,
          bitrate: dest.bitrate,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          fps: 60,
          firstChunk
        })

        if (!res) {
          recorder.stop()
          delete singleStreamRecordersRef.current[id]
          if (Object.keys(singleStreamRecordersRef.current).length === 0) {
            setIsStreaming(false)
          }
          setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'disconnected' } : d))
          return
        }

        setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'streaming' } : d))
      }
    } catch (err) {
      console.error(err)
      alert(`Unable to start stream ${dest.name}: ` + err)
      setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'disconnected' } : d))
    }
  }

  const stopSingleStream = async (id: string) => {
    updateDestination(id, { status: 'disconnected' })
    if (singleStreamRecordersRef.current[id]) {
      singleStreamRecordersRef.current[id].stop()
      delete singleStreamRecordersRef.current[id]
    }

    if (electron) {
      await electron.ipcRenderer.invoke('stop-stream-single', id)
    }

    setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'disconnected' } : d))
  }

  const startAllStreams = async () => {
    const promises = destinations.filter(d => d.enabled).map(d => startSingleStream(d.id))
    await Promise.all(promises)
  }

  const stopAllStreams = async () => {
    const promises = destinations.map(d => stopSingleStream(d.id))
    await Promise.all(promises)
  }

  // Local Recording loop
  const startRecording = async () => {
    try {
      const canvas = programCanvasRef.current
      if (!canvas) throw new Error('Program output monitor is not ready.')

      const stream = canvas.captureStream(60)
      const mixedStream = new MediaStream()
      mixedStream.addTrack(stream.getVideoTracks()[0])

      if (programAudioDestRef.current) {
        const audioTracks = programAudioDestRef.current.stream.getAudioTracks()
        if (audioTracks.length > 0) {
          mixedStream.addTrack(audioTracks[0])
        }
      }

      const recorder = new MediaRecorder(mixedStream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 16000000
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nexus-render-record-${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)
      }

      recorder.start(1000)
      recordingRecorderRef.current = recorder
      setIsRecording(true)
    } catch (e) {
      console.error(e)
      alert('Failed to start recording: ' + e)
    }
  }

  const stopRecording = async () => {
    if (recordingRecorderRef.current) {
      recordingRecorderRef.current.stop()
      recordingRecorderRef.current = null
    }
    setIsRecording(false)
  }

  // Virtual Camera loop
  const toggleVirtualCamera = async () => {
    const electron = getElectron()
    if (!electron) {
      alert('Virtual Camera loopback is available only in the desktop application.')
      return
    }

    if (virtualCameraActive) {
      if (vcamRecorderRef.current) {
        vcamRecorderRef.current.stop()
        vcamRecorderRef.current = null
      }
      await electron.ipcRenderer.invoke('stop-virtual-camera')
      setVirtualCameraActive(false)
    } else {
      try {
        const sourceSelection = virtualCameraSettings.source || 'program'
        let sourceCanvas = programCanvasRef.current
        if (sourceSelection === 'preview') {
          sourceCanvas = previewCanvasRef.current
        } else if (sourceSelection === 'custom') {
          sourceCanvas = vcamCanvasRef.current
        }
        if (!sourceCanvas) throw new Error('Source monitor/canvas not ready.')

        const fpsVal = parseInt(virtualCameraSettings.fps) || 60
        const stream = sourceCanvas.captureStream(fpsVal)
        
        const bitrateVal = (parseInt(virtualCameraSettings.bitrate) || 12000) * 1000
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8',
          videoBitsPerSecond: bitrateVal
        })

        const pendingChunks: ArrayBuffer[] = []
        let ffmpegReady = false
        let resolveFirstChunk: ((c: ArrayBuffer) => void) | null = null

        const firstChunkPromise = new Promise<ArrayBuffer>((resolve) => {
          resolveFirstChunk = resolve
        })

        recorder.ondataavailable = async (e) => {
          if (e.data.size === 0) return
          const buffer = await e.data.arrayBuffer()
          if (resolveFirstChunk) {
            resolveFirstChunk(buffer)
            resolveFirstChunk = null
            return
          }

          if (electron) {
            if (ffmpegReady) {
              electron.ipcRenderer.send('vcam-chunk', buffer)
            } else {
              pendingChunks.push(buffer)
            }
          }
        }

        recorder.start(200)
        const firstChunk = await firstChunkPromise

        // Launch helper processes
        const [wStr, hStr] = (virtualCameraSettings.resolution || '1920x1080').split('x')
        const widthVal = parseInt(wStr) || 1920
        const heightVal = parseInt(hStr) || 1080

        await electron.ipcRenderer.invoke('start-virtual-camera', {
          width: widthVal,
          height: heightVal,
          deviceIndex: 0,
          fps: fpsVal,
          firstChunk
        })

        ffmpegReady = true
        vcamRecorderRef.current = recorder
        setVirtualCameraActive(true)

        // Flush buffered chunks (including EBML header!)
        for (const chunk of pendingChunks) {
          electron.ipcRenderer.send('vcam-chunk', chunk)
        }
      } catch (e) {
        console.error(e)
        alert('Failed to start Virtual Camera: ' + e)
      }
    }
  }

  const isSourceLive = (sourceId: string) => {
    let liveSc = (scenes || []).find(s => s.id === liveScene)
    if (!liveSc && liveScene && liveScene.endsWith('_live')) {
      liveSc = (scenes || []).find(s => s.id === liveScene.replace('_live', ''))
    }
    const cleanId = sourceId.replace('_live', '')
    if (liveSc && (liveSc.sources || []).some(x => x.id === sourceId || x.id.replace('_live', '') === cleanId)) return true
    if (isTransitioning && transitionFromScene) {
      let fromSc = (scenes || []).find(s => s.id === transitionFromScene)
      if (!fromSc && transitionFromScene && transitionFromScene.endsWith('_live')) {
        fromSc = (scenes || []).find(s => s.id === transitionFromScene.replace('_live', ''))
      }
      if (fromSc && (fromSc.sources || []).some(x => x.id === sourceId || x.id.replace('_live', '') === cleanId)) return true
    }
    return false
  }

  // Dynamic Background Resource loading helper
  const getOrCreateVideo = (srcId: string, src: SceneSource) => {
    let video = videoElementsRef.current[srcId]
    const currentPath = src.settings?.blobUrl || src.settings?.filePath
    const currentDeviceId = src.settings?.deviceId || 'default'
    const currentScreenId = src.settings?.screenId || ''
    const currentLoop = src.settings?.loop !== false
    
    // safePlay handles data-play-pending attribute to prevent Chrome/Electron play requests flooding & interrupts
    const safePlay = (vid: HTMLVideoElement) => {
      if (vid.paused && (vid.src || vid.srcObject)) {
        if (vid.getAttribute('data-play-pending')) return
        if (vid.getAttribute('data-play-failed') && vid.readyState < 2) return

        vid.setAttribute('data-play-pending', 'true')
        vid.play()
          .then(() => {
            vid.removeAttribute('data-play-pending')
            vid.removeAttribute('data-play-failed')
          })
          .catch((err) => {
            vid.removeAttribute('data-play-pending')
            if (err.name !== 'AbortError') {
              vid.setAttribute('data-play-failed', 'true')
            }
            console.warn('Play request failed/aborted:', err)
          })
      }
    }

    let needsSourceUpdate = false

    if (!video) {
      video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.loop = currentLoop
      video.crossOrigin = 'anonymous'
      video.preload = 'auto'

      // Append to hidden DOM container to prevent Chromium from throttling/suspending video decoding
      let hiddenContainer = document.getElementById('hidden-media-container')
      if (!hiddenContainer) {
        hiddenContainer = document.createElement('div')
        hiddenContainer.id = 'hidden-media-container'
        hiddenContainer.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 1px; height: 1px; opacity: 0.001; overflow: hidden; pointer-events: none; z-index: -9999;')
        document.body.appendChild(hiddenContainer)
      }
      hiddenContainer.appendChild(video)

      // Hook Web Audio element source if engine is already running
      hookAudioNodeForVideo(video, src)

      needsSourceUpdate = true
      videoElementsRef.current[srcId] = video
      setTimeout(() => setVideoElements(prev => ({ ...prev, [srcId]: video })), 0)
    } else {
      // Check if any source settings changed (normalize to string to avoid mismatch on null/undefined)
      const activePath = video.getAttribute('data-active-path') || ''
      const activeDeviceId = video.getAttribute('data-active-device-id') || ''
      const activeScreenId = video.getAttribute('data-active-screen-id') || ''
      const activeLoop = video.loop
      const activeCaptureCursor = video.getAttribute('data-active-capture-cursor') !== 'false'

      const normPath = currentPath || ''
      const normDeviceId = currentDeviceId || ''
      const normScreenId = currentScreenId || ''
      const currentCaptureCursor = src.settings?.captureCursor !== false

      if (activePath !== normPath || 
          activeDeviceId !== normDeviceId || 
          activeScreenId !== normScreenId ||
          activeLoop !== currentLoop ||
          activeCaptureCursor !== currentCaptureCursor) {
        needsSourceUpdate = true
        console.log(`[SourceUpdate] Mismatch on source ${srcId} (${src.name}):`, {
          activePath, normPath,
          activeDeviceId, normDeviceId,
          activeScreenId, normScreenId,
          activeLoop, currentLoop,
          activeCaptureCursor, currentCaptureCursor
        })
      }
    }

    if (needsSourceUpdate) {
      // Clean up previous srcObject track resources (turns off camera/screen share lights!)
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        video.srcObject = null
      }

      video.removeAttribute('data-play-failed')
      video.loop = currentLoop
      video.setAttribute('data-active-path', currentPath || '')
      video.setAttribute('data-active-device-id', currentDeviceId || '')
      video.setAttribute('data-active-screen-id', currentScreenId || '')
      video.setAttribute('data-active-capture-cursor', (src.settings?.captureCursor !== false) ? 'true' : 'false')

      if (src.type === 'media' || src.type === 'video') {
        if (currentPath) {
          let resolvedPath = currentPath
          if (/^[a-zA-Z]:/.test(currentPath) || currentPath.startsWith('/') || currentPath.includes('\\') || currentPath.startsWith('file:')) {
            const cleanPath = currentPath.replace(/^file:\/+/i, '').replace(/\\/g, '/')
            resolvedPath = 'file:///' + cleanPath
          }
          video.src = resolvedPath
          video.load()
        }
      } else if (src.type === 'ndi') {
        const path = currentPath || 'https://www.w3schools.com/html/mov_bbb.mp4'
        video.src = path
        video.load()
      } else if (src.type === 'camera') {
        const pvwId = srcId.replace('_live', '')
        const pvwVideo = videoElementsRef.current[pvwId]
        if (srcId.endsWith('_live') && pvwVideo && pvwVideo.srcObject) {
          video.srcObject = pvwVideo.srcObject
          if (!src.settings?.paused) safePlay(video)
        } else {
          const constraints = {
            video: currentDeviceId !== 'default' ? { deviceId: { exact: currentDeviceId } } : true,
            audio: false // Fix: Only video capture device, do not capture audio to avoid failures on camera initialization
          }
          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            video.srcObject = stream
            if (!src.settings?.paused) safePlay(video)
          }).catch(err => {
            console.error('Camera access failed:', err)
          })
        }
      } else if (src.type === 'audio') {
        const pvwId = srcId.replace('_live', '')
        const pvwVideo = videoElementsRef.current[pvwId]
        if (srcId.endsWith('_live') && pvwVideo && pvwVideo.srcObject) {
          video.srcObject = pvwVideo.srcObject
          if (!src.settings?.paused) safePlay(video)
        } else {
          const constraints = {
            audio: currentDeviceId !== 'default' ? { deviceId: { exact: currentDeviceId } } : true
          }
          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            video.srcObject = stream
            if (!src.settings?.paused) safePlay(video)
          }).catch(err => {
            console.error('Audio capture failed:', err)
          })
        }
      } else if (src.type === 'display_capture' || src.type === 'window_capture') {
        const electron = getElectron()
        const currentCaptureCursor = src.settings?.captureCursor !== false
        const pvwId = srcId.replace('_live', '')
        const pvwVideo = videoElementsRef.current[pvwId]

        if (srcId.endsWith('_live') && pvwVideo && pvwVideo.srcObject) {
          video.srcObject = pvwVideo.srcObject
          if (!src.settings?.paused) safePlay(video)
        } else if (electron && currentScreenId) {
          electron.ipcRenderer.send('set-next-screen-id', currentScreenId)
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: currentScreenId,
              }
            } as any
          }).then(stream => {
            video.srcObject = stream
            if (!src.settings?.paused) safePlay(video)
          }).catch((err: any) => console.error('Screen capture failed:', err))
        } else {
          // Standard browser getDisplayMedia fallback!
          navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: currentCaptureCursor ? 'always' : 'never'
            } as any,
            audio: false
          }).then(stream => {
            video.srcObject = stream
            if (!src.settings?.paused) safePlay(video)
          }).catch(err => {
            console.error('getDisplayMedia failed:', err)
          })
        }
      }
    }

    // Play/Pause control state handling
    const isLive = isSourceLive(src.id)
    const isPlayableType = ['media', 'video', 'ndi'].includes(src.type)
    
    let shouldPlay = true
    if (src.settings?.paused === true) {
      shouldPlay = false
    } else if (src.settings?.paused === false) {
      shouldPlay = true
    } else {
      // Default auto-cue: play live files, keep preview/non-live files cued (paused)
      shouldPlay = !isPlayableType || isLive
    }

    if (shouldPlay) {
      const activePaused = video.getAttribute('data-active-paused') === 'true'
      const currentPaused = src.settings?.paused === true
      if (activePaused !== currentPaused) {
        video.setAttribute('data-active-paused', currentPaused ? 'true' : 'false')
        video.removeAttribute('data-play-failed')
      }
      safePlay(video)
    } else {
      const activePaused = video.getAttribute('data-active-paused') === 'true'
      const currentPaused = src.settings?.paused === true
      if (activePaused !== currentPaused) {
        video.setAttribute('data-active-paused', currentPaused ? 'true' : 'false')
      }
      if (!video.paused) video.pause()
    }

    // Dynamically apply playback speed
    if (isPlayableType) {
      const targetSpeed = src.settings?.playbackSpeed || 1.0
      if (video.playbackRate !== targetSpeed) {
        video.playbackRate = targetSpeed
      }
    }

    return video
  }

  const getOrCreateImage = (srcId: string, path: string) => {
    let img = imageElementsRef.current[srcId]
    let created = false
    if (!img) {
      img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = path
      imageElementsRef.current[srcId] = img
      created = true
    } else if (img.getAttribute('data-active-path') !== path) {
      img.src = path
      created = true
    }
    img.setAttribute('data-active-path', path)
    if (created) {
      setTimeout(() => setImageElements(prev => ({ ...prev, [srcId]: img })), 0)
    }
    return img
  }

  // Scanner helper for directory scanning
  const scanDirectoryRecursive = (dirPath: string): string[] => {
    const fs = window.require ? window.require('fs') : null
    const path = window.require ? window.require('path') : null
    if (!fs || !path) return []
    let files: string[] = []
    try {
      const entries = fs.readdirSync(dirPath)
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          files = files.concat(scanDirectoryRecursive(fullPath))
        } else {
          files.push(fullPath)
        }
      }
    } catch (e) {
      console.error("Error reading dir:", e)
    }
    return files
  }

  // Main Compositor loop
  React.useEffect(() => {
    RenderScheduler.start((time) => {
      const pCanvas = programCanvasRef.current
      const pCtx = pCanvas?.getContext('2d')
      const prCanvas = previewCanvasRef.current
      const prCtx = prCanvas?.getContext('2d')
      const vCanvas = vcamCanvasRef.current
      const vCtx = vCanvas?.getContext('2d')

      const activeSc = (scenes || []).find(s => s.id === activeScene)
      let liveSc = (scenes || []).find(s => s.id === liveScene)
      if (!liveSc && liveScene && typeof liveScene === 'string' && liveScene.endsWith('_live')) {
        liveSc = (scenes || []).find(s => s.id === liveScene.replace('_live', ''))
      }
      let fromSc = (scenes || []).find(s => s.id === transitionFromScene)
      if (!fromSc && transitionFromScene && typeof transitionFromScene === 'string' && transitionFromScene.endsWith('_live')) {
        fromSc = (scenes || []).find(s => s.id === transitionFromScene.replace('_live', ''))
      }

      const opts: CanvasRenderOptions = {
        time,
        canvasW: CANVAS_WIDTH,
        canvasH: CANVAS_HEIGHT,
        activeScene: activeSc,
        liveScene: liveSc,
        transitionFromScene: fromSc,
        isTransitioning,
        transitionProgress,
        transitionType,
        programFilters
      }

      CanvasRenderer.render(prCtx, pCtx, vCtx, opts, scenes, virtualCameraSettings, activeOverlays)
    })

    return () => {
      RenderScheduler.stop()
    }
  }, [scenes, activeScene, liveScene, isTransitioning, transitionProgress, transitionType, virtualCameraSettings, activeOverlays, programFilters])

  const startStreaming = async () => {
    setIsStreaming(true)
    setDestinations(prev => (prev || []).map(d => ({ ...d, status: 'connected' })))
    const electron = getElectron()
    if (electron) {
      await electron.ipcRenderer.invoke('start-stream')
    }
  }

  const setChannelVolume = (sourceId: string, vol: number) => {
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, volume: vol } : src)
    })))
  }

  const toggleChannelMute = (sourceId: string) => {
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, muted: !src.muted } : src)
    })))
  }

  const updateChannelGain = (sourceId: string, db: number) => {
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, audioGain: db } : src)
    })))
  }

  const updateChannelBalance = (sourceId: string, bal: number) => {
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, balance: bal } : src)
    })))
  }

  const prepareManualTransition = () => {
    if (!liveScene || !activeScene) return
    setIsTransitioning(true)
    setTransitionProgress(0)
    setTransitionFromScene(liveScene)
  }

  const completeManualTransition = (targetSceneId?: string) => {
    setIsTransitioning(false)
    setTransitionProgress(100)
    if (targetSceneId) {
      setLiveScene(targetSceneId)
    } else {
      setLiveScene(activeScene)
    }
  }

  const cancelManualTransition = () => {
    setIsTransitioning(false)
    setTransitionProgress(0)
    if (transitionFromScene) {
      setLiveScene(transitionFromScene)
    }
  }

  const duplicateFilterFromSource = (sceneId: string, sourceId: string, filterId: string) => {}
  const reorderFilter = (sceneId: string, sourceId: string, filterId: string, direction: 'up' | 'down') => {}
  const updateFilterSettings = (sceneId: string, sourceId: string, filterId: string, settings: any) => {}

  return (
    <BroadcastContext.Provider
      value={{
        desktopSources,
        loadDesktopSources,
        activeScene,
        liveScene,
        scenes,
        setScenes,
        pinnedScenes,
        selectScene,
        takeLive,
        cutTransition,
        autoTransition,
        addScene,
        deleteScene,
        duplicateScene,
        togglePinScene,
        updateSceneOrder,
        addSourceToScene,
        deleteSourceFromScene,
        reorderSource,
        updateSourceProperties,
        addFilterToSource,
        deleteFilterFromSource,
        duplicateFilterFromSource,
        reorderFilter,
        updateFilterSettings,

        setClipboardSource,
        clipboardSourceTransform,
        setClipboardSourceTransform,
        clipboardFilters,
        setClipboardFilters,
        mediaPlaylist,
        isStreaming,
        isRecording,
        virtualCameraActive,
        streamingDuration,
        recordingDuration,
        destinations,

        updateDestination,
        startStreaming,
        stopStreaming,
        startRecording,
        stopRecording,
        startSingleStream,
        stopSingleStream,
        startAllStreams,
        stopAllStreams,
        toggleVirtualCamera,
        setChannelVolume,
        toggleChannelMute,
        updateChannelGain,
        updateChannelBalance,
        audioMeterLevels,
        cpuUsage,
        gpuUsage,
        ramUsage,
        gpuMemory,
        diskUsage,
        bitrate,
        droppedFrames,
        networkSpeed,
        
        // Phase 4 Additions
        workspacePreset,
        setWorkspacePreset,
        shortcuts,
        updateShortcut,
        logs,
        logEvent,
        toasts,
        addToast,
        removeToast,
        docks,
        setDocks,
        transitionType,
        setTransitionType,
        transitionDuration,
        setTransitionDuration,
        isTransitioning,
        transitionProgress,
        setTransitionProgress,
        prepareManualTransition,
        completeManualTransition,
        cancelManualTransition,
        previewCanvasRef,
        programCanvasRef,
        videoElements,
        imageElements,
        outputSettings,
        updateOutputSettings,
        autoTake,
        setAutoTake,
        virtualCameraSettings,
        updateVirtualCameraSettings,
        activeOverlays,
        toggleOverlay,
        duplicateSceneSetting,
        setDuplicateSceneSetting,
        duplicateSourcesSetting,
        setDuplicateSourcesSetting,
        swapScenesAfterTransition,
        setSwapScenesAfterTransition,
        programFilters,
        addProgramFilter,
        deleteProgramFilter,
        updateProgramFilterSettings,
        programResolution,
        setProgramResolution,
        ndiEnabled,
        setNdiEnabled,
        ndiName,
        setNdiName,
        renderTime,
        scanDirectoryRecursive,
        selectedSourceIds,
        setSelectedSourceIds,
        toggleSourceSelection,
        
        undo,
        redo,
        pushToUndoStack,
        saveStateForUndo
      }}
    >
      {children}
    </BroadcastContext.Provider>
  )
}

export const useBroadcast = () => {
  const context = React.useContext(BroadcastContext)
  
  const safeContext = context || ({} as BroadcastContextType)

  return new Proxy(safeContext, {
    get: (target, prop) => {
      if (prop in target && target[prop as keyof typeof target] !== undefined) {
        return target[prop as keyof typeof target]
      }
      // Defensive fallbacks for any missing state
      if (typeof prop === 'string') {
        if (['scenes', 'docks', 'desktopSources', 'pinnedScenes', 'destinations', 'programFilters', 'smartTools'].includes(prop)) return []
        if (prop.startsWith('set') || prop.startsWith('update') || prop.startsWith('toggle') || prop.startsWith('add') || prop.startsWith('delete')) {
          return () => {}
        }
        if (['isStreaming', 'isRecording', 'virtualCameraActive', 'isTransitioning', 'duplicateSceneSetting', 'duplicateSourcesSetting', 'swapScenesAfterTransition', 'ndiEnabled'].includes(prop)) return false
        if (['streamingDuration', 'recordingDuration', 'cpuUsage', 'gpuUsage', 'bitrate', 'droppedFrames', 'networkSpeed', 'transitionDuration', 'transitionProgress', 'renderTime'].includes(prop)) return 0
        if (['ndiName'].includes(prop)) return null
        if (['selectedSourceIds', 'clipboardFilters'].includes(prop)) return []
        if (['clipboardSource'].includes(prop)) return null
        if (['activeScene', 'liveScene'].includes(prop)) return ''
        if (prop.endsWith('Elements') || prop.endsWith('Levels') || prop.endsWith('Overlays') || prop.endsWith('Settings')) return {}
      }
      return undefined
    }
  }) as BroadcastContextType
}
