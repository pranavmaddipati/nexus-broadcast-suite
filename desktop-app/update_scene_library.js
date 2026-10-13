const fs = require('fs')

let sl = fs.readFileSync('src/components/SceneLibrary.tsx', 'utf-8')

// Replace the render block inside scene-items-list
const renderBlockOld = `
              <div
                key={scene.id}
                className={itemClass}
                style={{ 
                  marginLeft: scene.folderId ? '16px' : '0', 
                  borderLeft: scene.colorLabel ? \`3px solid \${scene.colorLabel}\` : 'none',
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
                  <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center', minWidth: 0 }}>
                    <div style={{ width: '64px', height: '36px', background: '#0a0e17', border: '1px solid #1e293b', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {scene.thumbnailUrl ? <img src={scene.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Palette size={12} color={scene.colorLabel || '#334155'} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="item-name-label" title={scene.notes || scene.name} style={{ textDecoration: scene.visible === false ? 'line-through' : 'none', fontWeight: 600, fontSize: '13px' }}>
                          {scene.name}
                        </span>
                        {scene.locked ? <Lock size={10} color="#ef4444" /> : null}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b' }}>
                        <span>{(scene.sources || []).length} sources</span>
                        <span>•</span>
                        <span>{scene.duration || '00:00:00'}</span>
                        {isPreview && <span style={{ background: '#10b981', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontSize: '7px', fontWeight: 900 }}>PRV</span>}
                        {isLive && <span style={{ background: '#ef4444', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontSize: '7px', fontWeight: 900 }}>LIVE</span>}
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

const renderBlockNew = `
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

sl = sl.replace('className="scene-items-list"', 'className="scene-library-grid"')
sl = sl.replace(renderBlockOld, renderBlockNew)

fs.writeFileSync('src/components/SceneLibrary.tsx', sl)

// Clean App.css and add new grid styles
let css = fs.readFileSync('src/App.css', 'utf-8')

// Remove old Scene Matrix classes entirely
const removeRegex = /\.scene-matrix[\s\S]*?(?=\n\.[\w-]+ {)/g
css = css.replace(removeRegex, '')

const newCss = `
.scene-library-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 12px;
  align-content: start;
}

.scene-library-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-console);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
  position: relative;
}

.scene-library-card:hover {
  background: var(--bg-panel-dark);
  border-color: rgba(255,255,255,0.2);
}

.scene-library-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.card-thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  background: #0a0e17;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-thumb {
  opacity: 0.5;
}

.card-badges {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
}

.badge-prv, .badge-live {
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 9px;
  font-weight: 800;
  color: white;
}

.badge-prv {
  background: #10b981;
}

.badge-live {
  background: #ef4444;
}

.card-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

.folder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  height: 100%;
}

.folder-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}
`

css += newCss
fs.writeFileSync('src/App.css', css)

console.log('Update completed')
