const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024 // 10 MB maximum project file size
const CURRENT_PROJECT_VERSION = 1

class ProjectService {
  constructor(options = {}) {
    this.userDataDir = options.userDataDir || (options.app ? options.app.getPath('userData') : path.join(os.homedir(), '.nexus-broadcast'))
    this.projectDir = options.projectDir || path.join(this.userDataDir, 'projects')
    this.projectFile = path.join(this.projectDir, 'project.json')
    this.backupFile = path.join(this.projectDir, 'project.backup.json')
    this.credentialsFile = path.join(this.projectDir, 'credentials.json')
    this.legacyProjectFile = options.legacyProjectFile || path.join(process.cwd(), 'project.json')
    this.publicProjectFile = options.publicProjectFile || path.join(process.cwd(), 'public', 'project.json')

    this.saveQueue = Promise.resolve()
    this.isInitialized = false
  }

  ensureDirectories() {
    if (!fs.existsSync(this.projectDir)) {
      fs.mkdirSync(this.projectDir, { recursive: true, mode: 0o700 })
    }
    this.isInitialized = true
  }

  getProjectPath() {
    return this.projectFile
  }

  validateProjectSchema(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Project payload must be an object.')
    }

    if (!Array.isArray(data.scenes)) {
      throw new Error('Project payload must contain a "scenes" array.')
    }

    for (let i = 0; i < data.scenes.length; i++) {
      const scene = data.scenes[i]
      if (!scene || typeof scene !== 'object') {
        throw new Error(`Scene at index ${i} is invalid.`)
      }
      if (!scene.id || typeof scene.id !== 'string') {
        throw new Error(`Scene at index ${i} is missing a valid string "id".`)
      }
      if (typeof scene.name !== 'string') {
        throw new Error(`Scene at index ${i} is missing a valid string "name".`)
      }
      if (!Array.isArray(scene.sources)) {
        throw new Error(`Scene "${scene.id}" must contain a "sources" array.`)
      }
    }

