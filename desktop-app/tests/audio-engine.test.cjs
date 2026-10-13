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

// Web Audio API & MediaStream Mocks for deterministic testing
function createMockWebAudioEnvironment() {
  class MockAudioParam {
    constructor(defaultValue = 1) {
      this.value = defaultValue
    }
    setValueAtTime(val) { this.value = val }
    setTargetAtTime(val) { this.value = val }
  }

  class MockAudioNode {
    constructor(name = 'MockNode') {
      this.name = name
      this.connectedTo = new Set()
    }
    connect(dest) {
      this.connectedTo.add(dest)
      return dest
    }
    disconnect(dest) {
      if (dest) {
        this.connectedTo.delete(dest)
      } else {
        this.connectedTo.clear()
      }
    }
  }

  class MockGainNode extends MockAudioNode {
    constructor() {
      super('GainNode')
      this.gain = new MockAudioParam(1)
    }
  }

  class MockStereoPannerNode extends MockAudioNode {
    constructor() {
      super('StereoPannerNode')
      this.pan = new MockAudioParam(0)
    }
  }

  class MockBiquadFilterNode extends MockAudioNode {
    constructor() {
      super('BiquadFilterNode')
      this.frequency = new MockAudioParam(350)
      this.Q = new MockAudioParam(1)
      this.gain = new MockAudioParam(0)
      this.type = 'peaking'
    }
  }

  class MockDynamicsCompressorNode extends MockAudioNode {
    constructor() {
      super('DynamicsCompressorNode')
      this.threshold = new MockAudioParam(-24)
      this.knee = new MockAudioParam(30)
      this.ratio = new MockAudioParam(12)
      this.attack = new MockAudioParam(0.003)
      this.release = new MockAudioParam(0.25)
    }
  }

  class MockAnalyserNode extends MockAudioNode {
    constructor() {
      super('AnalyserNode')
      this.fftSize = 256
      this.smoothingTimeConstant = 0.8
      this.mockSamples = new Uint8Array(256).fill(128) // Center silence (128 in unsigned 8-bit PCM)
    }
    getByteTimeDomainData(array) {
      array.set(this.mockSamples.subarray(0, array.length))
    }
  }

  class MockMediaTrack {
    constructor(kind = 'audio') {
      this.kind = kind
      this.enabled = true
      this.readyState = 'live'
      this.stopped = false
    }
    stop() {
      this.readyState = 'ended'
      this.stopped = true
    }
  }

  class MockMediaStream {
    constructor(tracks = [new MockMediaTrack('audio')]) {
      this.id = 'stream_' + Math.random().toString(36).slice(2, 8)
      this._tracks = tracks
    }
    getTracks() { return this._tracks }
    getAudioTracks() { return this._tracks.filter(t => t.kind === 'audio') }
    getVideoTracks() { return this._tracks.filter(t => t.kind === 'video') }
  }

  class MockMediaStreamDestinationNode extends MockAudioNode {
    constructor() {
      super('MediaStreamAudioDestinationNode')
      this.stream = new MockMediaStream([new MockMediaTrack('audio')])
    }
  }

  class MockAudioContext {
    constructor() {
      this.state = 'running'
      this.currentTime = 0
      this.destination = new MockAudioNode('Destination')
    }
    createGain() { return new MockGainNode() }
    createStereoPanner() { return new MockStereoPannerNode() }
    createBiquadFilter() { return new MockBiquadFilterNode() }
    createDynamicsCompressor() { return new MockDynamicsCompressorNode() }
    createAnalyser() { return new MockAnalyserNode() }
    createMediaStreamDestination() { return new MockMediaStreamDestinationNode() }
    createMediaStreamSource(stream) {
      const node = new MockAudioNode('MediaStreamAudioSourceNode')
      node.mediaStream = stream
      return node
    }
    createMediaElementSource(element) {
      const node = new MockAudioNode('MediaElementAudioSourceNode')
      node.mediaElement = element
      return node
    }
    async resume() { this.state = 'running' }
    async close() { this.state = 'closed' }
  }

  class MockMediaElement {
    constructor() {
      this.muted = false
      this.volume = 1.0
      this.paused = true
    }
    pause() { this.paused = true }
  }

  const deviceChangeListeners = new Set()
  const mockDevices = [
    { deviceId: 'mic-builtin', kind: 'audioinput', label: 'Internal Microphone' },
    { deviceId: 'mic-usb', kind: 'audioinput', label: 'USB Broadcast Microphone' },
    { deviceId: 'cam-builtin', kind: 'videoinput', label: 'HD Webcam' }
  ]

  const navigatorMock = {
    mediaDevices: {
      enumerateDevices: async () => mockDevices,
      addEventListener: (type, listener) => {
        if (type === 'devicechange') deviceChangeListeners.add(listener)
      },
      removeEventListener: (type, listener) => {
        if (type === 'devicechange') deviceChangeListeners.delete(listener)
      }
    }
  }

  const windowMock = {
    AudioContext: MockAudioContext,
    addEventListener: () => {},
    removeEventListener: () => {}
  }

  return {
    windowMock,
    navigatorMock,
    MockAudioContext,
    MockMediaStream,
    MockMediaTrack,
    MockMediaElement,
    mockDevices,
    triggerDeviceChange: () => {
      deviceChangeListeners.forEach(listener => listener())
    }
  }
}

