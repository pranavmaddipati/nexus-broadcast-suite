const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative, dependencies = {}, globals = {}) {
  const filename = path.join(__dirname, '..', relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, console, ...globals }, { filename });
  return exports;
}

function frames() {
  let next = 0;
  let time = 0;
  const callbacks = new Map();
  return {
    globals: {
      requestAnimationFrame: callback => { callbacks.set(++next, callback); return next; },
      cancelAnimationFrame: id => callbacks.delete(id),
      performance: { now: () => time },
    },
    count: () => callbacks.size,
    advance: now => { time = now; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(now)); }
  };
}

function provider() {
  const clock = frames();
  const slots = [];
  let cursor = 0;
  const initial = { scenes: [
    { id: 'a', name: 'A', sources: [] }, { id: 'b', name: 'B', sources: [] }, { id: 'c', name: 'C', sources: [] }
  ], activeScene: 'b', liveScene: 'a' };
  const React = {
    createContext: () => ({ Provider: 'provider' }),
    createElement: (type, props) => props,
    useState: value => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof value === 'function' ? value() : value;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef: value => { const index = cursor++; return slots[index] ||= { current: value }; },
    useEffect: () => {}, useCallback: callback => callback, useMemo: callback => callback(),
  };
  const alerts = [];
  const sourceRegistry = load('src/engine/input/SourceRegistry.ts', { react: React });
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
  }, { ...clock.globals, setTimeout, clearTimeout, window: {}, localStorage: { getItem: () => JSON.stringify(initial) }, alert: message => alerts.push(message), crypto: require('node:crypto').webcrypto });
  return { clock, alerts, render: () => { cursor = 0; return BroadcastProvider({ children: null }).value; } };
}

test('CUT selects the requested scene and ignores unknown scene IDs', () => {
  const app = provider();
  let state = app.render();
  state.takeLive('missing');
  assert.equal(app.render().liveScene, 'a');
  state.cutTransition();
  assert.equal(app.render().liveScene, 'b');
  assert.equal(app.clock.count(), 0);
});

test('AUTO advances over time, locks its target and completes', () => {
  const app = provider();
  app.render().autoTransition();
  let state = app.render();
  assert.equal(state.isTransitioning, true);
  assert.equal(state.liveScene, 'b');
  state.autoTransition('c');
  assert.equal(app.clock.count(), 1);
  app.clock.advance(250);
  state = app.render();
  assert.equal(state.transitionProgress, 0.5);
  assert.equal(state.liveScene, 'b');
  app.clock.advance(500);
  assert.equal(app.render().isTransitioning, false);
  assert.equal(app.clock.count(), 0);
});

test('TAKE cancels an in-flight AUTO without a delayed scene override', () => {
  const app = provider();
  app.render().autoTransition();
  app.render().takeLive('c');
  app.clock.advance(1000);
  assert.equal(app.render().liveScene, 'c');
  assert.equal(app.render().isTransitioning, false);
});

test('source creation supplies renderable opacity and filters', () => {
  const app = provider();
  app.render().addSourceToScene('a', 'text', 'Title', { text: 'Test' });
  const source = app.render().scenes[0].sources[0];
  assert.equal(source.opacity, 1);
  assert.equal(source.filters.length, 0);
  app.render().addFilterToSource('a', source.id, 'blur');
  const filter = app.render().scenes[0].sources[0].filters[0];
  assert.equal(filter.enabled, true);
  app.render().deleteFilterFromSource('a', source.id, filter.id);
  assert.equal(app.render().scenes[0].sources[0].filters.length, 0);
});

test('scene CRUD preserves independent source ownership', () => {
  const app = provider();
  app.render().addScene('New Scene');
  let state = app.render();
  const created = state.scenes.find(scene => scene.name === 'New Scene');
  assert.ok(created);
  state.renameScene(created.id, 'Renamed Scene');
  state = app.render();
  assert.equal(state.scenes.find(scene => scene.id === created.id).name, 'Renamed Scene');
  state.duplicateScene('a');
  state = app.render();
  const copy = state.scenes.find(scene => scene.name === 'A (Copy)');
  assert.ok(copy);
  assert.notEqual(copy.id, 'a');
  state.deleteScene(created.id);
  assert.equal(app.render().scenes.some(scene => scene.id === created.id), false);
});

