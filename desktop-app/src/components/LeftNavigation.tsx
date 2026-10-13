import React, { useState } from 'react'
import { Cpu, Grid, Image as ImageIcon, LayoutDashboard, PlaySquare, Settings, Video, Zap } from 'lucide-react'

type LeftNavigationProps = {
  onNavigate?: (id: string) => void
  copilotActive?: boolean
  onToggleCopilot?: () => void
}

export const LeftNavigation: React.FC<LeftNavigationProps> = ({ onNavigate, copilotActive = true, onToggleCopilot }) => {
  const [activeId, setActiveId] = useState('dashboard')
  const items = [
    { id: 'dashboard', icon: <LayoutDashboard size={16} strokeWidth={1.5} />, label: 'Dashboard', available: true },
    { id: 'playout', icon: <PlaySquare size={16} strokeWidth={1.5} />, label: 'PlayOut', available: true },
    { id: 'live_sources', icon: <Video size={16} strokeWidth={1.5} />, label: 'Live Sources', available: true },
    { id: 'graphics', icon: <ImageIcon size={16} strokeWidth={1.5} />, label: 'Graphics', available: true },
    { id: 'media', icon: <Grid size={16} strokeWidth={1.5} />, label: 'Media', available: true },
    { id: 'automation', icon: <Cpu size={16} strokeWidth={1.5} />, label: 'Automation', available: true },
    { id: 'analytics', icon: <Zap size={16} strokeWidth={1.5} />, label: 'Analytics', available: true },
    { id: 'settings', icon: <Settings size={16} strokeWidth={1.5} />, label: 'Settings', available: true }
  ]

  const navigate = (id: string) => {
    setActiveId(id)
    onNavigate?.(id)
  }

  return (
    <nav className="left-navigation" aria-label="Primary workspace">
      <div className="left-navigation-items">
        {items.map(item => {
          const isActive = item.id === activeId
          return (
            <button
              type="button"
              key={item.id}
              className={isActive ? 'left-navigation-item active' : 'left-navigation-item'}
              disabled={!item.available}
              title={item.label}
              onClick={() => navigate(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
      <div className="left-navigation-spacer" />
      <button type="button" className={`left-navigation-item settings ${activeId === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}>
        <Settings size={16} strokeWidth={1.5} />
        <span>Settings</span>
      </button>
      <button
        type="button"
        className={`left-navigation-copilot ${copilotActive ? 'active' : ''}`}
        style={{
          border: copilotActive ? '1px solid #a855f7' : undefined,
          boxShadow: copilotActive ? '0 0 10px rgba(168, 85, 247, 0.4)' : undefined,
          color: copilotActive ? '#c084fc' : undefined,
          cursor: 'pointer'
        }}
        title="Toggle AI Copilot Assistant"
        onClick={() => onToggleCopilot ? onToggleCopilot() : navigate('copilot')}
      >
        COPILOT
      </button>
    </nav>
  )
}
