const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// The layout right now is:
// <div id="workspace-container" style={{ display: 'flex', flexDirection: 'column'...
//   <div style={{ flex: '8.4 1 0', display: 'flex', flexDirection: 'column'...
//     <div style={{ flex: '1.4 1 0', display: 'flex', flexDirection: 'row'...
//       PinnedScenes ...
//       PreviewMonitor ...

const newLayout = `
      {/* WORKSPACE CONTAINER */}
      <div id="workspace-container" style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', overflow: 'hidden', padding: '4px', boxSizing: 'border-box', gap: '4px', background: 'var(--bg-main)' }}>
        
        {/* LEFT SIDEBAR: Pinned Scenes (Full Height) */}
        <div className="premium-panel" style={{ flex: '1.6 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>
          <PinnedScenes />
        </div>

        {/* MAIN CONTENT (Column) */}
        <div style={{ flex: '8.4 1 0', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, height: '100%' }}>
          
          {/* TOP ROW: Monitors + Audio Mixer */}
          <div style={{ flex: '1.2 1 0', display: 'flex', flexDirection: 'row', gap: '4px', minHeight: 0, width: '100%' }}>
            
            <div className="premium-panel" style={{ flex: '2.4 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>
              <PreviewMonitor />
            </div>
            
            <div className="premium-panel" style={{ flex: '1.0 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>
              <TransitionControls />
            </div>
            
            <div className="premium-panel" style={{ flex: '2.4 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>
              <ProgramMonitor />
            </div>

            <div className="premium-panel" style={{ flex: '2.6 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>
              <AudioMixer />
            </div>

          </div>
`;

content = content.replace(/\{\/\* WORKSPACE CONTAINER \*\/\}[\s\S]*?\{\/\* MIDDLE TOOLBAR \(Bottom Navigation\) \*\/\}/, newLayout + '\n          {/* MIDDLE TOOLBAR (Bottom Navigation) */}');

// Make sure to remove any extra closing div from the end of the workspace container.
// Wait, we need to balance the divs. 
// Previously, I replaced:
//     </div>
//   </div>
// </div>
// {/* FOOTER STATUS BAR (28px) */}
// with:
//     </div>
//   </div>
// </div>
// </div>
// {/* FOOTER STATUS BAR (28px) */}

// Let's just manually fix the closing divs.
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* FOOTER STATUS BAR \(28px\) \*\/\}/, `        </div>
      </div>
      {/* FOOTER STATUS BAR (28px) */}`);

fs.writeFileSync(appTsxPath, content);
console.log('Restored full height sidebar');
