const fs = require('fs');
const file = 'src/context/BroadcastContext.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('(. || )')) {
    // Determine context based on surrounding variables
    let replacement = '';
    const line = lines[i];
    
    if (line.includes('sources:')) {
      // Is the loop var s, sc, or something else?
      if (lines[i-1] && lines[i-1].includes('map(s =>')) replacement = '(s.sources || [])';
      else if (lines[i-2] && lines[i-2].includes('map(s =>')) replacement = '(s.sources || [])';
      else if (lines[i-1] && lines[i-1].includes('map((s: any)')) replacement = '(s.sources || [])';
      else if (lines[i-2] && lines[i-2].includes('map((s: any)')) replacement = '(s.sources || [])';
      else if (lines[i-1] && lines[i-1].includes('map(sc =>')) replacement = '(sc.sources || [])';
      else if (lines[i-2] && lines[i-2].includes('map(sc =>')) replacement = '(sc.sources || [])';
      else if (line.includes('copiedSources')) {
        // e.g. const copiedSources = (. || ).map... 
        // Let's check prev line.
        if (lines[i-1].includes('existingLive')) {
          replacement = '(existingLive.sources || [])';
        } else if (lines[i-1].includes('pvwScene')) {
           replacement = '(pvwScene.sources || [])';
        } else {
           replacement = '(scene.sources || [])';
        }
      } else {
         replacement = '(s.sources || [])'; // fallback
      }
    } 
    else if (line.includes('filters:')) {
      if (lines[i-1] && lines[i-1].includes('map(src =>')) replacement = '(src.filters || [])';
      else if (line.includes('map(f =>')) replacement = '(src.filters || [])';
      else replacement = '(src.filters || [])';
    }
    else if (line.includes('filter(') && line.includes('f =>')) {
       // like ccFilter = (. || ).find(...)
       replacement = '(src.filters || [])';
    }
    else if (line.includes('find(') && line.includes('f =>')) {
       replacement = '(src.filters || [])';
    }
    else if (line.includes('some(') && line.includes('s => s.id === sourceId')) {
       if (lines[i-1] && lines[i-1].includes('map(sc =>')) replacement = '(sc.sources || [])';
       else replacement = '(s.sources || [])';
    }
    else if (line.includes('some(') && line.includes('x =>')) {
       if (lines[i-1] && lines[i-1].includes('liveSc =')) replacement = '(liveSc.sources || [])';
       else if (lines[i-2] && lines[i-2].includes('liveSc =')) replacement = '(liveSc.sources || [])';
       else if (lines[i-1] && lines[i-1].includes('fromSc =')) replacement = '(fromSc.sources || [])';
       else if (lines[i-2] && lines[i-2].includes('fromSc =')) replacement = '(fromSc.sources || [])';
       else replacement = '(scene.sources || [])';
    }
    else {
      // fallback
      if (line.includes('src')) replacement = '(sc.sources || [])';
      else replacement = '(sources || [])';
    }

    lines[i] = lines[i].replace('(. || )', replacement);
    console.log(`Replaced line ${i+1}: ${lines[i].trim()}`);
  }
}

fs.writeFileSync(file, lines.join('\n'));
