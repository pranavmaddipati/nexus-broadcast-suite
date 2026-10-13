const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');

function modifyFile(filePath, replacerFn) {
    if (!fs.existsSync(filePath)) return;
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const newContent = replacerFn(originalContent);
    if (originalContent !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated: ' + path.basename(filePath));
    }
}

// TOP NAVIGATION
modifyFile(path.join(componentsDir, 'TopBar.tsx'), content => {
    return content
        .replace(/height:\s*['"]?[0-9]+px['"]?/g, "height: '52px'")
        .replace(/padding:\s*['"]?0\s+8px['"]?/g, "padding: '0 8px'")
        .replace(/gap:\s*['"]?8px['"]?/g, "gap: '24px'") // "Menu Gap 24px" -> wait, gap 8px might be something else
});

// Pinned Scenes Target:
// Scene Card Height: 82px
// Card Padding: 10px
// Gap: 8px
// Thumbnail: 74x56
// Scene Number Badge: 24px
// Scene Title: 18px Bold
// Timer: 13px
// Quick Cut: 12px Left aligned.
// AUD PVW PGM: 48x22
// Border Radius: 6px
// Active Border: 2px Soft Glow
// Secondary Text: 65%
modifyFile(path.join(componentsDir, 'PinnedScenes.tsx'), content => {
    return content
        .replace(/height:\s*['"]?92px['"]?/g, "height: '82px'") // card height
        .replace(/padding:\s*['"]?8px['"]?/g, "padding: '10px'") // card padding
        .replace(/width:\s*['"]?72px['"]?/g, "width: '74px'") // thumb w
        .replace(/height:\s*['"]?48px['"]?/g, "height: '56px'") // thumb h
        .replace(/width:\s*['"]?22px['"]?/g, "width: '24px'") // badge w
        .replace(/height:\s*['"]?22px['"]?/g, "height: '24px'") // badge h
        .replace(/fontSize:\s*['"]?11px['"]?/g, "fontSize: '11px'") // wait, timer is 11px?
        .replace(/fontSize:\s*['"]?10px['"]?/g, "fontSize: '13px'") // quick cut maybe?
        .replace(/fontSize:\s*['"]?13px['"]?/g, "fontSize: '18px', fontWeight: 'bold'") // title?
        .replace(/1px solid/g, "2px solid")
        .replace(/boxShadow:\s*.*?['"]?/g, "boxShadow: '0 0 10px rgba(255,255,255,0.2)'")
});

modifyFile(path.join(componentsDir, 'AudioMixer.tsx'), content => {
    return content
        .replace(/width:\s*['"]?18px['"]?/g, "width: '10px'")
        .replace(/height:\s*['"]?210px['"]?/g, "height: '245px'")
        .replace(/height:\s*210/g, "height: 245")
        .replace(/gap:\s*['"]?24px['"]?/g, "gap: '18px'");
});

modifyFile(path.join(componentsDir, 'TransitionControls.tsx'), content => {
    return content
        .replace(/width:\s*['"]?170px['"]?/g, "width: '155px'")
        .replace(/width:\s*['"]?64px['"]?/g, "width: '54px'")
        .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'")
        .replace(/width:\s*['"]?38px['"]?/g, "width: '34px'")
        .replace(/height:\s*['"]?38px['"]?/g, "height: '34px'")
        .replace(/gap:\s*['"]?10px['"]?/g, "gap: '6px'");
});

console.log('Targets pass applied');
