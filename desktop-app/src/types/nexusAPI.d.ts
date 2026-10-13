export interface SystemStats {
  cpu: number
  gpu: number
  ram: number
  bitrate: number
  droppedFrames: number
  networkSpeed: number
}

export interface DesktopSource {
  id: string
  name: string
}

export interface BroadcastCapabilities {
  streaming: boolean
  ndi: boolean
  virtualCamera: boolean
}

export interface ProjectSaveResult {
  success: boolean
  projectPath?: string
  savedAt?: string
  bytesWritten?: number
  error?: string
}

export interface ProjectLoadResult {
  success: boolean
  data?: any
  projectPath?: string
  recoveredFromBackup?: boolean
  isMigrated?: boolean
  error?: string
}

export interface NexusAPI {
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  isWindowMaximized: () => Promise<boolean>
  onWindowMaximizedChange: (callback: (isMax: boolean) => void) => () => void
  getCapabilities: () => Promise<BroadcastCapabilities>
  getSources: () => Promise<DesktopSource[]>
  openFileDialog: (options?: { type?: 'image' | 'video' | 'media' | 'all'; title?: string }) => Promise<{ canceled: boolean; filePath?: string }>
  loadProject: () => Promise<ProjectLoadResult>
  saveProject: (projectData: any) => Promise<ProjectSaveResult>
  getProjectPath: () => Promise<string>
  onSystemStats: (callback: (stats: SystemStats) => void) => () => void
  setNextScreenId: (screenId: string) => void
  startStreamSingle: (config: any) => Promise<{ success: boolean; error?: string }>
  stopStreamSingle: (id: string) => Promise<{ success: boolean }>
  sendStreamChunk: (data: any) => void
  startVirtualCamera: (config: any) => Promise<{ success: boolean; error?: string }>
  stopVirtualCamera: () => Promise<{ success: boolean }>
  sendVirtualCameraChunk: (chunk: any) => void
}

declare global {
  interface Window {
    nexusAPI?: NexusAPI
    electronAPI?: NexusAPI
    require?: any
  }
}
