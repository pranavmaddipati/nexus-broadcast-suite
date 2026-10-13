import React, { useState } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { SceneSource } from '../context/NewBroadcastContext'
import { X, Settings, Monitor, Wind, Video, Volume2, Type, Image as ImageIcon, Globe, Palette, Sliders, Hash, Radio, AppWindow, Cpu } from 'lucide-react'

export const SourceSettingsModal: React.FC<{ sourceId: string, onClose: () => void }> = ({ sourceId, onClose }) => {
  const {
    scenes = [],
    activeScene,
    desktopSources = [],
    loadDesktopSources = () => {},
    videoDevices = [],
    audioDevices = [],
    openMediaFileDialog,
    updateSourceProperties = () => {}
  } = useBroadcast()
  
  const currentScene = (scenes || []).find(s => s.id === activeScene)
  const source = currentScene?.sources.find(s => s.id === sourceId)
  
  const [settings, setSettings] = useState(source?.settings || {})
  const [rootProps, setRootProps] = useState({
    x: source?.x ?? 0,
    y: source?.y ?? 0,
    width: source?.width ?? 1920,
    height: source?.height ?? 1080,
    opacity: source?.opacity ?? 1.0,
    visible: source?.visible ?? true,
    locked: source?.locked ?? false,
  })
  const [activeTab, setActiveTab] = useState<'general' | 'selection' | 'transform' | 'crop' | 'filters' | 'audio' | 'advanced' | 'stats'>('general')

  if (!source) return null

  const handleBrowseFile = async (type: 'image' | 'video' | 'media') => {
    if (openMediaFileDialog) {
      const res = await openMediaFileDialog({ type, title: `Select ${type.toUpperCase()} File` })
      if (!res.canceled && res.filePath) {
        setSettings((prev: any) => ({ ...prev, filePath: res.filePath }))
      }
    }
  }

  const handleSave = () => {
    updateSourceProperties(activeScene, source.id, { ...rootProps, settings })
    onClose()
  }

  const renderTabGeneral = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label>Source Name</label>
          <input type="text" value={source.name} disabled style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#94a3b8', padding: '6px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label>Source Type</label>
          <input type="text" value={source.type.toUpperCase()} disabled style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#94a3b8', padding: '6px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <input type="checkbox" checked={rootProps.visible} onChange={e => setRootProps({...rootProps, visible: e.target.checked})} />
          <label>Visible in Scene</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={rootProps.locked} onChange={e => setRootProps({...rootProps, locked: e.target.checked})} />
          <label>Locked in Preview</label>
        </div>
      </div>
    )
  }

  const renderTabSelection = () => {
    switch (source.type) {
      case 'window_capture':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Window</label>
              <select value={settings.windowId || ''} onChange={e => setSettings({...settings, windowId: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
                <option value="">-- Select Window --</option>
                {desktopSources.filter(s => s.id.includes('window')).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Window Match Priority</label>
              <select value={settings.matchPriority || 'title'} onChange={e => setSettings({...settings, matchPriority: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
                <option value="title">Match title, otherwise find window of same executable</option>
                <option value="exe">Match executable name</option>
                <option value="exact">Match title exactly</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Capture Method</label>
              <select value={settings.captureMethod || 'automatic'} onChange={e => setSettings({...settings, captureMethod: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
                <option value="automatic">Automatic</option>
                <option value="bitblt">BitBlt (Windows 7 and up)</option>
                <option value="wgc">Windows Graphics Capture (Windows 10 1903 and up)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.captureCursor ?? true} onChange={e => setSettings({...settings, captureCursor: e.target.checked})} />
              <label>Capture Cursor</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.compatibilityMode ?? false} onChange={e => setSettings({...settings, compatibilityMode: e.target.checked})} />
              <label>Multi-Adapter Compatibility</label>
            </div>
            <button onClick={loadDesktopSources} style={{ background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '2px', cursor: 'pointer', width: 'fit-content' }}>Refresh Window List</button>
            <div style={{ marginTop: '10px', height: '120px', background: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Live Preview</div>
          </div>
        )
      case 'display_capture':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Display</label>
              <select value={settings.screenId || ''} onChange={e => setSettings({...settings, screenId: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
                <option value="">-- Select Display --</option>
                {desktopSources.filter(s => s.id.includes('screen')).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.captureCursor ?? true} onChange={e => setSettings({...settings, captureCursor: e.target.checked})} />
              <label>Capture Cursor</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.hdr ?? false} onChange={e => setSettings({...settings, hdr: e.target.checked})} />
              <label>SDR to HDR Tonemapping</label>
            </div>
            <div style={{ marginTop: '10px', height: '120px', background: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Live Preview</div>
          </div>
        )
      case 'media':
      case 'video':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Local File</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="text" value={settings.filePath || ''} onChange={e => setSettings({...settings, filePath: e.target.value})} style={{ flex: 1, background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} placeholder="Select local media file..." />
                <button type="button" onClick={() => handleBrowseFile('media')} style={{ background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '2px', cursor: 'pointer' }}>Browse</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.loop ?? false} onChange={e => setSettings({...settings, loop: e.target.checked})} />
              <label>Loop</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.restartOnActivate ?? true} onChange={e => setSettings({...settings, restartOnActivate: e.target.checked})} />
              <label>Restart playback when source becomes active</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.hardwareDecode ?? true} onChange={e => setSettings({...settings, hardwareDecode: e.target.checked})} />
              <label>Use hardware decoding when available</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.closeWhenInactive ?? false} onChange={e => setSettings({...settings, closeWhenInactive: e.target.checked})} />
              <label>Close file when inactive</label>
            </div>
          </div>
        )
      case 'image':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Image File</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="text" value={settings.filePath || ''} onChange={e => setSettings({...settings, filePath: e.target.value})} style={{ flex: 1, background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} placeholder="Select image file..." />
                <button type="button" onClick={() => handleBrowseFile('image')} style={{ background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '2px', cursor: 'pointer' }}>Browse</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.preserveAspect ?? true} onChange={e => setSettings({...settings, preserveAspect: e.target.checked})} />
              <label>Preserve Aspect Ratio</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.unloadWhenHidden ?? false} onChange={e => setSettings({...settings, unloadWhenHidden: e.target.checked})} />
              <label>Unload image when not showing</label>
            </div>
          </div>
        )
      case 'browser':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.localFile ?? false} onChange={e => setSettings({...settings, localFile: e.target.checked})} />
              <label>Local file</label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>URL</label>
              <input type="text" value={settings.url || ''} onChange={e => setSettings({...settings, url: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} disabled={settings.localFile} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <label>Width</label>
                <input type="number" value={settings.browserWidth || 1920} onChange={e => setSettings({...settings, browserWidth: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <label>Height</label>
                <input type="number" value={settings.browserHeight || 1080} onChange={e => setSettings({...settings, browserHeight: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.routeAudio ?? true} onChange={e => setSettings({...settings, routeAudio: e.target.checked})} />
              <label>Control audio via OBS / Broadcast Suite</label>
            </div>
          </div>
        )
      case 'text':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Text (GDI+ / FreeType)</label>
              <textarea value={settings.textContent || ''} onChange={e => setSettings({...settings, textContent: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px', minHeight: '60px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Color</label>
                <input type="color" value={settings.textColor || '#ffffff'} onChange={e => setSettings({...settings, textColor: e.target.value})} style={{ width: '60px', height: '30px', background: 'transparent', border: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <label>Font Size ({settings.textSize || 48}px)</label>
                <input type="range" min="12" max="200" value={settings.textSize || 48} onChange={e => setSettings({...settings, textSize: parseInt(e.target.value)})} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.outline ?? false} onChange={e => setSettings({...settings, outline: e.target.checked})} />
              <label>Outline</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.dropShadow ?? false} onChange={e => setSettings({...settings, dropShadow: e.target.checked})} />
              <label>Drop Shadow</label>
            </div>
          </div>
        )
      case 'color_source':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Color</label>
                <input type="color" value={settings.backgroundColor || '#1e3a8a'} onChange={e => setSettings({...settings, backgroundColor: e.target.value})} style={{ width: '60px', height: '30px', background: 'transparent', border: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <label>Width</label>
                <input type="number" value={settings.width || 400} onChange={e => setSettings({...settings, width: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <label>Height</label>
                <input type="number" value={settings.height || 400} onChange={e => setSettings({...settings, height: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
              </div>
            </div>
          </div>
        )
      case 'camera':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Video Capture Device</label>
              <select value={settings.deviceId || 'default'} onChange={e => setSettings({...settings, deviceId: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
                <option value="default">Default Video Device</option>
                {videoDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Camera ${idx + 1} (${dev.deviceId ? dev.deviceId.slice(0, 8) : 'default'})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      case 'audio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Audio Input Device</label>
              <select value={settings.deviceId || 'default'} onChange={e => setSettings({...settings, deviceId: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
                <option value="default">Default Audio Device</option>
                {audioDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Microphone ${idx + 1} (${dev.deviceId ? dev.deviceId.slice(0, 8) : 'default'})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )
      case 'ndi':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Source Name</label>
              <select value={settings.ndiSourceName || ''} onChange={e => setSettings({...settings, ndiSourceName: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
                <option value="">-- Select NDI Source --</option>
                <option value="DESKTOP-1 (OBS)">DESKTOP-1 (OBS)</option>
                <option value="MACBOOK (vMix)">MACBOOK (vMix)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.hardwareDecode ?? true} onChange={e => setSettings({...settings, hardwareDecode: e.target.checked})} />
              <label>Hardware Decode</label>
            </div>
          </div>
        )
      case 'media_playlist':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Playlist Directory / Files</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="text" value={settings.playlistPath || ''} onChange={e => setSettings({...settings, playlistPath: e.target.value})} style={{ flex: 1, background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} placeholder="Select multiple files or directory..." />
                <button style={{ background: 'transparent', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '2px' }}>Browse</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.loopPlaylist ?? true} onChange={e => setSettings({...settings, loopPlaylist: e.target.checked})} />
              <label>Loop Playlist</label>
            </div>
          </div>
        )
      default:
        return <div style={{ color: '#64748b' }}>Selection properties for {source.type} not implemented in preview.</div>
    }
  }

  const renderTabTransform = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Position X</label>
            <input type="number" value={Math.round(rootProps.x)} onChange={e => setRootProps({...rootProps, x: parseFloat(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Position Y</label>
            <input type="number" value={Math.round(rootProps.y)} onChange={e => setRootProps({...rootProps, y: parseFloat(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Width</label>
            <input type="number" value={Math.round(rootProps.width)} onChange={e => setRootProps({...rootProps, width: parseFloat(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Height</label>
            <input type="number" value={Math.round(rootProps.height)} onChange={e => setRootProps({...rootProps, height: parseFloat(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Rotation (deg)</label>
            <input type="number" value={Math.round(settings.rotation || 0)} onChange={e => setSettings({...settings, rotation: parseFloat(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Opacity (0-1)</label>
            <input type="number" min="0" max="1" step="0.05" value={rootProps.opacity} onChange={e => setRootProps({...rootProps, opacity: parseFloat(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Crop Left</label>
            <input type="number" value={settings.cropLeft || 0} onChange={e => setSettings({...settings, cropLeft: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Crop Right</label>
            <input type="number" value={settings.cropRight || 0} onChange={e => setSettings({...settings, cropRight: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Crop Top</label>
            <input type="number" value={settings.cropTop || 0} onChange={e => setSettings({...settings, cropTop: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Crop Bottom</label>
            <input type="number" value={settings.cropBottom || 0} onChange={e => setSettings({...settings, cropBottom: parseInt(e.target.value)})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Blend Mode</label>
            <select value={settings.blendMode || 'normal'} onChange={e => setSettings({...settings, blendMode: e.target.value})} style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#fff', padding: '6px' }}>
              <option value="normal">Normal</option>
              <option value="screen">Screen</option>
              <option value="multiply">Multiply</option>
              <option value="overlay">Overlay</option>
              <option value="lighten">Lighten</option>
              <option value="darken">Darken</option>
              <option value="color-dodge">Color Dodge</option>
              <option value="color-burn">Color Burn</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label>Color (Tint/Background)</label>
            <input type="color" value={settings.color || '#ffffff'} onChange={e => setSettings({...settings, color: e.target.value})} style={{ width: '100%', height: '30px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2', marginTop: '8px' }}>
            <input type="checkbox" checked={settings.lockAspectRatio ?? false} onChange={e => setSettings({...settings, lockAspectRatio: e.target.checked})} />
            <label>Aspect Lock</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2' }}>
            <input type="checkbox" checked={rootProps.visible} onChange={e => setRootProps({...rootProps, visible: e.target.checked})} />
            <label>Visible</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2' }}>
            <input type="checkbox" checked={rootProps.locked} onChange={e => setRootProps({...rootProps, locked: e.target.checked})} />
            <label>Locked</label>
          </div>
        </div>
      </div>
    )
  }

  const renderTabCrop = () => {
    return (
      <div style={{ color: '#64748b' }}>Crop settings moved to Transform tab.</div>
    )
  }

  const renderTabAudio = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label>Audio Monitoring</label>
          <select value={source.monitor} disabled style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#94a3b8', padding: '6px' }}>
            <option value="off">Monitor Off</option>
            <option value="monitor_only">Monitor Only (mute output)</option>
            <option value="monitor_and_output">Monitor and Output</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label>Sync Offset (ms)</label>
          <input type="number" value={source.audioDelay} disabled style={{ background: 'transparent', border: '1px solid var(--bg-panel)', color: '#94a3b8', padding: '6px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label>Audio Tracks</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[1,2,3,4,5,6].map(trk => (
              <div key={trk} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="checkbox" checked={true} disabled />
                <label>{trk}</label>
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '10px' }}>* Note: Adjust audio settings via the Advanced Audio Properties or Audio Mixer.</div>
      </div>
    )
  }

  const renderTabStats = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'transparent', padding: '8px', border: '1px solid var(--bg-panel)', borderRadius: '2px' }}>
            <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>RENDER THREAD</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>0.2 ms</div>
          </div>
          <div style={{ background: 'transparent', padding: '8px', border: '1px solid var(--bg-panel)', borderRadius: '2px' }}>
            <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>MEMORY ALLOC</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>14 MB</div>
          </div>
          <div style={{ background: 'transparent', padding: '8px', border: '1px solid var(--bg-panel)', borderRadius: '2px' }}>
            <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>FRAMES DROPPED</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>0 (0.0%)</div>
          </div>
          <div style={{ background: 'transparent', padding: '8px', border: '1px solid var(--bg-panel)', borderRadius: '2px' }}>
            <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 800 }}>SOURCE FPS</div>
            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 700 }}>60.00</div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'general': return renderTabGeneral()
      case 'selection': return renderTabSelection()
      case 'transform': return renderTabTransform()
      case 'crop': return renderTabCrop()
      case 'filters': return <div style={{ color: '#64748b' }}>Filters panel integrated via Filters dock. Use the main Filters panel to add/remove filters.</div>
      case 'audio': return renderTabAudio()
      case 'advanced': return <div style={{ color: '#64748b' }}>Advanced properties (Deinterlacing, Color Space, Color Range) not available for this source type.</div>
      case 'stats': return renderTabStats()
      default: return null
    }
  }

  return (
    <div className="output-settings-modal-overlay" onClick={onClose} style={{ zIndex: 2000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="output-settings-modal-box" style={{ background: 'transparent', width: '750px', height: '550px', border: '1px solid var(--border-color)', borderRadius: '2px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'transparent', borderBottom: '1px solid var(--bg-panel)', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <Settings size={16} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800 }}>PROPERTIES FOR '{source.name}'</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Sidebar Tabs */}
          <div style={{ width: '180px', background: 'transparent', borderRight: '1px solid var(--bg-panel)', display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
            {[
              { id: 'general', label: 'General', icon: <Hash size={14} /> },
              { id: 'selection', label: 'Source Selection', icon: <AppWindow size={14} /> },
              { id: 'transform', label: 'Transform / Props', icon: <Monitor size={14} /> },
              { id: 'filters', label: 'Filters', icon: <Palette size={14} /> },
              { id: 'audio', label: 'Audio', icon: <Volume2 size={14} /> },
              { id: 'advanced', label: 'Advanced', icon: <Sliders size={14} /> },
              { id: 'stats', label: 'Statistics', icon: <Cpu size={14} /> },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                  background: activeTab === tab.id ? 'var(--bg-panel)' : 'transparent',
                  border: 'none', borderLeft: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                  color: activeTab === tab.id ? '#fff' : '#94a3b8',
                  fontSize: '11px', fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer', textAlign: 'left', outline: 'none'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', fontSize: '11px', color: '#cbd5e1' }}>
            {renderContent()}
          </div>
        </div>

        <div style={{ padding: '12px 20px', background: 'transparent', borderTop: '1px solid var(--bg-panel)', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#cbd5e1', padding: '8px 24px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>Cancel</button>
          <button onClick={handleSave} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 24px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>OK</button>
        </div>

      </div>
    </div>
  )
}
