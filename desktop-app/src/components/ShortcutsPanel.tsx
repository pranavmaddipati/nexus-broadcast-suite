import React from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { TransitionType } from '../context/NewBroadcastContext'

export const ShortcutsPanel: React.FC = () => {
  const { transitionType = 'cut', setTransitionType = () => {}, autoTransition = () => {} } = useBroadcast()

  const shortcuts: { label: string; type: TransitionType }[] = [
    { label: 'CUT', type: 'cut' },
    { label: 'DISSOLVE', type: 'fade' },
    { label: 'PUSH', type: 'push' },
    { label: 'WIPE', type: 'wipe' },
    { label: 'ZOOM', type: 'zoom' },
  ]

  const handleShortcutClick = (type: TransitionType) => {
    setTransitionType(type)
    autoTransition()
  }

  return (
    <div className="shortcuts-bar-panel">
      <div className="shortcuts-title-horizontal">SHORTCUTS</div>
      <div className="shortcuts-row-buttons">
        {(shortcuts || []).map((sc) => (
          <button
            key={sc.label}
            className={`shortcut-horizontal-btn ${transitionType === sc.type ? 'highlight' : ''}`}
            onClick={() => handleShortcutClick(sc.type)}
          >
            {sc.label}
          </button>
        ))}
      </div>
    </div>
  )
}
