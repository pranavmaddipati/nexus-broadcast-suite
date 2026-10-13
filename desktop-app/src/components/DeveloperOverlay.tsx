import React, { useState, useEffect } from 'react'

export const DeveloperOverlay: React.FC = () => {
  const [metrics, setMetrics] = useState({
    monitorWidth: window.screen.width,
    monitorHeight: window.screen.height,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    dpr: window.devicePixelRatio,
    rootHeight: 0,
    workspaceHeight: 0
  })

  useEffect(() => {
    const updateMetrics = () => {
      const rootEl = document.getElementById('root')
      const workspaceEl = document.querySelector('.nexus-workspace-grid-container')
      
      setMetrics({
        monitorWidth: window.screen.width,
        monitorHeight: window.screen.height,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        dpr: window.devicePixelRatio,
        rootHeight: rootEl ? rootEl.clientHeight : 0,
        workspaceHeight: workspaceEl ? workspaceEl.clientHeight : 0
      })
    }

    updateMetrics()
    window.addEventListener('resize', updateMetrics)
    
    // Poll a few times after mount as elements render
    const interval = setInterval(updateMetrics, 500)
    
    return () => {
      window.removeEventListener('resize', updateMetrics)
      clearInterval(interval)
    }
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: 40,
      right: 10,
      background: 'rgba(0, 0, 0, 0.85)',
      color: '#00ff00',
      padding: '6px',
      border: '1px solid #00ff00',
      borderRadius: '2px',
      fontFamily: 'monospace',
      fontSize: '11px',
      zIndex: 9999,
      pointerEvents: 'none',
      whiteSpace: 'pre'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#fff' }}>LAYOUT DEV OVERLAY</div>
      <div>Monitor Res:   {metrics.monitorWidth}x{metrics.monitorHeight}</div>
      <div>BrowserWindow: {metrics.outerWidth}x{metrics.outerHeight}</div>
      <div>Client Area:   {metrics.innerWidth}x{metrics.innerHeight}</div>
      <div>Device Pixel:  {metrics.dpr}</div>
      <div>Computed Root: {metrics.rootHeight}px</div>
      <div>Main Space:    {metrics.workspaceHeight}px</div>
      {metrics.rootHeight > metrics.innerHeight && (
        <div style={{ color: '#ff0000', fontWeight: 'bold', marginTop: '4px' }}>
          ERROR: Root exceeds client height!
        </div>
      )}
    </div>
  )
}
