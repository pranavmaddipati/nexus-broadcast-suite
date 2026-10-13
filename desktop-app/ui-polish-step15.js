const fs = require('fs');

// 1. Remove previous step 14 from App.css to avoid conflicts
let cssContent = fs.readFileSync('src/App.css', 'utf8');
const step14Index = cssContent.indexOf('/* ==========================================================================');
if (step14Index !== -1) {
  cssContent = cssContent.substring(0, step14Index);
}

// 2. Inject Step 15: Heavy Hardware Broadcast Blue-Black
const step15CSS = `
/* ==========================================================================
   STEP 15: HEAVY HARDWARE BROADCAST BLUE-BLACK (VMIX TARGET)
   ========================================================================== */

:root {
  /* Concept Palette: Dark Blue-Black Base */
  --bg-primary: #020617; /* Slate 950 - Deepest black-blue */
  --bg-panel: #0f172a; /* Dark slate blue (Slate 900) */
  --bg-header: #1e293b; /* Header (Slate 800) */
  --bg-hardware: #162137; /* Intermediate hardware panel color */
  
  --border-light: rgba(255, 255, 255, 0.1);
  --border-dark: rgba(0, 0, 0, 0.8);
  --border-highlight: rgba(255, 255, 255, 0.15);
  
  --brand-red: #ef4444;
  --brand-red-dark: #7f1d1d;
  --brand-green: #10b981;
  --brand-green-dark: #064e3b;
  --brand-blue: #3b82f6;
  --brand-blue-dark: #1e3a8a;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
}

/* Base Hardware Flattening */
html, body, #root, .app {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  font-family: 'Inter', -apple-system, sans-serif !important;
}

/* Workspace Grid: Extremely tight, almost flush */
#top-workspace, #bottom-workspace {
  background-color: var(--bg-primary) !important;
  gap: 4px !important;
  padding: 4px !important;
}

/* Base Panels */
#top-workspace > div, #bottom-workspace > div, .monitor-container, .panel-content-area, .dock-grid-cell {
  background: var(--bg-panel) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important; /* Hardware bevel effect */
  border-radius: var(--radius-sm) !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.6) !important;
  margin: 0 !important;
  overflow: hidden !important;
}

/* Heavy Headers */
.panel-header, .monitor-header {
  background: linear-gradient(180deg, #27374D 0%, var(--bg-header) 100%) !important;
  border-bottom: 1px solid var(--border-dark) !important;
  height: 24px !important;
  padding: 0 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.text-panel-title, .panel-header > span {
  font-size: 11px !important;
  font-weight: 800 !important;
  color: #fff !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  text-shadow: 0 1px 2px rgba(0,0,0,1) !important;
}

/* VMIX SCENE CARDS (HEAVY & COMPACT) */
.sequence-item {
  height: auto !important;
}
.concept-card {
  display: flex !important;
  flex-direction: column !important;
  background: var(--bg-hardware) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  border-radius: var(--radius-sm) !important;
  margin-bottom: 6px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}
.concept-card.concept-live { border: 1px solid var(--brand-red) !important; border-top: 1px solid #fca5a5 !important; }
.concept-card.concept-preview { border: 1px solid var(--brand-green) !important; border-top: 1px solid #6ee7b7 !important; }

/* Thumbnail Dominates */
.concept-card-thumbnail {
  position: relative !important;
  background: #000 !important;
  width: 100% !important;
  border-bottom: 1px solid var(--border-dark) !important;
}
.concept-badge {
  position: absolute !important;
  top: 4px !important;
  left: 4px !important;
  font-size: 9px !important;
  font-weight: 900 !important;
  color: #fff !important;
  padding: 2px 4px !important;
  border-radius: var(--radius-xs) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.3) !important;
}
.concept-badge-live { background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%) !important; }
.concept-badge-preview { background: linear-gradient(180deg, #10b981 0%, #047857 100%) !important; }

.concept-card-timer {
  position: absolute !important;
  bottom: 4px !important;
  right: 4px !important;
  background: rgba(0,0,0,0.8) !important;
  color: #fff !important;
  font-family: 'Consolas', monospace !important;
  font-size: 10px !important;
  padding: 1px 3px !important;
  border: 1px solid #000 !important;
  border-radius: var(--radius-xs) !important;
}

/* Card Controls - Ultra Dense Hardware Keys */
.concept-card-content {
  padding: 4px !important;
  display: flex !important;
  flex-direction: column !important;
}
.concept-card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 4px !important;
}
.concept-card-title {
  font-size: 11px !important;
  font-weight: 800 !important;
  color: var(--text-primary) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.concept-btn-icon {
  background: transparent !important;
  border: none !important;
  color: var(--text-tertiary) !important;
  padding: 0 !important;
  cursor: pointer !important;
}
.concept-btn-icon:hover { color: var(--text-primary) !important; }

.concept-card-controls {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}
.concept-footer-row {
  display: flex !important;
  gap: 2px !important;
}
.concept-action-btn, .concept-overlay-btn {
  flex: 1 !important;
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  color: var(--text-primary) !important;
  font-size: 9px !important;
  font-weight: 800 !important;
  padding: 3px 0 !important;
  border-radius: var(--radius-xs) !important;
  cursor: pointer !important;
  text-shadow: 0 1px 1px rgba(0,0,0,0.8) !important;
}
.concept-action-btn:active, .concept-overlay-btn:active {
  background: var(--bg-header) !important;
  border-top: 1px solid var(--border-dark) !important;
}
.concept-btn-active-blue { background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%) !important; border-top: 1px solid #bfdbfe !important; }
.concept-btn-active-red { background: linear-gradient(180deg, #f87171 0%, #dc2626 100%) !important; border-top: 1px solid #fecaca !important; }
.concept-btn-active-green { background: linear-gradient(180deg, #34d399 0%, #059669 100%) !important; border-top: 1px solid #a7f3d0 !important; }

/* HARDWARE SWITCHER BUTTONS (TRANSITION PANEL) */
.btn-broadcast-red, .btn-broadcast-blue, .btn-broadcast-dark, button, .premium-add-btn {
  border-radius: var(--radius-sm) !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
  padding: 8px 12px !important;
  cursor: pointer !important;
}

.btn-broadcast-red {
  background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%) !important;
  border: 1px solid var(--brand-red-dark) !important;
  border-top: 1px solid #fca5a5 !important;
  color: #fff !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
}
.btn-broadcast-red:active { 
  background: var(--brand-red-dark) !important; 
  border-top: 1px solid #450a0a !important; 
  transform: translateY(1px) !important;
  box-shadow: none !important;
}

.btn-broadcast-blue {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: 1px solid var(--brand-blue-dark) !important;
  border-top: 1px solid #93c5fd !important;
  color: #fff !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
}
.btn-broadcast-blue.active { 
  background: var(--brand-blue-dark) !important; 
  border-top: 1px solid #172554 !important; 
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.8) !important;
}

.btn-broadcast-dark, .premium-add-btn {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  color: var(--text-primary) !important;
}
.btn-broadcast-dark:hover, .premium-add-btn:hover { background: linear-gradient(180deg, #475569 0%, #334155 100%) !important; }

/* HARDWARE AUDIO MIXER */
.mixer-scene-item {
  background: var(--bg-hardware) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  border-radius: var(--radius-sm) !important;
  padding: 6px !important;
  margin-bottom: 2px !important;
}
.mixer-scene-item input[type="range"] {
  height: 4px !important;
  background: #000 !important;
  border: 1px solid var(--border-light) !important;
  border-radius: var(--radius-xs) !important;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.8) !important;
}
.mixer-scene-item input[type="range"]::-webkit-slider-thumb {
  width: 20px !important;
  height: 32px !important;
  background: linear-gradient(180deg, #cbd5e1 0%, #64748b 100%) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid #fff !important;
  border-radius: var(--radius-xs) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.8) !important;
}

/* MONITORS (EXPENSIVE BROADCAST FEEL) */
.monitor-screen {
  border-radius: var(--radius-sm) !important;
  border: 1px solid #000 !important;
  margin: 6px !important;
  width: calc(100% - 12px) !important;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5) !important;
}

/* BOTTOM PANELS, TABS & TOOLBAR */
.top-bar-container {
  height: 40px !important;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-bottom: 1px solid var(--border-dark) !important;
  padding: 0 12px !important;
}
.workspace-tabs {
  background: #0a0f1c !important; /* Extremely dark for tab track */
  border-bottom: 1px solid var(--border-dark) !important;
  padding: 4px 8px 0 8px !important;
}
.workspace-tab {
  background: var(--bg-hardware) !important;
  border: 1px solid var(--border-dark) !important;
  border-bottom: none !important;
  border-radius: 4px 4px 0 0 !important;
  padding: 6px 16px !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  color: var(--text-secondary) !important;
  margin-right: 2px !important;
  text-transform: uppercase !important;
}
.workspace-tab.active {
  background: var(--bg-panel) !important;
  color: #fff !important;
  border-top: 2px solid var(--brand-blue) !important;
  margin-bottom: -1px !important;
  padding-bottom: 7px !important;
}

/* MICRO DETAILS */
svg {
  stroke-width: 2px !important;
}
::-webkit-scrollbar {
  width: 12px !important;
  height: 12px !important;
}
::-webkit-scrollbar-track {
  background: #020617 !important;
  border-left: 1px solid var(--border-dark) !important;
}
::-webkit-scrollbar-thumb {
  background: #1e293b !important;
  border: 1px solid var(--border-light) !important;
  border-radius: 6px !important;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155 !important;
}
`;

fs.writeFileSync('src/App.css', cssContent + '\n' + step15CSS);
console.log('App.css appended with Step 15: Heavy Hardware Broadcast Blue-Black theme.');
