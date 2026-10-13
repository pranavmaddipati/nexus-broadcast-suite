const fs = require('fs');

let cssContent = fs.readFileSync('src/App.css', 'utf8');

const step19CSS = `
/* ==========================================================================
   STEP 19: FULL CONCEPT PARITY (Final Polish)
   ========================================================================== */

/* --- 1. GLOBAL TYPOGRAPHY & COLORS --- */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  color: #cbd5e1 !important;
  background: #020617 !important; /* Pitch black space */
}

/* --- 2. MONITORS --- */
.monitor-header {
  height: 24px !important;
  padding: 0 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important; /* Force left alignment */
  gap: 8px !important;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-bottom: 1px solid #000 !important;
  border-top: 1px solid rgba(255,255,255,0.05) !important;
}
.monitor-title-badge {
  font-size: 9px !important;
  padding: 2px 6px !important;
  border-radius: 2px !important;
  order: -1 !important; /* Always far left */
  letter-spacing: 0.05em !important;
}
.monitor-title-center {
  flex: none !important; /* Do not stretch */
  text-align: left !important;
  font-size: 11px !important;
  color: #fff !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  margin-right: auto !important; /* Push everything else right */
}
.monitor-controls {
  margin-left: 0 !important;
  gap: 8px !important;
}
.monitor-controls button {
  padding: 0 !important;
}
.monitor-controls svg {
  width: 12px !important;
  height: 12px !important;
  opacity: 0.8 !important;
}
.monitor-controls svg:hover {
  opacity: 1 !important;
  color: #fff !important;
}
.monitor-screen {
  border: 1px solid #000 !important;
  border-radius: 4px !important;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 20px 50px rgba(0,0,0,0.5) !important;
}
/* Bottom monitor control bar */
.monitor-control-bar {
  padding: 4px 8px !important;
  gap: 4px !important;
}
.monitor-control-bar .nexus-btn {
  padding: 4px 12px !important;
  font-size: 9px !important;
  border-radius: 2px !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

/* --- 3. TRANSITION PANEL --- */
.transition-controls-panel .nexus-btn {
  padding: 8px 12px !important; /* Bigger, chunky buttons */
  font-size: 11px !important;
  font-weight: 900 !important;
  border-radius: 2px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

/* --- 4. SCENE LIBRARY CARDS --- */
.scene-library-card {
  padding: 4px !important;
  border-radius: 4px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  box-shadow: none !important;
}
.scene-library-card:hover {
  background: rgba(255,255,255,0.05) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}
.scene-library-card .item-name-label {
  font-size: 11px !important;
  color: #f8fafc !important;
  margin-top: 4px !important;
}
.scene-library-card img {
  border-radius: 2px !important;
}

/* --- 5. SOURCES PANEL --- */
.tree-row {
  height: 24px !important;
  font-size: 11px !important;
  color: #cbd5e1 !important;
  border-bottom: 1px solid #0f172a !important;
}
.tree-row:hover {
  background: rgba(56, 189, 248, 0.1) !important;
}
.tree-row svg {
  width: 12px !important;
  height: 12px !important;
  opacity: 0.7 !important;
}
.tree-row svg:hover {
  opacity: 1 !important;
  color: #38bdf8 !important;
}

/* --- 6. LIVE SETTINGS / INPUTS --- */
.live-settings-panel .nexus-input, 
.live-settings-panel select.nexus-input {
  background: #020408 !important;
  border: 1px solid #1e293b !important;
  border-top: 1px solid #000 !important;
  border-left: 1px solid #000 !important;
  border-radius: 2px !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.8) !important;
  padding: 6px 8px !important;
  font-size: 11px !important;
  font-family: 'Consolas', monospace !important;
  color: #60a5fa !important;
}

.nexus-btn-success {
  background: linear-gradient(180deg, #22c55e 0%, #166534 100%) !important;
  border: 1px solid #052e16 !important;
  border-top: 1px solid rgba(255,255,255,0.2) !important;
  color: #fff !important;
}
.nexus-btn-danger {
  background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%) !important;
  border: 1px solid #450a0a !important;
  border-top: 1px solid rgba(255,255,255,0.2) !important;
  color: #fff !important;
}
.nexus-btn-primary {
  background: linear-gradient(180deg, #3b82f6 0%, #1e3a8a 100%) !important;
  border: 1px solid #172554 !important;
  border-top: 1px solid rgba(255,255,255,0.2) !important;
  color: #fff !important;
}
`;

fs.writeFileSync('src/App.css', cssContent + '\n' + step19CSS);
console.log('App.css appended with Step 19: Full Concept Parity');
