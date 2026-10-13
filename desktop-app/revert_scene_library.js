const fs = require('fs')

let sl = fs.readFileSync('src/components/SceneLibrary.tsx', 'utf-8')

const renderBlockOld = `
              <div
                key={scene.id}
                className={\`scene-library-card \${isSelected ? 'selected' : ''}\`}
                style={{ 
                  opacity: scene.visible === false ? 0.5 : 1,
                  borderBottom: scene.colorLabel ? \`2px solid \${scene.colorLabel}\` : '2px solid transparent'
                }}
                draggable
                onDragStart={e => handleDragStart(e, scene)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, scene)}
                onClick={e => handleItemClick(e, scene)}
                onDoubleClick={() => { if (!scene.isFolder) { selectScene(scene.id); takeLive(); } else toggleFolder({} as any) }}
                onContextMenu={e => handleContextMenu(e, scene.id)}
              >
                {scene.isFolder ? (
                  <div className="folder-card" onClick={toggleFolder}>
                    {expandedFolders.has(scene.id) ? <FolderOpen size={32} color="#94a3b8" /> : <Folder size={32} color="#94a3b8" />}
                    <span className="folder-name">{scene.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="card-thumbnail">
                      {scene.thumbnailUrl ? <img src={scene.thumbnailUrl} /> : <div className="placeholder-thumb"><Palette size={24} color={scene.colorLabel || '#334155'} /></div>}
                      <div className="card-badges">
                        {isPreview && <span className="badge-prv">PRV</span>}
                        {isLive && <span className="badge-live">LIVE</span>}
                      </div>
                    </div>
                    <div className="card-info">
                      <div className="card-title">
                        {scene.locked && <Lock size={10} color="#ef4444" />}
                        <span style={{ textDecoration: scene.visible === false ? 'line-through' : 'none' }}>{scene.name}</span>
                      </div>
                      <div className="card-meta">
                        <span>{(scene.sources || []).length} Sources</span>
                        <span>{scene.duration || '00:00:00'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>`

const renderBlockNew = `
              <div
                key={scene.id}
                className={\`scene-library-item \${isSelected ? 'selected-highlight' : ''} \${isPreview && !isSelected ? 'preview-highlight' : ''} \${isLive && !isSelected ? 'live-highlight' : ''}\`}
                style={{ 
                  marginLeft: scene.folderId ? '16px' : '0', 
                  borderLeft: scene.colorLabel ? \`3px solid \${scene.colorLabel}\` : '1px solid var(--border-console)',
                  opacity: scene.visible === false ? 0.5 : 1
                }}
                draggable
                onDragStart={e => handleDragStart(e, scene)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, scene)}
                onClick={e => handleItemClick(e, scene)}
                onDoubleClick={() => { if (!scene.isFolder) { selectScene(scene.id); takeLive(); } else toggleFolder({} as any) }}
                onContextMenu={e => handleContextMenu(e, scene.id)}
              >
                <div className="item-drag-handle">
                  <GripVertical size={12} />
                </div>
                
                {scene.isFolder ? (
                  <div onClick={toggleFolder} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                    {expandedFolders.has(scene.id) ? <FolderOpen size={12} color="#94a3b8" /> : <Folder size={12} color="#94a3b8" />}
                    <span className="item-name-label" style={{ marginLeft: '4px' }}>{scene.name}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', minWidth: 0 }}>
                    <div style={{ width: '48px', height: '27px', background: '#0a0e17', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {scene.thumbnailUrl ? <img src={scene.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Palette size={10} color={scene.colorLabel || '#334155'} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="item-name-label" title={scene.notes || scene.name} style={{ textDecoration: scene.visible === false ? 'line-through' : 'none', fontWeight: 600, fontSize: '12px' }}>
                          {scene.name}
                        </span>
                        {scene.locked ? <Lock size={10} color="#ef4444" /> : null}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b' }}>
                        <span>{(scene.sources || []).length} src</span>
                        {isPreview && <span style={{ background: '#10b981', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontSize: '8px', fontWeight: 800 }}>PRV</span>}
                        {isLive && <span style={{ background: '#ef4444', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontSize: '8px', fontWeight: 800 }}>LIVE</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="item-actions" onClick={e => e.stopPropagation()}>
                  <button className="action-btn-small" onClick={() => togglePinScene(scene.id)} title={scene.pinned ? 'Unpin' : 'Pin'}>
                    {scene.pinned ? <Pin size={11} className="text-blue" /> : <PinOff size={11} />}
                  </button>
                  <button className="action-btn-small" onClick={() => handleRename(scene.id, scene.name)} title="Rename">
                    <Edit3 size={11} />
                  </button>
                  {scenes.length > 1 && (
                    <button className="action-btn-small delete" onClick={() => deleteScene(scene.id)} title="Delete">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>`

sl = sl.replace('className="scene-library-grid"', 'className="scene-items-list"')
sl = sl.replace(renderBlockOld, renderBlockNew)

fs.writeFileSync('src/components/SceneLibrary.tsx', sl)

// Clean App.css and remove the grid styles
let css = fs.readFileSync('src/App.css', 'utf-8')

const removeRegex = /\.scene-library-grid[\s\S]*?(?=\n\.[\w-]+ {|\Z)/g
css = css.replace(removeRegex, '')

const newCss = `
.scene-items-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  min-height: 0;
}

.scene-library-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--bg-panel);
  border: 1px solid var(--border-console);
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.1s ease;
}

.scene-library-item:hover {
  background: var(--bg-panel-dark);
}

.scene-library-item.selected-highlight {
  background: rgba(59, 130, 246, 0.15) !important;
  border-color: #3b82f6 !important;
}

.scene-library-item.preview-highlight {
  background: rgba(16, 185, 129, 0.1) !important;
  border-color: #10b981 !important;
}

.scene-library-item.live-highlight {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
}
`

css += newCss
fs.writeFileSync('src/App.css', css)

console.log('Update completed')
