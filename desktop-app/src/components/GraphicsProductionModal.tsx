import React, { useState } from 'react'
import { X, Type, BookOpen, Music, LayoutTemplate, Play, Settings, Save, Search, Maximize2 } from 'lucide-react'

interface GraphicsProductionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GraphicsProductionModal: React.FC<GraphicsProductionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'scripture' | 'lower_thirds'>('lyrics')
  
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '90vw', height: '90vh', background: 'transparent',
        border: '1px solid var(--border-color)', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,0,0,0.8)'
      }}>
        {/* Header */}
        <div style={{
          height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '1px solid var(--border-color)', background: 'transparent'
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '100%' }}>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>CHURCH PRODUCTION ENGINE</span>
            <div style={{ display: 'flex', gap: '8px', height: '100%', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveTab('lyrics')}
                style={{ background: 'transparent', border: 'none', color: activeTab === 'lyrics' ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}
              ><Music size={14} /> LYRICS</button>
              <button 
                onClick={() => setActiveTab('scripture')}
                style={{ background: 'transparent', border: 'none', color: activeTab === 'scripture' ? 'var(--border-color)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}
              ><BookOpen size={14} /> SCRIPTURE</button>
              <button 
                onClick={() => setActiveTab('lower_thirds')}
                style={{ background: 'transparent', border: 'none', color: activeTab === 'lower_thirds' ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '12px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}
              ><LayoutTemplate size={14} /> GRAPHICS / THIRDS</button>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} className="hover-brighten">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Left Sidebar (Library/Search) */}
          <div style={{ width: '280px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
            <div style={{ padding: '16px' }}>
              <div className="premium-inset" style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '2px', background: 'rgba(0,0,0,0.2)' }}>
                <Search size={14} color="var(--text-secondary)" />
                <input type="text" placeholder={`Search ${activeTab}...`} style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', marginLeft: '8px', fontSize: '12px', width: '100%' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              {activeTab === 'lyrics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Amazing Grace', 'How Great Is Our God', 'Oceans', 'Way Maker'].map(song => (
                    <div key={song} className="premium-btn hover-brighten" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{song}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'scripture' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['John 3:16', 'Psalm 23', 'Romans 8:28', 'Philippians 4:13'].map(verse => (
                    <div key={verse} className="premium-btn hover-brighten" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{verse}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'lower_thirds' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Pastor Name Tag', 'Guest Speaker', 'Sermon Title Bar', 'Social Media Handles'].map(template => (
                    <div key={template} className="premium-btn hover-brighten" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{template}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Editor Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {/* Fake Canvas / Preview Area */}
              <div style={{ width: '80%', aspectRatio: '16/9', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '40px' }}>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Maximize2 size={16} color="var(--text-secondary)" />
                </div>
                
                {/* Mock Live Graphic Render */}
                {activeTab === 'lyrics' && (
                  <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#fff',  }}>Amazing Grace!</h1>
                    <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#e2e8f0',  }}>how sweet the sound</h2>
                  </div>
                )}
                {activeTab === 'scripture' && (
                  <div style={{ background: 'rgba(0,0,0,0.7)', padding: '24px 48px', borderRadius: '12px', borderLeft: '8px solid var(--border-color)' }}>
                    <p style={{ fontSize: '28px', fontWeight: 600, color: '#fff', maxWidth: '800px', fontStyle: 'italic' }}>"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."</p>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--border-color)', marginTop: '16px', textAlign: 'right' }}>John 3:16 KJV</p>
                  </div>
                )}
                {activeTab === 'lower_thirds' && (
                  <div style={{ width: '80%', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '120px', height: '120px', background: 'var(--accent-green)', borderRadius: '2px', zIndex: 2, boxShadow: '8px 0 16px rgba(0,0,0,0.3)' }}></div>
                    <div style={{ background: 'rgba(0,0,0,0.85)', padding: '16px 32px', paddingLeft: '48px', marginLeft: '-24px', borderRadius: '0 8px 8px 0', flex: 1 }}>
                      <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', margin: 0 }}>JOHN DOE</h1>
                      <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-green)', margin: 0 }}>LEAD PASTOR</h2>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Timeline / Slide Strip */}
            <div style={{ height: '180px', borderTop: '1px solid var(--border-color)', background: 'transparent', padding: '16px', display: 'flex', gap: '16px', overflowX: 'auto' }}>
              {[1, 2, 3, 4, 5].map(slide => (
                <div key={slide} className="premium-btn hover-brighten" style={{ minWidth: '220px', height: '100%', background: slide === 2 ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.02)', border: slide === 2 ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '2px', padding: '12px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)' }}>SLIDE {slide}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {activeTab === 'lyrics' ? 'Amazing grace how sweet the sound...' : activeTab === 'scripture' ? 'For God so loved the world...' : 'LOWER THIRD CONTENT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar (Settings/Properties) */}
          <div style={{ width: '320px', borderLeft: '1px solid var(--border-color)', background: 'transparent', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>PROPERTIES</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>FONT FAMILY</label>
              <select className="premium-inset" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', borderRadius: '2px', outline: 'none' }}>
                <option>Inter</option>
                <option>Roboto</option>
                <option>Montserrat</option>
                <option>Bebas Neue</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>TEXT COLOR</label>
                <div style={{ height: '32px', background: '#ffffff', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>ACCENT COLOR</label>
                <div style={{ height: '32px', background: 'var(--border-color)', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>ANIMATION IN</label>
              <select className="premium-inset" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', borderRadius: '2px', outline: 'none' }}>
                <option>Fade</option>
                <option>Slide Up</option>
                <option>Fly In</option>
                <option>Typewriter</option>
              </select>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="premium-btn hover-brighten" style={{ width: '100%', padding: '12px', background: 'var(--accent-green)', border: 'none', borderRadius: '2px', color: '#000', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                <Play size={14} /> TAKE LIVE (PGM)
              </button>
              <button className="premium-btn hover-brighten" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', color: '#fff', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                <Save size={14} /> SAVE TEMPLATE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
