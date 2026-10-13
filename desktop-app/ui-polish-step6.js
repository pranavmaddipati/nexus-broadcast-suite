const fs = require('fs');

const filtersPanelContent = `import React, { useState, useEffect } from 'react'
import { useBroadcast } from '../context/BroadcastContext'
import type { SourceFilter } from '../context/BroadcastContext'
import { Plus, Trash2, Eye, EyeOff, Sliders, ArrowUp, ArrowDown, Copy, X } from 'lucide-react'

// This component is the embedded dock panel, not the modal
export const FiltersPanelDock: React.FC = () => {
  const { scenes = [], activeScene, selectedSourceId, updateFilterSettings = () => {}, updateSourceProperties = () => {}, addFilterToSource, deleteFilterFromSource } = useBroadcast()
  
  const currentScene = (scenes || []).find(s => s.id === activeScene)
  const source = currentScene?.sources.find(s => s.id === selectedSourceId)
  
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null)
  
  if (!source) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0e17' }}>
        <div style={{ padding: '6px 10px', borderBottom: '1px solid #1e293b' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>FILTERS</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '11px' }}>
          Select a source to view filters
        </div>
      </div>
    )
  }

  const filters = source.filters || []

  const handleUpdateSetting = (filterId: string, key: string, val: any) => {
    updateFilterSettings(activeScene, source.id, filterId, { [key]: val })
  }

  const activeFilter = selectedFilterId ? filters.find(f => f.id === selectedFilterId) : (filters[0] || null)

  const renderFilterSettings = (filter: SourceFilter) => {
    switch (filter.type) {
      case 'color_correction':
        return (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}><span>Brightness</span> <span>{filter.settings?.brightness ?? 1.0}</span></label>
              <input type="range" min="0" max="2" step="0.1" value={filter.settings?.brightness ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'brightness', parseFloat(e.target.value))} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}><span>Contrast</span> <span>{filter.settings?.contrast ?? 1.0}</span></label>
              <input type="range" min="0" max="2" step="0.1" value={filter.settings?.contrast ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'contrast', parseFloat(e.target.value))} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}><span>Saturation</span> <span>{filter.settings?.saturation ?? 1.0}</span></label>
              <input type="range" min="0" max="2" step="0.1" value={filter.settings?.saturation ?? 1.0} onChange={e => handleUpdateSetting(filter.id, 'saturation', parseFloat(e.target.value))} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}><span>Hue Shift</span> <span>{filter.settings?.hueRotate ?? 0}°</span></label>
              <input type="range" min="-180" max="180" step="1" value={filter.settings?.hueRotate ?? 0} onChange={e => handleUpdateSetting(filter.id, 'hueRotate', parseInt(e.target.value))} />
            </div>
          </>
        )
      case 'crop':
        return (
          <>
            {['cropLeft', 'cropRight', 'cropTop', 'cropBottom'].map(edge => (
              <div key={edge} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between' }}><span>{edge.replace('crop', '')}</span> <span>{filter.settings?.[edge] ?? 0}px</span></label>
                <input type="range" min="0" max="1000" step="1" value={filter.settings?.[edge] ?? 0} onChange={e => handleUpdateSetting(filter.id, edge, parseInt(e.target.value))} />
              </div>
            ))}
          </>
        )
      case 'blur':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}><span>Blur Amount</span> <span>{filter.settings?.blur ?? 0}px</span></label>
            <input type="range" min="0" max="100" step="1" value={filter.settings?.blur ?? 0} onChange={e => handleUpdateSetting(filter.id, 'blur', parseInt(e.target.value))} />
          </div>
        )
      case 'chroma_key':
        return (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Key Color</label>
              <input type="color" value={filter.settings?.chromaKeyColor ?? '#00ff00'} onChange={e => handleUpdateSetting(filter.id, 'chromaKeyColor', e.target.value)} style={{ width: '100%', height: '30px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}><span>Similarity</span> <span>{filter.settings?.chromaSimilarity ?? 50}</span></label>
              <input type="range" min="1" max="100" step="1" value={filter.settings?.chromaSimilarity ?? 50} onChange={e => handleUpdateSetting(filter.id, 'chromaSimilarity', parseInt(e.target.value))} />
            </div>
          </>
        )
      default:
        return <div style={{ color: '#64748b' }}>Filter options available in modal window.</div>
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0e17' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>FILTERS: {source.name.toUpperCase()}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => addFilterToSource(activeScene, source.id, 'color_correction')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Plus size={12}/></button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left list */}
        <div style={{ width: '100px', borderRight: '1px solid #1e293b', overflowY: 'auto', background: '#0f131f' }}>
          {filters.map(f => (
            <div 
              key={f.id} 
              onClick={() => setSelectedFilterId(f.id)}
              style={{ 
                padding: '6px 8px', 
                fontSize: '9px', 
                fontWeight: 700, 
                color: selectedFilterId === f.id ? '#fff' : '#64748b',
                background: selectedFilterId === f.id ? '#1e293b' : 'transparent',
                borderLeft: selectedFilterId === f.id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.type.replace('_', ' ').toUpperCase()}</span>
              {selectedFilterId === f.id && (
                <button onClick={(e) => { e.stopPropagation(); deleteFilterFromSource(activeScene, source.id, f.id); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: 0, cursor: 'pointer' }}><Trash2 size={10} /></button>
              )}
            </div>
          ))}
        </div>
        
        {/* Right controls */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto', fontSize: '10px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeFilter ? renderFilterSettings(activeFilter) : <div style={{ color: '#64748b' }}>Select a filter</div>}
        </div>
      </div>
    </div>
  )
}
`
fs.writeFileSync('src/components/FiltersPanel.tsx', filtersPanelContent);

