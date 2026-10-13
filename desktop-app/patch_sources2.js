const fs = require('fs');
const path = 'c:\\broadcast-suite3\\desktop-app\\src\\components\\SourcesPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('Bring Forward')) {
  content = content.replace(
    /options=\{\[\s*\{\s*label: 'Duplicate',/,
    `options={[
          { label: 'Bring Forward', action: () => contextMenuSourceId && bringForward(contextMenuSourceId) },
          { label: 'Bring To Front', action: () => contextMenuSourceId && bringToFront(contextMenuSourceId) },
          { label: 'Send Backward', action: () => contextMenuSourceId && sendBackward(contextMenuSourceId) },
          { label: 'Send To Back', action: () => contextMenuSourceId && sendToBack(contextMenuSourceId) },
          { label: 'Duplicate',`
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched SourcesPanel ContextMenu.');
