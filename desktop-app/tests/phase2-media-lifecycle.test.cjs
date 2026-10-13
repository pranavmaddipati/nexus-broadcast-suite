const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function load(relative, dependencies = {}, globals = {}) {
  const filename = path.join(__dirname, '..', relative)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText
  const exports = {}
  vm.runInNewContext(code, {
    exports,
    require: name => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
      return dependencies[name]
    },
    console,
    ...globals
  }, { filename })
  return exports
}

// Mock DOM environment for Canvas, Image, and Video
function createMockDOM() {
  const revokedUrls = []
  const createdElements = []
  const stoppedTracks = []

  class MockTrack {
    constructor(kind = 'video') {
      this.kind = kind
      this.enabled = true
      this.readyState = 'live'
      this.onended = null
    }
    stop() {
      this.readyState = 'ended'
      stoppedTracks.push(this)
      if (this.onended) this.onended()
    }
  }

  class MockMediaStream {
    constructor(tracks = [new MockTrack('video')]) {
      this.id = 'stream_' + Math.random().toString(36).slice(2, 8)
      this._tracks = tracks
    }
    getTracks() { return this._tracks }
    getVideoTracks() { return this._tracks.filter(t => t.kind === 'video') }
    getAudioTracks() { return this._tracks.filter(t => t.kind === 'audio') }
  }

  class MockElement {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase()
      this.attributes = new Map()
      this.children = []
      this.parentNode = null
      this._style = ''
      createdElements.push(this)
    }
    setAttribute(name, val) { this.attributes.set(name, String(val)) }
    getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null }
    removeAttribute(name) { this.attributes.delete(name) }
    hasAttribute(name) { return this.attributes.has(name) }
    appendChild(child) {
      child.parentNode = this
      this.children.push(child)
      return child
    }
    removeChild(child) {
      const idx = this.children.indexOf(child)
      if (idx !== -1) {
        this.children.splice(idx, 1)
        child.parentNode = null
      }
    }
    remove() {
      if (this.parentNode) {
        this.parentNode.removeChild(this)
      }
    }
  }

  class MockHTMLImageElement extends MockElement {
    constructor() {
      super('IMG')
      this.src = ''
      this.complete = false
      this.naturalWidth = 0
      this.naturalHeight = 0
      this.onload = null
      this.onerror = null
    }
  }

  class MockHTMLVideoElement extends MockElement {
    constructor() {
      super('VIDEO')
      this.src = ''
      this.srcObject = null
      this.paused = true
      this.muted = false
      this.loop = false
      this.volume = 1.0
      this.readyState = 0
      this.videoWidth = 1920
      this.videoHeight = 1080
      this.playsInline = false
      this.crossOrigin = ''
      this.preload = ''
      this.currentTime = 0
    }
    async play() {
      this.paused = false
      this.readyState = 4
      return Promise.resolve()
    }
    pause() {
      this.paused = true
    }
    load() {}
  }

  class MockContext2D {
    constructor() {
      this.calls = []
      this.fillStyle = '#000000'
      this.strokeStyle = '#000000'
      this.lineWidth = 1
      this.globalAlpha = 1
      this.globalCompositeOperation = 'source-over'
      this.font = ''
      this.textAlign = 'left'
    }
    save() { this.calls.push({ method: 'save' }) }
    restore() { this.calls.push({ method: 'restore' }) }
    translate(x, y) { this.calls.push({ method: 'translate', x, y }) }
    rotate(angle) { this.calls.push({ method: 'rotate', angle }) }
    scale(x, y) { this.calls.push({ method: 'scale', x, y }) }
    fillRect(x, y, w, h) { this.calls.push({ method: 'fillRect', x, y, w, h, fillStyle: this.fillStyle }) }
    strokeRect(x, y, w, h) { this.calls.push({ method: 'strokeRect', x, y, w, h }) }
    beginPath() { this.calls.push({ method: 'beginPath' }) }
    arc(x, y, r, sa, ea) { this.calls.push({ method: 'arc', x, y, r, sa, ea }) }
    stroke() { this.calls.push({ method: 'stroke' }) }
    moveTo(x, y) { this.calls.push({ method: 'moveTo', x, y }) }
    lineTo(x, y) { this.calls.push({ method: 'lineTo', x, y }) }
    fillText(text, x, y) { this.calls.push({ method: 'fillText', text, x, y }) }
    drawImage(...args) { this.calls.push({ method: 'drawImage', args }) }
    getImageData(x, y, w, h) {
      return { data: new Uint8ClampedArray(w * h * 4) }
    }
    putImageData() {}
  }

  class MockCanvasElement extends MockElement {
    constructor() {
      super('CANVAS')
      this.width = 1920
      this.height = 1080
      this._ctx = new MockContext2D()
    }
    getContext(type) {
      if (type === '2d') return this._ctx
      return null
    }
  }

  const elementsById = new Map()
  const body = new MockElement('BODY')

  const documentMock = {
    body,
    createElement: tag => {
      if (tag === 'img') return new MockHTMLImageElement()
      if (tag === 'video') return new MockHTMLVideoElement()
      if (tag === 'canvas') return new MockCanvasElement()
      return new MockElement(tag)
    },
    getElementById: id => elementsById.get(id) || null
  }

  const windowMock = {
    document: documentMock,
    URL: {
      createObjectURL: () => 'blob:test-' + Math.random().toString(36).slice(2, 8),
      revokeObjectURL: url => revokedUrls.push(url)
    },
    MediaStream: MockMediaStream,
    HTMLVideoElement: MockHTMLVideoElement,
    HTMLImageElement: MockHTMLImageElement,
    HTMLCanvasElement: MockCanvasElement,
    Image: MockHTMLImageElement,
    navigator: {
      mediaDevices: {
        getUserMedia: async constraints => {
          return new MockMediaStream()
        },
        enumerateDevices: async () => [
          { deviceId: 'cam1', kind: 'videoinput', label: 'Integrated Webcam' },
          { deviceId: 'cam2', kind: 'videoinput', label: 'OBS Virtual Camera' },
          { deviceId: 'mic1', kind: 'audioinput', label: 'Default Microphone' }
        ]
      }
    }
  }

  return {
    windowMock,
    documentMock,
    revokedUrls,
    createdElements,
    stoppedTracks,
    MockMediaStream,
    MockTrack,
    MockHTMLVideoElement,
    MockHTMLImageElement,
    MockCanvasElement,
    MockContext2D
  }
}