const sourceSettingsModalContent = `import React, { useState } from 'react'
import { useBroadcast } from '../context/BroadcastContext'
import type { SceneSource } from '../context/BroadcastContext'
import { X, Settings, Monitor, Window, Video, Volume2, Type } from 'lucide-react'

export const SourceSettingsModal: React.FC<{ sourceId: string, onClose: () => void }> = ({ sourceId, onClose }) => {
  const { scenes = [], activeScene, desktopSources = [], loadDesktopSources, updateSourceProperties = () => {} } = useBroadcast()
  
  const currentScene = (scenes || []).find(s => s.id === activeScene)
  const source = currentScene?.sources.find(s => s.id === sourceId)
  
  const [settings, setSettings] = useState(source?.settings || {})

  if (!source) return null

  const handleSave = () => {
    updateSourceProperties(activeScene, source.id, { settings })
    onClose()
  }

  const renderContent = () => {
    switch (source.type) {
      case 'window_capture':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Window</label>
              <select value={settings.windowId || ''} onChange={e => setSettings({...settings, windowId: e.target.value})} style={{ background: '#020408', border: '1px solid #1e293b', color: '#fff', padding: '6px' }}>
                <option value="">-- Select Window --</option>
                {desktopSources.filter(s => s.id.includes('window')).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Capture Method</label>
              <select value={settings.captureMethod || 'automatic'} onChange={e => setSettings({...settings, captureMethod: e.target.value})} style={{ background: '#020408', border: '1px solid #1e293b', color: '#fff', padding: '6px' }}>
                <option value="automatic">Automatic</option>
                <option value="bitblt">BitBlt (Windows 7 and up)</option>
                <option value="wgc">Windows Graphics Capture (Windows 10 1903 and up)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={settings.captureCursor ?? true} onChange={e => setSettings({...settings, captureCursor: e.target.checked})} />
              <label>Capture Cursor</label>
            </div>
            <button onClick={loadDesktopSources} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>Refresh Window List</button>
          </div>
        )
      case 'display_capture':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Display</label>
              <select value={settings.screenId || ''} onChange={e => setSettings({...settings, screenId: e.target.value})} style={{ background: '#020408', border: '1px solid #1e293b', color: '#fff', padding: '6px' }}>
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
          </div>
        )
      case 'media':
      case 'video':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>File Path</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="text" value={settings.filePath || ''} onChange={e => setSettings({...settings, filePath: e.target.value})} style={{ flex: 1, background: '#020408', border: '1px solid #1e293b', color: '#fff', padding: '6px' }} />
                <button style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Browse</button>
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
          </div>
        )
      case 'text':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Text Content</label>
              <textarea value={settings.textContent || ''} onChange={e => setSettings({...settings, textContent: e.target.value})} style={{ background: '#020408', border: '1px solid #1e293b', color: '#fff', padding: '6px', minHeight: '60px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Text Color</label>
                <input type="color" value={settings.textColor || '#ffffff'} onChange={e => setSettings({...settings, textColor: e.target.value})} style={{ width: '60px', height: '30px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <label>Font Size ({settings.textSize || 48}px)</label>
                <input type="range" min="12" max="200" value={settings.textSize || 48} onChange={e => setSettings({...settings, textSize: parseInt(e.target.value)})} />
              </div>
            </div>
          </div>
        )
      default:
        return <div style={{ color: '#64748b' }}>Properties for {source.type} will be displayed here.</div>
    }
  }

  return (
    <div className="output-settings-modal-overlay" onClick={onClose} style={{ zIndex: 2000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="output-settings-modal-box" style={{ background: '#0a0e17', width: '500px', border: '1px solid #1e293b', borderRadius: '8px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <Settings size={15} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 800 }}>PROPERTIES - {source.name.toUpperCase()}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={15} /></button>
        </div>

        <div style={{ padding: '16px', fontSize: '11px', color: '#cbd5e1', maxHeight: '400px', overflowY: 'auto' }}>
          {renderContent()}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>Cancel</button>
          <button onClick={handleSave} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>OK</button>
        </div>

      </div>
    </div>
  )
}
`
fs.writeFileSync('src/components/SourceSettingsModal.tsx', sourceSettingsModalContent);

console.log('FiltersPanel and SourceSettingsModal refactored');
