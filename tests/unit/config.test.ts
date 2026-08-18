import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const hoisted = vi.hoisted(() => ({ homedir: vi.fn<[], string>() }))

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>()
  return { ...actual, default: { ...actual, homedir: hoisted.homedir }, homedir: hoisted.homedir }
})

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'skillforge-config-test-'))
  hoisted.homedir.mockReturnValue(tmpDir)
  vi.resetModules()
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('readConfig', () => {
  it('returns empty object when config file does not exist', async () => {
    const { readConfig } = await import('../../src/core/config.js')
    const config = await readConfig()
    expect(config).toEqual({})
  })

  it('reads and parses an existing config file', async () => {
    const { writeConfig, readConfig } = await import('../../src/core/config.js')
    await writeConfig({ registryUrl: 'https://example.com/v1', defaultScope: 'global' })
    const config = await readConfig()
    expect(config.registryUrl).toBe('https://example.com/v1')
    expect(config.defaultScope).toBe('global')
  })
})

describe('writeConfig', () => {
  it('round-trips all fields', async () => {
    const { writeConfig, readConfig } = await import('../../src/core/config.js')
    const original = {
      registryUrl: 'https://my-registry.dev/v1',
      token: 'tok_abc123',
      anthropicApiKey: 'sk-ant-xyz',
      defaultScope: 'shared' as const,
    }
    await writeConfig(original)
    const result = await readConfig()
    expect(result).toEqual(original)
  })

  it('overwrites existing values', async () => {
    const { writeConfig, readConfig } = await import('../../src/core/config.js')
    await writeConfig({ defaultScope: 'global' })
    await writeConfig({ defaultScope: 'project' })
    const config = await readConfig()
    expect(config.defaultScope).toBe('project')
  })
})
