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

describe('parseGitUrl', () => {
  it('strips git+ prefix', () => {
    const result = parseGitUrl('git+https://github.com/user/repo')
    expect(result.repoUrl).toBe('https://github.com/user/repo')
    expect(result.branch).toBeUndefined()
    expect(result.subPath).toBeUndefined()
  })

  it('parses tree/branch/subpath syntax', () => {
    const result = parseGitUrl('git+https://github.com/user/repo/tree/main/my-skill')
    expect(result.repoUrl).toBe('https://github.com/user/repo')
    expect(result.branch).toBe('main')
    expect(result.subPath).toBe('my-skill')
  })

  it('parses tree/branch without subpath', () => {
    const result = parseGitUrl('git+https://github.com/user/repo/tree/feature-branch')
    expect(result.repoUrl).toBe('https://github.com/user/repo')
    expect(result.branch).toBe('feature-branch')
    expect(result.subPath).toBeUndefined()
  })

  it('handles URL without git+ prefix', () => {
    const result = parseGitUrl('https://github.com/user/repo')
    expect(result.repoUrl).toBe('https://github.com/user/repo')
  })
})
