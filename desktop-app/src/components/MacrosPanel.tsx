import React from 'react'
import { PanelHeader } from './PanelHeader'
import { Search, Grid, Plus, MoreVertical } from 'lucide-react'

export const MacrosPanel: React.FC = () => {
  const scenes = [
    { name: 'Scene 1 - Worship', sources: 5, duration: '00:15:42', isProgram: true },
    { name: 'Scene 2 - Sermon', sources: 3, duration: '00:20:11', isPreview: true },
    { name: 'Scene 3 - Welcome', sources: 2, duration: '00:05:30' },
    { name: 'Scene 4 - Announcement', sources: 2, duration: '00:03:12' }
  ]

  const sceneImages = [
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=640&q=80',
  ];

  return (
    <div className="premium-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '0', overflow: 'hidden' }}>
      <PanelHeader id="scene_library" title="SCENE LIBRARY">
        <Grid size={12} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} className="hover:text-white" />
        <Plus size={12} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} className="hover:text-white" />
      </PanelHeader>
      
      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'hidden', boxSizing: 'border-box' }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', padding: '6px 8px', borderRadius: '2px', border: '1px solid var(--border-color)' }}>
          <Search size={12} color="#64748b" />
          <input type="text" placeholder="Search scenes..." style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontFamily: 'var(--sans)' }} />
        </div>

        {/* Scene Cards */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {scenes.map((scene, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '2px', cursor: 'pointer' }} className="hover:bg-slate-800 transition-colors">
              <div style={{ width: '40px', height: '22px', background: `url("${sceneImages[i]}") center/cover`, borderRadius: '1px', border: '1px solid #000' }}></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--sans)' }}>{scene.name}</span>
                <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'var(--sans)' }}>{scene.sources} Src | {scene.duration}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button style={{ padding: '0 4px', height: '16px', fontSize: '9px', fontWeight: 800, color: scene.isPreview ? '#fff' : 'var(--text-secondary)', background: scene.isPreview ? 'var(--accent-green)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '2px', cursor: 'pointer' }}>PRV</button>
                <button style={{ padding: '0 4px', height: '16px', fontSize: '9px', fontWeight: 800, color: scene.isProgram ? '#fff' : 'var(--text-secondary)', background: scene.isProgram ? 'var(--accent-red)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '2px', cursor: 'pointer' }}>LIVE</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '10px', fontWeight: 700, marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
          8 SCENES
        </div>
      </div>
    </div>
  )
}
