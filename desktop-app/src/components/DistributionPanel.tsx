import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CircleStop, Play, Radio } from 'lucide-react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { StreamDestination } from '../store/StoreTypes'

export const DistributionPanel: React.FC = () => {
  const { destinations = [], updateDestination, startSingleStream, stopSingleStream, startAllStreams, stopAllStreams, bitrate = 0 } = useBroadcast()
  const [expanded, setExpanded] = useState<string | null>(null)
  return <div className="distribution-panel">
    <div className="panel-header"><Radio size={12} /><span className="title">OUTPUT DESTINATIONS</span><button onClick={startAllStreams}>START ALL</button><button onClick={stopAllStreams}>STOP ALL</button></div>
    <div className="distribution-list">{destinations.map((destination: StreamDestination) => {
      const open = expanded === destination.id
      const live = destination.status === 'streaming'
      return <section key={destination.id} className={live ? 'live' : ''}>
        <button className="distribution-summary" onClick={() => setExpanded(open ? null : destination.id)}>{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}<strong>{destination.name}</strong><span>{live ? `${bitrate || destination.bitrate} kbps` : destination.status}</span></button>
        {open && <div className="distribution-settings">
          <label>Enabled<input type="checkbox" checked={destination.enabled} onChange={event => updateDestination(destination.id, { enabled: event.target.checked })} /></label>
          <label>URL<input value={destination.rtmpUrl} onChange={event => updateDestination(destination.id, { rtmpUrl: event.target.value })} /></label>
          <label>Stream key<input type="password" value={destination.streamKey} onChange={event => updateDestination(destination.id, { streamKey: event.target.value })} /></label>
          <button disabled={!destination.enabled} onClick={() => live ? stopSingleStream(destination.id) : startSingleStream(destination.id)}>{live ? <CircleStop size={11} /> : <Play size={11} />}{live ? 'STOP' : 'START'}</button>
        </div>}
      </section>
    })}</div>
  </div>
}
