const fs = require('fs');
const path = 'C:/Users/abhin/.gemini/antigravity-ide/brain/ab7095fc-d8b2-4a3d-bb24-684f2a97050a/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const chunks = [];

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
      if (text.includes('The following code has been modified') && text.includes('File Path: `file:///c:/broadcast-suite3/desktop-app/src/components/SourcesPanel.tsx`')) {
        const textLines = text.split('\n');
        let inCode = false;
        const currentChunk = [];
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
              currentChunk.push({ num: parseInt(match[1]), text: match[2] });
            }
          }
        }
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }
      }
    }
  } catch(e) {}
}

// We only want the chunks that belong to the SAME file version.
// The 11:29 version chunks will have the same 'Total Lines: 788' in their header.
// Let's just find the chunks that correspond to the 11:29 version.
// Wait, I can just use the latest chunk that has line 1, latest chunk that has line 250, etc.
// But they must be from the same version. Let's just get the last 3 chunks that correspond to 1-250, 250-450, 450-600.
// They were all retrieved sequentially.

const allLinesMap = new Map();

for (const chunk of chunks) {
  // We only want chunks that are from the 11:29 version. The 11:29 version had 788 lines.
  // Actually, we can just apply all chunks in order. The later chunks overwrite earlier ones.
  // Wait, if an old chunk comes later in the transcript? Unlikely, transcript is chronological.
  for (const line of chunk) {
    allLinesMap.set(line.num, line.text);
  }
}

// Wait, the 10:38 chunk was chronologically EARLIER. So the 11:29 chunks will overwrite the 1-600 lines correctly!
// BUT the 10:38 chunk had lines 601-614. So lines 601-614 will remain in the map!
// We can just filter out lines > 600!
for (const key of allLinesMap.keys()) {
  if (key > 600) {
    allLinesMap.delete(key);
  }
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
