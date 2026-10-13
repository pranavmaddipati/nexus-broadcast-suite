import React, { useState } from 'react'
import { Video } from 'lucide-react'

// Basic stub to replace the corrupted file
export const SourceConfigurationPopup: React.FC<any> = ({ onClose, onAddSource, sourceType }) => {
  const [name, setName] = useState('')
  const [settings, setSettings] = useState<any>({})

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h2>CONFIGURE SOURCE</h2>
          <button onClick={onClose}>X</button>
        </div>
        <div className="popup-body">
          <p>This popup file was truncated during a previous agent execution.</p>
        </div>
        <div className="popup-footer">
          <button className="btn-cancel" onClick={onClose}>CANCEL</button>
          <button className="btn-primary" onClick={() => onAddSource && onAddSource(sourceType, name, settings)}>ADD SOURCE</button>
        </div>
      </div>
    </div>
  )
}