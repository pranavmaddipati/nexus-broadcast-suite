const fs = require('fs');

// Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/setLeftDocks\s*=\s*\[\]/g, 'setLeftDocks = () => {}');
app = app.replace(/setRightDocks\s*=\s*\[\]/g, 'setRightDocks = () => {}');
app = app.replace(/setBottomDocks\s*=\s*\[\]/g, 'setBottomDocks = () => {}');
fs.writeFileSync('src/App.tsx', app);

// Fix AudioMixer.tsx
let am = fs.readFileSync('src/components/AudioMixer.tsx', 'utf8');
am = am.replace(/writingMode: 'bt-lr'/g, 'writingMode: "vertical-rl"');
am = am.replace(/appearance: 'slider-vertical'/g, 'appearance: "auto"');
fs.writeFileSync('src/components/AudioMixer.tsx', am);

// Fix MediaLibrary.tsx, PlaylistPanel.tsx, etc. destructured defaults so they don't crash at runtime
const ensureDefaultFn = (file, vars) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (let v of vars) {
      const regex1 = new RegExp(v + '\\s*=\\s*\\[\\]', 'g');
      if (regex1.test(content)) {
        content = content.replace(regex1, v + ' = () => {}');
        changed = true;
      }
      const regex2 = new RegExp(v + '([,}])', 'g');
      // If it doesn't have a default, we should probably add one to prevent runtime crashes, but
      // they are context methods. We can just add fallback `|| (() => {})` where used.
    }
    if (changed) fs.writeFileSync(file, content);
  }
}

// Just in case any other set functions are arrays:
const files = ['src/components/PlaylistPanel.tsx', 'src/components/SmartToolsPanel.tsx', 'src/components/MediaLibrary.tsx'];
for(let f of files) {
  if(fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/setActivePlaylist\s*=\s*\[\]/g, 'setActivePlaylist = () => {}');
    content = content.replace(/removeMediaFromPlaylist\s*=\s*\[\]/g, 'removeMediaFromPlaylist = () => {}');
    content = content.replace(/addMediaToPlaylist\s*=\s*\[\]/g, 'addMediaToPlaylist = () => {}');
    content = content.replace(/reorderPlaylist\s*=\s*\[\]/g, 'reorderPlaylist = () => {}');
    content = content.replace(/setPlaylistLoop\s*=\s*\[\]/g, 'setPlaylistLoop = () => {}');
    content = content.replace(/setPlaylistAutoPlay\s*=\s*\[\]/g, 'setPlaylistAutoPlay = () => {}');
    content = content.replace(/toggleSmartTool\s*=\s*\[\]/g, 'toggleSmartTool = () => {}');
    content = content.replace(/setMediaSearch\s*=\s*\[\]/g, 'setMediaSearch = () => {}');
    content = content.replace(/setMediaCategory\s*=\s*\[\]/g, 'setMediaCategory = () => {}');
    content = content.replace(/selectMediaFile\s*=\s*\[\]/g, 'selectMediaFile = () => {}');
    fs.writeFileSync(f, content);
  }
}

// Check BroadcastContextType again
let bc = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');
// Fix BroadcastContext duplicate "selectScene," 
// I replaced it in earlier step but maybe it didn't save correctly.
// Let's just remove duplicate "selectScene," manually just in case.
const parts = bc.split('selectScene,');
if (parts.length > 2) {
  bc = parts[0] + 'selectScene,' + parts.slice(2).join('selectScene,');
  fs.writeFileSync('src/context/BroadcastContext.tsx', bc);
}

console.log('Fixed fix8');
