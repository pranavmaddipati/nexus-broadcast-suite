const fs = require('fs')

function replaceInFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf-8')
  content = content.replace(regex, replacement)
  fs.writeFileSync(file, content)
}

// 5. Audio Mixer padding
replaceInFile('src/components/AudioMixer.tsx',
  /<div className="panel-header" style=\{\{ paddingBottom: "2px" \}\}>/,
  '<div className="panel-header" style={{ paddingBottom: "0px", paddingTop: "4px" }}>'
)
replaceInFile('src/components/AudioMixer.tsx',
  /<div style=\{\{ display: 'flex', justifyContent: 'space-evenly', padding: '4px 0', borderBottom: '1px solid #1e293b' \}\}>/g,
  '<div style={{ display: "flex", justifyContent: "space-evenly", padding: "2px 0", borderBottom: "1px solid #1e293b" }}>'
)

// 6. Top Status Bar styling in App.css
replaceInFile('src/App.css',
  /padding: 1px 6px;\n\s*display: flex;\n\s*align-items: center;\n\s*gap: 6px;/g,
  "padding: 0 8px;\n    display: flex;\n    align-items: center;\n    gap: 8px;"
)
replaceInFile('src/App.css',
  /\.status-gauges \{\n\s*display: flex;\n\s*gap: 8px;\n\s*\}/,
  ".status-gauges {\n  display: flex;\n  gap: 12px;\n}"
)
replaceInFile('src/components/TopBar.tsx',
  /<div style=\{\{ display: 'flex', alignItems: 'center', gap: '8px' \}\}>/,
  "<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>"
)

console.log('Patched audio mixer and top bar')
