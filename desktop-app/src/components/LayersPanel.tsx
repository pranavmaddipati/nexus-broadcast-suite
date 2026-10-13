import React, { useState } from 'react'
import { Layers, Eye, EyeOff, Lock, Unlock, GripVertical } from 'lucide-react'

export const LayersPanel: React.FC = () => {
  const [layers, setLayers] = useState([
    { id: 1, name: 'Logo', visible: true, locked: false },
    { id: 2, name: 'Lower Third', visible: true, locked: false },
    { id: 3, name: 'Lyrics', visible: false, locked: false },
    { id: 4, name: 'Camera 1', visible: true, locked: true },
    { id: 5, name: 'Background', visible: true, locked: true },
  ])

  const toggleVisible = (id: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
  }

  const toggleLock = (id: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      {/* Header */}
      <div className="panel-header">
        <Layers />
        <span className="title">Scene Layers</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {layers.map((layer, index) => (
          <div 
            key={layer.id} 
            className="hover-brighten"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px', 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              borderRadius: '2px',
              opacity: layer.visible ? 1 : 0.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GripVertical size={14} color="var(--text-meta)" style={{ cursor: 'grab' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{layer.name}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div onClick={() => toggleVisible(layer.id)} style={{ cursor: 'pointer', display: 'flex' }} title="Toggle Visibility">
                {layer.visible ? <Eye size={14} color="var(--text-secondary)" /> : <EyeOff size={14} color="var(--accent-red)" />}
              </div>
              <div onClick={() => toggleLock(layer.id)} style={{ cursor: 'pointer', display: 'flex' }} title="Toggle Lock">
                {layer.locked ? <Lock size={14} color="var(--text-secondary)" /> : <Unlock size={14} color="var(--text-secondary)" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
