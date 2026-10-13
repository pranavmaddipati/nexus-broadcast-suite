const fs = require('fs');

const replaceInFile = (file, searchRegex, replaceWith) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(searchRegex, replaceWith);
    fs.writeFileSync(file, content);
  }
}

// SceneSettingsModal
replaceInFile('src/components/SceneSettingsModal.tsx', /updateProgramFilterSettings\s*=\s*\[\]/g, 'updateProgramFilterSettings = () => {}');

// StatusBar
replaceInFile('src/components/StatusBar.tsx', /droppedFrames\s*=\s*\[\]/g, 'droppedFrames = 0');
replaceInFile('src/components/TopBar.tsx', /droppedFrames\s*=\s*\[\]/g, 'droppedFrames = 0');

// TransitionControls
replaceInFile('src/components/TransitionControls.tsx', /setTransitionType\(type\)/g, 'setTransitionType(type as TransitionType)');

console.log('Fixed fix11');
