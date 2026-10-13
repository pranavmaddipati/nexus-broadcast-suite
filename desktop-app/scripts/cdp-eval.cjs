const port = process.env.NEXUS_REMOTE_DEBUG_PORT || '9223'
const expression = process.argv.slice(2).join(' ')

if (!expression) throw new Error('Pass a JavaScript expression to evaluate')

async function main() {
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json())
  const target = targets.find(candidate => candidate.type === 'page')
  if (!target) throw new Error('No Electron page target found')

  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }))
  const message = await new Promise((resolve, reject) => {
    socket.addEventListener('message', event => resolve(JSON.parse(event.data)), { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  socket.close()
  if (message.result?.exceptionDetails) throw new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text)
  console.log(JSON.stringify(message.result?.result?.value, null, 2))
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
