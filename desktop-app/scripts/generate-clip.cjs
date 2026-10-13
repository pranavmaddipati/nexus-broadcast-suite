const fs = require('node:fs')
const path = require('node:path')

const port = process.env.NEXUS_REMOTE_DEBUG_PORT || '9223'
const outputPath = path.resolve('artifacts/sample-clip.webm')

async function main() {
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json())
  const target = targets.find(c => c.type === 'page')
  if (!target) throw new Error('No page target found')

  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  const expr = `(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    rec.start();
    for (let f = 0; f < 30; f++) {
      ctx.fillStyle = f % 2 === 0 ? '#10b981' : '#3b82f6';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText('NEXUS BROADCAST TEST CLIP - ' + f, 40, 180);
      await new Promise(r => setTimeout(r, 33));
    }
    rec.stop();
    const blob = await new Promise(r => rec.onstop = () => r(new Blob(chunks, { type: 'video/webm' })));
    const buf = await blob.arrayBuffer();
    return Array.from(new Uint8Array(buf));
  })()`

  socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } }))
  const message = await new Promise(resolve => {
    socket.addEventListener('message', e => resolve(JSON.parse(e.data)), { once: true })
  })
  socket.close()

  if (message.result?.exceptionDetails) {
    throw new Error(message.result.exceptionDetails.exception?.description || 'Recording error')
  }

  const bytes = Buffer.from(message.result.result.value)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, bytes)
  console.log('Successfully created test video:', outputPath, 'Bytes:', bytes.length)
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
