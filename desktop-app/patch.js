const fs = require('fs');

function instrumentPreviewMonitor() {
  const file = 'src/components/PreviewMonitor.tsx';
  let code = fs.readFileSync(file, 'utf8');

  const logStr = (name) => \`
    console.log("Before \${name}");
    console.log("Scene:", structuredClone(currentScene));
    console.log("Sources:", structuredClone(currentScene?.sources));
    console.log("Video elements:", structuredClone(videoElements));
  \`;

  const logStrAfter = (name) => \`
    console.log("After \${name}");
    console.log("Scene:", structuredClone(currentScene));
    console.log("Sources:", structuredClone(currentScene?.sources));
    console.log("Video elements:", structuredClone(videoElements));
  \`;

  code = code.replace(
    'const handlePointerDown = (e: React.PointerEvent) => {',
    'const handlePointerDown = (e: React.PointerEvent) => {\\n' + logStr('pointerDown')
  );
  code = code.replace(
    '        toggleSourceSelection(hitSourceId, true)\\n        }\\n        \\n        const hitSource = currentScene.sources.find(s => s.id === hitSourceId)',
    '        toggleSourceSelection(hitSourceId, true)\\n        }\\n        \\n        const hitSource = currentScene.sources.find(s => s.id === hitSourceId)'
  );
  // We need to inject after the try catch block for pointerDown, pointerMove, pointerUp
  
  // handlePointerDown
  code = code.replace(/const handlePointerDown = \\(e: React\\.PointerEvent\\) => \\{\\s*try \\{/, (m) => \`const handlePointerDown = (e: React.PointerEvent) => {
    \${logStr('pointerDown')}
    try {\`);
  code = code.replace(/debugger;\\n    \\}\\n  \\}/g, (m) => \`debugger;\\n    }\\n    \${logStrAfter('pointerDown')}\\n  }\`);
  // Wait, there are multiple debugger; in catch blocks.
  // Let's do it manually.
  
  fs.writeFileSync(file, code);
}

function instrumentBroadcastContext() {
  const file = 'src/context/BroadcastContext.tsx';
  let code = fs.readFileSync(file, 'utf8');

  const logStr = (name) => \`
    console.log("Before \${name}");
    console.log("Scene:", structuredClone(scenes.find(s=>s.id===activeScene)));
    console.log("Sources:", structuredClone(scenes.find(s=>s.id===activeScene)?.sources));
    console.log("Video elements:", structuredClone(videoElements));
  \`;

  const logStrAfter = (name) => \`
    console.log("After \${name}");
    console.log("Scene:", structuredClone(scenes.find(s=>s.id===activeScene)));
    console.log("Sources:", structuredClone(scenes.find(s=>s.id===activeScene)?.sources));
    console.log("Video elements:", structuredClone(videoElements));
  \`;

  code = code.replace(
    'const saveStateForUndo = () => {',
    'const saveStateForUndo = () => {\\n' + logStr('saveStateForUndo()')
  );
  code = code.replace(
    'pushToUndoStack(scenes)\\n  }',
    'pushToUndoStack(scenes)\\n' + logStrAfter('saveStateForUndo()') + '\\n  }'
  );

  code = code.replace(
    'const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {\\n    try {',
    'const updateSourceProperties = (sceneId: SceneId, sourceId: string, updates: Partial<SceneSource>) => {\\n' + logStr('updateSource()') + '\\n    try {'
  );
  
  // setScenes wrapper
  code = code.replace(
    'const [scenes, setScenes] = useState<Scene[]>(',
    'const [scenes, _setScenes] = useState<Scene[]>('
  );
  
  code = code.replace(
    /\\}\\)\\n\\n  useEffect\\(\\(\\) => \\{/g,
    \`})\\n\\n  const setScenes = (val) => {\\n\${logStr('setScenes()')}\\n_setScenes(val);\\n\${logStrAfter('setScenes()')}\\n  }\\n\\n  useEffect(() => {\`
  );

  // setActiveScene wrapper
  code = code.replace(
    'const [activeScene, setActiveScene] = useState<SceneId>(() => getInitialState(\\'activeScene\\', \\'scene_default_1\\'))',
    \`const [activeScene, _setActiveScene] = useState<SceneId>(() => getInitialState('activeScene', 'scene_default_1'))
  const setActiveScene = (val: any) => {
    \${logStr('setActiveScene()')}
    _setActiveScene(val);
    \${logStrAfter('setActiveScene()')}
  }\`
  );

  fs.writeFileSync(file, code);
}

function instrumentSourcesPanel() {
  const file = 'src/components/SourcesPanel.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Wrap every .find(), .map(), .filter(), and .forEach() in SourcesPanel with:
  // console.assert(Array.isArray(value), "Expected array", value)

  // This is best done with regex replacing the exact patterns I identified.
  
  const replacements = [
    {
      find: 'const currentScene = (scenes || []).find',
      replace: 'const currentScene = (console.assert(Array.isArray(scenes || []), "Expected array", scenes || []), scenes || []).find'
    },
    {
      find: 'const visibleSources = sources.filter',
      replace: 'const visibleSources = (console.assert(Array.isArray(sources), "Expected array", sources), sources).filter'
    },
    {
      find: 'const src = sources.find(s => s.id === id)',
      replace: 'const src = (console.assert(Array.isArray(sources), "Expected array", sources), sources).find(s => s.id === id)'
    },
    {
      find: '{ ...sc, sources: sc.sources.map(s => s.id === id',
      replace: '{ ...sc, sources: (console.assert(Array.isArray(sc.sources), "Expected array", sc.sources), sc.sources).map(s => s.id === id'
    },
    {
      find: 'if (selectedSourceIds.includes(id)) setSelectedSourceIds(selectedSourceIds.filter(x => x !== id))',
      replace: 'if (selectedSourceIds.includes(id)) setSelectedSourceIds((console.assert(Array.isArray(selectedSourceIds), "Expected array", selectedSourceIds), selectedSourceIds).filter(x => x !== id))'
    },
    {
      find: 'setSelectedSourceIds(visibleSources.map(v => v.id))',
      replace: 'setSelectedSourceIds((console.assert(Array.isArray(visibleSources), "Expected array", visibleSources), visibleSources).map(v => v.id))'
    },
    {
      find: 'const src = sources.find(s => s.id === selectedSourceIds[0])',
      replace: 'const src = (console.assert(Array.isArray(sources), "Expected array", sources), sources).find(s => s.id === selectedSourceIds[0])'
    },
    {
      find: '{visibleSources.map((source) => (',
      replace: '{(console.assert(Array.isArray(visibleSources), "Expected array", visibleSources), visibleSources).map((source) => ('
    },
    {
      find: 'videoElement={elements.find((v: any) => v.id === source.id)?.element}',
      replace: 'videoElement={(console.assert(Array.isArray(elements), "Expected array", elements), elements).find((v: any) => v.id === source.id)?.element}'
    },
    {
      find: 'const src = sources.find(s => s.id === contextMenuSourceId)',
      replace: 'const src = (console.assert(Array.isArray(sources), "Expected array", sources), sources).find(s => s.id === contextMenuSourceId)'
    }
  ];

  for (let r of replacements) {
    code = code.replace(r.find, r.replace);
  }

  // prev.map is used a lot.
  code = code.replace(
    /setScenes\\(prev => prev.map\\(sc/g,
    'setScenes(prev => (console.assert(Array.isArray(prev), "Expected array", prev), prev).map(sc'
  );
  
  // Check for any remaining unguarded finds, maps, filters, forEachs
  
  fs.writeFileSync(file, code);
}

// execute
// instrumentPreviewMonitor();
instrumentBroadcastContext();
instrumentSourcesPanel();
