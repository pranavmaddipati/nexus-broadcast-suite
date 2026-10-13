import React from 'react'
import { MoreVertical } from 'lucide-react'

export interface PanelHeaderProps {
  id: string
  title: string
  isFloating?: boolean
  children?: React.ReactNode
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, children }) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'transparent',
        height: 'var(--header-height)',
        minHeight: 'var(--header-height)',
        padding: '0 8px',
        flexShrink: 0,
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <span style={{ 
        fontSize: '14px', 
        fontWeight: 700, 
        color: 'var(--text-secondary)', 
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {title}
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </div>
  )
}
