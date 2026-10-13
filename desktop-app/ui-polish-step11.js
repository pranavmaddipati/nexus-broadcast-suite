const fs = require('fs');

function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

// 1. PINNED SCENES: Larger spacing between cards and Premium Add Button
replaceInFile('src/components/PinnedScenes.tsx',
  /gap: '12px'/g,
  "gap: '24px'");
  
replaceInFile('src/components/PinnedScenes.tsx',
  /style=\{\{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'transparent', border: '1px solid #1e293b', borderRadius: '4px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' \}\}/,
  "className=\"premium-add-btn\" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', cursor: 'pointer' }}");

// 2. PREVIEW & PROGRAM: Better toolbar (bottom floating)
replaceInFile('src/components/ProgramMonitor.tsx',
  /background: 'rgba\(2, 6, 23, 0\.7\)', padding: '2px 4px'/g,
  "background: 'var(--surface-raised)', padding: '6px 12px', boxShadow: 'var(--shadow-raised)', border: '1px solid var(--border-focus)'");
replaceInFile('src/components/ProgramMonitor.tsx',
  /padding: '1px 4px'/g,
  "padding: '4px 12px', fontSize: '10px'");
replaceInFile('src/components/ProgramMonitor.tsx',
  /padding: '1px 3px'/g,
  "padding: '4px 12px', fontSize: '10px'");
replaceInFile('src/components/ProgramMonitor.tsx',
  /bottom: '2px'/g,
  "bottom: '12px'");

// 3. TRANSITION PANEL: Class names for buttons
replaceInFile('src/components/TransitionControls.tsx',
  /style=\{\{ width: '100%', background: '#ef4444', [^}]+\}\}/,
  "className=\"btn-broadcast-red\" style={{ width: '100%' }}");
replaceInFile('src/components/TransitionControls.tsx',
  /style=\{\{ width: '100%', background: autoTake \? '#3b82f6' : '#1e293b', [^}]+\}\}/,
  "className={`btn-broadcast-blue ${autoTake ? 'active' : ''}`} style={{ width: '100%' }}");
replaceInFile('src/components/TransitionControls.tsx',
  /style=\{\{ width: '100%', background: '#1e293b', [^}]+\}\}/,
  "className=\"btn-broadcast-dark\" style={{ width: '100%' }}");

// 4. BOTTOM WORKSPACE: Add class names to tabs
replaceInFile('src/components/WorkspaceContainer.tsx',
  /padding: '8px 16px'/g,
  "padding: '12px 24px'");

