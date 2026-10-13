import React, { useState } from 'react'

export const TransitionBar: React.FC = () => {
  const [activeTrans, setActiveTrans] = useState('MIX')

  const transitions = ['CUT', 'MIX', 'DIP', 'WIPE', 'PUSH', 'ZOOM']

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%', gap: '8px', padding: '0 4px' }}>
      
      {/* Transition Types */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', borderRadius: '2px', border: '1px solid var(--border-color)', height: '100%', overflow: 'hidden', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)' }}>
        {transitions.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTrans(t)}
            style={{
              padding: '0 16px',
              height: '100%',
              background: activeTrans === t ? 'linear-gradient(180deg, rgba(0, 229, 255, 0.2) 0%, var(--bg-main) 100%)' : 'transparent',
              color: activeTrans === t ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRight: t !== 'ZOOM' ? '1px solid rgba(0, 229, 255, 0.1)' : 'none',
              fontSize: '11px',
              fontWeight: activeTrans === t ? 900 : 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTrans === t ? 'inset 0 2px 0 var(--accent-cyan), 0 0 15px rgba(0, 229, 255, 0.3)' : 'none',
              textShadow: activeTrans === t ? '0 0 8px rgba(0, 229, 255, 0.6)' : 'none'
            }}
            className={activeTrans !== t ? 'hover-brighten' : ''}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Duration */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', borderRadius: '2px', border: '1px solid var(--border-color)', height: '100%', padding: '0 16px', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--mono)',  }}>1.0 sec</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* AUTO / TAKE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%' }}>
        <button
          style={{
            padding: '0 32px',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(41, 98, 255, 0.8) 0%, rgba(41, 98, 255, 0.4) 100%)',
            color: '#fff',
            border: '1px solid var(--accent-blue)',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(41, 98, 255, 0.4), inset 0 2px 5px rgba(255,255,255,0.3)',
            transition: 'all 0.2s',
            
            letterSpacing: '0.05em'
          }}
          className="hover-brighten"
        >
          AUTO
        </button>
        
        <button
          style={{
            padding: '0 32px',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(41, 98, 255, 0.8) 0%, rgba(41, 98, 255, 0.4) 100%)',
            color: '#fff',
            border: '1px solid var(--accent-blue)',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(41, 98, 255, 0.4), inset 0 2px 5px rgba(255,255,255,0.3)',
            transition: 'all 0.2s',
            
            letterSpacing: '0.05em'
          }}
          className="hover-brighten"
        >
          TAKE
        </button>
      </div>

    </div>
  )
}
