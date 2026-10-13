import React from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { GraphicsDesigner } from './GraphicsDesigner'
import { SceneLibrary } from './SceneLibrary'
import { SourcesPanel } from './SourcesPanel'
import { StreamSettingsPanel } from './StreamSettingsPanel'
import { LiveSettingsPanel } from './LiveSettingsPanel'
import { QuickActionsPanel } from './QuickActionsPanel'

export const WorkspaceContainer: React.FC = () => {
  const { activeWorkspaceTab = 'switcher' } = useBroadcast()

  const renderContent = () => {
    switch (activeWorkspaceTab) {
      case 'switcher':
        return (
          <div id="bottom-workspace" style={{ display: 'grid', gridTemplateColumns: '30fr 35fr 22fr 13fr', gap: '6px', width: '100%', height: '100%', minHeight: '100%', maxHeight: '100%', padding: '0', boxSizing: 'border-box', overflow: 'hidden' }}>
            {/* Macros Panel */}
            <div id="panel-scene-library" className="premium-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
              <SceneLibrary />
            </div>
            
            {/* Sources */}
            <div id="panel-sources" className="premium-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
              <SourcesPanel />
            </div>

            {/* Live Settings */}
            <div id="panel-live-settings" className="premium-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
              <LiveSettingsPanel />
            </div>

            {/* Quick Actions */}
            <div id="panel-quick-actions" className="premium-panel" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
              <QuickActionsPanel />
            </div>
          </div>
        )
      case 'graphics':
        return <GraphicsDesigner />
      case 'live_settings':
        return <LiveSettingsPanel />
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '13px', fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: '4px', background: 'transparent', border: '1px solid var(--bg-panel)' }}>
            <span style={{ fontWeight: 600 }}>{typeof activeWorkspaceTab === 'string' ? activeWorkspaceTab.toUpperCase().replace('_', ' ') : 'WORKSPACE'}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>This workspace is currently under development.</span>
          </div>
        )
    }
  }

  return (
    <div className="workspace-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%', maxHeight: '100%', width: '100%', background: 'transparent', overflow: 'hidden' }}>
      <div id="main-content-layout" style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </div>
    </div>
  )
}
