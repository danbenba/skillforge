import { mkdtemp, rm, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { simpleGit } from 'simple-git'
import type { ScopeConfig } from '../../types/scope.js'
import type { InstallOptions, InstallResult } from '../../core/installer.js'
import { installFromPath } from '../../core/installer.js'

export interface ParsedGitUrl {
  repoUrl: string
  branch?: string
  subPath?: string
}

export function parseGitUrl(raw: string): ParsedGitUrl {
  let url = raw.replace(/^git\+/, '')

  const treeMatch = url.match(/^(https?:\/\/[^/]+\/[^/]+\/[^/]+)\/tree\/([^/]+)(\/.*)?$/)
  if (treeMatch) {
    return {
      repoUrl: treeMatch[1],
      branch: treeMatch[2],
      subPath: treeMatch[3]?.replace(/^\//, ''),
    }
  }

  return { repoUrl: url }
}

export async function installFromGitUrl(
  rawUrl: string,
  targetScopeConfig: ScopeConfig,
  options: InstallOptions
): Promise<InstallResult> {
  const parsed = parseGitUrl(rawUrl)
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'skillforge-'))

  try {
    const git = simpleGit()
    const cloneOptions = parsed.branch
      ? ['--branch', parsed.branch, '--depth', '1']
      : ['--depth', '1']
    await git.clone(parsed.repoUrl, tmpDir, cloneOptions)

    const searchRoot = parsed.subPath ? path.join(tmpDir, parsed.subPath) : tmpDir

    const skillFolders = await findSkillFolders(searchRoot)

    if (skillFolders.length === 0) {
      throw new Error(`No skill folders (directories with SKILL.md) found in ${rawUrl}`)
    }

    if (skillFolders.length === 1) {
      return installFromPath(skillFolders[0], { ...options, sourceUrl: rawUrl })
    }

    const names = skillFolders.map((f) => path.basename(f))
    let selectedName: string
    if (options.onMultipleSkills) {
      selectedName = await options.onMultipleSkills(names)
    } else {
      selectedName = names[0]
    }
    const selectedFolder =
      skillFolders.find((f) => path.basename(f) === selectedName) ?? skillFolders[0]
    return installFromPath(selectedFolder, { ...options, sourceUrl: rawUrl })
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
