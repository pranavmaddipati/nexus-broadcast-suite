const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');

function modifyFile(filePath, replacerFn) {
    if (!fs.existsSync(filePath)) {
        console.warn('File not found: ' + filePath);
        return;
    }
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const newContent = replacerFn(originalContent);
    if (originalContent !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated: ' + path.basename(filePath));
    }
}

// Fix App.tsx
modifyFile(path.join(srcDir, 'App.tsx'), content => {
    return content
        .replace(/gap:\s*['"]?8px['"]?/g, "gap: '12px'")
        .replace(/padding:\s*['"]?16px['"]?/g, "padding: '20px'")
        .replace(/borderRadius:\s*['"]?10px['"]?/g, "borderRadius: '8px'")
        .replace(/borderRadius:\s*10,/g, "borderRadius: 8,")
        .replace(/gap:\s*8,/g, "gap: 12,")
        .replace(/padding:\s*16,/g, "padding: 20,");
});

// Live Settings
modifyFile(path.join(componentsDir, 'LiveSettingsPanel.tsx'), content => {
    return content
        .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'")
        .replace(/height:\s*['"]?42px['"]?/g, "height: '36px'")
        .replace(/gap:\s*['"]?16px['"]?/g, "gap: '10px'")
        .replace(/height:\s*['"]?48px['"]?/g, "height: '38px'")
        .replace(/borderRadius:\s*['"]?10px['"]?/g, "borderRadius: '8px'");
});
modifyFile(path.join(componentsDir, 'LiveSettingsModal.tsx'), content => {
    return content
        .replace(/height:\s*['"]?46px['"]?/g, "height: '40px'")
        .replace(/height:\s*['"]?42px['"]?/g, "height: '36px'")
        .replace(/gap:\s*['"]?16px['"]?/g, "gap: '10px'")
        .replace(/height:\s*['"]?48px['"]?/g, "height: '38px'")
        .replace(/borderRadius:\s*['"]?10px['"]?/g, "borderRadius: '8px'");
});

// Quick Actions
modifyFile(path.join(componentsDir, 'QuickActionsPanel.tsx'), content => {
    return content
        .replace(/width:\s*['"]?104px['"]?/g, "width: '92px'")
        .replace(/height:\s*['"]?92px['"]?/g, "height: '82px'")
        .replace(/gap:\s*['"]?16px['"]?/g, "gap: '12px'")
        .replace(/size=\{28\}/g, "size={22}")
        .replace(/fontSize:\s*['"]?15px['"]?/g, "fontSize: '14px'")
        .replace(/height:\s*['"]?84px['"]?/g, "height: '64px'");
});

// MEDIA TABS
// Height: 40px -> 34px, Padding: 16px -> 10px, Font: 15px -> 14px, Icons: 18px -> 16px
modifyFile(path.join(componentsDir, 'TabGroup.tsx'), content => {
    return content
        .replace(/height:\s*['"]?40px['"]?/g, "height: '34px'")
        .replace(/padding:\s*['"]?[0-9]+px\s+16px['"]?/g, match => match.replace('16px', '10px'))
        .replace(/fontSize:\s*['"]?15px['"]?/g, "fontSize: '14px'")
        .replace(/size=\{18\}/g, "size={16}");
});

modifyFile(path.join(componentsDir, 'MediaLibrary.tsx'), content => {
    return content
        .replace(/height:\s*['"]?40px['"]?/g, "height: '34px'")
        .replace(/padding:\s*['"]?16px['"]?/g, "padding: '10px'")
        .replace(/fontSize:\s*['"]?15px['"]?/g, "fontSize: '14px'")
        .replace(/size=\{18\}/g, "size={16}");
});

// Typography Global
modifyFile(path.join(componentsDir, 'PanelHeader.tsx'), content => {
    return content
        .replace(/fontSize:\s*['"]?16px['"]?/g, "fontSize: '16px'") // Panel Title 16px Bold
        .replace(/fontWeight:\s*['"]?(?:500|600)['"]?/g, "fontWeight: 'bold'"); 
});

// Apply rounded to everything
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
for (const file of files) {
    modifyFile(path.join(componentsDir, file), content => {
        return content
            .replace(/borderRadius:\s*['"]?10px['"]?/g, "borderRadius: '8px'")
            .replace(/borderRadius:\s*10,/g, "borderRadius: 8,")
            .replace(/borderRadius:\s*['"]?12px['"]?/g, "borderRadius: '8px'")
            .replace(/borderRadius:\s*12,/g, "borderRadius: 8,");
    });
}
