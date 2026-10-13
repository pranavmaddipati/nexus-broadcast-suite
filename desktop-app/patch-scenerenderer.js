const fs = require('fs')

let content = fs.readFileSync('src/components/SceneRenderer.tsx', 'utf-8')

// Add MediaSourceElement import
content = content.replace(
  "import type { SceneSource } from '../context/BroadcastContext'",
  "import type { SceneSource } from '../context/BroadcastContext'\nimport type { MediaSourceElement } from '../engine/MediaManager'"
)

// Update useBroadcast destructuring
content = content.replace(
  /const \{ scenes, videoElements \} = useBroadcast\(\)/g,
  "const { scenes, mediaSources = {} } = useBroadcast() as any // bypass strict type until fully migrated if needed\n  const videoElements = mediaSources"
)

// Update SourceNode signature
content = content.replace(
  /videoElements: Record<string, HTMLVideoElement>/g,
  "videoElements: Record<string, MediaSourceElement>"
)

// Update VideoSourceRenderer logic
content = content.replace(
  /const bgVideo = videoElements\[srcId\]/g,
  "const bgVideo = videoElements[srcId]?.videoElement"
)

fs.writeFileSync('src/components/SceneRenderer.tsx', content)
console.log('Patched SceneRenderer')
