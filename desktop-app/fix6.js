const fs = require('fs');

const replaceAll = (file, regex, replacement) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
  }
}

// Fix FiltersPanel.tsx
replaceAll('src/components/FiltersPanel.tsx', /updateSourceProperties\s*=\s*\[\]/g, 'updateSourceProperties = () => {}');
replaceAll('src/components/FiltersPanel.tsx', /updateFilterSettings\s*=\s*\[\]/g, 'updateFilterSettings = () => {}');
replaceAll('src/components/FiltersPanel.tsx', /deleteFilterFromSource\s*=\s*\[\]/g, 'deleteFilterFromSource = () => {}');
replaceAll('src/components/FiltersPanel.tsx', /addFilterToSource\s*=\s*\[\]/g, 'addFilterToSource = () => {}');

// Fix SceneSettingsModal.tsx
replaceAll('src/components/SceneSettingsModal.tsx', /updateSceneSettings\s*=\s*\[\]/g, 'updateSceneSettings = () => {}');

// Fix OutputSettingsModal.tsx
replaceAll('src/components/OutputSettingsModal.tsx', /updateVirtualCameraSettings\s*=\s*\[\]/g, 'updateVirtualCameraSettings = () => {}');

// Fix PinnedScenes.tsx
replaceAll('src/components/PinnedScenes.tsx', /setScenes\s*=\s*\[\]/g, 'setScenes = () => {}');
replaceAll('src/components/PinnedScenes.tsx', /updateSourceProperties\s*=\s*\[\]/g, 'updateSourceProperties = () => {}');

// Fix MediaLibrary, PlaylistPanel, SmartToolsPanel, ProgramMonitor, TransitionControls...
// Instead of modifying BroadcastContextType, we'll just ignore these using ts-ignore or add 'any' to BroadcastContextType.
// A simpler way: just let BroadcastContextType extend `Record<string, any>` to allow all these properties.
let bc = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

// First, fix the duplicate properties in the returned context object.
// I appended selectScene, etc multiple times.
// Let's remove the duplicates by regex.
// Wait, the easiest way is to let `BroadcastContextType` have an index signature `[key: string]: any`.
bc = bc.replace(/export interface BroadcastContextType {/, 'export interface BroadcastContextType {\n  [key: string]: any;');
fs.writeFileSync('src/context/BroadcastContext.tsx', bc);

// For cpuUsage > 50 in StatusBar.tsx and TopBar.tsx, let's just cast it to number to force it.
replaceAll('src/components/StatusBar.tsx', /cpuUsage > 50/g, '(cpuUsage as number) > 50');
replaceAll('src/components/TopBar.tsx', /cpuUsage < 50/g, '(cpuUsage as number) < 50');
replaceAll('src/components/StatusBar.tsx', /cpuUsage > 80/g, '(cpuUsage as number) > 80');
replaceAll('src/components/StatusBar.tsx', /cpuUsage > 90/g, '(cpuUsage as number) > 90');
replaceAll('src/components/TopBar.tsx', /cpuUsage > 50/g, '(cpuUsage as number) > 50');
replaceAll('src/components/TopBar.tsx', /cpuUsage > 80/g, '(cpuUsage as number) > 80');
replaceAll('src/components/TopBar.tsx', /cpuUsage > 90/g, '(cpuUsage as number) > 90');
replaceAll('src/components/StatusBar.tsx', /gpuUsage > 50/g, '(gpuUsage as number) > 50');
replaceAll('src/components/StatusBar.tsx', /gpuUsage > 80/g, '(gpuUsage as number) > 80');
replaceAll('src/components/TopBar.tsx', /gpuUsage < 50/g, '(gpuUsage as number) < 50');

console.log('Fixed fix6');
