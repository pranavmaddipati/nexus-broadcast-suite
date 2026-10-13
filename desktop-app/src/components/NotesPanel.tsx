import React from 'react'
import { PanelHeader } from './PanelHeader'
import { Edit3 } from 'lucide-react'

export const NotesPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      <div style={{ flex: 1, padding: '12px', background: 'transparent' }}>
        <textarea
          style={{
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border-color)',
            borderRadius: '2px',
            color: 'var(--text-primary)',
            padding: '12px',
            fontSize: '12px',
            fontFamily: 'var(--sans)',
            resize: 'none',
            boxSizing: 'border-box',
            outline: 'none'
          }}
          placeholder="Enter session notes here..."
          defaultValue={`Guest speaker arriving 10 minutes early.
Check mic levels before going live.
Use lower third for sermon title.
Record session for YouTube archive.`}
        />
      </div>
    </div>
  )
}
