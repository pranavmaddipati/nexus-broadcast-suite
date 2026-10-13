import { useBroadcast } from '../context/NewBroadcastContext'

export const PreviewMonitor = () => {
  const { previewCanvasRef, scenes, activeScene } = useBroadcast()
  const scene = scenes.find(scene => scene.id === activeScene)
  return (
    <section className="depth-layer-1 broadcast-monitor" aria-label="Preview monitor">
      <header className="panel-header">
        <span>PREVIEW</span>
        <span className="monitor-scene-name" title={scene?.name}>{scene?.name || 'No scene selected'}</span>
      </header>
      <div className="broadcast-monitor-viewport">
        <canvas ref={previewCanvasRef} width={1920} height={1080} aria-label="Preview video" />
      </div>
    </section>
  )
}
