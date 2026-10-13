const fs = require('fs')
const path = 'c:/broadcast-suite3/desktop-app/src/components/PreviewMonitor.tsx'
const lines = fs.readFileSync(path, 'utf8').split('\n')

const out = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  
  if (line.startsWith('import { ContextMenu }')) {
    out.push(line)
    out.push(`import { TransformManager } from '../engine/TransformManager'`)
    out.push(`import { SelectionManager } from '../engine/SelectionManager'`)
    continue
  }

  // Replace getSourceHandles
  if (line.includes('const getSourceHandles = (src: SceneSource) => {')) {
    out.push('  const getSourceHandles = (src: SceneSource) => TransformManager.getHandles(src)')
    while (!lines[i].includes('  } // End getSourceHandles')) {
      i++
      if (lines[i].includes('export const PreviewMonitor')) { i--; break; } // safety fallback
      if (lines[i].trim() === '}' && lines[i-1].includes('crosshair')) { break; } // known structure
    }
    continue
  }

  // Replace getHitHandle
  if (line.includes('let cursor = \'default\'')) {
    out.push(line)
    out.push('      if (selectedSrc && !selectedSrc.locked) {')
    out.push('        const hit = TransformManager.getHitHandle(selectedSrc, x, y)')
    out.push('        if (hit) cursor = hit === "rot" ? "crosshair" : (hit === "n" || hit === "s" ? "ns-resize" : hit === "e" || hit === "w" ? "ew-resize" : hit === "ne" || hit === "sw" ? "nesw-resize" : "nwse-resize")')
    out.push('        if (cursor === \'default\' && SelectionManager.getHitSource([selectedSrc], x, y)) cursor = \'move\'')
    out.push('      }')
    out.push('      containerRef.current.style.cursor = cursor')
    out.push('    }')
    
    // skip the original logic block
    while (!lines[i+1].includes('if (!isDragging || selectedSourceIds.length === 0 || !currentScene) return')) {
      i++
    }
    continue
  }

  // Replace calculateSnap in pointerMove
  if (line.includes('const snapPointsX = [0, 1920/2 - sourceStart.w/2, 1920 - sourceStart.w]')) {
    out.push('      if (showSnapGuides && !e.shiftKey) {')
    out.push('        const snap = TransformManager.calculateSnap(newX, newY, sourceStart.w, sourceStart.h, currentScene.sources.filter(s => s.visible), selectedSourceIds)')
    out.push('        newX = snap.x;')
    out.push('        newY = snap.y;')
    out.push('        setActiveSnapGuides({ x: snap.snappedX, y: snap.snappedY })')
    out.push('      } else {')
    out.push('        setActiveSnapGuides({})')
    out.push('      }')
    
    // skip original snap logic
    while (!lines[i+1].includes('const finalDx = newX - sourceStart.x')) {
      i++
    }
    continue
  }

  out.push(line)
}

fs.writeFileSync(path, out.join('\n'), 'utf8')
