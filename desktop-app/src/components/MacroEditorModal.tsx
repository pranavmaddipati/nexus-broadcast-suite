import React, { useState } from 'react'
import { X, Cpu, Play, Plus, Trash2, Edit3, Keyboard, Clock, Zap } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'

interface MacroEditorModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MacroEditorModal: React.FC<MacroEditorModalProps> = ({ isOpen, onClose }) => {
  const { macros = [], executeMacro, createMacro, deleteMacro } = useBroadcast()
  const [selectedMacroId, setSelectedMacroId] = useState<string | null>(null)
  
  if (!isOpen) return null

  // Use provided macros, or fallback to mock data for demonstration
  const displayMacros = macros.length > 0 ? macros : [
    { id: '1', name: 'Worship Start', color: '#10B981', triggers: [{ type: 'hotkey', value: 'CTRL+SHIFT+W' }], actions: [{ id: 'a1', type: 'switch_scene', targetId: 'scene2' }] },
    { id: '2', name: 'Sermon Mode', color: '#3B82F6', triggers: [{ type: 'midi', value: 'Note 64' }], actions: [{ id: 'a2', type: 'switch_scene', targetId: 'scene3' }, { id: 'a3', type: 'play_media', targetId: 'media1' }] },
    { id: '3', name: 'Panic / Black', color: '#EF4444', triggers: [{ type: 'hotkey', value: 'ESC' }], actions: [{ id: 'a4', type: 'switch_scene', targetId: 'black' }] },
  ]

  const selectedMacro = displayMacros.find(m => m.id === selectedMacroId) || displayMacros[0]

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '85vw', height: '85vh', background: 'transparent',
        border: '1px solid var(--border-color)', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,0,0,0.8)'
      }}>
        {/* Header */}
        <div style={{
          height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '1px solid var(--border-color)', background: 'transparent'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Cpu size={18} color="var(--accent-blue)" />
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>MACRO & AUTOMATION ENGINE</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover-brighten">
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Macro List Sidebar */}
          <div style={{ width: '280px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <button className="premium-btn hover-brighten" style={{ width: '100%', padding: '10px', background: 'var(--accent-blue)', border: 'none', borderRadius: '2px', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
                <Plus size={14} /> NEW MACRO
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayMacros.map(macro => (
                <div 
                  key={macro.id} 
                  onClick={() => setSelectedMacroId(macro.id)}
                  style={{ 
                    padding: '12px', background: selectedMacroId === macro.id ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255,255,255,0.05)', 
                    border: `1px solid ${selectedMacroId === macro.id ? 'var(--accent-blue)' : 'transparent'}`,
                    borderRadius: '2px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: macro.color }}></div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{macro.name}</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{macro.actions.length} actions</span>
                  </div>
                  {selectedMacroId === macro.id && (
                    <button onClick={(e) => { e.stopPropagation(); executeMacro && executeMacro(macro.id) }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', padding: 0 }} className="hover-brighten">
                      <Play size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Macro Editor Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
            {selectedMacro ? (
              <>
                {/* Editor Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={selectedMacro.name} 
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '24px', fontWeight: 900, padding: 0 }} 
                      readOnly
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {selectedMacro.triggers.map((trigger, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '2px' }}>
                          {trigger.type === 'hotkey' && <Keyboard size={12} color="var(--border-color)" />}
                          {trigger.type === 'midi' && <Zap size={12} color="var(--accent-orange)" />}
                          {trigger.type === 'timer' && <Clock size={12} color="var(--accent-blue)" />}
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', fontFamily: 'var(--mono)' }}>{trigger.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="premium-btn hover-brighten" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800 }}>
                      <Edit3 size={12} /> EDIT TRIGGERS
                    </button>
                  </div>
                </div>

                {/* Actions Flow */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>ACTION SEQUENCE</span>
                  
                  {selectedMacro.actions.map((action, index) => (
                    <div key={action.id} style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 800 }}>
                          {index + 1}
                        </div>
                        {index < selectedMacro.actions.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: 'var(--border-color)', margin: '4px 0' }}></div>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '2px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                            {action.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Target: <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{action.targetId}</span></span>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover-brighten">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }}></div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                      <button style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-blue)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="hover-brighten">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-blue)', cursor: 'pointer' }}>ADD ACTION</span>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Select or create a macro to edit.</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
