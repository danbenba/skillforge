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

const makeSkill = (name: string): InstalledSkill => ({
  name,
  version: '1.0.0',
  source: 'local',
  installedAt: new Date().toISOString(),
  specVersion: '1.0',
  score: 90,
  path: `skills/${name}`,
})

describe('createEmptyManifest', () => {
  it('creates a manifest with no skills', () => {
    const m = createEmptyManifest('project')
    expect(m.scope).toBe('project')
    expect(m.skills).toEqual({})
    expect(m.skillforgeVersion).toBe('1')
  })
})
