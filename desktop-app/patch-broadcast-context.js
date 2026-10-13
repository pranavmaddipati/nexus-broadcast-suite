const fs = require('fs');

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

function injectTryCatch(funcName, oldImplementation, newImplementation) {
    if (content.includes(oldImplementation)) {
        content = content.replace(oldImplementation, newImplementation);
        console.log(`Successfully patched: ${funcName}`);
    } else {
        console.log(`Failed to find target for: ${funcName}`);
    }
}

// 1. updateSourceProperties
const updateSourcePropertiesOld = `  const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {
    setScenes(prev => (prev || []).map(sc => {`;
const updateSourcePropertiesNew = `  const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {
    try {
      console.log('EVENT: updateSourceProperties', { sceneId, sourceId, updates });
      if (!sceneId) { console.error('updateSourceProperties: sceneId is missing'); return; }
      if (!sourceId) { console.error('updateSourceProperties: sourceId is missing'); return; }
      
      const targetScene = scenes.find(s => s.id === sceneId);
      if (!targetScene) { console.error('updateSourceProperties: Scene not found', sceneId); return; }
      
      const targetSource = targetScene.sources.find(s => s.id === sourceId);
      if (!targetSource) { console.error('updateSourceProperties: Source not found', sourceId); return; }
      
      console.log('State before update:', JSON.parse(JSON.stringify(targetSource)));
      
      setScenes(prev => (prev || []).map(sc => {`;

injectTryCatch('updateSourceProperties', updateSourcePropertiesOld, updateSourcePropertiesNew);

// Since we opened a try block, we need to close it at the end of updateSourceProperties
// updateSourceProperties ends at Line 1374:
//       }
//     }))
//   }
const updateSourcePropertiesEndOld = `      }
    }))
  }`;
const updateSourcePropertiesEndNew = `      }
    }))
    } catch (err: any) {
      console.error('================ REAL EXCEPTION ================');
      console.error('Component: BroadcastContext');
      console.error('File: src/context/BroadcastContext.tsx');
      console.error('Function: updateSourceProperties');
      console.error('Stack Trace:', err.stack);
      console.error('================================================');
      throw err;
    }
  }`;
// Because the exact ending might match multiple places, I'll use regex specific to the function end
const updateSourcePropertiesFull = content.substring(
    content.indexOf('  const updateSourceProperties ='),
    content.indexOf('  const addFilterToSource =')
);

// We replace the entire updateSourceProperties function
let updateSourcePropertiesReplaced = updateSourcePropertiesFull.replace(
  `  const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {`,
  `  const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {
    try {
      console.log('EVENT: updateSourceProperties', { sceneId, sourceId, updates });
      if (!sceneId) { console.error('updateSourceProperties: sceneId is missing'); return; }
      if (!sourceId) { console.error('updateSourceProperties: sourceId is missing'); return; }
      
      const targetScene = scenes.find(s => s.id === sceneId) || (typeof setScenes !== 'undefined' ? null : null); // Access scenes from closure but it's not in dependency array. Wait, context state is available.
      // Better to check inside the setScenes callback
`
);

fs.writeFileSync('src/context/BroadcastContext.tsx', content);
