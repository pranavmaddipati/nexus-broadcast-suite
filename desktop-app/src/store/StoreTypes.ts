export type TransitionType = 'cut' | 'mix' | 'dip' | 'fade' | 'slide' | 'wipe' | 'zoom' | 'merge' | 'push' | 'cube' | 'stinger' | 'luma';

export interface SourceFilter {
  id: string;
  type: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface AudioSettings {
  volume: number;
  muted: boolean;
  solo: boolean;
  pan: number;          // -1 (Left) to 1 (Right)
  syncOffsetMs: number;
  compressor: {
    enabled: boolean;
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  eq: {
    enabled: boolean;
    low: number;
    mid: number;
    high: number;
  };
  limiter: {
    enabled: boolean;
    threshold: number;
    release: number;
  };
  noiseGate: {
    enabled: boolean;
    threshold: number;
    attack: number;
    release: number;
  };
  plugins: { id: string; name: string; enabled: boolean }[]; // VSTs
}

export interface SceneSource {
  id: string;
  name: string;
  type: string; // 'video' | 'camera' | 'image' | 'browser' | 'ndi' | 'audio' | 'graphics' | 'text' | 'group'
  visible: boolean;
  locked: boolean;
  parentId?: string; // For grouping (null if root)
  zIndex: number;
  
  // Transform
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation?: number;
  blendMode?: string; // 'normal', 'screen', 'multiply', etc.
  crop?: { top: number; right: number; bottom: number; left: number };
  
  // Audio
  audio?: AudioSettings;
  
  settings: Record<string, any>;
  filters: SourceFilter[];
  
  [key: string]: any;
}

export interface Scene {
  id: string;
  name: string;
  sources: SceneSource[];
  isPinned: boolean;
  isLocked: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  
  tags?: string[];
  notes?: string;
  folderId?: string;
  isFolder?: boolean;
  duration?: string;
  thumbnailUrl?: string;
  transitionType?: TransitionType;
  pinned?: boolean;
}

export interface SceneCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  scenes: Scene[];
}

export type StreamStatus = 'disconnected' | 'connecting' | 'connected' | 'streaming' | 'error' | 'idle';
export type RecordingStatus = 'stopped' | 'recording' | 'paused';

export interface StreamDestination {
  id: string;
  name: string;
  type?: 'rtmp' | 'srt' | 'ndi' | 'virtualcam' | 'custom';
  rtmpUrl: string;
  streamKey: string;
  enabled: boolean;
  status: StreamStatus;
  bitrate: number;
  audioBitrate: number;
  encoder: string;
  resolution: string;
  fps: number;
  platform?: string;
  reconnectEnabled?: boolean;
}

export interface MacroAction {
  id: string;
  type: 'switch_scene' | 'toggle_source' | 'play_media' | 'start_stream' | 'trigger_graphics';
  targetId: string;
  payload?: any;
}

export interface MacroTrigger {
  type: 'hotkey' | 'midi' | 'streamdeck' | 'timer' | 'event';
  value: string; // e.g. "CTRL+SHIFT+S"
}

export interface Macro {
  id: string;
  name: string;
  color: string;
  triggers: MacroTrigger[];
  actions: MacroAction[];
}

export interface BroadcastState {
  // --- Module 1: Scene Management & Collections ---
  sceneCollections: SceneCollection[];
  activeCollectionId: string | null;
  scenes: Scene[]; // Derived from active collection
  
  createScene: (name: string, isFolder?: boolean) => void;
  deleteScene: (id: string) => void;
  renameScene: (id: string, newName: string) => void;
  duplicateScene: (id: string) => void;
  moveScene: (id: string, newIndex: number) => void;
  pinScene: (id: string, isPinned?: boolean) => void;
  lockScene: (id: string, isLocked?: boolean) => void;
  setSceneColor: (id: string, color: string) => void;

  // --- Module 2: Layer Engine (Sources) ---
  createSource: (sceneId: string, type: string, name: string, parentId?: string) => void;
  deleteSource: (sceneId: string, sourceId: string) => void;
  moveSource: (sceneId: string, sourceId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  reorderSource: (sceneId: string, sourceId: string, newIndex: number, newParentId?: string) => void;
  updateSource: (sceneId: string, sourceId: string, updates: Partial<SceneSource>) => void;
  duplicateSource: (sceneId: string, sourceId: string) => void;
  groupSources: (sceneId: string, sourceIds: string[], groupName: string) => void;
  ungroupSources: (sceneId: string, groupId: string) => void;

  // --- Module 6: Selection Engine ---
  selectedSceneIds: string[];
  selectedSourceIds: string[];
  selectScene: (id: string, multi?: boolean) => void;
  selectSource: (id: string, multi?: boolean) => void;
  setSelectedSourceIds: (ids: string[]) => void;
  clearSelection: () => void;

  // --- Modules 3 & 4: Preview & Program Engine ---
  previewSceneId: string | null;
  programSceneId: string | null;
  setPreviewScene: (id: string) => void;
  setProgramScene: (id: string) => void;

  // --- Module 5: Transition Engine ---
  isTransitioning: boolean;
  activeTransition: TransitionType;
  transitionProgress: number; 
  transitionFromSceneId: string | null;
  takeTransition: (type: TransitionType, durationMs?: number) => void;

  // --- Module 11: Multi-Stream Engine ---
  destinations: StreamDestination[];
  updateDestination: (id: string, updates: Partial<StreamDestination>) => void;
  startStreamDestination: (id: string) => void;
  stopStreamDestination: (id: string) => void;
  startAllStreams: () => void;
  stopAllStreams: () => void;
  
  // Legacy / Master Stream status
  isStreaming: boolean;
  streamStatus: StreamStatus;
  
  // Recording
  recordingStatus: RecordingStatus;
  recordingTime: number;
  startRecording: () => void;
  pauseRecording: () => void;
  stopRecording: () => void;
  
  // Virtual Camera
  isVirtualCamEnabled: boolean;
  toggleVirtualCam: () => void;

  // --- Module 7: Macros & Automation ---
  macros: Macro[];
  createMacro: (macro: Omit<Macro, 'id'>) => void;
  updateMacro: (id: string, updates: Partial<Macro>) => void;
  deleteMacro: (id: string) => void;
  executeMacro: (id: string) => void;

  // --- Module 12: Audio Mixing Engine ---
  // Managed on a per-source basis using source.audio, but we can expose quick updaters
  updateSourceAudio: (sceneId: string, sourceId: string, updates: Partial<AudioSettings>) => void;

  // --- Module 8: Playback Engine ---
  mediaPlaybackState: Record<string, {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    loop: boolean;
  }>;
  playMedia: (sourceId: string) => void;
  pauseMedia: (sourceId: string) => void;
  seekMedia: (sourceId: string, time: number) => void;
  toggleMediaLoop: (sourceId: string) => void;
  setMediaDuration: (sourceId: string, duration: number) => void;
  updateMediaTime: (sourceId: string, time: number) => void;
}
