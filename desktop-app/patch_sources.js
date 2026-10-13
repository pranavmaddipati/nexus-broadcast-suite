const fs = require('fs');
const path = 'c:\\broadcast-suite3\\desktop-app\\src\\components\\SourcesPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add context functions to destructuring
if (!content.includes('bringForward, bringToFront,')) {
  content = content.replace(
    /const \{ scenes = \[\], setScenes = \(\) => \{\}, activeScene, liveScene, saveStateForUndo = \(\) => \{\}, selectedSourceIds = \[\], setSelectedSourceIds = \(\) => \{\}, clipboardSource, setClipboardSource, videoElements = \[\] \} = useBroadcast\(\)/,
    `const { scenes = [], setScenes = () => {}, activeScene, liveScene, saveStateForUndo = () => {}, selectedSourceIds = [], setSelectedSourceIds = () => {}, clipboardSource, setClipboardSource, videoElements = [], bringForward = () => {}, sendBackward = () => {}, bringToFront = () => {}, sendToBack = () => {} } = useBroadcast()`
  );
}

// 2. Sort visible sources descending by zIndex
if (!content.includes('.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))')) {
  content = content.replace(
    /return true;\n  \}\)/,
    `return true;\n  }).sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))`
  );
}

// 3. Update handleDrop for layering drag and drop
if (!content.includes('const sorted = [...sc.sources].sort')) {
  content = content.replace(
    /const handleDrop = \(e: React\.DragEvent, targetId: string\) => \{\s*e\.preventDefault\(\)\s*const srcId = e\.dataTransfer\.getData\('source_id'\)\s*if \(srcId && srcId !== targetId\) \{\s*if \(typeof saveStateForUndo === 'function'\) saveStateForUndo\(\)\s*\/\/ simple reorder\s*setScenes\(prev => InputManager\.reorderSource\(prev, activeScene, srcId, 'up'\)\)\s*\}\s*\}/,
    `const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const srcId = e.dataTransfer.getData('source_id')
    if (srcId && srcId !== targetId) {
      if (typeof saveStateForUndo === 'function') saveStateForUndo()
      setScenes(prev => {
        const sc = prev.find(s => s.id === activeScene)
        if (!sc) return prev
        const sorted = [...sc.sources].sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0))
        const dragIdx = sorted.findIndex(s => s.id === srcId)
        const dropIdx = sorted.findIndex(s => s.id === targetId)
        if (dragIdx === -1 || dropIdx === -1) return prev
        const [dragItem] = sorted.splice(dragIdx, 1)
        sorted.splice(dropIdx, 0, dragItem)
        sorted.forEach((s, i) => s.zIndex = i)
        return prev.map(s => s.id === activeScene ? { ...s, sources: sorted } : s)
      })
    }
  }`
  );
}

// 4. Update keyboard shortcuts (Ctrl+[, Ctrl+])
if (!content.includes("e.key === ']'")) {
  content = content.replace(
    /if \(selectedSourceIds\.length === 0\) return/,
    `if (selectedSourceIds.length === 0) return
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault()
        if (e.shiftKey) bringToFront(selectedSourceIds[0])
        else bringForward(selectedSourceIds[0])
      }
      if (e.ctrlKey && e.key === '[') {
        e.preventDefault()
        if (e.shiftKey) sendToBack(selectedSourceIds[0])
        else sendBackward(selectedSourceIds[0])
      }`
  );
}

// 5. Context Menu Items for Layering
// Find the <ContextMenu> and insert Layer items
if (!content.includes('Bring Forward')) {
  content = content.replace(
    /options=\{\[\s*\{\s*label: 'Duplicate',/,
    `options={[
          {
            label: 'Layer',
            action: () => {},
            subOptions: [
              { label: 'Bring Forward (Ctrl+])', action: () => contextMenuSourceId && bringForward(contextMenuSourceId) },
              { label: 'Bring To Front (Ctrl+Shift+])', action: () => contextMenuSourceId && bringToFront(contextMenuSourceId) },
              { label: 'Send Backward (Ctrl+[)', action: () => contextMenuSourceId && sendBackward(contextMenuSourceId) },
              { label: 'Send To Back (Ctrl+Shift+[)', action: () => contextMenuSourceId && sendToBack(contextMenuSourceId) }
            ]
          },
          { label: 'Duplicate',`
  );
  // Wait, if ContextMenu doesn't support subOptions, the user prompt says:
  // "Layer\nBring Forward\nBring To Front\nSend Backward\nSend To Back\nDuplicate\nDelete..."
  // If `subOptions` is not supported, I should just list them flat or check `ContextMenu.tsx`.
  // I will just list them flat if ContextMenu throws errors, but most menus support sub-menus or dividers.
  // Actually, the user specifically listed them out as:
  // "Add right-click context menu on every source. Layer Bring Forward Bring To Front Send Backward Send To Back Duplicate Delete Lock Hide"
  // If I just add them as regular items, it's safer. Let's do that.
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched SourcesPanel partially. Now doing ContextMenu replacement flatly.');
