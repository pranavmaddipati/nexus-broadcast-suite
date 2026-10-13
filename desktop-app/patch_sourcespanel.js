const fs = require('fs')
const path = 'c:/broadcast-suite3/desktop-app/src/components/SourcesPanel.tsx'
const lines = fs.readFileSync(path, 'utf8').split('\n')

const out = []
let inAddSourceModal = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  if (line.startsWith('import { ContextMenu }')) {
    out.push(line)
    out.push('import { InputManager } from \'../engine/input/InputManager\'')
    out.push('import { InputSelectionDialog } from \'./InputSelectionDialog\'')
    continue
  }

  // Replace handleToggleVisibility
  if (line.includes('const handleToggleVisibility = useCallback((id: string) => {')) {
    out.push('  const handleToggleVisibility = useCallback((id: string) => {')
    out.push('    if (typeof saveStateForUndo === \'function\') saveStateForUndo()')
    out.push('    setScenes(prev => InputManager.toggleProperty(prev, activeScene, id, "visible"))')
    out.push('  }, [activeScene, setScenes, saveStateForUndo])')
    
    while (!lines[i].includes('  }, [activeScene, setScenes, saveStateForUndo])')) { i++ }
    continue
  }

  // Replace handleToggleLock
  if (line.includes('const handleToggleLock = useCallback((id: string) => {')) {
    out.push('  const handleToggleLock = useCallback((id: string) => {')
    out.push('    if (typeof saveStateForUndo === \'function\') saveStateForUndo()')
    out.push('    setScenes(prev => InputManager.toggleProperty(prev, activeScene, id, "locked"))')
    out.push('  }, [activeScene, setScenes, saveStateForUndo])')
    
    while (!lines[i].includes('  }, [activeScene, setScenes, saveStateForUndo])')) { i++ }
    continue
  }

  // Replace handleToggleMute
  if (line.includes('const handleToggleMute = useCallback((id: string) => {')) {
    out.push('  const handleToggleMute = useCallback((id: string) => {')
    out.push('    if (typeof saveStateForUndo === \'function\') saveStateForUndo()')
    out.push('    setScenes(prev => InputManager.toggleProperty(prev, activeScene, id, "muted"))')
    out.push('  }, [activeScene, setScenes, saveStateForUndo])')
    
    while (!lines[i].includes('  }, [activeScene, setScenes, saveStateForUndo])')) { i++ }
    continue
  }

  // Replace handleDelete
  if (line.includes('const handleDelete = useCallback((ids: string[]) => {')) {
    out.push('  const handleDelete = useCallback((ids: string[]) => {')
    out.push('    if (typeof saveStateForUndo === \'function\') saveStateForUndo()')
    out.push('    setScenes(prev => InputManager.deleteSources(prev, activeScene, ids))')
    out.push('    setSelectedSourceIds([])')
    out.push('  }, [activeScene, setScenes, saveStateForUndo, setSelectedSourceIds])')
    
    while (!lines[i].includes('  }, [activeScene, sources, setScenes, saveStateForUndo, setSelectedSourceIds])')) { i++ }
    continue
  }

  // Replace handleDuplicate
  if (line.includes('const handleDuplicate = useCallback((ids: string[]) => {')) {
    out.push('  const handleDuplicate = useCallback((ids: string[]) => {')
    out.push('    if (typeof saveStateForUndo === \'function\') saveStateForUndo()')
    out.push('    setScenes(prev => InputManager.duplicateSources(prev, activeScene, ids))')
    out.push('  }, [activeScene, setScenes, saveStateForUndo])')
    
    while (!lines[i].includes('  }, [activeScene, sources, setScenes, saveStateForUndo])')) { i++ }
    continue
  }

  // Remove AddSourceModal definition
  if (line.includes('const AddSourceModal = () => {')) {
    inAddSourceModal = true
    continue
  }
  
  if (inAddSourceModal) {
    if (line.trim() === '}' && lines[i-1].includes('</div>')) {
      inAddSourceModal = false
    }
    continue
  }

  // Replace <AddSourceModal /> usage with InputSelectionDialog
  if (line.includes('<AddSourceModal />')) {
    out.push('      {showAddModal && (')
    out.push('        <InputSelectionDialog ')
    out.push('          onClose={() => setShowAddModal(false)} ')
    out.push('          desktopSources={desktopSources} ')
    out.push('          refreshDesktopSources={loadDesktopSources} ')
    out.push('          onAddSource={(type, name, settings) => {')
    out.push('            if (typeof saveStateForUndo === "function") saveStateForUndo();')
    out.push('            setScenes(prev => InputManager.addSource(prev, activeScene, type as any, name, { settings }).newScenes);')
    out.push('            setShowAddModal(false);')
    out.push('          }}')
    out.push('        />')
    out.push('      )}')
    continue
  }

  out.push(line)
}

fs.writeFileSync(path, out.join('\n'), 'utf8')
