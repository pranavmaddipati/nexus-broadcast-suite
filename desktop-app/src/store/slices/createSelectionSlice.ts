import type { StateCreator } from 'zustand';
import type { BroadcastState } from '../StoreTypes';

export const createSelectionSlice: StateCreator<BroadcastState, [], [], Pick<BroadcastState, 'selectedSceneIds' | 'selectedSourceIds' | 'selectScene' | 'selectSource' | 'clearSelection' | 'setSelectedSourceIds'>> = (set) => ({
  selectedSceneIds: [],
  selectedSourceIds: [],
  
  selectScene: (id: string, multi: boolean = false) => set((state) => {
    if (multi) {
      if (state.selectedSceneIds.includes(id)) {
        return { selectedSceneIds: state.selectedSceneIds.filter(sId => sId !== id) };
      } else {
        return { selectedSceneIds: [...state.selectedSceneIds, id] };
      }
    }
    return { selectedSceneIds: [id] };
  }),

  selectSource: (id: string, multi: boolean = false) => set((state) => {
    if (multi) {
      if (state.selectedSourceIds.includes(id)) {
        return { selectedSourceIds: state.selectedSourceIds.filter(sId => sId !== id) };
      } else {
        return { selectedSourceIds: [...state.selectedSourceIds, id] };
      }
    }
    return { selectedSourceIds: [id] };
  }),

  setSelectedSourceIds: (ids: string[]) => set({ selectedSourceIds: ids }),

  clearSelection: () => set({ selectedSceneIds: [], selectedSourceIds: [] }),
});

// cache buster 1
