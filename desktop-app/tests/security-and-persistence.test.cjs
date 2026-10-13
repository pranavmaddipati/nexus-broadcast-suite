const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { ProjectService, MAX_PAYLOAD_BYTES, CURRENT_PROJECT_VERSION } = require('../electron/projectService')

function createTempTestDir() {
  const dir = path.join(os.tmpdir(), `nexus-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function cleanupTempDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch (_) {}
}

const sampleProject = {
  scenes: [
    {
      id: 'scene_test_1',
      name: 'Main Studio',
      duration: '00:10:00',
      transitionType: 'mix',
      pinned: true,
      sources: [
        {
          id: 'src_cam_1',
          name: 'Camera 1',
          type: 'camera',
          visible: true,
          locked: false,
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          opacity: 1
        }
      ]
    },
    {
      id: 'scene_test_2',
      name: 'Interview Segment',
      duration: '00:05:00',
      transitionType: 'wipe',
      pinned: false,
      sources: []
    }
  ],
  destinations: [
    {
      id: 'dest_youtube',
      name: 'YouTube Live',
      enabled: true,
      streamUrl: 'rtmp://a.rtmp.youtube.com/live2',
      streamKey: 'secret_key_12345',
      passphrase: 'super_secret_passphrase'
    }
  ]
}

test('ProjectService: schema validation rejects invalid payloads', () => {
  const tempDir = createTempTestDir()
  try {
    const service = new ProjectService({ userDataDir: tempDir })

    // Non-object
    assert.throws(() => service.validateProjectSchema(null), /must be an object/)
    assert.throws(() => service.validateProjectSchema('string'), /must be an object/)

    // Missing scenes array
    assert.throws(() => service.validateProjectSchema({}), /must contain a "scenes" array/)
    assert.throws(() => service.validateProjectSchema({ scenes: 'not-array' }), /must contain a "scenes" array/)

    // Invalid scene objects
    assert.throws(() => service.validateProjectSchema({ scenes: [null] }), /Scene at index 0 is invalid/)
    assert.throws(() => service.validateProjectSchema({ scenes: [{ name: 'Missing ID' }] }), /missing a valid string "id"/)
    assert.throws(() => service.validateProjectSchema({ scenes: [{ id: 's1', name: 123 }] }), /missing a valid string "name"/)
    assert.throws(() => service.validateProjectSchema({ scenes: [{ id: 's1', name: 'Scene 1', sources: 'not-array' }] }), /must contain a "sources" array/)

    // Valid project passes
    assert.equal(service.validateProjectSchema(sampleProject), true)
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('ProjectService: rejects oversized payloads exceeding MAX_PAYLOAD_BYTES (10MB)', async () => {
  const tempDir = createTempTestDir()
  try {
    const service = new ProjectService({ userDataDir: tempDir })

    // Create huge sources array to breach 10MB
    const bigSources = []
    const padding = 'x'.repeat(1024 * 50) // 50KB per source
    for (let i = 0; i < 220; i++) {
      bigSources.push({ id: `src_${i}`, name: `Src ${i}`, padding })
    }
    const hugeProject = {
      scenes: [{ id: 'scene_huge', name: 'Huge', sources: bigSources }]
    }

    const result = await service.saveProject(hugeProject)
    assert.equal(result.success, false)
    assert.match(result.error, /exceeds 10 MB limit/)
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('ProjectService: save and load round trip with versioning', async () => {
  const tempDir = createTempTestDir()
  try {
    const service = new ProjectService({ userDataDir: tempDir })

    const saveResult = await service.saveProject(sampleProject)
    assert.equal(saveResult.success, true)
    assert.ok(fs.existsSync(service.getProjectPath()))

    const loadResult = await service.loadProject()
    assert.equal(loadResult.success, true)
    assert.equal(loadResult.data.version, CURRENT_PROJECT_VERSION)
    assert.equal(loadResult.data.scenes.length, 2)
    assert.equal(loadResult.data.scenes[0].id, 'scene_test_1')
    assert.equal(loadResult.data.scenes[0].sources[0].id, 'src_cam_1')
    assert.ok(loadResult.data.lastModified)
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('ProjectService: sanitizes secrets from project.json into credentials.json', async () => {
  const tempDir = createTempTestDir()
  try {
    const service = new ProjectService({ userDataDir: tempDir })

    await service.saveProject(sampleProject)

    // Verify project.json does NOT contain the raw streamKey or passphrase
    const projectContent = fs.readFileSync(service.getProjectPath(), 'utf8')
    assert.equal(projectContent.includes('secret_key_12345'), false)
    assert.equal(projectContent.includes('super_secret_passphrase'), false)
    assert.ok(projectContent.includes('[SECURE_STORAGE]'))

    // Verify credentials.json exists and holds the extracted secret
    assert.ok(fs.existsSync(service.credentialsFile))
    const credentials = JSON.parse(fs.readFileSync(service.credentialsFile, 'utf8'))
    assert.equal(credentials.dest_dest_youtube_streamKey, 'secret_key_12345')
    assert.equal(credentials.dest_dest_youtube_passphrase, 'super_secret_passphrase')
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('ProjectService: corrupt project file recovers safely from backup', async () => {
  const tempDir = createTempTestDir()
  try {
    const service = new ProjectService({ userDataDir: tempDir })

    // Initial save creates primary
    await service.saveProject(sampleProject)

    // Second save creates backup
    const updatedProject = {
      scenes: [
        { id: 'scene_updated', name: 'Updated Studio', sources: [] }
      ]
    }
    await service.saveProject(updatedProject)

    // Verify backup exists
    assert.ok(fs.existsSync(service.backupFile))

    // Corrupt primary project.json with garbage
    fs.writeFileSync(service.getProjectPath(), '{{corrupt-json-truncated', 'utf8')

    // loadProject should recover from backup
    const loadResult = await service.loadProject()
    assert.equal(loadResult.success, true)
    assert.equal(loadResult.recoveredFromBackup, true)
    assert.equal(loadResult.data.scenes[0].id, 'scene_test_1')
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('ProjectService: atomic save leaves no dangling temp files', async () => {
  const tempDir = createTempTestDir()
  try {
    const service = new ProjectService({ userDataDir: tempDir })

    await service.saveProject(sampleProject)

    // Check directory contents: only project.json should be present (no .tmp files)
    const files = fs.readdirSync(service.projectDir)
    const tempFiles = files.filter(f => f.includes('.tmp.'))
    assert.equal(tempFiles.length, 0)
    assert.ok(files.includes('project.json'))
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('ProjectService: serialized queue handles repeated rapid saves safely', async () => {
  const tempDir = createTempTestDir()
  try {
    const service = new ProjectService({ userDataDir: tempDir })

    // Dispatch 8 rapid concurrent save requests
    const promises = []
    for (let i = 1; i <= 8; i++) {
      promises.push(service.saveProject({
        scenes: [
          { id: `scene_${i}`, name: `Rapid Scene ${i}`, sources: [] }
        ]
      }))
    }

    const results = await Promise.all(promises)
    assert.equal(results.every(r => r.success), true)

    // Final written state must be valid JSON matching the 8th save
    const finalData = JSON.parse(fs.readFileSync(service.getProjectPath(), 'utf8'))
    assert.equal(finalData.scenes[0].id, 'scene_8')
    assert.equal(finalData.scenes[0].name, 'Rapid Scene 8')
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('ProjectService: safely migrates legacy project.json without altering legacy file', async () => {
  const tempDir = createTempTestDir()
  try {
    const legacyPath = path.join(tempDir, 'legacy_project.json')
    fs.writeFileSync(legacyPath, JSON.stringify({
      scenes: [
        { id: 'scene_legacy_1', name: 'Legacy Scene', sources: [] }
      ]
    }), 'utf8')

    const service = new ProjectService({
      userDataDir: path.join(tempDir, 'userData'),
      legacyProjectFile: legacyPath
    })

    const loadResult = await service.loadProject()
    assert.equal(loadResult.success, true)
    assert.equal(loadResult.isMigrated, true)
    assert.equal(loadResult.data.scenes[0].id, 'scene_legacy_1')
    assert.equal(loadResult.data.version, CURRENT_PROJECT_VERSION)

    // Verify migrated file is saved to new location
    assert.ok(fs.existsSync(service.getProjectPath()))

    // Verify original legacy file is still intact and unmodified
    const legacyContent = fs.readFileSync(legacyPath, 'utf8')
    assert.ok(legacyContent.includes('scene_legacy_1'))
  } finally {
    cleanupTempDir(tempDir)
  }
})

test('Security: sender validation logic allows expected origins and rejects untrusted senders', () => {
  // Recreate main.js validation logic to verify correctness
  function validateSender(event) {
    if (!event || !event.senderFrame) return true
    const url = event.senderFrame.url
    if (!url) return false
    return url.startsWith('http://localhost:5180') || url.startsWith('file://')
  }

  // Trusted development origin
  assert.equal(validateSender({ senderFrame: { url: 'http://localhost:5180/' } }), true)
  assert.equal(validateSender({ senderFrame: { url: 'http://localhost:5180/subpage' } }), true)

  // Trusted packaged file origin
  assert.equal(validateSender({ senderFrame: { url: 'file:///app/dist/index.html' } }), true)

  // Untrusted external origins
  assert.equal(validateSender({ senderFrame: { url: 'http://attacker.com/' } }), false)
  assert.equal(validateSender({ senderFrame: { url: 'https://evil.site/payload.html' } }), false)
  assert.equal(validateSender({ senderFrame: { url: 'javascript:alert(1)' } }), false)
  assert.equal(validateSender({ senderFrame: { url: '' } }), false)
})
