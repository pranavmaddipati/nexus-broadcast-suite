const { contextBridge, ipcRenderer } = require('electron')

/**
 * Nexus Broadcast Suite - Secure Preload Bridge (Phase 1)
 *
 * Implements a strictly allowlisted, typed API surface between the isolated
 * React renderer and the Electron main process via contextBridge.
 *
 * Raw ipcRenderer and Node.js primitives are NEVER exposed to the window object.
 */
const nexusAPI = {
  // Window controls
  minimizeWindow: () => {
    ipcRenderer.send('window-minimize')
  },
  maximizeWindow: () => {
    ipcRenderer.send('window-maximize')
  },
  closeWindow: () => {
    ipcRenderer.send('window-close')
  },
  isWindowMaximized: async () => {
    return ipcRenderer.invoke('is-window-maximized')
  },
  onWindowMaximizedChange: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const sub = (_e, isMax) => callback(isMax)
    ipcRenderer.on('window-maximized-state', sub)
    return () => ipcRenderer.removeListener('window-maximized-state', sub)
  },

  // Capabilities query
  getCapabilities: async () => {
    return ipcRenderer.invoke('broadcast-capabilities')
  },

  // Desktop / Screen Capture Discovery
  getSources: async () => {
    return ipcRenderer.invoke('get-sources')
  },

  // Secure File Dialog for Media and Images
  openFileDialog: async (options) => {
    return ipcRenderer.invoke('open-file-dialog', options)
  },

  // Project Persistence
  loadProject: async () => {
    return ipcRenderer.invoke('load-project')
  },
  saveProject: async (projectData) => {
    if (!projectData || typeof projectData !== 'object') {
      throw new Error('Invalid project payload passed to saveProject.')
    }
    return ipcRenderer.invoke('save-project', projectData)
  },
  getProjectPath: async () => {
    return ipcRenderer.invoke('get-project-path')
  },

  // System Hardware Stats Listener
  onSystemStats: (callback) => {
    if (typeof callback !== 'function') {
      throw new Error('Callback passed to onSystemStats must be a function.')
    }
    const subscription = (_event, stats) => {
      try {
        callback(stats)
      } catch (err) {
        console.error('[nexusAPI] Error in system stats subscriber:', err)
      }
    }
    ipcRenderer.on('system-stats-update', subscription)
    return () => {
      ipcRenderer.removeListener('system-stats-update', subscription)
    }
  },

  // Screen Capture Helper
  setNextScreenId: (screenId) => {
    if (typeof screenId === 'string') {
      ipcRenderer.send('set-next-screen-id', screenId)
    }
  },

  // Streaming transport channels (safe contracts)
  startStreamSingle: async (config) => {
    return ipcRenderer.invoke('start-stream-single', config)
  },
  stopStreamSingle: async (id) => {
    return ipcRenderer.invoke('stop-stream-single', id)
  },
  sendStreamChunk: (data) => {
    if (data && typeof data === 'object') {
      ipcRenderer.send('stream-chunk-single', data)
    }
  },

  // Virtual Camera transport channels (safe contracts)
  startVirtualCamera: async (config) => {
    return ipcRenderer.invoke('start-virtual-camera', config)
  },
  stopVirtualCamera: async () => {
    return ipcRenderer.invoke('stop-virtual-camera')
  },
  sendVirtualCameraChunk: (chunk) => {
    ipcRenderer.send('vcam-chunk', chunk)
  }
}

// Expose secure API to the main execution world
contextBridge.exposeInMainWorld('nexusAPI', nexusAPI)
// Legacy alias for existing components
contextBridge.exposeInMainWorld('electronAPI', nexusAPI)
