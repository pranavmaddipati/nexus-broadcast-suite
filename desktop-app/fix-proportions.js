const fs = require('fs');

// 1. App.tsx
let tsx = fs.readFileSync('src/App.tsx', 'utf8');

// Left Column
tsx = tsx.replace(/<Panel id="left-column" order=\{1\} defaultSize=\{14\} minSize=\{5\} maxSize=\{30\}/, '<Panel id="left-column" order={1} defaultSize={14} minSize={5} maxSize={30}');

// Center Column
tsx = tsx.replace(/<Panel id="center-column" order=\{2\} defaultSize=\{66\} minSize=\{30\}>/, '<Panel id="center-column" order={2} defaultSize={67} minSize={30}>');

// Right Column
tsx = tsx.replace(/<Panel id="right-column" order=\{3\} defaultSize=\{20\} minSize=\{15\} maxSize=\{30\}>/, '<Panel id="right-column" order={3} defaultSize={19} minSize={15} maxSize={30}>');

// Panel Monitors
tsx = tsx.replace(/<Panel id="panel-monitors" order=\{1\} defaultSize=\{55\} minSize=\{20\}>/, '<Panel id="panel-monitors" order={1} defaultSize={58} minSize={20}>');

// Scene Matrix
tsx = tsx.replace(/<Panel id="panel-workspace" order=\{2\} defaultSize=\{20\} minSize=\{10\}>/, '<Panel id="panel-workspace" order={2} defaultSize={17} minSize={10}>');

// Bottom Tools
tsx = tsx.replace(/<Panel id="panel-bottom-tools" order=\{3\} defaultSize=\{25\} minSize=\{15\}>/, '<Panel id="panel-bottom-tools" order={3} defaultSize={25} minSize={15}>');

// Inspector (Properties)
tsx = tsx.replace(/<Panel id="panel-properties" order=\{1\} defaultSize=\{50\} minSize=\{20\}>/, '<Panel id="panel-properties" order={1} defaultSize={52} minSize={20}>');

// Audio Mixer (in right dock)
tsx = tsx.replace(/<Panel id="panel-audio-mixer" order=\{2\} defaultSize=\{50\} minSize=\{20\}>/, '<Panel id="panel-audio-mixer" order={2} defaultSize={48} minSize={20}>');

// Transition Panel width
tsx = tsx.replace(/width: "120px"/, 'width: "140px"');

fs.writeFileSync('src/App.tsx', tsx);


// 2. AudioMixer.tsx (Master meter width)
let audioMixer = fs.readFileSync('src/components/AudioMixer.tsx', 'utf8');
audioMixer = audioMixer.replace(/width: '65px', minWidth: '65px', background: '#0f131f', border: '1px solid #3b82f6'/g, "width: '45px', minWidth: '45px', background: '#0f131f', border: '1px solid #3b82f6'");
fs.writeFileSync('src/components/AudioMixer.tsx', audioMixer);


// 3. InspectorPanel.tsx (Internal spacing)
let inspector = fs.readFileSync('src/components/InspectorPanel.tsx', 'utf8');
inspector = inspector.replace(/padding: '16px'/g, "padding: '8px'");
inspector = inspector.replace(/gap: '12px'/g, "gap: '8px'");
fs.writeFileSync('src/components/InspectorPanel.tsx', inspector);

console.log('Layout percentages and proportions adjusted successfully.');