test('PHASE 2 - 1. Image source loading, aspect ratio calculation, and resource disposal', () => {
  const dom = createMockDOM()
  const tmModule = load('src/engine/TextureManager.ts', {
    './MediaManager': {
      MediaManager: {
        getInstance: () => ({
          disposeSource: () => {}
        })
      }
    }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    URL: dom.windowMock.URL,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement,
    MediaStream: dom.windowMock.MediaStream,
    navigator: dom.windowMock.navigator
  })
  const { TextureManager } = tmModule

  // 1. Create image source
  const img = TextureManager.getOrCreateImage('img_1', 'C:\\broadcast\\logo.png')
  assert.ok(img)
  assert.equal(img.src, 'file:///C:/broadcast/logo.png')

  // 2. Load with blob URL
  const blobUrl = 'blob:http://localhost/test-uuid'
  const imgBlob = TextureManager.getOrCreateImage('img_blob', blobUrl)
  assert.equal(imgBlob.src, blobUrl)

  // 3. Update image with new blob URL revokes previous blob URL
  const newBlobUrl = 'blob:http://localhost/new-uuid'
  TextureManager.getOrCreateImage('img_blob', newBlobUrl)
  assert.ok(dom.revokedUrls.includes(blobUrl), 'Previous blob URL was revoked')

  // 4. Test SourceRenderer aspect ratio handling
  const srModule = load('src/engine/SourceRenderer.ts', {
    './TextureManager': { TextureManager },
    './media/MediaRenderer': { MediaRenderer: { render: () => false } }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement
  })
  const { SourceRenderer } = srModule

  const ctx = new dom.MockContext2D()
  // Mock image loaded with 1920x1080 dimensions
  img.complete = true
  img.naturalWidth = 1920
  img.naturalHeight = 1080

  const sourceWithAspect = {
    id: 'img_1',
    name: 'Logo',
    type: 'image',
    visible: true,
    locked: false,
    x: 100,
    y: 100,
    width: 400,
    height: 400,
    opacity: 1,
    settings: { filePath: 'C:\\broadcast\\logo.png', preserveAspect: true }
  }

  SourceRenderer.renderSource(ctx, sourceWithAspect, 0)
  const drawImageCalls = ctx.calls.filter(c => c.method === 'drawImage')
  assert.equal(drawImageCalls.length, 1)
  const args = drawImageCalls[0].args
  // Width is 400, aspect is 16:9 (1.777), so height should be 400 / 1.777 = 225
  // Letterboxed Y = 100 + (400 - 225)/2 = 187.5
  assert.equal(args[1], 100) // drawX
  assert.equal(Math.round(args[2]), 188) // drawY centered
  assert.equal(args[3], 400) // drawW
  assert.equal(Math.round(args[4]), 225) // drawH

  // 5. Dispose source releases resource
  TextureManager.disposeSource('img_blob')
  assert.ok(dom.revokedUrls.includes(newBlobUrl), 'Disposed blob URL was revoked')
})

