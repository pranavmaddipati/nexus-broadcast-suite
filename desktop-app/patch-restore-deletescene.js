const fs = require('fs')

let content = fs.readFileSync('src/components/SceneLibrary.tsx', 'utf-8')
// Restore deleteScene
content = content.replace(/\/\* deleteScene not implemented \*\//g, 'deleteScene(id)')
content = content.replace(/} = useBroadcast\(\)/g, ', deleteScene = () => {} } = useBroadcast()')
fs.writeFileSync('src/components/SceneLibrary.tsx', content)

console.log('Restored deleteScene in SceneLibrary')
