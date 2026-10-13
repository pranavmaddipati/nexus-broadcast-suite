const fs = require('fs');

// Fix BroadcastContext.tsx
const bcFile = 'src/context/BroadcastContext.tsx';
let bc = fs.readFileSync(bcFile, 'utf8');
bc = bc.replace(/sources: \(s\.sources \|\| \[\]\)\.map/g, 'sources: (sc.sources || []).map');
bc = bc.replace(/hasSource = \(s\.sources \|\| \[\]\)\.some/g, 'hasSource = (sc.sources || []).some');
bc = bc.replace(/sources: \(s\.sources \|\| \[\]\)\.filter/g, 'sources: (sc.sources || []).filter');
// fix line 837
bc = bc.replace(/sources: \(sc\.sources \|\| \[\]\)\.map\(src => \(\{ \.\.\.src, id: `src_/g, 'sources: (target.sources || []).map(src => ({ ...src, id: `src_');
// fix 1194, 1260, 1329
bc = bc.replace(/const copiedSources = \(sc\.sources \|\| \[\]\)\.map/g, 'const copiedSources = (pvwScene.sources || []).map');
// fix 1746
bc = bc.replace(/liveSc && \(scene\.sources \|\| \[\]\)\.some/g, 'liveSc && (liveSc.sources || []).some');

fs.writeFileSync(bcFile, bc);

// Fix VmixInputCard.tsx
const vcFile = 'src/components/VmixInputCard.tsx';
let vc = fs.readFileSync(vcFile, 'utf8');
vc = vc.replace(/scene\(sources/g, 'scene.sources');
vc = vc.replace(/scene\.\(sources/g, 'scene.sources');
// in case it's something like scene(sources || [])
vc = vc.replace(/scene\(\(sources \|\| \[\]\)\)/g, '(scene.sources || [])');
vc = vc.replace(/scene\(sources \|\| \[\]\)/g, '(scene.sources || [])');

// wait, let's look at the errors:
// 148: Type 'Scene' has no call signatures.
// Cannot find name 'sources'.
fs.writeFileSync(vcFile, vc);
console.log('Fixed files');
