import React from 'react'
import { Activity, ShieldCheck, ChevronRight } from 'lucide-react'

const CircularGauge: React.FC<{ label: string, value: string, percentage: number, color: string }> = ({ label, value, percentage, color }) => {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="64" height="64" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          {/* Background circle */}
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          {/* Progress circle */}
          <circle 
            cx="32" 
            cy="32" 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="4" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>{label}</span>
          <span style={{ fontSize: '12px', color: '#fff', fontWeight: 800, fontFamily: 'var(--mono)' }}>{value}</span>
        </div>
      </div>
    </div>
  )
}

const HealthRow: React.FC<{ label: string, status: string, color: string }> = ({ label, status, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-start' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>-</span>
      <span style={{ fontSize: '11px', color, fontWeight: 700 }}>{status}</span>
    </div>
  </div>
)

export const SystemStatusPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      
      {/* SYSTEM OVERVIEW */}
      <div className="panel-header" style={{ padding: '8px 12px', borderBottom: 'none' }}>
        <ChevronRight size={12} color="var(--text-secondary)" />
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>SYSTEM OVERVIEW</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 12px 16px 12px' }}>
        <CircularGauge label="CPU" value="48%" percentage={48} color="var(--accent-blue)" />
        <CircularGauge label="GPU" value="62%" percentage={62} color="var(--border-color)" />
        <CircularGauge label="MEM" value="37%" percentage={37} color="var(--border-color)" />
        <CircularGauge label="NET" value="1.2G" percentage={80} color="var(--accent-green)" />
      </div>

      {/* BROADCAST HEALTH */}
      <div className="panel-header" style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', borderBottom: 'none' }}>
        <ChevronRight size={12} color="var(--text-secondary)" />
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>BROADCAST HEALTH</span>
      </div>

      <div style={{ flex: 1, padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <HealthRow label="Studio Systems" status="Healthy" color="var(--accent-green)" />
        <HealthRow label="Ingest Sources" status="Online" color="var(--accent-green)" />
        <HealthRow label="Playout" status="Ready" color="var(--accent-green)" />
        <HealthRow label="Streaming" status="Healthy" color="var(--accent-green)" />
        <HealthRow label="Intercom" status="Online" color="var(--accent-green)" />
      </div>
      
    </div>
  )
}
