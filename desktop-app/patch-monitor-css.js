const fs = require('fs')
let content = fs.readFileSync('src/App.css', 'utf-8')

content = content.replace(
  /\.monitor-container \{\n\s*display: flex;\n\s*flex-direction: column;\n\s*background: linear-gradient\(135deg, var\(--bg-panel\) 0%, #0a0e1a 100%\);\n\s*border: 1px solid rgba\(56, 189, 248, 0\.15\);\n\s*border-radius: 6px;\n\s*padding: 8px;\n/,
  `.monitor-container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-panel) 0%, #0a0e1a 100%);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 6px;
  padding: 0px;
  position: relative;
`
)

content = content.replace(
  /\.monitor-header \{\n\s*display: flex;\n\s*justify-content: space-between;\n\s*align-items: center;\n\s*margin-bottom: 0px;\n\s*height: 18px;\n\s*flex-shrink: 0;\n\s*\}/,
  `.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 100;
  pointer-events: none;
}`
)

fs.writeFileSync('src/App.css', content)
console.log('Patched App.css')
