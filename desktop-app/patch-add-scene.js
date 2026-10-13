const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

// 1. Inject addScene implementation
const addSceneCode = `
  const addScene = (nameOrId?: string, isDuplicate?: boolean) => {
    saveStateForUndo()
    const newSceneId = 'scene_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
    
    setScenes(prev => {
      const sceneList = prev || []
      let newScene: Scene
      
      if (isDuplicate && nameOrId) {
        const sourceScene = sceneList.find(s => s.id === nameOrId)
        if (sourceScene) {
          newScene = {
            ...structuredClone(sourceScene),
            id: newSceneId,
            name: sourceScene.name + ' (Copy)'
          }
        } else {
          // fallback
          newScene = { id: newSceneId, name: 'New Scene', sources: [], pinned: false }
        }
      } else {
        newScene = {
          id: newSceneId,
          name: nameOrId || 'New Scene',
          sources: [],
          pinned: false
        }
      }
      
      return [...sceneList, newScene]
    })
    
    // Automatically select the new scene to make it the Preview scene
    setActiveScene(newSceneId)
  }

  const togglePinScene`

content = content.replace("  const togglePinScene", addSceneCode)

// 2. Remove undefined exports from value={{...}}
content = content.replace(/deleteScene,\r?\n\s*/, '')
content = content.replace(/duplicateScene,\r?\n\s*/, '')

// 3. Clean up the Context Interface to remove deleteScene and duplicateScene, 
// and update addScene's signature
content = content.replace(
  /addScene: \(name: string\) => void/,
  'addScene: (nameOrId?: string, isDuplicate?: boolean) => void'
)
content = content.replace(/deleteScene: \(id: string\) => void\r?\n\s*/, '')
content = content.replace(/duplicateScene: \(id: string\) => void\r?\n\s*/, '')

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Patched BroadcastContext for addScene')
