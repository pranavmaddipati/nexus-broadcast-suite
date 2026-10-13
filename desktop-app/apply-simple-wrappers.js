const fs = require('fs');

let ctx = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

// 1. Restore updateSourceProperties
const oldUSP = ctx.substring(
    ctx.indexOf('  const updateSourceProperties ='),
    ctx.indexOf('  const addFilterToSource =')
);

const newUSP = `  const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {
    try {
      setScenes(prev => (prev || []).map(sc => {
        const isTargetScene = sc.id === sceneId
        const hasSource = (sc.sources || []).some(s => s.id === sourceId)
        const shouldUpdate = isTargetScene || (!duplicateSourcesSetting && hasSource)
        if (!shouldUpdate) return sc

        const filteredUpdates = { ...updates }
        if (!isTargetScene) {
          delete filteredUpdates.x
          delete filteredUpdates.y
          delete filteredUpdates.width
          delete filteredUpdates.height
          delete filteredUpdates.visible
          delete filteredUpdates.locked
          delete filteredUpdates.opacity
        }

        return {
          ...sc,
          sources: (sc.sources || []).map(src => {
            if (src.id !== sourceId) return src
            const mergedSettings = filteredUpdates.settings 
              ? { ...src.settings, ...filteredUpdates.settings } 
              : src.settings
            const updated = { 
              ...src, 
              ...filteredUpdates, 
              settings: mergedSettings 
            }
            
            if (['camera', 'media', 'video', 'display_capture', 'window_capture', 'ndi', 'audio'].includes(src.type)) {
              getOrCreateVideo(src.id, updated)
            }

            updateWebAudioNode(updated)
            return updated
          })
        }
      }))
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
ctx = ctx.replace(oldUSP, newUSP);


// 2. Restore setChannelVolume
const oldSCV = ctx.substring(
    ctx.indexOf('  const setChannelVolume ='),
    ctx.indexOf('  const toggleChannelMute =')
);
const newSCV = `  const setChannelVolume = (sourceId: string, vol: number) => {
    try {
      setScenes(prev => (prev || []).map(sc => ({
        ...sc,
        sources: (sc.sources || []).map(src => {
          if (src.id !== sourceId) return src
          const updated = { ...src, volume: vol }
          updateWebAudioNode(updated)
          return updated
        })
      })))
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
ctx = ctx.replace(oldSCV, newSCV);


// 3. Restore toggleChannelMute
const oldTCM = ctx.substring(
    ctx.indexOf('  const toggleChannelMute ='),
    ctx.indexOf('  const updateChannelGain =')
);
const newTCM = `  const toggleChannelMute = (sourceId: string) => {
    try {
      setScenes(prev => (prev || []).map(sc => ({
        ...sc,
        sources: (sc.sources || []).map(src => {
          if (src.id !== sourceId) return src
          const updated = { ...src, muted: !src.muted }
          updateWebAudioNode(updated)
          return updated
        })
      })))
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
ctx = ctx.replace(oldTCM, newTCM);

fs.writeFileSync('src/context/BroadcastContext.tsx', ctx);
console.log('Fixed BroadcastContext');

// Now PreviewMonitor.tsx
let pm = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf8');
const oldPM_D = pm.substring(
    pm.indexOf('  const handlePointerDown = (e: React.PointerEvent) => {'),
    pm.indexOf('  const handlePointerMove = (e: React.PointerEvent) => {')
);
const newPM_D = `  const handlePointerDown = (e: React.PointerEvent) => {
    try {
      if (e.button === 1) { // Middle click pan
        setIsPanning(true)
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
        return
      }

      if (e.button !== 0) return // Only left click for transform

      const { scaleX, scaleY } = getScale()
      if (!containerRef.current || !currentScene) return
      const rect = containerRef.current.getBoundingClientRect()
      
      const rawX = e.clientX - rect.left - (zoomLevel !== 'fit' ? (rect.width/2 - (1920 * getScale().actualZoom)/2 + panOffset.x) : 0)
      const rawY = e.clientY - rect.top - (zoomLevel !== 'fit' ? (rect.height/2 - (1080 * getScale().actualZoom)/2 + panOffset.y) : 0)
      
      const x = rawX * scaleX
      const y = rawY * scaleY

      const primarySelectedId = selectedSourceIds[0]
      if (primarySelectedId) {
        const selectedSrc = currentScene.sources.find(s => s.id === primarySelectedId)
        if (selectedSrc && !selectedSrc.locked) {
          const handles = getSourceHandles(selectedSrc)
          for (const [handleId, h] of Object.entries(handles)) {
            if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
              setActiveHandle(handleId)
              setIsDragging(true)
              setDragStart({ x: e.clientX, y: e.clientY })
              const cropF = selectedSrc.filters?.find(f => f.type === 'crop')
              setSourceStart({ 
                x: selectedSrc.x, y: selectedSrc.y, w: selectedSrc.width, h: selectedSrc.height, 
                rot: selectedSrc.settings?.rotation || 0,
                cropL: cropF?.settings?.cropLeft || 0, cropR: cropF?.settings?.cropRight || 0, 
                cropT: cropF?.settings?.cropTop || 0, cropB: cropF?.settings?.cropBottom || 0
              })
              const multiStart: Record<string, any> = {}
              selectedSourceIds.forEach(id => {
                const s = currentScene.sources.find(src => src.id === id)
                if (s) multiStart[id] = { x: s.x, y: s.y, w: s.width, h: s.height, rot: s.settings?.rotation || 0 }
              })
              setMultiSourceStart(multiStart)
              return
            }
          }
        }
      }

      let hitSourceId: string | null = null
      for (let i = currentScene.sources.length - 1; i >= 0; i--) {
        const src = currentScene.sources[i]
        if (!src.visible) continue
        if (x >= src.x && x <= src.x + src.width && y >= src.y && y <= src.y + src.height) {
          hitSourceId = src.id
          break
        }
      }

      if (hitSourceId) {
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey && !selectedSourceIds.includes(hitSourceId)) {
          toggleSourceSelection(hitSourceId, false)
        } else if (e.shiftKey || e.ctrlKey || e.metaKey) {
          toggleSourceSelection(hitSourceId, true)
        }
        
        const hitSource = currentScene.sources.find(s => s.id === hitSourceId)
        if (hitSource && !hitSource.locked) {
          setIsDragging(true)
          setActiveHandle(null)
          setDragStart({ x: e.clientX, y: e.clientY })
          const cropF = hitSource.filters?.find(f => f.type === 'crop')
          setSourceStart({ 
            x: hitSource.x, y: hitSource.y, w: hitSource.width, h: hitSource.height, 
            rot: hitSource.settings?.rotation || 0,
            cropL: cropF?.settings?.cropLeft || 0, cropR: cropF?.settings?.cropRight || 0, 
            cropT: cropF?.settings?.cropTop || 0, cropB: cropF?.settings?.cropBottom || 0
          })
          const finalSelection = e.shiftKey || e.ctrlKey || e.metaKey ? [...selectedSourceIds, hitSourceId] : [hitSourceId]
          const multiStart: Record<string, any> = {}
          finalSelection.forEach(id => {
            const s = currentScene.sources.find(src => src.id === id)
            if (s) multiStart[id] = { x: s.x, y: s.y, w: s.width, h: s.height, rot: s.settings?.rotation || 0 }
          })
          setMultiSourceStart(multiStart)
        }
      } else {
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
          setSelectedSourceIds([])
        }
        setIsDragging(false)
        setActiveHandle(null)
      }
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
pm = pm.replace(oldPM_D, newPM_D);


const oldPM_M = pm.substring(
    pm.indexOf('  const handlePointerMove = (e: React.PointerEvent) => {'),
    pm.indexOf('  const handlePointerUp = (e: React.PointerEvent) => {')
);
const newPM_M = `  const handlePointerMove = (e: React.PointerEvent) => {
    try {
      if (isPanning) {
        setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
        return
      }

      const primarySelectedId = selectedSourceIds[0]
      if (!isDragging && primarySelectedId && containerRef.current && currentScene) {
        const rect = containerRef.current.getBoundingClientRect()
        const { scaleX, scaleY, actualZoom } = getScale()
        const rawX = e.clientX - rect.left - (zoomLevel !== 'fit' ? (rect.width/2 - (1920 * actualZoom)/2 + panOffset.x) : 0)
        const rawY = e.clientY - rect.top - (zoomLevel !== 'fit' ? (rect.height/2 - (1080 * actualZoom)/2 + panOffset.y) : 0)
        const x = rawX * scaleX
        const y = rawY * scaleY
        const selectedSrc = currentScene.sources.find(s => s.id === primarySelectedId)
        
        let cursor = 'default'
        if (selectedSrc && !selectedSrc.locked) {
          const hit = TransformManager.getHitHandle(selectedSrc, x, y)
          if (hit) cursor = hit === "rot" ? "crosshair" : (hit === "n" || hit === "s" ? "ns-resize" : hit === "e" || hit === "w" ? "ew-resize" : hit === "ne" || hit === "sw" ? "nesw-resize" : "nwse-resize")
          if (cursor === 'default' && SelectionManager.getHitSource([selectedSrc], x, y)) cursor = 'move'
        }
        containerRef.current.style.cursor = cursor
      }
      if (!isDragging || selectedSourceIds.length === 0 || !currentScene) return

      const { scaleX, scaleY } = getScale()
      const dx = (e.clientX - dragStart.x) * scaleX
      const dy = (e.clientY - dragStart.y) * scaleY

      if (!activeHandle) {
        let newX = sourceStart.x + dx
        let newY = sourceStart.y + dy
        
        if (showSnapGuides && !e.shiftKey) {
          const snap = TransformManager.calculateSnap(newX, newY, sourceStart.w, sourceStart.h, currentScene.sources.filter(s => s.visible), selectedSourceIds)
          newX = snap.x;
          newY = snap.y;
          setActiveSnapGuides({ x: snap.snappedX, y: snap.snappedY })
        } else {
          setActiveSnapGuides({})
        }
        const finalDx = newX - sourceStart.x
        const finalDy = newY - sourceStart.y

        const updatesBySource: Record<string, any> = {}
        selectedSourceIds.forEach(id => {
          const src = currentScene.sources.find(s => s.id === id)
          const start = multiSourceStart[id]
          if (src && start && !src.locked) {
            updatesBySource[id] = { x: start.x + finalDx, y: start.y + finalDy }
          }
        })

        Object.keys(updatesBySource).forEach(id => {
          updateSourceProperties(activeScene, id, updatesBySource[id])
        })

      } else if (activeHandle === 'rot' && primarySelectedId) {
        const selectedSrc = currentScene.sources.find(s => s.id === primarySelectedId)
        if (!selectedSrc) return
        const cx = sourceStart.x + sourceStart.w / 2
        const cy = sourceStart.y + sourceStart.h / 2
        const rect = containerRef.current!.getBoundingClientRect()
        const pointerX = (e.clientX - rect.left) * scaleX
        const pointerY = (e.clientY - rect.top) * scaleY
        
        let angle = Math.atan2(pointerY - cy, pointerX - cx) * (180 / Math.PI) + 90
        
        if (e.shiftKey) {
          angle = Math.round(angle / 45) * 45
        }

        updateSourceProperties(activeScene, primarySelectedId, {
          settings: { ...selectedSrc.settings, rotation: angle }
        })
      } else if (primarySelectedId) {
        const selectedSrc = currentScene.sources.find(s => s.id === primarySelectedId)
        if (!selectedSrc) return

        if (e.altKey || editMode === 'crop') {
          let cL = sourceStart.cropL
          let cR = sourceStart.cropR
          let cT = sourceStart.cropT
          let cB = sourceStart.cropB
          let newX = sourceStart.x
          let newY = sourceStart.y
          let newW = sourceStart.w
          let newH = sourceStart.h

          if (activeHandle.includes('w')) { cL = Math.max(0, sourceStart.cropL + dx); newX = sourceStart.x + dx; newW = sourceStart.w - dx; }
          if (activeHandle.includes('e')) { cR = Math.max(0, sourceStart.cropR - dx); newW = sourceStart.w + dx; }
          if (activeHandle.includes('n')) { cT = Math.max(0, sourceStart.cropT + dy); newY = sourceStart.y + dy; newH = sourceStart.h - dy; }
          if (activeHandle.includes('s')) { cB = Math.max(0, sourceStart.cropB - dy); newH = sourceStart.h + dy; }

          let filters = [...(selectedSrc.filters || [])]
          const cropIndex = filters.findIndex(f => f.type === 'crop')
          const newCropFilter = {
            id: cropIndex >= 0 ? filters[cropIndex].id : \`filter_\${Date.now()}\`,
            type: 'crop' as const,
            enabled: true,
            settings: { cropLeft: cL, cropRight: cR, cropTop: cT, cropBottom: cB }
          }
          if (cropIndex >= 0) filters[cropIndex] = newCropFilter
          else filters.push(newCropFilter)

          updateSourceProperties(activeScene, primarySelectedId, {
            x: newX, y: newY, width: Math.max(10, newW), height: Math.max(10, newH), filters
          })
        } else {
          let newX = sourceStart.x
          let newY = sourceStart.y
          let newW = sourceStart.w
          let newH = sourceStart.h

          const maintainAspect = e.shiftKey
          const aspect = sourceStart.w / sourceStart.h

          if (activeHandle.includes('w')) { newX = sourceStart.x + dx; newW = sourceStart.w - dx; }
          if (activeHandle.includes('e')) { newW = sourceStart.w + dx; }
          if (activeHandle.includes('n')) { newY = sourceStart.y + dy; newH = sourceStart.h - dy; }
          if (activeHandle.includes('s')) { newH = sourceStart.h + dy; }

          if (maintainAspect) {
            if (activeHandle === 'se' || activeHandle === 'e' || activeHandle === 's') {
              newH = newW / aspect
            } else if (activeHandle === 'nw' || activeHandle === 'w' || activeHandle === 'n') {
              const deltaX = sourceStart.x - newX
              newY = sourceStart.y - deltaX / aspect
              newH = sourceStart.h + deltaX / aspect
            }
          }

          updateSourceProperties(activeScene, primarySelectedId, {
            x: newX,
            y: newY,
            width: Math.max(10, newW),
            height: Math.max(10, newH)
          })
        }
      }
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
pm = pm.replace(oldPM_M, newPM_M);

const oldPM_U = pm.substring(
    pm.indexOf('  const handlePointerUp = (e: React.PointerEvent) => {'),
    pm.indexOf('  const handleFilesDropped = (files: FileList) => {')
);
const newPM_U = `  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      if (isPanning) {
        setIsPanning(false)
        return
      }

      if (isDragging) {
        pushToUndoStack(scenes)
      }
      setIsDragging(false)
      setActiveHandle(null)
      setActiveSnapGuides({})
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
pm = pm.replace(oldPM_U, newPM_U);

fs.writeFileSync('src/components/PreviewMonitor.tsx', pm);
console.log('Fixed PreviewMonitor');

// Now InspectorPanel
let ins = fs.readFileSync('src/components/InspectorPanel.tsx', 'utf8');

const oldINS_R = ins.substring(
    ins.indexOf('  const updateRoot = (updates: Partial<SceneSource>) => {'),
    ins.indexOf('  const updateSettings = (settingUpdates: any) => {')
);
const newINS_R = `  const updateRoot = (updates: Partial<SceneSource>) => {
    try {
      updateSourceProperties(activeScene, source.id, updates)
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
ins = ins.replace(oldINS_R, newINS_R);

const oldINS_S = ins.substring(
    ins.indexOf('  const updateSettings = (settingUpdates: any) => {'),
    ins.indexOf('  const renderTabGeneral = () => {')
);
const newINS_S = `  const updateSettings = (settingUpdates: any) => {
    try {
      updateSourceProperties(activeScene, source.id, { settings: { ...source.settings, ...settingUpdates } })
    } catch (err) {
      console.error(err);
      debugger;
    }
  }

`;
ins = ins.replace(oldINS_S, newINS_S);

fs.writeFileSync('src/components/InspectorPanel.tsx', ins);
console.log('Fixed InspectorPanel');

// Fix SourceRenderer
let sr = fs.readFileSync('src/engine/SourceRenderer.ts', 'utf8');
const oldSR = sr.substring(
    sr.indexOf('  public static renderSource(ctx: CanvasRenderingContext2D, src: SceneSource, time: number) {'),
    sr.indexOf('  }') + 3
);

// We need to match the entire function properly. Since I injected try/catch inside SourceRenderer.
// I will just replace it based on what's there now.
sr = sr.replace(/try {\s*if \(\!src\) \{ console\.error\('SourceRenderer: src is undefined'\); return; \}\s*if \(\!src\.settings\) \{ console\.error\('SourceRenderer: src\.settings is undefined on source', src\.id\); \}\s*if \(\!src\.filters\) \{ console\.error\('SourceRenderer: src\.filters is undefined on source', src\.id\); \}/, '');
sr = sr.replace(/} catch \(err: any\) \{\s*console\.error\('================ REAL EXCEPTION ================='\);\s*console\.error\('Component: SourceRenderer'\);\s*console\.error\('Function: renderSource'\);\s*console\.error\('Source ID:', src\?\.id\);\s*console\.error\('Stack Trace:', err\.stack\);\s*console\.error\('================================================'\);\s*throw err;\s*}/, '');

fs.writeFileSync('src/engine/SourceRenderer.ts', sr);
console.log('Fixed SourceRenderer');
