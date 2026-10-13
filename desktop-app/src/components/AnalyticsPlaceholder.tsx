import React from 'react'
import { BarChart2, ChevronDown, ChevronRight } from 'lucide-react'

export const AnalyticsPlaceholder: React.FC<{ expanded?: boolean; onToggle?: () => void }> = ({ expanded, onToggle }) => (
  <div className="utility-panel">
    <button className="panel-header utility-panel-header" onClick={onToggle} aria-expanded={Boolean(expanded)}>
      <BarChart2 size={12} /><span className="title">ANALYTICS</span><span className="utility-summary">Unavailable</span>
      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
    </button>
    {expanded && <div className="utility-empty" role="status">No audience-metrics provider is connected.</div>}
  </div>
)
