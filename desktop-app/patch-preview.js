const fs = require('fs');

let content = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf8');

// Add Keyboard Handler for Arrow Keys
const keyboardHandler = `
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSourceId || !currentScene) return
      
      const hitSource = currentScene.sources?.find(s => s.id === selectedSourceId)
      if (!hitSource || hitSource.locked) return

      let dx = 0
      let dy = 0
      const step = e.shiftKey ? 10 : 1 // hold shift for faster move

      if (e.key === 'ArrowUp') dy = -step
      if (e.key === 'ArrowDown') dy = step
      if (e.key === 'ArrowLeft') dx = -step
      if (e.key === 'ArrowRight') dx = step

      if (dx !== 0 || dy !== 0) {
        e.preventDefault()
        updateSourceProperties(activeScene, selectedSourceId, {
          x: hitSource.x + dx,
          y: hitSource.y + dy
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSourceId, currentScene, activeScene, updateSourceProperties])
`;

if (!content.includes('ArrowUp')) {
    content = content.replace(/const handleMouseDown =/, `${keyboardHandler}\n\n  const handleMouseDown =`);
}

// Ensure 8-point handles exist and add Safe Area & Grid
const overlayReplacement = `
        {/* Canvas Overlay Grid & Safe Areas */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Action Safe (90%) */}
          <div style={{ position: 'absolute', top: '5%', left: '5%', width: '90%', height: '90%', border: '1px dashed rgba(255,255,255,0.3)' }} />
          {/* Title Safe (80%) */}
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', border: '1px dotted rgba(255,255,255,0.3)' }} />
          {/* Center Crosshair */}
          <div style={{ position: 'absolute', top: '50%', left: '48%', width: '4%', height: '1px', background: 'rgba(255,0,0,0.6)' }} />
          <div style={{ position: 'absolute', top: '46%', left: '50%', width: '1px', height: '8%', background: 'rgba(255,0,0,0.6)' }} />
        </div>

        {/* Transform Overlay */}
        {selectedSource && !selectedSource.locked && (
          <div style={{
            position: 'absolute',
            top: \`\${(selectedSource.y / 1080) * 100}%\`,
            left: \`\${(selectedSource.x / 1920) * 100}%\`,
            width: \`\${(selectedSource.width / 1920) * 100}%\`,
            height: \`\${(selectedSource.height / 1080) * 100}%\`,
            border: '1px solid #ff0000',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            {/* 8-Point Resize Handles */}
            <div onMouseDown={e => handleHandleMouseDown(e, 'nw')} style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'nwse-resize' }} />
            <div onMouseDown={e => handleHandleMouseDown(e, 'ne')} style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'nesw-resize' }} />
            <div onMouseDown={e => handleHandleMouseDown(e, 'sw')} style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'nesw-resize' }} />
            <div onMouseDown={e => handleHandleMouseDown(e, 'se')} style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'nwse-resize' }} />
            
            <div onMouseDown={e => handleHandleMouseDown(e, 'n')} style={{ position: 'absolute', top: -5, left: 'calc(50% - 5px)', width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'ns-resize' }} />
            <div onMouseDown={e => handleHandleMouseDown(e, 's')} style={{ position: 'absolute', bottom: -5, left: 'calc(50% - 5px)', width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'ns-resize' }} />
            <div onMouseDown={e => handleHandleMouseDown(e, 'w')} style={{ position: 'absolute', top: 'calc(50% - 5px)', left: -5, width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'ew-resize' }} />
            <div onMouseDown={e => handleHandleMouseDown(e, 'e')} style={{ position: 'absolute', top: 'calc(50% - 5px)', right: -5, width: 10, height: 10, background: '#ff0000', border: '1px solid #fff', pointerEvents: 'auto', cursor: 'ew-resize' }} />
          </div>
        )}
`;

content = content.replace(/{\/\* Transform Overlay \*\/}[\s\S]*?<\/div>\s*<\/div>\s*\)}/, overlayReplacement.trim() + '\n      </div>');

// Add context menu for right click on Canvas
const contextMenuImports = `import { ContextMenu } from './ContextMenu'`;
if (!content.includes('ContextMenu')) {
  content = content.replace(/import { useBroadcast }/, `import { useBroadcast }\n${contextMenuImports}`);
}

const contextMenuState = `
  const [contextMenuPos, setContextMenuPos] = React.useState<{x: number, y: number} | null>(null)
  
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }
`;
if(!content.includes('handleCanvasContextMenu')) {
    content = content.replace(/const \[isDragging/, `${contextMenuState}\n  const [isDragging`);
}

content = content.replace(/onMouseDown={handleMouseDown}/, `onMouseDown={handleMouseDown}\n        onContextMenu={handleCanvasContextMenu}`);

const contextMenuRender = `
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
          items={[
            {
              label: 'Center to Screen',
              action: () => {
                if (selectedSourceId) {
                  const src = currentScene?.sources?.find(s => s.id === selectedSourceId)
                  if(src) updateSourceProperties(activeScene, selectedSourceId, { x: 1920/2 - src.width/2, y: 1080/2 - src.height/2 })
                }
              }
            },
            {
              label: 'Fit to Screen',
              action: () => {
                if (selectedSourceId) {
                  const src = currentScene?.sources?.find(s => s.id === selectedSourceId)
                  if(src) {
                    const scale = Math.min(1920 / src.width, 1080 / src.height)
                    updateSourceProperties(activeScene, selectedSourceId, {
                      x: 1920/2 - (src.width * scale)/2,
                      y: 1080/2 - (src.height * scale)/2,
                      width: src.width * scale,
                      height: src.height * scale
                    })
                  }
                }
              }
            },
            {
              label: 'Stretch to Screen',
              action: () => {
                if (selectedSourceId) updateSourceProperties(activeScene, selectedSourceId, { x: 0, y: 0, width: 1920, height: 1080 })
              }
            }
          ]}
        />
      )}
    </div>
  )
}
`;

content = content.replace(/<\/div>\s*\)\s*}\s*$/, contextMenuRender.trim());

fs.writeFileSync('src/components/PreviewMonitor.tsx', content);
console.log('PreviewMonitor patched.');