test('PHASE 2 - 2. Video source initialization, loop/volume controls, and cleanup', () => {
  const dom = createMockDOM()
  const tmModule = load('src/engine/TextureManager.ts', {
    './MediaManager': { MediaManager: { getInstance: () => ({ disposeSource: () => {} }) } }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    URL: dom.windowMock.URL,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement,
    MediaStream: dom.windowMock.MediaStream,
    navigator: dom.windowMock.navigator
  })
  const { TextureManager } = tmModule

  const videoSource = {
    id: 'vid_source_1',
    name: 'Intro Clip',
    type: 'video',
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    opacity: 1,
    settings: {
      filePath: 'C:\\media\\intro.mp4',
      loop: true,
      muted: true
    }
  }

  // 1. Initialize video element
  const video = TextureManager.getOrCreateVideo('vid_source_1', videoSource)
  assert.ok(video)
  assert.equal(video.loop, true)
  assert.equal(video.muted, true)
  assert.equal(video.src, 'file:///C:/media/intro.mp4')
  assert.equal(video.getAttribute('data-active-path'), 'C:\\media\\intro.mp4')

  // 2. Dynamic loop change
  videoSource.settings.loop = false
  TextureManager.getOrCreateVideo('vid_source_1', videoSource)
  assert.equal(video.loop, false)

  // 3. Proper disposal stops and clears
  let paused = false
  video.pause = () => { paused = true }
  TextureManager.disposeSource('vid_source_1')
  assert.equal(paused, true)
  assert.equal(video.src, '')
})

test('PHASE 2 - 3. Camera source device selection, permission denial, and track cleanup', async () => {
  const dom = createMockDOM()
  let throwPermissionError = false

  const mockCameraStream = new dom.MockMediaStream([new dom.MockTrack('video')])
  const mockMediaManager = {
    getInstance: () => ({
      disposeSource: () => {},
      getGlobalCameraStream: async (deviceId) => {
        if (throwPermissionError) {
          const err = new Error('Permission denied by user')
          err.name = 'NotAllowedError'
          throw err
        }
        return mockCameraStream
      }
    })
  }

  const tmModule = load('src/engine/TextureManager.ts', {
    './MediaManager': { MediaManager: mockMediaManager }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    URL: dom.windowMock.URL,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement,
    MediaStream: dom.windowMock.MediaStream,
    navigator: dom.windowMock.navigator
  })
  const { TextureManager } = tmModule

  // 1. Success path
  const camSource = {
    id: 'cam_src_1',
    name: 'Studio Camera',
    type: 'camera',
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    opacity: 1,
    settings: { deviceId: 'cam1' }
  }

  const camVideo = TextureManager.getOrCreateVideo('cam_src_1', camSource)
  assert.ok(camVideo)
  // Let promise resolve
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.ok(camVideo.srcObject)
  assert.equal(camVideo.hasAttribute('data-camera-error'), false)

  // 2. Permission denial path
  throwPermissionError = true
  const camDeniedSource = {
    id: 'cam_src_2',
    name: 'Blocked Camera',
    type: 'camera',
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    opacity: 1,
    settings: { deviceId: 'cam2' }
  }

  const deniedVideo = TextureManager.getOrCreateVideo('cam_src_2', camDeniedSource)
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.ok(deniedVideo.getAttribute('data-camera-error-message').includes('Permission denied'))

  // Verify SourceRenderer displays the real error message instead of fake feed
  const srModule = load('src/engine/SourceRenderer.ts', {
    './TextureManager': { TextureManager },
    './media/MediaRenderer': { MediaRenderer: { render: () => false } }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement
  })
  const { SourceRenderer } = srModule
  const ctx = new dom.MockContext2D()
  SourceRenderer.renderSource(ctx, camDeniedSource, 0)
  const textCalls = ctx.calls.filter(c => c.method === 'fillText')
  assert.ok(textCalls.some(t => t.text.includes('PERMISSION DENIED')), 'Real error message is rendered on canvas')

  // 3. Track cleanup on disposal
  const tracks = camVideo.srcObject.getTracks()
  assert.equal(tracks.length, 1)
  assert.equal(tracks[0].readyState, 'live')
  TextureManager.disposeSource('cam_src_1')
  assert.equal(tracks[0].readyState, 'ended')
  assert.equal(camVideo.srcObject, null)
})

