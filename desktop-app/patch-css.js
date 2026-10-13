const fs = require('fs')

let content = fs.readFileSync('src/App.css', 'utf-8')

// 1. Status Bar height
content = content.replace(
  /\.status-bar \{[\s\S]*?\}/,
  `.status-bar {\n  background: #080b10 !important;\n  border-top: 1px solid var(--border-console) !important;\n  height: 32px !important;\n}`
)

// 2. Toolbar padding/sizes (if .icon-btn is here)
content = content.replace(
  /width: 26px;\n\s*height: 26px;/,
  `width: 24px;\n  height: 24px;`
)
content = content.replace(
  /width: 18px;\n\s*height: 18px;/,
  `width: 16px;\n  height: 16px;`
)

fs.writeFileSync('src/App.css', content)
console.log('Patched App.css')

let statusBar = fs.readFileSync('src/components/StatusBar.tsx', 'utf-8')
statusBar = statusBar.replace(/height: '40px'/g, "height: '32px'")
statusBar = statusBar.replace(/padding: '0 16px'/g, "padding: '0 8px'")
fs.writeFileSync('src/components/StatusBar.tsx', statusBar)

