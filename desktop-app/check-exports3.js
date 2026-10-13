const fs = require('fs')

const content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf-8')

const valueMatch = content.match(/<BroadcastContext\.Provider\s+value=\{\{([\s\S]*?)\}\}\s*>/)
if (!valueMatch) {
  console.log('Could not find value block')
  process.exit(1)
}

const lines = valueMatch[1].split('\n')
const exportList = []

for (let line of lines) {
  line = line.trim()
  if (!line || line.startsWith('//')) continue
  
  if (line.includes(':') && !line.includes('//')) {
    exportList.push(line.split(':')[0].trim())
    continue
  }
  
  const key = line.replace(/,/g, '').trim()
  if (key) exportList.push(key)
}

const missing = []
for (const exp of exports) {
  if (
    !content.includes('const ' + exp + ' =') &&
    !content.includes('let ' + exp + ' =') &&
    !content.includes('var ' + exp + ' =') &&
    !content.includes('function ' + exp) &&
    !content.includes('const ' + exp + ',') && // const activeScene, setActiveScene
    !content.includes('const [' + exp + ',') &&
    !content.includes(', ' + exp + ']') &&
    !content.includes(' ' + exp + ':') && // destructured
    !content.match(new RegExp(\`const \\\\[.*\\\\b\${exp}\\\\b.*\\\\] = useState\`)) &&
    !content.includes(\` \${exp} \`) // just in case
  ) {
    // Advanced check for useState array destructuring
    const useRegex = new RegExp(\`const \\\\[\\\\s*.*\\\\b\${exp}\\\\b.*\\\\s*\\\\]\\\\s*=\\\\s*useState\`)
    if (!useRegex.test(content) && !content.includes(exp + ' =')) {
      missing.push(exp)
    }
  }
}

console.log('Potentially missing:', missing)
