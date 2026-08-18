import { cp, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { ScopeLevel } from '../types/scope.js'
import type { InstalledSkill } from '../types/manifest.js'
import type { ValidationResult } from '../types/skill.js'
import { validateSkill, SPEC_VERSION } from './validator.js'
import { resolveScope, resolveAllScopes } from './resolver.js'
import { addSkillToManifest, removeSkillFromManifest, readManifest } from './manifest.js'

export interface InstallOptions {
  scope: ScopeLevel
  force?: boolean
  dryRun?: boolean
  sourceUrl?: string

  onMultipleSkills?: (names: string[]) => Promise<string>
}
