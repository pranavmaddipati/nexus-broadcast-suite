import type { StateCreator } from 'zustand';
import type { BroadcastState, TransitionType } from '../StoreTypes';

export const createTransitionSlice: StateCreator<BroadcastState, [], [], Pick<BroadcastState, 'isTransitioning' | 'activeTransition' | 'transitionProgress' | 'transitionFromSceneId' | 'takeTransition'>> = (set, get) => ({
  isTransitioning: false,
  activeTransition: 'cut',
  transitionProgress: 0,
  transitionFromSceneId: null,
  
  takeTransition: (type: TransitionType, durationMs: number = 500) => {
    const state = get();
    if (!state.previewSceneId || state.isTransitioning) return;
    
    if (type === 'cut' || durationMs <= 0) {
      // Immediate cut
      set({ 
        programSceneId: state.previewSceneId, 
        isTransitioning: false,
        transitionProgress: 1.0,
      });
      return;
    }

    set({ 
      isTransitioning: true, 
      activeTransition: type, 
      transitionProgress: 0,
      transitionFromSceneId: state.programSceneId 
    });

    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1.0);
      
      set({ transitionProgress: progress });
      
      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        // Complete
        set((s) => ({
          programSceneId: s.previewSceneId,
          isTransitioning: false,
          transitionProgress: 1.0,
          transitionFromSceneId: null,
        }));
      }
    };
    
    requestAnimationFrame(animate);
  },
});
