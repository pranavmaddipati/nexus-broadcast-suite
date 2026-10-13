const fs = require('fs')

// 1. TransitionControls
let trans = fs.readFileSync('src/components/TransitionControls.tsx', 'utf-8')
const lumaBtn = '<button className={`trans-btn trans-type-btn ${transitionType === \'luma\' ? \'active-trans-btn\' : \'\'}`} onClick={() => setTransitionType(\'luma\')}>LUMA</button>'
const presets = `
        {/* Quick Presets */}
        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '2px', marginTop: '6px' }}>
          {[1, 2, 3, 4].map(preset => (
            <button key={preset} className="trans-btn" style={{ flex: 1, padding: '4px 0', fontSize: '10px' }}>{preset}</button>
          ))}
        </div>
`
if (trans.includes(lumaBtn) && !trans.includes('Quick Presets')) {
  trans = trans.replace(lumaBtn, lumaBtn + presets)
  fs.writeFileSync('src/components/TransitionControls.tsx', trans)
  console.log('TransitionControls patched')
}

// 2. PreviewMonitor
let pv = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf-8')
const newPvHeader = `
      <div className="monitor-header">
        <span className="monitor-title-badge" style={{ background: '#00d084', color: '#fff' }}>PREVIEW</span>
        <span className="monitor-title-center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '12px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{sceneName}</span>
        <div className="monitor-controls" style={{ display: 'flex', gap: '4px' }}>
          <button className="monitor-control-btn" onClick={() => {}} title="Fullscreen"><Maximize size={12} /></button>
          <button className="monitor-control-btn" onClick={() => {}} title="Screenshot"><Camera size={12} /></button>
          <button className="monitor-control-btn" onClick={() => setShowSafeArea(!showSafeArea)} title="Safe Area"><Square size={12} /></button>
          <button className="monitor-control-btn" onClick={() => setShowGrid(!showGrid)} title="Grid"><Grid size={12} /></button>
          <button className="monitor-control-btn" onClick={() => {}} title="Multiview"><Layout size={12} /></button>
        </div>
      </div>
`
pv = pv.replace(/<div className="monitor-header">[\s\S]*?<\/div>/, newPvHeader.trim())

const pvFooter = `
        <div className="monitor-footer-actions">
          <button className="vmix-action-btn">AUD</button>
          <button className="vmix-action-btn active-preview">PVW</button>
          <button className="vmix-action-btn">PGM</button>
          <button className="vmix-action-btn settings-gear"><Settings size={10} /></button>
        </div>
      </div>
`
if (!pv.includes('monitor-footer-actions')) {
  pv = pv.replace(/<\/div>\s*\{contextMenuPos && \(/, pvFooter + '\n\n      {contextMenuPos && (')
  fs.writeFileSync('src/components/PreviewMonitor.tsx', pv)
  console.log('PreviewMonitor patched')
}

// 3. ProgramMonitor
let pm = fs.readFileSync('src/components/ProgramMonitor.tsx', 'utf-8')
const newPmHeader = `
      <div className="monitor-header">
        <span className="monitor-title-badge" style={{ background: '#ff1a1a', color: '#fff' }}>PROGRAM</span>
        <span className="monitor-title-center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '12px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{getLiveLabel()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="monitor-controls" style={{ display: 'flex', gap: '4px' }}>
            <button className="monitor-control-btn" onClick={() => {}} title="Fullscreen"><Maximize size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Screenshot"><Camera size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Safe Area"><Square size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Grid"><Grid size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Multiview"><Layout size={12} /></button>
          </div>
          <span className="monitor-title-badge" style={{ background: '#ff1a1a', color: '#fff', animation: 'pulse-light-badge 1.2s infinite', boxShadow: '0 0 10px rgba(255, 26, 26, 0.8)' }}>LIVE</span>
        </div>
      </div>
`
pm = pm.replace(/<div className="monitor-header">[\s\S]*?<\/div>/, newPmHeader.trim())

// Remove the old bottom-right live label since it's centered in header now
pm = pm.replace(/<div style=\{\{ position: 'absolute', bottom: '8px', right: '8px'[\s\S]*?<\/div>/, '')

const pmFooter = `
        <div className="monitor-footer-actions">
          <button className="vmix-action-btn">AUD</button>
          <button className="vmix-action-btn">PVW</button>
          <button className="vmix-action-btn active-live">PGM</button>
          <button className="vmix-action-btn settings-gear"><Settings size={10} /></button>
        </div>
      </div>
`
if (!pm.includes('monitor-footer-actions')) {
  // Replace the closing div of the monitor-screen container
  pm = pm.replace(/<\/div>\s*\{contextMenuPos && \(/, pmFooter + '\n\n      {contextMenuPos && (')
  // Add Settings to imports if not there
  if (!pm.includes('Settings } from')) {
    pm = pm.replace(/from 'lucide-react'/, ", Settings } from 'lucide-react'")
  }
  fs.writeFileSync('src/components/ProgramMonitor.tsx', pm)
  console.log('ProgramMonitor patched')
}

