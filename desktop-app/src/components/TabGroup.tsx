import React, { useState } from 'react'
import { PanelHeader } from './PanelHeader'

export interface TabGroupProps {
  docks: any[]
  renderContent: (id: string) => React.ReactNode
}

export const TabGroup: React.FC<TabGroupProps> = ({ docks, renderContent }) => {
  const [activeTab, setActiveTab] = useState<string>(docks[0]?.id || '')

  // If a dock is removed while it was active, switch to the first available
  if (docks.length > 0 && !docks.find(d => d.id === activeTab)) {
    setActiveTab(docks[0].id)
  }

  if (docks.length === 0) return null

  // Single dock: Render normally without tab bar, just panel header
  if (docks.length === 1) {
    const dock = docks[0]
    return (
      <div className="dock-grid-cell" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <PanelHeader id={dock.id} title={dock.title} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {renderContent(dock.id)}
        </div>
      </div>
    )
  }

  // Multiple docks: Render tab bar
  const activeDock = docks.find(d => d.id === activeTab) || docks[0]

  return (
    <div className="dock-grid-cell" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', background: 'transparent', borderBottom: '1px solid var(--bg-panel)' }}>
        {docks.map(dock => (
          <div
            key={dock.id}
            onClick={() => setActiveTab(dock.id)}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === dock.id ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === dock.id ? '2px solid #38bdf8' : '2px solid transparent',
              background: activeTab === dock.id ? 'var(--bg-panel)' : 'transparent',
              userSelect: 'none'
            }}
          >
            {dock.title}
          </div>
        ))}
        {/* Fill remaining space to match header styling */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: '4px' }}>
          <PanelHeader id={activeDock.id} title="" isFloating={false} />
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderContent(activeDock.id)}
      </div>
    </div>
  )
}
