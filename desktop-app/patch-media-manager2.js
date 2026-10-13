const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

// Remove all videoElementsRef declarations
content = content.replace(/const videoElementsRef = useRef<Record<string, HTMLVideoElement>>\(\{\}\)\n/g, '')
content = content.replace(/const imageElementsRef = useRef<Record<string, HTMLImageElement>>\(\{\}\)\n/g, '')

// Replace state
content = content.replace(/const \[videoElements, setVideoElements\] = useState<Record<string, HTMLVideoElement>>\(\{\}\)\n/g, 'const [mediaSources, setMediaSources] = useState<Record<string, MediaSourceElement>>({})\n')
content = content.replace(/const \[imageElements, setImageElements\] = useState<Record<string, HTMLImageElement>>\(\{\}\)\n/g, '')

// Erase getOrCreateVideo entirely
const getOrCreateVideoStart = content.indexOf('const getOrCreateVideo = (srcId: string, src: SceneSource) => {')
if (getOrCreateVideoStart !== -1) {
    const end = content.indexOf('const getOrCreateImage = (srcId: string, path: string) => {')
    if (end !== -1) {
        content = content.substring(0, getOrCreateVideoStart) + content.substring(end)
    }
}

// Erase getOrCreateImage entirely
const getOrCreateImageStart = content.indexOf('const getOrCreateImage = (srcId: string, path: string) => {')
if (getOrCreateImageStart !== -1) {
    const end = content.indexOf('// Media Streaming (Canvas -> MediaRecorder)')
    if (end !== -1) {
        content = content.substring(0, getOrCreateImageStart) + content.substring(end)
    }
}

// Ensure useBroadcast interface has mediaSources
content = content.replace(/videoElements: Record<string, HTMLVideoElement>/g, 'mediaSources: Record<string, MediaSourceElement>')
content = content.replace(/imageElements: Record<string, HTMLImageElement>/g, '')

// In useEffect:
// Add MediaManager.getInstance().subscribe(setMediaSources)
const useEffectScenesStart = content.indexOf('useEffect(() => {', content.indexOf('// Active scene processing'))
if (useEffectScenesStart !== -1) {
    content = content.replace(/useEffect\(\(\) => \{\n\s*const activeSc = \(scenes \|\| \[\]\)\.find\(s => s\.id === activeScene\)/, 
    `useEffect(() => {
    const unsub = MediaManager.getInstance().subscribe(setMediaSources)
    return () => unsub()
  }, [])

  useEffect(() => {
    MediaManager.getInstance().syncActiveSources(scenes)
    
    const activeSc = (scenes || []).find(s => s.id === activeScene)`)
}

// Remove the getOrCreateVideo calls when duplicating/adding sources
content = content.replace(/if \(\['camera', 'media', 'video', 'display_capture', 'window_capture', 'ndi', 'audio', 'graphics'\]\.includes\(type\)\) \{\n\s*getOrCreateVideo\(newSource\.id, newSource\)\n\s*\}/g, '')
content = content.replace(/if \(\['camera', 'media', 'video', 'display_capture', 'window_capture', 'ndi', 'audio', 'graphics'\]\.includes\(src\.type\)\) \{\n\s*getOrCreateVideo\(src\.id, updated\)\n\s*\}/g, '')

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Patched again.')
