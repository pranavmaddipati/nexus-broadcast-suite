const fs = require('fs');
const file = 'src/components/SourceConfigurationPopup.tsx';
let content = fs.readFileSync(file, 'utf8');

const hookInsertionPoint = 'const [hidden, setHidden] = useState(false)';
const hooks = `
  const [hidden, setHidden] = useState(false)

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: 900, h: 560 })
  const dragRef = useRef<{ startX: number, startY: number, initX: number, initY: number } | null>(null)
  const resizeRef = useRef<{ startX: number, startY: number, initW: number, initH: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
          w: Math.max(700, resizeRef.current.initW + dw), 
          h: Math.max(450, resizeRef.current.initH + dh) 
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
`;

content = content.replace(hookInsertionPoint, hooks);

// Replace container attributes
content = content.replace(
  /<div className="popup-container">/,
  `<div 
        className="popup-container"
        style={{
          width: \`\${size.w}px\`,
          height: \`\${size.h}px\`,
          transform: \`translate(\${pos.x}px, \${pos.y}px)\`,
          transition: isDragging ? 'none' : 'transform 100ms ease-out'
        }}
      >`
);

// Replace header attributes
content = content.replace(
  /<div className="popup-header">/,
  `<div 
          className="popup-header"
          onMouseDown={(e) => {
            if (e.target instanceof HTMLButtonElement || e.target instanceof SVGElement || (e.target as HTMLElement).closest('button')) return;
            setIsDragging(true);
            dragRef.current = { startX: e.clientX, startY: e.clientY, initX: pos.x, initY: pos.y }
          }}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        >`
);

// Add Resize Handle
content = content.replace(
  /<\/div>\s*<\/div>\s*\)\s*}\s*$/m,
  `
        <div 
          className="resize-handle"
          onMouseDown={(e) => {
            e.stopPropagation()
            resizeRef.current = { startX: e.clientX, startY: e.clientY, initW: size.w, initH: size.h }
          }}
        />
      </div>
    </div>
  )
}`
);

// Add CSS for resize handle
content = content.replace(
  /<\/style>/,
  `
        .resize-handle {
          position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; 
          cursor: nwse-resize; z-index: 1000;
        }
        .resize-handle::after {
          content: ''; position: absolute; right: 4px; bottom: 4px; width: 6px; height: 6px;
          border-right: 2px solid #64748b; border-bottom: 2px solid #64748b;
          border-bottom-right-radius: 2px;
        }
      </style>`
);

// Remove the CSS width/height from .popup-container because inline style handles it now
content = content.replace(
  /width: 900px; max-width: 95vw;\s*height: 560px; max-height: 90vh;/,
  `max-width: 95vw; max-height: 90vh;`
);

// Add userSelect: 'none' globally to InputSelectionDialog since we noticed it's causing issues
const file2 = 'src/components/InputSelectionDialog.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
if (!content2.includes("userSelect: 'none'")) {
  content2 = content2.replace(
    /background: 'rgba\(0,0,0,0.7\)', display: 'flex', alignItems: 'center', justifyContent: 'center'/,
    `background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none'`
  );
  fs.writeFileSync(file2, content2);
}

fs.writeFileSync(file, content);
console.log('Successfully applied drag & resize to SourceConfigurationPopup');
