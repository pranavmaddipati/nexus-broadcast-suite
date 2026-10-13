import React, { useMemo, useState } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'

const categories: Record<string, string[]> = { Studio: ['camera'], Field: ['ndi', 'srt'], Web: ['browser'], IP: ['ndi', 'srt'] }

export const SceneLibrary: React.FC = () => {
  const { scenes = [], activeScene, liveScene, selectScene, takeLive } = useBroadcast()
  const [category, setCategory] = useState('All')
  const visibleScenes = useMemo(() => scenes.filter((scene: any) => {
    if (scene.isFolder || scene.id.endsWith('_live')) return false
    return category === 'All' || scene.sources.some((source: any) => categories[category]?.includes(source.type))
  }), [scenes, category])

  return <div className="scene-library-panel">
    <div className="panel-header"><div className="panel-status-dot" /><span className="title">SCENE LIBRARY</span><span className="panel-context-label">{visibleScenes.length} scenes</span></div>
    <div className="concept-tab-bar scene-library-tabs">{['All', 'Studio', 'Field', 'Web', 'IP'].map(value => <button key={value} className={`concept-tab ${category === value ? 'active' : ''}`} onClick={() => setCategory(value)}>{value}</button>)}</div>
    <div className="scene-library-list">{visibleScenes.map((scene: any) => {
      const status = scene.id === liveScene ? 'PROGRAM' : scene.id === activeScene ? 'PREVIEW' : ''
      const thumbnail = scene.thumbnailUrl || scene.sources.find((source: any) => source.type === 'image')?.settings?.url
      return <button key={scene.id} className={`scene-library-row ${status.toLowerCase()}`} onClick={() => selectScene(scene.id)} onDoubleClick={() => takeLive(scene.id)}>
        <span className="scene-library-thumb" style={thumbnail ? { backgroundImage: `url("${thumbnail}")` } : undefined} />
        <span className="scene-library-copy"><strong>{scene.name}</strong><small>{scene.duration || '00:00:00'} · {scene.sources.length} source{scene.sources.length === 1 ? '' : 's'}</small></span>
        {status && <span className="scene-library-status">{status}</span>}
      </button>
    })}</div>
  </div>
}
