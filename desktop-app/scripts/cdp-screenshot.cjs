const fs = require('node:fs')
const path = require('node:path')

const port = process.env.NEXUS_REMOTE_DEBUG_PORT || '9223'
const outputPath = path.resolve(process.argv[2] || 'artifacts/electron-current.png')

async function main() {
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json())
  const target = targets.find(candidate => candidate.type === 'page')
  if (!target) throw new Error('No Electron page target found')

  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  socket.send(JSON.stringify({ id: 1, method: 'Page.captureScreenshot', params: { format: 'png', fromSurface: true } }))
  const message = await new Promise((resolve, reject) => {
    socket.addEventListener('message', event => resolve(JSON.parse(event.data)), { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  socket.close()
  if (!message.result?.data) throw new Error('Electron did not return screenshot data')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, Buffer.from(message.result.data, 'base64'))
  console.log(outputPath)
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
