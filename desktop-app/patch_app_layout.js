const fs = require('fs')

let app = fs.readFileSync('src/App.tsx', 'utf-8')

// 1. Center column width: left is 14, right was 18, center was 67 (14+67+18=99).
// Make right 14, center 71. (14+71+14 = 99).
app = app.replace(
  /<Panel id="center-column" order=\{2\} defaultSize=\{67\} minSize=\{30\}>/,
  '<Panel id="center-column" order={2} defaultSize={71} minSize={30}>'
)
app = app.replace(
  /<Panel id="right-column" order=\{3\} defaultSize=\{18\} minSize=\{10\} maxSize=\{35\} collapsible=\{true\}>/,
  '<Panel id="right-column" order={3} defaultSize={14} minSize={10} maxSize={35} collapsible={true}>'
)

// 2. Monitors height: monitors was 52, bottom tools was 43.
// Change monitors to 65, bottom to 30.
app = app.replace(
  /<Panel id="panel-monitors" order=\{1\} defaultSize=\{52\} minSize=\{20\}>/,
  '<Panel id="panel-monitors" order={1} defaultSize={65} minSize={20}>'
)
app = app.replace(
  /<Panel id="panel-bottom-tools" order=\{3\} defaultSize=\{43\} minSize=\{15\}>/,
  '<Panel id="panel-bottom-tools" order={3} defaultSize={30} minSize={15}>'
)

// 3. Monitor padding and transition width
app = app.replace(
  /className="center-monitors-row" style={{ display: "flex", width: "100%", height: "100%", minWidth: 0, minHeight: 0, boxSizing: "border-box", gap: "10px", padding: "16px" }}/,
  'className="center-monitors-row" style={{ display: "flex", width: "100%", height: "100%", minWidth: 0, minHeight: 0, boxSizing: "border-box", gap: "8px", padding: "6px" }}'
)
app = app.replace(
  /<div style={{ width: "120px", flexShrink: 0, minHeight: 0, boxSizing: "border-box" }}><TransitionControls \/><\/div>/,
  '<div style={{ width: "80px", flexShrink: 0, minHeight: 0, boxSizing: "border-box" }}><TransitionControls /></div>'
)

fs.writeFileSync('src/App.tsx', app)

let css = fs.readFileSync('src/App.css', 'utf-8')

// Program monitor stronger emphasis (thicker border, brighter red)
css = css.replace(
  /\.monitor-screen\.program-tally \{[\s\S]*?\}/,
  '.monitor-screen.program-tally { border: 2px solid #ff1a1a !important; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 26, 26, 0.25) !important; }'
)
// Replace the inline style for Program LIVE badge in ProgramMonitor.tsx to be brighter

fs.writeFileSync('src/App.css', css)

console.log('App.tsx and App.css updated.')
