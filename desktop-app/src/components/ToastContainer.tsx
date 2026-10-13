import React from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export const ToastContainer: React.FC = () => {
  const { toasts = [], removeToast } = useBroadcast()

  if (toasts.length === 0) return null

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
      case 'warning':
        return <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
      case 'error':
        return <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
      case 'info':
      default:
        return <Info size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.4)'
      case 'warning':
        return 'rgba(245, 158, 11, 0.4)'
      case 'error':
        return 'rgba(239, 68, 68, 0.5)'
      case 'info':
      default:
        return 'rgba(56, 189, 248, 0.4)'
    }
  }

  const getGlow = (type: string) => {
    switch (type) {
      case 'success':
        return '0 4px 16px rgba(16, 185, 129, 0.15)'
      case 'warning':
        return '0 4px 16px rgba(245, 158, 11, 0.15)'
      case 'error':
        return '0 4px 16px rgba(239, 68, 68, 0.2)'
      case 'info':
      default:
        return '0 4px 16px rgba(56, 189, 248, 0.15)'
    }
  }

  return (
    <div
      role="region"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: '56px',
        right: '16px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: 'calc(100vw - 32px)'
      }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="nexus-toast-card"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(8, 16, 32, 0.94)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${getBorderColor(toast.type)}`,
            borderRadius: '6px',
            boxShadow: getGlow(toast.type),
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f8fafc',
            fontSize: '12px',
            lineHeight: 1.4,
            animation: 'fadeInSlide 0.2s ease-out'
          }}
        >
          {getToastIcon(toast.type)}
          <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
            <span style={{ fontWeight: 500 }}>{toast.message}</span>
          </div>
          <button
            type="button"
            title="Dismiss notification"
            aria-label="Dismiss notification"
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '3px',
              flexShrink: 0
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
