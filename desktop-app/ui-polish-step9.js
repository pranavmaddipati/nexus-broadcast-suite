const fs = require('fs');

const cssInject = `

/* ==========================================================================
   FINAL PREMIUM BROADCAST POLISH (STEP 9)
   ========================================================================== */

/* 1. VISUAL HIERARCHY & DEPTH */
:root {
  --bg-board-deep: #05080f; /* Even darker base */
  --bg-panel-surface: #0a0e17; /* Base panels */
  --bg-panel-elevated: #111827; /* Elevated cards */
  
  --shadow-subtle: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 10px 15px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 15px rgba(56, 189, 248, 0.15);
  
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(255, 255, 255, 0.15);
  
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}

/* 7. COLORS - Unified Design System */
.app, .nexus-workspace-grid-container {
  background-color: var(--bg-board-deep) !important;
}

/* 3. PANEL DESIGN */
.monitor-container, .dock-grid-cell, .workspace-dock-container > div, .panel-content-area {
  background: var(--bg-panel-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-subtle) !important;
  overflow: hidden !important;
}

.monitor-screen {
  box-shadow: inset 0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5) !important;
  border: 1px solid #000 !important;
  border-radius: var(--radius-sm) !important;
}

/* Pinned scenes and Sources cards */
.sequence-item, .source-card, .mixer-scene-item {
  background: linear-gradient(180deg, var(--bg-panel-elevated) 0%, var(--bg-panel-surface) 100%) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-subtle) !important;
  transition: all 0.2s ease-out !important;
}

.sequence-item:hover, .source-card:hover, .mixer-scene-item:hover {
  border-color: var(--border-highlight) !important;
  transform: translateY(-1px) !important;
  box-shadow: var(--shadow-elevated) !important;
}

/* 4. TYPOGRAPHY */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
  -webkit-font-smoothing: antialiased !important;
}

.panel-header {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  font-weight: 800 !important;
  color: #e2e8f0 !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
}

.monitor-title-center {
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  color: #f8fafc !important;
  text-shadow: 0 1px 3px rgba(0,0,0,1) !important;
}

/* 6. BUTTONS */
button, .nexus-btn {
  font-family: 'Inter', sans-serif !important;
  border-radius: var(--radius-md) !important;
  transition: all 0.15s ease-out !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  font-weight: 700 !important;
}

.nexus-btn {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%) !important;
  border: 1px solid var(--border-subtle) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

.nexus-btn:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%) !important;
  border-color: var(--border-highlight) !important;
  box-shadow: 0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15) !important;
}

.nexus-btn:active {
  background: #0f172a !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
  transform: translateY(1px) !important;
}

/* Specific Broadcast Buttons */
button:contains('TAKE') {
  background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%) !important;
  border: 1px solid #7f1d1d !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.3) !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
}
button:contains('TAKE'):hover {
  background: linear-gradient(180deg, #f87171 0%, #dc2626 100%) !important;
}
button:contains('TAKE'):active {
  background: #991b1b !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
}

button:contains('AUTO-TAKE') {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: 1px solid #1e3a8a !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.2) !important;
}
button:contains('AUTO-TAKE'):hover {
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%) !important;
}

/* 5. ICONOGRAPHY */
.nexus-btn svg, .monitor-controls svg {
  stroke-width: 2.5px !important;
  opacity: 0.9 !important;
}
.monitor-controls button {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  opacity: 0.6;
}
.monitor-controls button:hover {
  background: rgba(255,255,255,0.1) !important;
  opacity: 1 !important;
}

/* 11. PROFESSIONAL DETAILS */
/* Tab Styling */
.workspace-tabs {
  background: #0f131f !important;
  border-bottom: 1px solid var(--border-subtle) !important;
}
.workspace-tab {
  color: #94a3b8 !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.2s !important;
}
.workspace-tab:hover {
  color: #f8fafc !important;
  background: rgba(255,255,255,0.02) !important;
}
.workspace-tab.active {
  color: #3b82f6 !important;
  border-bottom: 2px solid #3b82f6 !important;
  background: linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.1) 100%) !important;
}

/* Panel Separators / Borders */
#top-workspace > div {
  border-right: 1px solid var(--border-subtle) !important;
}
#top-workspace > div:last-child {
  border-right: none !important;
}
.nexus-workspace-grid-container > div[style*="height: 8px"] {
  background: var(--bg-board-deep) !important; /* Make the gap look like empty board space */
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 10px !important;
  height: 10px !important;
}
::-webkit-scrollbar-track {
  background: #0f131f !important;
  border-left: 1px solid var(--border-subtle) !important;
}
::-webkit-scrollbar-thumb {
  background: #334155 !important;
  border: 2px solid #0f131f !important;
  border-radius: 5px !important;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569 !important;
}

/* Badges */
.monitor-title-badge {
  text-shadow: 0 1px 1px rgba(0,0,0,0.5) !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
}

/* Faders and Audio */
input[type="range"] {
  height: 4px !important;
  background: #1e293b !important;
  border-radius: 2px !important;
  -webkit-appearance: none !important;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  width: 12px !important;
  height: 24px !important;
  background: linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%) !important;
  border: 1px solid #000 !important;
  border-radius: 2px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.5) !important;
  cursor: pointer !important;
}
input[type="range"]::-webkit-slider-thumb:hover {
  background: #ffffff !important;
  box-shadow: 0 2px 5px rgba(0,0,0,0.7) !important;
}
`;

// Append CSS only if not already appended
let cssContent = fs.readFileSync('src/App.css', 'utf8');
if (!cssContent.includes('FINAL PREMIUM BROADCAST POLISH (STEP 9)')) {
  fs.appendFileSync('src/App.css', cssInject);
  console.log('App.css appended with premium broadcast styles.');
} else {
  console.log('App.css already has premium styles');
}
