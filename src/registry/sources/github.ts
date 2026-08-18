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
