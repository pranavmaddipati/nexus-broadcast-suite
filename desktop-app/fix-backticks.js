const fs = require('fs');
let code = fs.readFileSync('c:/broadcast-suite3/desktop-app/src/components/SourcesPanel.tsx', 'utf8');
code = code.replace(/\\\`/g, '\`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('c:/broadcast-suite3/desktop-app/src/components/SourcesPanel.tsx', code);
