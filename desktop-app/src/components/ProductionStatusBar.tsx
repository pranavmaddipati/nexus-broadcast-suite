import React from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'

export const ProductionStatusBar: React.FC = () => {
  const { scenes = [], activeScene, liveScene, transitionType = 'cut', transitionDuration = 0, cpuUsage = 0, gpuUsage = 0, ramUsage = 0, droppedFrames = 0, isStreaming = false, isRecording = false, virtualCameraActive = false, ndiEnabled = false } = useBroadcast()
  const preview = scenes.find((scene: any) => scene.id === activeScene)?.name || 'None'
  const program = scenes.find((scene: any) => scene.id === liveScene)?.name || 'None'
  return <div className="production-status-bar">
    <span><b>PRV</b>{preview}</span><span><b>PGM</b>{program}</span><span>{String(transitionType).toUpperCase()} {transitionDuration}ms</span>
    <span className="production-metrics">CPU {Math.round(cpuUsage)}% · GPU {Math.round(gpuUsage)}% · MEM {Math.round(ramUsage)}% · DROP {droppedFrames}</span>
    <span>STREAM {isStreaming ? 'LIVE' : 'OFF'} · REC {isRecording ? 'ON' : 'OFF'} · V-CAM {virtualCameraActive ? 'ON' : 'OFF'} · NDI {ndiEnabled ? 'ON' : 'OFF'}</span>
  </div>
}
