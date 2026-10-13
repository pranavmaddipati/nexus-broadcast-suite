const fs = require('fs')

function replaceInFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf-8')
  content = content.replace(regex, replacement)
  fs.writeFileSync(file, content)
}

// 1. Monitor Checkerboard Background
replaceInFile('src/App.css',
  /\.monitor-content \{\n\s*flex: 1;\n\s*position: relative;\n\s*display: flex;\n\s*align-items: center;\n\s*justify-content: center;\n\s*overflow: hidden;\n\s*background: #000;\n\s*\}/,
  `.monitor-content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  background-image: linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%), 
                    linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%), 
                    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}`
)

// 2. Inspector Placeholder Text
const oldInspectorStr = /<div style=\{\{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '12px', textAlign: 'left', gap: '8px', background: '#020408' \}\}>[\s\S]*?<\/div>/;

const newInspectorStr = `<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '12px', textAlign: 'center', gap: '8px', background: '#020408', padding: '16px' }}>
          <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>No source selected</div>
          <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px', lineHeight: '1.4' }}>Select a source from the Scene Tree<br/>or click an object inside the Preview monitor.</div>
          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Available editors:</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', opacity: 0.6, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <li>• Transform</li>
            <li>• Crop</li>
            <li>• Appearance</li>
            <li>• Audio</li>
            <li>• Filters</li>
            <li>• Properties</li>
          </ul>
        </div>`;
replaceInFile('src/components/InspectorPanel.tsx', oldInspectorStr, newInspectorStr)

// 3. Transition Panel grid & height reduction
replaceInFile('src/components/TransitionControls.tsx',
  /\{ \['cut', 'fade', 'merge', 'slide', 'push', 'zoom', 'wipe', 'cube', 'stinger', 'luma'\]\.map\(type => \(/,
  "{ ['cut', 'fade', 'merge', 'slide', 'push', 'zoom', 'wipe', 'cube', 'stinger'].map(type => ("
)

// 4. SceneLibrary Scene Card hierarchy
// Reduce padding and increase thumbnail
replaceInFile('src/components/SceneLibrary.tsx',
  /padding: '0 8px'/g,
  "padding: '0 4px'"
)
replaceInFile('src/components/SceneLibrary.tsx',
  /height: '28px'/g,
  "height: '24px'"
) // Makes list items more compact
replaceInFile('src/components/SceneLibrary.tsx',
  /width: '56px', height: '31px'/g,
  "width: '64px', height: '36px'"
) // Slightly larger thumbnails again for the grid

// 5. App.tsx (Production Sequences) - Default height down by 15%
replaceInFile('src/App.tsx',
  /<Panel id="panel-workspace" order=\{2\} defaultSize=\{10\} minSize=\{5\}>/,
  '<Panel id="panel-workspace" order={2} defaultSize={8.5} minSize={5}>'
)

console.log("Patched absolute final UI");
