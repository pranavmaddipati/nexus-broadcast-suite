const fs = require('fs');
const path = require('path');

const projectPath = path.join(process.cwd(), 'project.json');

const realisticScenes = [
  {
    id: 'scene_cam1',
    name: 'Studio Camera 1',
    duration: '00:00:00',
    transitionType: 'fade',
    pinned: true,
    colorLabel: '#ef4444',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=640&q=80',
    sources: [
      { id: 'src_cam1', name: 'Sony FX6 - Main', type: 'camera', visible: true, locked: true, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, zIndex: 0, settings: { deviceId: 'cam_1' }, volume: 100, muted: false, monitor: 'off', filters: [] },
      { id: 'src_mic1', name: 'Host Mic (Sennheiser)', type: 'audio', visible: true, locked: true, x: 0, y: 0, width: 0, height: 0, opacity: 1.0, zIndex: 1, settings: { deviceId: 'mic_1' }, volume: 85, muted: false, monitor: 'monitor_only', filters: [] },
      { id: 'src_bug', name: 'Network Bug', type: 'image', visible: true, locked: true, x: 1720, y: 50, width: 150, height: 150, opacity: 0.9, zIndex: 2, settings: { filePath: '' }, volume: 100, muted: true, monitor: 'off', filters: [] }
    ]
  },
  {
    id: 'scene_cam2',
    name: 'Studio Camera 2 (Wide)',
    duration: '00:00:00',
    transitionType: 'cut',
    pinned: true,
    colorLabel: '#f97316',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616098048107-160fa1f970ff?w=640&q=80',
    sources: [
      { id: 'src_cam2', name: 'Sony FX6 - Wide', type: 'camera', visible: true, locked: true, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, zIndex: 0, settings: { deviceId: 'cam_2' }, volume: 100, muted: false, monitor: 'off', filters: [] },
      { id: 'src_mic1_copy', name: 'Host Mic (Sennheiser)', type: 'audio', visible: true, locked: true, x: 0, y: 0, width: 0, height: 0, opacity: 1.0, zIndex: 1, settings: { deviceId: 'mic_1' }, volume: 85, muted: false, monitor: 'monitor_only', filters: [] },
      { id: 'src_bug2', name: 'Network Bug', type: 'image', visible: true, locked: true, x: 1720, y: 50, width: 150, height: 150, opacity: 0.9, zIndex: 2, settings: { filePath: '' }, volume: 100, muted: true, monitor: 'off', filters: [] }
    ]
  },
  {
    id: 'scene_guest',
    name: 'Remote Guest (vMix Call)',
    duration: '00:00:00',
    transitionType: 'fade',
    pinned: true,
    colorLabel: '#3b82f6',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=640&q=80',
    sources: [
      { id: 'src_guest_vid', name: 'NDI - Guest 1', type: 'ndi', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, zIndex: 0, settings: { url: 'ndi://guest1' }, volume: 90, muted: false, monitor: 'monitor_and_output', filters: [] },
      { id: 'src_lower3rd', name: 'Lower Third (Guest)', type: 'text', visible: true, locked: true, x: 100, y: 900, width: 800, height: 100, opacity: 1.0, zIndex: 1, settings: { textContent: 'John Doe | Expert' }, volume: 100, muted: true, monitor: 'off', filters: [] },
      { id: 'src_bug3', name: 'Network Bug', type: 'image', visible: true, locked: true, x: 1720, y: 50, width: 150, height: 150, opacity: 0.9, zIndex: 2, settings: { filePath: '' }, volume: 100, muted: true, monitor: 'off', filters: [] }
    ]
  },
  {
    id: 'scene_gameplay',
    name: 'Esports Feed A',
    duration: '00:00:00',
    transitionType: 'fade',
    pinned: true,
    colorLabel: '#8b5cf6',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&q=80',
    sources: [
      { id: 'src_game', name: 'Capture Card (Game)', type: 'video', visible: true, locked: true, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, zIndex: 0, settings: { filePath: 'https://www.w3schools.com/html/movie.mp4' }, volume: 40, muted: false, monitor: 'monitor_and_output', filters: [] },
      { id: 'src_pip', name: 'Player Cam (PIP)', type: 'camera', visible: true, locked: false, x: 1420, y: 700, width: 480, height: 270, opacity: 1.0, zIndex: 1, settings: { deviceId: 'cam_player' }, volume: 100, muted: false, monitor: 'off', filters: [] },
      { id: 'src_overlay', name: 'HUD Overlay', type: 'image', visible: true, locked: true, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, zIndex: 2, settings: { filePath: '' }, volume: 100, muted: true, monitor: 'off', filters: [] }
    ]
  },
  {
    id: 'scene_broll1',
    name: 'B-Roll / VTR 1',
    duration: '00:04:23',
    transitionType: 'cut',
    pinned: false,
    colorLabel: '#10b981',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=640&q=80',
    sources: [
      { id: 'src_broll', name: 'Nature Footage (4K)', type: 'video', visible: true, locked: false, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, zIndex: 0, settings: { filePath: 'https://www.w3schools.com/html/mov_bbb.mp4' }, volume: 75, muted: false, monitor: 'monitor_and_output', filters: [] }
    ]
  },
  {
    id: 'scene_standby',
    name: 'Starting Soon...',
    duration: '00:00:00',
    transitionType: 'fade',
    pinned: false,
    colorLabel: '#64748b',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=640&q=80',
    sources: [
      { id: 'src_bg', name: 'Animated BG', type: 'video', visible: true, locked: true, x: 0, y: 0, width: 1920, height: 1080, opacity: 1.0, zIndex: 0, settings: { filePath: '' }, volume: 0, muted: true, monitor: 'off', filters: [] },
      { id: 'src_music', name: 'Hold Music (Spotify)', type: 'audio', visible: true, locked: false, x: 0, y: 0, width: 0, height: 0, opacity: 1.0, zIndex: 1, settings: { deviceId: 'virtual_cable' }, volume: 60, muted: false, monitor: 'monitor_and_output', filters: [] },
      { id: 'src_timer', name: 'Countdown Timer', type: 'text', visible: true, locked: false, x: 760, y: 400, width: 400, height: 200, opacity: 1.0, zIndex: 2, settings: { textContent: '05:00' }, volume: 100, muted: true, monitor: 'off', filters: [] }
    ]
  },
  {
    id: 'scene_folder_graphics',
    name: 'Gfx & Lower Thirds',
    isFolder: true,
    sources: []
  },
  {
    id: 'scene_l3_host',
    name: 'L3: Host Name',
    duration: '00:00:05',
    transitionType: 'cut',
    pinned: false,
    folderId: 'scene_folder_graphics',
    colorLabel: '#eab308',
    sources: [
      { id: 'src_l3_anim', name: 'L3 Animation (.webm)', type: 'video', visible: true, locked: false, x: 100, y: 800, width: 800, height: 150, opacity: 1.0, zIndex: 0, settings: { filePath: '' }, volume: 0, muted: true, monitor: 'off', filters: [] }
    ]
  }
];

fs.writeFileSync(projectPath, JSON.stringify({ scenes: realisticScenes }, null, 2), 'utf-8');
console.log('Project state injected with realistic broadcast data.');
