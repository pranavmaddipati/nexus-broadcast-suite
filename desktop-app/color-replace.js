const fs = require('fs');
const path = require('path');

const dir = './src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

const colorMap = {
  '#0a0e17': 'var(--bg-main)',
  '#000000': 'var(--bg-main)',
  '#050505': 'var(--bg-main)',
  '#0a0b12': 'var(--bg-main)',
  '#1e293b': 'var(--bg-panel)',
  '#121826': 'var(--bg-panel)',
  '#1a1a1f': 'var(--bg-panel)',
  '#0f172a': 'var(--bg-panel)',
  '#111827': 'var(--bg-panel)',
  '#1c2436': 'var(--bg-card)',
  '#2a3555': 'var(--border-color)',
  '#334155': 'var(--border-color)',
  '#171f2e': 'var(--bg-panel-light)'
};

let totalReplacements = 0;

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [hex, cssVar] of Object.entries(colorMap)) {
    const regex = new RegExp(hex, 'gi');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, cssVar);
      changed = true;
      totalReplacements += matches.length;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${f}`);
  }
});

console.log(`Total replacements: ${totalReplacements}`);
