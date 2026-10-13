import type { StateCreator } from 'zustand';
import type { BroadcastState } from '../StoreTypes';

// Keep track of any active timer so we can clear it if needed
let recordingInterval: any = null;

export const createOutputSlice: StateCreator<
  BroadcastState, 
  [], 
  [], 
  Pick<BroadcastState, 'isStreaming' | 'streamStatus' | 'streamUrl' | 'streamKey' | 'setStreamUrl' | 'setStreamKey' | 'startStream' | 'stopStream' | 'recordingStatus' | 'recordingTimer' | 'startRecording' | 'pauseRecording' | 'stopRecording' | 'isVirtualCamEnabled' | 'toggleVirtualCam'>
> = (set, get) => ({
  // Streaming
  isStreaming: false,
  streamStatus: 'disconnected',
  streamUrl: 'rtmp://live.twitch.tv/app/',
  streamKey: '',
  setStreamUrl: (url: string) => set({ streamUrl: url }),
  setStreamKey: (key: string) => set({ streamKey: key }),
  startStream: () => {
    const { streamUrl, streamKey } = get();
    if (!streamUrl || !streamKey) {
      alert("Missing Stream URL or Key");
      return;
    }
    set({ streamStatus: 'connecting' });
    
    // Simulate connection delay
    setTimeout(() => {
      set({ isStreaming: true, streamStatus: 'live' });
    }, 1500);
  },
  stopStream: () => set({ isStreaming: false, streamStatus: 'disconnected' }),

  // Recording
  recordingStatus: 'stopped',
  recordingTimer: 0,
  startRecording: () => {
    set({ recordingStatus: 'recording' });
    if (!recordingInterval) {
      recordingInterval = setInterval(() => {
        const { recordingStatus } = get();
        if (recordingStatus === 'recording') {
          set((state) => ({ recordingTimer: state.recordingTimer + 1 }));
        }
      }, 1000);
    }
  },
  pauseRecording: () => set({ recordingStatus: 'paused' }),
  stopRecording: () => {
    set({ recordingStatus: 'stopped', recordingTimer: 0 });
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
  },

  // Virtual Camera
  isVirtualCamEnabled: false,
  toggleVirtualCam: () => set((state) => ({ isVirtualCamEnabled: !state.isVirtualCamEnabled }))
});
