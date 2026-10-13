const fs = require('fs');

// --- Patch TransitionControls.tsx ---
let controlsContent = fs.readFileSync('src/components/TransitionControls.tsx', 'utf8');

const newGridJSX = `
      {/* Transition Type Buttons Grid */}
      <div className="transition-types-grid" style={{ width: '100%', marginTop: '6px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
        {['cut', 'fade', 'merge', 'slide', 'push', 'zoom', 'wipe', 'cube', 'stinger'].map(type => (
          <button
            key={type}
            className="trans-btn"
            style={{ fontSize: '7.5px', padding: '4px 0', background: 'var(--bg-panel)' }}
            onClick={() => {
              setTransitionType(type)
              if (type === 'cut') takeLive()
              else autoTransition()
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
`;

// Replace the entire div block. 
controlsContent = controlsContent.replace(/<div className="transition-types-grid"[\s\S]*?<\/div>/, newGridJSX.trim());
fs.writeFileSync('src/components/TransitionControls.tsx', controlsContent);


// --- Patch BroadcastContext.tsx ---
let contextContent = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

const newTransitionsLogic = `
            if (transitionType === 'fade') {
              pCtx.save()
              pCtx.globalAlpha = 1.0 - transitionProgress
              pCtx.drawImage(bufferCanvas, 0, 0)
              pCtx.restore()

              pCtx.save()
              pCtx.globalAlpha = transitionProgress
              renderScene(pCtx, liveSc, time)
              pCtx.restore()
            } else if (transitionType === 'zoom') {
              pCtx.save()
              pCtx.globalAlpha = 1.0 - transitionProgress
              pCtx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
              pCtx.scale(1.0 + transitionProgress * 0.5, 1.0 + transitionProgress * 0.5)
              pCtx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2)
              pCtx.drawImage(bufferCanvas, 0, 0)
              pCtx.restore()

              pCtx.save()
              pCtx.globalAlpha = transitionProgress
              pCtx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
              pCtx.scale(0.5 + transitionProgress * 0.5, 0.5 + transitionProgress * 0.5)
              pCtx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2)
              renderScene(pCtx, liveSc, time)
              pCtx.restore()
            } else if (transitionType === 'merge') {
              pCtx.save()
              pCtx.globalAlpha = 1.0 - transitionProgress
              pCtx.drawImage(bufferCanvas, 0, 0)
              pCtx.restore()

              pCtx.save()
              pCtx.globalAlpha = transitionProgress
              pCtx.translate(0, CANVAS_HEIGHT * 0.1 * (1.0 - transitionProgress))
              renderScene(pCtx, liveSc, time)
              pCtx.restore()
            } else if (transitionType === 'slide') {
              pCtx.drawImage(bufferCanvas, 0, 0)
              pCtx.save()
              pCtx.translate(CANVAS_WIDTH * (1.0 - transitionProgress), 0)
              renderScene(pCtx, liveSc, time)
              pCtx.restore()
            } else if (transitionType === 'push') {
              pCtx.save()
              pCtx.translate(-CANVAS_WIDTH * transitionProgress, 0)
              pCtx.drawImage(bufferCanvas, 0, 0)
              pCtx.restore()

              pCtx.save()
              pCtx.translate(CANVAS_WIDTH * (1.0 - transitionProgress), 0)
              renderScene(pCtx, liveSc, time)
              pCtx.restore()
            } else if (transitionType === 'cube') {
              // Simulated 2D Cube Spin
              const offset = CANVAS_WIDTH * transitionProgress;
              
              pCtx.save();
              pCtx.globalAlpha = Math.max(0, 1.0 - transitionProgress * 1.5);
              pCtx.translate(-offset * 0.5, 0);
              pCtx.scale(1.0 - transitionProgress * 0.2, 1.0 - transitionProgress * 0.2);
              pCtx.drawImage(bufferCanvas, 0, 0);
              pCtx.restore();

              pCtx.save();
              pCtx.globalAlpha = Math.min(1.0, transitionProgress * 1.5);
              pCtx.translate(CANVAS_WIDTH - offset, 0);
              pCtx.scale(0.8 + transitionProgress * 0.2, 0.8 + transitionProgress * 0.2);
              renderScene(pCtx, liveSc, time);
              pCtx.restore();
            } else if (transitionType === 'stinger') {
              pCtx.drawImage(bufferCanvas, 0, 0)
              renderScene(pCtx, liveSc, time)
              
              // Fake stinger alpha mask
              pCtx.save()
              pCtx.globalCompositeOperation = 'destination-in'
              pCtx.fillStyle = \`rgba(0,0,0,\${transitionProgress > 0.5 ? 1.0 : 0.0})\`
              pCtx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
              pCtx.restore()

              // Draw Stinger graphic over top
              pCtx.save()
              pCtx.fillStyle = 'rgba(56, 189, 248, 1.0)'
              pCtx.translate(CANVAS_WIDTH * 2 * transitionProgress - CANVAS_WIDTH, 0)
              pCtx.beginPath()
              pCtx.moveTo(0, 0)
              pCtx.lineTo(CANVAS_WIDTH, 0)
              pCtx.lineTo(CANVAS_WIDTH - 200, CANVAS_HEIGHT)
              pCtx.lineTo(-200, CANVAS_HEIGHT)
              pCtx.fill()
              pCtx.restore()
            } else if (transitionType === 'wipe') {
              pCtx.drawImage(bufferCanvas, 0, 0)
              pCtx.save()
              pCtx.beginPath()
              pCtx.rect(0, 0, CANVAS_WIDTH * transitionProgress, CANVAS_HEIGHT)
              pCtx.clip()
              renderScene(pCtx, liveSc, time)
              pCtx.restore()
            } else {
              renderScene(pCtx, liveSc, time)
            }
`;

contextContent = contextContent.replace(/if \(transitionType === 'fade'\) \{[\s\S]*?\} else \{\s*renderScene\(pCtx, liveSc, time\)\s*\}/, newTransitionsLogic.trim());
fs.writeFileSync('src/context/BroadcastContext.tsx', contextContent);

console.log("Transitions patched!");
