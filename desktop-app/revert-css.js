const fs = require('fs');

// 1. App.tsx
let tsx = fs.readFileSync('src/App.tsx', 'utf8');

// Revert Transition Panel width
tsx = tsx.replace(/width: "140px"/, 'width: "120px"');

// Bust react-resizable-panels cache by appending -v2 to PanelGroup IDs
tsx = tsx.replace(/id="main-workspace-horizontal"/g, 'id="main-workspace-horizontal-v2"');
tsx = tsx.replace(/id="left-column-vertical"/g, 'id="left-column-vertical-v2"');
tsx = tsx.replace(/id="center-column-vertical"/g, 'id="center-column-vertical-v2"');
tsx = tsx.replace(/id="bottom-tools-horizontal"/g, 'id="bottom-tools-horizontal-v2"');
tsx = tsx.replace(/id="right-column-vertical"/g, 'id="right-column-vertical-v2"');

fs.writeFileSync('src/App.tsx', tsx);


// 2. AudioMixer.tsx (Revert Master meter width)
let audioMixer = fs.readFileSync('src/components/AudioMixer.tsx', 'utf8');
audioMixer = audioMixer.replace(/width: '45px', minWidth: '45px', background: '#0f131f', border: '1px solid #3b82f6'/g, "width: '65px', minWidth: '65px', background: '#0f131f', border: '1px solid #3b82f6'");
fs.writeFileSync('src/components/AudioMixer.tsx', audioMixer);


// 3. InspectorPanel.tsx (Revert Internal spacing)
let inspector = fs.readFileSync('src/components/InspectorPanel.tsx', 'utf8');
inspector = inspector.replace(/padding: '8px'/g, "padding: '16px'");
inspector = inspector.replace(/gap: '8px'/g, "gap: '12px'");
fs.writeFileSync('src/components/InspectorPanel.tsx', inspector);

console.log('Reverted styling changes and updated PanelGroup IDs to bust cache.');
