import React from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { TransitionType } from '../store/StoreTypes'
import { Mic, Square, MoveRight, Copy, MoveHorizontal, GripHorizontal, ArrowLeftRight, Columns, Circle, Maximize, Layers, ChevronDown, ChevronRight } from 'lucide-react'

const transitions = [
  { id: 'cut', label: 'Cut', Icon: Square },
  { id: 'mix', label: 'Mix', Icon: MoveRight },
  { id: 'fade', label: 'Fade', Icon: Layers },
  { id: 'wipe', label: 'Wipe', Icon: MoveHorizontal },
  { id: 'push', label: 'Push', Icon: GripHorizontal },
  { id: 'slide', label: 'Slide', Icon: ArrowLeftRight },
  { id: 'zoom', label: 'Zoom', Icon: Maximize },
  { id: 'fly', label: 'Fly', Icon: MoveRight },
  { id: 'dip', label: 'Dip', Icon: Copy },
  { id: 'stinger', label: 'Stinger', Icon: Circle }
];

export const TransitionControlsExtended: React.FC<{ expanded?: boolean; onToggle?: () => void }> = ({ expanded, onToggle }) => {
  const { transitionType: activeTr, setTransitionType: setActiveTr, transitionDuration, setTransitionDuration, isTransitioning, transitionProgress, setManualTransitionProgress, autoTransition } = useBroadcast()
  const isExpanded = Boolean(expanded)

  return (
    <div style={{ flex: isExpanded ? 1 : '0 0 auto', display: 'flex', flexDirection: 'column', height: 'auto', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div 
        className="panel-header" 
        style={{ padding: '4px 8px', borderBottom: 'none', cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Layers size={12} color="var(--text-secondary)" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>TRANSITIONS</span>
        </div>

        {!isExpanded && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase' }}>{activeTr}</span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-secondary)' }}>{transitionDuration / 1000}s</span>
          </div>
        )}

        {isExpanded ? <ChevronDown size={12} color="var(--text-secondary)" /> : <ChevronRight size={12} color="var(--text-secondary)" />}
      </div>

      {isExpanded && (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 8px 8px 8px', gap: '12px' }}>
        
        {/* Properties row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>Duration</span>
            <select aria-label="Sidebar transition duration" value={transitionDuration} disabled={isTransitioning} onChange={event => setTransitionDuration(Number(event.target.value))} className="premium-inset" style={{ width: '100%', height: '24px', fontSize: '11px', color: '#fff' }}>
              {[250, 500, 1000, 2000].map(duration => <option key={duration} value={duration}>{duration / 1000} sec</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>Direction</span>
            <select className="premium-inset" style={{ width: '100%', height: '24px', fontSize: '11px', color: '#fff' }}>
              <option>Left to Right</option>
              <option>Right to Left</option>
              <option>Top to Bottom</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>Border</span>
            <select className="premium-inset" style={{ width: '100%', height: '24px', fontSize: '11px', color: '#fff' }}>
              <option>0 px</option>
              <option>2 px</option>
              <option>4 px</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* T-BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>T-BAR</span>
            <div style={{ width: '24px', height: '100px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '2px', position: 'relative', display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
               <input aria-label="Sidebar manual transition" type="range" min={0} max={1} step={0.01} value={isTransitioning ? transitionProgress : 0} onChange={event => setManualTransitionProgress(Number(event.target.value))} className="tbar-slider" style={{ width: '16px', height: '100%', margin: 0, writingMode: 'vertical-lr', direction: 'rtl' }} />
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
             {/* 2x5 Grid */}
             <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(5, 1fr)', 
               gap: '4px',
             }}>
               {transitions.map((t) => {
                 const isActive = t.id === activeTr;
                 return (
                   <button
                     key={t.id}
                     disabled={isTransitioning || t.id === 'fly' || t.id === 'stinger'}
                     title={t.id === 'fly' || t.id === 'stinger' ? 'Transition engine not available' : t.label}
                     aria-pressed={isActive}
                     onClick={() => setActiveTr(t.id as TransitionType)}
                     className={`hardware-button ${isActive ? 'active' : 'hover-brighten'}`}
                     style={{
                       height: '36px',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: '4px',
                       background: isActive ? 'var(--accent-red)' : 'var(--bg-panel)',
                       border: isActive ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
                       boxShadow: isActive ? 'inset 0 0 8px rgba(255,255,255,0.2)' : 'none',
                       borderRadius: '2px',
                       cursor: 'pointer'
                     }}
                   >
                     <t.Icon size={14} color={isActive ? '#fff' : 'var(--text-secondary)'} />
                     <span style={{ fontSize: '8px', fontWeight: 600, color: isActive ? '#fff' : 'var(--text-secondary)' }}>{t.label}</span>
                   </button>
                 )
               })}
             </div>
             
             {/* FAVORITES & PRESETS */}
             <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>FAVORITES</span>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                   {['Mix 0.5s', 'Wipe 1s', 'Stinger'].map(fav => (
                     <button key={fav} disabled={isTransitioning || fav === 'Stinger'} onClick={() => { setActiveTr(fav.startsWith('Mix') ? 'mix' : 'wipe'); setTransitionDuration(fav.startsWith('Mix') ? 500 : 1000) }} className="hardware-button" style={{ flex: 1, height: '20px', fontSize: '8px' }}>{fav}</button>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <button onClick={() => autoTransition()} disabled={isTransitioning} style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>Auto Transition</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>Voice Command</span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-cyan)' }}>Ready</span>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '2px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={14} color="var(--text-secondary)" />
            </div>
          </div>
        </div>

      </div>
      )}

    </div>
  )
}
