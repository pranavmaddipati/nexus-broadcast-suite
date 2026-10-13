const fs = require('fs')

let sl = fs.readFileSync('src/components/SceneLibrary.tsx', 'utf-8')

const renderBlockOld = `
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
                <div className="item-drag-handle" style={{ padding: '0 4px', height: '100%', display: 'flex', alignItems: 'center' }}>
                  <GripVertical size={14} />
                </div>
                
                {scene.isFolder ? (
                  <div onClick={toggleFolder} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '4px', height: '68px' }}>
                    {expandedFolders.has(scene.id) ? <FolderOpen size={16} color="#94a3b8" /> : <Folder size={16} color="#94a3b8" />}
                    <span className="item-name-label" style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 600 }}>{scene.name}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center', minWidth: 0 }}>
                    <div style={{ width: '120px', height: '68px', background: '#0a0e17', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {scene.thumbnailUrl ? <img src={scene.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Palette size={20} color={scene.colorLabel || '#334155'} />}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="item-name-label" title={scene.notes || scene.name} style={{ textDecoration: scene.visible === false ? 'line-through' : 'none', fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>
                            {scene.name}
                          </span>
                          {scene.locked ? <Lock size={12} color="#ef4444" /> : null}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {isPreview && <span style={{ background: '#10b981', color: '#fff', padding: '2px 4px', borderRadius: '2px', fontSize: '9px', fontWeight: 900 }}>PRV</span>}
                          {isLive && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 4px', borderRadius: '2px', fontSize: '9px', fontWeight: 900 }}>LIVE</span>}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
                        <span>{(scene.sources || []).length} Sources</span>
                        <span>•</span>
                        <span>{scene.duration || '00:00:00'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="item-actions" onClick={e => e.stopPropagation()} style={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', padding: '0 4px' }}>
                  <button className="action-btn-small" onClick={() => togglePinScene(scene.id)} title={scene.pinned ? 'Unpin' : 'Pin'}>
                    {scene.pinned ? <Pin size={13} className="text-blue" /> : <PinOff size={13} />}
                  </button>
                  <button className="action-btn-small" onClick={() => handleRename(scene.id, scene.name)} title="Rename">
                    <Edit3 size={13} />
                  </button>
                  {scenes.length > 1 && (
                    <button className="action-btn-small delete" onClick={() => deleteScene(scene.id)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>`

sl = sl.replace(renderBlockOld, renderBlockNew)

fs.writeFileSync('src/components/SceneLibrary.tsx', sl)

console.log('Update completed')
