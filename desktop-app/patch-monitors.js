const fs = require('fs')

function patchMonitor(file) {
  let content = fs.readFileSync(file, 'utf-8')

  // Add showMonitorStats to useBroadcast
  content = content.replace(
    /renderTime = 0,/,
    'renderTime = 0,\n    showMonitorStats = false,'
  )

  // Replace stats overlay
  const oldStats = /<div className="monitor-stats-overlay"[\s\S]*?<\/div>/
  const newStats = `{showMonitorStats && (
          <div className="monitor-stats-overlay" style={{ 
            position: 'absolute', top: '10px', right: '10px', 
            background: 'rgba(0,0,0,0.6)', padding: '4px 8px', 
            borderRadius: '4px', fontSize: '10px', color: '#fff',
            display: 'flex', gap: '10px', pointerEvents: 'none',
            zIndex: 100
          }}>
            <span>1920x1080 60p</span>
            <span>Render: {renderTime.toFixed(1)}ms</span>
          </div>
        )}`
  
  content = content.replace(oldStats, newStats)

  fs.writeFileSync(file, content)
  console.log('Patched ' + file)
}

patchMonitor('src/components/PreviewMonitor.tsx')
patchMonitor('src/components/ProgramMonitor.tsx')
