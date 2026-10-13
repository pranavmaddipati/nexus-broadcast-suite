/**
 * NEXUS BROADCAST SUITE — PROFESSIONAL AUDIO ENGINE (PHASE 3)
 *
 * Professional Web Audio API architecture for Electron broadcast suite:
 * - Master Program & Monitor Busses
 * - MediaStream (Microphone / Line-In) & HTMLMediaElement (Media/Video) input channels
 * - Real channel strip: Input Trim, 3-Band EQ, Dynamics (Compressor & Limiter), Fader Gain, Panner
 * - Accurate RMS (VU) & Peak Metering computed from real audio signal data
 * - Coordinated Solo & Mute logic across channels
 * - Feedback loop prevention with opt-in monitoring for microphones
 * - Dynamic device selection and device change handling
 * - Clean disposal and prevention of duplicate connection leaks
 */

export interface AudioMeterData {
  vu: number     // 0 - 1 RMS volume unit
  peak: number   // 0 - 1 Peak amplitude
  db: number     // Decibels (-60 to +6 dB)
}

export type AudioBusRoute = 'master' | 'program' | 'monitor' | 'off'

export interface ChannelAudioConfig {
  volume?: number         // 0 - 100 (fader)
  gainDb?: number         // dB trim (-24 to +24)
  muted?: boolean
  solo?: boolean
  pan?: number            // -1 (Left) to +1 (Right)
  route?: AudioBusRoute   // Target output bus
  monitorEnabled?: boolean // Opt-in monitor bus feed (default false for mics)
}

export interface AudioChannel {
  id: string
  name: string
  type: string
  sourceNode: AudioNode
  inputGainNode: GainNode
  eqLow: BiquadFilterNode
  eqMid: BiquadFilterNode
  eqHigh: BiquadFilterNode
  compressorNode: DynamicsCompressorNode
  limiterNode: DynamicsCompressorNode
  faderGainNode: GainNode
  panNode: StereoPannerNode
  analyserNode: AnalyserNode
  config: Required<ChannelAudioConfig>
  stream?: MediaStream
  mediaElement?: HTMLMediaElement
  isProgramConnected: boolean
  isMonitorConnected: boolean
}

// Global WeakMap to prevent InvalidStateError when reconnecting HTMLMediaElements
const elementSourceNodeMap = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>()

export class AudioEngine {
  private static instance: AudioEngine | null = null

  private ctx: AudioContext | null = null
  private masterProgramBus: GainNode | null = null
  private masterLimiter: DynamicsCompressorNode | null = null
  private masterProgramAnalyser: AnalyserNode | null = null
  private programDestination: MediaStreamAudioDestinationNode | null = null

  private monitorBus: GainNode | null = null
  private monitorAnalyser: AnalyserNode | null = null

  private channels: Map<string, AudioChannel> = new Map()

  // Master bus settings
  private masterVolume: number = 90 // 0 - 100
  private masterMuted: boolean = false
  private masterGainDb: number = 0

  // Monitor bus settings
  private monitorVolume: number = 100 // 0 - 100
  private monitorMuted: boolean = false

  private deviceChangeListeners: Set<(devices: MediaDeviceInfo[]) => void> = new Set()
  private boundDeviceChangeHandler: (() => void) | null = null
  private gestureListenersAttached: boolean = false

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  private constructor() {
    this.setupGestureUnlock()
  }

