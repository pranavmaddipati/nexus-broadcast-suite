import type { StateCreator } from 'zustand';
import type { BroadcastState, SceneSource } from '../StoreTypes';

export const createSourceSlice: StateCreator<BroadcastState, [], [], Pick<BroadcastState, 'createSource' | 'deleteSource' | 'moveSource' | 'updateSource' | 'duplicateSource'>> = (set) => ({
  createSource: (sceneId: string, type: string, name: string) => set((state) => {
    const newSource: SceneSource = {
      id: crypto.randomUUID(),
      name,
      type,
      visible: true,
      locked: false,
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      opacity: 1,
      settings: {},
      filters: [],
    };
    
    return {
      scenes: state.scenes.map((s) => 
        s.id === sceneId ? { ...s, sources: [newSource, ...s.sources], updatedAt: new Date() } : s
      )
    };
  }),

  deleteSource: (sceneId: string, sourceId: string) => set((state) => ({
    scenes: state.scenes.map((s) => 
      s.id === sceneId ? { ...s, sources: s.sources.filter(src => src.id !== sourceId), updatedAt: new Date() } : s
    )
  })),

  moveSource: (sceneId: string, sourceId: string, direction: 'up' | 'down' | 'top' | 'bottom') => set((state) => {
    return {
      scenes: state.scenes.map((s) => {
        if (s.id !== sceneId) return s;
        const index = s.sources.findIndex(src => src.id === sourceId);
        if (index === -1) return s;
        
        const newSources = [...s.sources];
        const [item] = newSources.splice(index, 1);
        
        if (direction === 'up') {
          newSources.splice(Math.max(0, index - 1), 0, item);
        } else if (direction === 'down') {
          newSources.splice(Math.min(newSources.length, index + 1), 0, item);
        } else if (direction === 'top') {
          newSources.unshift(item);
        } else if (direction === 'bottom') {
          newSources.push(item);
        }
        
        return { ...s, sources: newSources, updatedAt: new Date() };
      })
    };
  }),

  updateSource: (sceneId: string, sourceId: string, updates: Partial<SceneSource>) => set((state) => ({
    scenes: state.scenes.map((s) => 
      s.id === sceneId ? {
        ...s,
        sources: s.sources.map(src => src.id === sourceId ? { ...src, ...updates } : src),
        updatedAt: new Date()
      } : s
    )
  })),

  duplicateSource: (sceneId: string, sourceId: string) => set((state) => {
    return {
      scenes: state.scenes.map((s) => {
        if (s.id !== sceneId) return s;
        const original = s.sources.find(src => src.id === sourceId);
        if (!original) return s;
        
        const index = s.sources.findIndex(src => src.id === sourceId);
        const duplicate = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (Copy)`
        };
        
        const newSources = [...s.sources];
        newSources.splice(index + 1, 0, duplicate);
        return { ...s, sources: newSources, updatedAt: new Date() };
      })
    };
  }),
});

// cache buster 1
