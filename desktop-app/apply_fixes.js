const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const cssPath = path.join(srcDir, 'index.css');

function replaceInFile(filePath, regexReplacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [regex, replacement] of regexReplacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${path.basename(filePath)}`);
    }
}

function processAllComponents(regexReplacements) {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    for (const file of files) {
        replaceInFile(path.join(componentsDir, file), regexReplacements);
    }
}

// 1. GLOBAL DESIGN SYSTEM
// Border Radius -> 8px
// --panel-radius: 10px; (or 12px) -> 8px
// .premium-card border-radius: 6px; -> wait, target for Cards is 8px? 
replaceInFile(cssPath, [
    [/--panel-radius:\s*\d+px;/, '--panel-radius: 8px;'],
    [/\.premium-card\s*\{\s*[\s\S]*?border-radius:\s*\d+px;/g, match => match.replace(/border-radius:\s*\d+px;/, 'border-radius: 8px;')],
    [/\.premium-btn\s*\{\s*[\s\S]*?border-radius:\s*\d+px;/g, match => match.replace(/border-radius:\s*\d+px;/, 'border-radius: 8px;')],
    [/\.premium-inset\s*\{\s*[\s\S]*?border-radius:\s*\d+px;/g, match => match.replace(/border-radius:\s*\d+px;/, 'border-radius: 8px;')]
]);

// 1. GLOBAL - CSS Colors
// Reduce Blue saturation 8%, darker emerald green, true red, Background #0E1117, Cards #111521, Borders rgba(255,255,255,.08)
// HSL for 2D7DFF is roughly 217, 100%, 59%. Reduce saturation 8% -> wait, maybe #3682ff or just slightly less saturated?
// A slightly desaturated blue: #4185F4 (Google blue) or something. Let's use #3B7CFF?
// Actually, let's look at the concept UI. "Reduce blue saturation 8%". 
// Hex to HSL: #2D7DFF -> HSL(217, 100%, 59%). 92% saturation -> HSL(217, 92%, 59%) -> #3681F9. Let's use #3B82F6 (Tailwind blue-500) or calculate it.
replaceInFile(cssPath, [
    [/--bg-main:\s*#[0-9A-Fa-f]+;/, '--bg-main: #0E1117;'],
    [/--bg-panel:\s*#[0-9A-Fa-f]+;/, '--bg-panel: #0E1117;'], // Wait, concept UI: background #0E1117. panels?
    [/--bg-card:\s*#[0-9A-Fa-f]+;/, '--bg-card: #111521;'],
    [/--border-color:\s*rgba\([^)]+\);/, '--border-color: rgba(255, 255, 255, 0.08);'],
    [/--accent-blue:\s*#[0-9A-Fa-f]+;/, '--accent-blue: #3681F9;'], // Desaturated blue
    [/--accent-green:\s*#[0-9A-Fa-f]+;/, '--accent-green: #10B981;'], // Darker emerald green
    [/--accent-red:\s*#[0-9A-Fa-f]+;/, '--accent-red: #FF0000;'], // True red
    [/--text-secondary:\s*#[0-9A-Fa-f]+;/, '--text-secondary: rgba(255, 255, 255, 0.65);'], // 65% opacity
]);

// 2. Global Border, Shadow, Gap, Margin
// "Panel Gap: 8px -> 12px", "Outer Margin: 16px -> 20px"
// This is probably in WorkspaceContainer.tsx or App.tsx
replaceInFile(path.join(componentsDir, 'WorkspaceContainer.tsx'), [
    [/gap-[24]\s/g, 'gap-3 '], // Assuming gap-2 (8px) -> gap-3 (12px) if tailwind, wait, they don't use tailwind?
    [/p-[46]/g, 'p-5'], // p-4 (16px) -> p-5 (20px)
    [/padding:\s*['"]16px['"]/g, 'padding: "20px"'],
    [/gap:\s*['"]8px['"]/g, 'gap: "12px"'],
]);
replaceInFile(path.join(srcDir, 'App.tsx'), [
    [/padding:\s*['"]16px['"]/g, 'padding: "20px"'],
    [/padding:\s*16/g, 'padding: 20'],
    [/gap:\s*['"]8px['"]/g, 'gap: "12px"'],
    [/gap:\s*8/g, 'gap: 12'],
]);

// Let's print out what files we have to know what else to process
console.log("CSS Initial Fixes Done.");
