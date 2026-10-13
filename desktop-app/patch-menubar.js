const fs = require('fs')

let content = fs.readFileSync('src/components/MenuBar.tsx', 'utf-8')

// Add showMonitorStats and setShowMonitorStats to useBroadcast
content = content.replace(
  /const \{ activeScene, scenes = \[\], activeOverlays = \[\], toggleOverlay = \(\) => \{\}, addToast = \(\) => \{\}, setWorkspacePreset = \(\) => \{\}, /,
  "const { activeScene, scenes = [], activeOverlays = [], toggleOverlay = () => {}, addToast = () => {}, setWorkspacePreset = () => {}, showMonitorStats = false, setShowMonitorStats = () => {}, "
)

// Add toggle to the menu
const viewMenuTarget = "<div style={menuItemStyle} onClick={() => handleAction(() => addToast('info', 'Multiview opened.'))}>Multiview</div>"
const viewMenuReplacement = viewMenuTarget + "\n              <div style={menuItemStyle} onClick={() => handleAction(() => setShowMonitorStats(!showMonitorStats))}>{showMonitorStats ? '✓ ' : ''}Show Monitor Statistics</div>"
content = content.replace(viewMenuTarget, viewMenuReplacement)

fs.writeFileSync('src/components/MenuBar.tsx', content)
console.log('Patched MenuBar')
