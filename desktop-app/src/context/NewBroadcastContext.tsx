import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { CanvasRenderer } from '../engine/CanvasRenderer'
import type { CanvasRenderOptions } from '../engine/CanvasRenderer'
import { RenderScheduler } from '../engine/RenderScheduler'
import { SourceRegistry } from '../engine/input/SourceRegistry'
import { TextureManager } from '../engine/TextureManager'
import { MediaManager } from '../engine/MediaManager'
import { AudioEngine } from '../engine/audio/AudioEngine'
import type { AudioMeterData, AudioBusRoute } from '../engine/audio/AudioEngine'
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
export type { Scene, SceneSource, SourceFilter, TransitionType, StreamDestination } from '../store/StoreTypes'
export type { SourceFilter as Filter } from '../store/StoreTypes'

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
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
  loadMediaDevices: () => Promise<void>
  openMediaFileDialog: (options?: { type?: 'image' | 'video' | 'media' | 'all'; title?: string }) => Promise<{ canceled: boolean; filePath?: string }>
  activeScene: SceneId
  liveScene: SceneId
  
  sceneCollections?: SceneCollection[]
  activeCollectionId?: string | null
  
  scenes: Scene[]
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>
  pinnedScenes: Scene[]
  
  // Actions
  selectScene: (id: SceneId, multi?: boolean) => void
  takeLive: (targetSceneId?: SceneId) => void
  cutTransition: () => void
  autoTransition: (targetSceneId?: SceneId) => void
  addScene: (name: string) => void
  renameScene: (id: string, name: string) => void
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
  clipboardSource?: SceneSource | null
  setClipboardSource: (source: SceneSource | null) => void
  clipboardSourceTransform: any | null
  setClipboardSourceTransform: (transform: any | null) => void
  clipboardFilters: SourceFilter[] | null
  setClipboardFilters: (filters: SourceFilter[] | null) => void

  // Streaming & Recording
  isStreaming: boolean
  isRecording: boolean
  isRecordingPaused: boolean
  virtualCameraActive: boolean
  streamingDuration: number
  recordingDuration: number
  destinations: StreamDestination[]
  updateDestination: (id: string, updates: Partial<StreamDestination>) => void
  startStreaming: () => Promise<void>
  stopStreaming: () => Promise<void>
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  pauseRecording: () => void
  startSingleStream: (id: string) => Promise<void>
  stopSingleStream: (id: string) => Promise<void>
  startAllStreams: () => Promise<void>
  stopAllStreams: () => Promise<void>
  toggleVirtualCamera: () => Promise<void>

  // Audio Mixer parameters
  setChannelVolume: (sourceId: string, vol: number) => void
  toggleChannelMute: (sourceId: string) => void
  setChannelMute: (sourceId: string, muted: boolean) => void
  toggleChannelSolo: (sourceId: string) => void
  setChannelSolo: (sourceId: string, solo: boolean) => void
  updateChannelGain: (sourceId: string, db: number) => void
  updateChannelBalance: (sourceId: string, bal: number) => void
  updateChannelRoute: (sourceId: string, route: AudioBusRoute) => void
  setChannelMonitor: (sourceId: string, enabled: boolean) => void
  masterVolume: number
  setMasterVolume: (vol: number) => void
  masterMuted: boolean
  setMasterMute: (muted: boolean) => void
  toggleMasterMute: () => void
  audioMeterLevels: Record<string, AudioMeterData>

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
  macros?: Macro[]
  createMacro?: (macro: Omit<Macro, 'id'>) => void
  updateMacro?: (id: string, updates: Partial<Macro>) => void
  deleteMacro?: (id: string) => void
  executeMacro?: (id: string) => void

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

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined)

const CANVAS_WIDTH = 1920
const CANVAS_HEIGHT = 1080

