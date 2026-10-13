import type { StateCreator } from 'zustand';
import type { BroadcastState } from '../StoreTypes';

export const createRoutingSlice: StateCreator<BroadcastState, [], [], Pick<BroadcastState, 'previewSceneId' | 'programSceneId' | 'setPreviewScene' | 'setProgramScene'>> = (set) => ({
  previewSceneId: null,
  programSceneId: null,
  
  setPreviewScene: (id: string) => set({ previewSceneId: id }),
  setProgramScene: (id: string) => set({ programSceneId: id }),
});
