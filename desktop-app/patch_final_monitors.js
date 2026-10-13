const fs = require('fs')

let pv = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf-8')
pv = pv.replace(/if \(showSafeArea\) \{/, 'if (showSafeArea && isDragging) {')
fs.writeFileSync('src/components/PreviewMonitor.tsx', pv)

let pm = fs.readFileSync('src/components/ProgramMonitor.tsx', 'utf-8')
pm = pm.replace(
  /<span className="monitor-title-badge" style={{ background: '#ff4d4f', color: '#fff', animation: 'pulse-light-badge 1.2s infinite' }}>LIVE<\/span>/,
  '<span className="monitor-title-badge" style={{ background: \'#ff1a1a\', color: \'#fff\', animation: \'pulse-light-badge 1.2s infinite\', boxShadow: \'0 0 10px rgba(255, 26, 26, 0.8)\' }}>LIVE</span>'
)
fs.writeFileSync('src/components/ProgramMonitor.tsx', pm)

console.log('Final polish applied.')
