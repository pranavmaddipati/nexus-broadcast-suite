import React, { useMemo } from 'react'
import { SceneRenderer } from './SceneRenderer'

export const TransitionEngine: React.FC<{
  fromSceneId: string | null
  toSceneId: string
  progress: number
  type: string
  isLive?: boolean
}> = ({ fromSceneId, toSceneId, progress, type, isLive }) => {
  const cleanFromId = fromSceneId?.replace('_live', '') || null
  const cleanToId = toSceneId.replace('_live', '')

  const fromNode = useMemo(() => {
    if (!cleanFromId) return null
    return <SceneRenderer sceneId={cleanFromId} isLive={isLive} />
  }, [cleanFromId, isLive])

  const toNode = useMemo(() => {
    return <SceneRenderer sceneId={cleanToId} isLive={isLive} />
  }, [cleanToId, isLive])

  if (!cleanFromId || progress <= 0) {
    return <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>{toNode}</div>
  }

  if (progress >= 1) {
    return <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>{toNode}</div>
  }

  // Handle interpolation
  let fromStyle: React.CSSProperties = { position: 'absolute', width: '100%', height: '100%' }
  let toStyle: React.CSSProperties = { position: 'absolute', width: '100%', height: '100%' }

  switch (type) {
    case 'fade':
      toStyle.opacity = progress
      break
    case 'cut':
      toStyle.opacity = progress >= 0.5 ? 1 : 0
      fromStyle.opacity = progress >= 0.5 ? 0 : 1
      break
    case 'merge':
      toStyle.opacity = progress
      fromStyle.opacity = 1 - progress
      break
    case 'slide_left':
      fromStyle.transform = `translateX(${-progress * 100}%)`
      toStyle.transform = `translateX(${(1 - progress) * 100}%)`
      break
    case 'slide_right':
      fromStyle.transform = `translateX(${progress * 100}%)`
      toStyle.transform = `translateX(${(-1 + progress) * 100}%)`
      break
    case 'slide_up':
      fromStyle.transform = `translateY(${-progress * 100}%)`
      toStyle.transform = `translateY(${(1 - progress) * 100}%)`
      break
    case 'slide_down':
      fromStyle.transform = `translateY(${progress * 100}%)`
      toStyle.transform = `translateY(${(-1 + progress) * 100}%)`
      break
    case 'zoom':
      toStyle.transform = `scale(${progress})`
      toStyle.opacity = progress
      fromStyle.transform = `scale(${1 + progress})`
      fromStyle.opacity = 1 - progress
      break
    case 'push':
      fromStyle.transform = `scale(${1 - progress * 0.2})`
      fromStyle.opacity = 1 - progress
      toStyle.transform = `scale(${0.8 + progress * 0.2})`
      toStyle.opacity = progress
      break
    case 'cube':
      fromStyle.transform = `perspective(1000px) rotateY(${-90 * progress}deg) translateZ(960px)`
      fromStyle.opacity = 1 - progress
      toStyle.transform = `perspective(1000px) rotateY(${90 * (1 - progress)}deg) translateZ(960px)`
      toStyle.opacity = progress
      break
    case 'wipe':
      toStyle.clipPath = `inset(0 ${100 - (progress * 100)}% 0 0)`
      break
    case 'stinger':
      toStyle.opacity = progress > 0.5 ? 1 : 0
      fromStyle.opacity = progress > 0.5 ? 0 : 1
      break
    default:
      toStyle.opacity = progress
  }

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
      {progress < 1 && <div style={fromStyle}>{fromNode}</div>}
      {progress > 0 && <div style={toStyle}>{toNode}</div>}
    </div>
  )
}
