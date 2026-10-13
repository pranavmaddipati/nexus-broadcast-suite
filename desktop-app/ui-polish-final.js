const fs = require('fs');

function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

// 1. App.tsx layout
replaceInFile('src/App.tsx', 
  /gridTemplateColumns: '18fr [^']+'/, 
  "gridTemplateColumns: '18fr 30fr 9fr 30fr 13fr'");

// 2. Preview and Program monitors - force 16:9
replaceInFile('src/components/PreviewMonitor.tsx', 
  /className=\{`monitor-screen preview-tally[^\}]+`\}\s+style=\{\{[^\}]+\}\}/,
  `className={\`monitor-screen preview-tally \${zoomLevel === 'fit' ? 'fit-mode' : 'zoom-mode'}\`} \n        style={{ aspectRatio: '16/9', margin: 'auto', width: '100%', maxHeight: '100%', position: 'relative', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}`);

replaceInFile('src/components/ProgramMonitor.tsx', 
  /className="monitor-screen program-tally" style=\{\{[^\}]+\}\}/,
  `className="monitor-screen program-tally" style={{ aspectRatio: '16/9', margin: 'auto', width: '100%', maxHeight: '100%', position: 'relative', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}`);

// 3. Toolbar spacing and stats
replaceInFile('src/components/TopBar.tsx',
  /<div style=\{\{ display: 'flex', gap: '12px', alignItems: 'center' \}\}>[\s\S]*?<\/div>/,
  `<div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontWeight: 600, fontSize: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}><span style={{color: '#94a3b8', fontSize: '9px', fontWeight: 700}}>CPU</span><span style={{color: '#10b981'}}>{cpuUsage}%</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}><span style={{color: '#94a3b8', fontSize: '9px', fontWeight: 700}}>GPU</span><span style={{color: '#10b981'}}>{gpuUsage}%</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}><span style={{color: '#94a3b8', fontSize: '9px', fontWeight: 700}}>RAM</span><span style={{color: '#10b981'}}>18%</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}><span style={{color: '#94a3b8', fontSize: '9px', fontWeight: 700}}>FPS</span><span style={{color: '#10b981'}}>60</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}><span style={{color: '#94a3b8', fontSize: '9px', fontWeight: 700}}>DROP</span><span style={{color: droppedFrames > 0 ? '#ef4444' : '#10b981'}}>{droppedFrames}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}><span style={{color: '#94a3b8', fontSize: '9px', fontWeight: 700}}>RENDER</span><span style={{color: renderTime > 15 ? '#f59e0b' : '#10b981'}}>{renderTime.toFixed(1)}ms</span></div>
          </div>`);
          
// 4. Audio Mixer - fader height and meters
replaceInFile('src/components/AudioMixer.tsx',
  /height: '100px'/g,
  `height: '250px'`);
replaceInFile('src/components/AudioMixer.tsx',
  /gap: '4px'/g,
  `gap: '12px'`);

// 5. Global Spacing / CSS injects
const cssInject = `

/* ==========================================================================
   FINAL PRESENTATION LAYER REFINEMENT
   ========================================================================== */

/* Spacing System */
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  
  --font-xs: 10px;
  --font-sm: 12px;
  --font-md: 14px;
  
  --radius: 4px;
}

/* Ensure no clipping or horizontal scrolling on 150% scaling */
html, body, #root, .app {
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Remove unused spacing on top bar */
.top-bar-container {
  padding: var(--space-2) var(--space-4) !important;
  height: 48px !important;
}

/* Pinned scenes styling */
.sequence-item {
  height: 120px !important;
  padding: var(--space-3) !important;
  gap: var(--space-3) !important;
  margin-bottom: var(--space-2) !important;
  border-radius: var(--radius) !important;
}

.sequence-thumbnail {
  width: 144px !important;
  height: 81px !important; /* 16:9 thumbnail */
}

/* Bottom Workspace */
#bottom-workspace {
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

.workspace-dock-container {
  padding: var(--space-1) !important;
  gap: var(--space-1) !important;
}

/* Buttons */
.nexus-btn {
  border-radius: var(--radius) !important;
  padding: var(--space-2) var(--space-3) !important;
  font-size: var(--font-sm) !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.nexus-btn svg {
  width: 16px !important;
  height: 16px !important;
}

/* Panel Headers */
.panel-header {
  height: 32px !important;
  padding: 0 var(--space-2) !important;
  font-size: var(--font-xs) !important;
}

/* Transitions */
#panel-transition {
  padding: var(--space-2) !important;
}

.transition-controls-panel {
  gap: var(--space-2) !important;
}

.transition-btn {
  height: 40px !important;
  border-radius: var(--radius) !important;
  font-size: var(--font-sm) !important;
}

/* Audio Mixer Panel Typography & Meters */
.mixer-channel-label {
  font-size: var(--font-xs) !important;
}

.mixer-meter-bg {
  width: 12px !important;
  border-radius: 2px !important;
}
`;

// Append CSS only if not already appended
let cssContent = fs.readFileSync('src/App.css', 'utf8');
if (!cssContent.includes('FINAL PRESENTATION LAYER REFINEMENT')) {
  fs.appendFileSync('src/App.css', cssInject);
  console.log('App.css appended');
} else {
  console.log('App.css already has final styles');
}

