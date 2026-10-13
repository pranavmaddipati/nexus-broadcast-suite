const fs = require('fs');

function extractLinesMap(filename) {
  if (!fs.existsSync(filename)) return new Map();
  const raw = fs.readFileSync(filename, 'utf8');
  let content = raw;
  try {
    // If it's a JSON string like "..." it will parse into an actual string with newlines
    content = JSON.parse(raw);
  } catch (e) {
    // If it's not valid JSON, maybe it's just raw text that happens to have \\n
    content = raw.replace(/\\n/g, '\n');
  }

  const lines = content.split('\n');
  const map = new Map();
  for (const line of lines) {
    const match = line.match(/^(\d+):\s(.*)$/);
    if (match) {
      map.set(parseInt(match[1]), match[2]);
    }
  }
  return map;
}

const map1 = extractLinesMap('c:/broadcast-suite3/desktop-app/recovery1.txt');
const map2 = extractLinesMap('c:/broadcast-suite3/desktop-app/recovery2.txt');
const map3 = extractLinesMap('c:/broadcast-suite3/desktop-app/recovery3.txt');

const allLinesMap = new Map([...map1, ...map2, ...map3]);
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
console.log('Stitched ' + out.length + ' lines successfully.');
