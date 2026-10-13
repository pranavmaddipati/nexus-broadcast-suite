import React from 'react'
import type { SceneSource } from '../../context/NewBroadcastContext'
import { MediaLoader } from '../../engine/input/MediaLoader'

export interface PropertyPanelProps {
  settings: Record<string, any>
  onChange: (newSettings: Record<string, any>) => void
  desktopSources?: any[]
  refreshDesktopSources?: () => void
}

export const CameraProperties: React.FC<PropertyPanelProps> = ({ settings, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Device</label>
      <select value={settings.deviceId || 'default'} onChange={e => onChange({...settings, deviceId: e.target.value})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }}>
        <option value="default">Default Web Camera</option>
        <option value="cam1">HD Pro Webcam C920</option>
        <option value="cam2">OBS Virtual Camera</option>
      </select>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Resolution</label>
      <select value={settings.resolution || '1920x1080'} onChange={e => onChange({...settings, resolution: e.target.value})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }}>
        <option value="1920x1080">1920x1080</option>
        <option value="1280x720">1280x720</option>
        <option value="640x480">640x480</option>
      </select>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>FPS</label>
      <select value={settings.fps || 30} onChange={e => onChange({...settings, fps: parseInt(e.target.value)})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }}>
        <option value="60">60</option>
        <option value="30">30</option>
        <option value="24">24</option>
      </select>
    </div>
  </div>
)

export const WindowCaptureProperties: React.FC<PropertyPanelProps> = ({ settings, onChange, desktopSources = [], refreshDesktopSources }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Window</label>
      <select value={settings.windowId || ''} onChange={e => onChange({...settings, windowId: e.target.value})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }}>
        <option value="">-- Select Window --</option>
        {desktopSources.filter(s => s.id.includes('window')).map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <input type="checkbox" checked={settings.captureCursor ?? true} onChange={e => onChange({...settings, captureCursor: e.target.checked})} />
      <label>Capture Cursor</label>
    </div>
    <button onClick={refreshDesktopSources} style={{ background: 'var(--bg-panel)', color: '#fff', border: '1px solid var(--border-color)', padding: '2px', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>Refresh Window List</button>
  </div>
)

export const DisplayCaptureProperties: React.FC<PropertyPanelProps> = ({ settings, onChange, desktopSources = [] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Display</label>
      <select value={settings.screenId || ''} onChange={e => onChange({...settings, screenId: e.target.value})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }}>
        <option value="">-- Select Display --</option>
        {desktopSources.filter(s => s.id.includes('screen')).map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <input type="checkbox" checked={settings.captureCursor ?? true} onChange={e => onChange({...settings, captureCursor: e.target.checked})} />
      <label>Capture Cursor</label>
    </div>
  </div>
)

export const MediaProperties: React.FC<PropertyPanelProps> = ({ settings, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Local File</label>
      <div style={{ display: 'flex', gap: '2px' }}>
        <input type="text" value={settings.filePath || ''} onChange={e => onChange({...settings, filePath: e.target.value})} style={{ flex: 1, background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }} />
        <button 
          onClick={async () => {
            const file = await MediaLoader.selectFile('video/*,audio/*')
            if (file) {
              const meta = await MediaLoader.loadMetadata(file)
              if (settings.blobUrl) {
                URL.revokeObjectURL(settings.blobUrl)
              }
              const filePath = (file as any).path || file.name
              onChange({ ...settings, filePath: filePath, blobUrl: meta.blobUrl })
            }
          }}
          style={{ background: 'var(--bg-panel)', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Browse
        </button>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <input type="checkbox" checked={settings.loop ?? false} onChange={e => onChange({...settings, loop: e.target.checked})} />
      <label>Loop</label>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <input type="checkbox" checked={settings.hardwareDecode ?? true} onChange={e => onChange({...settings, hardwareDecode: e.target.checked})} />
      <label>Use hardware decoding when available</label>
    </div>
  </div>
)

export const ImageProperties: React.FC<PropertyPanelProps> = ({ settings, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Image File</label>
      <div style={{ display: 'flex', gap: '2px' }}>
        <input type="text" value={settings.filePath || ''} onChange={e => onChange({...settings, filePath: e.target.value})} style={{ flex: 1, background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }} />
        <button 
          onClick={async () => {
            const file = await MediaLoader.selectFile('image/*')
            if (file) {
              const meta = await MediaLoader.loadMetadata(file)
              if (settings.blobUrl) {
                URL.revokeObjectURL(settings.blobUrl)
              }
              const filePath = (file as any).path || file.name
              onChange({ ...settings, filePath: filePath, blobUrl: meta.blobUrl })
            }
          }}
          style={{ background: 'var(--bg-panel)', color: '#fff', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Browse
        </button>
      </div>
    </div>
  </div>
)

export const BrowserProperties: React.FC<PropertyPanelProps> = ({ settings, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>URL</label>
      <input type="text" value={settings.url || ''} onChange={e => onChange({...settings, url: e.target.value})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }} />
    </div>
    <div style={{ display: 'flex', gap: '2px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <label>Width</label>
        <input type="number" value={settings.width || 1920} onChange={e => onChange({...settings, width: parseInt(e.target.value)})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <label>Height</label>
        <input type="number" value={settings.height || 1080} onChange={e => onChange({...settings, height: parseInt(e.target.value)})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Custom CSS</label>
      <textarea value={settings.customCss || ''} onChange={e => onChange({...settings, customCss: e.target.value})} rows={4} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px', fontFamily: 'monospace' }} />
    </div>
  </div>
)

export const TextProperties: React.FC<PropertyPanelProps> = ({ settings, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Text Content</label>
      <textarea value={settings.textContent || ''} onChange={e => onChange({...settings, textContent: e.target.value})} rows={3} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }} />
    </div>
    <div style={{ display: 'flex', gap: '2px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <label>Color</label>
        <input type="color" value={settings.textColor || '#ffffff'} onChange={e => onChange({...settings, textColor: e.target.value})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', width: '100%', height: '16px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        <label>Size</label>
        <input type="number" value={settings.textSize || 48} onChange={e => onChange({...settings, textSize: parseInt(e.target.value)})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', color: '#fff', padding: '2px' }} />
      </div>
    </div>
  </div>
)

export const ColorProperties: React.FC<PropertyPanelProps> = ({ settings, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <label>Color</label>
      <input type="color" value={settings.backgroundColor || 'var(--bg-main)'} onChange={e => onChange({...settings, backgroundColor: e.target.value})} style={{ background: '#020408', border: '1px solid var(--bg-panel)', width: '100%', height: '16px' }} />
    </div>
  </div>
)

export const GenericProperties: React.FC<PropertyPanelProps> = ({ settings, onChange }) => (
  <div style={{ color: '#94a3b8', fontSize: '13px' }}>
    <p>Additional properties for this source type will be configured here.</p>
    <pre style={{ background: '#020408', padding: '4px', border: '1px solid var(--bg-panel)', borderRadius: '4px' }}>
      {JSON.stringify(settings, null, 2)}
    </pre>
  </div>
)