// ---------------------------------------------------------
// TEST SUITE: Nexus Audio Engine Regression Tests
// ---------------------------------------------------------

test('AUDIO ENGINE 1 — Initialization, Master Program Bus, and Monitor Bus Creation', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const ctx = engine.ensureContext()

  assert.ok(ctx, 'AudioContext was created')
  assert.equal(ctx.state, 'running', 'AudioContext is in running state')
  assert.equal(engine.getMasterVolume(), 90, 'Default master volume is 90')
  assert.equal(engine.isMasterMuted(), false, 'Default master mute is false')

  const programStream = engine.getProgramStream()
  assert.ok(programStream, 'Program stream exists for recording/streaming')
  assert.equal(programStream.getAudioTracks().length, 1, 'Program stream has 1 mixed audio track')

  engine.dispose()
})

test('AUDIO ENGINE 2 — Real Microphone Input Attachment, Channel Pipeline, and Opt-In Monitoring', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const stream = new env.MockMediaStream()

  const channel = engine.attachMediaStream('mic-host', stream, 'Host Microphone', 'audio', {
    volume: 85,
    gainDb: 3
  })

  assert.equal(channel.id, 'mic-host')
  assert.equal(channel.name, 'Host Microphone')
  assert.equal(channel.type, 'audio')
  assert.equal(channel.config.volume, 85)
  assert.equal(channel.config.gainDb, 3)

  // Verify feedback prevention: Microphone default route is 'program', monitorEnabled is false
  assert.equal(channel.config.route, 'program')
  assert.equal(channel.config.monitorEnabled, false)
  assert.equal(channel.isProgramConnected, true, 'Microphone connects to Program Bus for output')
  assert.equal(channel.isMonitorConnected, false, 'Microphone DOES NOT connect to Monitor Bus (prevents acoustic feedback)')

  // Opt-in monitoring
  engine.setChannelMonitor('mic-host', true)
  engine.setChannelRoute('mic-host', 'master')
  const updatedChannel = engine.getChannel('mic-host')
  assert.equal(updatedChannel.isMonitorConnected, true, 'Monitor connected when explicitly opted-in')

  engine.dispose()
})

