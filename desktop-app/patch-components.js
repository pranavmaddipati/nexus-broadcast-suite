const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, 'src/components/TransitionControls.tsx')
let content = fs.readFileSync(file, 'utf8')

// Make buttons smaller
content = content.replace(/height: '32px'/g, "height: '26px'")
content = content.replace(/height: '28px'/g, "height: '22px'")
content = content.replace(/marginBottom: '16px'/g, "marginBottom: '10px'")
content = content.replace(/marginTop: '12px'/g, "marginTop: '8px'")

fs.writeFileSync(file, content)

const file2 = path.join(__dirname, 'src/components/AudioMixer.tsx')
let content2 = fs.readFileSync(file2, 'utf8')

// Fix audio mixer margins and sizes
content2 = content2.replace(/width: '40px'/g, "width: '34px'")
content2 = content2.replace(/marginBottom: '16px'/g, "marginBottom: '8px'")
content2 = content2.replace(/marginBottom: '12px'/g, "marginBottom: '8px'")
content2 = content2.replace(/height: '32px'/g, "height: '26px'")
content2 = content2.replace(/padding: '0 12px'/g, "padding: '0 8px'")
content2 = content2.replace(/padding: '12px 0 0 0'/g, "padding: '8px 0 0 0'")

fs.writeFileSync(file2, content2)

const file3 = path.join(__dirname, 'src/components/PinnedScenes.tsx')
let content3 = fs.readFileSync(file3, 'utf8')
content3 = content3.replace(/height: '70px'/g, "height: '56px'")
content3 = content3.replace(/gap: '12px'/g, "gap: '8px'")
content3 = content3.replace(/padding: '12px'/g, "padding: '8px'")
fs.writeFileSync(file3, content3)

console.log('Components patched')
