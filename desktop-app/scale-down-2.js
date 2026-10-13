const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, 'src', 'App.css');
let cssContent = fs.readFileSync(cssFile, 'utf8');

const newCSS = `

/* ==========================================================================
   STEP 21: GLOBAL SCALE DOWN (TRUE BROADCAST PROPORTIONS)
   ========================================================================== */

/* Typography Overrides */
.top-bar-container, .top-bar-container * { font-size: 12px !important; }
.workspace-tabs .workspace-tab { font-size: 11px !important; padding: 4px 8px !important; }
.text-panel-title, .panel-header > span, .monitor-title-center { font-size: 13px !important; }
.tree-row, .nexus-input, select.nexus-input, .item-name-label { font-size: 12px !important; }
.asset-title, .asset-title-truncate { font-size: 13px !important; }
.status-bar, .status-bar * { font-size: 11px !important; }

/* Buttons & Inputs (Scale Down) */
button, .nexus-btn, .btn-broadcast-red, .btn-broadcast-blue, .btn-broadcast-dark, .premium-add-btn {
  font-size: 12px !important;
  padding: 4px 8px !important;
  border-radius: 2px !important;
  min-height: 20px !important;
  line-height: 1 !important;
}
input[type="text"], input[type="password"], input[type="number"], select {
  padding: 2px 6px !important;
  font-size: 12px !important;
  border-radius: 2px !important;
  min-height: 20px !important;
}

/* Icon Sizing */
svg {
  width: 14px !important;
  height: 14px !important;
}
.monitor-toolbar svg, .top-bar-container svg, .panel-header svg, .workspace-tab svg {
  width: 16px !important;
  height: 16px !important;
}

/* Header & Toolbar Proportions */
.top-bar-container { height: 28px !important; padding: 0 8px !important; }
.panel-header, .monitor-header { height: 22px !important; padding: 0 6px !important; }
.monitor-control-bar { padding: 4px 6px !important; gap: 4px !important; }
.monitor-control-bar button { padding: 4px 8px !important; font-size: 11px !important; }

/* Pinned Scenes (15% Smaller) */
.premium-asset-row { height: 56px !important; }
.asset-thumbnail-col { width: 80px !important; min-width: 80px !important; }
.asset-micro-chip, .asset-chip { padding: 2px 0 !important; font-size: 9px !important; }
.asset-timer { font-size: 9px !important; padding: 1px 2px !important; }
.asset-tiny-badge { font-size: 8px !important; padding: 1px 3px !important; }
.asset-number-badge { width: 14px !important; font-size: 9px !important; }
.asset-col-header { margin-bottom: 2px !important; }
.asset-controls-stack { gap: 1px !important; }

/* Transition Panel */
.transition-controls-panel { padding: 4px !important; gap: 4px !important; }
.transition-controls-panel button { padding: 4px 6px !important; font-size: 11px !important; margin: 1px !important; }
.transition-controls-panel .nexus-btn { padding: 4px !important; font-size: 11px !important; }

/* Audio Mixer (Tighter Channels) */
.audio-mixer-container { gap: 2px !important; }
.audio-channel-strip {
  flex: 1 !important;
  min-width: 50px !important;
  max-width: 70px !important;
  padding: 4px 2px !important;
}
.mixer-scene-item input[type="range"] { height: 3px !important; }
.mixer-scene-item input[type="range"]::-webkit-slider-thumb {
  width: 12px !important;
  height: 20px !important;
}
.vu-meter-container { width: 8px !important; } /* Make meters thinner */
.channel-label { font-size: 10px !important; }

/* Global Spacing Reductions */
.panel-content-area, .dock-grid-cell, .monitor-container { padding: 4px !important; border-radius: 2px !important; }
#top-workspace, #bottom-workspace { gap: 4px !important; padding: 4px !important; }

/* Bottom Workspace */
.scene-library-card { padding: 2px !important; }
.scene-library-card img { border-radius: 2px !important; }
.tree-row { height: 22px !important; }

/* Ensure borders are thin */
* { border-width: 1px !important; }
`;

fs.writeFileSync(cssFile, cssContent + newCSS);
console.log("App.css scale down applied successfully.");
