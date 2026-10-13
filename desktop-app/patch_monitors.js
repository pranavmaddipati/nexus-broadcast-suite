const fs = require('fs')

// 1. Update PreviewMonitor.tsx
let pm = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf-8')

// Add imports for icons
if (!pm.includes('Maximize')) {
  pm = pm.replace(
    "import { SceneRenderer } from './SceneRenderer'",
    "import { SceneRenderer } from './SceneRenderer'\nimport { Maximize, Camera, Square, Grid, Layout } from 'lucide-react'"
  )
}

// Remove monitor stats overlay
pm = pm.replace(/{showMonitorStats && \([\s\S]*?\)}/, '')

// Update Header to include buttons
const newHeader = `
      <div className="monitor-header">
        <span className="monitor-title-badge" style={{ background: '#00d084', color: '#fff' }}>PREVIEW</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="monitor-source-name-right" style={{ color: '#fff', fontSize: '11px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{sceneName}</span>
          <div className="monitor-controls">
            <button className="monitor-control-btn" onClick={() => {}} title="Fullscreen"><Maximize size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Screenshot"><Camera size={12} /></button>
            <button className="monitor-control-btn" onClick={() => setShowSafeArea(!showSafeArea)} title="Safe Area"><Square size={12} /></button>
            <button className="monitor-control-btn" onClick={() => setShowGrid(!showGrid)} title="Grid"><Grid size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Multiview"><Layout size={12} /></button>
          </div>
        </div>
      </div>
`
pm = pm.replace(/<div className="monitor-header">[\s\S]*?<\/div>/, newHeader.trim())

// Update center cross and grid logic
pm = pm.replace(/if \(showCenterCross\) {/g, 'if (showCenterCross && isDragging) {')
pm = pm.replace(/if \(showGrid\) {/g, 'if (showGrid && isDragging) {')

fs.writeFileSync('src/components/PreviewMonitor.tsx', pm)

// 2. Update ProgramMonitor.tsx
let pgm = fs.readFileSync('src/components/ProgramMonitor.tsx', 'utf-8')

if (!pgm.includes('Maximize')) {
  pgm = pgm.replace(
    "import { TransitionEngine } from './TransitionEngine'",
    "import { TransitionEngine } from './TransitionEngine'\nimport { Maximize, Camera, Square, Grid, Layout } from 'lucide-react'"
  )
}

// Remove monitor stats overlay
pgm = pgm.replace(/{showMonitorStats && \([\s\S]*?\)}/, '')
// Remove source name overlay from bottom right (moving it to header or creating a new structured overlay)
pgm = pgm.replace(/{\/\* Source name overlay bottom-right \*\/}\s*<div className="monitor-source-overlay"[\s\S]*?<\/div>/, '')

// Update Header to include badges and buttons, and scene name bottom-right inside the monitor screen
const newPgmHeader = `
      <div className="monitor-header">
        <span className="monitor-title-badge" style={{ background: '#ff4d4f', color: '#fff' }}>PROGRAM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="monitor-controls">
            <button className="monitor-control-btn" onClick={() => {}} title="Fullscreen"><Maximize size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Screenshot"><Camera size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Safe Area"><Square size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Grid"><Grid size={12} /></button>
            <button className="monitor-control-btn" onClick={() => {}} title="Multiview"><Layout size={12} /></button>
          </div>
          <span className="monitor-title-badge" style={{ background: '#ff4d4f', color: '#fff', animation: 'pulse-light-badge 1.2s infinite' }}>LIVE</span>
        </div>
      </div>
`
pgm = pgm.replace(/<div className="monitor-header">[\s\S]*?<\/div>/, newPgmHeader.trim())

// Add Scene Name at bottom-right inside the monitor screen
const bottomOverlay = `
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none', zIndex: 100 }}>
          {getLiveLabel()}
        </div>
`
// inject before the transition engine
pgm = pgm.replace(/{liveScene && typeof liveScene === 'string' && \(/, bottomOverlay + "\n          {liveScene && typeof liveScene === 'string' && (")

fs.writeFileSync('src/components/ProgramMonitor.tsx', pgm)

console.log('Update completed')
