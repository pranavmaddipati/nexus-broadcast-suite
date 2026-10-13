const fs = require('fs');

let cssContent = fs.readFileSync('src/App.css', 'utf8');
const step17Index = cssContent.indexOf('/* ==========================================================================');
// If step 17 already exists (highly unlikely since we just made it up), clear it. 
// Wait, I'll just append it directly if it doesn't exist.

const step17CSS = `
/* ==========================================================================
   STEP 17: REALISTIC HARDWARE DETAIL UPGRADE (BROADCAST UI)
   ========================================================================== */

/* --- 1. MONITOR REFINEMENT --- */
.monitor-header {
  padding: 0 12px !important;
  height: 22px !important;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-bottom: 1px solid #000 !important;
  border-top: 1px solid rgba(255,255,255,0.1) !important;
}
.monitor-header > span {
  font-size: 11px !important;
  font-weight: 900 !important;
  color: #fff !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
  letter-spacing: 0.1em !important;
}
.monitor-toolbar {
  display: flex !important;
  gap: 12px !important; /* Increased icon spacing */
}
.monitor-toolbar svg {
  width: 14px !important;
  height: 14px !important;
  color: #cbd5e1 !important;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.8)) !important;
}
.monitor-screen {
  border: 1px solid #000 !important;
  border-top: 2px solid #000 !important;
  border-bottom: 2px solid #111 !important;
  border-left: 2px solid #0a0a0a !important;
  border-right: 2px solid #0a0a0a !important;
  margin: 4px !important;
  width: calc(100% - 8px) !important;
  box-shadow: inset 0 0 16px rgba(0,0,0,1) !important;
  background: #000 !important;
}
.monitor-control-bar {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-top: 1px solid rgba(255,255,255,0.05) !important;
  padding: 2px 8px !important;
}
.monitor-control-bar .nexus-btn {
  padding: 4px 10px !important;
  font-size: 9px !important;
  font-weight: 800 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}

/* --- 2. HARDWARE INPUTS (LIVE SETTINGS) --- */
.nexus-input, select.nexus-input {
  background: #020408 !important;
  border: 1px solid #000 !important;
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
  border-right: 1px solid rgba(255,255,255,0.05) !important;
  color: #60a5fa !important;
  font-family: 'Consolas', monospace !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  border-radius: 2px !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.8) !important;
  padding: 6px 8px !important;
}
.nexus-input:focus {
  outline: 1px solid #3b82f6 !important;
  outline-offset: -1px !important;
  background: #0a0e17 !important;
}

/* --- 3. AUDIO MIXER REFINEMENT --- */
.audio-channel-strip {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border: 1px solid #000 !important;
  border-top: 1px solid rgba(255,255,255,0.1) !important;
  border-left: 1px solid rgba(255,255,255,0.05) !important;
  box-shadow: 4px 0 8px rgba(0,0,0,0.5) !important;
}
.mixer-header {
  background: linear-gradient(180deg, #27374D 0%, #162137 100%) !important;
  border-bottom: 1px solid #000 !important;
}

/* --- 4. SCENE LIBRARY REFINEMENT --- */
.scene-library-card {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border: 1px solid #000 !important;
  border-top: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 0 4px 6px rgba(0,0,0,0.6) !important;
}
.scene-library-card .item-name-label {
  font-size: 11px !important;
  font-weight: 800 !important;
  color: #fff !important;
  text-transform: uppercase !important;
}
.scene-library-card img {
  border-radius: 2px !important;
}
`;

fs.writeFileSync('src/App.css', cssContent + '\n' + step17CSS);
console.log('App.css appended with Step 17: Realistic Hardware Detail Upgrade.');
