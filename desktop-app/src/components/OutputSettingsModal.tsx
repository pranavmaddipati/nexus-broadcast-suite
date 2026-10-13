import React, { useState, useEffect } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { X, Save, Settings, Radio, Sliders, Volume2, Tv, Accessibility, Cpu } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const OutputSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { outputSettings, updateOutputSettings } = useBroadcast()
  const [activeTab, setActiveTab] = useState<string>('general')
  const [localSettings, setLocalSettings] = useState<any>(null)

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(JSON.parse(JSON.stringify(outputSettings)))
    }
  }, [isOpen, outputSettings])

  if (!isOpen || !localSettings) return null

  const handleSave = () => {
    updateOutputSettings(localSettings)
    onClose()
  }

  const updateLocalSetting = (section: string, key: string, value: any) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={14} /> },
    { id: 'stream', label: 'Stream', icon: <Radio size={14} /> },
    { id: 'output', label: 'Output', icon: <Sliders size={14} /> },
    { id: 'audio', label: 'Audio', icon: <Volume2 size={14} /> },
    { id: 'video', label: 'Video', icon: <Tv size={14} /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Accessibility size={14} /> },
    { id: 'advanced', label: 'Advanced', icon: <Cpu size={14} /> }
  ]

  return (
    <div className="output-settings-modal-overlay" onClick={onClose}>
      <div className="output-settings-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-row">
            <Settings size={16} className="text-blue" />
            <h3>SYSTEM SETTINGS (OBS STYLE)</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body-split">
          {/* Left Vertical Tabs list */}
          <div className="modal-tabs-sidebar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn-vertical ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span className="ml-5">{tab.label.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Right tab content pane */}
          <div className="modal-tab-content">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <h4>General Settings</h4>
                <div className="settings-fields-grid-live mt-15">
                  <div className="field-group">
                    <label>Language</label>
                    <select
                      value={localSettings.general.language}
                      onChange={e => updateLocalSetting('general', 'language', e.target.value)}
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Espanol</option>
                      <option value="fr">Francais</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Theme</label>
                    <select
                      value={localSettings.general.theme}
                      onChange={e => updateLocalSetting('general', 'theme', e.target.value)}
                    >
                      <option value="dark">Dark Theme (Nexus Default)</option>
                      <option value="light">Light Theme</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div className="field-group mt-10">
                    <label className="checkbox-row-custom">
                      <input
                        type="checkbox"
                        checked={localSettings.general.systemTray}
                        onChange={e => updateLocalSetting('general', 'systemTray', e.target.checked)}
                      />
                      <span>Minimize to System Tray</span>
                    </label>
                    <div className="sub-description">Keep application running in background when closed.</div>
                  </div>
                </div>
              </div>
            )}

            {/* STREAM TAB */}
            {activeTab === 'stream' && (
              <div className="settings-section">
                <h4>Primary Stream Configuration</h4>
                <div className="settings-fields-grid-live mt-15">
                  <div className="field-group">
                    <label>Service</label>
                    <select
                      value={localSettings.stream.platform}
                      onChange={e => updateLocalSetting('stream', 'platform', e.target.value)}
                    >
                      <option value="YouTube">YouTube</option>
                      <option value="Twitch">Twitch</option>
                      <option value="Facebook">Facebook Live</option>
                      <option value="Custom">Custom RTMP Server</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Server</label>
                    <select
                      value={localSettings.stream.server}
                      onChange={e => updateLocalSetting('stream', 'server', e.target.value)}
                    >
                      <option value="default">Default / Recommended</option>
                      <option value="primary">Primary Ingest Server</option>
                      <option value="backup">Backup Ingest Server</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Stream Key</label>
                    <input
                      type="password"
                      value={localSettings.stream.streamKey}
                      placeholder="Enter primary stream key"
                      onChange={e => updateLocalSetting('stream', 'streamKey', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OUTPUT TAB */}
            {activeTab === 'output' && (
              <div className="settings-section">
                <h4>Output Encoder Settings</h4>
                <div className="settings-fields-grid-live mt-15">
                  <div className="field-group">
                    <label>Output Mode</label>
                    <select
                      value={localSettings.output.mode}
                      onChange={e => updateLocalSetting('output', 'mode', e.target.value)}
                    >
                      <option value="simple">Simple</option>
                      <option value="advanced">Advanced (Fine Control)</option>
                    </select>
                  </div>

                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Video Bitrate (Kbps)</label>
                      <input
                        type="number"
                        value={localSettings.output.videoBitrate}
                        onChange={e => updateLocalSetting('output', 'videoBitrate', parseInt(e.target.value) || 6000)}
                      />
                    </div>

                    <div className="field-group flex-1">
                      <label>Encoder</label>
                      <select
                        value={localSettings.output.encoder}
                        onChange={e => updateLocalSetting('output', 'encoder', e.target.value)}
                      >
                        <option value="x264">x264 (Software CPU)</option>
                        <option value="nvenc">NVIDIA NVENC H.264 (GPU)</option>
                        <option value="qsv">Intel QuickSync H.264</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Audio Bitrate (Kbps)</label>
                      <select
                        value={localSettings.output.audioBitrate}
                        onChange={e => updateLocalSetting('output', 'audioBitrate', parseInt(e.target.value) || 128)}
                      >
                        <option value="96">96 Kbps</option>
                        <option value="128">128 Kbps</option>
                        <option value="160">160 Kbps</option>
                        <option value="192">192 Kbps</option>
                        <option value="320">320 Kbps</option>
                      </select>
                    </div>

                    <div className="field-group flex-1">
                      <label>Recording Format</label>
                      <select
                        value={localSettings.output.recordingFormat}
                        onChange={e => updateLocalSetting('output', 'recordingFormat', e.target.value)}
                      >
                        <option value="mp4">MP4 (.mp4)</option>
                        <option value="mkv">MKV (.mkv)</option>
                        <option value="flv">FLV (.flv)</option>
                        <option value="mov">MOV (.mov)</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Recording Path</label>
                    <input
                      type="text"
                      value={localSettings.output.recordingPath}
                      placeholder="e.g. C:/Users/Videos"
                      onChange={e => updateLocalSetting('output', 'recordingPath', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AUDIO TAB */}
            {activeTab === 'audio' && (
              <div className="settings-section">
                <h4>System Audio Configuration</h4>
                <div className="settings-fields-grid-live mt-15">
                  <div className="field-group">
                    <label>Sample Rate</label>
                    <select
                      value={localSettings.audio.sampleRate}
                      onChange={e => updateLocalSetting('audio', 'sampleRate', e.target.value)}
                    >
                      <option value="44.1khz">44.1 kHz</option>
                      <option value="48khz">48 kHz (Recommended)</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Channels</label>
                    <select
                      value={localSettings.audio.channels}
                      onChange={e => updateLocalSetting('audio', 'channels', e.target.value)}
                    >
                      <option value="mono">Mono</option>
                      <option value="stereo">Stereo (L/R)</option>
                      <option value="5.1">5.1 Surround</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* VIDEO TAB */}
            {activeTab === 'video' && (
              <div className="settings-section">
                <h4>Canvas & Scaled Resolutions</h4>
                <div className="settings-fields-grid-live mt-15">
                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Base (Canvas) Resolution</label>
                      <select
                        value={localSettings.video.baseResolution}
                        onChange={e => updateLocalSetting('video', 'baseResolution', e.target.value)}
                      >
                        <option value="3840x2160">3840x2160 (4K UHD)</option>
                        <option value="1920x1080">1920x1080 (1080p FHD)</option>
                        <option value="1280x720">1280x720 (720p HD)</option>
                      </select>
                    </div>

                    <div className="field-group flex-1">
                      <label>Output (Scaled) Resolution</label>
                      <select
                        value={localSettings.video.outputResolution}
                        onChange={e => updateLocalSetting('video', 'outputResolution', e.target.value)}
                      >
                        <option value="3840x2160">3840x2160 (4K UHD)</option>
                        <option value="1920x1080">1920x1080 (1080p FHD)</option>
                        <option value="1280x720">1280x720 (720p HD)</option>
                        <option value="854x480">854x480 (480p SD)</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Downscale Filter</label>
                      <select
                        value={localSettings.video.downscaleFilter}
                        onChange={e => updateLocalSetting('video', 'downscaleFilter', e.target.value)}
                      >
                        <option value="bilinear">Bilinear (Fastest, blurry)</option>
                        <option value="bicubic">Bicubic (Sharpened, 16 samples)</option>
                        <option value="lanczos">Lanczos (High quality, 36 samples)</option>
                      </select>
                    </div>

                    <div className="field-group flex-1">
                      <label>Common FPS Values</label>
                      <select
                        value={localSettings.video.commonFps}
                        onChange={e => updateLocalSetting('video', 'commonFps', e.target.value)}
                      >
                        <option value="60">60 FPS</option>
                        <option value="30">30 FPS</option>
                        <option value="25">25 FPS</option>
                        <option value="24">24 FPS</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACCESSIBILITY TAB */}
            {activeTab === 'accessibility' && (
              <div className="settings-section">
                <h4>Accessibility Options</h4>
                <div className="settings-fields-grid-live mt-15">
                  <div className="field-group">
                    <label className="checkbox-row-custom">
                      <input
                        type="checkbox"
                        checked={localSettings.accessibility.screenReader}
                        onChange={e => updateLocalSetting('accessibility', 'screenReader', e.target.checked)}
                      />
                      <span>Enable Screen Reader Compatibility</span>
                    </label>
                  </div>

                  <div className="field-group">
                    <label className="checkbox-row-custom">
                      <input
                        type="checkbox"
                        checked={localSettings.accessibility.highContrast}
                        onChange={e => updateLocalSetting('accessibility', 'highContrast', e.target.checked)}
                      />
                      <span>Enable High Contrast UI Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="settings-section">
                <h4>Advanced Processing Options</h4>
                <div className="settings-fields-grid-live mt-15">
                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Process Priority</label>
                      <select
                        value={localSettings.advanced.processPriority}
                        onChange={e => updateLocalSetting('advanced', 'processPriority', e.target.value)}
                      >
                        <option value="high">High</option>
                        <option value="above_normal">Above Normal</option>
                        <option value="normal">Normal</option>
                        <option value="idle">Idle / Low</option>
                      </select>
                    </div>

                    <div className="field-group flex-1">
                      <label>Renderer</label>
                      <select
                        value={localSettings.advanced.renderer}
                        onChange={e => updateLocalSetting('advanced', 'renderer', e.target.value)}
                      >
                        <option value="direct3d11">Direct3D 11 (Windows)</option>
                        <option value="opengl">OpenGL</option>
                        <option value="software">Software Compositor</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-group-row">
                    <div className="field-group flex-1">
                      <label>Color Format</label>
                      <select
                        value={localSettings.advanced.colorFormat}
                        onChange={e => updateLocalSetting('advanced', 'colorFormat', e.target.value)}
                      >
                        <option value="nv12">NV12 (YUV 4:2:0)</option>
                        <option value="i420">I420</option>
                        <option value="i444">I444 (YUV 4:4:4)</option>
                        <option value="rgb">RGB (Uncompressed)</option>
                      </select>
                    </div>

                    <div className="field-group flex-1">
                      <label>Color Space</label>
                      <select
                        value={localSettings.advanced.colorSpace}
                        onChange={e => updateLocalSetting('advanced', 'colorSpace', e.target.value)}
                      >
                        <option value="709">BT.709 (HD Default)</option>
                        <option value="601">BT.601 (SD)</option>
                        <option value="srgb">sRGB</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Color Range</label>
                    <select
                      value={localSettings.advanced.colorRange}
                      onChange={e => updateLocalSetting('advanced', 'colorRange', e.target.value)}
                    >
                      <option value="partial">Partial (16-235 Video Broadcast)</option>
                      <option value="full">Full (0-255 PC Monitor)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave}>
            <Save size={13} />
            <span>SAVE & CLOSE</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OutputSettingsModal
