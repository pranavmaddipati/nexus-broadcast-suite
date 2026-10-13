import React from 'react'
import { Activity, ChevronDown, ChevronRight } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'

const RingGauge = ({ label, value, valStr, color }: {label: string, value: number, valStr: string, color: string}) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '48px', height: '48px', position: 'relative' }}>
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 3px ${color}80)` }}>
          <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="20" cy="20" r="16" fill="transparent" stroke={color} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '7px', color: 'var(--text-secondary)', fontWeight: 800 }}>{label}</span>
          <span style={{ fontSize: '9px', color: '#fff', fontFamily: 'var(--mono)', fontWeight: 800 }}>{valStr}</span>
        </div>
      </div>
    </div>
  )
}

export const SystemOverviewPanel: React.FC<{ expanded?: boolean; onToggle?: () => void }> = ({ expanded, onToggle }) => {
  const { cpuUsage = 0, gpuUsage = 0, ramUsage = 0, networkSpeed = 0 } = useBroadcast()
  const isExpanded = Boolean(expanded)
  return (
    <div style={{ flex: isExpanded ? 1 : '0 0 auto', display: 'flex', flexDirection: 'column', height: 'auto', background: 'transparent' }}>
      <div 
        className="panel-header" 
        style={{ padding: '4px 8px', borderBottom: 'none', cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Activity size={12} color="var(--text-secondary)" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>SYSTEM OVERVIEW</span>
        </div>

        {!isExpanded && (
          <div style={{ display: 'flex', gap: '8px', marginRight: '8px', alignItems: 'center' }}>
             <span style={{ fontSize: '9px', fontWeight: 800, color: '#00E5FF' }}>CPU {Math.round(cpuUsage)}%</span>
             <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFC107' }}>MEM {Math.round(ramUsage)}%</span>
          </div>
        )}
        {isExpanded ? <ChevronDown size={12} color="var(--text-secondary)" /> : <ChevronRight size={12} color="var(--text-secondary)" />}
      </div>
      
      {isExpanded && (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px 8px 8px', width: '100%', boxSizing: 'border-box' }}>
         <RingGauge label="CPU" value={cpuUsage} valStr={`${Math.round(cpuUsage)}%`} color="#00E5FF" />
         <RingGauge label="GPU" value={gpuUsage} valStr={`${Math.round(gpuUsage)}%`} color="#00E676" />
         <RingGauge label="MEM" value={ramUsage} valStr={`${Math.round(ramUsage)}%`} color="#FFC107" />
         <RingGauge label="NET" value={Math.min(100, networkSpeed)} valStr={`${Math.round(networkSpeed)}`} color="#E040FB" />
      </div>
      )}
    </div>
  )
}
