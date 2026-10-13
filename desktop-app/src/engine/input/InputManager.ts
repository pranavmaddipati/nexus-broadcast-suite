import type { Scene, SceneSource } from '../../store/StoreTypes'

export class InputManager {
  /**
   * Deletes a source from a scene
   */
  static deleteSources(scenes: Scene[], sceneId: string, sourceIds: string[]): Scene[] {
    const idsToDelete = new Set(sourceIds)
    return scenes.map(sc => {
      if (sc.id === sceneId) {
        return { ...sc, sources: sc.sources.filter(s => !idsToDelete.has(s.id)) }
      }
      return sc
    })
  }

  /**
   * Reorders a source within a scene
   */
  static reorderSource(scenes: Scene[], sceneId: string, sourceId: string, direction: 'up' | 'down' | 'top' | 'bottom'): Scene[] {
    return scenes.map(s => {
      if (s.id !== sceneId) return s
      const updated = [...s.sources]
      const idx = updated.findIndex(x => x.id === sourceId)
      if (idx === -1) return s
      const [item] = updated.splice(idx, 1)

      if (direction === 'up') {
        updated.splice(Math.max(0, idx - 1), 0, item)
      } else if (direction === 'down') {
        updated.splice(Math.min(updated.length, idx + 1), 0, item)
      } else if (direction === 'top') {
        updated.unshift(item)
      } else if (direction === 'bottom') {
        updated.push(item)
      }
      return { ...s, sources: updated }
    })
  }
}