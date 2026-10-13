const fs = require('fs');
const path = require('path');

const applyReplacements = (filepath, replacements) => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });
    if (content !== original) {
      fs.writeFileSync(filepath, content);
      console.log(`Updated ${path.basename(filepath)}`);
    }
  } catch (e) {
    console.error(`Failed on ${filepath}:`, e.message);
  }
};

const srcDir = path.join(__dirname, 'src');

// 1. App.tsx
applyReplacements(path.join(srcDir, 'App.tsx'), [
  {
    search: /{?\/\* LEFT SIDEBAR: Pinned Scenes \(Full Height\) \*\/}?\n?\s*<div className="premium-panel" style={{ flex: '1\.6 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>\n?\s*<PinnedScenes \/>\n?\s*<\/div>/g,
    replace: ""
  },
  {
    search: /<div id="workspace-container" style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', overflow: 'hidden', padding: '4px', boxSizing: 'border-box', gap: '4px', background: 'var\(--bg-main\)' }}>\n\s*\{?\/\* MAIN CONTENT \(Column\) \*\/\}?\n\s*<div style={{ flex: '8\.4 1 0', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, height: '100%' }}>/g,
    replace: `<div id="workspace-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', padding: '4px', boxSizing: 'border-box', gap: '4px', background: 'var(--bg-main)' }}>`
  },
  {
    search: /{?\/\* TOP ROW: Monitors \+ Audio Mixer \*\/}?\n\s*<div style={{ flex: '1\.2 1 0', display: 'flex', flexDirection: 'row', gap: '4px', minHeight: 0 }}>/g,
    replace: `{/* TOP ROW: Scenes + Monitors + Transition + Audio Mixer */}
          <div style={{ flex: '1.4 1 0', display: 'flex', flexDirection: 'row', gap: '4px', minHeight: 0, width: '100%' }}>
            
            <div className="premium-panel" style={{ flex: '1.4 1 0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', minWidth: 0 }}>
              <PinnedScenes />
            </div>`
  },
  {
    search: /<div id="bottom-workspace" style={{ \n?\s*flex: '45 1 0',\n?\s*width: '100%', \n?\s*display: 'flex',\n?\s*flexDirection: 'column',\n?\s*overflow: 'hidden', \n?\s*boxSizing: 'border-box',\n?\s*flexShrink: 0\n?\s*}}>\n?\s*<WorkspaceContainer \/>\n?\s*<\/div>\n?\n?\s*<\/div>\n?\s*<\/div>/g,
    replace: `<div id="bottom-workspace" style={{ 
            flex: '1 1 0',
            width: '100%', 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', 
            boxSizing: 'border-box',
            flexShrink: 0
          }}>
            <WorkspaceContainer />
          </div>

      </div>`
  },
  {
    search: /<div id="workspace-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', padding: '16px', boxSizing: 'border-box', gap: '12px', background: 'var\(--bg-main\)' }}>/g,
    replace: `<div id="workspace-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', padding: '4px', boxSizing: 'border-box', gap: '4px', background: 'var(--bg-main)' }}>`
  },
  {
    search: /flex: '45 1 0'/g,
    replace: "flex: '1 1 0'"
  }
]);

// 2. WorkspaceContainer.tsx
applyReplacements(path.join(srcDir, 'components/WorkspaceContainer.tsx'), [
  {
    search: /gridTemplateColumns: '2\.2fr 2\.3fr 2\.4fr 1\.5fr'/g,
    replace: "gridTemplateColumns: '2.5fr 3.0fr 2.7fr 1.8fr'"
  },
  {
    search: /gridTemplateColumns: '1\.5fr 2\.2fr 3\.2fr 2\.1fr'/g,
    replace: "gridTemplateColumns: '2.5fr 3.0fr 2.7fr 1.8fr'"
  }
]);

console.log('Restored top row architecture.');
