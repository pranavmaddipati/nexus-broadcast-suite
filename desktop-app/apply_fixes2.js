const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

function modifyFile(filename, replacerFn) {
    const filePath = path.join(componentsDir, filename);
    if (!fs.existsSync(filePath)) {
        console.warn('File not found: ' + filename);
        return;
    }
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const newContent = replacerFn(originalContent);
    if (originalContent !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated: ' + filename);
    }
}

// 1. TOP NAVIGATION
// Navbar Height 56px -> 52px
// Menu Font 15px -> 14px, Weight 500
// Menu Gap 28px -> 24px
modifyFile('TopBar.tsx', content => {
    return content
        .replace(/height:\s*['"]?56px['"]?/g, "height: '52px'")
        .replace(/font-size:\s*['"]?15px['"]?/gi, "fontSize: '14px'")
        .replace(/fontSize:\s*['"]?15px['"]?/gi, "fontSize: '14px'")
        .replace(/fontWeight:\s*['"]?(?:400|normal)['"]?/gi, "fontWeight: 500")
        .replace(/gap:\s*['"]?28px['"]?/g, "gap: '24px'")
        // Reduce LIVE/REC badge padding
        .replace(/padding:\s*['"]?4px\s+12px['"]?/g, "padding: '2px 8px'")
        .replace(/padding:\s*['"]?6px\s+14px['"]?/g, "padding: '4px 10px'")
        // icon size 18px -> 16px
        .replace(/size=\{18\}/g, "size={16}")
        .replace(/width:\s*['"]?18px['"]?/g, "width: '16px'")
        .replace(/height:\s*['"]?18px['"]?/g, "height: '16px'");
});

modifyFile('MenuBar.tsx', content => {
    return content
        .replace(/height:\s*['"]?56px['"]?/g, "height: '52px'")
        .replace(/fontSize:\s*['"]?15px['"]?/gi, "fontSize: '14px'")
        .replace(/fontWeight:\s*['"]?(?:400|normal)['"]?/gi, "fontWeight: 500")
        .replace(/gap:\s*['"]?28px['"]?/g, "gap: '24px'")
        .replace(/padding:\s*['"]?4px\s+12px['"]?/g, "padding: '2px 8px'");
});

modifyFile('StatusBar.tsx', content => {
    return content
        .replace(/padding:\s*['"]?4px\s+8px['"]?/g, "padding: '2px 6px'") // CPU GPU RAM padding
        .replace(/padding:\s*['"]?4px\s+12px['"]?/g, "padding: '2px 8px'");
});

// 2. PREVIEW / PROGRAM PANEL
// Header Height: 46px -> 40px, Preview Badge: 32px -> 26px, Toolbar Icons: 20px -> 18px, Toolbar Gap: 16px -> 10px, Bottom Buttons: 42px -> 36px, Border Radius: 10px -> 8px
['PreviewMonitor.tsx', 'ProgramMonitor.tsx'].forEach(file => {
    modifyFile(file, content => {
        return content
            .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'")
            .replace(/height:\s*['"]?32px['"]?/g, "height: '26px'") // Badge
            .replace(/width:\s*['"]?32px['"]?/g, "width: '26px'") // Badge width if set
            .replace(/size=\{20\}/g, "size={18}") // Icons
            .replace(/gap:\s*['"]?16px['"]?/g, "gap: '10px'")
            .replace(/height:\s*['"]?42px['"]?/g, "height: '36px'") // Bottom buttons
            .replace(/borderRadius:\s*['"]?10px['"]?/g, "borderRadius: '8px'")
            // Make sure panel headers match too
            .replace(/padding:\s*['"]?[0-9]+px\s+[0-9]+px['"]?/g, match => {
                // If it's the header padding, maybe adjust
                return match;
            });
    });
});

// 3. TRANSITION PANEL
// Overall width: 170px -> 155px, Header Height: 46px -> 40px, Transition Buttons: 64x46 -> 54x40, Gap: 10px -> 6px, Radius: 10px -> 8px, Slider Track: 6px -> 4px, Slider Thumb: 18px -> 14px, Preset Buttons: 38px -> 34px
modifyFile('TransitionControls.tsx', content => {
    return content
        .replace(/width:\s*['"]?170px['"]?/g, "width: '155px'")
        .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'")
        .replace(/width:\s*['"]?64px['"]?/g, "width: '54px'")
        .replace(/height:\s*['"]?64px['"]?/g, "height: '54px'") // if square
        .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'") // transition buttons
        .replace(/width:\s*['"]?64px['"]?,\s*height:\s*['"]?46px['"]?/g, "width: '54px', height: '40px'")
        .replace(/width:\s*64,\s*height:\s*46/g, "width: 54, height: 40")
        .replace(/gap:\s*['"]?10px['"]?/g, "gap: '6px'")
        .replace(/borderRadius:\s*['"]?10px['"]?/g, "borderRadius: '8px'")
        .replace(/height:\s*['"]?6px['"]?/g, "height: '4px'") // Slider track
        .replace(/width:\s*['"]?18px['"]?/g, "width: '14px'") // Slider thumb width
        .replace(/height:\s*['"]?18px['"]?/g, "height: '14px'") // Slider thumb height
        .replace(/width:\s*['"]?38px['"]?/g, "width: '34px'") // Preset buttons
        .replace(/height:\s*['"]?38px['"]?/g, "height: '34px'");
});

// 4. AUDIO MIXER
// Header Height: 46px -> 40px, Channel Width: 46px -> 40px, Gap: 24px -> 18px, Audio Meter Width: 18px -> 10px, Height: 210px -> 245px, Fader Width: 18px -> 12px, Height: 12px -> 8px, Tick Font: 12px -> 10px, Channel Font: 18px -> 16px Bold
// Add EQ, COMP below every channel exactly like concept, Color #48D4FF, Font 10px
modifyFile('AudioMixer.tsx', content => {
    let newContent = content
        .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'")
        .replace(/width:\s*['"]?46px['"]?/g, "width: '40px'")
        .replace(/gap:\s*['"]?24px['"]?/g, "gap: '18px'")
        .replace(/width:\s*['"]?18px['"]?/g, "width: '10px'") // meter
        .replace(/width:\s*18/g, "width: 10")
        .replace(/height:\s*['"]?210px['"]?/g, "height: '245px'")
        .replace(/height:\s*210/g, "height: 245")
        // Fader thumb
        .replace(/width:\s*['"]?18px['"]?/g, "width: '12px'") 
        .replace(/height:\s*['"]?12px['"]?/g, "height: '8px'")
        .replace(/fontSize:\s*['"]?12px['"]?/g, "fontSize: '10px'")
        .replace(/fontSize:\s*['"]?18px['"]?/g, "fontSize: '16px'")
        .replace(/fontWeight:\s*['"]?(?:500|600)['"]?/g, "fontWeight: 'bold'");

    // Try to inject EQ COMP below channel name if not exists
    // Looking for the channel name rendering
    if (!newContent.includes('EQ COMP')) {
        // Typically it might render the channel name in a div. Let's find something like:
        // <div>{channel.name}</div> or <span>{channel.name}</span>
        // Wait, the prompt says "below every channel exactly like concept". The concept shows channel name, then "EQ COMP" below it.
        // Let's replace the channel name section.
        const nameRegex = /(<div[^>]*>)\s*(\{channel\.name\}|\{src\.name\}|[A-Za-z0-9\s]+)\s*(<\/div>)/i;
        // It's safer to just let me manually fix AudioMixer.tsx if this regex doesn't match perfectly.
    }
    return newContent;
});

// 5. PINNED SCENES
// Height 122px -> 82px, Padding 16px -> 10px, Gap 12px -> 8px, Thumb 68x52 -> 74x56, Scene Num Badge 28px -> 24px, Title 16px SemiBold -> 18px Bold, Timer 14px -> 13px, Quick Cut 14px -> 12px (Left aligned), AUD PVW PGM 56x26 -> 48x22, Radius 8px -> 6px, Active Border 2px Soft Glow, Sec Text 100% -> 65%
modifyFile('PinnedScenes.tsx', content => {
    return content
        .replace(/height:\s*['"]?122px['"]?/g, "height: '82px'")
        .replace(/padding:\s*['"]?16px['"]?/g, "padding: '10px'")
        .replace(/gap:\s*['"]?12px['"]?/g, "gap: '8px'")
        .replace(/width:\s*['"]?68px['"]?/g, "width: '74px'")
        .replace(/height:\s*['"]?52px['"]?/g, "height: '56px'")
        // Scene number badge
        .replace(/width:\s*['"]?28px['"]?/g, "width: '24px'")
        .replace(/height:\s*['"]?28px['"]?/g, "height: '24px'")
        // Title
        .replace(/fontSize:\s*['"]?16px['"]?/g, "fontSize: '18px'")
        .replace(/fontWeight:\s*['"]?(?:500|600|'semibold'|"semibold")['"]?/g, "fontWeight: 'bold'")
        // Timer
        .replace(/fontSize:\s*['"]?14px['"]?/g, "fontSize: '13px'")
        // Quick Cut
        .replace(/fontSize:\s*['"]?14px['"]?/g, "fontSize: '12px'")
        .replace(/textAlign:\s*['"]?center['"]?/g, "textAlign: 'left'")
        // AUD PVW PGM
        .replace(/width:\s*['"]?56px['"]?/g, "width: '48px'")
        .replace(/height:\s*['"]?26px['"]?/g, "height: '22px'")
        .replace(/borderRadius:\s*['"]?8px['"]?/g, "borderRadius: '6px'")
        // Active border
        .replace(/border:\s*['"]?[12]px\s+solid\s+.*?['"]?/g, match => {
            if(match.includes('transparent')) return match;
            return match.replace(/1px/, '2px'); // Need a better approach for active glow later
        });
});

// 6. SCENE LIBRARY
modifyFile('SceneLibrary.tsx', content => {
    return content
        .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'") // header
        .replace(/height:\s*['"]?42px['"]?/g, "height: '36px'") // search
        .replace(/height:\s*['"]?82px['"]?/g, "height: '70px'") // card
        .replace(/padding:\s*['"]?14px['"]?/g, "padding: '10px'")
        .replace(/gap:\s*['"]?12px['"]?/g, "gap: '8px'")
        .replace(/width:\s*['"]?26px['"]?/g, "width: '22px'") // LIVE badge width/height
        .replace(/height:\s*['"]?26px['"]?/g, "height: '22px'")
        // Increase thumbnail 10% - if it was say 100px width -> 110px. I'll need to check the file directly later.
});

// 7. SOURCES
modifyFile('SourcesPanel.tsx', content => {
    return content
        .replace(/width:\s*['"]?170px['"]?/g, "width: '160px'")
        .replace(/height:\s*['"]?98px['"]?/g, "height: '88px'")
        .replace(/padding:\s*['"]?16px['"]?/g, "padding: '10px'")
        .replace(/size=\{34\}/g, "size={28}")
        .replace(/borderWidth:\s*['"]?3px['"]?/g, "borderWidth: '2px'")
        .replace(/border:\s*['"]?3px\s+solid/g, "border: '2px solid");
});

console.log("Done phase 1.");
