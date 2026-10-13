const fs = require('fs')

let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

const updateDestinationCode = `  const updateDestination = (id: string, updates: Partial<StreamDestination>) => {
    setDestinations(prev => (prev || []).map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const startStreaming`

content = content.replace("  const startStreaming", updateDestinationCode)

fs.writeFileSync('src/context/BroadcastContext.tsx', content)
console.log('Patched BroadcastContext for updateDestination')
