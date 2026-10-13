const fs = require('fs')

function replaceInFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf-8')
  content = content.replace(regex, replacement)
  fs.writeFileSync(file, content)
}

// 1. Transition Controls
replaceInFile('src/components/TransitionControls.tsx', 
  /padding: '6px 0'/g, 
  "padding: '4px 0'"
)
replaceInFile('src/components/TransitionControls.tsx', 
  /<div className="tbar-ticks">[\s\S]*?<\/div>/,
  '<div className="tbar-ticks" style={{ fontSize: "8px" }}><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>'
)

// 2. Scene Library
// PRV and LIVE badges
replaceInFile('src/components/SceneLibrary.tsx',
  /background: '#10b981', color: '#fff', padding: '0 4px', borderRadius: '2px', fontSize: '9px', fontWeight: 800/g,
  "background: '#10b981', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontSize: '7px', fontWeight: 900"
)
replaceInFile('src/components/SceneLibrary.tsx',
  /background: '#ef4444', color: '#fff', padding: '0 4px', borderRadius: '2px', fontSize: '9px', fontWeight: 800/g,
  "background: '#ef4444', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontSize: '7px', fontWeight: 900"
)
// Thumbnail size
replaceInFile('src/components/SceneLibrary.tsx',
  /width: '48px', height: '27px'/g,
  "width: '56px', height: '31px'"
)
// Increase gap
replaceInFile('src/components/SceneLibrary.tsx',
  /<div style=\{\{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', minWidth: 0 \}\}>/,
  "<div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center', minWidth: 0 }}>"
)

// 3. Preview & Program headers
replaceInFile('src/components/PreviewMonitor.tsx',
  /\{sceneName\.toUpperCase\(\)\}/g,
  "{sceneName}"
)
replaceInFile('src/components/ProgramMonitor.tsx',
  /\{getLiveLabel\(\)\.toUpperCase\(\)\}/g,
  "{getLiveLabel()}"
)

// 4. Inspector Panel Placeholder
const oldPlaceholder = /<div style=\{\{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '13px', textAlign: 'center', gap: '8px', background: '#020408' \}\}>[\s\S]*?<\/div>/
const newPlaceholder = `<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '12px', textAlign: 'left', gap: '8px', background: '#020408' }}>
          <Sliders size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>No Selection</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', opacity: 0.6, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
            <li>• Transform</li>
            <li>• Crop</li>
            <li>• Filters</li>
            <li>• Audio</li>
            <li>• Properties</li>
          </ul>
        </div>`
replaceInFile('src/components/InspectorPanel.tsx', oldPlaceholder, newPlaceholder)

console.log('Patched phase 6 parts')
