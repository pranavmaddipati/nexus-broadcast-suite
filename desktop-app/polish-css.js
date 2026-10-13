const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

const overrides = `
/* ==========================================================================
   PHASE 1: PRODUCTION UI POLISH OVERRIDES
   ========================================================================== */

:root {
  --bg-board: #080b10;
  --bg-panel: #11151f;
  --bg-panel-dark: #0c0f16;
  --border-console: rgba(255, 255, 255, 0.06);
  --border-console-focus: #38bdf8;
  --tally-pvw: #10b981;
  --tally-pgm: #ef4444;
  --text-active: #f8fafc;
  --text-gray: #94a3b8;
  --text-dark: #475569;
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Workspace layout refinements */
.nexus-workspace-grid-container {
  margin: 6px;
}

/* Panel Cells */
.dock-grid-cell {
  background: var(--bg-panel) !important;
  border: 1px solid var(--border-console) !important;
  border-radius: 6px !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.3) !important;
  overflow: hidden;
}

/* Headers */
.panel-header {
  background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%) !important;
  border-bottom: 1px solid var(--border-console) !important;
  padding: 6px 10px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center !important;
}

.panel-title {
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  color: #e2e8f0 !important;
  text-transform: uppercase !important;
}

/* Buttons */
.btn, button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover:not(:disabled) {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0px);
  filter: brightness(0.9);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: var(--text-active) !important;
  border-radius: 4px;
}

/* Switcher / Resize Handles */
.panel-resize-handle-h {
  width: 6px !important;
  background: transparent !important;
  transition: background 0.2s;
  cursor: col-resize !important;
}
.panel-resize-handle-h:hover, .panel-resize-handle-h:active {
  background: rgba(56, 189, 248, 0.2) !important;
}

.panel-resize-handle-v {
  height: 6px !important;
  background: transparent !important;
  transition: background 0.2s;
  cursor: row-resize !important;
}
.panel-resize-handle-v:hover, .panel-resize-handle-v:active {
  background: rgba(56, 189, 248, 0.2) !important;
}

/* Active & Disabled States */
button:disabled {
  opacity: 0.4;
  cursor: not-allowed !important;
}

/* Form Inputs */
input[type="range"] {
  accent-color: var(--color-blue);
}

select, input[type="text"], input[type="number"] {
  background: rgba(0,0,0,0.3) !important;
  border: 1px solid var(--border-console) !important;
  border-radius: 4px !important;
  color: var(--text-active) !important;
  padding: 4px 8px !important;
  font-size: 11px !important;
  transition: border-color 0.2s;
}

select:focus, input:focus {
  outline: none !important;
  border-color: var(--border-console-focus) !important;
}

/* Topbar */
.nexus-topbar {
  background: linear-gradient(180deg, #0f141e 0%, #080b10 100%) !important;
  border-bottom: 1px solid var(--border-console) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
}

.status-bar {
  background: #080b10 !important;
  border-top: 1px solid var(--border-console) !important;
}

/* Scene Matrix Specific Polish */
.scene-matrix-row {
  border-bottom: 1px solid var(--border-console) !important;
}
`;

if (!css.includes('PHASE 1: PRODUCTION UI POLISH OVERRIDES')) {
    fs.writeFileSync(cssPath, css + '\n' + overrides);
    console.log("CSS Overrides applied.");
} else {
    console.log("CSS Overrides already exist.");
}
