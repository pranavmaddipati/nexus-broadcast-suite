const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

css = css.replace(/\.monitor-container\s*\{[\s\S]*?\}/, '.monitor-container {\n  display: flex;\n  flex-direction: column;\n  background: linear-gradient(135deg, var(--bg-panel) 0%, #0a0e1a 100%);\n  border: 1px solid rgba(56, 189, 248, 0.15);\n  border-radius: 6px;\n  padding: 8px;\n  height: 100%;\n  min-height: 0;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);\n  box-sizing: border-box;\n}');

css = css.replace(/\.monitor-header\s*\{[\s\S]*?\}/, '.monitor-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0px;\n  height: 18px;\n  flex-shrink: 0;\n}');

css = css.replace(/\.monitor-screen\s*\{[\s\S]*?\}/, '.monitor-screen {\n  flex: 1;\n  width: 100%;\n  height: 100%;\n  min-width: 0;\n  min-height: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #020408;\n  border-radius: 3px;\n  overflow: hidden;\n  position: relative;\n  border: 1.5px solid transparent;\n  box-sizing: border-box;\n}');

css = css.replace(/\.monitor-video,\s*\.program-canvas-render\s*\{[\s\S]*?\}/, '.monitor-video,\n.program-canvas-render {\n  max-width: 100%;\n  max-height: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: contain;\n}');

// Let's also verify that there are no calc(100vh - ...) and calc(100vw - ...) in App.css left
css = css.replace(/height:\s*calc\(100vh.*?\);/g, 'height: 100%;\n  flex: 1;');
css = css.replace(/width:\s*calc\(100vw.*?\);/g, 'width: 100%;\n  flex: 1;');
css = css.replace(/max-height:\s*calc\(100vh.*?\);/g, 'max-height: 100%;');

fs.writeFileSync('src/App.css', css);
console.log('Monitor CSS patched.');
