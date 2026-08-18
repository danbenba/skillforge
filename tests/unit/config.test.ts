import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const hoisted = vi.hoisted(() => ({ homedir: vi.fn<[], string>() }))
