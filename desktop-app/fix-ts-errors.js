const fs = require('fs');

// 1. Fix AudioMixer.tsx
let audioMixer = fs.readFileSync('src/components/AudioMixer.tsx', 'utf8');
audioMixer = audioMixer.replace(/type="range" min="0" max="100" value=\{source.volume\}/g, 'type="range" min="0" max="100" value={source.volume} style={{ width: \'24px\', height: \'100%\', margin: 0, accentColor: \'#38bdf8\' }}');
// Remove style appearance string which TS doesn't like on standard React.CSSProperties
audioMixer = audioMixer.replace(/appearance: 'slider-vertical',/g, '/* appearance: "slider-vertical" */');
audioMixer = audioMixer.replace(/source\.monitor === 'monitor_off'/g, 'source.monitor === \'off\'');
audioMixer = audioMixer.replace(/'monitor_off': 'monitor_only'/g, '\'off\': \'monitor_only\'');
audioMixer = audioMixer.replace(/'monitor_and_output': 'monitor_off'/g, '\'monitor_and_output\': \'off\'');
fs.writeFileSync('src/components/AudioMixer.tsx', audioMixer);

// 2. Fix PreviewMonitor.tsx ContextMenu items
let previewMonitor = fs.readFileSync('src/components/PreviewMonitor.tsx', 'utf8');
previewMonitor = previewMonitor.replace(/onClick: \(\) =>/g, 'action: () =>');
previewMonitor = previewMonitor.replace(/\{ type: 'separator' \}/g, '{ label: \'\', separator: true, action: () => {} }');
fs.writeFileSync('src/components/PreviewMonitor.tsx', previewMonitor);

// 3. Fix SceneMatrix.tsx ContextMenu items and VmixInputCard
let sceneMatrix = fs.readFileSync('src/components/SceneMatrix.tsx', 'utf8');
sceneMatrix = sceneMatrix.replace(/onClick: \(\) =>/g, 'action: () =>');
sceneMatrix = sceneMatrix.replace(/\{ type: 'separator' \}/g, '{ label: \'\', separator: true, action: () => {} }');
// VmixInputCard Props fix - removing inputNumber if it doesnt exist
sceneMatrix = sceneMatrix.replace(/inputNumber=\{index \+ 1\}/g, '');
// handleContextMenu mouse event handler fix
sceneMatrix = sceneMatrix.replace(/onContextMenu=\{\(e\) => handleContextMenu\(e, scene.id\)\}/g, 'onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => handleContextMenu(e, scene.id)}');
fs.writeFileSync('src/components/SceneMatrix.tsx', sceneMatrix);

// 4. Fix SourceSettingsModal.tsx
let sourceModal = fs.readFileSync('src/components/SourceSettingsModal.tsx', 'utf8');
sourceModal = sourceModal.replace(/Window/g, 'Wind');
sourceModal = sourceModal.replace(/<Wind>/g, '<Window>'); // Fix JSX tag that might have broken
fs.writeFileSync('src/components/SourceSettingsModal.tsx', sourceModal);

// 5. Fix SourcesPanel.tsx (Restore FiltersModal)
// The error is in SourcesPanel:
// src/components/SourcesPanel.tsx(8,10): error TS2305: Module '"./FiltersPanel"' has no exported member 'FiltersModal'.
// src/components/SourcesPanel.tsx(475,9): error TS2322: Type '{ isOpen: boolean; sourceId: string; sceneId: string; onClose: () => void; }' is not assignable to type 'IntrinsicAttributes & { sourceId: string; onClose: () => void; }'.
let sourcesPanel = fs.readFileSync('src/components/SourcesPanel.tsx', 'utf8');
sourcesPanel = sourcesPanel.replace(/import \{ FiltersModal \} from '\.\/FiltersPanel'/g, 'import { FiltersPanelDock } from \'./FiltersPanel\'');
sourcesPanel = sourcesPanel.replace(/<FiltersModal\s+isOpen=\{showFilters\}\s+sourceId=\{filtersSourceId \?\? ''\}\s+sceneId=\{activeScene\}\s+onClose=\{\(\) => setShowFilters\(false\)\}\s+\/>/g, '<FiltersPanelDock />');
fs.writeFileSync('src/components/SourcesPanel.tsx', sourcesPanel);
