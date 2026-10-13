const fs = require('fs')

let css = fs.readFileSync('src/App.css', 'utf-8')

// Add CSS for monitor controls and update borders
const newStyles = `
/* New Monitor Styles */
.monitor-controls {
  display: flex;
  gap: 4px;
}

.monitor-control-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.monitor-control-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.monitor-screen.preview-tally {
  border: 1px solid #00d084 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 208, 132, 0.15) !important;
}

.monitor-screen.program-tally {
  border: 1px solid #ff4d4f !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 77, 79, 0.15) !important;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 100;
  pointer-events: auto; /* Allow clicking buttons */
}
`

if (!css.includes('.monitor-control-btn')) {
  css += '\n' + newStyles
} else {
  // Just in case it's there
  css = css.replace(/\.monitor-screen\.preview-tally \{[\s\S]*?\}/, '.monitor-screen.preview-tally { border: 1px solid #00d084 !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 208, 132, 0.15) !important; }')
  css = css.replace(/\.monitor-screen\.program-tally \{[\s\S]*?\}/, '.monitor-screen.program-tally { border: 1px solid #ff4d4f !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 77, 79, 0.15) !important; }')
}

// Let's explicitly replace the old tally classes to prevent conflicts
css = css.replace(/\.monitor-screen\.preview-tally\s*\{[^}]+\}/g, '')
css = css.replace(/\.monitor-screen\.program-tally\s*\{[^}]+\}/g, '')
// Add the new ones again just to be safe
css += `
.monitor-screen.preview-tally {
  border: 1px solid #00d084 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 208, 132, 0.15) !important;
}
.monitor-screen.program-tally {
  border: 1px solid #ff4d4f !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 77, 79, 0.15) !important;
}
`

fs.writeFileSync('src/App.css', css)
console.log('Update completed')
