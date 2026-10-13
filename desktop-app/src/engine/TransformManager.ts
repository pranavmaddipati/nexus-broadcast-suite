import type { SceneSource } from '../store/StoreTypes'

export class TransformManager {
  public static getHandles(src: SceneSource) {
    const hw = 10
    return {
      nw: { x: src.x - hw, y: src.y - hw, w: hw*2, h: hw*2, cursor: 'nwse-resize' },
      ne: { x: src.x + src.width - hw, y: src.y - hw, w: hw*2, h: hw*2, cursor: 'nesw-resize' },
      se: { x: src.x + src.width - hw, y: src.y + src.height - hw, w: hw*2, h: hw*2, cursor: 'nwse-resize' },
      sw: { x: src.x - hw, y: src.y + src.height - hw, w: hw*2, h: hw*2, cursor: 'nesw-resize' },
      n:  { x: src.x + src.width/2 - hw, y: src.y - hw, w: hw*2, h: hw*2, cursor: 'ns-resize' },
      s:  { x: src.x + src.width/2 - hw, y: src.y + src.height - hw, w: hw*2, h: hw*2, cursor: 'ns-resize' },
      e:  { x: src.x + src.width - hw, y: src.y + src.height/2 - hw, w: hw*2, h: hw*2, cursor: 'ew-resize' },
      w:  { x: src.x - hw, y: src.y + src.height/2 - hw, w: hw*2, h: hw*2, cursor: 'ew-resize' },
      rot: { x: src.x + src.width/2 - hw, y: src.y - 40, w: hw*2, h: hw*2, cursor: 'crosshair' }
    }
  }

  public static getHitHandle(src: SceneSource, x: number, y: number): string | null {
    const handles = this.getHandles(src)
    for (const [id, h] of Object.entries(handles)) {
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        return id
      }
    }
    return null
  }

  public static calculateSnap(
    newX: number, 
    newY: number, 
    sourceStartW: number, 
    sourceStartH: number, 
    visibleSources: SceneSource[],
    excludeIds: string[]
  ) {
    const snapPointsX = [0, 1920/2 - sourceStartW/2, 1920 - sourceStartW]
    const snapPointsY = [0, 1080/2 - sourceStartH/2, 1080 - sourceStartH]
    const SNAP_THRES = 20

    visibleSources.forEach(src => {
      if (!excludeIds.includes(src.id)) {
        snapPointsX.push(src.x)
        snapPointsX.push(src.x + src.width - sourceStartW)
        snapPointsX.push(src.x + src.width/2 - sourceStartW/2)
        snapPointsX.push(src.x - sourceStartW)
        snapPointsX.push(src.x + src.width)
        
        snapPointsY.push(src.y)
        snapPointsY.push(src.y + src.height - sourceStartH)
        snapPointsY.push(src.y + src.height/2 - sourceStartH/2)
        snapPointsY.push(src.y - sourceStartH)
        snapPointsY.push(src.y + src.height)
      }
    })

    let snappedX: number | undefined
    let closestX = newX; let minDx = SNAP_THRES
    for (let sx of snapPointsX) {
      if (Math.abs(newX - sx) < minDx) { minDx = Math.abs(newX - sx); closestX = sx; snappedX = sx; }
    }
    
    let snappedY: number | undefined
    let closestY = newY; let minDy = SNAP_THRES
    for (let sy of snapPointsY) {
      if (Math.abs(newY - sy) < minDy) { minDy = Math.abs(newY - sy); closestY = sy; snappedY = sy; }
    }

    return {
      x: closestX,
      y: closestY,
      snappedX,
      snappedY
    }
  }
}
