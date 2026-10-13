const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

// 1. Add MediaManager import
content = content.replace(
  "import { RenderScheduler } from '../engine/RenderScheduler'",
  "import { RenderScheduler } from '../engine/RenderScheduler'\nimport { MediaManager, MediaSourceElement } from '../engine/MediaManager'"
)

// 2. Add mediaSources to the context interface
content = content.replace(
  "videoElements: Record<string, HTMLVideoElement>\n  imageElements: Record<string, HTMLImageElement>",
  "mediaSources: Record<string, MediaSourceElement>"
)

// 3. Remove refs and states for videoElements/imageElements
content = content.replace(
  /const videoElementsRef = useRef[^;]+;\n/g,
  ""
)
content = content.replace(
  /const imageElementsRef = useRef[^;]+;\n/g,
  ""
)
content = content.replace(
  /const \[videoElements, setVideoElements\] = useState[^;]+;\n/g,
  "const [mediaSources, setMediaSources] = useState<Record<string, MediaSourceElement>>({})\n"
)
content = content.replace(
  /const \[imageElements, setImageElements\] = useState[^;]+;\n/g,
  ""
)

// 4. In useEffect that syncs scenes, use MediaManager
content = content.replace(
  /Object\.entries\(videoElementsRef\.current\)\.forEach\(\(\[srcId, video\]\) => \{[\s\S]*?\}\)\)/g,
  ""
)
content = content.replace(
  /\/\/ Clean up html media resources[\s\S]*?if \(imageElementsRef\.current\[sourceId\]\) \{[\s\S]*?\}\n      \}/g,
  "// Clean up html media resources\n      MediaManager.getInstance().disposeSource(sourceId)"
)

// Remove getOrCreateVideo completely!
content = content.replace(
  /const getOrCreateVideo = \([\s\S]*?return video\n    \}/,
  ""
)
// Remove getOrCreateImage completely!
content = content.replace(
  /const getOrCreateImage = \([\s\S]*?return img\n    \}/,
  ""
)

// Change getOrCreateVideo calls
content = content.replace(
  /if \(\['camera', 'media', 'video', 'display_capture', 'window_capture', 'ndi', 'audio', 'graphics'\]\.includes\(type\)\) \{\n\s*getOrCreateVideo\(newSource\.id, newSource\)\n\s*\}/g,
  "" // Handled by MediaManager sync
)

content = content.replace(
  /if \(\['camera', 'media', 'video', 'display_capture', 'window_capture', 'ndi', 'audio', 'graphics'\]\.includes\(src\.type\)\) \{\n\s*getOrCreateVideo\(src\.id, updated\)\n\s*\}/g,
  "" // Handled by MediaManager sync
)

// Update context provider value
content = content.replace(
  /videoElements,\n\s*imageElements,/,
  "mediaSources,"
)

// Remove undo console.logs that reference videoElements
content = content.replace(
  /console\.log\("Video elements:", structuredClone\(videoElements\)\);\n/g,
  ""
)

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Patched BroadcastContext.tsx')
