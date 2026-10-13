const fs = require('fs')

let content = fs.readFileSync('src/components/SceneLibrary.tsx', 'utf-8')
content = content.replace(/deleteScene = \(\) => \{\}, /g, '')
content = content.replace(/duplicateScene = \(\) => \{\}, /g, '')
content = content.replace(/, duplicateScene, deleteScene/g, '')
content = content.replace(/duplicateScene\(id\)/g, 'addScene(id, true)')
content = content.replace(/deleteScene\(id\)/g, '/* deleteScene not implemented */') // Prevent crashes
fs.writeFileSync('src/components/SceneLibrary.tsx', content)

content = fs.readFileSync('src/components/SceneMatrix.tsx', 'utf-8')
content = content.replace(/duplicateScene, /g, '')
content = content.replace(/duplicateScene\(contextMenuSceneId\)/g, 'addScene(contextMenuSceneId, true)')
fs.writeFileSync('src/components/SceneMatrix.tsx', content)

console.log('Patched UI components')
