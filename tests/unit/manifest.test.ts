import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {
  createEmptyManifest,
  readManifest,
  writeManifest,
  addSkillToManifest,
  removeSkillFromManifest,
} from '../../src/core/manifest.js'
import type { ScopeConfig } from '../../src/types/scope.js'
import type { InstalledSkill } from '../../src/types/manifest.js'

let tmpDir: string
let scopeConfig: ScopeConfig

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'skillforge-test-'))
  scopeConfig = {
    level: 'project',
    rootPath: tmpDir,
    manifestPath: path.join(tmpDir, 'skillforge.json'),
    skillsDir: path.join(tmpDir, 'skills'),
  }
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})
