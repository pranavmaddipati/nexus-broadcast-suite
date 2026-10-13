import React, { useState } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { X, Save, Video } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const VirtualCameraSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { scenes = [], virtualCameraSettings = [], updateVirtualCameraSettings = () => {} } = useBroadcast()

  // Local state mirrored from context settings
  const [source, setSource] = useState<string>(virtualCameraSettings.source || 'program')
  const [customSceneId, setCustomSceneId] = useState<string>(virtualCameraSettings.customSceneId || '')
  const [resolution, setResolution] = useState<string>(virtualCameraSettings.resolution || '1920x1080')
  const [fps, setFps] = useState<number>(virtualCameraSettings.fps || 60)
  const [bitrate, setBitrate] = useState<number>(virtualCameraSettings.bitrate || 12000)

  if (!isOpen) return null

  const handleSave = () => {
    updateVirtualCameraSettings({
      source,
      customSceneId,
      resolution,
      fps,
      bitrate
    })
    onClose()
  }

  return (
    <div className="output-settings-modal-overlay" onClick={onClose}>
      <div className="output-settings-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-row">
            <Video size={14} className="text-blue" />
            <h3>VIRTUAL CAMERA SETTINGS</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body-split">
          {/* Left vertical info sidebar */}
          <div className="modal-tabs-sidebar">
            <div className="tab-btn-vertical active">
              VCAM CONFIG
            </div>
            <div className="sidebar-info-hint mt-20 p-10 text-gray text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', lineHeight: '1.2' }}>
              Select the source routing and output dimensions for the Virtual Camera output loopback.
            </div>
          </div>

          {/* Right settings content */}
          <div className="modal-tab-content">
            <div className="settings-section">
              <h4>Virtual Camera Route & Output</h4>
              
              <div className="settings-fields-grid-live mt-10">
                {/* Source Select */}
                <div className="field-group">
                  <label>Capture Source</label>
                  <select value={source} onChange={e => {
                    setSource(e.target.value)
                    if (e.target.value === 'custom' && !customSceneId && scenes.length > 0) {
                      setCustomSceneId(scenes[0].id)
                    }
                  }}>
                    <option value="program">Program Monitor (Master Output)</option>
                    <option value="preview">Preview Monitor</option>
                    <option value="custom">Custom Scene Routing</option>
                  </select>
                </div>

                {/* Custom Scene Select (if source is custom) */}
                {source === 'custom' && (
                  <div className="field-group">
                    <label>Select Custom Scene</label>
                    <select value={customSceneId} onChange={e => setCustomSceneId(e.target.value)}>
                      <option value="">-- Select Scene --</option>
                      {(scenes || []).filter(s => !s.id.endsWith('_live')).map(scene => (
                        <option key={scene?.id} value={scene?.id}>
                          {scene?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="field-group-row">
                  {/* Resolution */}
                  <div className="field-group flex-1">
                    <label>Resolution</label>
                    <select value={resolution} onChange={e => setResolution(e.target.value)}>
                      <option value="1920x1080">1920x1080 (1080p Full HD)</option>
                      <option value="1280x720">1280x720 (720p HD)</option>
                      <option value="960x540">960x540 (qHD)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}