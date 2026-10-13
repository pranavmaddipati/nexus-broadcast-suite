const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  dialog,
  protocol,
  net
} = require('electron')
const path = require('node:path')
const os = require('node:os')
const { pathToFileURL } = require('node:url')
const { ProjectService } = require('./projectService')

// Register secure broadcast media scheme before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'nexus-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: false
    }
  }
])

let projectService = null
let mainWindow = null
let nextScreenId = null

function validateSender(event) {
  if (!event || !event.senderFrame) return true
  const url = event.senderFrame.url
  if (!url) return false
  // Allow local development server and packaged application assets
  return url.startsWith('http://localhost:5180') || url.startsWith('file://')
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: '#0f1115',
    autoHideMenuBar: true,
    frame: false,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Permission Restrictions: Allow only broadcast media capture (camera, microphone, screens)
  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowedPermissions = ['media', 'camera', 'microphone', 'display-capture', 'mediaKeySystem']
    callback(allowedPermissions.includes(permission))
  })

  // Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:5180; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5180; " +
          "style-src 'self' 'unsafe-inline' http://localhost:5180 https://fonts.googleapis.com; " +
          "font-src 'self' http://localhost:5180 https://fonts.gstatic.com data:; " +
          "img-src 'self' http://localhost:5180 data: blob: https: file: nexus-media:; " +
          "media-src 'self' http://localhost:5180 data: blob: file: nexus-media:; " +
          "connect-src 'self' http://localhost:5180 ws://localhost:5180 data: blob: nexus-media:;"
        ]
      }
    })
  })

  // Restrict navigation, new windows, webviews
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) event.preventDefault()
  })
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault())

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  } else {
    await mainWindow.webContents.session.clearCache()
    await mainWindow.loadURL('http://localhost:5180')
  }

  if (!app.isPackaged && process.env.NEXUS_DEVTOOLS === '1') {
    mainWindow.webContents.openDevTools()
  }

  // Window maximized state listeners
  mainWindow.on('maximize', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-state', true)
    }
  })
  mainWindow.on('unmaximize', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-state', false)
    }
  })

  // Periodic hardware telemetry
  const statsTimer = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    const metrics = app.getAppMetrics()
    const cpu = metrics.reduce((total, metric) => total + (metric.cpu?.percentCPUUsage || 0), 0)
    const ram = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
    mainWindow.webContents.send('system-stats-update', {
      cpu: Math.min(100, Math.round(cpu)),
      gpu: 0,
      ram: Math.round(ram),
      bitrate: 0,
      droppedFrames: 0,
      networkSpeed: 0
    })
  }, 1000)

  mainWindow.once('closed', () => {
    clearInterval(statsTimer)
    mainWindow = null
  })
}

// Register IPC handlers
function registerIpcHandlers() {
  // Broadcast capabilities
  ipcMain.handle('broadcast-capabilities', (event) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    return { streaming: false, ndi: false, virtualCamera: false }
  })

  // Desktop / screen capture sources
  ipcMain.handle('get-sources', async (event) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window']
    })
    return sources.map(source => ({
      id: source.id,
      name: source.name
    }))
  })

  // Secure open file dialog for images and media
  ipcMain.handle('open-file-dialog', async (event, options = {}) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    const type = options?.type || 'all'
    const filters = []
    if (type === 'image') {
      filters.push({ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'] })
    } else if (type === 'video' || type === 'media') {
      filters.push({ name: 'Media Files', extensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg'] })
    } else {
      filters.push({ name: 'Supported Media', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg'] })
    }
    filters.push({ name: 'All Files', extensions: ['*'] })

    const win = BrowserWindow.fromWebContents(event.sender) || mainWindow
    const result = await dialog.showOpenDialog(win, {
      title: options?.title || 'Select Media File',
      properties: ['openFile'],
      filters
    })

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true }
    }
    return { canceled: false, filePath: result.filePaths[0] }
  })

  // Project persistence handlers
  ipcMain.handle('load-project', async (event) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    if (!projectService) throw new Error('ProjectService not initialized')
    return projectService.loadProject()
  })

  ipcMain.handle('save-project', async (event, projectData) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    if (!projectService) throw new Error('ProjectService not initialized')
    return projectService.saveProject(projectData)
  })

  ipcMain.handle('get-project-path', (event) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    if (!projectService) throw new Error('ProjectService not initialized')
    return projectService.getProjectPath()
  })

  // Window control listeners
  ipcMain.on('window-minimize', (event) => {
    if (!validateSender(event)) return
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    if (!validateSender(event)) return
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('window-close', (event) => {
    if (!validateSender(event)) return
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  ipcMain.handle('is-window-maximized', (event) => {
    if (!validateSender(event)) return false
    const win = BrowserWindow.fromWebContents(event.sender)
    return win ? win.isMaximized() : false
  })

  // Screen capture hint
  ipcMain.on('set-next-screen-id', (event, screenId) => {
    if (!validateSender(event)) return
    nextScreenId = typeof screenId === 'string' ? screenId : null
  })

  // Streaming transport stubs (validated contracts)
  ipcMain.handle('start-stream-single', (event, _config) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    return { success: false, error: 'Streaming transport is not installed on this system.' }
  })

  ipcMain.handle('stop-stream-single', (event, _id) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    return { success: true }
  })

  ipcMain.on('stream-chunk-single', (event, _data) => {
    if (!validateSender(event)) return
    // Discard chunk safely in Phase 1
  })

  // Virtual Camera transport stubs (validated contracts)
  ipcMain.handle('start-virtual-camera', (event, _config) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    return { success: false, error: 'Virtual Camera bridge is not active.' }
  })

  ipcMain.handle('stop-virtual-camera', (event) => {
    if (!validateSender(event)) throw new Error('Unauthorized sender')
    return { success: true }
  })

  ipcMain.on('vcam-chunk', (event, _chunk) => {
    if (!validateSender(event)) return
    // Discard chunk safely in Phase 1
  })
}

app.whenReady().then(async () => {
  projectService = new ProjectService({ app })
  projectService.ensureDirectories()

  // Register nexus-media protocol handler for secure local media streaming
  protocol.handle('nexus-media', async (request) => {
    try {
      const url = new URL(request.url)
      let filePath = decodeURIComponent(url.pathname)
      if (url.host && url.host !== 'local-file') {
        filePath = url.host + (filePath.startsWith('/') ? filePath : '/' + filePath)
      }
      if (process.platform === 'win32' && filePath.startsWith('/') && /^[a-zA-Z]:/.test(filePath.slice(1))) {
        filePath = filePath.slice(1)
      }

      const ext = path.extname(filePath).toLowerCase()
      const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.mp4', '.webm', '.mov', '.mkv', '.avi', '.mp3', '.wav', '.ogg']
      if (!allowed.includes(ext)) {
        return new Response('Unsupported file type', { status: 403 })
      }

      const fileUrl = pathToFileURL(filePath).toString()
      return await net.fetch(fileUrl)
    } catch (err) {
      return new Response('File not found or unreadable: ' + (err?.message || err), { status: 404 })
    }
  })

  registerIpcHandlers()
  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