test('AUDIO ENGINE 3 — HTMLMediaElement Attachment and InvalidStateError Prevention', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const element = new env.MockMediaElement()

  // First attachment
  const ch1 = engine.attachMediaElement('media-bgm', element, 'BGM Player', 'media', { volume: 75 })
  assert.equal(ch1.id, 'media-bgm')
  assert.equal(element.muted, false, 'Media element unmuted so audio routes into Web Audio')
  assert.equal(element.volume, 1.0, 'Media element volume set to 1.0 for Web Audio pipeline')

  // Second attachment on SAME element (e.g. source reload or scene switch)
  assert.doesNotThrow(() => {
    engine.attachMediaElement('media-bgm', element, 'BGM Player Reconnected', 'media', { volume: 80 })
  }, 'WeakMap caching prevents InvalidStateError on duplicate connection')

  const ch2 = engine.getChannel('media-bgm')
  assert.equal(ch2.config.volume, 80)

  engine.dispose()
})

test('AUDIO ENGINE 4 — Fader Gain, Gain Trim (dB), and Mute Silencing', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const stream = new env.MockMediaStream()
  const channel = engine.attachMediaStream('src-1', stream, 'Line In', 'audio', { volume: 100, gainDb: 0 })

  // Linear 100% volume -> gain 1.0
  assert.equal(channel.faderGainNode.gain.value, 1.0)

  // 50% volume -> gain 0.5
  engine.setChannelVolume('src-1', 50)
  assert.equal(channel.faderGainNode.gain.value, 0.5)

  // Mute -> gain 0
  engine.setChannelMute('src-1', true)
  assert.equal(channel.faderGainNode.gain.value, 0, 'Muted channel has 0 gain')

  // Unmute -> restores 0.5
  engine.setChannelMute('src-1', false)
  assert.equal(channel.faderGainNode.gain.value, 0.5, 'Unmuted channel restores volume')

  // Gain Trim +6 dB (approx 2.0x factor)
  engine.setChannelGainDb('src-1', 6)
  const expectedGain = 0.5 * Math.pow(10, 6 / 20)
  assert.ok(Math.abs(channel.faderGainNode.gain.value - expectedGain) < 0.01, 'Gain trim db correctly multiplies gain')

  engine.dispose()
})

test('AUDIO ENGINE 5 — Solo Matrix Across Multiple Channels', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const chA = engine.attachMediaStream('ch-a', new env.MockMediaStream(), 'Host', 'audio', { volume: 80 })
  const chB = engine.attachMediaStream('ch-b', new env.MockMediaStream(), 'Guest', 'audio', { volume: 80 })
  const chC = engine.attachMediaStream('ch-c', new env.MockMediaStream(), 'Music', 'media', { volume: 80 })

  // Initial state: all channels audible (0.8)
  assert.equal(chA.faderGainNode.gain.value, 0.8)
  assert.equal(chB.faderGainNode.gain.value, 0.8)
  assert.equal(chC.faderGainNode.gain.value, 0.8)

  // Solo Channel A
  engine.setChannelSolo('ch-a', true)
  assert.equal(chA.faderGainNode.gain.value, 0.8, 'Soloed channel remains audible')
  assert.equal(chB.faderGainNode.gain.value, 0, 'Non-soloed channel B is silenced')
  assert.equal(chC.faderGainNode.gain.value, 0, 'Non-soloed channel C is silenced')

  // Solo Channel B as well (Dual Solo)
  engine.setChannelSolo('ch-b', true)
  assert.equal(chA.faderGainNode.gain.value, 0.8, 'Soloed channel A remains audible')
  assert.equal(chB.faderGainNode.gain.value, 0.8, 'Soloed channel B is now audible')
  assert.equal(chC.faderGainNode.gain.value, 0, 'Non-soloed channel C is still silenced')

  // Un-solo all
  engine.setChannelSolo('ch-a', false)
  engine.setChannelSolo('ch-b', false)
  assert.equal(chA.faderGainNode.gain.value, 0.8, 'Channel A restored')
  assert.equal(chB.faderGainNode.gain.value, 0.8, 'Channel B restored')
  assert.equal(chC.faderGainNode.gain.value, 0.8, 'Channel C restored')

  engine.dispose()
})

