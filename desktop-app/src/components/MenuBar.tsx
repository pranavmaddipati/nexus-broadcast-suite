import React, { useState } from 'react'

export const MenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuItems = ['File', 'Edit', 'View', 'Docks', 'Profile', 'Scene', 'Tools', 'Help']

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
      {/* TIGHT MENU SPACING */}
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '100%' }}>
        {menuItems.map(menu => {
          const isActive = activeMenu === menu.toLowerCase();
          return (
            <div 
              key={menu} 
              onMouseEnter={() => setActiveMenu(menu.toLowerCase())}
              onMouseLeave={() => setActiveMenu(null)}
              style={{
                cursor: 'pointer',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                borderRadius: '2px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                height: '26px',
                padding: '0 12px',
                position: 'relative',
                letterSpacing: '0.02em',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.8)' : 'none'
              }}
            >
              {menu}
            </div>
          )
        })}
      </div>
    </div>
  )
}

