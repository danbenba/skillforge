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
