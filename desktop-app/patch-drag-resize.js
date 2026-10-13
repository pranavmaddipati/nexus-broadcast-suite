const fs = require('fs');
const file = 'src/components/InputSelectionDialog.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the component to rewrite it
const startIdx = content.indexOf('export const InputSelectionDialog: React.FC');
const beforeComponent = content.substring(0, startIdx);

const newComponentCode = `export const InputSelectionDialog: React.FC<{
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
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: 860, h: 650 })
  const dragRef = React.useRef<{ startX: number, startY: number, initX: number, initY: number } | null>(null)
  const resizeRef = React.useRef<{ startX: number, startY: number, initW: number, initH: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const allSources = SourceRegistry.getAll()
  
  const categoryMap: Record<string, string[]> = {
    video: ['camera', 'media', 'image', 'slideshow', 'browser', 'vlc_source', 'media_playlist'],
    capture: ['display_capture', 'window_capture', 'game_capture', 'screen_region', 'monitor_capture'],
    audio: ['audio_input', 'audio_output', 'audio', 'application_audio', 'virtual_audio', 'wasapi_loopback'],
    network: ['ndi', 'srt_source', 'rtsp_source', 'spout2', 'spout', 'network_stream', 'rtmp_input', 'rtmp_source'],
    graphics: ['text_gdi', 'text', 'text_freetype', 'text_freetype2', 'color_source', 'svg_source', 'shape_source', 'lower_third', 'html_graphics'],
    utility: ['browser_dock', 'countdown', 'qr_code', 'clock', 'script_source', 'websocket_overlay', 'data_feed'],
    scene: ['scene', 'scene_clone', 'source_clone', 'group', 'nested_scene', 'source_collection']
  }

  const filteredSources = allSources.filter(def => {
    if (selectedCategory === 'all') return true;
    const allowed = categoryMap[selectedCategory] || [];
    return allowed.includes(def.type);
  })

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX
        const dy = e.clientY - dragRef.current.startY
        setPos({ x: dragRef.current.initX + dx, y: dragRef.current.initY + dy })
      }
      if (resizeRef.current) {
        const dw = e.clientX - resizeRef.current.startX
        const dh = e.clientY - resizeRef.current.startY
        setSize({ 
          w: Math.max(600, resizeRef.current.initW + dw), 
          h: Math.max(400, resizeRef.current.initH + dh) 
        })
      }
    }
    const handleMouseUp = () => {
      if (dragRef.current) setIsDragging(false)
      dragRef.current = null
      resizeRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

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
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <style>
        {\`
          @keyframes card-enter {
            from { opacity: 0; transform: translateY(15px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .source-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 12px;
            padding: 2px;
          }
          .source-card {
            background: #1a1e26;
            border: 1px solid #2a303c;
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            transition: all 150ms ease;
            height: 140px;
            box-sizing: border-box;
            position: relative;
            z-index: 1;
            animation: card-enter 350ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
          }
          .source-card:nth-child(1) { animation-delay: 0ms; }
          .source-card:nth-child(2) { animation-delay: 25ms; }
          .source-card:nth-child(3) { animation-delay: 50ms; }
          .source-card:nth-child(4) { animation-delay: 75ms; }
          .source-card:nth-child(5) { animation-delay: 100ms; }
          .source-card:nth-child(6) { animation-delay: 125ms; }
          .source-card:nth-child(7) { animation-delay: 150ms; }
          .source-card:nth-child(8) { animation-delay: 175ms; }
          .source-card:nth-child(n+9) { animation-delay: 200ms; }
          
          .source-card:hover {
            background: #20252e;
            border-color: #3b82f6;
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 8px 16px rgba(0,0,0,0.4), 0 0 10px rgba(59,130,246,0.2);
            z-index: 2;
          }
          .source-card.selected {
            background: linear-gradient(#1e2430, #1e2430) padding-box,
                        linear-gradient(135deg, #00D4FF, #3B82F6) border-box;
            border: 1.5px solid transparent;
            box-shadow: 0 0 15px rgba(59,130,246,0.3);
            transform: scale(1.02);
            z-index: 3;
          }
          .source-card.selected .chevron {
            color: #ffffff !important;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .resize-handle {
            position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; 
            cursor: nwse-resize; z-index: 1000;
          }
          .resize-handle::after {
            content: ''; position: absolute; right: 4px; bottom: 4px; width: 6px; height: 6px;
            border-right: 2px solid #64748b; border-bottom: 2px solid #64748b;
            border-bottom-right-radius: 2px;
          }
        \`}
      </style>

      <div style={{
        position: 'relative',
        padding: '1px',
        borderRadius: '17px',
        background: 'linear-gradient(90deg, #00D4FF, #3B82F6, #8B5CF6, #EC4899, #00D4FF)',
        backgroundSize: '200% auto',
        boxShadow: '0 0 15px rgba(139, 92, 246, 0.18)',
        transform: \`translate(\${pos.x}px, \${pos.y}px)\`,
        transition: isDragging ? 'none' : 'transform 100ms ease-out',
      }}>
        <div 
          style={{ 
            background: '#15181F', 
            borderRadius: '16px', 
            width: \`\${size.w}px\`,
            maxWidth: '95vw', 
            height: \`\${size.h}px\`,
            maxHeight: '90vh',
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            position: 'relative'
          }} 
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            onMouseDown={(e) => {
              if (e.target instanceof HTMLButtonElement || e.target instanceof SVGElement) return;
              setIsDragging(true);
              dragRef.current = { startX: e.clientX, startY: e.clientY, initX: pos.x, initY: pos.y }
            }}
            style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>Add Source</h2>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Choose a source type to add to your scene</p>
            </div>
            <button 
              onClick={onClose}
              style={{ position: 'absolute', right: '24px', top: '24px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Categories Tab Navigation */}
          <div className="hide-scrollbar" style={{
            display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 24px', margin: '0 0 16px 0',
            scrollbarWidth: 'none', msOverflowStyle: 'none', flexShrink: 0
          }}>
            {[
              { id: 'all', label: 'All Sources', icon: LayoutGrid },
              { id: 'video', label: 'Video Sources', icon: Video },
              { id: 'capture', label: 'Capture Sources', icon: Monitor },
              { id: 'audio', label: 'Audio Sources', icon: Mic },
              { id: 'network', label: 'Network Sources', icon: Globe },
              { id: 'graphics', label: 'Text & Graphics', icon: Type },
              { id: 'utility', label: 'Utility Sources', icon: Settings },
              { id: 'scene', label: 'Scene Sources', icon: Layers }
            ].map(cat => {
              const isCatSelected = selectedCategory === cat.id
              const CatIcon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', background: isCatSelected ? '#2563eb20' : '#1a1e26',
                    border: \`1px solid \${isCatSelected ? '#3b82f6' : '#2a303c'}\`,
                    borderRadius: '10px', color: isCatSelected ? '#3b82f6' : '#94a3b8',
                    cursor: 'pointer', transition: 'all 150ms ease', whiteSpace: 'nowrap',
                    fontWeight: 600, fontSize: '13px', outline: 'none'
                  }}
                  onMouseOver={(e) => { if (!isCatSelected) e.currentTarget.style.background = '#20252e' }}
                  onMouseOut={(e) => { if (!isCatSelected) e.currentTarget.style.background = '#1a1e26' }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.5)' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                >
                  <CatIcon size={16} />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Scrollable Content */}
          <div style={{ padding: '0 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            <div key={selectedCategory}>
              <div className="source-grid">
                {filteredSources.map((def) => {
                  const IconComp = getCustomIcon(def.type)
                  const isSelected = selectedType === def.type
                  const { desc, badge, badgeColor } = getSourceDetails(def.type, def.description)
                  const iconColor = getIconColor(def.type)
                  
                  return (
                    <div 
                      key={def.type}
                      className={\`source-card \${isSelected ? 'selected' : ''}\`}
                      onClick={() => handleSelect(def)}
                      onDoubleClick={() => { handleSelect(def); handleAdd(); }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        {getIconElement(def.type, iconColor, IconComp)}
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: '1.2', marginTop: '2px' }}>
                          {def.name}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {desc}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <div className="category-badge" style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'transparent',
                          border: \`1px solid \${badgeColor}40\`,
                          color: badgeColor,
                          fontSize: '9px',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {badge}
                        </div>
                        <div className="chevron" style={{ color: '#475569', transition: 'all 150ms ease' }}>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 24px', 
            background: '#1a1e26',
            borderTop: '1px solid #2a303c',
            flexShrink: 0
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
                  borderRadius: '6px',
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
                  borderRadius: '6px',
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
          
          {/* Resize Handle */}
          <div 
            className="resize-handle"
            onMouseDown={(e) => {
              e.stopPropagation()
              resizeRef.current = { startX: e.clientX, startY: e.clientY, initW: size.w, initH: size.h }
            }}
          />
        </div>
      </div>
    </div>
  )
}
`;

fs.writeFileSync(file, beforeComponent + newComponentCode);
console.log('Successfully added drag and drop resizing');
