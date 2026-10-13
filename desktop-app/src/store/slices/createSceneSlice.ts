import type { StateCreator } from 'zustand';
import type { BroadcastState, Scene } from '../StoreTypes';

export const createSceneSlice: StateCreator<BroadcastState, [], [], Pick<BroadcastState, 'scenes' | 'createScene' | 'deleteScene' | 'renameScene' | 'duplicateScene' | 'moveScene' | 'pinScene' | 'lockScene' | 'setSceneColor'>> = (set) => ({
  scenes: [],
  
  createScene: (name: string, isFolder?: boolean) => set((state) => {
    const newScene: Scene = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      name,
      sources: [],
      isPinned: false,
      isLocked: false,
      color: '#3b82f6',
      createdAt: new Date(),
      updatedAt: new Date(),
      isFolder,
    };
    return { scenes: [...state.scenes, newScene] };
  }),

  deleteScene: (id: string) => set((state) => ({
    scenes: state.scenes.filter((s) => s.id !== id),
  })),

  renameScene: (id: string, newName: string) => set((state) => ({
    scenes: state.scenes.map((s) => s.id === id ? { ...s, name: newName, updatedAt: new Date() } : s),
  })),

  duplicateScene: (id: string) => set((state) => {
    const original = state.scenes.find((s) => s.id === id);
    if (!original) return state;
    
    // Deep copy sources and assign new IDs
    const newSources = original.sources.map(src => ({
      ...src,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
    }));

    const duplicate: Scene = {
      ...original,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      name: `${original.name} (Copy)`,
      sources: newSources,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const index = state.scenes.findIndex((s) => s.id === id);
    const newScenes = [...state.scenes];
    newScenes.splice(index + 1, 0, duplicate);
    return { scenes: newScenes };
  }),

  moveScene: (id: string, newIndex: number) => set((state) => {
    const index = state.scenes.findIndex((s) => s.id === id);
    if (index === -1) return state;
    const newScenes = [...state.scenes];
    const [item] = newScenes.splice(index, 1);
    const targetIndex = Math.max(0, Math.min(newIndex, newScenes.length));
    newScenes.splice(targetIndex, 0, item);
    return { scenes: newScenes };
  }),

  pinScene: (id: string, isPinned?: boolean) => set((state) => ({
    scenes: state.scenes.map((s) => s.id === id ? { ...s, isPinned: isPinned ?? !s.isPinned, updatedAt: new Date() } : s),
  })),

  lockScene: (id: string, isLocked?: boolean) => set((state) => ({
    scenes: state.scenes.map((s) => s.id === id ? { ...s, isLocked: isLocked ?? !s.isLocked, updatedAt: new Date() } : s),
  })),

  setSceneColor: (id: string, color: string) => set((state) => ({
    scenes: state.scenes.map((s) => s.id === id ? { ...s, color, updatedAt: new Date() } : s),
  })),
});
