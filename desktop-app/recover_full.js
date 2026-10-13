const fs = require('fs');
const path = 'C:/Users/abhin/.gemini/antigravity-ide/brain/ab7095fc-d8b2-4a3d-bb24-684f2a97050a/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const allLinesMap = new Map();

for (const line of lines) {
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    
    let contentsToCheck = [];
    if (obj.content && typeof obj.content === 'string') {
      contentsToCheck.push(obj.content);
    } else if (obj.content && Array.isArray(obj.content)) {
      for (const item of obj.content) {
        if (item.output) contentsToCheck.push(item.output);
        if (item.text) contentsToCheck.push(item.text);
      }
    }

    for (const text of contentsToCheck) {
      if (text.includes('The following code has been modified') && text.includes('SourcesPanel.tsx')) {
        const textLines = text.split('\n');
        let inCode = false;
        for (const l of textLines) {
          if (l.includes('The following code has been modified')) {
            inCode = true;
            continue;
          }
          if (l.includes('The above content does NOT show') || l.includes('The above content shows the entire')) {
            inCode = false;
          }
          if (inCode) {
            const match = l.match(/^(\d+):\s(.*)$/);
            if (match) {
              allLinesMap.set(parseInt(match[1]), match[2]);
            }
          }
        }
      }
    }
  } catch(e) {}
}

const maxLine = Math.max(0, ...Array.from(allLinesMap.keys()));

const out = [];
for (let i = 1; i <= maxLine; i++) {
  if (allLinesMap.has(i)) {
    out.push(allLinesMap.get(i));
  } else {
    out.push('// MISSING LINE ' + i);
  }
}

fs.writeFileSync('c:/broadcast-suite3/desktop-app/src/components/SourcesPanel.tsx', out.join('\n'));
console.log('Successfully recovered SourcesPanel.tsx with ' + out.length + ' lines.');