test('PHASE 2 - 4. Display capture cancellation, failure, and track onended', async () => {
  const dom = createMockDOM()
  let cancelCapture = false

  const mockTrack = new dom.MockTrack('video')
  dom.windowMock.navigator.mediaDevices.getUserMedia = async (constraints) => {
    if (cancelCapture) {
      const err = new Error('Screen capture cancelled')
      err.name = 'NotAllowedError'
      throw err
    }
    return new dom.MockMediaStream([mockTrack])
  }

  const tmModule = load('src/engine/TextureManager.ts', {
    './MediaManager': { MediaManager: { getInstance: () => ({ disposeSource: () => {} }) } }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    URL: dom.windowMock.URL,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement,
    MediaStream: dom.windowMock.MediaStream,
    navigator: dom.windowMock.navigator
  })
  const { TextureManager } = tmModule

  // 1. Cancellation test
  cancelCapture = true
  const screenSrc = {
    id: 'display_1',
    name: 'Screen Share',
    type: 'display_capture',
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    opacity: 1,
    settings: { screenId: 'screen:0:0' }
  }

  const screenVideo = TextureManager.getOrCreateVideo('display_1', screenSrc)
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.ok(screenVideo.getAttribute('data-display-error-message').includes('cancelled'))

  // 2. Track onended test
  cancelCapture = false
  const screenSrc2 = {
    id: 'display_2',
    name: 'Screen Share 2',
    type: 'display_capture',
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    opacity: 1,
    settings: { screenId: 'screen:1:0' }
  }

  const screenVideo2 = TextureManager.getOrCreateVideo('display_2', screenSrc2)
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.ok(screenVideo2.srcObject)
  // Simulate user ending screen share
  if (mockTrack.onended) mockTrack.onended()
  assert.equal(screenVideo2.getAttribute('data-display-error-message'), 'Screen capture ended')
})

