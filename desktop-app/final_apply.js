const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const cssPath = path.join(srcDir, 'index.css');

function modifyFile(filePath, replacerFn) {
    if (!fs.existsSync(filePath)) return;
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const newContent = replacerFn(originalContent);
    if (originalContent !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated: ' + path.basename(filePath));
    }
}

// 1. App.tsx (Global Layout, Panel Widths, Outer Margin, Panel Gap)
modifyFile(path.join(srcDir, 'App.tsx'), content => {
    return content
        // Outer margin and gap in workspace container
        .replace(/id="workspace-container" style=\{\{.*?(padding:\s*['"][^'"]+['"]).*?(gap:\s*['"][^'"]+['"]).*?\}\}/g, match => {
            return match.replace(/padding:\s*['"][^'"]+['"]/, "padding: '20px'").replace(/gap:\s*['"][^'"]+['"]/, "gap: '12px'");
        })
        .replace(/id="workspace-container" style=\{\{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', overflow: 'hidden', padding: '4px', boxSizing: 'border-box', gap: '4px', background: 'var\(--bg-main\)' \}\}/, 
                 "id=\"workspace-container\" style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', overflow: 'hidden', padding: '20px', boxSizing: 'border-box', gap: '12px', background: 'var(--bg-main)' }}")
        
        // Grid template rows for Navbar height
        .replace(/gridTemplateRows:\s*['"]36px\s+1fr\s+28px['"]/, "gridTemplateRows: '52px 1fr 28px'")
        .replace(/height:\s*['"]24px['"],\s*minHeight:\s*['"]36px['"],\s*maxHeight:\s*['"]36px['"]/, "height: '52px', minHeight: '52px', maxHeight: '52px'")
        
        // Pinned Scenes Width
        .replace(/flex:\s*['"]1\.6\s+1\s+0['"]/g, "width: '295px', flexShrink: 0")
        
        // Main Content Column gap
        .replace(/flex:\s*['"]8\.4\s+1\s+0['"],\s*display:\s*['"]flex['"],\s*flexDirection:\s*['"]column['"],\s*gap:\s*['"]2px['"]/g, "flex: 1, display: 'flex', flexDirection: 'column', gap: '12px'")
        
        // Top Row Panels (Preview, Transition, Program, AudioMixer) gap
        .replace(/flex:\s*['"]1\.2\s+1\s+0['"],\s*display:\s*['"]flex['"],\s*flexDirection:\s*['"]row['"],\s*gap:\s*['"]2px['"]/g, "flex: 1, display: 'flex', flexDirection: 'row', gap: '12px'")
        
        // Transition Panel Width
        .replace(/flex:\s*['"]1\.0\s+1\s+0['"]/g, "width: '155px', flexShrink: 0")
        
        // Audio Mixer Width
        .replace(/flex:\s*['"]2\.6\s+1\s+0['"]/g, "width: '420px', flexShrink: 0")
        
        // Preview/Program Flex
        .replace(/flex:\s*['"]2\.4\s+1\s+0['"]/g, "flex: 1");
});

// 2. index.css (Shadow, Border thickness, Colors)
modifyFile(cssPath, content => {
    let newContent = content
        .replace(/--bg-main:\s*#[0-9A-Fa-f]+;/, "--bg-main: #0E1117;")
        .replace(/--bg-panel:\s*#[0-9A-Fa-f]+;/, "--bg-panel: #0E1117;")
        .replace(/--bg-card:\s*#[0-9A-Fa-f]+;/, "--bg-card: #111521;")
        .replace(/--panel-radius:\s*\d+px;/, "--panel-radius: 8px;")
        // Border thickness reduction in premium-panel
        .replace(/border:\s*1px\s+solid\s+rgba\([^)]+\)/g, "border: 1px solid rgba(255, 255, 255, 0.08)")
        .replace(/border:\s*1\.5px\s+solid/g, "border: 1px solid")
        // Shadow Softening
        .replace(/box-shadow:\s*0\s+4px\s+16px\s+rgba\(0,0,0,0\.3\);/g, "box-shadow: 0 4px 12px rgba(0,0,0,0.18);")
        .replace(/box-shadow:\s*0\s+6px\s+16px\s+rgba\(0,0,0,0\.25\);/g, "box-shadow: 0 4px 12px rgba(0,0,0,0.18);")
        
    return newContent;
});

// 3. Components Updates
modifyFile(path.join(componentsDir, 'TopBar.tsx'), content => {
    return content
        .replace(/height:\s*['"]56px['"]/g, "height: '52px'")
        .replace(/gap:\s*['"]28px['"]/g, "gap: '24px'")
        .replace(/padding:\s*['"]0\s+12px['"]/g, "padding: '0 8px'")
        .replace(/fontSize:\s*['"]15px['"]/g, "fontSize: '14px'")
        .replace(/size=\{18\}/g, "size={16}");
});

modifyFile(path.join(componentsDir, 'PreviewMonitor.tsx'), content => {
    return content
        .replace(/height:\s*['"]46px['"]/g, "height: '40px'")
        .replace(/width:\s*['"]32px['"]/g, "width: '26px'")
        .replace(/height:\s*['"]32px['"]/g, "height: '26px'")
        .replace(/size=\{20\}/g, "size={18}")
        .replace(/gap:\s*['"]16px['"]/g, "gap: '10px'")
        .replace(/height:\s*['"]42px['"]/g, "height: '36px'")
        .replace(/borderRadius:\s*['"]10px['"]/g, "borderRadius: '8px'");
});

modifyFile(path.join(componentsDir, 'ProgramMonitor.tsx'), content => {
    return content
        .replace(/height:\s*['"]46px['"]/g, "height: '40px'")
        .replace(/size=\{20\}/g, "size={18}")
        .replace(/height:\s*['"]42px['"]/g, "height: '36px'");
});

modifyFile(path.join(componentsDir, 'AudioMixer.tsx'), content => {
    return content
        .replace(/width:\s*['"]46px['"]/g, "width: '40px'")
        .replace(/width:\s*46/g, "width: 40")
        .replace(/gap:\s*['"]24px['"]/g, "gap: '18px'")
        .replace(/width:\s*['"]18px['"]/g, "width: '10px'")
        .replace(/height:\s*['"]210px['"]/g, "height: '245px'")
        .replace(/width:\s*['"]18px['"]\s*,\s*height:\s*['"]12px['"]/g, "width: '12px', height: '8px'")
        .replace(/fontSize:\s*['"]12px['"]/g, "fontSize: '10px'")
        .replace(/fontSize:\s*['"]18px['"]/g, "fontSize: '16px'");
});

// Workspace Container Gap
modifyFile(path.join(componentsDir, 'WorkspaceContainer.tsx'), content => {
    return content
        .replace(/gap:\s*['"]2px['"]/g, "gap: '12px'")
        .replace(/gap:\s*['"]8px['"]/g, "gap: '12px'");
});

console.log('Final polish script executed.');
