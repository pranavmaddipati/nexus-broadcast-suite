const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

const deleteSceneCode = `  const deleteScene = (id: string) => {
    saveStateForUndo()
    setScenes(prev => {
      const newList = (prev || []).filter(s => s.id !== id)
      // If we deleted the active scene, switch to another one
      if (activeScene === id && newList.length > 0) {
        setActiveScene(newList[0].id)
      }
      return newList
    })
  }

  const togglePinScene`

content = content.replace("  const togglePinScene", deleteSceneCode)

// Add deleteScene back to exports
content = content.replace(/addScene,\r?\n/, 'addScene,\n          deleteScene,\n')
content = content.replace(/addScene: \(nameOrId\?: string, isDuplicate\?: boolean\) => void\r?\n/, 'addScene: (nameOrId?: string, isDuplicate?: boolean) => void\n  deleteScene: (id: string) => void\n')

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Patched BroadcastContext for deleteScene')
