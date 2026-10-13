import React from 'react'
import { Play, Square, Video, Scissors, Camera, Zap, Bookmark, Signal } from 'lucide-react'

export const QuickAccessBar: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '100%', width: '100%', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '2px', padding: '0 8px' }}>
      
      {/* Transitions */}
      <button className="btn btn-secondary hover-brighten" style={{ height: '24px', fontSize: '10px' }}><Play size={12} /> TAKE</button>
      <button className="btn btn-secondary hover-brighten" style={{ height: '24px', fontSize: '10px' }}><Scissors size={12} /> CUT</button>
      <button className="btn btn-secondary hover-brighten" style={{ height: '24px', fontSize: '10px' }}>FADE</button>
      
      <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 8px' }} />

      {/* Broadcast Outputs */}
      <button className="btn btn-success hover-brighten" style={{ height: '24px', fontSize: '10px' }}><Signal size={12} /> STREAM</button>
      <button className="btn btn-danger hover-brighten" style={{ height: '24px', fontSize: '10px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} /> RECORD</button>
      <button className="btn btn-primary hover-brighten" style={{ height: '24px', fontSize: '10px' }}><Video size={12} /> VIRTUAL CAMERA</button>
      <button className="btn btn-secondary hover-brighten" style={{ height: '24px', fontSize: '10px' }}>NDI OUT</button>
      
      <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 8px' }} />

      {/* Utilities */}
      <button className="btn btn-secondary hover-brighten" style={{ height: '24px', fontSize: '10px' }}><Camera size={12} /> SCREENSHOT</button>
      <button className="btn btn-secondary hover-brighten" style={{ height: '24px', fontSize: '10px' }}><Bookmark size={12} /> MARKER</button>

    </div>
  )
}
