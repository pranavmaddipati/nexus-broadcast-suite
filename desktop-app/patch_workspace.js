const fs = require('fs')

const wcCode = `import React, { useState } from 'react'
import { GraphicsDesigner } from './GraphicsDesigner'
import { SceneLibrary } from './SceneLibrary'
import { SourcesPanel } from './SourcesPanel'
import { FiltersPanelDock } from './FiltersPanel'
// Import LiveSettingsPanel once created
// import { LiveSettingsPanel } from './LiveSettingsPanel'
import { Folder, Image as ImageIcon, Play, Layers, RotateCcw, Globe, MousePointerClick, Settings, Video, Mic, Share2, Terminal } from 'lucide-react'

export const WorkspaceContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('switcher')

  const tabs = [
    { id: 'media_browser', label: 'Media Browser', icon: <Folder size={12} /> },
    { id: 'playlist', label: 'Playlist', icon: <Play size={12} /> },
    { id: 'graphics', label: 'Graphics', icon: <Layers size={12} /> },
    { id: 'replay', label: 'Replay', icon: <RotateCcw size={12} /> },
    { id: 'browser', label: 'Browser', icon: <Globe size={12} /> },
    { id: 'multiview', label: 'Multiview', icon: <ImageIcon size={12} /> },
    { id: 'switcher', label: 'Switcher', icon: <MousePointerClick size={12} /> },
    { id: 'live_settings', label: 'Live Settings', icon: <Settings size={12} /> },
    { id: 'output_settings', label: 'Output Settings', icon: <Share2 size={12} /> },
    { id: 'recording', label: 'Recording', icon: <Video size={12} /> },
    { id: 'virtual_camera', label: 'Virtual Camera', icon: <Video size={12} /> },
    { id: 'ndi_output', label: 'NDI Output', icon: <Share2 size={12} /> },
    { id: 'macros', label: 'Macros', icon: <Terminal size={12} /> },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'switcher':
        return (
          <div style={{ display: 'flex', width: '100%', height: '100%', gap: '8px', padding: '8px', boxSizing: 'border-box' }}>
            <div style={{ flex: '1.5', minWidth: 0, height: '100%', border: '1px solid #1e293b', background: '#0f172a' }}>
              <SceneLibrary />
            </div>
            <div style={{ flex: '1', minWidth: 0, height: '100%', border: '1px solid #1e293b', background: '#0f172a' }}>
              <SourcesPanel />
            </div>
            <div style={{ flex: '1', minWidth: 0, height: '100%', border: '1px solid #1e293b', background: '#0f172a' }}>
              <FiltersPanelDock />
            </div>
          </div>
        )
      case 'graphics':
        return <GraphicsDesigner />
      case 'live_settings':
        return <div style={{ padding: '20px', color: '#fff' }}>Live Settings Panel (under construction)</div>
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '11px', flexDirection: 'column', gap: '8px' }}>
            {tabs.find(t => t.id === activeTab)?.icon}
            <span>{tabs.find(t => t.id === activeTab)?.label} workspace is under development.</span>
          </div>
        )
    }
  }

  return (
    <div className="workspace-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#050505' }}>
      <div className="workspace-tabs" style={{ display: 'flex', borderBottom: '1px solid #1e293b', padding: '4px 8px 0', overflowX: 'auto', gap: '2px', background: '#0f172a' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 12px',
              background: activeTab === tab.id ? '#1e293b' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#94a3b8',
              border: 'none',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="workspace-content" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {renderContent()}
      </div>
    </div>
  )
}
`

fs.writeFileSync('src/components/WorkspaceContainer.tsx', wcCode)
console.log('WorkspaceContainer.tsx patched.')
