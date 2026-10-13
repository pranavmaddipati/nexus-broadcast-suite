const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

const selectSceneFunc = `  const selectScene = (id: string) => {
    setScenes(prev => {
      if (prev && prev.some(s => s.id === id)) {
        setActiveScene(id)
      }
      return prev
    })
  }

  const togglePinScene`

content = content.replace("  const togglePinScene", selectSceneFunc)

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Patched BroadcastContext')
