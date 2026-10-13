import './App.css'
import './corrected-panels.css'
import React, { useState } from 'react'
import { useBroadcast } from './context/NewBroadcastContext'
import { TopBar } from './components/TopBar'
import { PreviewMonitor } from './components/PreviewMonitor'
import { ProgramMonitor } from './components/ProgramMonitor'
import { PinnedScenes } from './components/PinnedScenes'
import { SourcesPanel } from './components/SourcesPanel'
import { AudioMixer } from './components/AudioMixer'
import { LeftNavigation } from './components/LeftNavigation'
import { LiveSettingsPanel } from './components/LiveSettingsPanel'
import { SystemOverviewPanel } from './components/SystemOverviewPanel'
import { BroadcastHealthPanel } from './components/BroadcastHealthPanel'
import { TransitionControlsExtended } from './components/TransitionControlsExtended'
import { AnalyticsPanel } from './components/AnalyticsPanel'
import { AiCopilotPanel } from './components/AiCopilotPanel'
import { TransitionTBar } from './components/TransitionTBar'
import { Hexagon } from 'lucide-react'
import { MultitrackTimeline } from './components/MultitrackTimeline'

function WorkspaceShell() {
  const { transitionType, setTransitionType, transitionDuration, setTransitionDuration, isTransitioning, cutTransition, autoTransition, takeLive } = useBroadcast()
  const [expandedUtility, setExpandedUtility] = useState<'transitions' | 'system' | 'health' | 'analytics' | null>(null)
  const [copilotVisible, setCopilotVisible] = useState(true)

  const handleNavigate = (id: string) => {
    if (id === 'analytics') {
      setExpandedUtility('analytics')
      return
    }
    if (id === 'copilot') {
      setCopilotVisible(prev => !prev)
      return
    }
    if (id === 'dashboard') setExpandedUtility(null)
    const selector: Record<string, string> = {
      playout: '.multitrack-panel',
      live_sources: '.source-library',
      settings: '.live-settings-panel'
    }
    const target = selector[id] ? document.querySelector(selector[id]) : null
    target?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  return (
    <div className="app app-background" style={{ display: 'grid', gridTemplateRows: '48px 1fr', width: '100%', height: '100vh', overflow: 'hidden', padding: '0', gap: '0', boxSizing: 'border-box', borderTop: 'none', outline: 'none' }}>

      {/* ROW 1: TOP HEADER (48px) */}
      <div id="top-header-row" className="app-drag-region" style={{ boxSizing: 'border-box', position: 'relative', height: '48px', minHeight: '48px', maxHeight: '48px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', zIndex: 1000, background: 'var(--bg-header)', borderTop: 'none', borderBottom: '1px solid var(--border-color)', padding: '8px 16px', gap: '16px' }}>

        {/* LEFT BRANDING */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hexagon size={32} stroke="var(--accent-blue)" strokeWidth={2} style={{ filter: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>NEXUS</span>
            <span style={{ color: '#8b93a7', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em', marginTop: '1.5px' }}>BROADCAST SUITE</span>
          </div>
        </div>

        <TopBar />
      </div>

      {/* MIDDLE ZONE */}
      <div id="middle-zone" style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', overflow: 'hidden', background: 'transparent' }}>
        
        {/* LEFT NAVIGATION */}
        <LeftNavigation
          onNavigate={handleNavigate}
          copilotActive={copilotVisible}
          onToggleCopilot={() => setCopilotVisible(v => !v)}
        />

        {/* INDEPENDENT WORKSPACE LAYOUT */}
        <div className="workspace-shell" style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '6px',
          height: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          
          {/* 3-COLUMN BROADCAST LAYOUT */}
          <div className="broadcast-layout" style={{ display: 'flex', flex: 1, minHeight: 0, gap: '6px', width: '100%', overflow: 'hidden' }}>

            {/* LEFT COLUMN */}
            <div className="workspace-left" style={{ flex: 18, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px', height: '100%', overflow: 'hidden' }}>
              <div className="depth-layer-2" style={{ flex: copilotVisible ? 44 : 60, display: 'flex', overflow: 'hidden' }}>
                <PinnedScenes />
              </div>
              <div className="depth-layer-2" style={{ flex: copilotVisible ? 30 : 40, display: 'flex', overflow: 'hidden' }}>
                <LiveSettingsPanel />
              </div>
              {copilotVisible && (
                <div className="depth-layer-2" style={{ flex: 26, display: 'flex', overflow: 'hidden', minHeight: '140px' }}>
                  <AiCopilotPanel />
                </div>
              )}
            </div>

            {/* CENTER COLUMN */}
            <div className="workspace-center" style={{ flex: 58, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, height: '100%', overflow: 'hidden' }}>
              {/* Monitors & Transition Controls */}
              <div className="monitor-stack" style={{ flex: 50, display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0 }}>
                <div style={{ flex: 1, display: 'flex', gap: '6px', minHeight: 0 }}>
                  <PreviewMonitor />
                  <TransitionTBar />
                  <ProgramMonitor />
                </div>
                {/* Transition Buttons */}
                <div style={{ height: '28px', flexShrink: 0, width: '100%', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['cut', 'mix', 'dip', 'wipe', 'push', 'zoom'] as const).map(t => (
                      <button key={t} className="hardware-button" disabled={isTransitioning} aria-pressed={transitionType === t} onClick={() => t === 'cut' ? cutTransition() : setTransitionType(t)} style={{ 
                        width: '48px',
                        background: transitionType === t ? '#1f6fe0' : undefined,
                        color: transitionType === t ? '#ffffff' : undefined,
                        border: transitionType === t ? 'none' : undefined,
                        fontWeight: transitionType === t ? 800 : undefined,
                        boxShadow: 'none'
                      }}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div style={{ width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <select aria-label="Transition duration" value={transitionDuration} disabled={isTransitioning} onChange={event => setTransitionDuration(Number(event.target.value))}>
                      {[250, 500, 1000, 2000].map(duration => <option key={duration} value={duration}>{duration / 1000}s</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="hardware-button" disabled={isTransitioning} onClick={() => autoTransition()} style={{ width: '80px', background: '#1f6fe0', color: '#ffffff', border: 'none', fontWeight: 800, boxShadow: 'none' }}>AUTO</button>
                    <button className="hardware-button take-btn" onClick={() => takeLive()} style={{ width: '80px' }}>TAKE</button>
                  </div>
                </div>
              </div>
              
              {/* Sources Grid */}
              <div className="depth-layer-2 source-library-dock" style={{ flex: 19, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
                <SourcesPanel />
              </div>

              {/* Multitrack Timeline */}
              <div className="timeline-dock" style={{ flex: 31, display: 'flex', gap: '6px', minHeight: '190px' }}>
                 <div className="depth-layer-2" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    <MultitrackTimeline />
                 </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Audio Mixer on top, followed by 4 collapsible accordion cards */}
            <div className="workspace-right" style={{ flex: 24, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '270px', height: '100%', overflow: 'hidden' }}>
              <div className="depth-layer-2" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', width: '100%' }}>
                <AudioMixer />
              </div>
              {/* 1. Transitions */}
              <div className="depth-layer-3" style={{ flex: '0 0 auto', display: 'flex', width: '100%' }}>
                <TransitionControlsExtended expanded={expandedUtility === 'transitions'} onToggle={() => setExpandedUtility(value => value === 'transitions' ? null : 'transitions')} />
              </div>
              {/* 2. System Overview */}
              <div className="depth-layer-3" style={{ flex: '0 0 auto', display: 'flex', width: '100%' }}>
                <SystemOverviewPanel expanded={expandedUtility === 'system'} onToggle={() => setExpandedUtility(value => value === 'system' ? null : 'system')} />
              </div>
              {/* 3. Broadcast Health */}
              <div className="depth-layer-3" style={{ flex: '0 0 auto', display: 'flex', width: '100%' }}>
                <BroadcastHealthPanel expanded={expandedUtility === 'health'} onToggle={() => setExpandedUtility(value => value === 'health' ? null : 'health')} />
              </div>
              {/* 4. Analytics */}
              <div className="depth-layer-3" style={{ flex: '0 0 auto', overflow: 'visible', display: 'flex', width: '100%' }}>
                <AnalyticsPanel expanded={expandedUtility === 'analytics'} onToggle={() => setExpandedUtility(value => value === 'analytics' ? null : 'analytics')} />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '12px', background: '#222', color: '#fff', height: '100vh', overflow: 'auto' }}>
          <h1 style={{ color: '#FF4D5A' }}>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '12px' }}>Reload application</button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { BroadcastProvider } from './context/NewBroadcastContext'
import { GraphicsCompositor } from './components/GraphicsCompositor'
import { ToastContainer } from './components/ToastContainer'

export default function App() {
  try {
    return (
      <ErrorBoundary>
        <BroadcastProvider>
          <ToastContainer />
          <GraphicsCompositor />
          <WorkspaceShell />
        </BroadcastProvider>
      </ErrorBoundary>
    )
  } catch (err) {
    return null;
  }
}
