import React, { useState, useEffect } from 'react'
import { SourceRegistry } from '../engine/input/SourceRegistry'
import type { SourceDefinition } from '../engine/input/SourceRegistry'
import { 
  Video, Monitor, AppWindow, Film, Image as ImageIcon, ImagePlus, Mic, 
  Globe, Palette, Type, Radio, PlaySquare, Settings, X, Speaker, Layers, Hash,
  ChevronRight, Gamepad2, Copy, Maximize, Clock, Timer, QrCode, FileJson
} from 'lucide-react'
import { SourceConfigurationPopup } from './SourceConfigurationPopup'

const getIconColor = (type: string) => {
  if (['camera'].includes(type)) return '#00D4FF'
  if (['media', 'media_playlist', 'vlc_source'].includes(type)) return '#F97316'
  if (['image', 'slideshow'].includes(type)) return '#22C55E'
  if (['game_capture', 'display_capture', 'window_capture', 'screen_region'].includes(type)) return '#8B5CF6'
  if (['audio', 'audio_input', 'audio_output'].includes(type)) return '#EF4444'
  if (['browser', 'browser_dock', 'websocket_overlay'].includes(type)) return '#10B981'
  if (['scene', 'scene_clone', 'nested_scene'].includes(type)) return '#3B82F6'
  if (['text', 'text_gdi', 'text_freetype', 'text_freetype2', 'lower_third', 'html_graphics'].includes(type)) return '#F59E0B'
  if (['ndi', 'rtmp_source', 'rtmp_input', 'ndi_output', 'srt_source'].includes(type)) return '#1D4ED8'
  if (['spout', 'spout2'].includes(type)) return '#14B8A6'
  if (['color_source'].includes(type)) return '#F43F5E'
  return '#94A3B8'
}

const getCustomIcon = (type: string) => {
  if (type === 'image') return ImageIcon
  if (type === 'slideshow') return ImagePlus
  if (['video', 'media', 'vlc_source', 'media_playlist'].includes(type)) return Film
  if (type === 'camera') return Video
  if (['browser', 'browser_dock', 'websocket_overlay', 'html_graphics'].includes(type)) return Globe
  if (['ndi', 'rtmp_source', 'rtmp_input', 'ndi_output', 'spout', 'spout2', 'srt_source'].includes(type)) return Radio
  
  if (type === 'display_capture') return Monitor
  if (type === 'window_capture') return AppWindow
  if (type === 'game_capture') return Gamepad2
  if (type === 'screen_region') return Maximize
  
  if (['audio_input', 'audio'].includes(type)) return Mic
  if (type === 'audio_output') return Speaker
  
  if (type === 'color_source') return Palette
  if (['text_gdi', 'text', 'text_freetype', 'text_freetype2', 'lower_third'].includes(type)) return Type
  if (['scene', 'scene_clone', 'nested_scene'].includes(type)) return Layers
  if (['group', 'source_collection'].includes(type)) return Hash
  if (type === 'source_clone') return Copy
  if (type === 'clock') return Clock
  if (type === 'countdown') return Timer
  if (type === 'qr_code') return QrCode
  if (type === 'data_feed') return FileJson
  
  return Settings
}