test('source visibility, lock, reorder and delete update the owning scene', () => {
  const app = provider();
  let state = app.render();
  const first = state.addSourceToScene('a', 'camera', 'Camera');
  const second = app.render().addSourceToScene('a', 'audio', 'Microphone');
  state = app.render();
  state.updateSourceProperties('a', first, { visible: false, locked: true });
  state.reorderSource('a', second, 'top');
  state = app.render();
  assert.equal(state.scenes[0].sources[0].id, second);
  assert.equal(state.scenes[0].sources.find(source => source.id === first).visible, false);
  assert.equal(state.scenes[0].sources.find(source => source.id === first).locked, true);
  state.deleteSourceFromScene('a', first);
  assert.equal(app.render().scenes[0].sources.some(source => source.id === first), false);
});

test('manual transition can reverse to its original program or complete', () => {
  const app = provider();
  app.render().setManualTransitionProgress(0.4);
  assert.equal(app.render().isTransitioning, true);
  assert.equal(app.render().transitionProgress, 0.4);
  app.render().setManualTransitionProgress(0);
  assert.equal(app.render().liveScene, 'a');
  assert.equal(app.render().isTransitioning, false);
  app.render().setManualTransitionProgress(0.5);
  app.render().setManualTransitionProgress(1);
  assert.equal(app.render().liveScene, 'b');
  assert.equal(app.render().isTransitioning, false);
});

test('missing desktop transport never reports a successful stream', async () => {
  const app = provider();
  const state = app.render();
  await state.startSingleStream(state.destinations[0].id);
  assert.equal(app.render().isStreaming, false);
  assert.equal(app.render().destinations[0].status, 'disconnected');
  assert.match(app.alerts[0], /desktop output service/);
});

test('scheduler restart owns exactly one animation chain', () => {
  const clock = frames();
  const { RenderScheduler } = load('src/engine/RenderScheduler.ts', {}, clock.globals);
  let first = 0, second = 0;
  RenderScheduler.start(() => first++);
  RenderScheduler.start(() => second++);
  assert.equal(clock.count(), 1);
  clock.advance(20);
  assert.equal(first, 0);
  assert.equal(second, 1);
  RenderScheduler.stop();
  assert.equal(clock.count(), 0);
  assert.throws(() => RenderScheduler.setFps(0), /positive/);
});

function compositor() {
  const rendered = [];
  const canvases = [];
  const context = () => {
    const stack = [];
    return {
      globalAlpha: 1, images: [], clears: 0,
      save() { stack.push(this.globalAlpha); }, restore() { this.globalAlpha = stack.pop(); },
      clearRect() { this.clears++; }, fillRect() {}, translate() {}, scale() {}, transform() {},
      beginPath() {}, rect() {}, clip() {},
      drawImage(canvas) { this.images.push({ canvas, alpha: this.globalAlpha }); }
    };
  };
  const { CanvasRenderer } = load('src/engine/CanvasRenderer.ts', {
    './SceneRenderer': { SceneRenderer: { renderScene: (...args) => rendered.push(args) } },
  }, { document: { createElement: () => {
    const ctx = context();
    const canvas = { width: 0, height: 0, getContext: () => ctx };
    canvases.push(canvas);
    return canvas;
  } } });
  const previous = { id: 'a', sources: [] }, next = { id: 'b', sources: [] };
  const opts = { time: 0, canvasW: 1920, canvasH: 1080, activeScene: next, liveScene: next,
    transitionFromScene: previous, isTransitioning: true, transitionProgress: 0.5, transitionType: 'mix', programFilters: [] };
  return { CanvasRenderer, opts, context, canvases, rendered };
}

test('MIX composites opaque outgoing frame and half-opacity incoming frame', () => {
  const { CanvasRenderer, opts, context, canvases, rendered } = compositor();
  const program = context();
  CanvasRenderer.render(null, program, null, opts, [], {}, {});
  assert.equal(program.images[0].alpha, 1);
  assert.equal(program.images[1].alpha, 0.5);
  assert.equal(program.images[1].canvas, canvases[1]);
  assert.equal(rendered.every(call => call[6] === true), true);
  CanvasRenderer.render(null, program, null, { ...opts, transitionProgress: 0.75 }, [], {}, {});
  assert.equal(canvases.length, 2, 'frame buffers must be reused');
});

test('DIP reaches black at its midpoint', () => {
  const { CanvasRenderer, opts, context } = compositor();
  const program = context();
  CanvasRenderer.render(null, program, null, { ...opts, transitionType: 'dip' }, [], {}, {});
  assert.equal(program.images[0].alpha, 0);
});

test('removing the preview scene clears stale output', () => {
  const { CanvasRenderer, opts, context } = compositor();
  const preview = context();
  CanvasRenderer.render(preview, null, null, { ...opts, activeScene: undefined }, [], {}, {});
  assert.equal(preview.clears, 1);
});
