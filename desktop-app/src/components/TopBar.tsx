import React, { useEffect, useState } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { ChevronDown, Bell, Settings, User, Video, Radio, Activity, MonitorUp, Cloud, Minus, Square, Copy, X } from 'lucide-react'

export const TopBar: React.FC = () => {
  const { workspacePreset, setWorkspacePreset } = useBroadcast()
  const { isStreaming, streamingDuration, scenes, liveScene } = useBroadcast()
  const [now, setNow] = useState(() => new Date())
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.nexusAPI?.isWindowMaximized) {
      window.nexusAPI.isWindowMaximized().then(setIsMaximized).catch(() => {})
      const unsub = window.nexusAPI.onWindowMaximizedChange?.(setIsMaximized)
      return () => { unsub?.() }
    }
  }, [])

  const handleMinimize = () => {
    window.nexusAPI?.minimizeWindow()
  }

  const handleMaximize = () => {
    window.nexusAPI?.maximizeWindow()
  }

  const handleClose = () => {
    window.nexusAPI?.closeWindow()
  }

  const elapsed = new Date(streamingDuration * 1000).toISOString().slice(11, 19)
  const programName = scenes.find(scene => scene.id === liveScene)?.name || 'No program scene'

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(9, 23, 43, 0.6)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '14px',
    padding: '4px 12px',
    height: '26px',
    gap: '6px'
  }

  const metricCardStyle = {
    ...cardStyle,
    padding: '2px 8px',
    justifyContent: 'space-between'
  }

  const dividerStyle = {
    width: '1px',
    height: '16px',
    background: 'var(--border-color)',
    margin: '0 2px'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between', height: '100%', gap: '12px', paddingLeft: '16px' }}>
      
      {/* LEFT CLUSTER: Event Name & Timers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Live Event */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', background: 'var(--accent-red)' }} />
            <span style={{ fontSize: '8px', color: '#fff', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE EVENT</span>
          </div>
          <span style={{ fontSize: '7px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{programName}</span>
        </div>

        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }} />

        {/* Date & Time */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '9px', color: '#fff', fontWeight: 600, fontFamily: 'var(--mono)', lineHeight: 1, marginBottom: '2px', whiteSpace: 'nowrap' }}>{now.toLocaleTimeString()}</span>
          <span style={{ fontSize: '6px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{now.toLocaleDateString()}</span>
        </div>

        {/* ON AIR Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--accent-red)', borderRadius: '2px', padding: '2px 8px', background: 'var(--accent-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '8px', color: '#fff', fontWeight: 900, lineHeight: 1 }}>{isStreaming ? 'ON AIR' : 'OFF AIR'}</span>
          </div>
          <div style={{ width: '1px', height: '10px', background: 'rgba(255, 255, 255, 0.5)' }} />
          <span style={{ fontSize: '9px', color: '#fff', fontWeight: 700, fontFamily: 'var(--mono)', lineHeight: 1 }}>{elapsed}</span>
        </div>

      </div>

      {/* CENTER CLUSTER: Hardware Metrics */}
      <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'transparent', height: '100%', boxSizing: 'border-box' }}>
        
        {/* CPU */}
        <div style={{ ...metricCardStyle }}>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 700 }}>CPU</span>
          <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800, fontFamily: 'var(--mono)' }}>48%</span>
          <div style={{ width: '24px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '1px' }}><div style={{ width: '48%', height: '100%', background: 'var(--accent-blue)', borderRadius: '1px' }} /></div>
        </div>

        {/* GPU */}
        <div style={{ ...metricCardStyle }}>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 700 }}>GPU</span>
          <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800, fontFamily: 'var(--mono)' }}>62%</span>
          <div style={{ width: '24px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '1px' }}><div style={{ width: '62%', height: '100%', background: 'var(--accent-cyan)', borderRadius: '1px' }} /></div>
        </div>

        {/* RAM */}
        <div style={{ ...metricCardStyle }}>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 700 }}>MEM</span>
          <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800, fontFamily: 'var(--mono)' }}>37%</span>
          <div style={{ width: '24px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '1px' }}><div style={{ width: '37%', height: '100%', background: 'var(--accent-green)', borderRadius: '1px' }} /></div>
        </div>

        {/* NET */}
        <div style={{ ...metricCardStyle }}>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 700 }}>NET</span>
          <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800, fontFamily: 'var(--mono)' }}>1.2G</span>
          <div style={{ width: '24px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '1px' }}><div style={{ width: '80%', height: '100%', background: 'var(--accent-orange)', borderRadius: '1px' }} /></div>
        </div>

      </div>

      {/* RIGHT CLUSTER: Weather, Notifications & Profile & Window Controls */}
      <div className="app-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* Weather Card */}
        <div style={{ ...cardStyle, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <Cloud size={12} color="#94a3b8" />
          <span style={{ fontSize: '8px', color: '#fff', fontWeight: 700, lineHeight: 1 }}>28 C</span>
          <span style={{ fontSize: '7px', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1 }}>Haze, New Delhi</span>
          <ChevronDown size={8} color="var(--text-secondary)" />
        </div>
        
        {/* Profile/Actions Card */}
        <div style={{ ...cardStyle }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={12} color="var(--text-secondary)" className="hover-brighten" />
            <div style={{ position: 'absolute', top: -3, right: -3, width: '10px', height: '10px', background: 'var(--accent-red)', borderRadius: '5px', fontSize: '6px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
          </div>
          
          <div style={dividerStyle} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid var(--accent-blue)' }} />
            <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Director</span>
            <ChevronDown size={10} color="var(--text-secondary)" />
          </div>
        </div>

        {/* Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px', gap: '2px' }}>
          <button
            type="button"
            title="Minimize"
            aria-label="Minimize window"
            onClick={handleMinimize}
            className="window-control-btn"
            style={{
              width: '26px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <Minus size={12} />
          </button>
          <button
            type="button"
            title={isMaximized ? "Restore" : "Maximize"}
            aria-label={isMaximized ? "Restore window" : "Maximize window"}
            onClick={handleMaximize}
            className="window-control-btn"
            style={{
              width: '26px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            {isMaximized ? <Copy size={11} /> : <Square size={11} />}
          </button>
          <button
            type="button"
            title="Close"
            aria-label="Close window"
            onClick={handleClose}
            className="window-control-btn close-btn"
            style={{
              width: '26px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <X size={13} />
          </button>
        </div>

      </div>

    </div>
  )
}