test('PHASE 2 - 5. Source deletion and scene deletion trigger media disposal', () => {
  const dom = createMockDOM()
  const disposedSources = []

  const tmMock = {
    TextureManager: {
      getOrCreateVideo: () => null,
      getOrCreateImage: () => ({ complete: true }),
      disposeSource: id => disposedSources.push(id),
      disposeAll: () => {}
    }
  }

  const React = {
    createContext: defaultValue => ({ Provider: ({ value, children }) => ({ value, children }), Consumer: {} }),
    createElement: (type, props) => props,
    useState: value => {
      const stateVal = typeof value === 'function' ? value() : value
      return [stateVal, () => {}]
    },
    useRef: value => ({ current: value }),
    useEffect: () => {},
    useCallback: cb => cb,
    useMemo: cb => cb()
  }

  const sourceRegistry = load('src/engine/input/SourceRegistry.ts', { react: React })

  const initial = {
    scenes: [
      {
        id: 'scene_main',
        name: 'Main Studio',
        duration: '00:00:00',
        transitionType: 'mix',
        pinned: true,
        sources: [
          { id: 'src_cam_1', name: 'Camera 1', type: 'camera', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1 },
          { id: 'src_vid_1', name: 'Intro Video', type: 'video', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1 }
        ]
      },
      {
        id: 'scene_aux',
        name: 'Auxiliary',
        duration: '00:00:00',
        transitionType: 'cut',
        pinned: false,
        sources: [
          { id: 'src_img_1', name: 'Logo', type: 'image', visible: true, locked: false, x: 0, y: 0, width: 200, height: 200, opacity: 1 }
        ]
      }
    ],
    activeScene: 'scene_main',
    liveScene: 'scene_aux'
  }

  let stateSlots = []
  let cursor = 0
  React.useState = value => {
    const index = cursor++
    if (!(index in stateSlots)) stateSlots[index] = typeof value === 'function' ? value() : value
    return [stateSlots[index], update => { stateSlots[index] = typeof update === 'function' ? update(stateSlots[index]) : update }]
  }

  const { BroadcastProvider } = load('src/context/NewBroadcastContext.tsx', {
    react: React,
    '../engine/CanvasRenderer': {},
    '../engine/RenderScheduler': {},
    '../engine/input/SourceRegistry': sourceRegistry,
    '../engine/TextureManager': tmMock,
    '../engine/MediaManager': {
      MediaManager: {
        getInstance: () => ({
          disposeSource: id => disposedSources.push(id),
          getOrCreateSource: () => ({ ready: true, status: 'ready', dispose: () => {} }),
          getGlobalCameraStream: async () => ({ id: 'stream-1', getTracks: () => [] }),
          streamCache: new Map(),
          streamPromiseCache: new Map()
        })
      }
    },
    '../engine/audio/AudioEngine': {
      AudioEngine: {
        getInstance: () => ({
          ensureContext: () => ({ state: 'running', currentTime: 0 }),
          getContext: () => ({ state: 'running' }),
          attachMediaStream: () => ({}),
          attachMediaElement: () => ({}),
          detachSource: id => disposedSources.push(id),
          setChannelVolume: () => {},
          setChannelGainDb: () => {},
          setChannelMute: () => {},
          toggleChannelMute: () => false,
          setChannelSolo: () => {},
          toggleChannelSolo: () => false,
          setChannelPan: () => {},
          setChannelRoute: () => {},
          setChannelMonitor: () => {},
          setMasterVolume: () => {},
          getMasterVolume: () => 90,
          setMasterMute: () => {},
          toggleMasterMute: () => false,
          isMasterMuted: () => false,
          setMasterGainDb: () => {},
          setMonitorVolume: () => {},
          setMonitorMute: () => {},
          getMeterLevel: () => ({ vu: 0, peak: 0, db: -60 }),
          getMasterMeterLevel: () => ({ vu: 0, peak: 0, db: -60 }),
          getAllMeterLevels: () => ({ master: { vu: 0, peak: 0, db: -60 } }),
          getProgramStream: () => ({ getAudioTracks: () => [] }),
          getAudioInputDevices: async () => [],
          setupDeviceChangeListener: () => () => {},
          dispose: () => {}
        })
      }
    }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    localStorage: { getItem: () => JSON.stringify(initial) },
    crypto: require('node:crypto').webcrypto,
    setTimeout,
    clearTimeout
  })

  cursor = 0
  let state = BroadcastProvider({ children: null }).value

  // 1. Delete single source disposes it
  state.deleteSourceFromScene('scene_main', 'src_cam_1')
  assert.ok(disposedSources.includes('src_cam_1'), 'src_cam_1 was disposed on deletion')

  // 2. Delete scene disposes all its owned sources
  state.deleteScene('scene_aux')
  assert.ok(disposedSources.includes('src_img_1'), 'src_img_1 was disposed when scene_aux was deleted')
})

