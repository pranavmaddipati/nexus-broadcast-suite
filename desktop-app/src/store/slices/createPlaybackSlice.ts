import type { StateCreator } from 'zustand';
import type { BroadcastState } from '../StoreTypes';

export const createPlaybackSlice: StateCreator<
  BroadcastState,
  [],
  [],
  Pick<BroadcastState, 'mediaPlaybackState' | 'playMedia' | 'pauseMedia' | 'seekMedia' | 'toggleMediaLoop' | 'setMediaDuration' | 'updateMediaTime'>
> = (set) => ({
  mediaPlaybackState: {},

  playMedia: (sourceId) => set((state) => ({
    mediaPlaybackState: {
      ...state.mediaPlaybackState,
      [sourceId]: {
        ...state.mediaPlaybackState[sourceId],
        isPlaying: true,
      }
    }
  })),

  pauseMedia: (sourceId) => set((state) => ({
    mediaPlaybackState: {
      ...state.mediaPlaybackState,
      [sourceId]: {
        ...state.mediaPlaybackState[sourceId],
        isPlaying: false,
      }
    }
  })),

  seekMedia: (sourceId, time) => set((state) => ({
    mediaPlaybackState: {
      ...state.mediaPlaybackState,
      [sourceId]: {
        ...state.mediaPlaybackState[sourceId],
        currentTime: time,
      }
    }
  })),

  toggleMediaLoop: (sourceId) => set((state) => ({
    mediaPlaybackState: {
      ...state.mediaPlaybackState,
      [sourceId]: {
        ...state.mediaPlaybackState[sourceId],
        loop: !state.mediaPlaybackState[sourceId]?.loop,
      }
    }
  })),

  setMediaDuration: (sourceId, duration) => set((state) => ({
    mediaPlaybackState: {
      ...state.mediaPlaybackState,
      [sourceId]: {
        ...state.mediaPlaybackState[sourceId],
        duration,
      }
    }
  })),

  updateMediaTime: (sourceId, time) => set((state) => ({
    mediaPlaybackState: {
      ...state.mediaPlaybackState,
      [sourceId]: {
        ...state.mediaPlaybackState[sourceId],
        currentTime: time,
      }
    }
  }))
});

// cache buster 1
