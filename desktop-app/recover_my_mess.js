const fs = require('fs');
const path = 'C:/Users/abhin/.gemini/antigravity-ide/brain/f4354cd9-4fcf-48af-833a-b44b6b098ea2/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const filesToRecover = [
  'PinnedScenes.tsx',
  'TransitionControls.tsx',
  'AudioMixer.tsx',
  'LiveSettingsPanel.tsx',
  'SmartToolsPanel.tsx',
  'PreviewMonitor.tsx',
  'ProgramMonitor.tsx',
  'App.tsx',
  'index.css'
];

let recovered = new Set();

// Iterate backwards to get the earliest occurrence of the file in the transcript 
// Wait, actually I want the earliest occurrence! So iterate forwards.
for (const line of lines) {
  if (!line) continue;
  
  // Just use raw string manipulation
  for (const f of filesToRecover) {
      if (recovered.has(f)) continue;
      
      const searchStr = `file:///c:/broadcast-suite3/desktop-app/src/${f === 'App.tsx' || f === 'index.css' ? '' : 'components/'}${f}`;
      const lowerSearchStr = searchStr.toLowerCase();
      
      if (line.toLowerCase().includes(lowerSearchStr) && line.includes('Showing lines 1 to')) {
         
         try {
             const obj = JSON.parse(line);
             // find the string that has the content
             let text = JSON.stringify(obj); 
             
             // The string has "\\n" since it's JSON encoded.
             // We need to parse it to get real newlines.
             let actualText = '';
             if (obj.content && typeof obj.content === 'string' && obj.content.toLowerCase().includes(lowerSearchStr)) {
                 actualText = obj.content;
             } else if (obj.output && typeof obj.output === 'string' && obj.output.toLowerCase().includes(lowerSearchStr)) {
                 actualText = obj.output;
             } else {
                 // deep search
                 const findText = (node) => {
                     if (typeof node === 'string' && node.toLowerCase().includes(lowerSearchStr) && node.includes('Showing lines 1 to')) {
                         return node;
                     }
                     if (typeof node === 'object' && node !== null) {
                         for (let k in node) {
                             let res = findText(node[k]);
                             if (res) return res;
                         }
                     }
                     return null;
                 };
                 actualText = findText(obj);
             }
             
             if (actualText) {
                 const outLines = actualText.split(/\r?\n/);
                 let codeLines = [];
                 for (const l of outLines) {
                    const match = l.match(/^\d+:\s(.*)/);
                    if (match) {
                        codeLines.push(match[1]);
                    }
                 }
                 if (codeLines.length > 0) {
                     let p = `c:/broadcast-suite3/desktop-app/src/${f === 'App.tsx' || f === 'index.css' ? '' : 'components/'}${f}`;
                     fs.writeFileSync(p, codeLines.join('\n'));
                     console.log('Recovered', f, 'lines:', codeLines.length);
                     recovered.add(f);
                 }
             }
         } catch(e) {}
      }
  }
}
