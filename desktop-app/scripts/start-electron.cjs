const { spawn } = require('node:child_process')

const electronPath = require('electron')
const environment = { ...process.env }
delete environment.ELECTRON_RUN_AS_NODE

const args = ['.']
if (environment.NEXUS_REMOTE_DEBUG_PORT) {
  args.unshift(`--remote-debugging-port=${environment.NEXUS_REMOTE_DEBUG_PORT}`)
}

const child = spawn(electronPath, args, {
  cwd: require('node:path').resolve(__dirname, '..'),
  env: environment,
  stdio: 'inherit',
  windowsHide: false,
})

child.on('error', error => {
  console.error('Failed to start Nexus Broadcast:', error)
  process.exitCode = 1
})

child.on('exit', code => {
  process.exitCode = code ?? 1
})
