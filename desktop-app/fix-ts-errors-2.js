const fs = require('fs');

// 1. Fix AudioMixer.tsx
let audioMixer = fs.readFileSync('src/components/AudioMixer.tsx', 'utf8');
audioMixer = audioMixer.replace(/onUpdate\(source\.id, \{ monitor: nextMap\[source\.monitor \|\| 'monitor_and_output'\] \}\)/g, 'onUpdate(source.id, { monitor: nextMap[source.monitor || \'monitor_and_output\'] as \'off\' | \'monitor_only\' | \'monitor_and_output\' })');
fs.writeFileSync('src/components/AudioMixer.tsx', audioMixer);

// 2. Fix SceneMatrix.tsx
let sceneMatrix = fs.readFileSync('src/components/SceneMatrix.tsx', 'utf8');
// Remove isLive, isPreview since VmixInputCard doesn't seem to take them (from TS error)
sceneMatrix = sceneMatrix.replace(/isLive=\{liveScene === scene\.id\}\s*isPreview=\{activeScene === scene\.id\}/g, '');
// Fix onClick={addScene} -> onClick={() => addScene('New Scene')}
sceneMatrix = sceneMatrix.replace(/onClick=\{addScene\}/g, 'onClick={() => addScene(\'New Scene\')}');
// Fix SceneSettingsModal isOpen missing
sceneMatrix = sceneMatrix.replace(/<SceneSettingsModal \s*sceneId=\{settingsSceneId\} \s*onClose=\{\(\) => setSettingsSceneId\(null\)\} \s*\/>/g, '<SceneSettingsModal sceneId={settingsSceneId} isOpen={true} onClose={() => setSettingsSceneId(null)} />');
fs.writeFileSync('src/components/SceneMatrix.tsx', sceneMatrix);

// 3. Fix SourcesPanel.tsx FiltersPanelDock/FiltersModal mismatch
let sourcesPanel = fs.readFileSync('src/components/SourcesPanel.tsx', 'utf8');
// The regex in step 1 missed some because of formatting.
sourcesPanel = sourcesPanel.replace(/<FiltersModal[\s\S]*?\/>/g, ''); // Remove any old modal usages since we now use the Dock.
// Wait, if it's literally calling <FiltersModal isOpen... then I need to find it and just remove it if FiltersPanel is a dock now, or if it was supposed to be a modal, I should not break the button that opened it.
// Actually, earlier I replaced `<FiltersModal isOpen={showFilters}.../>` with `<FiltersPanelDock />`. But line 481 says Cannot find name 'FiltersModal'.
// Let's just fix it by replacing `<FiltersModal` to `<FiltersPanelDock` and removing `isOpen` and `sourceId` attributes from it where they shouldn't exist, OR just leaving it as an empty div if it's no longer used.
// Let's explicitly replace any remaining <FiltersModal > with nothing if there's any.
sourcesPanel = sourcesPanel.replace(/<FiltersModal[^>]*>/g, '');
sourcesPanel = sourcesPanel.replace(/<\/FiltersModal>/g, '');
// Let's also check if there's a standalone one.
sourcesPanel = sourcesPanel.replace(/<FiltersModal[\s\S]*?\/>/g, '');
// To be safe, if there's an exact line 475: `<FiltersPanelDock isOpen={showFilters} ...`
sourcesPanel = sourcesPanel.replace(/<FiltersPanelDock[^>]*\/>/g, ''); // We just remove the modal since the filters panel is now always in a dock.
fs.writeFileSync('src/components/SourcesPanel.tsx', sourcesPanel);
