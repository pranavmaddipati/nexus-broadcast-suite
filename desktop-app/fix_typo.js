const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = [
  'InspectorPanel.tsx',
  'PinnedScenes.tsx',
  'SceneLibrary.tsx',
  'SourcesPanel.tsx',
  'VirtualCameraSettingsModal.tsx',
  'VmixInputCard.tsx'
];

for (const file of files) {
    const filePath = path.join(componentsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Fix the corrupted lineHeight. For example: lineHeight: '1.2'4' -> lineHeight: '1.2'
        // or lineHeight: '1.2'al' -> lineHeight: '1.2'
        let newContent = content.replace(/lineHeight:\s*'1\.2'[^,}\s]*/g, "lineHeight: '1.2'");
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Fixed ${file}`);
        }
    }
}
