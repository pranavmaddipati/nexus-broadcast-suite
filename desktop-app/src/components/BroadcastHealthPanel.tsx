import React from 'react'
import { ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'

interface HealthRowProps {
  label: string
  status: string
  color: string
}

const HealthRow: React.FC<HealthRowProps> = ({ label, status, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-primary, #e2e8f0)', fontWeight: 600 }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
      <span style={{ fontSize: '10px', color, fontWeight: 700, fontFamily: 'var(--mono, monospace)' }}>{status}</span>
    </div>
  </div>
)

export const BroadcastHealthPanel: React.FC<{ expanded?: boolean; onToggle?: () => void }> = ({ expanded, onToggle }) => {
  const { isStreaming = false, isRecording = false, droppedFrames = 0, scenes = [] } = useBroadcast()
  const isExpanded = Boolean(expanded)

  const activeSourceCount = scenes.reduce((acc, scene) => acc + (scene.sources?.length || 0), 0)
  const healthStatusText = droppedFrames > 0 ? `${droppedFrames} DROPPED` : 'NOMINAL'
  const healthStatusColor = droppedFrames > 0 ? '#FF5252' : '#00E676'

  return (
    <div style={{ flex: isExpanded ? 1 : '0 0 auto', display: 'flex', flexDirection: 'column', height: 'auto', background: 'transparent' }}>
      <div
        className="panel-header"
        style={{ padding: '4px 8px', borderBottom: 'none', cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <ShieldCheck size={12} color="var(--text-secondary, #94a3b8)" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>BROADCAST HEALTH</span>
        </div>

        {!isExpanded && (
          <div style={{ display: 'flex', gap: '8px', marginRight: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: healthStatusColor }}>
              {healthStatusText}
            </span>
          </div>
        )}
        {isExpanded ? <ChevronDown size={12} color="var(--text-secondary, #94a3b8)" /> : <ChevronRight size={12} color="var(--text-secondary, #94a3b8)" />}
      </div>

      {isExpanded && (
        <div style={{ flex: 1, padding: '4px 12px 10px 12px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <HealthRow label="Studio Systems" status="Healthy" color="#00E676" />
          <HealthRow label="Ingest Sources" status="Online" color="#00E676" />
          <HealthRow label="Playout" status="Ready" color="#00E676" />
          <HealthRow label="Streaming" status={isStreaming ? "Healthy" : "Ready"} color="#00E676" />
          <HealthRow label="Intercom" status="Online" color="#00E676" />
        </div>
      )}
    </div>
  )
}
