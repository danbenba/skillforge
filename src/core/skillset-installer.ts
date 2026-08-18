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

export async function installSkillsetFromPath(
  sourcePath: string,
  options: SkillsetInstallOptions
): Promise<SkillsetInstallResult> {
  const absSource = path.resolve(sourcePath)
  const validation = await validateSkillset(absSource)

  if (validation.errorCount > 0) {
    throw new Error(
      `Skillset validation failed with ${validation.errorCount} error(s). Run "skillforge skillset validate" for details.`
    )
  }

  const skillsetName = validation.skillset
  const scopeConfig = await resolveScope(options.scope)

  const existingManifest = await readManifest(scopeConfig)
  let alreadyExisted = false

  if (skillsetName in existingManifest.skillsets) {
    if (!options.force) {
      throw new Error(
        `Skillset "${skillsetName}" is already installed at ${options.scope} scope. Use --force to overwrite.`
      )
    }
    alreadyExisted = true

    const oldDir = path.join(scopeConfig.skillsetsDir, skillsetName)
    await rm(oldDir, { recursive: true, force: true })
  }

  if (options.dryRun) {
    return {
      skillsetName,
      scope: options.scope,
      installedPath: path.join(scopeConfig.skillsetsDir, skillsetName),
      validation,
      embeddedResults: [],
      remoteResults: [],
      alreadyExisted,
    }
  }

  const embeddedResults: InstallResult[] = []
  for (const skillName of validation.embeddedSkills) {
    const skillPath = path.join(absSource, skillName)
    const result = await installFromPath(skillPath, {
      scope: options.scope,
      force: options.force,
      sourceUrl: options.sourceUrl,
    })
    embeddedResults.push(result)
  }

  const remoteResults: InstallResult[] = []
  for (const ref of validation.remoteSkills) {
    const { installFromGitUrl } = await import('../registry/sources/github.js')
    const result = await installFromGitUrl(`git+${ref.source_url}`, scopeConfig, {
      scope: options.scope,
      force: options.force,
      sourceUrl: ref.source_url,
    })
    remoteResults.push(result)
  }

  const targetDir = path.join(scopeConfig.skillsetsDir, skillsetName)
  await mkdir(targetDir, { recursive: true })
  await cp(path.join(absSource, 'SKILLSET.md'), path.join(targetDir, 'SKILLSET.md'))

  const assetsPath = path.join(absSource, 'assets')
  try {
    await stat(assetsPath)
    await cp(assetsPath, path.join(targetDir, 'assets'), { recursive: true })
  } catch {}

  const installed: InstalledSkillset = {
    name: skillsetName,
    version: '1.0.0',
    source: options.sourceUrl ? 'community' : 'local',
    sourceUrl: options.sourceUrl,
    installedAt: new Date().toISOString(),
    specVersion: SKILLSET_SPEC_VERSION,
    score: validation.score,
    path: path.join('skillsets', skillsetName),
    embeddedSkills: validation.embeddedSkills,
    remoteSkills: validation.remoteSkills.map((r: RemoteSkillRef) => r.name),
  }

  await addSkillsetToManifest(scopeConfig, installed)

  return {
    skillsetName,
    scope: options.scope,
    installedPath: targetDir,
    validation,
    embeddedResults,
    remoteResults,
    alreadyExisted,
  }
}