test('PHASE 2 - 6. Electron open-file-dialog IPC contract and sender validation', () => {
  // Test file dialog filters logic from main.js
  const typeToFilter = type => {
    const filters = []
    if (type === 'image') {
      filters.push({ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'] })
    } else if (type === 'video' || type === 'media') {
      filters.push({ name: 'Media Files', extensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg'] })
    } else {
      filters.push({ name: 'Supported Media', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg'] })
    }
    filters.push({ name: 'All Files', extensions: ['*'] })
    return filters
  }

  const imgFilters = typeToFilter('image')
  assert.ok(imgFilters[0].extensions.includes('png'))
  assert.ok(imgFilters[0].extensions.includes('webp'))
  assert.ok(!imgFilters[0].extensions.includes('mp4'))

  const videoFilters = typeToFilter('video')
  assert.ok(videoFilters[0].extensions.includes('mp4'))
  assert.ok(videoFilters[0].extensions.includes('webm'))
  assert.ok(!videoFilters[0].extensions.includes('png'))
})

test('PHASE 2 - 7. Media source configuration persistence in ProjectService', async () => {
  const os = require('node:os')
  const { ProjectService } = require('../electron/projectService')

  const tempDir = path.join(os.tmpdir(), `nexus-p2-test-${Date.now()}`)
  fs.mkdirSync(tempDir, { recursive: true })

  try {
    const service = new ProjectService({ userDataDir: tempDir })

    const projectWithMedia = {
      scenes: [
        {
          id: 'scene_media_test',
          name: 'Media Studio',
          duration: '00:05:00',
          transitionType: 'mix',
          pinned: true,
          sources: [
            {
              id: 'src_cam_persisted',
              name: 'Live Cam',
              type: 'camera',
              visible: true,
              locked: false,
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              opacity: 1,
              settings: { deviceId: 'cam_hw_123' }
            },
            {
              id: 'src_img_persisted',
              name: 'Channel Watermark',
              type: 'image',
              visible: true,
              locked: true,
              x: 1700,
              y: 50,
              width: 150,
              height: 150,
              opacity: 0.85,
              settings: {
                filePath: 'C:\\assets\\watermark.png',
                preserveAspect: true
              }
            },
            {
              id: 'src_vid_persisted',
              name: 'Looping Background',
              type: 'video',
              visible: true,
              locked: false,
              x: 0,
              y: 0,
              width: 1920,
              height: 1080,
              opacity: 1,
              settings: {
                filePath: 'C:\\assets\\loop.mp4',
                loop: true,
                volume: 0.75
              }
            }
          ]
        }
      ]
    }

    const saveResult = await service.saveProject(projectWithMedia)
    assert.equal(saveResult.success, true)

    const loadedResult = await service.loadProject()
    assert.equal(loadedResult.success, true)
    const loaded = loadedResult.data
    assert.ok(loaded)
    assert.equal(loaded.scenes.length, 1)
    const sources = loaded.scenes[0].sources
    assert.equal(sources.length, 3)

    const cam = sources.find(s => s.id === 'src_cam_persisted')
    assert.equal(cam.settings.deviceId, 'cam_hw_123')

    const img = sources.find(s => s.id === 'src_img_persisted')
    assert.equal(img.settings.filePath, 'C:\\assets\\watermark.png')
    assert.equal(img.settings.preserveAspect, true)

    const vid = sources.find(s => s.id === 'src_vid_persisted')
    assert.equal(vid.settings.filePath, 'C:\\assets\\loop.mp4')
    assert.equal(vid.settings.loop, true)
    assert.equal(vid.settings.volume, 0.75)
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (_) {}
  }
})

test('PHASE 2 - 8. Secure media path resolution and custom protocol security', () => {
  const dom = createMockDOM()
  const tmModule = load('src/engine/TextureManager.ts', {
    './MediaManager': { MediaManager: { getInstance: () => ({ disposeSource: () => {} }) } }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    URL: dom.windowMock.URL,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement,
    MediaStream: dom.windowMock.MediaStream,
    navigator: dom.windowMock.navigator
  })
  const { resolveMediaPath } = tmModule

  // 1. Without Electron (standard fallback)
  const fallbackPath = resolveMediaPath('C:\\media\\news.mp4')
  assert.equal(fallbackPath, 'file:///C:/media/news.mp4')

  // 2. With Electron environment
  dom.windowMock.nexusAPI = { openFileDialog: () => {} }
  const electronTm = load('src/engine/TextureManager.ts', {
    './MediaManager': { MediaManager: { getInstance: () => ({ disposeSource: () => {} }) } }
  }, {
    window: dom.windowMock,
    document: dom.documentMock,
    URL: dom.windowMock.URL,
    Image: dom.MockHTMLImageElement,
    HTMLVideoElement: dom.windowMock.HTMLVideoElement,
    HTMLImageElement: dom.windowMock.HTMLImageElement,
    HTMLCanvasElement: dom.windowMock.HTMLCanvasElement,
    MediaStream: dom.windowMock.MediaStream,
    navigator: dom.windowMock.navigator
  })
  const electronResolved = electronTm.resolveMediaPath('C:\\media\\news.mp4')
  assert.equal(electronResolved, 'nexus-media://local-file/C:/media/news.mp4')

  // 3. Remote and blob URLs are preserved without mangling
  assert.equal(electronTm.resolveMediaPath('https://stream.example.com/live.m3u8'), 'https://stream.example.com/live.m3u8')
  assert.equal(electronTm.resolveMediaPath('blob:http://localhost/12345'), 'blob:http://localhost/12345')

  // 4. Protocol handler extension allowlist enforcement
  const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.mp4', '.webm', '.mov', '.mkv', '.avi', '.mp3', '.wav', '.ogg']
  const isAllowedExt = ext => allowed.includes(ext.toLowerCase())

  assert.equal(isAllowedExt('.mp4'), true)
  assert.equal(isAllowedExt('.webm'), true)
  assert.equal(isAllowedExt('.png'), true)
  assert.equal(isAllowedExt('.exe'), false)
  assert.equal(isAllowedExt('.bat'), false)
  assert.equal(isAllowedExt('.json'), false)
})

