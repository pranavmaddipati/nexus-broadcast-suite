const fs = require('fs');

const replaceInFile = (file, searchRegex, replaceWith) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(searchRegex, replaceWith);
    fs.writeFileSync(file, content);
  }
}

// App.tsx
replaceInFile('src/App.tsx', /setDocks\s*=\s*\[\]/g, 'setDocks = () => {}');
replaceInFile('src/App.tsx', /setLeftDocks\s*=\s*\[\]/g, 'setLeftDocks = () => {}');
replaceInFile('src/App.tsx', /setRightDocks\s*=\s*\[\]/g, 'setRightDocks = () => {}');
replaceInFile('src/App.tsx', /setBottomDocks\s*=\s*\[\]/g, 'setBottomDocks = () => {}');

// OutputSettingsModal.tsx
replaceInFile('src/components/OutputSettingsModal.tsx', /updateOutputSettings\s*=\s*\[\]/g, 'updateOutputSettings = () => {}');
replaceInFile('src/components/OutputSettingsModal.tsx', /updateVirtualCameraSettings\s*=\s*\[\]/g, 'updateVirtualCameraSettings = () => {}');

// SceneSettingsModal.tsx
replaceInFile('src/components/SceneSettingsModal.tsx', /updateSceneSettings\s*=\s*\[\]/g, 'updateSceneSettings = () => {}');

// StatusBar.tsx
replaceInFile('src/components/StatusBar.tsx', /cpuUsage >/g, '(cpuUsage as number) >');
replaceInFile('src/components/StatusBar.tsx', /gpuUsage >/g, '(gpuUsage as number) >');

// TopBar.tsx
replaceInFile('src/components/TopBar.tsx', /cpuUsage </g, '(cpuUsage as number) <');
replaceInFile('src/components/TopBar.tsx', /cpuUsage >/g, '(cpuUsage as number) >');
replaceInFile('src/components/TopBar.tsx', /gpuUsage </g, '(gpuUsage as number) <');

// TransitionControls.tsx
// error TS2345: Argument of type 'string' is not assignable to parameter of type 'TransitionType'.
// It's probably `setTransitionType(e.target.value)` inside a select onChange.
replaceInFile('src/components/TransitionControls.tsx', /setTransitionType\(e\.target\.value\)/g, 'setTransitionType(e.target.value as TransitionType)');

console.log('Fixed fix10');
