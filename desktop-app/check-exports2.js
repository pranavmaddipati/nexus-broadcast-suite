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
  if (line.includes(':')) {
    const key = line.split(':')[0].trim()
    exportList.push(key)
    continue
  }
  let key = line.replace(/,/g, '').trim()
  if (key) exportList.push(key)
}

const missing = []
for (const exp of exportList) {
  const regexStr = '(const|let|var|function)\\\\s+(?:\\\\[[^\\]]*\\\\s*)?' + exp + '\\\\b'
  const regex = new RegExp(regexStr)
  if (!regex.test(content) && !content.includes(exp + ' =')) {
    missing.push(exp)
  }
}

console.log('Missing definitions:', missing)
