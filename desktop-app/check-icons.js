const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const iconsToCheck = [
  'Plus', 'Trash2', 'Settings', 'FolderPlus', 'Pin', 'ChevronUp', 
  'ChevronDown', 'GripVertical', 'LayoutGrid', 'Monitor', 'Camera', 
  'Copy', 'Eye', 'EyeOff', 'Video', 'Mic', 'Network', 'Share2', 'Settings2',
  'Activity', 'HardDrive', 'Cpu', 'AlertCircle', 'RefreshCw', 'User', 'Bell', 'Cloud'
];

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if lucide-react is imported
    const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
    const importedIcons = importMatch 
      ? importMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]) 
      : [];
    
    let missing = [];
    iconsToCheck.forEach(icon => {
      const regex = new RegExp(`<${icon}[\\s/>]`, 'g');
      if (regex.test(content) && !importedIcons.includes(icon)) {
        missing.push(icon);
      }
    });

    if (missing.length > 0) {
      console.log(`${filePath} is missing imports for: ${missing.join(', ')}`);
    }
  }
});
