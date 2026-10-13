const fs = require('fs');

let content = fs.readFileSync('src/components/SourcesPanel.tsx', 'utf8');

// 1. Add ContextMenu import if not there
if (!content.includes('import { ContextMenu } from')) {
    content = content.replace(/import { SourceSettingsModal } from '.\/SourceSettingsModal'/, "import { SourceSettingsModal } from './SourceSettingsModal'\nimport { ContextMenu } from './ContextMenu'\nimport type { ContextMenuItem } from './ContextMenu'");
}

// 2. Add state
const stateVars = `
  const [contextMenuSourceId, setContextMenuSourceId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
`;

if (!content.includes('contextMenuSourceId')) {
    content = content.replace(/const \[selectedSourceId, setSelectedSourceId\] = useState<string \| null>\(null\)/, `const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)\n${stateVars}`);
}

// 3. Add context menu handlers
const contextMenuHandlers = `
  const handleContextMenu = (e: React.MouseEvent, sourceId: string) => {
    e.preventDefault()
    setContextMenuSourceId(sourceId)
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  React.useEffect(() => {
    const closeMenu = () => setContextMenuSourceId(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [])
`;

if (!content.includes('handleContextMenu')) {
    content = content.replace(/const handleCreateSourceSubmit = /, `${contextMenuHandlers}\n  const handleCreateSourceSubmit = `);
}

// 4. Inject onContextMenu into the source item div
// We need to find the main map for sources: `(sources || []).map((src, index) => (`
// The root element inside map is usually a div with onDragStart. Let's find it.
// The string is `<div\n              key={src.id}` ... `draggable`
content = content.replace(/<div\s+key={src.id}\s+draggable/g, `<div\n              key={src.id}\n              draggable\n              onContextMenu={e => handleContextMenu(e, src.id)}`);

// 5. Add ContextMenu rendering
const contextMenuRender = `
      {contextMenuSourceId && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setContextMenuSourceId(null)}
          items={[
            {
              label: 'Properties',
              icon: <Settings size={12} />,
              action: () => setSettingsSourceId(contextMenuSourceId)
            },
            {
              label: 'Filters',
              icon: <Sliders size={12} />,
              action: () => setFiltersSourceId(contextMenuSourceId)
            },
            { separator: true, label: '', action: () => {} },
            {
              label: 'Move Up',
              icon: <ArrowUp size={12} />,
              action: () => {
                const idx = sources.findIndex(s => s.id === contextMenuSourceId)
                if (idx > 0) handleMoveUp(idx)
              }
            },
            {
              label: 'Move Down',
              icon: <ArrowDown size={12} />,
              action: () => {
                const idx = sources.findIndex(s => s.id === contextMenuSourceId)
                if (idx !== -1 && idx < sources.length - 1) handleMoveDown(idx)
              }
            },
            { separator: true, label: '', action: () => {} },
            {
              label: 'Remove',
              icon: <Trash2 size={12} />,
              danger: true,
              action: () => {
                deleteSourceFromScene(activeScene, contextMenuSourceId)
              }
            }
          ]}
        />
      )}
      <SourceSettingsModal
`;

content = content.replace(/<SourceSettingsModal/, contextMenuRender);

fs.writeFileSync('src/components/SourcesPanel.tsx', content);
console.log('SourcesPanel patched with ContextMenu');
