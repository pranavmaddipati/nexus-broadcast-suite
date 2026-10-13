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

function frames() {
  let next = 0
  let time = 0
  const callbacks = new Map()
  return {
    globals: {
      requestAnimationFrame: callback => { callbacks.set(++next, callback); return next },
      cancelAnimationFrame: id => callbacks.delete(id),
      performance: { now: () => time },
    },
    count: () => callbacks.size,
    advance: now => { time = now; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(now)) }
  }
}

function createProvider(initialScenes = null) {
  const clock = frames()
  const slots = []
  let cursor = 0
  const initial = {
    scenes: initialScenes || [
      { id: 'scene_test_1', name: 'Studio A', duration: '00:00:00', transitionType: 'fade', pinned: true, sources: [] },
      { id: 'scene_test_2', name: 'Studio B', duration: '00:00:00', transitionType: 'fade', pinned: true, sources: [] }
    ],
    activeScene: 'scene_test_1',
    liveScene: 'scene_test_2'
  }

  const React = {
    createContext: defaultValue => ({ Provider: ({ value, children }) => ({ value, children }), Consumer: {} }),
    createElement: (type, props) => props,
    useState: value => {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof value === 'function' ? value() : value
      return [slots[index], update => { slots[index] = typeof update === 'function' ? update(slots[index]) : update }]
    },
    useRef: value => { const index = cursor++; return (slots[index] ||= { current: value }) },
    useEffect: () => {},
    useCallback: cb => cb,
    useMemo: cb => cb()
  }

  const alerts = []
  const sourceRegistry = load('src/engine/input/SourceRegistry.ts', { react: React })
  const { BroadcastProvider } = load('src/context/NewBroadcastContext.tsx', {
    react: React,
    '../engine/CanvasRenderer': {},
    '../engine/RenderScheduler': {},
    '../engine/input/SourceRegistry': sourceRegistry,
    '../engine/TextureManager': {
      TextureManager: {
        getOrCreateVideo: () => null,
        getOrCreateImage: () => ({ complete: true }),
        disposeSource: () => {},
        disposeAll: () => {}
      }
    },
    '../engine/MediaManager': {
      MediaManager: {
        getInstance: () => ({
          disposeSource: () => {},
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
          detachSource: () => {},
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
    ...clock.globals,
    setTimeout,
    clearTimeout,
    window: {},
    localStorage: { getItem: () => JSON.stringify(initial) },
    alert: msg => alerts.push(msg),
    crypto: require('node:crypto').webcrypto
  })

  return {
    clock,
    alerts,
    sourceRegistry: sourceRegistry.SourceRegistry,
    render: () => {
      cursor = 0
      return BroadcastProvider({ children: null }).value
    }
  }
}

test('FIX 1: Creating a scene assigns a unique ID and independent sources list', () => {
  const app = createProvider()
  let state = app.render()
  const initialCount = state.scenes.length

  state.addScene('Field Reporter')
  state = app.render()

  assert.equal(state.scenes.length, initialCount + 1)
  const created = state.scenes[state.scenes.length - 1]
  assert.equal(created.name, 'Field Reporter')
  assert.ok(created.id.startsWith('scene_'))
  assert.ok(Array.isArray(created.sources))
  assert.equal(created.sources.length, 0)
  // Selected for Preview
  assert.equal(state.activeScene, created.id)
  // Program remains unchanged
  assert.equal(state.liveScene, 'scene_test_2')
})

test('FIX 1: Rejecting empty or whitespace-only scene names', () => {
  const app = createProvider()
  let state = app.render()
  const countBefore = state.scenes.length

  state.addScene('')
  state = app.render()
  assert.equal(state.scenes.length, countBefore, 'Empty scene name must be rejected')

  state.addScene('   \t  \n ')
  state = app.render()
  assert.equal(state.scenes.length, countBefore, 'Whitespace-only scene name must be rejected')

  // Verify warning notification was added
  const warningToast = state.toasts.find(t => t.type === 'warning' && t.message.includes('empty'))
  assert.ok(warningToast, 'Warning toast must be recorded for empty scene name')
})

test('FIX 1: Duplicate scene names are disambiguated without ID collisions', () => {
  const app = createProvider()
  let state = app.render()

  state.addScene('Main News')
  state = app.render()
  const first = state.scenes[state.scenes.length - 1]

  state.addScene('Main News')
  state = app.render()
  const second = state.scenes[state.scenes.length - 1]

  assert.notEqual(first.id, second.id, 'Scene IDs must be strictly unique')
  assert.equal(first.name, 'Main News')
  assert.equal(second.name, 'Main News (2)', 'Duplicate name should be sensibly numbered')
})

test('FIX 1 & 2: Creating multiple independent scenes prevents cross-scene mutation', () => {
  const app = createProvider()
  let state = app.render()

  state.addScene('Scene Alpha')
  state.addScene('Scene Beta')
  state = app.render()

  const sceneA = state.scenes.find(s => s.name === 'Scene Alpha')
  const sceneB = state.scenes.find(s => s.name === 'Scene Beta')
  assert.ok(sceneA && sceneB)

  // Add source only to Scene Alpha
  const srcId = state.addSourceToScene(sceneA.id, 'color_source', 'Alpha Backdrop')
  state = app.render()

  const updatedA = state.scenes.find(s => s.id === sceneA.id)
  const updatedB = state.scenes.find(s => s.id === sceneB.id)

  assert.equal(updatedA.sources.length, 1)
  assert.equal(updatedA.sources[0].id, srcId)
  assert.equal(updatedB.sources.length, 0, 'Scene Beta must remain untouched')
})

test('FIX 2: Adding a source assigns a unique ID and correct type from SourceRegistry', () => {
  const app = createProvider()
  let state = app.render()
  const targetSceneId = state.scenes[0].id

  const srcId = state.addSourceToScene(targetSceneId, 'camera', 'Camera 1')
  state = app.render()

  const targetScene = state.scenes.find(s => s.id === targetSceneId)
  const source = targetScene.sources.find(s => s.id === srcId)

  assert.ok(source, 'Source must exist in target scene')
  assert.ok(source.id.startsWith('src_'))
  assert.equal(source.type, 'camera')
  assert.equal(source.name, 'Camera 1')
  assert.equal(source.visible, true)
  assert.equal(source.locked, false)
  assert.equal(source.zIndex, 1)
  assert.equal(source.width, 1920)
  assert.equal(source.height, 1080)
})

test('FIX 2: Color source defaults to a concrete hex color, not a CSS variable string', () => {
  const app = createProvider()
  let state = app.render()
  const targetSceneId = state.scenes[0].id

  const srcId = state.addSourceToScene(targetSceneId, 'color_source', 'Test Color')
  state = app.render()

  const targetScene = state.scenes.find(s => s.id === targetSceneId)
  const source = targetScene.sources.find(s => s.id === srcId)

  assert.ok(source)
  const bg = source.settings?.backgroundColor
  assert.ok(bg && !bg.startsWith('var('), 'Canvas 2D background must not use CSS variable')
  assert.match(bg, /^#[0-9a-fA-F]{6}$/)
})

test('FIX 2: Disambiguating duplicate source names within the same scene', () => {
  const app = createProvider()
  let state = app.render()
  const targetSceneId = state.scenes[0].id

  state.addSourceToScene(targetSceneId, 'camera', 'Overhead')
  state.addSourceToScene(targetSceneId, 'camera', 'Overhead')
  state = app.render()

  const targetScene = state.scenes.find(s => s.id === targetSceneId)
  assert.equal(targetScene.sources.length, 2)
  assert.equal(targetScene.sources[0].name, 'Overhead')
  assert.equal(targetScene.sources[1].name, 'Overhead 2')
  assert.notEqual(targetScene.sources[0].id, targetScene.sources[1].id)
})

test('FIX 4: Notifications are recorded for operations and support dismissal', () => {
  const app = createProvider()
  let state = app.render()

  // Trigger toast via scene creation
  state.addScene('Notification Test')
  state = app.render()

  const toast = state.toasts.find(t => t.message.includes('Notification Test'))
  assert.ok(toast, 'Success toast must be registered on scene creation')
  assert.equal(toast.type, 'success')

  // Dismiss toast
  state.removeToast(toast.id)
  state = app.render()
  assert.ok(!state.toasts.some(t => t.id === toast.id), 'Toast must be removed after dismissal')
})

test('FIX 5: Preview and Program independence and CUT/TAKE transitions', () => {
  const app = createProvider()
  let state = app.render()

  assert.equal(state.activeScene, 'scene_test_1')
  assert.equal(state.liveScene, 'scene_test_2')

  // Selecting a new preview scene must NOT change liveScene
  state.selectScene('scene_test_2')
  state = app.render()
  assert.equal(state.activeScene, 'scene_test_2')
  assert.equal(state.liveScene, 'scene_test_2')

  state.addScene('Third Scene')
  state = app.render()
  const thirdId = state.scenes[state.scenes.length - 1].id
  assert.equal(state.activeScene, thirdId)
  assert.equal(state.liveScene, 'scene_test_2', 'LiveScene must remain unaffected by new scene preview')

  // CUT switches liveScene to activeScene
  state.cutTransition()
  state = app.render()
  assert.equal(state.liveScene, thirdId, 'CUT must transfer preview scene to program')
})

test('FIX 6: Preload API and IPC consistency for window controls and persistence', () => {
  // Test preload definition directly
  const preloadPath = path.join(__dirname, '..', 'electron', 'preload.js')
  const preloadCode = fs.readFileSync(preloadPath, 'utf8')

  // Ensure window controls are exposed
  assert.match(preloadCode, /minimizeWindow:/)
  assert.match(preloadCode, /maximizeWindow:/)
  assert.match(preloadCode, /closeWindow:/)
  assert.match(preloadCode, /isWindowMaximized:/)
  assert.match(preloadCode, /onWindowMaximizedChange:/)

  // Ensure contextBridge.exposeInMainWorld is used securely
  assert.match(preloadCode, /contextBridge\.exposeInMainWorld\('nexusAPI'/)
  assert.doesNotMatch(preloadCode, /window\.require/, 'Preload must never reintroduce window.require')
})

test('FIX 6 & H: ProjectService persists and restores created scenes and sources safely', async () => {
  const { ProjectService } = require('../electron/projectService.js')
  const tmpDir = path.join(require('node:os').tmpdir(), `nexus-repairs-test-${Date.now()}`)
  const service = new ProjectService({ userDataDir: tmpDir })
  service.ensureDirectories()

  const projectPayload = {
    scenes: [
      {
        id: 'scene_persisted_1',
        name: 'Breaking News Desk',
        duration: '00:00:00',
        transitionType: 'mix',
        pinned: true,
        sources: [
          {
            id: 'src_cam_desk',
            zIndex: 1,
            name: 'Desk Camera',
            type: 'camera',
            visible: true,
            locked: false,
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            opacity: 1,
            settings: { deviceId: 'cam-01' }
          }
        ]
      }
    ],
    activeScene: 'scene_persisted_1',
    liveScene: 'scene_persisted_1'
  }

  const saveRes = await service.saveProject(projectPayload)
  assert.equal(saveRes.success, true)

  const loadRes = await service.loadProject()
  assert.equal(loadRes.success, true)
  assert.equal(loadRes.data.scenes.length, 1)
  assert.equal(loadRes.data.scenes[0].name, 'Breaking News Desk')
  assert.equal(loadRes.data.scenes[0].sources[0].id, 'src_cam_desk')

  // Clean up
  fs.rmSync(tmpDir, { recursive: true, force: true })
})
