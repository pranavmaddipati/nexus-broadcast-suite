const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

function processAllComponents() {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    for (const file of files) {
        const filePath = path.join(componentsDir, file);
        const originalContent = fs.readFileSync(filePath, 'utf8');
        let newContent = originalContent;

        // "Panel Titles 18px -> 16px"
        // Wait, I might blindly replace 18px with 16px. Let's do it carefully.
        newContent = newContent
            .replace(/fontSize:\s*['"]?18px['"]?/g, "fontSize: '16px'")
            .replace(/fontSize:\s*['"]?15px['"]?/g, "fontSize: '14px'") // Body Text 15px -> 14px
            // .replace(/fontSize:\s*['"]?16px['"]?/g, "fontSize: '15px'") // Section Headers 16px -> 15px (this is risky, wait. Pinned scenes title is 18px -> wait, user prompt says "Scene Title 18px Bold" for Pinned Scenes!)
        
        // Let's protect Pinned Scenes from this blind replacement.
        if (file === 'PinnedScenes.tsx') {
            newContent = originalContent; 
            // the user specifically said "Scene Title 18px Bold" for pinned scenes, and "Panel Titles 18px -> 16px".
        }
        
        // Compact Line Height
        newContent = newContent.replace(/lineHeight:\s*['"]?[1\.5|1\.6|'normal']+['"]?/g, "lineHeight: '1.2'");
        
        if (originalContent !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Updated ${file}`);
        }
    }
}
processAllComponents();
