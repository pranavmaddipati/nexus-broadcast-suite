const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

const replacement = `    MediaManager.getInstance().disposeSource(sourceId)
  }

  const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {
    saveStateForUndo()
    setScenes(prev => (prev || []).map(sc => {
      const shouldUpdate = sc.id === sceneId || (!duplicateSourcesSetting && (sc.sources || []).some(s => s.id === sourceId))
      if (!shouldUpdate) return sc

      return {
        ...sc,
        sources: (sc.sources || []).map(src => {
          if (src.id !== sourceId) return src
          const updated = { ...src, ...updates }
          updateWebAudioNode(updated)
          return updated
        })
      }
    }))
  }

  const updateSourceSettings = (sceneId: SceneId, sourceId: string, settings: any) => {
    saveStateForUndo()
    setScenes(prev => (prev || []).map(sc => {
      const shouldUpdate = sc.id === sceneId || (!duplicateSourcesSetting && (sc.sources || []).some(s => s.id === sourceId))
      if (!shouldUpdate) return sc
      
      return {
        ...sc,
        sources: (sc.sources || []).map(src => {
          if (src.id !== sourceId) return src
          const updated = { ...src, settings: { ...src.settings, ...settings } }
          updateWebAudioNode(updated)
          return updated
        })
      }
    }))
  }`

content = content.replace(
  /MediaManager\.getInstance\(\)\.disposeSource\(sourceId\)\)\)\n\s*\} catch \(err\) \{\n\s*console\.error\(err\);\n\s*debugger;\n\s*\} finally \{\n\s*console\.log\("After updateSource\(\)"\);\n\s*console\.log\("Scene:", structuredClone\(scenes\.find\(s=>s\.id===sceneId\)\)\);\n\s*console\.log\("Sources:", structuredClone\(scenes\.find\(s=>s\.id===sceneId\)\?\.sources\)\);\n\s*\}\n  \}/,
  replacement
)

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Fixed destroyed methods')
