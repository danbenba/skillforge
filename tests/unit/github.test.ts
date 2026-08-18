import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseGitUrl } from '../../src/registry/sources/github.js'
import { mkdtemp, mkdir, writeFile, rm, cp } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const mocks = vi.hoisted(() => ({
  cloneFn: vi.fn(),
  installFromPath: vi.fn(),
}))

vi.mock('simple-git', () => ({
  simpleGit: () => ({ clone: mocks.cloneFn }),
}))

vi.mock('../../src/core/installer.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/core/installer.js')>()
  return { ...actual, installFromPath: mocks.installFromPath }
})
