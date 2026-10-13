import React, { useRef, useCallback, useState, useEffect } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'

export const TransitionTBar: React.FC = () => {
  const { isTransitioning, transitionProgress, setManualTransitionProgress } = useBroadcast()
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const progress = isTransitioning ? transitionProgress : 0

  const handlePointer = useCallback((clientY: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const height = rect.height
    if (height <= 0) return
    const offsetY = clientY - rect.top
    const clampedY = Math.max(0, Math.min(height, offsetY))
    // 0 at top, 1 at bottom
    const rawVal = clampedY / height
    const normalized = Math.round(rawVal * 100) / 100
    setManualTransitionProgress(normalized)
  }, [setManualTransitionProgress])

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    handlePointer(e.clientY)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    handlePointer(e.clientY)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false)
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch (err) {
        // ignore
      }
    }
  }

  return (
    <div
      className="depth-layer-1"
      style={{
        width: '38px',
        flexShrink: 0,
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#070f1e',
        padding: '6px 0',
        boxSizing: 'border-box',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      <span
        style={{
          fontSize: '7.5px',
          fontWeight: 800,
          color: '#64748b',
          letterSpacing: '0.08em',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          margin: '2px 0 6px 0'
        }}
      >
        TRANSITION
      </span>

      {/* Recessed track container */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          flex: 1,
          width: '10px',
          background: '#020617',
          borderRadius: '3px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          border: '1px solid #0f1c30',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.95)',
          cursor: 'pointer',
          margin: '4px 0',
          overflow: 'visible'
        }}
      >
        {/* Tick marks */}
        <div style={{ position: 'absolute', left: '-5px', right: '-5px', top: '10%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', left: '-3px', right: '-3px', top: '30%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', left: '-5px', right: '-5px', top: '50%', height: '1px', background: 'rgba(56,189,248,0.3)' }} />
        <div style={{ position: 'absolute', left: '-3px', right: '-3px', top: '70%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', left: '-5px', right: '-5px', top: '90%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* T-Bar Handle */}
        <div
          style={{
            position: 'absolute',
            top: `calc(${progress * 100}% - 9px)`,
            width: '30px',
            height: '18px',
            borderRadius: '3px',
            background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 35%, #475569 70%, #1e293b 100%)',
            border: '1px solid #f1f5f9',
            boxShadow: isDragging
              ? '0 0 10px rgba(56,189,248,0.8), 0 3px 8px rgba(0,0,0,0.8)'
              : '0 2px 6px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            zIndex: 10,
            cursor: 'grab',
            transition: isDragging ? 'none' : 'top 0.05s ease-out'
          }}
        >
          {/* Grip lines */}
          <div style={{ width: '16px', height: '1px', background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ width: '16px', height: '1.5px', background: '#00E5FF', boxShadow: '0 0 4px #00E5FF' }} />
          <div style={{ width: '16px', height: '1px', background: 'rgba(0,0,0,0.4)' }} />
        </div>
      </div>

      {/* Hidden input for ARIA testing / screen readers without visual bleed */}
      <input
        aria-label="Manual transition"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={progress}
        onChange={e => setManualTransitionProgress(Number(e.target.value))}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          clip: 'rect(0 0 0 0)'
        }}
      />
    </div>
  )
}
