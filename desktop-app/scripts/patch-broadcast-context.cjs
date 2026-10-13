const fs = require('fs');
const path = require('path');

const ctxPath = path.join(__dirname, '..', 'src', 'context', 'NewBroadcastContext.tsx');
let content = fs.readFileSync(ctxPath, 'utf8');

// 1. Update initial scene state to default to scene_main_news and scene_opening_montage
content = content.replace(
  "getInitialState('activeScene', 'scene_sermon')",
  "getInitialState('activeScene', 'scene_main_news')"
);
content = content.replace(
  "getInitialState('liveScene', 'scene_sermon')",
  "getInitialState('liveScene', 'scene_opening_montage')"
);

// 2. In getInitialState, reject legacy/corrupt scenes
if (!content.includes('isLegacySaved')) {
  const target = "if (key === 'scenes' && Array.isArray(val)) {";
  const replacement = `if (key === 'scenes' && Array.isArray(val)) {
            const isLegacySaved = val.some((s) => s.id === 'scene_worship' || s.id === 'scene_sermon' || (s.id && s.id.includes('jk')));
            if (isLegacySaved) return defaultValue;`;
  content = content.replace(target, replacement);

  const activeTarget = "return val\n        }";
  const activeReplacement = `if (key === 'activeScene' && (val === 'scene_sermon' || val === 'scene_worship' || (val && val.includes('jk')))) return 'scene_main_news';
          if (key === 'liveScene' && (val === 'scene_sermon' || val === 'scene_worship' || (val && val.includes('jk')))) return 'scene_opening_montage';
          return val
        }`;
  // Try CRLF or LF replacement
  if (content.includes("return val\r\n        }")) {
    content = content.replace("return val\r\n        }", activeReplacement.replace(/\n/g, '\r\n'));
  } else {
    content = content.replace(activeTarget, activeReplacement);
  }
}

// 3. Add browser project.json sync hook if not present
if (!content.includes('sync-project-json-scenes')) {
  const hookTarget = "  const [activeMediaFiles, setActiveMediaFiles] = useState";
  const hookCode = `  // sync-project-json-scenes: In browser dev mode, ensure real project scenes are loaded
  useEffect(() => {
    fetch('/project.json')
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.scenes) && data.scenes.length >= 8) {
          setScenes(current => {
            const hasLegacy = current.some(s => s.id === 'scene_worship' || s.id === 'scene_sermon' || (s.id && s.id.includes('jk')));
            if (hasLegacy || current.length < 8) {
              setActiveScene('scene_main_news');
              setLiveScene('scene_opening_montage');
              return data.scenes;
            }
            return current;
          });
        }
      })
      .catch(() => {});
  }, []);

  const [activeMediaFiles, setActiveMediaFiles] = useState`;
  content = content.replace(hookTarget, hookCode);
}

fs.writeFileSync(ctxPath, content, 'utf8');
console.log('Successfully patched NewBroadcastContext.tsx');