export const BroadcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initAudioEngine = () => {
    try {
      AudioEngine.getInstance().ensureContext()
    } catch (e) {
      console.warn('[BroadcastContext] Failed to initialize AudioEngine:', e)
    }
  }
  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem('nexus_broadcast_state_v4')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed[key] !== undefined) {
          let val = parsed[key]
          if (key === 'scenes' && Array.isArray(val)) {
            const isLegacySaved = val.some((s) => s.id === 'scene_worship' || s.id === 'scene_sermon' || (s.id && s.id.includes('jk')));
            if (isLegacySaved) return defaultValue;
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
          if (key === 'activeScene' && (val === 'scene_sermon' || val === 'scene_worship' || (val && val.includes('jk')))) return 'scene_main_news';
          if (key === 'liveScene' && (val === 'scene_sermon' || val === 'scene_worship' || (val && val.includes('jk')))) return 'scene_opening_montage';
          return val
        }
      }
    } catch (e) {
      console.warn(`Failed to read initial state for ${key}:`, e)
    }
    return defaultValue
  }

  const [desktopSources, setDesktopSources] = useState<DesktopSource[]>([])
  
  const [scenes, setScenes] = useState<Scene[]>(() => {
    return getInitialState('scenes', [
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
  const scenesRef = useRef<Scene[]>(scenes)
  scenesRef.current = scenes

  const [activeScene, setActiveScene] = useState<SceneId>(() => getInitialState('activeScene', 'scene_main_news'))
  const [liveScene, setLiveScene] = useState<SceneId>(() => getInitialState('liveScene', 'scene_opening_montage'))

  const isProjectLoadedRef = useRef(false)
  const recentToastsRef = useRef<Map<string, number>>(new Map())
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])

  const loadMediaDevices = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices()
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'))
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'))
      }
    } catch (err: any) {
      console.warn('[BroadcastContext] Failed to enumerate media devices:', err)
    }
  }, [])

  const openMediaFileDialog = useCallback(async (options?: { type?: 'image' | 'video' | 'media' | 'all'; title?: string }) => {
    try {
      if (window.nexusAPI?.openFileDialog) {
        return await window.nexusAPI.openFileDialog(options)
      }
    } catch (err: any) {
      console.warn('[BroadcastContext] Open file dialog error:', err)
    }
    return { canceled: true }
  }, [])

  useEffect(() => {
    loadDesktopSources()
    loadMediaDevices()
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener?.('devicechange', loadMediaDevices)
      return () => {
        navigator.mediaDevices.removeEventListener?.('devicechange', loadMediaDevices)
      }
    }
  }, [loadMediaDevices])

  const logEvent = useCallback((type: LogEvent['type'], message: string) => {
    setLogs(prev => {
      const newLogs = [...prev, { id: Math.random().toString(), timestamp: Date.now(), type, message }]
      if (newLogs.length > 500) return newLogs.slice(newLogs.length - 500)
      return newLogs
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastNotification['type'], message: string, autoDismissMs = 4000) => {
    if (!message) return
    const key = `${type}:${message}`
    const now = Date.now()
    const last = recentToastsRef.current.get(key)
    if (last && now - last < 1500) return
    recentToastsRef.current.set(key, now)

    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev.slice(-4), { id, type, message, autoDismissMs }])
    if (autoDismissMs > 0 && typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, autoDismissMs)
    }
  }, [])

  // Load project on mount via secure Electron bridge or web fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && window.nexusAPI?.loadProject) {
      window.nexusAPI.loadProject()
        .then(result => {
          if (result && result.success && result.data && Array.isArray(result.data.scenes) && result.data.scenes.length > 0) {
            setScenes(result.data.scenes)
            if (result.data.activeScene) setActiveScene(result.data.activeScene)
            if (result.data.liveScene) setLiveScene(result.data.liveScene)
            if (result.recoveredFromBackup) {
              addToast('warning', 'Project state recovered from emergency backup.')
            }
          } else if (result && !result.success && result.error) {
            addToast('error', `Project load notice: ${result.error}`)
          }
        })
        .catch(err => {
          console.warn('[BroadcastContext] Failed to load project via nexusAPI:', err)
          addToast('error', 'Unable to load project from disk.')
        })
        .finally(() => {
          isProjectLoadedRef.current = true
        })
    } else if (typeof fetch !== 'undefined') {
      fetch('/project.json')
        .then(r => r.json())
        .then(data => {
          if (data && Array.isArray(data.scenes) && data.scenes.length >= 8) {
            setScenes(current => {
              const hasLegacy = current.some(s => s.id === 'scene_worship' || s.id === 'scene_sermon' || (s.id && s.id.includes('jk')));
              if (hasLegacy || current.length < 8) {
                setActiveScene('scene_main_news');
                setLiveScene('scene_opening_montage');
                return data.scenes;
              }
              return current;
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          isProjectLoadedRef.current = true
        });
    } else {
      isProjectLoadedRef.current = true
    }
  }, [addToast]);

  // Debounced auto-save project state to userData via main process service (500ms trailing edge)
  useEffect(() => {
    if (!isProjectLoadedRef.current) return

    const saveTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.nexusAPI?.saveProject) {
        window.nexusAPI.saveProject({ scenes, activeScene, liveScene })
          .then(res => {
            if (!res?.success) {
              console.warn('[BroadcastContext] Failed to persist project:', res?.error)
            }
          })
          .catch(err => {
            console.error('[BroadcastContext] Error during project save:', err)
          })
      } else if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('nexus_broadcast_state_v4', JSON.stringify({ ...JSON.parse(localStorage.getItem('nexus_broadcast_state_v4') || '{}'), scenes }))
        } catch (_) {}
      }
    }, 500)

    return () => clearTimeout(saveTimer)
  }, [scenes, activeScene, liveScene])

  useEffect(() => {
    if (!scenes.some(scene => scene.id === activeScene)) setActiveScene(scenes[0]?.id || '')
    if (!scenes.some(scene => scene.id === liveScene)) setLiveScene(scenes[0]?.id || '')
  }, [scenes, activeScene, liveScene])

  const [activeMediaFiles, setActiveMediaFiles] = useState<Record<string, string>>({})


  const [clipboardSource, setClipboardSource] = useState<SceneSource | null>(null)
  const [clipboardSourceTransform, setClipboardSourceTransform] = useState<any | null>(null)
  const [clipboardFilters, setClipboardFilters] = useState<SourceFilter[] | null>(null)
  
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [mediaPlaylist, setMediaPlaylist] = useState<string[]>([])

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
  const [undoStack, setUndoStack] = useState<Scene[][]>([])
  const [redoStack, setRedoStack] = useState<Scene[][]>([])

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

  useEffect(() => {
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
  const [isStreaming, setIsStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingPaused, setIsRecordingPaused] = useState(false)
  const [virtualCameraActive, setVirtualCameraActive] = useState(false)
  const [streamingDuration, setStreamingDuration] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)

  // Settings states
  const [outputSettings, setOutputSettings] = useState<any>(() => getInitialState('outputSettings', {
    general: { language: 'en', theme: 'dark', systemTray: true },
    stream: { platform: 'YouTube', server: 'default', streamKey: '' },
    output: { mode: 'simple', videoBitrate: 6000, encoder: 'x264', audioBitrate: 128, recordingPath: '', recordingFormat: 'mp4' },
    audio: { sampleRate: '48khz', channels: 'stereo' },
    video: { baseResolution: '1920x1080', outputResolution: '1920x1080', downscaleFilter: 'bicubic', commonFps: '60' },
    accessibility: { screenReader: false, highContrast: false },
    advanced: { processPriority: 'normal', renderer: 'direct3d11', colorFormat: 'nv12', colorSpace: '709', colorRange: 'partial' }
  }))

  const [virtualCameraSettings, setVirtualCameraSettings] = useState<any>(() => getInitialState('virtualCameraSettings', {
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
  const [activeOverlays, setActiveOverlays] = useState<Record<number, SceneId | null>>(() => getInitialState('activeOverlays', {
    1: null,
    2: null,
    3: null,
    4: null
  }))
  const [duplicateSceneSetting, setDuplicateSceneSetting] = useState<boolean>(() => getInitialState('duplicateSceneSetting', true))
  const [duplicateSourcesSetting, setDuplicateSourcesSetting] = useState<boolean>(() => getInitialState('duplicateSourcesSetting', true))
  const [swapScenesAfterTransition, setSwapScenesAfterTransition] = useState<boolean>(() => getInitialState('swapScenesAfterTransition', true))
  const [programFilters, setProgramFilters] = useState<SourceFilter[]>(() => getInitialState('programFilters', []))
  const [programResolution, setProgramResolution] = useState<string>(() => getInitialState('programResolution', '1920x1080'))

  // NDI Out settings
  const [ndiEnabled, setNdiEnabled] = useState<boolean>(() => getInitialState('ndiEnabled', false))
  const [ndiName, setNdiName] = useState<string>(() => getInitialState('ndiName', 'NexusBroadcast_NDI_Out'))

  // Real-time render performance metrics
  const [renderTime, setRenderTime] = useState<number>(1.5)

  // Recorders map for single stream isolation
  const singleStreamRecordersRef = useRef<Record<string, MediaRecorder>>({})

  // Virtual Camera dedicated offscreen canvas to avoid chroma-key conflict
  const vcamCanvasRef = useRef<HTMLCanvasElement | null>(null)

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

  const lastChunkRef = useRef<ArrayBuffer | null>(null)

  // Destinations configuration (5 channels)
  const [destinations, setDestinations] = useState<StreamDestination[]>([
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
  const [transitionType, setTransitionType] = useState<TransitionType>('fade')
  const [transitionDuration, setTransitionDuration] = useState(500)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [transitionFromScene, setTransitionFromScene] = useState<string | null>(null)
  const transitionFrameRef = useRef<number | null>(null)
  const transitionRunningRef = useRef(false)
  const manualTransitionRef = useRef<{ from: string; to: string } | null>(null)
  useEffect(() => () => {
    if (transitionFrameRef.current !== null) cancelAnimationFrame(transitionFrameRef.current)
    transitionRunningRef.current = false
  }, [])
  const [autoTake, setAutoTake] = useState<boolean>(false)
  const [videoElements, setVideoElements] = useState<Record<string, HTMLVideoElement>>({})
  const [imageElements, setImageElements] = useState<Record<string, HTMLImageElement>>({})
  const imageElementsRef = useRef<Record<string, HTMLImageElement>>({})

  // Real System Stats (linked to IPC)
  const [cpuUsage, setCpuUsage] = useState(0)
  const [gpuUsage, setGpuUsage] = useState(0)
  const [bitrate, setBitrate] = useState(0)
  const [droppedFrames, setDroppedFrames] = useState(0)
  const [networkSpeed, setNetworkSpeed] = useState(0)

  // Docks Layout Config
  const [docks, setDocks] = useState<DockConfig[]>(() => getInitialState('docks', [
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
  const [workspacePreset, _setWorkspacePreset] = useState<string>(() => getInitialState('workspacePreset', 'Broadcast'))
  
  const setWorkspacePreset = useCallback((preset: string) => {
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

  useEffect(() => {
    // Force load the initial preset on startup to overwrite corrupted localStorage docks missing dockZone
    setWorkspacePreset(workspacePreset)
  }, [setWorkspacePreset, workspacePreset])

  const [shortcuts, setShortcuts] = useState<Record<string, ShortcutConfig>>(() => getInitialState('shortcuts', {}))
  
  const [ramUsage, setRamUsage] = useState(0)
  const [gpuMemory, setGpuMemory] = useState(0)
  const [diskUsage, setDiskUsage] = useState(0)

  const updateShortcut = (id: string, config: Partial<ShortcutConfig>) => {
    setShortcuts(prev => ({ ...prev, [id]: { ...prev[id], ...config } }))
  }

  // Canvas Refs
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const programCanvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Media Recorder references
  const streamRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingRecorderRef = useRef<MediaRecorder | null>(null)
  const vcamRecorderRef = useRef<MediaRecorder | null>(null)

  // Background Element registries
  const videoElementsRef = useRef<Record<string, HTMLVideoElement>>({})
  // Audio Engine Master & Metering State
  const [masterVolume, setMasterVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_master_volume')
      return saved !== null ? Number(saved) : 90
    } catch {
      return 90
    }
  })
  const [masterMuted, setMasterMutedState] = useState<boolean>(false)
  const [audioMeterLevels, setAudioMeterLevels] = useState<Record<string, AudioMeterData>>({})

  // Real Web Audio Signal Metering loop
  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        const levels = AudioEngine.getInstance().getAllMeterLevels()
        setAudioMeterLevels(levels)
      } catch (err) {
        // AudioContext not yet unlocked or idle
      }
    }, 75)
    return () => window.clearInterval(timer)
  }, [])

  // Auto-listen to audio device connect/disconnect events
  useEffect(() => {
    const unsubscribe = AudioEngine.getInstance().setupDeviceChangeListener(devices => {
      setAudioDevices(devices)
      logEvent('info', `Audio devices changed (${devices.length} available)`)
    })
    return () => unsubscribe()
  }, [])

  // Clean audio engine on unmount
  useEffect(() => () => {
    AudioEngine.getInstance().dispose()
  }, [])

  // Auto-save state to localStorage on modification
  useEffect(() => {
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

  // Fetch Electron API via secure context bridge if available
  const getElectron = () => {
    if (typeof window !== 'undefined' && (window.nexusAPI || window.electronAPI)) {
      const api = (window.nexusAPI || window.electronAPI)!
      return {
        ipcRenderer: {
          invoke: async (channel: string, ...args: any[]) => {
            if (channel === 'broadcast-capabilities') return api.getCapabilities()
            if (channel === 'get-sources') return api.getSources()
            if (channel === 'start-stream-single') return api.startStreamSingle(args[0])
            if (channel === 'stop-stream-single') return api.stopStreamSingle(args[0])
            if (channel === 'start-virtual-camera') return api.startVirtualCamera(args[0])
            if (channel === 'stop-virtual-camera') return api.stopVirtualCamera()
            if (channel === 'load-project') return api.loadProject()
            if (channel === 'save-project') return api.saveProject(args[0])
            if (channel === 'get-project-path') return api.getProjectPath()
            if (channel === 'is-window-maximized') return api.isWindowMaximized?.()
            return Promise.reject(new Error(`Channel not allowed: ${channel}`))
          },
          send: (channel: string, ...args: any[]) => {
            if (channel === 'stream-chunk-single') api.sendStreamChunk(args[0])
            else if (channel === 'vcam-chunk') api.sendVirtualCameraChunk(args[0])
            else if (channel === 'set-next-screen-id') api.setNextScreenId(args[0])
            else if (channel === 'window-minimize') api.minimizeWindow()
            else if (channel === 'window-maximize') api.maximizeWindow()
            else if (channel === 'window-close') api.closeWindow()
          },
          on: (channel: string, listener: (...args: any[]) => void) => {
            if (channel === 'system-stats-update') {
              const unsub = api.onSystemStats(stats => listener(null, stats))
              ;(listener as any).__unsub = unsub
            }
          },
          removeListener: (channel: string, listener: (...args: any[]) => void) => {
            if ((listener as any)?.__unsub) {
              ;(listener as any).__unsub()
            }
          }
        }
      }
    }
    // Fallback if window.require exists in mock or legacy test
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        return (window as any).require('electron')
      } catch (_) {}
    }
    return null
  }

  // Load screen/window list for Display Capture
  const loadDesktopSources = async () => {
    if (typeof window !== 'undefined' && window.nexusAPI?.getSources) {
      try {
        const sourcesList = await window.nexusAPI.getSources()
        setDesktopSources(sourcesList)
        return
      } catch (e) {
        console.error('Failed to load screen capture list:', e)
      }
    }
    const electron = getElectron()
    if (!electron) return
    try {
      const sourcesList = await electron.ipcRenderer.invoke('get-sources')
      setDesktopSources(sourcesList)
    } catch (e) {
      console.error('Failed to load screen capture list:', e)
    }
  }

  useEffect(() => {
    loadDesktopSources()
  }, [])

  // Listen to main process stats updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.nexusAPI?.onSystemStats) {
      const unsub = window.nexusAPI.onSystemStats((stats: any) => {
        setCpuUsage(stats.cpu)
        setGpuUsage(stats.gpu)
        setRamUsage(stats.ram)
        setBitrate(stats.bitrate)
        setDroppedFrames(stats.droppedFrames)
        setNetworkSpeed(stats.networkSpeed)
      })
      return () => unsub()
    }
    const electron = getElectron()
    if (!electron) return

    const handleStats = (_event: any, stats: any) => {
      setCpuUsage(stats.cpu)
      setGpuUsage(stats.gpu)
      setRamUsage(stats.ram)
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
  useEffect(() => {
    let interval: any = null
    if (isStreaming) {
      interval = setInterval(() => setStreamingDuration(d => d + 1), 1000)
    } else {
      setStreamingDuration(0)
    }
    return () => clearInterval(interval)
  }, [isStreaming])

  useEffect(() => {
    let interval: any = null
    if (isRecording && !isRecordingPaused) {
      interval = setInterval(() => setRecordingDuration(d => d + 1), 1000)
    } else {
      setRecordingDuration(0)
    }
    return () => clearInterval(interval)
  }, [isRecording, isRecordingPaused])

  useEffect(() => {
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
    try {
      AudioEngine.getInstance().attachMediaElement(src.id, video, src.name, src.type, {
        volume: src.volume ?? 80,
        gainDb: src.audioGain ?? 0,
        muted: src.muted ?? false,
        solo: src.solo ?? false,
        pan: src.balance ?? 0,
        route: src.audioRoute ?? 'master',
        monitorEnabled: src.monitorEnabled ?? true
      })
    } catch (err) {
      console.warn('[BroadcastContext] Failed to attach video to AudioEngine:', err)
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
    if (!name || !name.trim()) {
      addToast('warning', 'Scene name cannot be empty or whitespace only.')
      return
    }
    const currentScenes = scenesRef.current || scenes || []
    const trimmed = name.trim()
    let finalName = trimmed
    const existingNames = currentScenes.map(s => s.name.toLowerCase())
    if (existingNames.includes(trimmed.toLowerCase())) {
      let counter = 2
      while (existingNames.includes(`${trimmed.toLowerCase()} (${counter})`)) {
        counter++
      }
      finalName = `${trimmed} (${counter})`
    }
    const newId = `scene_${crypto.randomUUID()}`
    const newScene: Scene = {
      id: newId,
      name: finalName,
      duration: '00:00:00',
      transitionType: 'fade',
      pinned: false,
      isPinned: false,
      isLocked: false,
      color: '#ffffff',
      createdAt: new Date(),
      updatedAt: new Date(),
      sources: []
    }
    const nextScenes = [...currentScenes, newScene]
    scenesRef.current = nextScenes
    setScenes(nextScenes)
    setActiveScene(newId)
    addToast('success', `Created scene "${finalName}".`)
    logEvent('info', `Created scene "${finalName}" (${newId})`)
  }

  const renameScene = (id: string, name: string) => {
    const nextName = name.trim()
    if (!nextName) {
      addToast('warning', 'Scene name cannot be empty.')
      return
    }
    const nextScenes = (scenesRef.current || scenes || []).map(scene => scene.id === id ? {
      ...scene,
      name: nextName,
      updatedAt: new Date()
    } : scene)
    scenesRef.current = nextScenes
    setScenes(nextScenes)
    addToast('info', `Renamed scene to "${nextName}".`)
  }

  const deleteScene = (id: string) => {
    const currentScenes = scenesRef.current || scenes || []
    const target = currentScenes.find(s => s.id === id)
    const nextScenes = currentScenes.filter(s => s.id !== id && s.id !== `${id}_live`)
    scenesRef.current = nextScenes
    setScenes(nextScenes)
    if (activeScene === id) {
      const remainingBaseScenes = nextScenes.filter(s => !s.id.endsWith('_live'))
      setActiveScene(remainingBaseScenes[0]?.id || '')
    }
    if (liveScene === id || liveScene === `${id}_live`) {
      const remainingBaseScenes = nextScenes.filter(s => !s.id.endsWith('_live'))
      setLiveScene(remainingBaseScenes[0]?.id || '')
    }
    if (target) {
      if (target.sources) {
        target.sources.forEach(src => {
          try {
            TextureManager.disposeSource(src.id)
            MediaManager.getInstance().disposeSource(src.id)
            AudioEngine.getInstance().detachSource(src.id, true)
          } catch (e) {
            console.warn('[BroadcastContext] Error disposing source:', e)
          }
        })
      }
      addToast('info', `Deleted scene "${target.name}".`)
      logEvent('info', `Deleted scene "${target.name}" (${id})`)
    }
  }

  const duplicateScene = (id: string) => {
    const currentScenes = scenesRef.current || scenes || []
    const target = currentScenes.find(s => s.id === id)
    if (!target) return
    const newId = `scene_${crypto.randomUUID()}`
    const copyName = `${target.name} (Copy)`
    const newScene: Scene = {
      ...target,
      id: newId,
      name: copyName,
      sources: (target.sources || []).map(src => ({
        ...src,
        id: `src_${crypto.randomUUID()}`,
        settings: JSON.parse(JSON.stringify(src.settings || {})),
        filters: JSON.parse(JSON.stringify(src.filters || [])),
        audio: src.audio ? JSON.parse(JSON.stringify(src.audio)) : src.audio
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const nextScenes = [...currentScenes, newScene]
    scenesRef.current = nextScenes
    setScenes(nextScenes)
    setActiveScene(newId)
    addToast('success', `Duplicated scene "${target.name}".`)
    logEvent('info', `Duplicated scene "${target.name}" (${newId})`)
  }

  const togglePinScene = (id: string) => {
    const nextScenes = (scenesRef.current || scenes || []).map(s => s.id === id ? {
      ...s,
      pinned: !(s.pinned ?? s.isPinned),
      isPinned: !(s.pinned ?? s.isPinned),
      updatedAt: new Date()
    } : s)
    scenesRef.current = nextScenes
    setScenes(nextScenes)
  }

  const updateSceneOrder = (newScenes: Scene[]) => {
    scenesRef.current = newScenes
    setScenes(newScenes)
  }

  const pinnedScenes = (scenes || []).filter(s => !s.id.endsWith('_live') && s.pinned)

  // Source CRUD inside Scenes
  const addSourceToScene = (sceneId: SceneId, type: SceneSource['type'], name: string, initialSettings?: any): string => {
    const currentScenes = scenesRef.current || scenes || []
    const targetScene = currentScenes.find(s => s.id === sceneId || s.id === `${sceneId}_live`)
    if (!targetScene) {
      addToast('error', 'Cannot add source: Target scene not found.')
      return ''
    }

    const def = SourceRegistry.get(type)
    const defDimensions = def?.defaultDimensions || { width: 1920, height: 1080 }
    
    // Disambiguate source name if already present in target scene
    let uniqueName = name || def?.name || 'New Source'
    const existingNames = (targetScene.sources || []).map(s => s.name.toLowerCase())
    if (existingNames.includes(uniqueName.toLowerCase())) {
      let counter = 2
      while (existingNames.includes(`${uniqueName.toLowerCase()} ${counter}`)) {
        counter++
      }
      uniqueName = `${uniqueName} ${counter}`
    }

    // Determine zIndex
    const maxZ = (targetScene.sources || []).reduce((max, s) => Math.max(max, s.zIndex ?? 0), 0)
    const nextZ = (targetScene.sources?.length === 0) ? 1 : maxZ + 1

    // Ensure valid color settings for canvas
    const mergedSettings = { ...(def?.defaultSettings || {}), ...(initialSettings || {}) }
    if (type === 'color_source' && (!mergedSettings.backgroundColor || mergedSettings.backgroundColor.startsWith('var('))) {
      mergedSettings.backgroundColor = '#1e293b'
    }

    const newSourceId = `src_${crypto.randomUUID()}`
    const newSource: SceneSource = {
      id: newSourceId,
      name: uniqueName,
      type,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: nextZ,
      filters: [],
      x: 0,
      y: 0,
      width: defDimensions.width,
      height: defDimensions.height,
      settings: mergedSettings
    }

    const nextScenes = currentScenes.map(s => {
      if (s.id === sceneId || s.id === `${sceneId}_live`) {
        return {
          ...s,
          sources: [...(s.sources || []), newSource],
          updatedAt: new Date()
        }
      }
      return s
    })
    scenesRef.current = nextScenes
    setScenes(nextScenes)

    setSelectedSourceIds([newSourceId])
    addToast('success', `Added source "${uniqueName}" (${type}) to ${targetScene.name}.`)
    logEvent('info', `Added source "${uniqueName}" (${newSourceId}) to scene ${sceneId}`)
    return newSourceId
  }

  const deleteSourceFromScene = (sceneId: string, sourceId: string) => {
    const currentScenes = scenesRef.current || scenes || []
    let deletedName = ''
    const nextScenes = currentScenes.map(s => {
      if (s.id === sceneId || s.id === `${sceneId}_live`) {
        const deleted = (s.sources || []).find(src => src.id === sourceId)
        if (deleted) deletedName = deleted.name
        return { ...s, sources: (s.sources || []).filter(src => src.id !== sourceId), updatedAt: new Date() }
      }
      return s
    })
    scenesRef.current = nextScenes
    setScenes(nextScenes)
    try {
      TextureManager.disposeSource(sourceId)
      MediaManager.getInstance().disposeSource(sourceId)
      AudioEngine.getInstance().detachSource(sourceId, true)
    } catch (e) {
      console.warn('[BroadcastContext] Error disposing source:', e)
    }
    if (deletedName) {
      addToast('info', `Removed source "${deletedName}".`)
      logEvent('info', `Removed source "${deletedName}" (${sourceId}) from ${sceneId}`)
    }
    setSelectedSourceIds(prev => prev.filter(id => id !== sourceId))
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
    const target = targetSceneId || activeScene
    if (!scenes.some(scene => scene.id === target)) return
    if (transitionFrameRef.current !== null) cancelAnimationFrame(transitionFrameRef.current)
    transitionFrameRef.current = null
    transitionRunningRef.current = false
    manualTransitionRef.current = null
    setIsTransitioning(false)
    setTransitionFromScene(null)
    setTransitionProgress(0)
    setLiveScene(target)
    if (swapScenesAfterTransition && target !== liveScene) setActiveScene(liveScene)
  }

  const cutTransition = () => {
    takeLive()
  }

  const autoTransition = (targetSceneId?: string) => {
    const target = targetSceneId || activeScene
    if (transitionRunningRef.current || target === liveScene || !scenes.some(scene => scene.id === target)) return
    if (transitionType === 'cut' || transitionDuration <= 0) {
      takeLive(target)
      return
    }
    const previous = liveScene
    const duration = Number.isFinite(transitionDuration) ? Math.max(1, transitionDuration) : 500
    const started = performance.now()
    transitionRunningRef.current = true
    setTransitionFromScene(previous)
    setLiveScene(target)
    setIsTransitioning(true)
    setTransitionProgress(0)
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      setTransitionProgress(progress)
      if (progress < 1) transitionFrameRef.current = requestAnimationFrame(animate)
      else {
        transitionFrameRef.current = null
        transitionRunningRef.current = false
        setIsTransitioning(false)
        setTransitionFromScene(null)
        if (swapScenesAfterTransition) setActiveScene(previous)
      }
    }
    transitionFrameRef.current = requestAnimationFrame(animate)
  }

  const setManualTransitionProgress = (value: number) => {
    if (!Number.isFinite(value) || transitionFrameRef.current !== null) return
    const progress = Math.max(0, Math.min(1, value))
    let session = manualTransitionRef.current
    if (!session) {
      if (progress === 0 || activeScene === liveScene || !scenes.some(scene => scene.id === activeScene)) return
      session = { from: liveScene, to: activeScene }
      manualTransitionRef.current = session
      transitionRunningRef.current = true
      setTransitionFromScene(session.from)
      setLiveScene(session.to)
      setIsTransitioning(true)
    }
    setTransitionProgress(progress)
    if (progress === 0 || progress === 1) {
      setLiveScene(progress === 0 ? session.from : session.to)
      if (progress === 1 && swapScenesAfterTransition) setActiveScene(session.from)
      manualTransitionRef.current = null
      transitionRunningRef.current = false
      setTransitionFromScene(null)
      setIsTransitioning(false)
      setTransitionProgress(0)
    }
  }

  const addFilterToSource = (sceneId: string, sourceId: string, filterType: string) => {
    setScenes(previous => previous.map(scene => scene.id !== sceneId ? scene : {
      ...scene,
      sources: scene.sources.map(source => source.id !== sourceId ? source : {
        ...source, filters: [...(source.filters || []), { id: crypto.randomUUID(), type: filterType, enabled: true, settings: {} }]
      })
    }))
  }
  const deleteFilterFromSource = (sceneId: string, sourceId: string, filterId: string) => {
    setScenes(previous => previous.map(scene => scene.id !== sceneId ? scene : {
      ...scene,
      sources: scene.sources.map(source => source.id !== sourceId ? source : {
        ...source, filters: (source.filters || []).filter(filter => filter.id !== filterId)
      })
    }))
  }

  const stopStreaming = async () => {
    await stopAllStreams()
  }


  const startSingleStream = async (id: string) => {
    const electron = getElectron()
    const dest = (destinations || []).find(d => d.id === id)
    if (!dest) return

    try {
      if (!electron) throw new Error('Streaming requires the desktop output service.')
      const capabilities = await electron.ipcRenderer.invoke('broadcast-capabilities')
      if (!capabilities.streaming) throw new Error('No streaming transport is installed. Output was not started.')
      if (singleStreamRecordersRef.current[id]) return
      const canvas = programCanvasRef.current
      if (!canvas) throw new Error('Program output monitor is not ready.')

      // Create a separate stream and recorder for this destination
      const stream = canvas.captureStream(60)
      const mixedStream = new MediaStream()
      mixedStream.addTrack(stream.getVideoTracks()[0])
      
      const programAudio = AudioEngine.getInstance().getProgramStream()
      if (programAudio) {
        const audioTracks = programAudio.getAudioTracks()
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

        if (!res || !res.success) {
          recorder.stop()
          delete singleStreamRecordersRef.current[id]
          if (Object.keys(singleStreamRecordersRef.current).length === 0) {
            setIsStreaming(false)
          }
          setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'disconnected' } : d))
          const errorMsg = res?.error || `Streaming transport failed for ${dest.name}`
          addToast('error', errorMsg)
          logEvent('error', errorMsg)
          return
        }

        setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'streaming' } : d))
        setIsStreaming(true)
        addToast('success', `Stream live on ${dest.name}`)
        logEvent('info', `Stream live on ${dest.name}`)
      }
    } catch (err: any) {
      const recorder = singleStreamRecordersRef.current[id]
      if (recorder) {
        if (recorder.state !== 'inactive') recorder.stop()
        recorder.stream.getVideoTracks().forEach(track => track.stop())
        delete singleStreamRecordersRef.current[id]
      }
      setIsStreaming(Object.keys(singleStreamRecordersRef.current).length > 0)
      const errorMsg = `Unable to start stream ${dest.name}: ${err?.message || err}`
      addToast('error', errorMsg)
      logEvent('error', errorMsg)
      if (typeof alert === 'function') {
        alert(errorMsg)
      }
      setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'disconnected' } : d))
    }
  }

  const stopSingleStream = async (id: string) => {
    const electron = getElectron()
    const recorder = singleStreamRecordersRef.current[id]
    if (recorder) {
      if (recorder.state !== 'inactive') recorder.stop()
      recorder.stream.getVideoTracks().forEach(track => track.stop())
      delete singleStreamRecordersRef.current[id]
    }

    if (electron && recorder) {
      await electron.ipcRenderer.invoke('stop-stream-single', id)
    }

    setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, status: 'disconnected' } : d))
    setIsStreaming(Object.keys(singleStreamRecordersRef.current).length > 0)
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
    if (recordingRecorderRef.current) return
    try {
      const canvas = programCanvasRef.current
      if (!canvas) throw new Error('Program output monitor is not ready.')

      const stream = canvas.captureStream(60)
      const mixedStream = new MediaStream()
      mixedStream.addTrack(stream.getVideoTracks()[0])

      const programAudio = AudioEngine.getInstance().getProgramStream()
      if (programAudio) {
        const audioTracks = programAudio.getAudioTracks()
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
        stream.getVideoTracks().forEach(track => track.stop())
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nexus-render-record-${Date.now()}.webm`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }

      recorder.start(1000)
      recordingRecorderRef.current = recorder
      setIsRecordingPaused(false)
      setIsRecording(true)
      addToast('info', 'Local recording started.')
      logEvent('info', 'Local recording started')
    } catch (e: any) {
      console.error(e)
      const errorMsg = `Failed to start recording: ${e?.message || e}`
      addToast('error', errorMsg)
      logEvent('error', errorMsg)
    }
  }

  const stopRecording = async () => {
    if (recordingRecorderRef.current) {
      recordingRecorderRef.current.stop()
      recordingRecorderRef.current = null
      addToast('info', 'Recording stopped and file saved.')
      logEvent('info', 'Recording stopped')
    }
    setIsRecordingPaused(false)
    setIsRecording(false)
  }

  const pauseRecording = () => {
    const recorder = recordingRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    if (recorder.state === 'recording') {
      recorder.pause()
      setIsRecordingPaused(true)
    } else if (recorder.state === 'paused') {
      recorder.resume()
      setIsRecordingPaused(false)
    }
  }

  // Virtual Camera loop
  const toggleVirtualCamera = async () => {
    const electron = getElectron()
    if (!electron) {
      addToast('warning', 'Virtual Camera loopback is available only in the desktop application.')
      return
    }

    if (virtualCameraActive) {
      if (vcamRecorderRef.current) {
        vcamRecorderRef.current.stop()
        vcamRecorderRef.current = null
      }
      await electron.ipcRenderer.invoke('stop-virtual-camera')
      setVirtualCameraActive(false)
      addToast('info', 'Virtual Camera output stopped.')
      logEvent('info', 'Virtual Camera stopped')
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

        const res = await electron.ipcRenderer.invoke('start-virtual-camera', {
          width: widthVal,
          height: heightVal,
          deviceIndex: 0,
          fps: fpsVal,
          firstChunk
        })

        if (!res?.success) {
          recorder.stop()
          const errorMsg = res?.error || 'Virtual Camera bridge is not active.'
          addToast('error', errorMsg)
          logEvent('error', errorMsg)
          return
        }

        ffmpegReady = true
        vcamRecorderRef.current = recorder
        setVirtualCameraActive(true)
        addToast('success', 'Virtual Camera started.')
        logEvent('info', 'Virtual Camera started')

        // Flush buffered chunks (including EBML header!)
        for (const chunk of pendingChunks) {
          electron.ipcRenderer.send('vcam-chunk', chunk)
        }
      } catch (e: any) {
        console.error(e)
        const errorMsg = `Failed to start Virtual Camera: ${e?.message || e}`
        addToast('error', errorMsg)
        logEvent('error', errorMsg)
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
            const msg = err.name === 'NotAllowedError' 
              ? 'Camera permission denied.' 
              : err.name === 'NotFoundError' 
              ? 'No camera device found.' 
              : `Camera unavailable: ${err.message || err.name}`
            addToast('warning', msg)
            logEvent('error', `Camera capture error: ${err.message || err.name}`)
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
            try {
              AudioEngine.getInstance().attachMediaStream(srcId, stream, src.name, 'audio', {
                volume: src.volume ?? 80,
                gainDb: src.audioGain ?? 0,
                muted: src.muted ?? false,
                solo: src.solo ?? false,
                pan: src.balance ?? 0,
                route: src.audioRoute ?? 'program',
                monitorEnabled: src.monitorEnabled ?? false
              })
            } catch (err) {
              console.warn('[BroadcastContext] Failed to attach mic to AudioEngine:', err)
            }
          }).catch(err => {
            console.error('Audio capture failed:', err)
            const msg = err.name === 'NotAllowedError'
              ? 'Microphone permission denied.'
              : err.name === 'NotFoundError'
              ? 'No audio input device found.'
              : `Audio input unavailable: ${err.message || err.name}`
            addToast('warning', msg)
            logEvent('error', `Audio capture error: ${err.message || err.name}`)
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
          }).catch((err: any) => {
            console.error('Screen capture failed:', err)
            const msg = err.name === 'NotAllowedError'
              ? 'Display capture permission denied or cancelled.'
              : `Display capture error: ${err.message || err.name}`
            addToast('warning', msg)
            logEvent('error', `Display capture error: ${err.message || err.name}`)
          })
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

  // Scanner helper for directory scanning (sandboxed in secure renderer)
  const scanDirectoryRecursive = (_dirPath: string): string[] => {
    return []
  }

  // Keep one scheduler alive while scene and transition state changes.
  const renderFrameRef = useRef<(time: number) => void>(() => {})
  renderFrameRef.current = (time) => {
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
  }
  useEffect(() => {
    RenderScheduler.start(time => renderFrameRef.current(time))

    return () => {
      RenderScheduler.stop()
    }
  }, [])

  const startStreaming = async () => {
    const enabled = destinations.filter(destination => destination.enabled && /^(rtmps?|srt):\/\//i.test(destination.rtmpUrl))
    if (enabled.length === 0) {
      addToast('warning', 'Configure and enable an RTMP or SRT destination before starting output.')
      return
    }
    await Promise.all(enabled.map(destination => startSingleStream(destination.id)))
  }

  const setChannelVolume = (sourceId: string, vol: number) => {
    AudioEngine.getInstance().setChannelVolume(sourceId, vol)
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, volume: vol } : src)
    })))
  }

  const setChannelMute = (sourceId: string, muted: boolean) => {
    AudioEngine.getInstance().setChannelMute(sourceId, muted)
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, muted } : src)
    })))
  }

  const toggleChannelMute = (sourceId: string) => {
    const source = scenes.flatMap(scene => scene.sources || []).find(item => item.id === sourceId)
    const nextMuted = source ? !source.muted : AudioEngine.getInstance().toggleChannelMute(sourceId)
    setChannelMute(sourceId, nextMuted)
  }

  const setChannelSolo = (sourceId: string, solo: boolean) => {
    AudioEngine.getInstance().setChannelSolo(sourceId, solo)
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, solo } : src)
    })))
  }

  const toggleChannelSolo = (sourceId: string) => {
    const source = scenes.flatMap(scene => scene.sources || []).find(item => item.id === sourceId)
    const nextSolo = source ? !source.solo : AudioEngine.getInstance().toggleChannelSolo(sourceId)
    setChannelSolo(sourceId, nextSolo)
  }

  const updateChannelGain = (sourceId: string, db: number) => {
    AudioEngine.getInstance().setChannelGainDb(sourceId, db)
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, audioGain: db } : src)
    })))
  }

  const updateChannelBalance = (sourceId: string, bal: number) => {
    AudioEngine.getInstance().setChannelPan(sourceId, bal)
    setScenes(prev => (prev || []).map(s => ({
      ...s,
      sources: (s.sources || []).map(src => src.id === sourceId ? { ...src, balance: bal } : src)
    })))
  }

  const updateChannelRoute = (sourceId: string, route: AudioBusRoute) => {
    AudioEngine.getInstance().setChannelRoute(sourceId, route)
    setScenes(previous => previous.map(scene => ({
      ...scene,
      sources: (scene.sources || []).map(source => source.id === sourceId ? { ...source, audioRoute: route } : source)
    })))
  }

  const setChannelMonitor = (sourceId: string, enabled: boolean) => {
    AudioEngine.getInstance().setChannelMonitor(sourceId, enabled)
    setScenes(previous => previous.map(scene => ({
      ...scene,
      sources: (scene.sources || []).map(source => source.id === sourceId ? { ...source, monitorEnabled: enabled } : source)
    })))
  }

  const setMasterVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol))
    setMasterVolumeState(clamped)
    AudioEngine.getInstance().setMasterVolume(clamped)
    try {
      localStorage.setItem('nexus_master_volume', String(clamped))
    } catch {}
  }

  const setMasterMute = (muted: boolean) => {
    setMasterMutedState(muted)
    AudioEngine.getInstance().setMasterMute(muted)
  }

  const toggleMasterMute = () => {
    const next = !masterMuted
    setMasterMute(next)
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
        setManualTransitionProgress,
        addScene,
        renameScene,
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
        isRecordingPaused,
        virtualCameraActive,
        streamingDuration,
        recordingDuration,
        destinations,

        updateDestination,
        startStreaming,
        stopStreaming,
        startRecording,
        stopRecording,
        pauseRecording,
        startSingleStream,
        stopSingleStream,
        startAllStreams,
        stopAllStreams,
        toggleVirtualCamera,
        setChannelVolume,
        toggleChannelMute,
        setChannelMute,
        toggleChannelSolo,
        setChannelSolo,
        updateChannelGain,
        updateChannelBalance,
        updateChannelRoute,
        setChannelMonitor,
        masterVolume,
        setMasterVolume,
        masterMuted,
        setMasterMute,
        toggleMasterMute,
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
        videoDevices,
        audioDevices,
        loadMediaDevices,
        openMediaFileDialog,
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
  const context = useContext(BroadcastContext)
  
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
        if (['isStreaming', 'isRecording', 'virtualCameraActive', 'isTransitioning', 'duplicateSceneSetting', 'duplicateSourcesSetting', 'swapScenesAfterTransition', 'ndiEnabled', 'masterMuted'].includes(prop)) return false
        if (['masterVolume'].includes(prop)) return 90
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
