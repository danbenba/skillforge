import { cp, rm, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import type { ScopeLevel } from '../types/scope.js'
import type { InstalledSkillset } from '../types/manifest.js'
import type { SkillsetValidationResult, RemoteSkillRef } from '../types/skillset.js'
import type { InstallResult } from './installer.js'
import { validateSkillset, SKILLSET_SPEC_VERSION } from './skillset-validator.js'
import { resolveScope } from './resolver.js'
import { addSkillsetToManifest, removeSkillsetFromManifest, readManifest } from './manifest.js'
import { installFromPath, uninstallSkill } from './installer.js'

export interface SkillsetInstallOptions {
  scope: ScopeLevel
  force?: boolean
  dryRun?: boolean
  sourceUrl?: string
}

export interface SkillsetInstallResult {
  skillsetName: string
  scope: ScopeLevel
  installedPath: string
  validation: SkillsetValidationResult
  embeddedResults: InstallResult[]
  remoteResults: InstallResult[]
  alreadyExisted: boolean
}
