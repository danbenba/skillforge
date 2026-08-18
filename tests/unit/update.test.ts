import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtemp, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import type { InstalledSkill } from '../../src/types/manifest.js'
import type { ScopeConfig } from '../../src/types/scope.js'

const mocks = vi.hoisted(() => ({
  installFromGitUrl: vi.fn(),
  resolveScope: vi.fn(),
}))

vi.mock('../../src/registry/sources/github.js', () => ({
  installFromGitUrl: mocks.installFromGitUrl,
}))

vi.mock('../../src/core/resolver.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/core/resolver.js')>()
  return { ...actual, resolveScope: mocks.resolveScope }
})

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'skillforge-update-test-'))
  vi.resetModules()
  mocks.installFromGitUrl.mockReset()
  mocks.resolveScope.mockReset()
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

function makeScopeConfig(level: 'global' | 'shared' | 'project'): ScopeConfig {
  return {
    level,
    rootPath: path.join(tmpDir, level),
    manifestPath: path.join(tmpDir, level, 'skillforge.json'),
    skillsDir: path.join(tmpDir, level, 'skills'),
    skillsetsDir: path.join(tmpDir, level, 'skillsets'),
  }
}

function makeSkill(overrides: Partial<InstalledSkill> = {}): InstalledSkill {
  return {
    name: 'test-skill',
    version: '1.0.0',
    source: 'community',
    sourceUrl: 'https://github.com/user/test-skill',
    installedAt: new Date().toISOString(),
    specVersion: '1.0',
    score: 85,
    path: 'skills/test-skill',
    ...overrides,
  }
}