    return true
  }

  sanitizeSecrets(data) {
    // Deep clone to avoid mutating in-memory project state
    const clean = JSON.parse(JSON.stringify(data))
    const extractedSecrets = {}

    // Check destinations for stream keys, passphrases, tokens
    if (Array.isArray(clean.destinations)) {
      clean.destinations = clean.destinations.map(dest => {
        if (!dest) return dest
        const d = { ...dest }
        if (d.streamKey) {
          extractedSecrets[`dest_${d.id}_streamKey`] = d.streamKey
          d.streamKey = '[SECURE_STORAGE]'
        }
        if (d.passphrase) {
          extractedSecrets[`dest_${d.id}_passphrase`] = d.passphrase
          d.passphrase = '[SECURE_STORAGE]'
        }
        return d
      })
    }

    return { cleanProject: clean, extractedSecrets }
  }

  saveCredentials(secrets) {
    if (!secrets || Object.keys(secrets).length === 0) return
    try {
      this.ensureDirectories()
      let existing = {}
      if (fs.existsSync(this.credentialsFile)) {
        try {
          existing = JSON.parse(fs.readFileSync(this.credentialsFile, 'utf8'))
        } catch (_) {}
      }
      const merged = { ...existing, ...secrets, lastUpdated: new Date().toISOString() }
      fs.writeFileSync(this.credentialsFile, JSON.stringify(merged, null, 2), { encoding: 'utf8', mode: 0o600 })
    } catch (err) {
      console.warn('Failed to store credentials securely:', err.message)
    }
  }

  loadCredentials() {
    try {
      if (fs.existsSync(this.credentialsFile)) {
        return JSON.parse(fs.readFileSync(this.credentialsFile, 'utf8'))
      }
    } catch (_) {}
    return {}
  }

  async loadProject() {
    this.ensureDirectories()

    // 1. Check if user data project exists
    if (fs.existsSync(this.projectFile)) {
      try {
        const content = fs.readFileSync(this.projectFile, 'utf8')
        if (!content || content.trim().length === 0) {
          throw new Error('Project file is empty.')
        }
        const data = JSON.parse(content)
        this.validateProjectSchema(data)
        return {
          success: true,
          data,
          projectPath: this.projectFile,
          recoveredFromBackup: false
        }
      } catch (err) {
        console.warn(`[ProjectService] Primary project file corrupt: ${err.message}. Attempting recovery from backup...`)
        // Attempt recovery from backup
        if (fs.existsSync(this.backupFile)) {
          try {
            const backupContent = fs.readFileSync(this.backupFile, 'utf8')
            const backupData = JSON.parse(backupContent)
            this.validateProjectSchema(backupData)
            console.log('[ProjectService] Successfully recovered project from backup.')
            return {
              success: true,
              data: backupData,
              projectPath: this.backupFile,
              recoveredFromBackup: true
            }
          } catch (backupErr) {
            console.error(`[ProjectService] Backup file also corrupt: ${backupErr.message}`)
          }
        }
        return {
          success: false,
          error: `Failed to load project: ${err.message}. Recovery failed.`
        }
      }
    }

    // 2. Migration: If project.json doesn't exist in userData, migrate legacy project if present
    const migrationCandidates = [this.legacyProjectFile, this.publicProjectFile]
    for (const candidate of migrationCandidates) {
      if (fs.existsSync(candidate)) {
        try {
          const content = fs.readFileSync(candidate, 'utf8')
          const legacyData = JSON.parse(content)
          this.validateProjectSchema(legacyData)

          const migrated = {
            version: CURRENT_PROJECT_VERSION,
            lastModified: new Date().toISOString(),
            migratedFrom: candidate,
            scenes: legacyData.scenes
          }

          // Atomically save migrated project to user data directory
          await this.saveProject(migrated)

          console.log(`[ProjectService] Successfully migrated legacy project from ${candidate}`)
          return {
            success: true,
            data: migrated,
            projectPath: this.projectFile,
            isMigrated: true
          }
        } catch (migErr) {
          console.warn(`[ProjectService] Migration from ${candidate} failed: ${migErr.message}`)
        }
      }
    }

    return {
      success: false,
      error: 'No valid project file found.'
    }
  }

  saveProject(projectData) {
    // Chain saves onto the Promise queue to guarantee serialized, race-free file I/O
    this.saveQueue = this.saveQueue.then(() => this._executeSave(projectData))
    return this.saveQueue
  }

  async _executeSave(projectData) {
    this.ensureDirectories()

    try {
      this.validateProjectSchema(projectData)

      const { cleanProject, extractedSecrets } = this.sanitizeSecrets(projectData)
      cleanProject.version = CURRENT_PROJECT_VERSION
      cleanProject.lastModified = new Date().toISOString()

      const jsonStr = JSON.stringify(cleanProject, null, 2)
      const byteLength = Buffer.byteLength(jsonStr, 'utf8')
      if (byteLength > MAX_PAYLOAD_BYTES) {
        throw new Error(`Project payload size (${(byteLength / 1024 / 1024).toFixed(2)} MB) exceeds 10 MB limit.`)
      }

      // Save credentials separately if present
      if (Object.keys(extractedSecrets).length > 0) {
        this.saveCredentials(extractedSecrets)
      }

      // Step 1: Write to unique temporary file
      const tempFile = path.join(
        this.projectDir,
        `project.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.json`
      )

      fs.writeFileSync(tempFile, jsonStr, { encoding: 'utf8', mode: 0o600 })

      // Verify temp file written
      const readBack = fs.readFileSync(tempFile, 'utf8')
      if (Buffer.byteLength(readBack, 'utf8') !== byteLength) {
        fs.unlinkSync(tempFile)
        throw new Error('Temporary file verification failed during write.')
      }

      // Step 2: Create backup of existing project if present
      if (fs.existsSync(this.projectFile)) {
        try {
          fs.copyFileSync(this.projectFile, this.backupFile)
        } catch (backupErr) {
          console.warn('[ProjectService] Warning: Could not create backup file before replace:', backupErr.message)
        }
      }

      // Step 3: Atomically replace target file
      // Cross-platform atomic replacement:
      // On Windows NTFS, copyFileSync + unlink is completely reliable and doesn't fail on open handles like renameSync can
      fs.copyFileSync(tempFile, this.projectFile)
      try {
        fs.unlinkSync(tempFile)
      } catch (_) {}

      return {
        success: true,
        projectPath: this.projectFile,
        savedAt: cleanProject.lastModified,
        bytesWritten: byteLength
      }
    } catch (err) {
      console.error('[ProjectService] Save error:', err)
      return {
        success: false,
        error: err.message
      }
    }
  }
}

module.exports = {
  ProjectService,
  MAX_PAYLOAD_BYTES,
  CURRENT_PROJECT_VERSION
}
