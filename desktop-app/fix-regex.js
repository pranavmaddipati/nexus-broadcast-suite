const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modified = 0;

walk('./src', function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix map/filter/find/reduce/some
    content = content.replace(/(\w+)\.(map|filter|find|reduce|some)\(/g, (match, p1, p2) => {
        // skip if it's already safe or common safe objects
        if (['Object', 'Array', 'Promise', 'React'].includes(p1)) return match;
        return `(${p1} || []).${p2}(`;
    });

    // Fix property accesses safely where possible (this is risky via regex, so we only do very specific ones)
    content = content.replace(/\b(scene|settings|dock|filters|sources|streams|source)\./g, (match, p1) => {
        return `${p1}?.`;
    });
    
    // Fix optional chaining syntax like source?.?.
    content = content.replace(/\?\.\?\./g, '?.');

    // Fix destructuring useBroadcast to include defaults
    content = content.replace(/const {([^}]+)} = useBroadcast\(\)/g, (match, p1) => {
        const fixed = p1.split(',').map(item => {
            let t = item.trim();
            if (t.includes('=')) return t; // already has default
            if (t.includes(':')) return t; // has alias
            // assign default based on name loosely
            if (t.endsWith('s')) return `${t} = []`;
            if (t.startsWith('is') || t.startsWith('has')) return `${t} = false`;
            if (t.startsWith('set') || t.startsWith('toggle') || t.startsWith('update')) return `${t} = () => {}`;
            return t; // fallback
        }).join(', ');
        return `const { ${fixed} } = useBroadcast()`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        modified++;
    }
});

console.log(`Modified ${modified} files.`);
