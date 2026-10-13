const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Scene Matrix panel height reduction (panel-workspace)
content = content.replace(/<Panel id="panel-workspace" order=\{2\} defaultSize=\{15\} minSize=\{10\}>/, '<Panel id="panel-workspace" order={2} defaultSize={10} minSize={5}>');

// 2. Inspector collapsible & resize limits
content = content.replace(/<Panel id="right-column" order=\{3\} defaultSize=\{19\} minSize=\{15\} maxSize=\{30\}>/, '<Panel id="right-column" order={3} defaultSize={18} minSize={10} maxSize={35} collapsible={true}>');

content = content.replace(/<Panel id="panel-properties" order=\{1\} defaultSize=\{52\} minSize=\{20\}>/, '<Panel id="panel-properties" order={1} defaultSize={52} minSize={5} collapsible={true}>');

// 3. Audio Mixer collapsibility
content = content.replace(/<Panel id="panel-audio-mixer" order=\{2\} defaultSize=\{48\} minSize=\{20\}>/, '<Panel id="panel-audio-mixer" order={2} defaultSize={48} minSize={10} collapsible={true}>');

// Ensure other docks are collapsible to maximize workspace
content = content.replace(/<Panel id="panel-scene-library" order=\{1\} defaultSize=\{25\} minSize=\{10\}>/, '<Panel id="panel-scene-library" order={1} defaultSize={20} minSize={5} collapsible={true}>');
content = content.replace(/<Panel id="panel-sources" order=\{2\} defaultSize=\{25\} minSize=\{10\}>/, '<Panel id="panel-sources" order={2} defaultSize={20} minSize={5} collapsible={true}>');
content = content.replace(/<Panel id="panel-audio-mixer-scene" order=\{3\} defaultSize=\{25\} minSize=\{10\}>/, '<Panel id="panel-audio-mixer-scene" order={3} defaultSize={25} minSize={10} collapsible={true}>');
content = content.replace(/<Panel id="panel-filters" order=\{4\} defaultSize=\{25\} minSize=\{10\}>/, '<Panel id="panel-filters" order={4} defaultSize={20} minSize={10} collapsible={true}>');
content = content.replace(/<Panel id="panel-smart-tools" order=\{5\} defaultSize=\{25\} minSize=\{10\}>/, '<Panel id="panel-smart-tools" order={5} defaultSize={20} minSize={10} collapsible={true}>');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched for panel resizes and collapsibility');
