import { useBroadcast } from '../context/NewBroadcastContext'

export const ProgramMonitor = () => {
  const { programCanvasRef, scenes, liveScene, isStreaming, isRecording } = useBroadcast()
  const scene = scenes.find(scene => scene.id === liveScene)
  return (
    <section className="depth-layer-1 broadcast-monitor program-monitor" aria-label="Program monitor">
      <header className="panel-header">
        <span>PROGRAM{isStreaming ? ' (ON AIR)' : ''}</span>
        <span className="monitor-scene-name" title={scene?.name}>{scene?.name || 'No program scene'}</span>
        {isRecording && <span aria-label="Recording">REC</span>}
      </header>
      <div className="broadcast-monitor-viewport">
        <canvas ref={programCanvasRef} width={1920} height={1080} aria-label="Program video" />
      </div>
    </section>
  )
}
