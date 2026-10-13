import React from 'react'
export interface VmixInputCardProps {
  scene: any
  index: number
}

export const VmixInputCard: React.FC<VmixInputCardProps> = React.memo(({ scene, index }) => {
  const previewSceneId = '';
  const programSceneId = '';
  const setPreviewScene = (id: string) => {};
  const setProgramScene = (id: string) => {};
  const takeTransition = () => {};

  const isProgram = programSceneId === scene.id;
  const isPreview = previewSceneId === scene.id;

  const numberColors = [
    'var(--accent-magenta)', // 1
    'var(--accent-cyan)',    // 2
    'var(--border-color)',  // 3
    'var(--accent-blue)',    // 4
    'var(--accent-orange)',  // 5
    'var(--accent-teal)',    // 6
    'var(--accent-pink)',    // 7
  ];
  const numberBg = numberColors[index % numberColors.length];

  const sceneImages = [
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=640&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=640&q=80'
  ];
  const bgImage = sceneImages[index % sceneImages.length];

  return (
    <div
      className="hover-glow"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '12px',
        width: '100%',
        padding: '8px',
        borderRadius: '2px',
        border: isProgram ? '1px solid rgba(239, 68, 68, 0.5)' : isPreview ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
        background: isProgram ? 'rgba(239, 68, 68, 0.1)' : isPreview ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
        cursor: 'pointer',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
      }}
      onClick={() => setPreviewScene(scene.id)}
      onDoubleClick={() => takeTransition('cut')}
    >
      {/* Thumbnail (Left) */}
      <div style={{
        width: '80px',
        aspectRatio: '16/9',
        borderRadius: '2px',
        background: `url("${bgImage}") center/cover no-repeat`,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
      }}>
        {/* Number Badge */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: numberBg,
          color: '#fff',
          fontSize: '10px',
          fontWeight: 800,
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomRightRadius: '4px',
          fontFamily: 'var(--sans)'
        }}>
          {index + 1}
        </div>
      </div>

      {/* Info (Right) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'flex-start', gap: '4px' }}>
        {/* Row 1: Name and Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--sans)', letterSpacing: '0.02em' }}>
            {scene.name}
          </span>
          {isProgram && (
            <span style={{ background: 'var(--accent-red)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '2px', fontFamily: 'var(--sans)' }}>PROGRAM</span>
          )}
          {isPreview && (
            <span style={{ background: 'var(--accent-green)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '2px', fontFamily: 'var(--sans)' }}>PREVIEW</span>
          )}
        </div>
        
        {/* Row 2: Timecode */}
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)', lineHeight: '1.2', fontWeight: 600 }}>
          {scene.duration || '00:00:00'}
        </div>

        {/* Row 3: Quick Cut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 800 }}>QUICK CUT</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4].map(num => (
              <div key={num} onClick={(e) => { e.stopPropagation(); takeTransition('cut'); }} style={{ width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', cursor: 'pointer' }} className="hover:bg-white/20 hover:text-white">
                {num}
              </div>
            ))}
          </div>
        </div>
        
        {/* Row 4: Routing Buttons */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
          <button style={{ flex: 1, padding: '4px 0', fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '2px', cursor: 'pointer' }} className="hover:bg-white/10 hover:text-white">AUD</button>
          <button style={{ flex: 1, padding: '4px 0', fontSize: '10px', fontWeight: 800, color: isPreview ? '#fff' : 'var(--text-secondary)', background: isPreview ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '2px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setPreviewScene(scene.id); }} className={!isPreview ? "hover:bg-white/10 hover:text-white" : ""}>PVW</button>
          <button style={{ flex: 1, padding: '4px 0', fontSize: '10px', fontWeight: 800, color: isProgram ? '#fff' : 'var(--text-secondary)', background: isProgram ? 'var(--accent-red)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '2px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setProgramScene(scene.id); takeTransition('cut'); }} className={!isProgram ? "hover:bg-white/10 hover:text-white" : ""}>PGM</button>
        </div>
      </div>
    </div>
  )
})