test('AUDIO ENGINE 6 — Master Controls & Master Mute', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  assert.equal(engine.getMasterVolume(), 90)

  engine.setMasterVolume(75)
  assert.equal(engine.getMasterVolume(), 75)

  assert.equal(engine.isMasterMuted(), false)
  engine.setMasterMute(true)
  assert.equal(engine.isMasterMuted(), true)

  engine.toggleMasterMute()
  assert.equal(engine.isMasterMuted(), false)

  engine.dispose()
})

test('AUDIO ENGINE 7 — Real Signal Metering (RMS VU & Peak dB Calculation)', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const ch = engine.attachMediaStream('mic-meter', new env.MockMediaStream(), 'Mic', 'audio')

  // 1. Pure silence test (PCM 128 is 0 amplitude in unsigned 8-bit)
  const silentLevels = engine.getMeterLevel('mic-meter')
  assert.equal(silentLevels.vu, 0, 'Silent input has 0 VU')
  assert.equal(silentLevels.peak, 0, 'Silent input has 0 peak')
  assert.equal(silentLevels.db, -60, 'Silent input has -60 dB floor')

  // 2. Simulated sine wave / active speech signal
  const analyser = ch.analyserNode
  for (let i = 0; i < 256; i++) {
    // Generate full-scale speech amplitude: alternating between 32 and 224 (normalized 0.75 amplitude)
    analyser.mockSamples[i] = Math.round(128 + 96 * Math.sin((i / 256) * Math.PI * 4))
  }

  const activeLevels = engine.getMeterLevel('mic-meter')
  assert.ok(activeLevels.vu > 0.3, 'Active signal computes real RMS VU level')
  assert.ok(activeLevels.peak > 0.6, 'Active signal computes real Peak level')
  assert.ok(activeLevels.db > -10, 'Active signal calculates accurate dB')

  const allLevels = engine.getAllMeterLevels()
  assert.ok('master' in allLevels, 'All meter levels includes master')
  assert.ok('mic-meter' in allLevels, 'All meter levels includes channel')

  engine.dispose()
})

test('AUDIO ENGINE 8 — Clean Disconnection & Resource Leak Prevention', () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const track = new env.MockMediaTrack('audio')
  const stream = new env.MockMediaStream([track])

  engine.attachMediaStream('src-removable', stream, 'Temporary Mic', 'audio')
  assert.equal(engine.getChannels().length, 1)
  assert.equal(track.stopped, false, 'Track is live while attached')

  // Detach source
  engine.detachSource('src-removable', true)
  assert.equal(engine.getChannels().length, 0, 'Channel removed from engine registry')
  assert.equal(track.stopped, true, 'Audio track stopped when detached to prevent hardware leaks')

  engine.dispose()
})

test('AUDIO ENGINE 9 — Device Enumeration & Device-Change Event Handling', async () => {
  const env = createMockWebAudioEnvironment()
  const { AudioEngine } = load('src/engine/audio/AudioEngine.ts', {}, {
    window: env.windowMock,
    navigator: env.navigatorMock
  })

  const engine = AudioEngine.getInstance()
  const devices = await engine.getAudioInputDevices()

  assert.equal(devices.length, 2, 'Found 2 audio inputs among media devices')
  assert.equal(devices[0].deviceId, 'mic-builtin')
  assert.equal(devices[1].deviceId, 'mic-usb')

  let listenerFired = false
  const unsubscribe = engine.setupDeviceChangeListener(updated => {
    listenerFired = true
  })

  env.triggerDeviceChange()
  // Wait a microtask
  await new Promise(resolve => setTimeout(resolve, 5))
  assert.equal(listenerFired, true, 'Device change event triggers listener')

  unsubscribe()
  engine.dispose()
})
