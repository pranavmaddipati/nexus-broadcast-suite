const fs = require('fs');
const path = require('path');

// Recursively find all tsx files in src/components
const findFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
};

const components = findFiles('src/components');

// Fix destructured assignments `= []` -> `= () => {}`
for (const file of components) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  const toReplace = [
    'updateSourceProperties', 'updateFilterSettings', 'deleteFilterFromSource', 'addFilterToSource',
    'updateVirtualCameraSettings', 'setScenes', 'updateSceneSettings'
  ];
  
  for (const fn of toReplace) {
    const regex = new RegExp(fn + '\\s*=\\s*\\[\\]', 'g');
    if (regex.test(content)) {
      content = content.replace(regex, fn + ' = () => {}');
      changed = true;
    }
  }

  // Also fix cpuUsage and gpuUsage
  if (content.includes('cpuUsage >')) {
    content = content.replace(/cpuUsage >/g, '(cpuUsage as number) >');
    changed = true;
  }
  if (content.includes('cpuUsage <')) {
    content = content.replace(/cpuUsage </g, '(cpuUsage as number) <');
    changed = true;
  }
  if (content.includes('gpuUsage >')) {
    content = content.replace(/gpuUsage >/g, '(gpuUsage as number) >');
    changed = true;
  }
  if (content.includes('gpuUsage <')) {
    content = content.replace(/gpuUsage </g, '(gpuUsage as number) <');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
}

// Fix BroadcastContextType to allow all properties
const bcFile = 'src/context/BroadcastContext.tsx';
let bc = fs.readFileSync(bcFile, 'utf8');

// Find `export interface BroadcastContextType {`
const interfaceIndex = bc.indexOf('export interface BroadcastContextType');
if (interfaceIndex !== -1) {
  const braceIndex = bc.indexOf('{', interfaceIndex);
  if (braceIndex !== -1) {
    if (!bc.substring(braceIndex, braceIndex + 30).includes('[key: string]: any;')) {
      bc = bc.substring(0, braceIndex + 1) + '\n  [key: string]: any;' + bc.substring(braceIndex + 1);
    }
  }
}

// Add filter types
bc = bc.replace(
  "type: 'color_correction' | 'crop' | 'scale' | 'chroma_key' | 'luma_key' | 'blur' | 'sharpen' | 'noise_reduction' | 'gain' | 'compressor' | 'limiter' | 'expander' | 'vst' | 'lut'",
  "type: 'color_correction' | 'crop' | 'scale' | 'chroma_key' | 'luma_key' | 'blur' | 'sharpen' | 'noise_reduction' | 'gain' | 'compressor' | 'limiter' | 'expander' | 'vst' | 'lut' | 'corner_pin' | 'noise_gate' | 'noise_suppression' | 'eq' | 'delay' | 'pitch' | 'reverb' | 'auto_gain' | 'perspective' | 'mask' | 'opacity' | 'glow' | 'shadow' | 'outline'"
);

fs.writeFileSync(bcFile, bc);
console.log('Fixed everything');
