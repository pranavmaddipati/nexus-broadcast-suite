import re

file_path = 'c:/broadcast-suite3/desktop-app/src/context/BroadcastContext.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the useState declarations with Zustand bridges and the initialization effect
state_regex = re.compile(r'  const \[scenes, setScenes\] = useState<Scene\[\]>\(\(\) => \{[\s\S]*?\}, \[\]\)', re.MULTILINE)

new_state_code = '''  const scenes = useBroadcastStore(state => state.scenes)
  const activeScene = useBroadcastStore(state => state.previewSceneId)
  const liveScene = useBroadcastStore(state => state.programSceneId)
  
  const setScenes = useCallback((updater: React.SetStateAction<Scene[]>) => {
    useBroadcastStore.setState(prev => ({
      scenes: typeof updater === 'function' ? updater(prev.scenes) : updater
    }))
  }, [])

  const setActiveScene = useCallback((updater: React.SetStateAction<SceneId>) => {
    useBroadcastStore.setState(prev => ({
      previewSceneId: typeof updater === 'function' ? updater(prev.previewSceneId) : updater
    }))
  }, [])

  const setLiveScene = useCallback((updater: React.SetStateAction<SceneId>) => {
    useBroadcastStore.setState(prev => ({
      programSceneId: typeof updater === 'function' ? updater(prev.programSceneId) : updater
    }))
  }, [])

  const [activeMediaFiles, setActiveMediaFiles] = useState<Record<string, string>>({})

  // Initialize from file/localStorage ONCE
  useEffect(() => {
    let initialScenes = null;
    try {
      console.log('Stage 5: SceneManager initialized');
      if (typeof window.require !== "undefined") {
        const fs = window.require("fs")
        const path = window.require("path")
        const filePath = path.join(process.cwd(), "project.json")
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, "utf-8")
          initialScenes = JSON.parse(fileContent).scenes
        }
      }
    } catch (err) {
      console.error('SceneManager init failed:', err)
    }

    const defaultScenes = [
      {
        id: 'scene_worship', name: 'Worship', duration: '00:00:00', transitionType: 'fade', pinned: true,
        thumbnailUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sources: [
          {
            id: 'src_cam1', name: 'Camera 1', type: 'camera', visible: true, locked: true,
            x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0,
            settings: { deviceId: 'default' }, filters: [],
            volume: 80, muted: false, monitor: 'monitor_and_output', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false
          },
          {
            id: 'src_bg', name: 'Worship Background', type: 'media', visible: true, locked: true,
            x: 0, y: 0, width: 1920, height: 1080, opacity: 0.8,
            settings: { filePath: 'https://www.w3schools.com/html/mov_bbb.mp4' }, filters: [],
            volume: 60, muted: false, monitor: 'monitor_and_output', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false
          },
          {
            id: 'src_lyrics', name: 'Lower Third - Lyrics', type: 'text', visible: true, locked: false,
            x: 0, y: 500, width: 1920, height: 400, opacity: 1.0,
            settings: { textContent: 'JESUS\\nNAME ABOVE ALL NAMES', textColor: '#ffffff' },
            filters: [
              { id: 'f1', type: 'opacity', enabled: true, settings: {} },
              { id: 'f2', type: 'shadow', enabled: true, settings: {} },
              { id: 'f4', type: 'corner_pin', enabled: true, settings: {} }
            ],
            volume: 0, muted: true, monitor: 'off', balance: 0, audioGain: 0, audioDelay: 0, compressorEnabled: false, limiterEnabled: false, noiseGateEnabled: false
          }
        ]
      },
      { id: 'scene_sermon', name: 'Sermon', duration: '00:00:00', transitionType: 'fade', pinned: true, thumbnailUrl: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', sources: [] },
      { id: 'scene_welcome', name: 'Welcome', duration: '00:00:00', transitionType: 'fade', pinned: true, thumbnailUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', sources: [] }
    ];

    const finalScenes = initialScenes || getInitialState("scenes", defaultScenes);

    useBroadcastStore.setState({ 
      scenes: finalScenes,
      previewSceneId: getInitialState('activeScene', 'scene_worship'),
      programSceneId: getInitialState('liveScene', 'scene_worship')
    });
  }, [])
'''
content = state_regex.sub(new_state_code, content)

# 2. Replace the RenderScheduler fallback logic and dependencies
render_regex = re.compile(r'          const currentScenes = state\.scenes && state\.scenes\.length > 0 \? state\.scenes : \(scenes \|\| \[\]\);\s*const activeScene = state\.previewSceneId;\s*const liveScene = state\.programSceneId;\s*const isTransitioning = state\.isTransitioning;\s*const transitionProgress = state\.transitionProgress;\s*const transitionType = state\.activeTransition;', re.MULTILINE)

new_render_code = '''          const currentScenes = state.scenes || [];
          
          const activeScene = state.previewSceneId;
          const liveScene = state.programSceneId;
          const isTransitioning = state.isTransitioning;
          const transitionProgress = state.transitionProgress;
          const transitionType = state.activeTransition;'''
content = render_regex.sub(new_render_code, content)

# 3. Replace the dependencies of RenderScheduler
deps_regex = re.compile(r'    \}, \[scenes, activeScene, liveScene, isTransitioning, transitionProgress, transitionType, virtualCameraSettings, \r?\n?activeOverlays, programFilters\]\)', re.MULTILINE)
new_deps = '    }, [virtualCameraSettings, activeOverlays, programFilters])'
content = deps_regex.sub(new_deps, content)

# 4. Same for one line version
deps_regex2 = re.compile(r'    \}, \[scenes, activeScene, liveScene, isTransitioning, transitionProgress, transitionType, virtualCameraSettings, activeOverlays, programFilters\]\)', re.MULTILINE)
content = deps_regex2.sub(new_deps, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched BroadcastContext.tsx")
