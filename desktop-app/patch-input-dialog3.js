const fs = require('fs');

const file = 'src/components/InputSelectionDialog.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Center the header
content = content.replace(
  /<div style=\{\{\s*padding: '24px 24px 16px 24px',\s*display: 'flex',\s*justifyContent: 'space-between',\s*alignItems: 'flex-start'\s*\}\}>([\s\S]*?)<button/m,
  `<div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>Add Source</h2>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Choose a source type to add to your scene</p>
            </div>
            <button`
);

// Fix the close button position
content = content.replace(
  /<button\s*onClick=\{onClose\}\s*style=\{\{\s*background: 'transparent',\s*border: 'none',\s*color: '#94a3b8',\s*cursor: 'pointer',\s*padding: '4px'\s*\}\}/m,
  `<button 
              onClick={onClose}
              style={{ position: 'absolute', right: '24px', top: '24px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}`
);

// 2. Fix the height of the modal to prevent jarring resizes, and add a transition just in case
content = content.replace(
  /width: '90vw',\s*maxWidth: '860px',\s*display: 'flex',/m,
  `width: '90vw',
            maxWidth: '860px', 
            height: '650px',
            maxHeight: '85vh',
            display: 'flex',`
);

// 3. Make scrollable content flex to take up the rest of the height
content = content.replace(
  /<div style=\{\{\s*padding: '0 24px',\s*overflowY: 'auto',\s*maxHeight: '55vh',\s*display: 'flex',\s*flexDirection: 'column',\s*marginBottom: '16px'\s*\}\}>/m,
  `<div style={{ padding: '0 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>`
);

fs.writeFileSync(file, content);
console.log('Successfully patched InputSelectionDialog.tsx');
