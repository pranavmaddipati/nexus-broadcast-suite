const fs = require('fs');

// 1. Remove previous step 15 from App.css to avoid conflicts
let cssContent = fs.readFileSync('src/App.css', 'utf8');
const step15Index = cssContent.indexOf('/* ==========================================================================');
if (step15Index !== -1) {
  cssContent = cssContent.substring(0, step15Index);
}

// 2. Inject Step 16: Final Compact Micro-Polish (Blue-Black)
const step16CSS = `
/* ==========================================================================
   STEP 16: FINAL COMPACT MICRO-POLISH (BLUE-BLACK BROADCAST)
   ========================================================================== */

:root {
  --bg-primary: #020617; 
  --bg-panel: #0f172a; 
  --bg-header: #1e293b; 
  --bg-hardware: #162137; 
  
  --border-light: rgba(255, 255, 255, 0.1);
  --border-dark: rgba(0, 0, 0, 0.8);
  
  --brand-red: #ef4444;
  --brand-red-dark: #7f1d1d;
  --brand-green: #10b981;
  --brand-green-dark: #064e3b;
  --brand-blue: #3b82f6;
  --brand-blue-dark: #1e3a8a;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  
  --radius-xs: 2px;
  --radius-sm: 4px;
}

html, body, #root, .app {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  font-family: 'Inter', -apple-system, sans-serif !important;
}

/* Base Spacing */
#top-workspace, #bottom-workspace {
  background-color: var(--bg-primary) !important;
  gap: 4px !important;
  padding: 4px !important;
}
#top-workspace > div, #bottom-workspace > div, .monitor-container, .panel-content-area, .dock-grid-cell {
  background: var(--bg-panel) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  border-radius: var(--radius-sm) !important;
  margin: 0 !important;
  overflow: hidden !important;
}

/* Reduced Header Heights (approx 6-8px reduction) */
.panel-header, .monitor-header {
  background: linear-gradient(180deg, #27374D 0%, var(--bg-header) 100%) !important;
  border-bottom: 1px solid var(--border-dark) !important;
  height: 18px !important;
  padding: 0 6px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}
.text-panel-title, .panel-header > span {
  font-size: 10px !important;
  font-weight: 800 !important;
  color: #fff !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}

/* VMIX SCENE CARDS (ULTRA COMPACT) */
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
  margin-bottom: 4px !important;
}
.concept-card.concept-live { border: 1px solid var(--brand-red) !important; border-top: 1px solid #fca5a5 !important; }
.concept-card.concept-preview { border: 1px solid var(--brand-green) !important; border-top: 1px solid #6ee7b7 !important; }

/* Thumbnail DOMINATES */
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
  font-size: 8px !important;
  font-weight: 900 !important;
  color: #fff !important;
  padding: 1px 3px !important;
  border-radius: var(--radius-xs) !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.3) !important;
}
.concept-badge-live { background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%) !important; }
.concept-badge-preview { background: linear-gradient(180deg, #10b981 0%, #047857 100%) !important; }

.concept-card-timer {
  position: absolute !important;
  bottom: 2px !important;
  right: 2px !important;
  background: rgba(0,0,0,0.8) !important;
  color: #fff !important;
  font-family: 'Consolas', monospace !important;
  font-size: 8px !important;
  padding: 1px 2px !important;
  border: 1px solid #000 !important;
  border-radius: var(--radius-xs) !important;
}

/* Card Controls - Micro Keys */
.concept-card-content {
  padding: 2px 4px !important;
  display: flex !important;
  flex-direction: column !important;
}
.concept-card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 2px !important;
}
.concept-card-title {
  font-size: 10px !important;
  font-weight: 800 !important;
  color: var(--text-primary) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.concept-btn-icon {
  background: transparent !important;
  border: none !important;
  color: var(--text-secondary) !important;
  padding: 0 !important;
  cursor: pointer !important;
}
.concept-btn-icon svg { width: 10px !important; height: 10px !important; }
.concept-btn-icon:hover { color: var(--text-primary) !important; }

.concept-card-controls {
  display: flex !important;
  flex-direction: column !important;
  gap: 1px !important;
}
.concept-footer-row {
  display: flex !important;
  gap: 1px !important;
}
.concept-action-btn, .concept-overlay-btn {
  flex: 1 !important;
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  color: var(--text-primary) !important;
  font-size: 7.5px !important;
  font-weight: 800 !important;
  padding: 2px 0 !important;
  border-radius: var(--radius-xs) !important;
  cursor: pointer !important;
}
.concept-action-btn:active, .concept-overlay-btn:active {
  background: var(--bg-header) !important;
  border-top: 1px solid var(--border-dark) !important;
}
.concept-btn-active-blue { background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%) !important; border-top: 1px solid #bfdbfe !important; }
.concept-btn-active-red { background: linear-gradient(180deg, #f87171 0%, #dc2626 100%) !important; border-top: 1px solid #fecaca !important; }
.concept-btn-active-green { background: linear-gradient(180deg, #34d399 0%, #059669 100%) !important; border-top: 1px solid #a7f3d0 !important; }

/* HARDWARE SWITCHER BUTTONS (TRANSITION PANEL - STANDARDIZED) */
.btn-broadcast-red, .btn-broadcast-blue, .btn-broadcast-dark, button, .premium-add-btn {
  border-radius: var(--radius-xs) !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  padding: 4px 8px !important; /* Standardized small padding */
  font-size: 9px !important;
  cursor: pointer !important;
  height: 20px !important; /* Enforced consistent height */
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
}

.btn-broadcast-red {
  background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%) !important;
  border: 1px solid var(--brand-red-dark) !important;
  border-top: 1px solid #fca5a5 !important;
  color: #fff !important;
}
.btn-broadcast-red:active { 
  background: var(--brand-red-dark) !important; 
  border-top: 1px solid #450a0a !important; 
}

.btn-broadcast-blue {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: 1px solid var(--brand-blue-dark) !important;
  border-top: 1px solid #93c5fd !important;
  color: #fff !important;
}
.btn-broadcast-blue.active { 
  background: var(--brand-blue-dark) !important; 
  border-top: 1px solid #172554 !important; 
}

.btn-broadcast-dark, .premium-add-btn {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  color: var(--text-primary) !important;
}

/* HARDWARE AUDIO MIXER (NARROWER STRIPS) */
.mixer-scene-item {
  background: var(--bg-hardware) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid var(--border-light) !important;
  border-radius: var(--radius-xs) !important;
  padding: 4px !important;
  margin-bottom: 2px !important;
  font-size: 10px !important;
}
.mixer-scene-item input[type="range"] {
  height: 3px !important;
  background: #000 !important;
  border: 1px solid var(--border-light) !important;
  border-radius: var(--radius-xs) !important;
}
.mixer-scene-item input[type="range"]::-webkit-slider-thumb {
  width: 14px !important;
  height: 24px !important;
  background: linear-gradient(180deg, #cbd5e1 0%, #64748b 100%) !important;
  border: 1px solid var(--border-dark) !important;
  border-top: 1px solid #fff !important;
  border-radius: var(--radius-xs) !important;
}

/* MONITORS (COMPACT BORDERS) */
.monitor-screen {
  border-radius: 0 !important;
  border: 1px solid #000 !important;
  margin: 2px !important;
  width: calc(100% - 4px) !important;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8) !important;
}

/* TOOLBAR & BOTTOM TABS */
.top-bar-container {
  height: 32px !important;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-bottom: 1px solid var(--border-dark) !important;
  padding: 0 8px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.top-bar-container svg, .toolbar svg {
  width: 14px !important;
  height: 14px !important;
}
.workspace-tabs {
  background: #0a0f1c !important;
  border-bottom: 1px solid var(--border-dark) !important;
  padding: 4px 6px 0 6px !important;
  display: flex !important;
  gap: 2px !important;
}
.workspace-tab {
  background: var(--bg-hardware) !important;
  border: 1px solid var(--border-dark) !important;
  border-bottom: none !important;
  border-radius: 4px 4px 0 0 !important;
  padding: 4px 12px !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  color: var(--text-secondary) !important;
  text-transform: uppercase !important;
}
.workspace-tab.active {
  background: var(--bg-panel) !important;
  color: #fff !important;
  border-top: 2px solid var(--brand-blue) !important;
  margin-bottom: -1px !important;
  padding-bottom: 5px !important;
}

/* BOTTOM PANELS PADDING REDUCTION */
#bottom-workspace .panel-content-area, .dock-grid-cell {
  padding: 4px !important;
}

/* SCROLLBAR REFINEMENT */
::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}
::-webkit-scrollbar-track {
  background: #020617 !important;
  border-left: 1px solid var(--border-dark) !important;
}
::-webkit-scrollbar-thumb {
  background: #334155 !important;
  border: 1px solid #111 !important;
  border-radius: 4px !important;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569 !important;
}
`;

fs.writeFileSync('src/App.css', cssContent + '\n' + step16CSS);
console.log('App.css appended with Step 16: Final Compact Micro-Polish.');
