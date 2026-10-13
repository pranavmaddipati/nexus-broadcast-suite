const fs = require('fs');

// Patch SceneRenderer.ts
const srPath = 'c:\\broadcast-suite3\\desktop-app\\src\\engine\\SceneRenderer.ts';
let srContent = fs.readFileSync(srPath, 'utf8');

if (!srContent.includes('getSortedSources')) {
  srContent = srContent.replace(
    /export class SceneRenderer \{/,
    `export class SceneRenderer {\n  private static getSortedSources(scene: any) {\n    if (!scene || !scene.sources) return [];\n    return [...scene.sources].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));\n  }`
  );

  srContent = srContent.replace(
    /public static renderScene\(.*?\{/,
    `$&
    const renderSources = this.getSortedSources(scene);`
  );

  srContent = srContent.replace(/scene\.sources/g, 'renderSources');

  // Fix loops in SceneRenderer to go forwards instead of backwards
  // Original: for (let i = (renderSources?.length || 0) - 1; i >= 0; i--)
  srContent = srContent.replace(
    /for \(let i = \(renderSources\?\.length \|\| 0\) - 1; i >= 0; i--\) \{/g,
    `for (let i = 0; i < renderSources.length; i++) {`
  );

  fs.writeFileSync(srPath, srContent, 'utf8');
  console.log('Patched SceneRenderer.ts');
}

// Patch PreviewMonitor.tsx
const pmPath = 'c:\\broadcast-suite3\\desktop-app\\src\\components\\PreviewMonitor.tsx';
let pmContent = fs.readFileSync(pmPath, 'utf8');

// We need to fix the hit test logic to use sorted sources
if (!pmContent.includes('const renderSources = [...currentScene.sources].sort')) {
  pmContent = pmContent.replace(
    /let hitSourceId: string \| null = null\s*for \(let i = currentScene\.sources\.length - 1; i >= 0; i--\) \{/,
    `let hitSourceId: string | null = null
      const renderSources = [...currentScene.sources].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      for (let i = renderSources.length - 1; i >= 0; i--) {`
  );
  // Need to only replace the first occurrence after that point? 
  // No, I can just do a multi_replace instead if it fails, but this script will do:
  pmContent = pmContent.replace(
    /const src = currentScene\.sources\[i\]/,
    `const src = renderSources[i]`
  );

  fs.writeFileSync(pmPath, pmContent, 'utf8');
  console.log('Patched PreviewMonitor.tsx');
}
