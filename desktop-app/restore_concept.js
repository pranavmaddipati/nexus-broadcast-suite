
const fs = require('fs');
const path = 'C:/Users/abhin/.gemini/antigravity-ide/brain/4629d277-ef88-4ddf-a4a9-3a968f94edf5/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const filesToRestore = [
  'src/components/AudioMixer.tsx',
  'src/components/SystemOverviewPanel.tsx',
  'src/components/BroadcastHealthPanel.tsx',
  'src/components/AnalyticsPlaceholder.tsx',
  'src/index.css'
];

for (const targetFile of filesToRestore) {
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
        if (text.includes('The following code has been modified') && text.includes('File Path: \ile:///c:/broadcast-suite3/desktop-app/' + targetFile + '\')) {
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

  if (chunks.length > 0) {
    const allLinesMap = new Map();
    // We want the FIRST chunk (earliest in time, before I ruined it)
    for (const line of chunks[0]) {
      allLinesMap.set(line.num, line.text);
    }
    const maxLine = Math.max(0, ...Array.from(allLinesMap.keys()));
    const out = [];
    for (let i = 1; i <= maxLine; i++) {
      out.push(allLinesMap.has(i) ? allLinesMap.get(i) : '// MISSING LINE ' + i);
    }
    fs.writeFileSync('c:/broadcast-suite3/desktop-app/' + targetFile, out.join('\n'));
    console.log('Successfully recovered ' + targetFile);
  } else {
    console.log('No chunks found for ' + targetFile);
  }
}

