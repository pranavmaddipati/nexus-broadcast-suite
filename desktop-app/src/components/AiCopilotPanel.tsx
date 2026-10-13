import React, { useState } from 'react'
import { Sparkles, ChevronRight, Zap } from 'lucide-react'

export const AiCopilotPanel: React.FC = () => {
  const [activeInsightIndex, setActiveInsightIndex] = useState(0)

  const insights = [
    {
      priority: 'High priority',
      title: 'Lower third update detected in Camera 1.',
      action: 'Apply to all live cameras?'
    },
    {
      priority: 'Suggestion',
      title: 'Audio levels on MIC 1 peaking at -3dB.',
      action: 'Enable automatic compressor?'
    },
    {
      priority: 'Scene cue',
      title: 'Interview segment scheduled in 2 minutes.',
      action: 'Pre-cue Split Screen scene?'
    }
  ]

  const current = insights[activeInsightIndex % insights.length]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'linear-gradient(180deg, rgba(30, 16, 60, 0.6) 0%, rgba(13, 8, 30, 0.8) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        borderRadius: '6px',
        padding: '8px 10px',
        boxSizing: 'border-box',
        boxShadow: '0 0 14px rgba(168, 85, 247, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '6px'
        }}
      >
        <Sparkles size={12} color="#c084fc" />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#e9d5ff',
            letterSpacing: '0.06em'
          }}
        >
          AI COPILOT
        </span>
      </div>

      {/* Futuristic Soundwave Orb Visualizer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '48px',
          position: 'relative',
          margin: '2px 0 4px 0'
        }}
      >
        {/* Pulsing Concentric Circles */}
        <div
          style={{
            position: 'absolute',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            animation: 'pulse 2s infinite ease-in-out'
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid rgba(192, 132, 252, 0.6)',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.5)'
          }}
        />

        {/* Center Glowing Orb */}
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #f3e8ff 0%, #a855f7 70%, #6b21a8 100%)',
            boxShadow: '0 0 12px #c084fc, inset 0 0 4px #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
        </div>

        {/* Soundwave lines across orb */}
        <div style={{ position: 'absolute', display: 'flex', gap: '3px', alignItems: 'center' }}>
          <div style={{ width: '1.5px', height: '10px', background: '#c084fc', opacity: 0.8 }} />
          <div style={{ width: '1.5px', height: '18px', background: '#c084fc', opacity: 0.9 }} />
          <div style={{ width: '1.5px', height: '8px', background: '#c084fc', opacity: 0.6 }} />
          <div style={{ width: '22px' }} /> {/* Spacer for orb */}
          <div style={{ width: '1.5px', height: '8px', background: '#c084fc', opacity: 0.6 }} />
          <div style={{ width: '1.5px', height: '18px', background: '#c084fc', opacity: 0.9 }} />
          <div style={{ width: '1.5px', height: '10px', background: '#c084fc', opacity: 0.8 }} />
        </div>
      </div>

      {/* Priority Tag */}
      <div style={{ margin: '2px 0 3px 0' }}>
        <span
          style={{
            fontSize: '7.5px',
            fontWeight: 800,
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            color: '#fbbf24',
            padding: '1px 5px',
            borderRadius: '3px',
            letterSpacing: '0.04em'
          }}
        >
          {current.priority}
        </span>
      </div>

      {/* Insight description */}
      <div
        style={{
          fontSize: '8.5px',
          color: '#f1f5f9',
          lineHeight: '1.25',
          fontWeight: 600,
          margin: '2px 0 6px 0',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        <div>{current.title}</div>
        <div style={{ color: '#c084fc', marginTop: '1px' }}>{current.action}</div>
      </div>

      {/* Bottom Insights Switcher Button */}
      <button
        type="button"
        onClick={() => setActiveInsightIndex(prev => prev + 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '4px',
          color: '#e9d5ff',
          fontSize: '8px',
          fontWeight: 700,
          padding: '3px 0',
          width: '100%',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{insights.length} insights</span>
        <ChevronRight size={10} />
      </button>
    </div>
  )
}
