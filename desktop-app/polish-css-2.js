const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'App.css');
let css = fs.readFileSync(cssPath, 'utf8');

const overrides2 = `
/* ==========================================================================
   PHASE 1: ADDITIONAL POLISH (Form Controls, Active States)
   ========================================================================== */

/* Form controls unified height and typography */
input[type="text"], input[type="number"], input[type="password"], select {
  height: 24px !important;
  box-sizing: border-box !important;
  font-family: var(--font-console) !important;
  font-size: 11px !important;
  border-radius: 4px !important;
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid var(--border-console) !important;
  color: var(--text-active) !important;
  padding: 0 8px !important;
  transition: all 0.2s ease !important;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.5) !important;
}

input:focus, select:focus {
  border-color: var(--border-console-focus) !important;
  background: rgba(0, 0, 0, 0.6) !important;
  outline: none !important;
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.5), inset 0 1px 2px rgba(0,0,0,0.5) !important;
}

/* Checkboxes and Radios */
input[type="checkbox"], input[type="radio"] {
  accent-color: var(--color-blue) !important;
  width: 14px !important;
  height: 14px !important;
  cursor: pointer;
}

/* Button Active States */
.btn-primary {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%) !important;
  border: 1px solid #1d4ed8 !important;
  color: white !important;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5) !important;
  border-radius: 4px !important;
}

.btn-primary:hover {
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%) !important;
  border-color: #2563eb !important;
}

.btn-primary:active {
  background: #1d4ed8 !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3) !important;
}

.btn-danger {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%) !important;
  border: 1px solid #b91c1c !important;
  color: white !important;
}

.btn-danger:hover {
  background: linear-gradient(180deg, #f87171 0%, #ef4444 100%) !important;
}

.btn-danger:active {
  background: #b91c1c !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3) !important;
}

/* Transition Control Buttons Override */
.trans-btn {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border: 1px solid var(--border-console) !important;
  border-radius: 4px !important;
  color: var(--text-active) !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
}

.trans-btn:hover {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%) !important;
  border-color: #475569 !important;
}

.trans-btn:active {
  background: #0f172a !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.6) !important;
  transform: translateY(1px) !important;
}

/* Range sliders (Sliders) */
input[type="range"] {
  -webkit-appearance: none;
  background: transparent;
  height: 20px;
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #1e293b;
  border-radius: 2px;
  border: 1px solid #0f172a;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
}

input[type="range"]::-webkit-slider-thumb {
  border: 1px solid #475569;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

input[type="range"]:focus::-webkit-slider-thumb {
  border-color: var(--color-blue);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4);
}
`;

if (!css.includes('PHASE 1: ADDITIONAL POLISH')) {
    fs.writeFileSync(cssPath, css + '\n' + overrides2);
    console.log("CSS Overrides 2 applied.");
} else {
    console.log("CSS Overrides 2 already exist.");
}
