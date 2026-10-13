const fs = require('fs');

let topBar = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

topBar = topBar.replace(
  /stroke="var\(--accent-green\)"/g,
  `stroke="var(--accent-red)"`
);
topBar = topBar.replace(
  /color: 'var\(--accent-green\)'/g,
  `color: 'var(--accent-red)'`
);

fs.writeFileSync('src/components/TopBar.tsx', topBar);
console.log("Applied TopBar fix");
