const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

// Add to context type
content = content.replace(
  /  isStreaming: boolean\n/,
  '  isStreaming: boolean\n  showMonitorStats: boolean\n  setShowMonitorStats: (val: boolean) => void\n'
)

// Add to provider state
content = content.replace(
  /  const \[isStreaming, setIsStreaming\] = useState<boolean>\(false\)\n/,
  "  const [isStreaming, setIsStreaming] = useState<boolean>(false)\n  const [showMonitorStats, setShowMonitorStats] = useState<boolean>(() => getInitialState('showMonitorStats', false))\n"
)

// Add to provider value
content = content.replace(
  /          isStreaming,\n/,
  '          isStreaming,\n          showMonitorStats,\n          setShowMonitorStats,\n'
)

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Patched BroadcastContext for showMonitorStats')