const getSourceDetails = (type: string, defaultDesc: string) => {
  const map: Record<string, { desc: string, badge: string, badgeColor: string }> = {
    camera: { desc: 'Webcam / Capture Card / DSLR / Mirrorless / Virtual Camera', badge: 'VIDEO', badgeColor: '#3B82F6' },
    display_capture: { desc: 'Capture an entire monitor or display. Supports multiple monitors.', badge: 'CAPTURE', badgeColor: '#8B5CF6' },
    window_capture: { desc: 'Capture a specific application window. Automatically follows window changes.', badge: 'CAPTURE', badgeColor: '#8B5CF6' },
    game_capture: { desc: 'High performance DirectX/OpenGL/Vulkan game capture. Optimized for low latency.', badge: 'CAPTURE', badgeColor: '#8B5CF6' },
    screen_region: { desc: 'Capture a specific region of your screen.', badge: 'CAPTURE', badgeColor: '#8B5CF6' },
    media: { desc: 'Play: MP4, MOV, MKV, AVI, MP3, WAV, GIF. Supports looping.', badge: 'VIDEO', badgeColor: '#3B82F6' },
    media_playlist: { desc: 'Queue and play multiple video files sequentially.', badge: 'VIDEO', badgeColor: '#3B82F6' },
    image: { desc: 'Supports: PNG, JPG, JPEG, BMP, GIF, WEBP, SVG', badge: 'VIDEO', badgeColor: '#3B82F6' },
    slideshow: { desc: 'Automatically cycle images. Transitions, Loop, Random mode', badge: 'VIDEO', badgeColor: '#3B82F6' },
    audio: { desc: 'Microphones, USB Mic, XLR Interface, Virtual Audio', badge: 'AUDIO', badgeColor: '#EF4444' },
    audio_input: { desc: 'Microphones, USB Mic, XLR Interface, Virtual Audio', badge: 'AUDIO', badgeColor: '#EF4444' },
    audio_output: { desc: 'Desktop Audio, Speakers, Headphones, HDMI Output', badge: 'AUDIO', badgeColor: '#EF4444' },
    browser: { desc: 'HTML, Website, Overlay, Widgets, YouTube Chat', badge: 'UTILITY', badgeColor: '#10B981' },
    color_source: { desc: 'Solid color, Gradient, Background, Placeholder', badge: 'VIDEO', badgeColor: '#3B82F6' },
    text: { desc: 'Dynamic Windows text.', badge: 'VIDEO', badgeColor: '#3B82F6' },
    text_gdi: { desc: 'Dynamic Windows text.', badge: 'VIDEO', badgeColor: '#3B82F6' },
    text_freetype: { desc: 'Professional typography. Font rendering, Shadows, Outline', badge: 'VIDEO', badgeColor: '#3B82F6' },
    text_freetype2: { desc: 'Professional typography. Font rendering, Shadows, Outline', badge: 'VIDEO', badgeColor: '#3B82F6' },
    scene: { desc: 'Embed another scene.', badge: 'UTILITY', badgeColor: '#10B981' },
    nested_scene: { desc: 'Embed a scene within another scene.', badge: 'UTILITY', badgeColor: '#10B981' },
    scene_clone: { desc: 'Duplicate an existing scene while keeping it linked to the original until detached.', badge: 'UTILITY', badgeColor: '#10B981' },
    source_clone: { desc: 'Create another instance of an existing source while preserving filters, transforms, crop, audio settings, and effects.', badge: 'UTILITY', badgeColor: '#10B981' },
    group: { desc: 'Group multiple sources.', badge: 'UTILITY', badgeColor: '#10B981' },
    spout: { desc: 'Receive Spout video.', badge: 'UTILITY', badgeColor: '#10B981' },
    spout2: { desc: 'Receive Spout video.', badge: 'UTILITY', badgeColor: '#10B981' },
    ndi: { desc: 'Receive NDI network video.', badge: 'NETWORK', badgeColor: '#F97316' },
    rtmp_source: { desc: 'Receive an incoming RTMP video stream.', badge: 'NETWORK', badgeColor: '#F97316' },
    vlc_source: { desc: 'Playlist, Network Stream, Loop Playback', badge: 'UTILITY', badgeColor: '#10B981' }
  }
  return map[type] || { desc: defaultDesc, badge: 'OTHER', badgeColor: '#64748B' }
}

