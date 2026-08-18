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
