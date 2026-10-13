const fs = require('fs')

let content = fs.readFileSync('src/components/SourcesPanel.tsx', 'utf-8')

// Reduce top toolbar padding
content = content.replace(/padding: '12px'/g, "padding: '6px 8px'")

// Reduce bottom toolbar padding
content = content.replace(/padding: '8px', \nborderTop: '1px solid #1e293b'/g, "padding: '4px 8px', borderTop: '1px solid #1e293b'")

// Reduce search bar height
content = content.replace(/padding: '6px 8px 6px 28px'/g, "padding: '4px 8px 4px 28px'")

// Reduce Add button padding
content = content.replace(/padding: '6px 12px'/g, "padding: '4px 8px'")

// Bottom buttons padding
content = content.replace(/padding: '6px', background: 'transparent'/g, "padding: '4px', background: 'transparent'")
content = content.replace(/padding: '6px 12px', background: 'transparent'/g, "padding: '4px 8px', background: 'transparent'") // Delete button

fs.writeFileSync('src/components/SourcesPanel.tsx', content)
console.log('Patched SourcesPanel')