export const InputSelectionDialog: React.FC<{
  onClose: () => void,
  onAddSource: (type: string, name: string, settings: Record<string, any>) => void,
  desktopSources?: any[],
  refreshDesktopSources?: () => void
}> = ({ onClose, onAddSource, desktopSources, refreshDesktopSources }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [configuringType, setConfiguringType] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState('')
  const [sourceSettings, setSourceSettings] = useState<Record<string, any>>({})
  const [isNested, setIsNested] = useState(false)

  const allSources = SourceRegistry.getAll()
  
  const categories = [
    { title: 'Video', sources: allSources.filter(s => ['camera', 'media', 'image', 'slideshow', 'browser', 'media_playlist', 'vlc_source'].includes(s.type)) },
    { title: 'Capture', sources: allSources.filter(s => ['display_capture', 'window_capture', 'game_capture', 'screen_region', 'audio_input', 'audio_output', 'audio'].includes(s.type)) },
    { title: 'Graphics', sources: allSources.filter(s => ['color_source', 'text_gdi', 'text', 'text_freetype', 'text_freetype2', 'html_graphics', 'lower_third'].includes(s.type)) },
    { title: 'Scene', sources: allSources.filter(s => ['scene', 'nested_scene', 'scene_clone', 'group', 'source_collection'].includes(s.type)) },
    { title: 'Network', sources: allSources.filter(s => ['ndi', 'spout', 'spout2', 'srt_source', 'rtmp_source', 'rtmp_input', 'ndi_output'].includes(s.type)) },
    { title: 'Utility', sources: allSources.filter(s => ['browser_dock', 'countdown', 'clock', 'qr_code', 'websocket_overlay', 'data_feed', 'source_clone'].includes(s.type)) }
  ];
  
  const handleSelect = (def: SourceDefinition) => {
    setSelectedType(def.type)
  }

  const handleAdd = () => {
    if (selectedType) {
      const def = SourceRegistry.get(selectedType as any)
      if (def) {
        setConfiguringType(def.type)
        setSourceName(def.name)
        setSourceSettings({ ...def.defaultSettings })
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (configuringType) return 
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && selectedType) handleAdd()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [configuringType, selectedType, onClose])

  if (configuringType) {
    return (
      <SourceConfigurationPopup
        sourceType={configuringType}
        initialName={sourceName}
        initialSettings={sourceSettings}
        onClose={() => setConfiguringType(null)}
        onAddSource={onAddSource}
        desktopSources={desktopSources}
        refreshDesktopSources={refreshDesktopSources}
      />
    )
  }

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 99999, 
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'modal-fade-in 150ms ease-out'
    }} onClick={onClose}>
      <style>
        {`
          @keyframes modal-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes border-shimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          .source-card {
            background: transparent;
            border-radius: 6px;
            transition: background 120ms ease;
            position: relative;
            z-index: 1;
          }
          .source-card:hover {
            background: rgba(255, 255, 255, 0.03);
          }
          .source-card:hover .source-icon {
            filter: brightness(1.2);
          }
          .source-card.selected {
            background: rgba(255, 255, 255, 0.06);
            box-shadow: inset 0 0 0 1px #0ea5e9, 0 0 12px rgba(59, 130, 246, 0.15);
            z-index: 2;
          }
          .source-card.selected .source-icon {
            filter: brightness(1.3) drop-shadow(0 0 8px rgba(0, 212, 255, 0.3));
          }
          .source-card.selected .chevron {
            color: #ffffff;
            filter: brightness(1.4);
          }
        `}
      </style>

      <div style={{
        position: 'relative',
        padding: '1px',
        borderRadius: '13px',
        background: 'linear-gradient(90deg, #00D4FF, #3B82F6, #8B5CF6, #EC4899, #00D4FF)',
        backgroundSize: '200% auto',
        animation: 'border-shimmer 8s linear infinite',
        
      }}>
        <div 
          style={{ 
            background: '#15181F', 
            borderRadius: '2px', 
            width: '800px', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
          }} 
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Add Source</h2>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Choose a source type to add to your scene</p>
            </div>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ padding: '0 24px', overflowY: 'auto', maxHeight: '550px', display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            {categories.map((cat) => {
              if (cat.sources.length === 0) return null;
              return (
                <div key={cat.title} style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 600, margin: '0 0 8px 0' }}>{cat.title} Sources</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {cat.sources.map(def => {
                      const IconComp = getCustomIcon(def.type)
                      const isSelected = selectedType === def.type
                      const { desc, badge, badgeColor } = getSourceDetails(def.type, def.description)
                      const iconColor = getIconColor(def.type)
                      
                      return (
                        <div 
                          key={def.type}
                          className={`source-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(def)}
                          onDoubleClick={() => { handleSelect(def); handleAdd(); }}
                          style={{
                            padding: '0 16px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            height: '56px',
                            flexShrink: 0
                          }}
                        >
                          <div className="source-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', color: iconColor, transition: 'all 120ms ease' }}>
                            <IconComp size={22} strokeWidth={1.5} />
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '16px', flex: 1, overflow: 'hidden' }}>
                            <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {def.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                              {desc}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px' }}>
                            <div style={{
                              padding: '2px 8px',
                              borderRadius: '2px',
                              background: `${badgeColor}15`,
                              border: `1px solid ${badgeColor}30`,
                              color: badgeColor,
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {badge}
                            </div>
                            
                            <div className="chevron" style={{ color: '#475569', transition: 'all 120ms ease' }}>
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Footer */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 24px', 
            background: '#1a1e26',
            borderTop: '1px solid #2a303c'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>
              <input 
                type="checkbox" 
                checked={isNested}
                onChange={e => setIsNested(e.target.checked)}
                style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} 
              />
              Add source as a child (nested)
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={onClose}
                style={{
                  padding: '8px 24px',
                  background: '#2a303c',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd} 
                disabled={!selectedType}
                style={{
                  padding: '8px 24px',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#ffffff',
                  cursor: selectedType ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: selectedType ? 1 : 0.5
                }}
              >
                Add Source
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
