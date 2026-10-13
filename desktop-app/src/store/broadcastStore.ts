import { create } from 'zustand';
import type { BroadcastState } from './StoreTypes';
import { createSceneSlice } from './slices/createSceneSlice';
import { createSourceSlice } from './slices/createSourceSlice';
import { createSelectionSlice } from './slices/createSelectionSlice';
import { createRoutingSlice } from './slices/createRoutingSlice';
import { createTransitionSlice } from './slices/createTransitionSlice';
import { createOutputSlice } from './slices/createOutputSlice';
import { createPlaybackSlice } from './slices/createPlaybackSlice';

export const useBroadcastStore = create<BroadcastState>((...a) => ({
  ...createSceneSlice(...a),
  ...createSourceSlice(...a),
  ...createSelectionSlice(...a),
  ...createRoutingSlice(...a),
  ...createTransitionSlice(...a),
  ...createOutputSlice(...a),
  ...createPlaybackSlice(...a),
}));
