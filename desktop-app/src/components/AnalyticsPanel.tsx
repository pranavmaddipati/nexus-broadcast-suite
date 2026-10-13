import React, { useState } from 'react'
import { BarChart2, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react'

export const AnalyticsPanel: React.FC<{ expanded?: boolean; onToggle?: () => void }> = ({ expanded, onToggle }) => {
  const isExpanded = Boolean(expanded)
  const [activeTab, setActiveTab] = useState<'Live Viewers' | 'Engagement' | 'Sources' | 'Geo'>('Live Viewers')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(3)

  const dataPoints = [
    { time: '10:10', viewers: 1.25, engagement: 62 },
    { time: '10:20', viewers: 1.55, engagement: 70 },
    { time: '10:30', viewers: 1.82, engagement: 78 },
    { time: '10:40', viewers: 1.68, engagement: 74 },
    { time: '10:50', viewers: 1.95, engagement: 82 }
  ]

  return (
    <div
      style={{
        flex: isExpanded ? 1 : '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        background: 'transparent'
      }}
    >
      {/* Panel Header */}
      <div
        className="panel-header"
        style={{
          padding: '4px 8px',
          borderBottom: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <BarChart2 size={12} color="var(--text-secondary, #94a3b8)" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
            ANALYTICS
          </span>
        </div>

        {!isExpanded && (
          <div style={{ display: 'flex', gap: '8px', marginRight: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#38bdf8' }}>
              1.48M Viewers
            </span>
          </div>
        )}

        {isExpanded ? (
          <ChevronDown size={12} color="var(--text-secondary, #94a3b8)" />
        ) : (
          <ChevronRight size={12} color="var(--text-secondary, #94a3b8)" />
        )}
      </div>

      {/* Expanded Analytics Content */}
      {isExpanded && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '6px 10px 10px 10px',
            gap: '8px',
            overflowY: 'auto'
          }}
        >
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['Live Viewers', 'Engagement', 'Sources', 'Geo'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '3px 8px',
                  fontSize: '8.5px',
                  fontWeight: 700,
                  borderRadius: '3px',
                  border: 'none',
                  background: activeTab === tab ? '#1f6fe0' : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Key Metrics KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <div
              style={{
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <span style={{ fontSize: '7.5px', color: '#94a3b8', fontWeight: 600 }}>Total Viewers</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', fontFamily: 'var(--mono, monospace)' }}>
                1.48M
              </span>
              <span style={{ fontSize: '7.5px', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <TrendingUp size={8} /> +12.5%
              </span>
            </div>

            <div
              style={{
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <span style={{ fontSize: '7.5px', color: '#94a3b8', fontWeight: 600 }}>Peak Viewers</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', fontFamily: 'var(--mono, monospace)' }}>
                2.03M
              </span>
              <span style={{ fontSize: '7.5px', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <TrendingUp size={8} /> +8.4%
              </span>
            </div>

            <div
              style={{
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <span style={{ fontSize: '7.5px', color: '#94a3b8', fontWeight: 600 }}>Avg. Watch Time</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', fontFamily: 'var(--mono, monospace)' }}>
                12:34
              </span>
              <span style={{ fontSize: '7.5px', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <TrendingUp size={8} /> +6.2%
              </span>
            </div>
          </div>

          {/* Interactive SVG Area Chart */}
          <div
            style={{
              background: 'rgba(2, 6, 23, 0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px',
              padding: '8px',
              position: 'relative'
            }}
          >
            {/* Chart Legend */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '8px', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a855f7' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} />
                Live Viewers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00e5ff' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e5ff' }} />
                Engagement
              </div>
            </div>

            {/* SVG Chart */}
            <svg viewBox="0 0 300 110" style={{ width: '100%', height: '110px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

              {/* Viewers Area & Line */}
              <path
                d="M 10 75 Q 70 55, 140 38 T 220 45 T 290 22 L 290 95 L 10 95 Z"
                fill="url(#purpleGrad)"
              />
              <path
                d="M 10 75 Q 70 55, 140 38 T 220 45 T 290 22"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
              />

              {/* Engagement Area & Line */}
              <path
                d="M 10 82 Q 70 65, 140 48 T 220 54 T 290 32 L 290 95 L 10 95 Z"
                fill="url(#cyanGrad)"
              />
              <path
                d="M 10 82 Q 70 65, 140 48 T 220 54 T 290 32"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2"
              />

              {/* Points */}
              {dataPoints.map((pt, i) => {
                const x = 15 + i * 68
                const y = [75, 55, 38, 45, 22][i]
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={hoveredPoint === i ? 4 : 2.5}
                    fill="#fff"
                    stroke="#a855f7"
                    strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() => setHoveredPoint(i)}
                  />
                )
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '8px',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ color: '#94a3b8', fontWeight: 600 }}>10:24 AM</div>
                <div style={{ color: '#a855f7', fontWeight: 800 }}>1.82M Viewers</div>
                <div style={{ color: '#00e5ff', fontWeight: 800 }}>78% Engagement</div>
              </div>
            )}

            {/* X-Axis Timestamps */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 4px 0 4px',
                fontSize: '7.5px',
                color: '#64748b',
                fontFamily: 'var(--mono, monospace)'
              }}
            >
              <span>10:10</span>
              <span>10:20</span>
              <span>10:30</span>
              <span>10:40</span>
              <span>10:50</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
