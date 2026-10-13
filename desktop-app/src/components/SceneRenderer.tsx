import React, { useEffect, useRef, memo } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'
import type { SceneSource } from '../context/NewBroadcastContext'
import type { MediaSourceElement } from '../engine/MediaManager'

export const SceneRenderer: React.FC<{ sceneId: string, isLive?: boolean }> = memo(({ sceneId, isLive }) => {
  const { scenes, mediaSources = {} } = useBroadcast() as any // bypass strict type until fully migrated if needed
  const videoElements = mediaSources
  const scene = scenes?.find(s => s.id === sceneId)
  
  if (!scene) return null
  
  const sortedSources = [...(scene.sources || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {sortedSources.map(src => {
        if (!src.visible) return null
        return <SourceNode key={src.id} source={src} videoElements={videoElements} isLive={isLive} />
      })}
    </div>
  )
})

const SourceNode: React.FC<{ source: SceneSource, videoElements: Record<string, MediaSourceElement>, isLive?: boolean }> = memo(({ source, videoElements, isLive }) => {
  const { x, y, width, height, opacity, settings } = source
  const rot = settings?.rotation || 0
  const scaleX = settings?.scaleX ?? 1
  const scaleY = settings?.scaleY ?? 1
  const flipH = settings?.flipHorizontal ? -1 : 1
  const flipV = settings?.flipVertical ? -1 : 1

  const finalScaleX = scaleX * flipH
  const finalScaleY = scaleY * flipV

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    opacity: opacity,
    transform: `rotate(${rot}deg) scaleX(${finalScaleX}) scaleY(${finalScaleY})`,
    zIndex: source.zIndex,
    transformOrigin: 'center center',
  }

  // Handle crop using clip-path if provided
  if (source.filters) {
    const crop = source.filters.find(f => f.type === 'crop' && f.enabled)
    if (crop) {
      const { cropLeft = 0, cropRight = 0, cropTop = 0, cropBottom = 0 } = crop.settings || {}
      if (cropLeft > 0 || cropRight > 0 || cropTop > 0 || cropBottom > 0) {
         style.clipPath = `inset(${cropTop}px ${cropRight}px ${cropBottom}px ${cropLeft}px)`
      }
    }
  }

  const type = source.type
  const isVideoType = ['camera', 'display_capture', 'window_capture', 'game_capture', 'ndi', 'media', 'video', 'virtual_camera'].includes(type)
  
  if (isVideoType) {
    return <VideoSourceRenderer source={source} videoElements={videoElements} style={style} isLive={isLive} />
  } else if (type === 'image' || type === 'gif') {
    const imgUrl = settings?.blobUrl || settings?.filePath || settings?.url
    return <img src={imgUrl} style={{ ...style, objectFit: 'fill' }} alt={source.name} />
  } else if (type === 'text') {
    return (
      <div style={{
        ...style,
        color: settings?.textColor || '#ffffff',
        fontSize: `${settings?.textSize || 48}px`,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
      }}>
        {settings?.textContent}
      </div>
    )
  } else if (type === 'color_source' || type === 'shape') {
    if (type === 'shape' && (settings?.shapeType === 'ellipse' || settings?.shapeType === 'circle')) {
      return (
        <div style={{
          ...style,
          backgroundColor: settings?.fillColor || '#38bdf8',
          border: `${settings?.strokeWidth || 0}px solid ${settings?.strokeColor || '#ffffff'}`,
          borderRadius: '50%'
        }} />
      )
    }
    return (
      <div style={{
        ...style,
        backgroundColor: settings?.backgroundColor || settings?.fillColor || 'var(--bg-main)',
        border: type === 'shape' ? `${settings?.strokeWidth || 0}px solid ${settings?.strokeColor || '#ffffff'}` : undefined
      }} />
    )
  } else if (type === 'audio') {
    return (
      <div style={{
        ...style,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        border: '2px solid #38bdf8',
        color: '#38bdf8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '24px' }}>AUDIO</div>
        <div style={{ fontSize: '12px', marginTop: '10px', fontFamily: 'Inter, sans-serif' }}>{source.name}</div>
      </div>
    )
  }

  // Fallback for unknown sources
  return (
    <div style={{
      ...style,
      backgroundColor: '#0b0f19',
      border: '2px dashed #38bdf8',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '24px'
    }}>
      {source.name.toUpperCase()} (UNKNOWN)
    </div>
  )
})

const VideoSourceRenderer: React.FC<{ source: SceneSource, videoElements: Record<string, MediaSourceElement>, style: React.CSSProperties, isLive?: boolean }> = memo(({ source, videoElements, style, isLive }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let animFrame: number
    const el = videoRef.current
    if (!el) return

    const srcId = isLive ? `${source.id}_live` : source.id
    const bgVideo = videoElements[srcId]?.videoElement
    
    if (bgVideo && bgVideo.srcObject) {
      if (el.srcObject !== bgVideo.srcObject) {
        el.srcObject = bgVideo.srcObject
      }
    } else if (bgVideo && bgVideo.src) {
      if (el.src !== bgVideo.src) {
        el.src = bgVideo.src
      }
    }

    if ('requestVideoFrameCallback' in el) {
      const updateFrame = () => {
        animFrame = (el as any).requestVideoFrameCallback(updateFrame)
      }
      animFrame = (el as any).requestVideoFrameCallback(updateFrame)
    }

    return () => {
      if (animFrame && 'cancelVideoFrameCallback' in el) {
        (el as any).cancelVideoFrameCallback(animFrame)
      }
    }
  }, [source.id, videoElements])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{ ...style, objectFit: 'contain' }}
    />
  )
})
