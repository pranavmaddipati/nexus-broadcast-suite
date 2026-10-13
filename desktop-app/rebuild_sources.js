const fs = require('fs');
let code = fs.readFileSync('c:/broadcast-suite3/desktop-app/src/components/SourcesPanel.tsx', 'utf8');

const cutIdx = code.indexOf('  // Global Actions');
if (cutIdx !== -1) {
  code = code.substring(0, cutIdx);
}

const restOfComponent = `  // Global Actions
  const handleDelete = useCallback((ids: string[]) => {
    if (typeof saveStateForUndo === 'function') saveStateForUndo()
    setScenes(prev => InputManager.deleteSources(prev, activeScene, ids))
    setSelectedSourceIds([])
  }, [activeScene, setScenes, saveStateForUndo, setSelectedSourceIds])

  const handleDuplicate = useCallback((ids: string[]) => {
    if (typeof saveStateForUndo === 'function') saveStateForUndo()
    setScenes(prev => InputManager.duplicateSources(prev, activeScene, ids))
  }, [activeScene, setScenes, saveStateForUndo])

  const handleRename = useCallback((id: string) => {
    const src = sources.find(s => s.id === id)
    if (!src) return
    const newName = prompt('Rename Source:', src.name)
    if (newName && newName.trim()) {
      if (typeof saveStateForUndo === 'function') saveStateForUndo()
      setScenes(prev => prev.map(sc => sc.id === activeScene ? { ...sc, sources: sc.sources.map(s => s.id === id ? { ...s, name: newName.trim() } : s) } : sc))
    }
  }, [activeScene, sources, setScenes, saveStateForUndo])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setSelectedSourceIds(visibleSources.map(v => v.source.id))
        return
      }

      if (selectedSourceIds.length === 0) return

      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        const src = sources.find(s => s.id === selectedSourceIds[0])
        if (src) setClipboardSource(src)
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'v' && clipboardSource) {
        if (typeof saveStateForUndo === 'function') saveStateForUndo()
        const newId = \`src_\${Date.now()}_\${Math.random().toString(36).substr(2, 4)}\`
        const newSrc = { ...JSON.parse(JSON.stringify(clipboardSource)), id: newId, name: \`\${clipboardSource.name} (Pasted)\`, parentId: undefined }
        setScenes(prev => prev.map(sc => sc.id === activeScene ? { ...sc, sources: [newSrc, ...sc.sources] } : sc))
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        handleDuplicate(selectedSourceIds)
      }
      if (e.key === 'Delete') {
        e.preventDefault()
        handleDelete(selectedSourceIds)
      }
      if (e.key === 'F2' && selectedSourceIds.length === 1) {
        e.preventDefault()
        handleRename(selectedSourceIds[0])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSourceIds, sources, clipboardSource, setClipboardSource, activeScene, setScenes, handleDelete, handleDuplicate, handleRename, saveStateForUndo, visibleSources, setSelectedSourceIds])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020408' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Filter sources..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: '#020408', border: '1px solid #1e293b', color: '#f8fafc', padding: '4px 8px 4px 28px', borderRadius: '4px', fontSize: '12px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Sources List Container */}
      <div 
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}
        onScroll={e => setScrollTop((e.target as HTMLDivElement).scrollTop)}
      >
        <div style={{ height: \`\${visibleSources.length * ROW_HEIGHT}px\`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: \`translateY(\${startIndex * ROW_HEIGHT}px)\` }}>
            {visibleSubset.map((item) => {
              const videos = Array.isArray(videoElements) ? videoElements : Object.values(videoElements ?? {});
              const images = Array.isArray(imageElements) ? imageElements : Object.values(imageElements ?? {});
              return (
              <SourceCard 
                key={item.source.id}
                source={item.source}
                index={startIndex + localIdx}
                depth={item.depth}
                isSelected={selectedSourceIds.includes(item.source.id)}
                isExpanded={expandedGroups.has(item.source.id)}
                isActiveSceneLive={isActiveSceneLive}
                onToggleExpand={handleToggleExpand}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onToggleMute={handleToggleMute}
                onContextMenu={handleContextMenu}
                onClick={handleItemClick}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                videoElement={videos.find(v => v.id === item.source.id)?.element}
                imageElement={images.find(i => i.id === item.source.id)?.element}
              />
            )})}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderTop: '1px solid #1e293b', background: '#020408' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setShowAddModal(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Source
          </button>
          <button onClick={() => handleDelete(selectedSourceIds)} disabled={selectedSourceIds.length === 0} style={{ background: 'transparent', color: selectedSourceIds.length > 0 ? '#ef4444' : '#475569', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '4px', cursor: selectedSourceIds.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>

      {showAddModal && (
        <InputSelectionDialog 
          onClose={() => setShowAddModal(false)} 
          onAddSource={(type, name, settings) => {
            if (typeof saveStateForUndo === "function") saveStateForUndo();
            const { newScenes, addedSource } = InputManager.addSource(scenes, activeScene, type as any, name, { settings });
            setScenes(newScenes);
            setSelectedSourceIds([addedSource.id]);
            setShowAddModal(false);
          }}
        />
      )}

      {contextMenuSourceId && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          onClose={() => setContextMenuSourceId(null)}
          items={[
            { label: 'Rename', action: () => handleRename(contextMenuSourceId) },
            { label: 'Duplicate', action: () => handleDuplicate(selectedSourceIds.includes(contextMenuSourceId) ? selectedSourceIds : [contextMenuSourceId]) },
            { label: 'Copy', action: () => {
              const src = sources.find(s => s.id === contextMenuSourceId)
              if (src) setClipboardSource(src)
            }},
            { label: 'Paste', action: () => {
              if (clipboardSource) {
                if (typeof saveStateForUndo === 'function') saveStateForUndo()
                const newId = \`src_\${Date.now()}_\${Math.random().toString(36).substr(2, 4)}\`
                const newSrc = { ...JSON.parse(JSON.stringify(clipboardSource)), id: newId, name: \`\${clipboardSource.name} (Pasted)\`, parentId: undefined }
                setScenes(prev => prev.map(sc => sc.id === activeScene ? { ...sc, sources: [newSrc, ...sc.sources] } : sc))
              }
            }},
            { label: '', separator: true, action: () => {} },
            { label: 'Move Up', action: () => setScenes(prev => InputManager.reorderSource(prev, activeScene, contextMenuSourceId, 'up')) },
            { label: 'Move Down', action: () => setScenes(prev => InputManager.reorderSource(prev, activeScene, contextMenuSourceId, 'down')) },
            { label: 'Move To Top', action: () => setScenes(prev => InputManager.reorderSource(prev, activeScene, contextMenuSourceId, 'top')) },
            { label: 'Move To Bottom', action: () => setScenes(prev => InputManager.reorderSource(prev, activeScene, contextMenuSourceId, 'bottom')) },
            { label: '', separator: true, action: () => {} },
            { label: 'Delete', action: () => handleDelete(selectedSourceIds.includes(contextMenuSourceId) ? selectedSourceIds : [contextMenuSourceId]), danger: true }
          ]}
        />
      )}
    </div>
  )
}
`;

code += restOfComponent;
fs.writeFileSync('c:/broadcast-suite3/desktop-app/src/components/SourcesPanel.tsx', code);
