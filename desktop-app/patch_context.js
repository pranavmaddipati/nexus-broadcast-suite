const fs = require('fs');

const path = 'c:\\broadcast-suite3\\desktop-app\\src\\context\\BroadcastContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add zIndex?: number to SceneSource interface
if (!content.includes('zIndex?: number')) {
  content = content.replace(
    /export interface SceneSource \{\n\s*id: string/,
    "export interface SceneSource {\n  id: string\n  zIndex?: number"
  );
}

// 2. Add layer functions to BroadcastContextType
if (!content.includes('bringForward: (sourceId: string) => void')) {
  content = content.replace(
    /reorderSource: \(sceneId: SceneId, sourceId: string, direction: 'up' \| 'down' \| 'top' \| 'bottom'\) => void/,
    `reorderSource: (sceneId: SceneId, sourceId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void\n  bringForward: (sourceId: string) => void\n  sendBackward: (sourceId: string) => void\n  bringToFront: (sourceId: string) => void\n  sendToBack: (sourceId: string) => void`
  );
}

// 3. Add zIndex to new source in addSourceToScene
if (!content.includes('const newZ = existingZ.length ? Math.max(...existingZ) + 1 : 0')) {
  content = content.replace(
    /const addSourceToScene = \(sceneId: SceneId, type: SceneSource\['type'\], name: string, initialSettings\?: any\): string => \{/,
    `const addSourceToScene = (sceneId: SceneId, type: SceneSource['type'], name: string, initialSettings?: any): string => {\n    const targetScene = (scenes || []).find(s => s.id === sceneId)\n    const existingZ = targetScene?.sources.map(s => s.zIndex || 0) || []\n    const newZ = existingZ.length ? Math.max(...existingZ) + 1 : 0`
  );
  content = content.replace(
    /id: \`src_\$\{Date\.now\(\)\}_\$\{Math\.floor\(Math\.random\(\) \* 1000\)\}\`,/,
    "id: `src_${Date.now()}_${Math.floor(Math.random() * 1000)}`,\n      zIndex: newZ,"
  );
}

// 4. Implement the layer functions in BroadcastProvider
if (!content.includes('const bringForward = (sourceId: string) => {')) {
  const layerFunctions = `
  const normalizeZIndexes = (sources: SceneSource[]) => {
    const sorted = [...sources].sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0))
    sorted.forEach((s, i) => s.zIndex = i)
    return sorted
  }

  const bringForward = (sourceId: string) => {
    saveStateForUndo()
    setScenes(prev => prev.map(sc => {
      if (sc.id !== activeScene) return sc
      const sorted = normalizeZIndexes(sc.sources)
      const idx = sorted.findIndex(s => s.id === sourceId)
      if (idx === -1 || idx === sorted.length - 1) return sc
      const temp = sorted[idx]
      sorted[idx] = sorted[idx + 1]
      sorted[idx + 1] = temp
      sorted.forEach((s, i) => s.zIndex = i)
      return { ...sc, sources: sorted }
    }))
  }

  const sendBackward = (sourceId: string) => {
    saveStateForUndo()
    setScenes(prev => prev.map(sc => {
      if (sc.id !== activeScene) return sc
      const sorted = normalizeZIndexes(sc.sources)
      const idx = sorted.findIndex(s => s.id === sourceId)
      if (idx <= 0) return sc
      const temp = sorted[idx]
      sorted[idx] = sorted[idx - 1]
      sorted[idx - 1] = temp
      sorted.forEach((s, i) => s.zIndex = i)
      return { ...sc, sources: sorted }
    }))
  }

  const bringToFront = (sourceId: string) => {
    saveStateForUndo()
    setScenes(prev => prev.map(sc => {
      if (sc.id !== activeScene) return sc
      const sorted = normalizeZIndexes(sc.sources)
      const idx = sorted.findIndex(s => s.id === sourceId)
      if (idx === -1 || idx === sorted.length - 1) return sc
      const [item] = sorted.splice(idx, 1)
      sorted.push(item)
      sorted.forEach((s, i) => s.zIndex = i)
      return { ...sc, sources: sorted }
    }))
  }

  const sendToBack = (sourceId: string) => {
    saveStateForUndo()
    setScenes(prev => prev.map(sc => {
      if (sc.id !== activeScene) return sc
      const sorted = normalizeZIndexes(sc.sources)
      const idx = sorted.findIndex(s => s.id === sourceId)
      if (idx <= 0) return sc
      const [item] = sorted.splice(idx, 1)
      sorted.unshift(item)
      sorted.forEach((s, i) => s.zIndex = i)
      return { ...sc, sources: sorted }
    }))
  }

  `;
  content = content.replace(
    /const updateSourceProperties = \(sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>\) => \{/,
    layerFunctions + "\n  const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {"
  );
}

// 5. Provide layer functions in the Context value
if (!content.includes('bringForward,')) {
  content = content.replace(
    /reorderSource,/,
    "reorderSource,\n        bringForward,\n        sendBackward,\n        bringToFront,\n        sendToBack,"
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched BroadcastContext.tsx successfully.');
