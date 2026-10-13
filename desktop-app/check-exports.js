const fs = require('fs')

const content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

const valueMatch = content.match(/value=\{\{([\s\S]*?)\}\}/)
if (!valueMatch) {
  console.log('No value block found')
  process.exit(1)
}

const lines = valueMatch[1].split('\n')
const exportList = []

for (let line of lines) {
  line = line.trim()
  if (!line || line.startsWith('//')) continue
  
  // if it's an inline function like reorderFilter: (...) => {
  if (line.includes(':')) {
    const key = line.split(':')[0].trim()
    exportList.push(key)
    continue
  }
  
  // normal export like `addScene,`
  let key = line.replace(/,/g, '').trim()
  if (key) exportList.push(key)
}

console.log('Checking ' + exportList.length + ' exports...')

const missing = []
for (const exp of exports) {
  // Check if defined as const exp =, function exp(, let exp, function exp (, etc.
  // Or if it's a state variable const [exp, setExp] = useState
  const regex = new RegExp(\`(const|let|var|function)\\\\s+(?:\\\\[[^\\]]*\\\\s*)?\${exp}\\\\b\`)
  if (!regex.test(content)) {
    missing.push(exp)
  }
}

console.log('Missing definitions:', missing)
