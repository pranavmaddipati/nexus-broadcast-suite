const fs = require('fs')
let file = fs.readFileSync('src/components/SceneLibrary.tsx', 'utf-8')

// Change the list container style
file = file.replace(
  'className="scene-items-list"',
  'className="scene-items-list"\n        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", padding: "12px", alignContent: "start" }}'
)

// The item JSX starts around line 452
// I will replace the inside of the scene.isFolder ternary
const originalFolderFalse = `                  <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center', minWidth: 0 }}>
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
                  </div>`

const newCardGrid = `                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {/* Thumbnail */}
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#0a0e17', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                      {scene.thumbnailUrl ? <img src={scene.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Palette size={24} color={scene.colorLabel || '#334155'} />}
                      
                      {/* Badges overlaid on top right */}
                      <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                        {isPreview && <span style={{ background: '#10b981', color: '#fff', padding: '2px 4px', borderRadius: '2px', fontSize: '9px', fontWeight: 900, boxShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>PRV</span>}
                        {isLive && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 4px', borderRadius: '2px', fontSize: '9px', fontWeight: 900, boxShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>LIVE</span>}
                      </div>
                      
                      {/* Duration overlay bottom right */}
                      <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 4px', borderRadius: '2px', fontSize: '9px', fontWeight: 600 }}>
                        {scene.duration || '00:00:00'}
                      </div>
                    </div>
                    
                    {/* Meta info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="item-name-label" title={scene.notes || scene.name} style={{ textDecoration: scene.visible === false ? 'line-through' : 'none', fontWeight: 700, fontSize: '13px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {scene.name}
                        </span>
                        {scene.locked ? <Lock size={10} color="#ef4444" /> : null}
                      </div>
                      
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {(scene.sources || []).length} Sources
                      </div>
                    </div>
                  </div>`

file = file.replace(originalFolderFalse, newCardGrid)

// Also need to remove the drag handle and action buttons from the list item layout since it's a card now.
const itemWrapperStart = `<div
                key={scene.id}
                className={\`scene-library-item \${isSelected ? 'selected-highlight' : ''} \${isPreview && !isSelected ? 'preview-highlight' : ''} \${isLive && !isSelected ? 'live-highlight' : ''}\`}
                style={{ 
                  marginLeft: scene.folderId ? '16px' : '0', 
                  borderLeft: scene.colorLabel ? \`3px solid \${scene.colorLabel}\` : '1px solid var(--border-console)',
                  opacity: scene.visible === false ? 0.5 : 1
                }}`

const newItemWrapperStart = `<div
                key={scene.id}
                className={\`scene-library-card \${isSelected ? 'selected-highlight' : ''} \${isPreview && !isSelected ? 'preview-highlight' : ''} \${isLive && !isSelected ? 'live-highlight' : ''}\`}
                style={{ 
                  border: isSelected ? '2px solid #3b82f6' : scene.colorLabel ? \`1px solid \${scene.colorLabel}\` : '1px solid transparent',
                  opacity: scene.visible === false ? 0.5 : 1,
                  background: '#0f172a',
                  borderRadius: '6px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer'
                }}`
file = file.replace(itemWrapperStart, newItemWrapperStart)

// Remove old drag handle
file = file.replace(/<div className="item-drag-handle"[\s\S]*?<\/div>/, '')

// Remove old action buttons on the right
const actionsBlock = `<div className="item-actions" onClick={e => e.stopPropagation()} style={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', padding: '0 4px' }}>
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
                </div>`
file = file.replace(actionsBlock, '')

fs.writeFileSync('src/components/SceneLibrary.tsx', file)
console.log('SceneLibrary patched for grid')