  /**
   * Initialize or return the Web Audio Context and Master/Monitor buses.
   */
  public ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) {
        throw new Error('Web Audio API is not supported in this runtime.')
      }
      this.ctx = new AudioCtx()
      this.initBusses()
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(err => {
        console.warn('[AudioEngine] Failed to auto-resume AudioContext:', err)
      })
    }

    return this.ctx
  }

  public getContext(): AudioContext | null {
    return this.ctx
  }

  private setupGestureUnlock() {
    if (typeof window === 'undefined' || this.gestureListenersAttached) return
    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {})
      }
    }
    window.addEventListener('click', unlock, { passive: true })
    window.addEventListener('keydown', unlock, { passive: true })
    window.addEventListener('touchstart', unlock, { passive: true })
    this.gestureListenersAttached = true
  }

  private initBusses() {
    if (!this.ctx) return

    // 1. Master Program Bus (Feeds recording, streaming & virtual camera)
    this.masterProgramBus = this.ctx.createGain()
    this.masterLimiter = this.ctx.createDynamicsCompressor()
    this.masterLimiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime)
    this.masterLimiter.knee.setValueAtTime(0, this.ctx.currentTime)
    this.masterLimiter.ratio.setValueAtTime(20.0, this.ctx.currentTime)
    this.masterLimiter.attack.setValueAtTime(0.001, this.ctx.currentTime)
    this.masterLimiter.release.setValueAtTime(0.05, this.ctx.currentTime)

    this.masterProgramAnalyser = this.ctx.createAnalyser()
    this.masterProgramAnalyser.fftSize = 256
    this.masterProgramAnalyser.smoothingTimeConstant = 0.8

    this.programDestination = this.ctx.createMediaStreamDestination()

    this.masterProgramBus.connect(this.masterLimiter)
    this.masterLimiter.connect(this.masterProgramAnalyser)
    this.masterProgramAnalyser.connect(this.programDestination)

    // 2. Monitor Bus (Feeds physical speakers/headphones via ctx.destination)
    this.monitorBus = this.ctx.createGain()
    this.monitorAnalyser = this.ctx.createAnalyser()
    this.monitorAnalyser.fftSize = 256
    this.monitorAnalyser.smoothingTimeConstant = 0.8

    this.monitorBus.connect(this.monitorAnalyser)
    this.monitorAnalyser.connect(this.ctx.destination)

    this.applyMasterGain()
    this.applyMonitorGain()
  }

  private applyMasterGain() {
    if (!this.masterProgramBus || !this.ctx) return
    const targetGain = this.masterMuted
      ? 0
      : Math.max(0, Math.min(1.5, (this.masterVolume / 100) * Math.pow(10, this.masterGainDb / 20)))
    this.masterProgramBus.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.015)
  }

  private applyMonitorGain() {
    if (!this.monitorBus || !this.ctx) return
    const targetGain = this.monitorMuted ? 0 : Math.max(0, Math.min(1.5, this.monitorVolume / 100))
    this.monitorBus.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.015)
  }

  /**
   * Attach a real microphone / audio input stream to the engine.
   */
  public attachMediaStream(
    sourceId: string,
    stream: MediaStream,
    name: string,
    type: string = 'audio',
    initialConfig: ChannelAudioConfig = {}
  ): AudioChannel {
    const ctx = this.ensureContext()

    // Clean up any existing channel with same ID to avoid leaks or duplicate graphs
    this.detachSource(sourceId, false)

    const sourceNode = ctx.createMediaStreamSource(stream)
    
    // For microphone sources, default monitorEnabled to false to prevent feedback loops!
    const isMic = type === 'audio'
    const route = initialConfig.route ?? (isMic ? 'program' : 'master')
    const monitorEnabled = initialConfig.monitorEnabled ?? (!isMic)

    const channel = this.createChannelPipeline(
      sourceId,
      name,
      type,
      sourceNode,
      {
        ...initialConfig,
        route,
        monitorEnabled
      }
    )

    channel.stream = stream
    this.channels.set(sourceId, channel)
    this.recomputeAllChannelGains()
    return channel
  }

  /**
   * Attach an HTMLMediaElement (video or audio element) to the engine.
   */
  public attachMediaElement(
    sourceId: string,
    element: HTMLMediaElement,
    name: string,
    type: string = 'media',
    initialConfig: ChannelAudioConfig = {}
  ): AudioChannel {
    const ctx = this.ensureContext()

    // Clean up any existing channel with same ID
    this.detachSource(sourceId, false)

    // Unmute media element and maximize internal volume so audio routes through Web Audio
    element.muted = false
    element.volume = 1.0

    // Ensure we reuse existing MediaElementAudioSourceNode to avoid InvalidStateError in Chrome/Electron
    let sourceNode = elementSourceNodeMap.get(element)
    if (!sourceNode) {
      sourceNode = ctx.createMediaElementSource(element)
      elementSourceNodeMap.set(element, sourceNode)
    }

    const route = initialConfig.route ?? 'master'
    const monitorEnabled = initialConfig.monitorEnabled ?? true

    const channel = this.createChannelPipeline(
      sourceId,
      name,
      type,
      sourceNode,
      {
        ...initialConfig,
        route,
        monitorEnabled
      }
    )

    channel.mediaElement = element
    this.channels.set(sourceId, channel)
    this.recomputeAllChannelGains()
    return channel
  }

  /**
   * Helper: build the reusable channel audio processing graph.
   */
  private createChannelPipeline(
    id: string,
    name: string,
    type: string,
    sourceNode: AudioNode,
    config: ChannelAudioConfig
  ): AudioChannel {
    if (!this.ctx || !this.masterProgramBus || !this.monitorBus) {
      throw new Error('AudioContext busses are not initialized.')
    }

    const inputGainNode = this.ctx.createGain()
    const eqLow = this.ctx.createBiquadFilter()
    eqLow.type = 'lowshelf'
    eqLow.frequency.setValueAtTime(250, this.ctx.currentTime)

    const eqMid = this.ctx.createBiquadFilter()
    eqMid.type = 'peaking'
    eqMid.frequency.setValueAtTime(1000, this.ctx.currentTime)
    eqMid.Q.setValueAtTime(1.0, this.ctx.currentTime)

    const eqHigh = this.ctx.createBiquadFilter()
    eqHigh.type = 'highshelf'
    eqHigh.frequency.setValueAtTime(4000, this.ctx.currentTime)

    const compressorNode = this.ctx.createDynamicsCompressor()
    compressorNode.threshold.setValueAtTime(-24, this.ctx.currentTime)
    compressorNode.knee.setValueAtTime(30, this.ctx.currentTime)
    compressorNode.ratio.setValueAtTime(4, this.ctx.currentTime)
    compressorNode.attack.setValueAtTime(0.003, this.ctx.currentTime)
    compressorNode.release.setValueAtTime(0.25, this.ctx.currentTime)

    const limiterNode = this.ctx.createDynamicsCompressor()
    limiterNode.threshold.setValueAtTime(-1.0, this.ctx.currentTime)
    limiterNode.ratio.setValueAtTime(20.0, this.ctx.currentTime)
    limiterNode.attack.setValueAtTime(0.001, this.ctx.currentTime)
    limiterNode.release.setValueAtTime(0.05, this.ctx.currentTime)

    const faderGainNode = this.ctx.createGain()
    const panNode = this.ctx.createStereoPanner()
    panNode.pan.setValueAtTime(Math.max(-1, Math.min(1, config.pan ?? 0)), this.ctx.currentTime)

    const analyserNode = this.ctx.createAnalyser()
    analyserNode.fftSize = 256
    analyserNode.smoothingTimeConstant = 0.8

    // Signal pipeline:
    // sourceNode -> inputGain -> eqLow -> eqMid -> eqHigh -> compressor -> limiter -> faderGain -> panNode -> analyserNode
    sourceNode.connect(inputGainNode)
    inputGainNode.connect(eqLow)
    eqLow.connect(eqMid)
    eqMid.connect(eqHigh)
    eqHigh.connect(compressorNode)
    compressorNode.connect(limiterNode)
    limiterNode.connect(faderGainNode)
    faderGainNode.connect(panNode)
    panNode.connect(analyserNode)

    const fullConfig: Required<ChannelAudioConfig> = {
      volume: config.volume ?? 80,
      gainDb: config.gainDb ?? 0,
      muted: config.muted ?? false,
      solo: config.solo ?? false,
      pan: config.pan ?? 0,
      route: config.route ?? 'master',
      monitorEnabled: config.monitorEnabled ?? (type !== 'audio')
    }

    const channel: AudioChannel = {
      id,
      name,
      type,
      sourceNode,
      inputGainNode,
      eqLow,
      eqMid,
      eqHigh,
      compressorNode,
      limiterNode,
      faderGainNode,
      panNode,
      analyserNode,
      config: fullConfig,
      isProgramConnected: false,
      isMonitorConnected: false
    }

    this.updateChannelRouting(channel)
    return channel
  }

  /**
   * Connect or disconnect bus feeds based on channel's route and monitorEnabled configuration.
   */
  private updateChannelRouting(channel: AudioChannel) {
    if (!this.masterProgramBus || !this.monitorBus) return

    const wantsProgram = channel.config.route === 'master' || channel.config.route === 'program'
    const wantsMonitor =
      channel.config.monitorEnabled &&
      (channel.config.route === 'master' || channel.config.route === 'monitor')

    // Program bus connection
    if (wantsProgram && !channel.isProgramConnected) {
      channel.panNode.connect(this.masterProgramBus)
      channel.isProgramConnected = true
    } else if (!wantsProgram && channel.isProgramConnected) {
      try {
        channel.panNode.disconnect(this.masterProgramBus)
      } catch {}
      channel.isProgramConnected = false
    }

    // Monitor bus connection (strictly opt-in to prevent mic acoustic feedback)
    if (wantsMonitor && !channel.isMonitorConnected) {
      channel.panNode.connect(this.monitorBus)
      channel.isMonitorConnected = true
    } else if (!wantsMonitor && channel.isMonitorConnected) {
      try {
        channel.panNode.disconnect(this.monitorBus)
      } catch {}
      channel.isMonitorConnected = false
    }
  }

  /**
   * Recalculates effective gain for all channels according to Solo & Mute matrix.
   */
  private recomputeAllChannelGains() {
    if (!this.ctx) return
    const anySolo = Array.from(this.channels.values()).some(ch => ch.config.solo)

    for (const channel of this.channels.values()) {
      let targetGain = 0

      if (channel.config.muted) {
        targetGain = 0
      } else if (anySolo && !channel.config.solo) {
        targetGain = 0 // Attenuated because another channel is soloed
      } else {
        const linearVolume = Math.max(0, Math.min(1.0, channel.config.volume / 100))
        const trimFactor = Math.pow(10, channel.config.gainDb / 20)
        targetGain = Math.max(0, Math.min(2.0, linearVolume * trimFactor))
      }

      channel.faderGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.015)
    }
  }

  // Channel Controls
  public setChannelVolume(sourceId: string, volume: number) {
    const channel = this.channels.get(sourceId)
    if (!channel) return
    channel.config.volume = Math.max(0, Math.min(100, volume))
    this.recomputeAllChannelGains()
  }

  public setChannelGainDb(sourceId: string, db: number) {
    const channel = this.channels.get(sourceId)
    if (!channel) return
    channel.config.gainDb = db
    this.recomputeAllChannelGains()
  }

  public setChannelMute(sourceId: string, muted: boolean) {
    const channel = this.channels.get(sourceId)
    if (!channel) return
    channel.config.muted = muted
    this.recomputeAllChannelGains()
  }

  public toggleChannelMute(sourceId: string): boolean {
    const channel = this.channels.get(sourceId)
    if (!channel) return false
    const newMuted = !channel.config.muted
    this.setChannelMute(sourceId, newMuted)
    return newMuted
  }

  public setChannelSolo(sourceId: string, solo: boolean) {
    const channel = this.channels.get(sourceId)
    if (!channel) return
    channel.config.solo = solo
    this.recomputeAllChannelGains()
  }

  public toggleChannelSolo(sourceId: string): boolean {
    const channel = this.channels.get(sourceId)
    if (!channel) return false
    const newSolo = !channel.config.solo
    this.setChannelSolo(sourceId, newSolo)
    return newSolo
  }

  public setChannelPan(sourceId: string, pan: number) {
    const channel = this.channels.get(sourceId)
    if (!channel || !this.ctx) return
    const clamped = Math.max(-1, Math.min(1, pan))
    channel.config.pan = clamped
    channel.panNode.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.015)
  }

  public setChannelRoute(sourceId: string, route: AudioBusRoute) {
    const channel = this.channels.get(sourceId)
    if (!channel) return
    channel.config.route = route
    this.updateChannelRouting(channel)
  }

  public setChannelMonitor(sourceId: string, enabled: boolean) {
    const channel = this.channels.get(sourceId)
    if (!channel) return
    channel.config.monitorEnabled = enabled
    this.updateChannelRouting(channel)
  }

  // Master Controls
  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(100, volume))
    this.applyMasterGain()
  }

  public getMasterVolume(): number {
    return this.masterVolume
  }

  public setMasterMute(muted: boolean) {
    this.masterMuted = muted
    this.applyMasterGain()
  }

  public toggleMasterMute(): boolean {
    this.masterMuted = !this.masterMuted
    this.applyMasterGain()
    return this.masterMuted
  }

  public isMasterMuted(): boolean {
    return this.masterMuted
  }

  public setMasterGainDb(db: number) {
    this.masterGainDb = db
    this.applyMasterGain()
  }

  // Monitor Controls
  public setMonitorVolume(volume: number) {
    this.monitorVolume = Math.max(0, Math.min(100, volume))
    this.applyMonitorGain()
  }

  public setMonitorMute(muted: boolean) {
    this.monitorMuted = muted
    this.applyMonitorGain()
  }

  public getChannel(sourceId: string): AudioChannel | undefined {
    return this.channels.get(sourceId)
  }

  public getChannels(): AudioChannel[] {
    return Array.from(this.channels.values())
  }

  /**
   * Detach and clean up an audio source safely.
   */
  public detachSource(sourceId: string, stopStreamTracks: boolean = true) {
    const channel = this.channels.get(sourceId)
    if (!channel) return

    try {
      // Disconnect all nodes
      channel.panNode.disconnect()
      channel.faderGainNode.disconnect()
      channel.limiterNode.disconnect()
      channel.compressorNode.disconnect()
      channel.eqHigh.disconnect()
      channel.eqMid.disconnect()
      channel.eqLow.disconnect()
      channel.inputGainNode.disconnect()
      channel.analyserNode.disconnect()

      // Disconnect source node
      channel.sourceNode.disconnect()

      if (stopStreamTracks && channel.stream) {
        channel.stream.getTracks().forEach(track => track.stop())
      }
    } catch (err) {
      console.warn(`[AudioEngine] Error detaching source ${sourceId}:`, err)
    }

    this.channels.delete(sourceId)
    this.recomputeAllChannelGains()
  }

  /**
   * Read real meter levels (RMS VU & Peak amplitude) directly from an AnalyserNode.
   */
  private computeMeterLevel(analyser: AnalyserNode | null): AudioMeterData {
    if (!analyser) return { vu: 0, peak: 0, db: -60 }

    const data = new Uint8Array(analyser.fftSize)
    analyser.getByteTimeDomainData(data)

    let sum = 0
    let peak = 0

    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] - 128) / 128
      sum += normalized * normalized
      const abs = Math.abs(normalized)
      if (abs > peak) peak = abs
    }

    const rms = Math.sqrt(sum / data.length)
    const vu = Math.min(1, rms * 2.8) // Normalized VU scale
    const peakNormalized = Math.min(1, peak)
    const db = peakNormalized > 0.0001 ? Math.max(-60, Math.round(20 * Math.log10(peakNormalized) * 10) / 10) : -60

    return { vu, peak: peakNormalized, db }
  }

  public getMeterLevel(sourceId: string): AudioMeterData {
    const channel = this.channels.get(sourceId)
    if (!channel) return { vu: 0, peak: 0, db: -60 }
    return this.computeMeterLevel(channel.analyserNode)
  }

  public getMasterMeterLevel(): AudioMeterData {
    return this.computeMeterLevel(this.masterProgramAnalyser)
  }

  public getAllMeterLevels(): Record<string, AudioMeterData> {
    const result: Record<string, AudioMeterData> = {
      master: this.getMasterMeterLevel()
    }
    for (const [id, channel] of this.channels.entries()) {
      result[id] = this.computeMeterLevel(channel.analyserNode)
    }
    return result
  }

  /**
   * Return the master Program MediaStream for recording and streaming.
   */
  public getProgramStream(): MediaStream | null {
    if (!this.programDestination) {
      this.ensureContext()
    }
    return this.programDestination?.stream ?? null
  }

  /**
   * Device Discovery & Event Handling.
   */
  public async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return []
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(d => d.kind === 'audioinput')
    } catch (err) {
      console.warn('[AudioEngine] Failed to enumerate audio devices:', err)
      return []
    }
  }

  public setupDeviceChangeListener(callback: (devices: MediaDeviceInfo[]) => void): () => void {
    this.deviceChangeListeners.add(callback)

    if (!this.boundDeviceChangeHandler && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      this.boundDeviceChangeHandler = async () => {
        const devices = await this.getAudioInputDevices()
        for (const listener of this.deviceChangeListeners) {
          try {
            listener(devices)
          } catch (e) {
            console.error('[AudioEngine] Device change listener error:', e)
          }
        }
      }
      navigator.mediaDevices.addEventListener('devicechange', this.boundDeviceChangeHandler)
    }

    return () => {
      this.deviceChangeListeners.delete(callback)
      if (this.deviceChangeListeners.size === 0 && this.boundDeviceChangeHandler && navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', this.boundDeviceChangeHandler)
        this.boundDeviceChangeHandler = null
      }
    }
  }

  /**
   * Safe disposal of all audio nodes, streams and context.
   */
  public dispose() {
    for (const sourceId of Array.from(this.channels.keys())) {
      this.detachSource(sourceId, true)
    }
    this.channels.clear()

    if (this.masterProgramBus) {
      try {
        this.masterProgramBus.disconnect()
        this.masterLimiter?.disconnect()
        this.masterProgramAnalyser?.disconnect()
      } catch {}
    }

    if (this.monitorBus) {
      try {
        this.monitorBus.disconnect()
        this.monitorAnalyser?.disconnect()
      } catch {}
    }

    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close().catch(() => {})
    }

    this.ctx = null
    this.masterProgramBus = null
    this.masterLimiter = null
    this.masterProgramAnalyser = null
    this.programDestination = null
    this.monitorBus = null
    this.monitorAnalyser = null
  }
}
