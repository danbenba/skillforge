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
