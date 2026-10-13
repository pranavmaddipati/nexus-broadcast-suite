import React from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

export const ActivityLogPanel: React.FC = () => {
  const { logs } = useBroadcast()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '4px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2px' 
      }}>
        {(!logs || logs.length === 0) ? (
          <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
            No recent activity.
          </div>
        ) : (
          logs.slice().reverse().map(log => {
            let color = '#94a3b8'
            let Icon = Info

            if (log.type === 'success') {
              color = '#10b981'
              Icon = CheckCircle
            } else if (log.type === 'warning') {
              color = '#f59e0b'
              Icon = AlertTriangle
            } else if (log.type === 'error') {
              color = '#ef4444'
              Icon = AlertCircle
            }

            const time = new Date(log.timestamp).toLocaleTimeString([], { hour12: false })

            return (
              <div key={log.id} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '2px',
                padding: '4px',
                borderBottom: '1px solid var(--bg-panel)',
                fontSize: '11px',
                color: '#e2e8f0'
              }}>
                <span style={{ color: '#64748b', minWidth: '55px' }}>[{time}]</span>
                <Icon size={12} color={color} style={{ marginTop: '2px', marginRight: '4px' }} />
                <span style={{ flex: 1, wordBreak: 'break-word' }}>{log.message}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}