import React, { useEffect, useRef } from 'react'

export interface ContextMenuItem {
  label?: string
  action?: () => void
  icon?: React.ReactNode
  danger?: boolean
  separator?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items = [], onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const onCloseRef = useRef(onClose)
  
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseRef.current()
      }
    }
    
    // Add event listener with a slight delay so the current click doesn't close it immediately
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside)
    }, 10)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // Keep menu within screen bounds
  const safeX = Math.min(x, window.innerWidth - 200)
  const safeY = Math.min(y, window.innerHeight - (items.length * 28 + 10))

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: safeX,
        top: safeY,
        background: 'transparent',
        border: '1px solid var(--border-console)',
        borderRadius: '2px',
        padding: '4px 0',
        minWidth: '160px',
        zIndex: 9999,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
      }}
      onClick={e => e.stopPropagation()}
    >
      {(items || []).map((item, idx) => {
        if (item.separator) {
          return <div key={`sep-${idx}`} style={{ height: '1px', background: 'var(--border-console)', margin: '4px 0' }} />
        }
        
        return (
          <button
            key={idx}
            onClick={() => {
              item.action?.()
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '6px 12px',
              background: 'transparent',
              border: 'none',
              color: item.danger ? '#ef4444' : 'var(--text-active)',
              fontSize: '10px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-panel-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {item.icon && <span style={{ width: '12px', display: 'flex', justifyContent: 'center' }}>{item.icon}</span>}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
