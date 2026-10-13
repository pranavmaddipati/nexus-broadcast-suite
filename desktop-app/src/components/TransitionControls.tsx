import React from 'react'

export const TransitionControls: React.FC = () => {
  return (
    <div className="cp-panel">
      <div className="cp-p-head"><span className="cp-dot"></span>Transition controls</div>
      
      <div className="cp-tc-fields">
        <div className="cp-tc-field"><label>Duration</label><div className="cp-box">1.0 sec</div></div>
        <div className="cp-tc-field"><label>Direction</label><div className="cp-box">Left to Right</div></div>
        <div className="cp-tc-field"><label>Border</label><div className="cp-box">0 px</div></div>
      </div>
      
      <div className="cp-tc-grid">
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#10005;</span>None</div>
        <div className="cp-tc-btn active"><span className="cp-tc-icon">&#9635;</span>Mix</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#9660;</span>Dip</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#8594;</span>Wipe</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#8677;</span>Push</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#9645;</span>Slide</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#9707;</span>Barn Door</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#128337;</span>Clock</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#9678;</span>Zoom</div>
        <div className="cp-tc-btn"><span className="cp-tc-icon">&#9670;</span>Fade</div>
      </div>
      
      <div className="cp-tc-bottom">
        <div className="cp-auto-toggle">Auto transition<div className="cp-toggle-track"><div className="cp-toggle-thumb"></div></div></div>
        <div className="cp-voice-btn"><div className="cp-voice-icon">&#127908;</div><div>Voice command<br/>Ready</div></div>
      </div>
    </div>
  )
}
