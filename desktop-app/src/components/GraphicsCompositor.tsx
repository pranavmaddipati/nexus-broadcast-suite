import React, { useEffect, useRef } from 'react'
import { useBroadcast } from '../context/NewBroadcastContext'

interface GraphicLayer {
  visible: boolean
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  type: 'shape' | 'text' | 'image'
  fillColor?: string
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  shapeType?: 'rectangle' | 'circle' | 'rounded'
  borderRadius?: number
  strokeColor?: string
  strokeWidth?: number
  text?: string
  bold?: boolean
  italic?: boolean
  fontSize: number
  fontFamily?: string
  color?: string
  textAlign?: CanvasTextAlign
  url?: string
}

// Helper to draw a GraphicTemplate to a Canvas2D Context
export const drawGraphicsToCanvas = (ctx: CanvasRenderingContext2D, layers: GraphicLayer[], width: number, height: number) => {
  ctx.clearRect(0, 0, width, height)
  
  // Sort by z-index if needed (assuming array order is back-to-front)
  layers.forEach(layer => {
    if (!layer.visible) return
    
    ctx.save()
    ctx.translate(layer.x, layer.y)
    ctx.rotate((layer.rotation * Math.PI) / 180)
    ctx.globalAlpha = layer.opacity

    if (layer.type === 'shape') {
      ctx.fillStyle = layer.fillColor || '#ffffff'
      if (layer.shadowColor) {
        ctx.shadowColor = layer.shadowColor
        ctx.shadowBlur = layer.shadowBlur || 0
        ctx.shadowOffsetX = layer.shadowOffsetX || 0
        ctx.shadowOffsetY = layer.shadowOffsetY || 0
      }
      
      if (layer.shapeType === 'rectangle') {
        ctx.fillRect(0, 0, layer.width, layer.height)
      } else if (layer.shapeType === 'circle') {
        ctx.beginPath()
        ctx.arc(layer.width / 2, layer.height / 2, layer.width / 2, 0, 2 * Math.PI)
        ctx.fill()
      } else if (layer.shapeType === 'rounded') {
        const r = layer.borderRadius || 12
        ctx.beginPath()
        ctx.moveTo(r, 0)
        ctx.lineTo(layer.width - r, 0)
        ctx.quadraticCurveTo(layer.width, 0, layer.width, r)
        ctx.lineTo(layer.width, layer.height - r)
        ctx.quadraticCurveTo(layer.width, layer.height, layer.width - r, layer.height)
        ctx.lineTo(r, layer.height)
        ctx.quadraticCurveTo(0, layer.height, 0, layer.height - r)
        ctx.lineTo(0, r)
        ctx.quadraticCurveTo(0, 0, r, 0)
        ctx.fill()
      }
      
      if (layer.strokeColor) {
        ctx.strokeStyle = layer.strokeColor
        ctx.lineWidth = layer.strokeWidth || 1
        ctx.stroke()
      }
    }

    if (layer.type === 'text' && layer.text) {
      const weight = layer.bold ? 'bold' : 'normal'
      const style = layer.italic ? 'italic' : 'normal'
      ctx.font = `${style} ${weight} ${layer.fontSize}px ${layer.fontFamily || 'sans-serif'}`
      
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.textAlign = (layer.textAlign as CanvasTextAlign) || 'left'
      ctx.textBaseline = 'top'
      
      if (layer.shadowColor) {
        ctx.shadowColor = layer.shadowColor
        ctx.shadowBlur = layer.shadowBlur || 0
        ctx.shadowOffsetX = layer.shadowOffsetX || 0
        ctx.shadowOffsetY = layer.shadowOffsetY || 0
      }
      
      let tx = 0
      if (ctx.textAlign === 'center') tx = layer.width / 2
      if (ctx.textAlign === 'right') tx = layer.width
      
      ctx.fillText(layer.text, tx, 0)
      
      if (layer.strokeColor) {
        ctx.strokeStyle = layer.strokeColor
        ctx.lineWidth = layer.strokeWidth || 1
        ctx.strokeText(layer.text, tx, 0)
      }
    }

    // Note: Image rendering would require pre-loading Image objects in a real scenario
    if (layer.type === 'image' && layer.url) {
      // Stub for image drawing
    }

    ctx.restore()
  })
}

export const GraphicsCompositor: React.FC = () => {
  const { scenes } = useBroadcast()
  const canvasRefs = useRef<Record<string, HTMLCanvasElement>>({})
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Find all active graphics sources across all scenes
    const renderLoop = () => {
      const activeGraphicsSources: any[] = []
      
      scenes.forEach(scene => {
        scene.sources.forEach(src => {
          if (src.type === 'graphics' && src.settings?.layers) {
            activeGraphicsSources.push(src)
          }
        })
      })

      activeGraphicsSources.forEach(src => {
        if (!canvasRefs.current[src.id]) {
          const canvas = document.createElement('canvas')
          canvas.width = 1920
          canvas.height = 1080
          canvas.id = `graphics-canvas-${src.id}`
          canvas.style.display = 'none'
          document.body.appendChild(canvas)
          canvasRefs.current[src.id] = canvas
        }

        const canvas = canvasRefs.current[src.id]
        const ctx = canvas.getContext('2d')
        if (ctx) {
          drawGraphicsToCanvas(ctx, src.settings.layers, 1920, 1080)
        }
      })

      rafRef.current = requestAnimationFrame(renderLoop)
    }

    rafRef.current = requestAnimationFrame(renderLoop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      Object.values(canvasRefs.current).forEach(canvas => canvas.remove())
      canvasRefs.current = {}
    }
  }, [scenes])

  return null
}