const step11CSS = `

/* ==========================================================================
   STEP 11: ULTIMATE COMMERCIAL BROADCAST POLISH
   ========================================================================== */

/* 1. GLOBAL DESIGN SYSTEM & 8. SURFACE COLORS */
:root {
  --color-brand-red: #e11d48;
  --color-brand-red-hover: #be123c;
  --color-brand-green: #10b981;
  --color-brand-green-hover: #059669;
  --color-brand-blue: #2563eb;
  --color-brand-blue-hover: #1d4ed8;
  
  --surface-bg: #09090b; /* Deep charcoal */
  --surface-workspace: #111115; /* Dark slate */
  --surface-card: #18181c; /* Elevated slate */
  --surface-raised: #27272a; /* Raised controls */
  --surface-hover: #3f3f46;
  
  --border-dim: rgba(255, 255, 255, 0.05);
  --border-card: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(255, 255, 255, 0.15);
  --border-accent: rgba(255, 255, 255, 0.25);
  
  --shadow-drop: 0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.5);
  --shadow-raised: 0 10px 15px -3px rgba(0,0,0,0.7), 0 4px 6px -4px rgba(0,0,0,0.7);
  --shadow-glow-red: 0 0 12px rgba(225, 29, 72, 0.4);
  --shadow-glow-blue: 0 0 12px rgba(37, 99, 235, 0.4);
  --shadow-glow-green: 0 0 12px rgba(16, 185, 129, 0.4);
  
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  
  --text-xl: 16px;
  --text-lg: 14px;
  --text-md: 12px;
  --text-sm: 11px;
  --text-xs: 9px;
}

/* Base Overrides */
html, body, #root, .app {
  background-color: var(--surface-bg) !important;
  color: #e4e4e7 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  letter-spacing: 0.02em !important;
}

#top-workspace, #bottom-workspace {
  background-color: var(--surface-bg) !important;
  gap: var(--space-2) !important;
  padding: var(--space-2) !important;
}

/* 3. PREVIEW & PROGRAM MONITORS */
#panel-preview, #panel-program, #panel-transition, #panel-pinned-scenes, #panel-audio-mixer, .workspace-dock-container > div {
  background: var(--surface-workspace) !important;
  border: 1px solid var(--border-card) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-drop) !important;
  margin-right: var(--space-2) !important;
}

/* Remove right margin from last child */
#panel-audio-mixer { margin-right: 0 !important; }

/* Monitor specific */
.monitor-screen {
  border-radius: var(--radius-md) !important;
  border: 1px solid #000 !important;
  box-shadow: inset 0 0 50px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8) !important;
  margin: var(--space-2) !important;
  width: calc(100% - var(--space-4)) !important; /* Subtract margin */
}

/* 9. TYPOGRAPHY & PANEL HEADERS */
.panel-header, .monitor-header {
  background: transparent !important;
  border-bottom: 1px solid var(--border-dim) !important;
  height: 36px !important;
  padding: 0 var(--space-4) !important;
  display: flex !important;
  align-items: center !important;
}

.text-panel-title, .panel-header > span {
  font-size: var(--text-md) !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  color: #fafafa !important;
  text-transform: uppercase !important;
  text-shadow: none !important;
}

/* 8. BUTTONS - UNIFIED SYSTEM */
button {
  font-family: 'Inter', sans-serif !important;
  border-radius: var(--radius-sm) !important;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

.btn-broadcast-red {
  background: linear-gradient(180deg, var(--color-brand-red) 0%, #9f1239 100%) !important;
  color: #fff !important;
  border: 1px solid #881337 !important;
  box-shadow: var(--shadow-drop), inset 0 1px 0 rgba(255,255,255,0.2) !important;
  padding: var(--space-3) !important;
  font-size: var(--text-lg) !important;
}
.btn-broadcast-red:hover {
  background: linear-gradient(180deg, #f43f5e 0%, var(--color-brand-red-hover) 100%) !important;
  box-shadow: var(--shadow-glow-red) !important;
}
.btn-broadcast-red:active {
  background: #881337 !important;
  box-shadow: inset 0 4px 8px rgba(0,0,0,0.5) !important;
  transform: translateY(1px) !important;
}

.btn-broadcast-blue {
  background: linear-gradient(180deg, var(--color-brand-blue) 0%, #1e40af 100%) !important;
  color: #fff !important;
  border: 1px solid #1e3a8a !important;
  box-shadow: var(--shadow-drop), inset 0 1px 0 rgba(255,255,255,0.2) !important;
  padding: var(--space-2) !important;
  font-size: var(--text-md) !important;
}
.btn-broadcast-blue:hover, .btn-broadcast-blue.active {
  background: linear-gradient(180deg, #3b82f6 0%, var(--color-brand-blue-hover) 100%) !important;
  box-shadow: var(--shadow-glow-blue) !important;
}

.btn-broadcast-dark, .premium-add-btn {
  background: linear-gradient(180deg, var(--surface-raised) 0%, var(--surface-card) 100%) !important;
  color: #a1a1aa !important;
  border: 1px solid var(--border-card) !important;
  box-shadow: var(--shadow-drop) !important;
  padding: var(--space-2) !important;
  font-size: var(--text-md) !important;
}
.btn-broadcast-dark:hover, .premium-add-btn:hover {
  background: var(--surface-hover) !important;
  color: #f4f4f5 !important;
  border-color: var(--border-focus) !important;
}

/* 4. TRANSITION PANEL GRID FIX */
#panel-transition > div {
  background: transparent !important;
}
#panel-transition button {
  border-radius: var(--radius-sm) !important;
}

/* 5. AUDIO MIXER REDESIGN */
.mixer-scene-item {
  background: var(--surface-card) !important;
  border: 1px solid var(--border-card) !important;
  border-radius: var(--radius-md) !important;
  padding: var(--space-3) !important;
  box-shadow: var(--shadow-drop) !important;
}
.mixer-scene-item input[type="range"] {
  height: 6px !important;
  background: var(--surface-raised) !important;
  border-radius: 3px !important;
  border: 1px solid var(--border-dim) !important;
}
.mixer-scene-item input[type="range"]::-webkit-slider-thumb {
  width: 16px !important;
  height: 32px !important;
  background: linear-gradient(180deg, #d4d4d8 0%, #71717a 100%) !important;
  border: 1px solid #27272a !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.8) !important;
}

/* 6. TOOLBAR */
.top-bar-container {
  height: 56px !important;
  padding: 0 var(--space-5) !important;
  background: var(--surface-workspace) !important;
  border-bottom: 1px solid var(--border-card) !important;
  box-shadow: var(--shadow-drop) !important;
}

/* 7. BOTTOM WORKSPACE TABS */
.workspace-tabs {
  background: transparent !important;
  border-bottom: 2px solid var(--surface-raised) !important;
  padding: 0 var(--space-3) !important;
}
.workspace-tab {
  padding: var(--space-3) var(--space-4) !important;
  font-size: var(--text-md) !important;
  font-weight: 700 !important;
  color: #71717a !important;
  border-bottom: 2px solid transparent !important;
  margin-bottom: -2px !important;
}
.workspace-tab:hover {
  color: #e4e4e7 !important;
  background: transparent !important;
}
.workspace-tab.active {
  color: var(--color-brand-blue) !important;
  border-bottom: 2px solid var(--color-brand-blue) !important;
  background: transparent !important;
}

/* 10. ICONS SYSTEM */
svg {
  stroke-width: 2px !important;
  transition: all 0.15s ease-out !important;
}
button:hover svg {
  transform: scale(1.1) !important;
}

/* 2. PINNED SCENES MEDIA CARDS (Additional Overrides) */
.media-card {
  height: 240px !important;
  background: var(--surface-card) !important;
  border: 1px solid var(--border-card) !important;
  box-shadow: var(--shadow-drop) !important;
}
.media-card-thumbnail-container {
  height: 135px !important;
  border-bottom: none !important;
}
.media-card-content {
  background: linear-gradient(180deg, var(--surface-card) 0%, var(--surface-bg) 100%) !important;
}
`;

// Append CSS only if not already appended
let cssContent = fs.readFileSync('src/App.css', 'utf8');
if (!cssContent.includes('STEP 11: ULTIMATE COMMERCIAL BROADCAST POLISH')) {
  fs.appendFileSync('src/App.css', step11CSS);
  console.log('App.css appended with Step 11 styles.');
}
